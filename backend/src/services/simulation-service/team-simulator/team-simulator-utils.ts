import { calculateHelpSpeedBeforeEnergy } from '@src/services/calculator/help/help-calculator.js';
import type { ProduceFlat, TeamMemberExt, TeamSettingsExt } from 'sleepapi-common';
import {
  berrySetToFlat,
  calculateAveragePokemonIngredientSet,
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
  ingredientSetToIntFlat
} from 'sleepapi-common';

class TeamSimulatorUtilsImpl {
  public calculateSkillPercentage(member: TeamMemberExt) {
    return calculateSkillPercentage(
      member.pokemonWithIngredients.pokemon.skillPercentage,
      member.settings.subskills,
      member.settings.nature
    );
  }

  public calculateIngredientPercentage(member: TeamMemberExt) {
    return calculateIngredientPercentage({
      pokemon: member.pokemonWithIngredients.pokemon,
      nature: member.settings.nature,
      subskills: member.settings.subskills
    });
  }

  public calculateAverageProduce(member: TeamMemberExt): ProduceFlat {
    const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);
    const pokemonIngredientListFlat = ingredientSetToIntFlat(member.pokemonWithIngredients.ingredientList);

    const avgIngredientList = calculateAveragePokemonIngredientSet(pokemonIngredientListFlat, member.settings.level);

    const memberBerryInList = berrySetToFlat([
      { amount: 1, berry: member.pokemonWithIngredients.pokemon.berry, level: member.settings.level }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon.specialty,
      member.settings.subskills
    );

    return {
      berries: Float32Array.from(memberBerryInList, (value) => value * (berriesPerDrop * (1 - ingredientPercentage))),
      ingredients: Float32Array.from(avgIngredientList, (value) => value * ingredientPercentage)
    };
  }

  public calculateHelpSpeedBeforeEnergy(params: {
    member: TeamMemberExt;
    settings: TeamSettingsExt;
    teamHelpingBonus: number;
  }) {
    const { member, settings, teamHelpingBonus } = params;

    return calculateHelpSpeedBeforeEnergy({
      pokemon: member.pokemonWithIngredients.pokemon,
      level: member.settings.level,
      nature: member.settings.nature,
      subskills: member.settings.subskills,
      camp: settings.camp,
      ribbonLevel: member.settings.ribbon,
      teamHelpingBonus
    });
  }

  public countMembersWithSubskill(team: TeamMemberExt[], subskill: string): number {
    let count = 0;
    for (const member of team) {
      if (member.settings.subskills.has(subskill)) {
        count++;
      }
    }
    return count;
  }
}

export const TeamSimulatorUtils = new TeamSimulatorUtilsImpl();
