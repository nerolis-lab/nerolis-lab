/**
 * Copyright 2024 Sleep API Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IngredientProducers } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type {
  RecipeSolutions,
  SolveRecipeResult,
  SolveRecipeSolution,
  SubRecipeMeta
} from '@src/services/solve/types/solution-types.js';
import {
  addMemberToSubTeams,
  addSpotsLeftToRecipe,
  createMemoKey,
  findSortedRecipeIngredientIndices,
  ifUnsolvableNode,
  subtractAndCount
} from '@src/services/solve/utils/set-cover-utils.js';
import { combineProduction, hashPokemonSetIndexed } from '@src/services/solve/utils/solve-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { IngredientIndexToIntAmount } from 'sleepapi-common';
import { ingredient } from 'sleepapi-common';

export class SetCover {
  private ingredientProducers: IngredientProducers; // flat array of all ingredient producers
  private producersByIngredientIndexOriginal: Array<Array<number>>; // used to reset the producersByIngredientIndex between solves
  private producersByIngredientIndex: Array<Array<number>>; // each index of outer array maps to each ingredient's index in INGREDIENTS array, each inner array contains the indices of the producers that can produce that ingredient
  private cachedSubRecipeSolves: Map<number, Array<Array<number>>>; // a map of subrecipe memo key to an array of solutions, where each solution is an array of indices that point to the producer in ingredientProducers

  private startTime: number = Date.now();
  private timeout = 10000;
  private originalMaxTeamSize = 0;

  constructor(
    ingredientProducers: IngredientProducers,
    producersByIngredientIndex: Array<Array<number>>,
    cachedSubRecipeSolves: Map<number, RecipeSolutions>
  ) {
    this.ingredientProducers = ingredientProducers;
    this.producersByIngredientIndex = producersByIngredientIndex;
    this.producersByIngredientIndexOriginal = producersByIngredientIndex;
    this.cachedSubRecipeSolves = cachedSubRecipeSolves;
  }

  public solveRecipe(recipe: IngredientIndexToIntAmount, maxTeamSize: number): SolveRecipeResult {
    this.originalMaxTeamSize = maxTeamSize;
    // not 100% sure resetting this.producersByIngredientIndex is actually needed since testing suggests it's not, but brain says it should be
    // we're mutating this.producersByIngredientIndex so if we're doing back-to-back solves with same set cover
    // we should reset this array between
    this.producersByIngredientIndex = this.producersByIngredientIndexOriginal.map((pkmnIdxs) => [...pkmnIdxs]);
    const recipeWithSpotsLeft = addSpotsLeftToRecipe(recipe, maxTeamSize);

    this.startTime = Date.now();

    const ingredientIndices = findSortedRecipeIngredientIndices(recipe);

    const solutions = this.solve(recipeWithSpotsLeft, ingredientIndices);

    return this.formatResult({ solutions, startTime: this.startTime, timeout: this.timeout });
  }

  private solve(subRecipeWithSpotsLeft: IngredientIndexToIntAmount, ingredientIndices: number[]): RecipeSolutions {
    const memoKey = createMemoKey(subRecipeWithSpotsLeft);
    const spotsLeftInTeam = subRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    const maybeCachedSolution = this.ifStopSearching({
      memoKey,
      spotsLeftInTeam,
      ingredientIndices,
      startTime: this.startTime,
      timeout: this.timeout
    });
    if (maybeCachedSolution) {
      return maybeCachedSolution;
    }

    // recipeIngredientIndices is sorted by difficult to solve DESC, grab the most difficult remaining ingredient
    const firstIngredientIndex = ingredientIndices[0];

    const producerIndicesOfFirstIngredient = this.producersByIngredientIndex[firstIngredientIndex];

    const subRecipesAfterProducerSubtract: SubRecipeMeta[] = this.sortSubRecipesAfterProducerSubtract(
      subRecipeWithSpotsLeft,
      ingredientIndices,
      producerIndicesOfFirstIngredient
    );

    const teams = this.findTeams(subRecipesAfterProducerSubtract, firstIngredientIndex);

    this.addCacheEntry(memoKey, teams);
    return teams;
  }

  /**
   * Creates an array of sub-recipes after subtracting the ingredients provided by the producers.
   *
   * @param recipeWithSpotsLeft - The initial recipe with remaining spots left for ingredients.
   * @param ingredientIndices - The indices of the ingredients to be considered.
   * @param producersOfFirstIngredient - The set of producers for the first ingredient.
   * @returns An array of objects, each containing:
   *   - `remainingRecipeWithSpotsLeft`: The sub-recipe after subtracting the producer's ingredients.
   *   - `remainingIngredientIndices`: The remaining ingredient indices after subtraction.
   *   - `sumRemainingRecipeIngredients`: The sum of the remaining ingredients in the sub-recipe.
   *   - `member`: The producer that was subtracted.
   */
  private sortSubRecipesAfterProducerSubtract(
    recipeWithSpotsLeft: IngredientIndexToIntAmount,
    ingredientIndices: number[],
    producerIndicesOfFirstIngredient: number[]
  ): SubRecipeMeta[] {
    const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [];

    for (const producerIndex of producerIndicesOfFirstIngredient) {
      const member = this.ingredientProducers[producerIndex];

      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients } =
        subtractAndCount(recipeWithSpotsLeft, member.totalIngredients, ingredientIndices);

      subRecipesAfterProducerSubtract.push({
        remainingRecipeWithSpotsLeft,
        remainingIngredientIndices,
        sumRemainingRecipeIngredients,
        member: producerIndex
      });
    }

    // Sort sub-recipes by remaining ingredients (least to most), prioritizing the most promising solution first
    return subRecipesAfterProducerSubtract.sort(
      (a, b) => a.sumRemainingRecipeIngredients - b.sumRemainingRecipeIngredients
    );
  }

  /**
   * Finds the optimal teams to solve the given sub-recipes.
   *
   * This function iterates through the provided sub-recipes and attempts to find the best possible teams
   * that can solve the remaining ingredients. It uses a recursive approach to explore potential solutions
   * and caches the results to avoid redundant calculations.
   *
   * The function is complex due to its recursive nature and the need to handle multiple edge cases, such as:
   * - When the producer alone can solve the remaining ingredients.
   * - When there are no more spots left in the team.
   * - When a solution is found that requires fewer members than previously found solutions.
   *
   * The recursive call works by invoking the `solve` method on the remaining recipe and ingredient indices.
   * If a valid solution is found, it is cached and used to update the current list of teams.
   *
   * The recursive call ends when a solution is found and `spotsLeftInTeam` is set to 0.
   * Furthermore the solve function itself also checks for cached solutions and if the search should be stopped (timeout, etc).
   *
   * @param subRecipesAfterProducerSubtract - The list of sub-recipes after subtracting the producer's contribution.
   * @param spotsLeftInTeam - The number of spots left in the team.
   * @returns The optimal teams that can solve the given sub-recipes.
   */
  // TODO: missleading function name, all this does is check if we should search deeper or finish the search (add the member to team etc)
  private findTeams(subRecipesAfterProducerSubtract: SubRecipeMeta[], currentIngredientIndex: number): RecipeSolutions {
    const teams: RecipeSolutions = [];

    // every sub-solution has same spots left at same depth
    let spotsLeftInTeam =
      subRecipesAfterProducerSubtract[0].remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    for (let i = 0; i < subRecipesAfterProducerSubtract.length; ++i) {
      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients, member } =
        subRecipesAfterProducerSubtract[i];

      if (sumRemainingRecipeIngredients === 0) {
        // if the producer solved the remaining ingredients alone
        if (spotsLeftInTeam !== 0) {
          // reached a solution and should not go deeper
          spotsLeftInTeam = 0;
        }
        teams.push([member]); // add new team with only this one member
      } else if (spotsLeftInTeam !== 0) {
        // the recipe is not solved and there is room left in the team
        const subTeams = this.solve(remainingRecipeWithSpotsLeft, remainingIngredientIndices);

        if (subTeams.length === 0) {
          // If no teams could solve the sub-recipe, then we continue without adding any solutions to "teams"
          // Should mostly never happen, but might happen if we limit the pool of eligible Pokémon beyond OPTIMAL_POKEDEX
          continue;
        }

        // this if checks if we're all the way back up to the first member and
        // since it checks if only spotsLeftInTeam only accounts for the first member and
        // since we're after the subTeams.length === 0 condition we know we have solutions here
        if (
          spotsLeftInTeam === this.originalMaxTeamSize - 1 &&
          this.producersByIngredientIndex[currentIngredientIndex].length > 1
        ) {
          // this was an accidental stroke of genius
          // if first ingredient has found a solution that means
          // we're never interested again in finding producers for that ingredient after this for loop has completed
          // since we would have already gone through all of their producers and tested them in this for loop
          // the producers for this ingredient have already been grouped and sent into this function by solve and thus
          // mutating the original producers array here won't affect the next iterations
          this.producersByIngredientIndex[currentIngredientIndex] = [member];
        }

        const subTeamSize = subTeams[0].length;
        if (subTeamSize < spotsLeftInTeam) {
          // we found a solution and it did not require all the spots that were left in the team
          // now we update the spotsLeftInTeam to require being the same max size
          // now we also override the previously found teams, since we found one that required less members
          spotsLeftInTeam = subTeamSize;
          teams.length = 0; // clears teams
          addMemberToSubTeams(teams, subTeams, member); // also adds the subteams to teams
        } else if (subTeamSize === spotsLeftInTeam) {
          // we found a solution and we have previously found solutions of the same size (or we're at max depth)
          // add this solution to the result
          // teams = teams.concat(newTeams);
          addMemberToSubTeams(teams, subTeams, member);
        }
      }
    }

    return teams;
  }
  /*
   * Checks if the solution already exists in the cache or should give up the search.
   * Returns false if we should continue searching.
   */
  private ifStopSearching(params: {
    memoKey: number;
    spotsLeftInTeam: number;
    ingredientIndices: number[];
    startTime: number;
    timeout: number;
  }): RecipeSolutions | undefined {
    const maybeCachedSolution = this.cachedSubRecipeSolves.get(params.memoKey);
    if (maybeCachedSolution) return maybeCachedSolution;

    if (ifUnsolvableNode(params)) return [];
  }

  private addCacheEntry(memoKey: number, teams: RecipeSolutions) {
    this.cachedSubRecipeSolves.set(memoKey, teams);
  }

  /**
   * Formats the result of solving a recipe problem.
   * This calculates and adds each team's combined ingredient production.
   * This also determines whether the solving process was exhaustive.
   *
   * @param solutions - The solutions to the recipe.
   * @param startTime - The start time of the solving process.
   * @param timeout - The timeout duration for the solving process.
   * @returns The formatted result including whether the process was exhaustive and the teams with their produced ingredients.
   */
  private formatResult(params: { solutions: RecipeSolutions; startTime: number; timeout: number }): SolveRecipeResult {
    const { solutions, startTime, timeout } = params;

    const foundSolutions: Set<string> = new Set();
    const teams: SolveRecipeSolution[] = [];
    for (const memberIndices of solutions) {
      const members = memberIndices.map((memberIndex) => this.ingredientProducers[memberIndex]);
      members.sort((a, b) => {
        const hashA = hashPokemonSetIndexed(a.pokemonSet).toString();
        const hashB = hashPokemonSetIndexed(b.pokemonSet).toString();
        return hashA.localeCompare(hashB);
      });

      const foundSolution = members.map((member) => hashPokemonSetIndexed(member.pokemonSet)).join(',');
      if (!foundSolutions.has(foundSolution)) {
        foundSolutions.add(foundSolution);

        const combinedIngredientProduction = combineProduction(members);
        teams.push({
          members,
          producedIngredients: combinedIngredientProduction
        });
      }
    }
    return {
      exhaustive: !TimeUtils.checkTimeout({ startTime, timeout }),
      teams
    };
  }

  /**
   * Trick or exposing functions for testing
   */
  public _testAccess() {
    return {
      solve: this.solve.bind(this),
      sortSubRecipesAfterProducerSubtract: this.sortSubRecipesAfterProducerSubtract.bind(this),
      findTeams: this.findTeams.bind(this),
      ifStopSearching: this.ifStopSearching.bind(this),
      formatResult: this.formatResult.bind(this)
    };
  }
}
