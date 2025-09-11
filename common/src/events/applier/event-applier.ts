import type { PathKeys } from '../../types';
import type { ExternalCondition, Modifier, ModifierComplexValue } from '../../types/modifier/modifier';
import { isPathReference } from '../../types/modifier/path-reference';
import type { ModifierTargetType } from '../../types/modifier/target-types';

class EventApplierImpl {
  /**
   * Applies modifiers from an event to a target object
   * Only applies modifiers that match the target type
   */
  applyModifiers<T extends ModifierTargetType>(target: T, modifiers: Modifier<ModifierTargetType>[]): T {
    let result = target;

    for (const modifier of modifiers) {
      // Check if modifier type matches target type
      if (!this.isMatchingType(target, modifier)) {
        continue;
      }

      // Check if conditions are met
      if (!this.checkConditions(result, modifier)) {
        continue;
      }

      // Apply the modifier
      result = this.applyModifier(result, modifier);
    }

    return result;
  }

  /**
   * Checks if the modifier type matches the target type
   * Uses path-based validation - if the leftValue path exists on the target, the types are compatible
   */
  private isMatchingType<T extends ModifierTargetType>(target: T, modifier: Modifier<ModifierTargetType>): boolean {
    // Try to access the leftValue path on the target
    // If it exists and is not undefined, the modifier is applicable to this target type
    try {
      const value = this.getValueAtPath(target, modifier.leftValue as string);
      return value !== undefined;
    } catch {
      // If path access fails, the modifier doesn't apply to this target type
      return false;
    }
  }

  /**
   * Checks if all conditions for a modifier are met
   */
  private checkConditions<T extends ModifierTargetType>(target: T, modifier: Modifier<ModifierTargetType>): boolean {
    if (modifier.conditions) {
      for (const condition of modifier.conditions) {
        if (!this.checkCondition(target, condition)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Checks if a single condition is met
   */
  private checkCondition<T extends ModifierTargetType>(
    target: T,
    condition: { leftValue: string; operation: string; rightValue: unknown } | ExternalCondition
  ): boolean {
    // Handle external conditions
    if (this.isExternalCondition(condition)) {
      return this.checkExternalCondition(condition);
    }

    // Handle target conditions (existing logic)
    const targetCondition = condition as { leftValue: string; operation: string; rightValue: unknown };
    const targetValue = this.getValueAtPath(target, targetCondition.leftValue as string);
    const conditionValue = this.resolveConditionValue(target, targetCondition.rightValue);

    return this.evaluateConditionOperation(targetValue, targetCondition.operation, conditionValue);
  }

  /**
   * Checks if an external condition is met
   */
  private checkExternalCondition(condition: ExternalCondition): boolean {
    const leftValue = condition.leftValue;
    const rightValue = condition.rightValue;

    return this.evaluateConditionOperation(leftValue, condition.operation, rightValue);
  }

  /**
   * Evaluates a condition operation
   */
  private evaluateConditionOperation(targetValue: unknown, operation: string, conditionValue: unknown): boolean {
    switch (operation) {
      case '=':
        return targetValue === conditionValue;
      case '!=':
        return targetValue !== conditionValue;
      case '>':
        return Number(targetValue) > Number(conditionValue);
      case '<':
        return Number(targetValue) < Number(conditionValue);
      case '>=':
        return Number(targetValue) >= Number(conditionValue);
      case '<=':
        return Number(targetValue) <= Number(conditionValue);
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(targetValue);
      case 'not-in':
        return Array.isArray(conditionValue) && !conditionValue.includes(targetValue);
      default:
        return false;
    }
  }

  /**
   * Resolves a condition value, which can be either a literal value or a PathReference
   */
  private resolveConditionValue<T extends ModifierTargetType>(target: T, value: unknown): unknown {
    return this.resolveModifierValue(target, value);
  }

  /**
   * Type guard to check if a modifier value is a complex value with constraints
   */
  private isComplexModifierValue<T extends ModifierTargetType>(
    value: unknown
  ): value is ModifierComplexValue<T, PathKeys<T>> {
    return typeof value === 'object' && value !== null && 'rightValue' in value;
  }

  /**
   * Type guard to check if a condition is an external condition
   */
  private isExternalCondition(condition: unknown): condition is ExternalCondition {
    return (
      typeof condition === 'object' &&
      condition !== null &&
      'leftValue' in condition &&
      'rightValue' in condition &&
      'operation' in condition &&
      // External conditions have direct values, target conditions have string paths
      typeof condition.leftValue !== 'string'
    );
  }

  /**
   * Applies a single modifier to the target
   */
  private applyModifier<T extends ModifierTargetType>(target: T, modifier: Modifier<ModifierTargetType>): T {
    const currentValue = this.getValueAtPath(target, modifier.leftValue as string);
    let newValue: unknown;

    // Check if value is a complex modifier with constraints (has rightValue property)
    if (this.isComplexModifierValue(modifier.rightValue)) {
      const complexValue = modifier.rightValue;

      // Handle operations with optional min/max constraints using top-level operation
      const operationValue = this.resolveModifierValue(target, complexValue.rightValue);

      // Apply the base operation from the top-level modifier
      let result: number;
      switch (modifier.operation) {
        case '+':
          result = Number(currentValue) + Number(operationValue);
          break;
        case '-':
          result = Number(currentValue) - Number(operationValue);
          break;
        case '*':
          result = Number(currentValue) * Number(operationValue);
          break;
        case '/':
          result = Number(currentValue) / Number(operationValue);
          break;
        case '=':
          result = Number(operationValue);
          break;
        default:
          result = Number(currentValue);
      }

      // Apply min constraint if present
      if (complexValue.min !== undefined) {
        const minValue = this.resolveModifierValue(target, complexValue.min);
        result = Math.max(result, Number(minValue));
      }

      // Apply max constraint if present
      if (complexValue.max !== undefined) {
        const maxValue = this.resolveModifierValue(target, complexValue.max);
        result = Math.min(result, Number(maxValue));
      }

      newValue = result;
    } else {
      // Handle simple values or PathReferences
      const resolvedValue = this.resolveModifierValue(target, modifier.rightValue);

      switch (modifier.operation) {
        case '+':
          newValue = Number(currentValue) + Number(resolvedValue);
          break;
        case '-':
          newValue = Number(currentValue) - Number(resolvedValue);
          break;
        case '*':
          newValue = Number(currentValue) * Number(resolvedValue);
          break;
        case '/':
          newValue = Number(currentValue) / Number(resolvedValue);
          break;
        case '=':
          newValue = resolvedValue;
          break;
        default:
          return target;
      }
    }

    return this.setValueAtPath(target, modifier.leftValue as string, newValue);
  }

  /**
   * Resolves a modifier value, which can be either a literal value or a PathReference
   */
  private resolveModifierValue<T extends ModifierTargetType>(target: T, value: unknown): unknown {
    // If it's a PathReference, resolve it to the actual value
    if (isPathReference(value)) {
      return this.getValueAtPath(target, value.path);
    }

    // Otherwise, it's a literal value
    return value;
  }

  /**
   * Gets value at a path like 'pokemon.frequency' or 'frequency'
   */
  private getValueAtPath(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array access
      if (part.includes('[') && part.includes(']')) {
        const [arrayName, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        const currentObj = current as Record<string, unknown>;
        const array = currentObj[arrayName] as unknown[];
        current = array?.[index];
      } else {
        const currentObj = current as Record<string, unknown>;
        current = currentObj[part];
      }
    }

    return current;
  }

  /**
   * Sets value at a path like 'pokemon.frequency' or 'frequency'
   * Uses object spread to maintain immutability without JSON serialization
   */
  private setValueAtPath<T>(obj: T, path: string, value: unknown): T {
    const parts = path.split('.');

    if (parts.length === 1) {
      // Simple case: single property
      return { ...obj, [parts[0]]: value };
    }

    // Nested case: need to recursively update
    const [firstPart, ...restPath] = parts;
    const restPathStr = restPath.join('.');

    const objAsRecord = obj as Record<string, unknown>;
    return {
      ...obj,
      [firstPart]: this.setValueAtPath(objAsRecord[firstPart], restPathStr, value)
    };
  }
}

export const EventApplier = new EventApplierImpl();
