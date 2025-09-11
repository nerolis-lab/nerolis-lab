import { describe, expect, it } from 'vitest';
import { memberStrength } from '../../vitest/mocks/events/mock-member-strength';
import { pokemonInstanceExt } from '../../vitest/mocks/pokemon/mock-pokemon-instance';
import type { ModifierTargetType, ModifierTargetTypeDTO, TargetTypeMap } from './target-types';

describe('TargetTypeMap', () => {
  it('should map the correct type', () => {
    const pokemonInstance: TargetTypeMap['PokemonInstance'] = pokemonInstanceExt();

    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe Pokemon object
    pokemonInstance.invalid;

    // Check that we get a proper Pokemon object with expected properties
    expect(typeof pokemonInstance).toBe('object');
    expect(typeof pokemonInstance.name).toBe('string');
    expect(typeof pokemonInstance.pokemon.displayName).toBe('string');
    expect(typeof pokemonInstance.pokemon.pokedexNumber).toBe('number');
    expect(typeof pokemonInstance.pokemon.specialty).toBe('string');
    expect(typeof pokemonInstance.pokemon.frequency).toBe('number');
  });
});

describe('ModifierTargetType', () => {
  it('should be a union of all target types', () => {
    const pokemonInstance: ModifierTargetType = pokemonInstanceExt();
    const strength: ModifierTargetType = memberStrength();

    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe PokemonInstanceExt object
    pokemonInstance.invalid;
    // @ts-expect-error - invalid property, asserts that we indeed get a type-safe MemberStrength object
    strength.invalid;

    // @ts-expect-error - invalid target type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalid: ModifierTargetType = 'not a valid target type';

    expect(typeof pokemonInstance).toBe('object');
    expect(typeof strength).toBe('object');
  });
});

describe('ModifierTargetTypeDTO', () => {
  it('should be a union of all target types', () => {
    const pokemonInstance: ModifierTargetTypeDTO = 'PokemonInstance';
    const memberStrength: ModifierTargetTypeDTO = 'MemberStrength';

    // @ts-expect-error - invalid target type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalid: ModifierTargetTypeDTO = 'not a valid target type';

    expect(pokemonInstance).toBe('PokemonInstance');
    expect(memberStrength).toBe('MemberStrength');
  });
});
