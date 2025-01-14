import { emptyProduce, type Produce } from '../../api/production/produce';
import { BELUE, LEPPA } from '../../domain/berry/berries';
import { BALANCED_GENDER } from '../../domain/gender/gender';
import { SLOWPOKE_TAIL, SNOOZY_TOMATO, TASTY_MUSHROOM } from '../../domain/ingredient/ingredients';
import { HELPER_BOOST } from '../../domain/mainskill/mainskills/helper-boost';
import type { Pokemon } from '../../domain/pokemon';
import { INVENTORY_S } from '../../domain/subskill/subskills';
import { emptyBerryInventory } from '../berry-utils/berry-utils';
import { prettifyIngredientDrop } from '../ingredient-utils/ingredient-utils';
import { CarrySizeUtils } from './carry-size-utils';

describe('emptyInventory', () => {
  it('shall empty inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    inventory = CarrySizeUtils.getEmptyInventory();
    expect(inventory.berries).toEqual([]);
    expect(inventory.ingredients).toEqual([]);
  });
});

describe('countInventory', () => {
  it('shall count inventory size correctly', () => {
    const inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    expect(CarrySizeUtils.countInventory(inventory)).toBe(4);
  });

  it('shall count inventory size and ignore berries if no berries', () => {
    const inventory: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    expect(CarrySizeUtils.countInventory(inventory)).toBe(2);
  });

  it('shall count inventory size and ignore ingredients if no ingredients', () => {
    const inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: []
    };

    expect(CarrySizeUtils.countInventory(inventory)).toBe(2);
  });

  it('shall count size as 0 if empty', () => {
    expect(CarrySizeUtils.countInventory(CarrySizeUtils.getEmptyInventory())).toBe(0);
  });
});

describe('addToInventory', () => {
  it('shall add produce to inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    inventory = CarrySizeUtils.addToInventory(inventory, inventory);
    expect(CarrySizeUtils.countInventory(inventory)).toBe(8);
  });

  it('shall add produce to empty inventory', () => {
    let inventory = CarrySizeUtils.getEmptyInventory();

    const addedProduce: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    inventory = CarrySizeUtils.addToInventory(inventory, addedProduce);
    expect(CarrySizeUtils.countInventory(inventory)).toBe(4);
    expect(inventory).toMatchInlineSnapshot(`
{
  "berries": [
    {
      "amount": 2,
      "berry": {
        "name": "LEPPA",
        "type": "fire",
        "value": 27,
      },
      "level": 60,
    },
  ],
  "ingredients": [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Snoozy Tomato",
        "name": "Tomato",
        "taxedValue": 35.4,
        "value": 110,
      },
    },
  ],
}
`);
  });

  it('shall add empty produce to inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    inventory = CarrySizeUtils.addToInventory(inventory, CarrySizeUtils.getEmptyInventory());
    expect(CarrySizeUtils.countInventory(inventory)).toBe(4);
  });

  it('shall add produce without berries to inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: LEPPA,
          level: 60
        }
      ],
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    const added: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: TASTY_MUSHROOM }]
    };

    inventory = CarrySizeUtils.addToInventory(inventory, added);
    expect(inventory.berries.reduce((sum, cur) => sum + cur.amount, 0)).toBe(2);
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });

  it('shall add produce without berries to inventory without berries', () => {
    let inventory: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: SNOOZY_TOMATO }]
    };

    const added: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: TASTY_MUSHROOM }]
    };

    inventory = CarrySizeUtils.addToInventory(inventory, added);
    expect(inventory.berries).toEqual([]);
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });

  it('shall skip berries and ingredients with 0 amount', () => {
    let inventory: Produce = {
      berries: [{ amount: 0, berry: BELUE, level: 1 }],
      ingredients: [{ amount: 0, ingredient: SNOOZY_TOMATO }]
    };

    inventory = CarrySizeUtils.addToInventory(emptyProduce(), inventory);

    expect(inventory.berries).toEqual([]);
    expect(inventory.ingredients).toEqual([]);
  });
});

describe('calculateCarrySize', () => {
  it('shall give same for default', () => {
    const baseWithEvolutions = 10;
    const subskillsLevelLimited = new Set<string>();
    const ribbon = 0;
    const camp = false;
    expect(CarrySizeUtils.calculateCarrySize({ baseWithEvolutions, subskillsLevelLimited, ribbon, camp })).toBe(10);
  });

  it('shall give correct for subskills, ribbon and camp', () => {
    const baseWithEvolutions = 31;
    const subskillsLevelLimited = new Set([INVENTORY_S.name]);
    const ribbon = 2;
    const camp = true;
    expect(CarrySizeUtils.calculateCarrySize({ baseWithEvolutions, subskillsLevelLimited, ribbon, camp })).toBe(48);
  });
});

describe('base and max carry size', () => {
  const MOCK_POKEMON: Pokemon = {
    name: 'Mockemon',
    specialty: 'berry',
    frequency: 0,
    ingredientPercentage: 0,
    skillPercentage: 0,
    berry: BELUE,
    genders: BALANCED_GENDER,
    carrySize: 10,
    previousEvolutions: 1,
    remainingEvolutions: 1,
    ingredient0: { amount: 0, ingredient: SLOWPOKE_TAIL },
    ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    skill: HELPER_BOOST
  };

  describe('timesEvolvedByCarrySize', () => {
    it('shall return 2 given 10 over base carry size', () => {
      expect(CarrySizeUtils.timesEvolvedByCarrySize(MOCK_POKEMON, 20)).toBe(2);
    });

    it('shall return 0 given the base carry size', () => {
      expect(CarrySizeUtils.timesEvolvedByCarrySize(MOCK_POKEMON, 10)).toBe(0);
    });
  });

  describe('baseCarrySize', () => {
    it('shall return 15 given 1 time evolved', () => {
      expect(CarrySizeUtils.baseCarrySize(MOCK_POKEMON, 1)).toBe(15);
    });

    it('shall return 10 given 0 times evolved', () => {
      expect(CarrySizeUtils.baseCarrySize(MOCK_POKEMON, 0)).toBe(10);
    });
  });

  describe('maxCarrySize', () => {
    it('shall return 15 for MOCK_POKEMON', () => {
      expect(CarrySizeUtils.maxCarrySize(MOCK_POKEMON)).toBe(15);
    });
  });
});
