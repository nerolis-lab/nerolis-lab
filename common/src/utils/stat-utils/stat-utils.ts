import { MAX_TEAM_SIZE } from '../../domain/constants';
import type { Nature } from '../../domain/nature';
import type { Pokemon, PokemonSpecialty } from '../../domain/pokemon';
import {
  BERRY_FINDING_S,
  ENERGY_RECOVERY_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  INVENTORY_M,
  INVENTORY_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../../domain/subskill/subskills';
import { MathUtils } from '../../utils/math-utils';

export function calculateIngredientPercentage(params: { pokemon: Pokemon; nature: Nature; subskills: Set<string> }) {
  const { pokemon, nature, subskills } = params;
  const ingredientSubskills = extractIngredientSubskills(subskills);
  const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;
  return ingredientPercentage;
}

export function extractIngredientSubskills(subskills: Set<string>) {
  const ingS = subskills.has(INGREDIENT_FINDER_S.name) ? INGREDIENT_FINDER_S.amount : 0;
  const ingM = subskills.has(INGREDIENT_FINDER_M.name) ? INGREDIENT_FINDER_M.amount : 0;
  return MathUtils.round(1 + ingM + ingS, 2);
}

export function calculateSubskillCarrySize(subskills: Set<string>): number {
  const invS = subskills.has(INVENTORY_S.name) ? INVENTORY_S.amount : 0;
  const invM = subskills.has(INVENTORY_M.name) ? INVENTORY_M.amount : 0;
  const invL = subskills.has(INVENTORY_L.name) ? INVENTORY_L.amount : 0;
  return invS + invM + invL;
}

export function calculateSkillPercentage(basePercentage: number, subskills: Set<string>, nature: Nature) {
  const triggerSubskills = extractTriggerSubskills(subskills);
  return (basePercentage / 100) * triggerSubskills * nature.skill;
}

export function calculateSkillPercentageWithPityProc(pokemon: Pokemon, subskills: Set<string>, nature: Nature) {
  const skillPercentWithoutPity = calculateSkillPercentage(pokemon.skillPercentage, subskills, nature);
  const pityProcThreshold = calculatePityProcThreshold(pokemon);
  return skillPercentWithoutPity / (1 - Math.pow(1 - skillPercentWithoutPity, pityProcThreshold + 1));
}

export function calculatePityProcThreshold(pokemon: Pokemon) {
  return pokemon.specialty === 'skill' || pokemon.specialty === 'all' ? Math.floor(144000 / pokemon.frequency) : 78;
}

export function extractTriggerSubskills(subskills: Set<string>) {
  const triggerS = subskills.has(SKILL_TRIGGER_S.name) ? SKILL_TRIGGER_S.amount : 0;
  const triggerM = subskills.has(SKILL_TRIGGER_M.name) ? SKILL_TRIGGER_M.amount : 0;
  return MathUtils.round(1 + triggerM + triggerS, 2);
}

export function countErbUsers(erb: number, subskills: Set<string>) {
  const subskillErb = subskills.has(ENERGY_RECOVERY_BONUS.name) ? 1 : 0;
  return Math.max(Math.min(erb + subskillErb, MAX_TEAM_SIZE), 0);
}

export function calculateNrOfBerriesPerDrop(specialty: PokemonSpecialty, subskills: Set<string>) {
  let result = specialty === 'berry' || specialty === 'all' ? 2 : 1;
  if (subskills.has(BERRY_FINDING_S.name)) {
    result += 1;
  }
  return result;
}

// Calculate help speed subskills and clamp at 35% boost
export function calculateHelpSpeedSubskills(params: { subskills: Set<string>; nrOfTeamHelpingBonus: number }) {
  const { subskills, nrOfTeamHelpingBonus } = params;
  const userAndTeamHelpBonus = subskills.has(HELPING_BONUS.name) ? nrOfTeamHelpingBonus + 1 : nrOfTeamHelpingBonus;
  const helpBonus = HELPING_BONUS.amount * Math.min(5, userAndTeamHelpBonus);

  const helpM = subskills.has(HELPING_SPEED_M.name) ? HELPING_SPEED_M.amount : 0;
  const helpS = subskills.has(HELPING_SPEED_S.name) ? HELPING_SPEED_S.amount : 0;

  return MathUtils.round(Math.max(0.65, 1 - helpM - helpS - helpBonus), 2);
}

export function calculateRibbonFrequency(pokemon: Pokemon, ribbonLevel: number) {
  let ribbonFrequency = 1;

  if (ribbonLevel >= 2) {
    if (pokemon.remainingEvolutions === 1) {
      ribbonFrequency -= 0.05;
    } else if (pokemon.remainingEvolutions === 2) {
      ribbonFrequency -= 0.11;
    }
  }

  if (ribbonLevel >= 4) {
    if (pokemon.remainingEvolutions === 1) {
      ribbonFrequency -= 0.07;
    } else if (pokemon.remainingEvolutions === 2) {
      ribbonFrequency -= 0.14;
    }
  }

  return ribbonFrequency;
}

export function calculateRibbonCarrySize(ribbon: number) {
  let carrySize = 0;

  if (ribbon >= 1) {
    carrySize += 1;
  }
  if (ribbon >= 2) {
    carrySize += 2;
  }
  if (ribbon >= 3) {
    carrySize += 3;
  }
  if (ribbon >= 4) {
    carrySize += 2;
  }

  return carrySize;
}
