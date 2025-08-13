import type { PokemonProduce } from '@src/domain/combination/produce.js';
import type { IngredientSet, Mainskill, Produce, SkillActivation } from 'sleepapi-common';
import {
  BerryBurst,
  BerryBurstDisguise,
  ChargeEnergySMoonlight,
  emptyBerryInventory,
  emptyIngredientInventory,
  EnergizingCheerS,
  ExtraHelpfulS,
  HelperBoost,
  ingredient,
  IngredientMagnetS,
  Metronome
} from 'sleepapi-common';

/** @deprecated used by alpha sim */
export function createSkillEvent(
  params: {
    skill: Mainskill;
    skillLevel: number;
    nrOfHelpsToActivate: number;
    adjustedAmount: number;
    pokemonSet: PokemonProduce;
    skillActivations: SkillActivation[];
    uniqueHelperBoost: number;
    avgCritChancePerProc: number;
  },
  metronomeFactor = 1
) {
  const {
    skill,
    skillLevel,
    nrOfHelpsToActivate,
    adjustedAmount,
    pokemonSet,
    skillActivations,
    avgCritChancePerProc,
    uniqueHelperBoost
  } = params;
  switch (skill) {
    case EnergizingCheerS: {
      skillActivations.push(
        activateEnergizingCheer({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case IngredientMagnetS: {
      skillActivations.push(
        activateIngredientMagnet({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case BerryBurstDisguise: {
      skillActivations.push(
        activateDisguiseBerryBurst({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonSet,
          avgCritChancePerProc,
          metronomeFactor
        })
      );
      break;
    }
    case BerryBurst: {
      skillActivations.push(
        activateBerryBurst({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonSet,
          avgCritChancePerProc,
          metronomeFactor
        })
      );
      break;
    }
    case ExtraHelpfulS: {
      skillActivations.push(
        activateExtraHelpful({
          skillLevel,
          nrOfHelpsToActivate,
          adjustedAmount,
          pokemonSet,
          metronomeFactor
        })
      );
      break;
    }
    case HelperBoost: {
      skillActivations.push(
        activateHelperBoost({
          skillLevel,
          nrOfHelpsToActivate,
          uniqueHelperBoost,
          adjustedAmount,
          pokemonSet,
          metronomeFactor
        })
      );
      break;
    }
    case ChargeEnergySMoonlight: {
      skillActivations.push(
        activateMoonlightChargeEnergy({ skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
    case Metronome: {
      activateMetronome(params);
      break;
    }
    default: {
      skillActivations.push(
        activateNonProduceSkills({ skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor })
      );
      break;
    }
  }
}

export function activateEnergizingCheer(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  const skill = EnergizingCheerS;
  const divideByRandomAndMetronome = 5 * metronomeFactor;

  return {
    skill,
    adjustedAmount: (skill.activations.energy.amount({ skillLevel }) * adjustedAmount) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateMoonlightChargeEnergy(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  const skill = ChargeEnergySMoonlight;
  const teamSize = 5;

  const energyNormalProc = (skill.activations.energy.amount({ skillLevel }) * adjustedAmount) / metronomeFactor;
  const energyFromCrit = ChargeEnergySMoonlight.activations.energy.critAmount({ skillLevel }) / teamSize;
  const averageEnergyGained = energyNormalProc + energyFromCrit * ChargeEnergySMoonlight.activations.energy.critChance;

  return {
    skill,
    adjustedAmount: averageEnergyGained,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateIngredientMagnet(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = IngredientMagnetS;

  const divideByAverageIngredientAndMetronome = ingredient.INGREDIENTS.length * metronomeFactor;

  const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
    ingredient: ing,
    amount:
      (skill.activations.ingredients.amount({ skillLevel }) * adjustedAmount) / divideByAverageIngredientAndMetronome
  }));

  return {
    skill,
    adjustedAmount: (skill.activations.ingredients.amount({ skillLevel }) * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries: emptyBerryInventory(),
      ingredients: magnetIngredients
    },
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateDisguiseBerryBurst(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  avgCritChancePerProc: number;
  metronomeFactor: number;
}): SkillActivation {
  const {
    skillLevel,
    nrOfHelpsToActivate,
    adjustedAmount: fractionOfProc,
    pokemonSet,
    avgCritChancePerProc,
    metronomeFactor
  } = params;
  const skill = BerryBurstDisguise;

  const amountNoCrit = skill.activations.berries.amount({ skillLevel }) * fractionOfProc;

  const averageBerryAmount =
    (amountNoCrit + avgCritChancePerProc * amountNoCrit * (ChargeEnergySMoonlight.activations.energy.critChance - 1)) /
    metronomeFactor;

  return {
    skill,
    adjustedAmount: averageBerryAmount,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries: [{ amount: averageBerryAmount, berry: pokemonSet.pokemon.berry, level: 0 }],
      ingredients: emptyIngredientInventory()
    },
    fractionOfProc: fractionOfProc / metronomeFactor,
    critChance: avgCritChancePerProc
  };
}

export function activateBerryBurst(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  avgCritChancePerProc: number;
  metronomeFactor: number;
}): SkillActivation {
  const {
    skillLevel,
    nrOfHelpsToActivate,
    adjustedAmount: fractionOfProc,
    pokemonSet,
    avgCritChancePerProc,
    metronomeFactor
  } = params;
  const skill = BerryBurst;

  const amountNoCrit = skill.activations.berries.amount({ skillLevel }) * fractionOfProc;

  const averageBerryAmount = (amountNoCrit + avgCritChancePerProc * amountNoCrit) / metronomeFactor;

  return {
    skill,
    adjustedAmount: averageBerryAmount,
    nrOfHelpsToActivate,
    adjustedProduce: {
      berries: [{ amount: averageBerryAmount, berry: pokemonSet.pokemon.berry, level: 0 }],
      ingredients: emptyIngredientInventory()
    },
    fractionOfProc: fractionOfProc / metronomeFactor
  };
}

export function activateExtraHelpful(params: {
  skillLevel: number;
  pokemonSet: PokemonProduce;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skillLevel, pokemonSet, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = ExtraHelpfulS;

  const divideByRandomAndMetronome = 5 * metronomeFactor;

  const extraHelpfulProduce: Produce = {
    berries: pokemonSet.produce.berries.map(({ amount, berry, level }) => ({
      berry,
      amount: (amount * skill.activations.helps.amount({ skillLevel }) * adjustedAmount) / divideByRandomAndMetronome,
      level
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * skill.activations.helps.amount({ skillLevel }) * adjustedAmount) / divideByRandomAndMetronome
    }))
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * skill.activations.helps.amount({ skillLevel })) / divideByRandomAndMetronome,
    nrOfHelpsToActivate,
    adjustedProduce: extraHelpfulProduce,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateNonProduceSkills(params: {
  skill: Mainskill;
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}): SkillActivation {
  const { skill, skillLevel, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;

  // Alpha sim hack: Get the first activation since we don't care which specific activation unit we use
  const firstActivation = Object.values(skill.activations).at(0);
  const activationAmount = firstActivation?.amount({ skillLevel }) ?? skillLevel; // hack for skill copy

  return {
    skill,
    adjustedAmount: (activationAmount * adjustedAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}

export function activateMetronome(params: {
  skillLevel: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  pokemonSet: PokemonProduce;
  skillActivations: SkillActivation[];
  uniqueHelperBoost: number;
  avgCritChancePerProc: number;
}) {
  const skillsToActivate = Metronome.metronomeSkills;

  for (const skillToActivate of skillsToActivate) {
    const skillLevel = Math.min(skillToActivate.maxLevel, params.skillLevel);

    createSkillEvent(
      {
        ...params,
        skill: skillToActivate,
        skillLevel
      },
      skillsToActivate.length
    );
  }
}

export function activateHelperBoost(params: {
  skillLevel: number;
  pokemonSet: PokemonProduce;
  uniqueHelperBoost: number;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  metronomeFactor: number;
}) {
  const { skillLevel, pokemonSet, uniqueHelperBoost, nrOfHelpsToActivate, adjustedAmount, metronomeFactor } = params;
  const skill = HelperBoost;

  const helpAmount =
    uniqueHelperBoost > 0 ? skill.activations.helps.amount({ skillLevel, extra: uniqueHelperBoost }) : 0;

  const helperBoostProduce: Produce = {
    berries: pokemonSet.produce.berries.map(({ amount, berry, level }) => ({
      berry,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor,
      level
    })),
    ingredients: pokemonSet.produce.ingredients.map(({ amount, ingredient }) => ({
      ingredient,
      amount: (amount * helpAmount * adjustedAmount) / metronomeFactor
    }))
  };

  return {
    skill,
    adjustedAmount: (adjustedAmount * helpAmount) / metronomeFactor,
    nrOfHelpsToActivate,
    adjustedProduce: helperBoostProduce,
    fractionOfProc: adjustedAmount / metronomeFactor
  };
}
