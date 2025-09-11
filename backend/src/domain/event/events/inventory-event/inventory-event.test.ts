import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event.js';
import { berry, ingredient, parseTime } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('InventoryEvent', () => {
  it('inventory event shall format correctly', () => {
    const event = new InventoryEvent({
      time: parseTime('06:00'),
      description: 'test',
      before: 1,
      delta: 1,
      max: 3,
      contents: {
        ingredients: [{ amount: 1, ingredient: ingredient.BEAN_SAUSAGE }],
        berries: [{ amount: 1, berry: berry.BELUE, level: 60 }]
      }
    });
    expect(event.format()).toMatchInlineSnapshot(
      `"[06:00:00][Inventory] (test): 1 -> 2 (+1), filled: 2/3 (66.67%), current contents: 1 BELUE + 1 Sausage"`
    );
  });
});
