import { describe, expect, it } from 'vitest';
import { CookingAdvanceS } from './cooking-advance-s';
import { CookingAdvanceSMysticalFire } from './cooking-advance-s-mystical-fire';

describe('CookingAdvanceSMysticalFire', () => {
  it('should have modified name format', () => {
    expect(CookingAdvanceSMysticalFire.name).toBe('Mystical Fire (Cooking Advance S)');
    expect(CookingAdvanceSMysticalFire.modifierName).toBe('Mystical Fire');
    expect(CookingAdvanceSMysticalFire.baseSkill).toBe(CookingAdvanceS);
  });

  it('should have correct basic properties', () => {
    expect(CookingAdvanceSMysticalFire.description({ skillLevel: 1 })).toBe(
      'Gives your pot room for 7 more ingredients next time you cook. Also raises your Extra Tasty rate by 1%. The effect lasts until you cook an Extra Tasty dish or change sites.'
    );
    expect(CookingAdvanceSMysticalFire.maxLevel).toBe(7);
  });

  it('should have specific RP values', () => {
    expect(CookingAdvanceSMysticalFire.getRPValue(1)).toBe(1144);
    expect(CookingAdvanceSMysticalFire.getRPValue(4)).toBe(3098);
    expect(CookingAdvanceSMysticalFire.getRPValue(7)).toBe(7596);
  });

  it('should have pot size and tasty chance activations', () => {
    expect(CookingAdvanceSMysticalFire.activations).toHaveProperty('potSize');
    expect(CookingAdvanceSMysticalFire.activations.potSize.unit).toBe('pot size');
    expect(typeof CookingAdvanceSMysticalFire.activations.potSize.amount).toBe('function');

    expect(CookingAdvanceSMysticalFire.activations).toHaveProperty('critChance');
    expect(CookingAdvanceSMysticalFire.activations.critChance.unit).toBe('crit chance');
    expect(typeof CookingAdvanceSMysticalFire.activations.critChance.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    expect(CookingAdvanceSMysticalFire.activations.potSize.amount({ skillLevel: 1 })).toBe(7);
    expect(CookingAdvanceSMysticalFire.activations.potSize.amount({ skillLevel: 4 })).toBe(17);
    expect(CookingAdvanceSMysticalFire.activations.potSize.amount({ skillLevel: 7 })).toBe(31);

    expect(CookingAdvanceSMysticalFire.activations.critChance.amount({ skillLevel: 1 })).toBe(1);
    expect(CookingAdvanceSMysticalFire.activations.critChance.amount({ skillLevel: 4 })).toBe(3);
    expect(CookingAdvanceSMysticalFire.activations.critChance.amount({ skillLevel: 7 })).toBe(5);
  });

  it('should have both units', () => {
    expect(CookingAdvanceSMysticalFire.hasUnit('pot size')).toBe(true);
    expect(CookingAdvanceSMysticalFire.hasUnit('crit chance')).toBe(true);
    expect(CookingAdvanceSMysticalFire.hasUnit('energy')).toBe(false);
  });
});
