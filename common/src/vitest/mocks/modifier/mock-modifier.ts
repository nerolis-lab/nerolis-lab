import type { Modifier, ModifierCondition, ConditionOperation } from '../../../types/modifier';
import type { ModifierTargetTypeDTO } from '../../../types/modifier/target-types';

export function mockModifier<T extends ModifierTargetTypeDTO = ModifierTargetTypeDTO>(
  attrs?: Partial<Modifier<T>>
): Modifier<T> {
  const base = {
    path: 'frequency',
    operation: '*' as const,
    value: 0.9
  };
  return {
    ...base,
    ...attrs
  } as Modifier<T>;
}

export function mockModifierCondition<T extends ModifierTargetTypeDTO = ModifierTargetTypeDTO>(
  attrs?: Partial<ModifierCondition<T>>
): ModifierCondition<T> {
  const base = {
    path: 'specialty',
    operation: '=' as ConditionOperation,
    value: 'berry'
  };
  return {
    ...base,
    ...attrs
  } as ModifierCondition<T>;
}

export function mockModifierWithCondition<T extends ModifierTargetTypeDTO = ModifierTargetTypeDTO>(
  attrs?: Partial<Modifier<T>>
): Modifier<T> {
  return mockModifier({
    condition: mockModifierCondition(),
    ...attrs
  });
}

// Backward compatibility aliases
export const modifier = mockModifier;
export const serializableModifier = mockModifier;
export const modifierCondition = mockModifierCondition;
