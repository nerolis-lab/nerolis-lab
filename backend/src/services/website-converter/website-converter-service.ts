import type { ScheduledEvent } from '@src/domain/event/event.js';
// import { TieredPokemonCombinationContribution } from '@src/routes/tierlist-router/tierlist-router.js';
import { getMeal } from '@src/utils/meal-utils/meal-utils.js';
import type {
  DetailedProduce,
  IngredientSet,
  PokemonWithIngredients,
  PokemonWithTiering,
  SolveRecipeResponse,
  Summary,
  SurplusIngredients,
  nature
} from 'sleepapi-common';
import {
  EnergyForEveryone,
  HelperBoost,
  MathUtils,
  prettifyBerries,
  prettifyIngredientDrop,
  shortPrettifyIngredientDrop,
  unsimplifyIngredientSet
} from 'sleepapi-common';

// --- production calculator
interface ProductionFilters {
  level: number;
  ribbon: number;
  nature?: nature.Nature;
  subskills?: Set<string>;
  skillLevel?: number;
  inventoryLimit?: number;
  e4eProcs: number;
  e4eLevel: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingBonus: number;
  camp: boolean;
}

interface ProductionCombination {
  filters: ProductionFilters;
  production: {
    pokemonCombination: PokemonWithIngredients;
    detailedProduce: DetailedProduce;
  };
  summary: Summary;
  log: ScheduledEvent[];
  neutralProduction?: DetailedProduce;
  optimalIngredientProduction?: DetailedProduce;
  optimalBerryProduction?: DetailedProduce;
  optimalSkillProduction?: DetailedProduce;
}

class WebsiteConverterServiceImpl {
  public toProductionCalculator(pokemonProduction: ProductionCombination) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const log = pokemonProduction.log.map((s: any) => {
      const skillActivation = s?.skillActivation;
      if (skillActivation) {
        return {
          ...s,
          skillActivation: {
            adjustedAmount: skillActivation.adjustedAmount,
            fractionOfProc: skillActivation.fractionOfProc,
            nrOfHelpsToActivate: skillActivation.nrOfHelpsToActivate,
            skill: {
              name: skillActivation.skill.name,
              RP: skillActivation.skill.RP,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              unit: (Object.values(skillActivation.skill.activations).at(0) as any)?.unit
            }
          }
        };
      } else if (s.type === 'info') {
        return {
          ...s,
          pokemon: {
            ...s?.pokemon,
            skill: s?.pokemon?.skill?.name
          },
          summary: {
            ...s?.summary,
            skill: s?.summary?.skill?.name
          }
        };
      }
      return s;
    });
    return {
      details: pokemonProduction.filters,
      production: {
        details: this.#prettifyProductionDetails(pokemonProduction),
        pokemon: pokemonProduction.production.pokemonCombination.pokemon.name,
        ingredients: pokemonProduction.production.pokemonCombination.ingredientList.map((ing) => ing.ingredient.name),
        specialty: pokemonProduction.production.pokemonCombination.pokemon.specialty,

        log,
        logName: `eventlog-${pokemonProduction.production.pokemonCombination.pokemon.name}${
          pokemonProduction.filters.level
        }-${Date.now()}.txt`,
        prettyLog: pokemonProduction.log.map((event) => event.format()).join('\n')
      },
      neutralProduction: pokemonProduction.neutralProduction && {
        ingredients: pokemonProduction.neutralProduction.produce.ingredients,
        berries: pokemonProduction.neutralProduction.produce.berries,
        skills: pokemonProduction.neutralProduction.skillActivations.reduce((sum, cur) => sum + cur.adjustedAmount, 0)
      },
      userProduction: {
        ingredients: pokemonProduction.production.detailedProduce.produce.ingredients,
        berries: pokemonProduction.production.detailedProduce.produce.berries,
        skills: pokemonProduction.production.detailedProduce.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalIngredientProduction: pokemonProduction.optimalIngredientProduction && {
        ingredients: pokemonProduction.optimalIngredientProduction.produce.ingredients,
        berries: pokemonProduction.optimalIngredientProduction.produce.berries,
        skills: pokemonProduction.optimalIngredientProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalBerryProduction: pokemonProduction.optimalBerryProduction && {
        ingredients: pokemonProduction.optimalBerryProduction.produce.ingredients,
        berries: pokemonProduction.optimalBerryProduction.produce.berries,
        skills: pokemonProduction.optimalBerryProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      },
      optimalSkillProduction: pokemonProduction.optimalSkillProduction && {
        ingredients: pokemonProduction.optimalSkillProduction.produce.ingredients,
        berries: pokemonProduction.optimalSkillProduction.produce.berries,
        skills: pokemonProduction.optimalSkillProduction.skillActivations.reduce(
          (sum, cur) => sum + cur.adjustedAmount,
          0
        )
      }
    };
  }

  public toTierList(tieredData: PokemonWithTiering[]) {
    const mapWithTiering: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
      new Map();
    for (const tieredEntry of tieredData) {
      const allEntriesOfPokemon = tieredData.filter(
        (allPokemon) => allPokemon.pokemonWithSettings.pokemon === tieredEntry.pokemonWithSettings.pokemon
      );

      const prettyEntry = {
        pokemon: tieredEntry.pokemonWithSettings.pokemon,
        ingredientList: prettifyIngredientDrop(unsimplifyIngredientSet(tieredEntry.pokemonWithSettings.ingredientList)),
        diff: tieredEntry.diff,
        details: allEntriesOfPokemon
          .map(
            ({ tier, pokemonWithSettings: otherPairingsEntry, score, contributions }) =>
              `[${tier}] (${prettifyIngredientDrop(unsimplifyIngredientSet(otherPairingsEntry.ingredientList))})\n` +
              `Total score: ${Math.round(score)}` +
              `${
                (contributions[0].skillValue ?? 0) > 0
                  ? `, support value: ${Math.round(contributions.reduce((sum, cur) => sum + (cur.skillValue ?? 0), 0))}`
                  : ''
              }\n` +
              `${contributions
                .map(
                  (meal) =>
                    `[${Math.round(meal.score)} ${MathUtils.round(meal.coverage, 1)}%] ${meal.recipe
                      .toLowerCase()
                      .replace(/_/g, ' ')}`
                  // Produced ings: ${prettifyIngredientDrop(flatToIngredientSet(otherPairingsEntry.totalIngredients))}
                  // Example solve: ${
                  //   meal.team?.map((member) => `${capitalize(member.pokemonSet.pokemon)}`).join(', ') ?? 'no team'
                  // }\n
                )
                .join('\n')}`
          )
          .join('\n\n')
      };

      if (!mapWithTiering.has(tieredEntry.tier)) {
        mapWithTiering.set(tieredEntry.tier, [prettyEntry]);
      } else {
        const array = mapWithTiering.get(tieredEntry.tier);
        if (array !== undefined) {
          array.push(prettyEntry);
        }
      }
    }

    const tiersWithPokemonDetails: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of mapWithTiering) {
      tiersWithPokemonDetails.push({ tier, pokemonWithDetails });
    }

    return this.#filterOnlyBest(tiersWithPokemonDetails);
  }

  public toOptimalSet(optimalCombinations: SolveRecipeResponse, name: string) {
    const recipe = getMeal(name);
    const prettifiedRecipe = prettifyIngredientDrop(recipe.ingredients);
    const prettifiedCombinations = optimalCombinations.teams.slice(0, 500).map((solution) => ({
      team: solution.members
        .map(
          (member) =>
            `${member.member.pokemonWithIngredients.pokemon.name}(${shortPrettifyIngredientDrop(member.member.pokemonWithIngredients.ingredientList)})`
        )
        .join(', '),
      details: `👨🏻‍🍳 Team finder - https://sleepapi.net 👨🏻‍🍳\n\nRecipe: ${
        recipe.name
      } (${prettifiedRecipe})\n\nTeam\n- ${solution.members
        .map(
          (member) =>
            `${member.member.pokemonWithIngredients.pokemon.name}(${shortPrettifyIngredientDrop(member.member.pokemonWithIngredients.ingredientList)})`
        )
        .join('\n- ')}
        ${
          solution.surplus.relevant.length > 0
            ? `${this.#prettifyFillersForRecipe(recipe.ingredients, solution.surplus)}`
            : ''
        }\n\n
        Individual produce per meal window\n${solution.members
          .map(
            (member) =>
              `${member.member.pokemonWithIngredients.pokemon.name}: ${prettifyIngredientDrop(member.producedIngredients)}`
          )
          .join('\n')}`
    }));

    return {
      meal: name,
      info:
        optimalCombinations.teams.length > 0
          ? !optimalCombinations.exhaustive
            ? `Requires ${optimalCombinations.teams.at(0)?.members.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${
                optimalCombinations.teams.length
              } solutions.\nTimeout of 10 seconds reached, results may not be exhaustive`
            : `Requires ${optimalCombinations.teams.at(0)?.members.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${optimalCombinations.teams.length} solutions`
          : 'No possible team combinations for 100% coverage found, cant be made with current filter',
      recipe: prettifiedRecipe,
      bonus: recipe.bonus,
      value: recipe.value,
      teams: prettifiedCombinations
    };
  }

  #prettifyFiltersDetails(productionCombination: ProductionCombination) {
    const filters = productionCombination.filters;

    let prettyString = `-------------\n`;

    prettyString +=
      `Level: ${productionCombination.filters.level}, Nature: ${
        productionCombination.filters.nature?.prettyName ?? 'None'
      }\n` +
      `Main skill level: ${productionCombination.filters.skillLevel}\n` +
      `Subskills: ${filters.subskills && filters.subskills.size > 0 ? [...filters.subskills].join(', ') : 'None'}\n`;

    const teamInput: string[] = [];
    if (filters.ribbon > 0) {
      teamInput.push(`Ribbon level: ${filters.ribbon}`);
    }
    if (filters.e4eProcs > 0) {
      teamInput.push(
        `E4E: ${filters.e4eProcs} x ${EnergyForEveryone.activations.energy.amount(filters.e4eLevel)} energy`
      );
    }
    if (filters.helperBoostProcs > 0) {
      teamInput.push(
        `Helper boost: ${filters.helperBoostProcs} x ${HelperBoost.activations.helps.amount(
          filters.helperBoostLevel,
          filters.helperBoostUnique
        )} helps`
      );
    }
    if (filters.helpingBonus > 0) {
      teamInput.push(`Helping bonus: ${filters.helpingBonus}`);
    }
    if (filters.camp) {
      teamInput.push(`Good camp: ${filters.camp}`);
    }
    prettyString += teamInput.join(', ');
    if (teamInput.length > 0) {
      prettyString += '\n';
    }

    prettyString += `-------------\n`;
    return prettyString;
  }

  #prettifyProductionDetails(productionCombination: ProductionCombination) {
    const pokemonCombination = productionCombination.production;
    const summary = productionCombination.summary;

    let prettyString = `👨🏻‍🍳 Production Calculator 👨🏻‍🍳\nhttps://sleepapi.net\n\n${
      pokemonCombination.pokemonCombination.pokemon.name
    }(${shortPrettifyIngredientDrop(pokemonCombination.pokemonCombination.ingredientList)})\n`;

    prettyString += this.#prettifyFiltersDetails(productionCombination);

    prettyString += `Estimated skill procs per day: ${MathUtils.round(
      pokemonCombination.detailedProduce.averageTotalSkillProcs,
      1
    )}\n`;

    // skill values
    const {
      skillEnergySelfValue,
      skillEnergyOthersValue,
      skillProduceValue,
      skillBerriesOtherValue,
      skillStrengthValue,
      skillDreamShardValue,
      skillPotSizeValue,
      skillHelpsValue,
      skillTastyChanceValue
    } = summary;
    const prettifiedSkillProduce: string[] = [];
    if (skillProduceValue.berries.length > 0) {
      prettifiedSkillProduce.push(prettifyBerries(skillProduceValue.berries));
    }
    if (skillProduceValue.ingredients.length > 0) {
      prettifiedSkillProduce.push(
        `${prettifyIngredientDrop(
          skillProduceValue.ingredients.map(({ amount, ingredient }) => ({
            amount: MathUtils.round(amount, 1),
            ingredient
          }))
        )}`
      );
    }
    prettyString +=
      (skillEnergySelfValue > 0
        ? `Energy self skill value: ${MathUtils.round(skillEnergySelfValue, 2)} energy\n`
        : '') +
      (skillEnergyOthersValue > 0
        ? `Energy team skill value: ${MathUtils.round(skillEnergyOthersValue, 2)} energy / member\n`
        : '') +
      (skillBerriesOtherValue > 0
        ? `Berries team skill value: ${MathUtils.round(skillBerriesOtherValue, 1)} berries / member\n`
        : '') +
      (skillHelpsValue > 0 ? `Helps team skill value: ${MathUtils.round(skillHelpsValue, 2)} helps / member\n` : '') +
      (skillStrengthValue > 0 ? `Strength skill value: ${Math.floor(skillStrengthValue)} strength\n` : '') +
      (skillDreamShardValue > 0 ? `Dream shards skill value: ${Math.floor(skillDreamShardValue)} shards\n` : '') +
      (skillPotSizeValue > 0 ? `Pot size skill value: ${MathUtils.round(skillPotSizeValue, 2)} pot size\n` : '') +
      (skillTastyChanceValue > 0
        ? `Tasty chance skill value: ${MathUtils.round(skillTastyChanceValue, 2)}% crit chance\n`
        : '') +
      (prettifiedSkillProduce.length > 0 ? `Produce skill value: ${prettifiedSkillProduce.join(' + ')}\n` : '');

    prettyString += `Total berry output per day: ${MathUtils.round(
      pokemonCombination.detailedProduce.produce.berries[0]?.amount ?? 0,
      1
    )} ${pokemonCombination.detailedProduce.produce.berries[0]?.berry.name}\n`;

    const maybeSpilledIngredients =
      pokemonCombination.detailedProduce.spilledIngredients.length > 0
        ? prettifyIngredientDrop(pokemonCombination.detailedProduce.spilledIngredients)
        : 'None';
    prettyString += `Spilled ingredients at night: ${maybeSpilledIngredients}\n\n`;

    prettyString += `Total ingredient output per meal window\n${prettifyIngredientDrop(
      pokemonCombination.detailedProduce.produce.ingredients
    )}`;

    return prettyString;
  }

  #filterOnlyBest(
    tiersWithPokemonDetails: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[]
  ) {
    const seen = new Set<string>();
    const filtered: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
      new Map();
    for (const tier of tiersWithPokemonDetails) {
      for (const pokemon of tier.pokemonWithDetails) {
        if (!seen.has(pokemon.pokemon)) {
          seen.add(pokemon.pokemon);

          if (!filtered.has(tier.tier)) {
            filtered.set(tier.tier, [pokemon]);
          } else {
            const array = filtered.get(tier.tier);
            if (array !== undefined) {
              array.push(pokemon);
            }
          }
        }
      }
    }
    const filteredArray: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of filtered) {
      filteredArray.push({ tier, pokemonWithDetails });
    }

    return filteredArray;
  }

  #prettifyFillersForRecipe(recipe: IngredientSet[], surplus: SurplusIngredients): string {
    const fillers = surplus.relevant.map((filler) => {
      const recipeIngredient = recipe.find((r) => r.ingredient.name === filler.ingredient.name);
      const percentage = recipeIngredient ? (filler.amount / recipeIngredient.amount) * 100 : 0;
      return `${MathUtils.round(filler.amount, 1)} ${filler.ingredient.name} (${MathUtils.round(percentage, 0)}%)`;
    });

    fillers.push(
      `${surplus.extra.map((filler) => `${MathUtils.round(filler.amount, 1)} ${filler.ingredient.name} (N/A)`).join(', ')}`
    );

    const returnString = '\n-------------\nFiller ingredients produced\n\n';
    return returnString + fillers.join(', ');
  }
}

export const WebsiteConverterService = new WebsiteConverterServiceImpl();
