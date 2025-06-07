import { describe, expect, it } from 'vitest';
import type { IngredientSet, IngredientSetSimple } from '../../domain/ingredient/ingredient';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  HONEY,
  INGREDIENTS,
  LOCKED_INGREDIENT,
  MOOMOO_MILK,
  ROUSING_COFFEE,
  SOFT_POTATO,
  SOOTHING_CACAO
} from '../../domain/ingredient/ingredients';
import { DARKRAI } from '../../domain/pokemon/all-pokemon';
import { PINSIR } from '../../domain/pokemon/ingredient-pokemon';
import type { PokemonWithIngredients } from '../../domain/pokemon/pokemon';
import '../../domain/recipe/recipe'; // Import recipes to populate ingredient bonus cache
import type { Logger } from '../../prototype/logger/logger';
import { commonMocks } from '../../vitest';
import {
  calculateAveragePokemonIngredientSet,
  combineSameIngredientsInDrop,
  emptyIngredientInventory,
  flatToIngredientSet,
  getAllIngredientLists,
  getIngredient,
  getIngredientNames,
  getMaxIngredientBonus,
  includesMagnet,
  ingredientIndex,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  prettifyIngredientDrop,
  shortPrettifyIngredientDrop,
  simplifyIngredientSet,
  unsimplifyIngredientSet,
  updateMaxIngredientBonus
} from './ingredient-utils';

describe('getIngredient', () => {
  it('shall return ingredient for name', () => {
    expect(getIngredient('Honey')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });
});

describe('getIngredientNames', () => {
  it('shall get all ingredient names', () => {
    expect(getIngredientNames()).toMatchInlineSnapshot(`
      [
        "Apple",
        "Milk",
        "Soybean",
        "Honey",
        "Sausage",
        "Ginger",
        "Tomato",
        "Egg",
        "Oil",
        "Potato",
        "Herb",
        "Corn",
        "Cacao",
        "Coffee",
        "Mushroom",
        "Leek",
        "Tail",
      ]
    `);
  });
});

describe('emptyIngredientInventory', () => {
  it('shall return an empty ingredient inventory', () => {
    expect(emptyIngredientInventory()).toEqual([]);
  });
});

describe('combineSameIngredientsInDrop', () => {
  it('shall combine ingredients and leave unique ingredients as is', () => {
    const pinsir: IngredientSet[] = [
      {
        amount: 2,
        ingredient: HONEY
      },
      { amount: 5, ingredient: FANCY_APPLE }
    ];
    const absol: IngredientSet[] = [
      {
        amount: 2,
        ingredient: SOOTHING_CACAO
      },
      { amount: 8, ingredient: FANCY_APPLE }
    ];

    expect(combineSameIngredientsInDrop([...pinsir, ...absol])).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 13,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
        {
          "amount": 2,
          "ingredient": {
            "longName": "Soothing Cacao",
            "name": "Cacao",
            "taxedValue": 66.7,
            "value": 151,
          },
        },
      ]
    `);
  });
});

describe('shortPrettifyIngredientDrop', () => {
  it('shall shorten the prettify ingredient drop', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    expect(shortPrettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"Honey/Apple/Honey"`);
  });

  it('shall acknowledge locked ingredients', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: BEAN_SAUSAGE },
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 0, ingredient: LOCKED_INGREDIENT }
    ];
    expect(shortPrettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"Sausage/Locked/Locked"`);
  });
});

describe('prettifyIngredientDrop', () => {
  it('shall prettify an ingredient list', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Honey, 5 Apple, 7 Honey"`);
  });

  it('shall leave out locked ingredients', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: BEAN_SAUSAGE },
      { amount: 0, ingredient: LOCKED_INGREDIENT },
      { amount: 0, ingredient: LOCKED_INGREDIENT }
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Sausage"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    INGREDIENTS.map((ingredient) => rawCombination.push({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(
      `"2 Honey, 5 Apple, 7 Honey and 0.84 of all 15 other ingredients"`
    );
  });

  it('shall prettify an isolated ingredient magnet proc', () => {
    const ings = INGREDIENTS.map((ingredient) => ({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(ings)).toMatchInlineSnapshot(`"0.84 of all 17 ingredients"`);
  });

  it('shall support custom separator', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    expect(prettifyIngredientDrop(rawCombination, '/')).toMatchInlineSnapshot(`"2 Honey/5 Apple/7 Honey"`);
  });

  it('shall prettify an ingredient list from Float32Array', () => {
    const floatArray = new Float32Array([0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(prettifyIngredientDrop(floatArray)).toMatchInlineSnapshot(`"2 Honey, 5 Egg"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc from Float32Array', () => {
    const floatArray = new Float32Array(INGREDIENTS.length).fill(0.83761);
    expect(prettifyIngredientDrop(floatArray)).toMatchInlineSnapshot(`"0.84 of all 17 ingredients"`);
  });

  it('shall support custom separator with Float32Array', () => {
    const floatArray = new Float32Array([0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(prettifyIngredientDrop(floatArray, '/')).toMatchInlineSnapshot(`"2 Honey/5 Egg"`);
  });

  it('shall prettify an ingredient list from Int16Array', () => {
    const intArray = new Int16Array([0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(prettifyIngredientDrop(intArray)).toMatchInlineSnapshot(`"2 Honey, 5 Egg"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc from Int16Array', () => {
    const intArray = new Int16Array(INGREDIENTS.length).fill(1);
    expect(prettifyIngredientDrop(intArray)).toMatchInlineSnapshot(`"1 of all 17 ingredients"`);
  });

  it('shall support custom separator with Int16Array', () => {
    const intArray = new Int16Array([0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(prettifyIngredientDrop(intArray, '/')).toMatchInlineSnapshot(`"2 Honey/5 Egg"`);
  });
});

describe('getAllIngredientCombinationsFor', () => {
  it('shall find all combinations for given pokemon at level 60', () => {
    expect(getAllIngredientLists(PINSIR, 60)).toMatchInlineSnapshot(`
[
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 8,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 8,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
]
`);
  });

  it('shall find all combinations for given pokemon at level 30', () => {
    expect(getAllIngredientLists(PINSIR, 30)).toMatchInlineSnapshot(`
[
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
  [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
]
`);
  });
});

describe('calculateAveragePokemonIngredientSet', () => {
  it('shall average an ingredient set for level 100', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 3,
          ingredient: FANCY_APPLE
        },
        {
          amount: 3,
          ingredient: FANCY_EGG
        },
        {
          amount: 3,
          ingredient: MOOMOO_MILK
        }
      ]
    };
    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet.ingredientList, 100);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });

  it('shall average an ingredient set for level 60', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 3,
          ingredient: FANCY_APPLE
        },
        {
          amount: 3,
          ingredient: FANCY_EGG
        },
        {
          amount: 3,
          ingredient: MOOMOO_MILK
        }
      ]
    };
    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet.ingredientList, 60);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });

  it('shall average an ingredient set for level 30', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 4,
          ingredient: FANCY_APPLE
        },
        {
          amount: 4,
          ingredient: FANCY_EGG
        }
      ]
    };

    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet.ingredientList, 30);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });

  it('shall average an ingredient set for Darkrai', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: DARKRAI,
      ingredientList: [
        { amount: 2, ingredient: BEAN_SAUSAGE },
        { amount: 0, ingredient: LOCKED_INGREDIENT },
        { amount: 0, ingredient: LOCKED_INGREDIENT }
      ]
    };

    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet.ingredientList, 60);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  0,
  0,
  0,
  0,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });
});

describe('ingredientSetToFloatFlat', () => {
  it('shall convert ingredient set to float flat array', () => {
    const ingredientSet: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_EGG }
    ];
    expect(ingredientSetToFloatFlat(ingredientSet)).toMatchInlineSnapshot(`
Float32Array [
  0,
  0,
  0,
  2,
  0,
  0,
  0,
  5,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });
});

describe('ingredientSetToIntFlat', () => {
  it('shall convert ingredient set to int flat array', () => {
    const ingredientSet: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_EGG }
    ];
    expect(ingredientSetToIntFlat(ingredientSet)).toMatchInlineSnapshot(`
Int16Array [
  0,
  0,
  0,
  2,
  0,
  0,
  0,
  5,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });
});

describe('flatToIngredientSet', () => {
  it('shall convert flat array to ingredient set', () => {
    const flatArray = new Float32Array([0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(flatToIngredientSet(flatArray)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 5,
          "ingredient": {
            "longName": "Fancy Egg",
            "name": "Egg",
            "taxedValue": 38.7,
            "value": 115,
          },
        },
      ]
    `);
  });
});

describe('includesMagnet', () => {
  it('shall return true if ingredients include magnet ingredients', () => {
    const ingredients: IngredientSet[] = INGREDIENTS.map((ingredient) => ({ amount: 0.83761, ingredient }));
    expect(includesMagnet(ingredients)).toBe(true);
  });

  it('shall return false if ingredients do not include magnet ingredients', () => {
    const ingredients: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE }
    ];
    expect(includesMagnet(ingredients)).toBe(false);
  });
});

describe('simplifyIngredientSet', () => {
  it('shall simplify an ingredient set', () => {
    const ingredientSet: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_EGG },
      { amount: 7, ingredient: HONEY }
    ];
    expect(simplifyIngredientSet(ingredientSet)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "name": "Honey",
        },
        {
          "amount": 5,
          "name": "Egg",
        },
        {
          "amount": 7,
          "name": "Honey",
        },
      ]
    `);
  });
});

describe('unsimplifyIngredientSet', () => {
  it('shall unsimplify an ingredient set', () => {
    const ingredientSet: IngredientSetSimple[] = [
      { amount: 2, name: HONEY.name },
      { amount: 5, name: FANCY_EGG.name },
      { amount: 7, name: HONEY.name }
    ];
    expect(unsimplifyIngredientSet(ingredientSet)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 5,
          "ingredient": {
            "longName": "Fancy Egg",
            "name": "Egg",
            "taxedValue": 38.7,
            "value": 115,
          },
        },
        {
          "amount": 7,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
      ]
    `);
  });
});

describe('ingredientIndex', () => {
  it('shall return 0 for <30', () => {
    expect(ingredientIndex(29)).toBe(0);
  });
  it('shall return 1 for <60', () => {
    expect(ingredientIndex(59)).toBe(1);
  });
  it('shall return 2 for <89', () => {
    expect(ingredientIndex(89)).toBe(2);
  });
  it('shall return 2 for 100', () => {
    expect(ingredientIndex(100)).toBe(2);
  });
});

const MOCK_SEAWEED = commonMocks.mockIngredient({
  name: 'Seaweed',
  value: 101
});

const mockRecipeList = [
  commonMocks.mockRecipe({
    name: 'MOCK_RECIPE_MAX_BONUS_UPDATED',
    ingredients: [{ amount: 1, ingredient: SOFT_POTATO }],
    bonus: 70
  }),
  commonMocks.mockRecipe({
    name: 'MOCK_RECIPE_NEWLY_SET_BONUS',
    ingredients: [
      { amount: 1, ingredient: MOCK_SEAWEED },
      { amount: 1, ingredient: ROUSING_COFFEE }
    ],
    bonus: 15.77
  })
];

describe('updateIngredientBonus', () => {
  beforeEach(() => {
    global.logger = {
      error: vi.fn()
    } as unknown as Logger;
  });

  it('should correctly set the bonus for ingredients in recipes', () => {
    mockRecipeList.forEach((recipe) => {
      updateMaxIngredientBonus(recipe.ingredients, recipe.bonus);
    });

    const expectedBonuses = {
      Potato: 70,
      Seaweed: 15.77,
      Coffee: 61, // ingredientBonusCache is populated upon startup
      Tail: 25, // ingredientBonusCache is populated upon startup
      Cheese: 0 // default to 0 if not in cache
    };

    for (const [ingredientName, bonus] of Object.entries(expectedBonuses)) {
      expect(getMaxIngredientBonus(ingredientName)).toBe(bonus);
    }
    expect(global.logger.error).toHaveBeenCalledWith('Error: Max bonus for ingredient "Cheese" not found.');
  });
});
