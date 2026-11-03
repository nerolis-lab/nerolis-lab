import { describe, expect, it } from 'vitest';
import { CookingAdvanceSMysticalFire } from './cooking-advance-s-mystical-fire';

describe('CookingAdvanceSMysticalFire', () => {
  it('should have modified name format', () => {
    expect(CookingAdvanceSMysticalFire.name).toBe('Mystical Fire (Cooking Advance S)');
  });

  it('should have correct basic properties', () => {
    expect(CookingAdvanceSMysticalFire.description({ skillLevel: 1 })).toBe(
      'Gives your pot room for 7 more ingredients the next time you cook. Also raises your Extra Tasty rate by 1%.'
    );
    expect(CookingAdvanceSMysticalFire.maxLevel).toBe(7);
  });

  it('should have pot size and tasty chance activations', () => {
    expect(CookingAdvanceSMysticalFire.activations).toHaveProperty('potSize');
    expect(CookingAdvanceSMysticalFire.activations.potSize.unit).toBe('pot size');
    expect(typeof CookingAdvanceSMysticalFire.activations.potSize.amount).toBe('function');

    expect(CookingAdvanceSMysticalFire.activations).toHaveProperty('tastyChance');
    expect(CookingAdvanceSMysticalFire.activations.tastyChance.unit).toBe('crit chance');
    expect(typeof CookingAdvanceSMysticalFire.activations.tastyChance.amount).toBe('function');
  });

  it('should have both units', () => {
    expect(CookingAdvanceSMysticalFire.hasUnit('pot size')).toBe(true);
    expect(CookingAdvanceSMysticalFire.hasUnit('crit chance')).toBe(true);
    expect(CookingAdvanceSMysticalFire.hasUnit('energy')).toBe(false);
  });
});
