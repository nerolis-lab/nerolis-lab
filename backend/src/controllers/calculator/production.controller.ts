import { UserRecipeDAO } from '@src/database/dao/user-recipe/user-recipe-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error.js';
import { SleepAPIError } from '@src/domain/error/sleepapi-error.js';
import {
  calculateIv,
  calculatePokemonProduction,
  calculateTeam
} from '@src/services/api-service/production/production-service.js';
import type { UserRecipeFlat } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import {
  defaultUserRecipes,
  type UserRecipes
} from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import * as tsoa from '@tsoa/runtime';
import type {
  CalculateIvRequest,
  CalculateTeamRequest,
  IngredientIndexToFloatAmount,
  IngredientInstance,
  IngredientSet,
  Pokemon,
  PokemonInstanceIdentity,
  RecipeFlat,
  SingleProductionRequest,
  TeamMemberExt,
  TeamSettings,
  TeamSettingsExt
} from 'sleepapi-common';
import {
  calculateRecipeValue,
  CarrySizeUtils,
  curry,
  dessert,
  flatToIngredientSet,
  getIngredient,
  getNature,
  getPokemon,
  ingredientSetToFloatFlat,
  limitSubSkillsToLevel,
  mainskill,
  salad
} from 'sleepapi-common';
const { Controller, Post, Path, Body, Query, Route, Tags } = tsoa;

@Route('api/calculator')
@Tags('calculator')
export default class ProductionController extends Controller {
  @Post('production/{name}')
  public async calculatePokemonProduction(
    @Path() name: string,
    @Body() body: SingleProductionRequest,
    @Query() includeAnalysis?: boolean
  ) {
    const pokemon = getPokemon(name);
    const parsedInput = this.#parseSingleProductionInput(pokemon, body);
    return calculatePokemonProduction(pokemon, parsedInput, body.ingredientSet, queryAsBoolean(includeAnalysis), 5000);
  }

  public async calculateTeam(body: CalculateTeamRequest, maybeUser?: DBUser) {
    const userRecipes = await this.#parseUserRecipes(maybeUser);
    const parsedInput = this.#parseTeamInput(body, userRecipes);
    return calculateTeam(parsedInput);
  }

  public async calculateIv(body: CalculateIvRequest) {
    const parsedInput = this.#parseIvInput(body);
    return calculateIv(parsedInput);
  }

  #parseIvInput(body: CalculateIvRequest) {
    const { members, variants } = body;
    const settings = this.#parseSettings({ settings: body.settings, includeCooking: false });

    if (members.length > 4) {
      throw new BadRequestError(
        'Max team length allowed is 4, to allow space for the IV-checked mon, but was: ' + members.length
      );
    }
    if (variants.length > 10) {
      throw new BadRequestError('Max variants to check is 10');
    }

    const parsedMembers = this.#parseTeamMembers(members, settings.camp);
    const parsedVariants = this.#parseTeamMembers(variants, settings.camp);

    return {
      settings,
      members: parsedMembers,
      variants: parsedVariants
    };
  }

  #parseTeamMembers(members: PokemonInstanceIdentity[], camp: boolean) {
    const parsedMembers: TeamMemberExt[] = [];
    for (const member of members) {
      const pokemon = getPokemon(member.pokemon);
      const subskills = new Set(
        member.subskills.filter((subskill) => subskill.level <= member.level).map((subskill) => subskill.subskill)
      );

      parsedMembers.push({
        pokemonWithIngredients: {
          pokemon,
          ingredientList: this.#getIngredientSet({
            pokemon,
            level: member.level,
            ingredients: member.ingredients
          })
        },
        settings: {
          level: member.level,
          ribbon: member.ribbon,
          carrySize: CarrySizeUtils.calculateCarrySize({
            baseWithEvolutions: member.carrySize,
            subskillsLevelLimited: subskills,
            ribbon: member.ribbon,
            camp
          }),
          nature: getNature(member.nature),
          skillLevel: member.skillLevel,
          subskills,
          externalId: member.externalId
        }
      });
    }
    return parsedMembers;
  }

  #parseTeamInput(body: CalculateTeamRequest, userRecipes: UserRecipes) {
    const settings = this.#parseSettings({ settings: body.settings, includeCooking: true });

    return {
      settings,
      members: this.#parseTeamMembers(body.members, settings.camp),
      userRecipes
    };
  }

  async #parseUserRecipes(maybeUser?: DBUser): Promise<UserRecipes> {
    if (!maybeUser) {
      return defaultUserRecipes();
    }

    const userRecipes = await UserRecipeDAO.findMultiple({ fk_user_id: maybeUser.id });

    const recipeLevelMap = new Map(userRecipes.map((recipe) => [recipe.recipe, recipe.level]));

    const processRecipes = (recipeList: RecipeFlat[]): UserRecipeFlat[] => {
      return recipeList
        .map((recipe) => {
          const level = recipeLevelMap.get(recipe.name) ?? 1;
          return {
            ...recipe,
            level,
            valueMax: calculateRecipeValue({
              bonus: recipe.bonus,
              ingredients: flatToIngredientSet(recipe.ingredients),
              level
            })
          };
        })
        .sort((a, b) => b.valueMax - a.valueMax);
    };

    return {
      curries: processRecipes(curry.CURRIES_FLAT),
      salads: processRecipes(salad.SALADS_FLAT),
      desserts: processRecipes(dessert.DESSERTS_FLAT)
    };
  }

  #parseSettings(params: { settings: TeamSettings; includeCooking: boolean }): TeamSettingsExt {
    const { settings, includeCooking } = params;
    const camp = queryAsBoolean(settings.camp);
    const bedtime = TimeUtils.parseTime(settings.bedtime);
    const wakeup = TimeUtils.parseTime(settings.wakeup);
    const sleepDuration = TimeUtils.calculateDuration({
      start: bedtime,
      end: wakeup
    });
    const dayDuration = TimeUtils.calculateDuration({
      start: wakeup,
      end: bedtime
    });
    if (sleepDuration.hour < 1 || dayDuration.hour < 1) {
      throw new SleepAPIError('Minimum 1 hour of sleep and daytime required');
    }

    const stockpiledIngredients: IngredientIndexToFloatAmount = ingredientSetToFloatFlat(
      settings.stockpiledIngredients?.map(({ name, amount }) => ({
        ingredient: getIngredient(name),
        amount
      })) ?? []
    );

    return {
      camp,
      bedtime,
      wakeup,
      includeCooking,
      stockpiledIngredients
    };
  }

  #getIngredientSet(params: { pokemon: Pokemon; level: number; ingredients: IngredientInstance[] }): IngredientSet[] {
    const { ingredients, level } = params;
    const result: IngredientSet[] = [];

    for (const ingredientSet of ingredients) {
      if (ingredientSet.level <= level) {
        result.push({
          amount: ingredientSet.amount,
          ingredient: getIngredient(ingredientSet.name)
        });
      } else break;
    }
    return result;
  }

  #parseSingleProductionInput(pkmn: Pokemon, input: SingleProductionRequest): ProductionStats {
    const level = queryAsNumber(input.level) ?? 60;

    const mainBedtime = TimeUtils.parseTime(input.mainBedtime);
    const mainWakeup = TimeUtils.parseTime(input.mainWakeup);
    const duration = TimeUtils.calculateDuration({
      start: mainBedtime,
      end: mainWakeup
    });
    if (duration.hour < 1) {
      throw new SleepAPIError('Minimum sleep of 1 hour required');
    }

    const rawUniqueHelperBoost = queryAsNumber(input.helperBoostUnique) ?? 0;
    const canRollHelperBoost = pkmn.skill === mainskill.HELPER_BOOST || pkmn.skill === mainskill.METRONOME;
    const uniqueHelperBoost = rawUniqueHelperBoost === 0 && canRollHelperBoost ? 1 : rawUniqueHelperBoost;

    const inputNrOfEvos = queryAsNumber(input.nrOfEvolutions);
    const nrOfEvos = inputNrOfEvos !== undefined ? inputNrOfEvos : pkmn.previousEvolutions;
    if (nrOfEvos > pkmn.previousEvolutions) {
      throw new PokemonError(`${pkmn.name} doesn't evolve ${inputNrOfEvos} times`);
    }
    const inventoryLimit = pkmn.carrySize + nrOfEvos * 5;

    const parsedInput: ProductionStats = {
      level,
      ribbon: queryAsNumber(input.ribbon) ?? 0,
      nature: getNature(input.nature),
      subskills: limitSubSkillsToLevel(new Set(input.subskills), level),
      skillLevel: Math.min(queryAsNumber(input.skillLevel) ?? pkmn.skill.maxLevel, pkmn.skill.maxLevel),
      inventoryLimit,
      e4eProcs: queryAsNumber(input.e4eProcs) ?? 0,
      e4eLevel: queryAsNumber(input.e4eLevel) ?? mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      cheer: queryAsNumber(input.cheer) ?? 0,
      extraHelpful: queryAsNumber(input.extraHelpful) ?? 0,
      helperBoostProcs: queryAsNumber(input.helperBoostProcs) ?? 0,
      helperBoostUnique: uniqueHelperBoost,
      helperBoostLevel: queryAsNumber(input.helperBoostLevel) ?? mainskill.HELPER_BOOST.maxLevel,
      helpingBonus: queryAsNumber(input.helpingbonus) ?? 0,
      camp: queryAsBoolean(input.camp),
      erb: queryAsNumber(input.erb) ?? 0,
      incense: queryAsBoolean(input.recoveryIncense),
      mainBedtime,
      mainWakeup
    };
    return parsedInput;
  }
}
