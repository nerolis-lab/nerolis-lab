import {
  CUTIEFLY,
  DWEBBLE,
  HAWLUCHA,
  SANDSHREW,
  IngredientDrawSCutiefly,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSSandshrew,
  IngredientDrawSHyperCutter,
  IngredientDrawSSuperLuck,
  IngredientMagnetS,
  Metronome,
  SkillCopy,
  type Ingredient,
  type Mainskill
} from 'sleepapi-common';

/** Match Skill Copy's non-recursive fallback and Metronome's actual skill pool. */
export function ingredientSkillAccess(skill: Mainskill, teammates: Mainskill[]) {
  const skills = new Set<Mainskill>();
  function visit(candidate: Mainskill) {
    if (skills.has(candidate)) return;
    skills.add(candidate);
    if (candidate.isOrModifies(SkillCopy)) {
      for (const teammate of teammates) if (!teammate.isOrModifies(SkillCopy)) visit(teammate);
    } else if (candidate.isOrModifies(Metronome)) {
      for (const selected of Metronome.metronomeSkills) visit(selected);
    }
  }
  visit(skill);
  const drawOptions = new Map<Mainskill, Ingredient[]>([
    [IngredientDrawSCutiefly, CUTIEFLY.ingredient60.map(({ ingredient }) => ingredient)],
    [IngredientDrawSDwebble, DWEBBLE.ingredient60.map(({ ingredient }) => ingredient)],
    [IngredientDrawSHawlucha, HAWLUCHA.ingredient60.map(({ ingredient }) => ingredient)],
    [IngredientDrawSSandshrew, SANDSHREW.ingredient60.map(({ ingredient }) => ingredient)],
    [
      IngredientDrawSHyperCutter,
      Object.values(IngredientDrawSHyperCutter.HyperCutterResultConfig).map(({ ingredient }) => ingredient)
    ],
    [
      IngredientDrawSSuperLuck,
      Object.values(IngredientDrawSSuperLuck.SuperLuckResultConfig).flatMap(({ ingredient }) =>
        ingredient ? [ingredient] : []
      )
    ]
  ]);
  return {
    ingredients: [...skills].flatMap((candidate) => drawOptions.get(candidate) ?? []),
    hasMagnet: [...skills].some((candidate) => candidate.isOrModifies(IngredientMagnetS))
  };
}
