import { mocks } from '@src/bun/index.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { capitalize, mainskill, MAINSKILLS, METRONOME_SKILLS } from 'sleepapi-common';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SkillState', () => {
  let mockMemberState: MemberState;
  let skillState: SkillState;

  beforeEach(() => {
    mockMemberState = mocks.memberState();
    skillState = mocks.skillState(mockMemberState);
  });

  it('should initialize skill effects map', () => {
    expect(skillState.skillEffects).toHaveLength(MAINSKILLS.length);
  });

  it('should instantiate pityProcThreshold', () => {
    expect(skillState['pityProcThreshold']).toBeGreaterThan(0);
  });

  it("should guarantee skill activation if we're past the pity threshold", () => {
    skillState['memberState'].member.pokemonWithIngredients.pokemon.skill = mainskill.BERRY_BURST;
    skillState['helpsSinceLastSkillProc'] = skillState['pityProcThreshold'];
    const activation1 = skillState.attemptSkill();
    const activation2 = skillState.attemptSkill();
    expect([activation1, activation2]).toHaveLength(2);
  });

  it('should activate skill if roll is successful', () => {
    skillState['memberState'].member.pokemonWithIngredients.pokemon.skill = mainskill.BERRY_BURST;
    skillState['memberState'].member.pokemonWithIngredients.pokemon.skillPercentage = 100;
    skillState['helpsSinceLastSkillProc'] = skillState['pityProcThreshold'] - 1; // ensure we dont hit pity threshold
    const activation1 = skillState.attemptSkill();
    const activation2 = skillState.attemptSkill();
    expect([activation1, activation2]).toHaveLength(2);
  });

  it('should add value correctly', () => {
    const value = { regular: 10, crit: 5 };
    skillState.addValue(value);
    expect(skillState['regularValue']).toBe(10);
    expect(skillState['critValue']).toBe(5);
  });

  it('should return correct results', () => {
    const iterations = 100;
    const regularValue = 100;
    const critValue = 20;
    const skillProcs = 10;
    const skillCrits = 2;

    skillState['regularValue'] = regularValue;
    skillState['critValue'] = critValue;
    skillState['skillProcs'] = skillProcs;
    skillState['skillCrits'] = skillCrits;

    const results = skillState.results(iterations);
    expect(results.skillAmount).toBe((regularValue + critValue) / iterations);
    expect(results.skillProcs).toBe(skillProcs / iterations);
    expect(results.skillCrits).toBe(skillCrits / iterations);
    expect(results.skillRegularValue).toBe(regularValue / iterations);
    expect(results.skillCritValue).toBe(critValue / iterations);
  });

  it('should activate skill correctly', () => {
    const skill = mainskill.BERRY_BURST;
    const activation = skillState['activateSkill'](skill);
    expect(activation).toBeDefined();
    expect(skillState['skillProcs']).toBe(1);
  });

  it('should throw error for unimplemented skill effect', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skill = { name: 'UNIMPLEMENTED_SKILL' } as any;
    expect(() => skillState['activateSkill'](skill)).toThrow(
      'No SkillEffect implemented for skill: UNIMPLEMENTED_SKILL'
    );
  });

  it('should return correct skill', () => {
    expect(skillState.skill).toBe(mockMemberState.member.pokemonWithIngredients.pokemon.skill);
  });

  it('should return correct skill level', () => {
    expect(skillState.skillLevel).toBe(mockMemberState.member.settings.skillLevel);
  });

  it('should return correct skill percentage', () => {
    expect(skillState.skillPercentage).toBe(mockMemberState.member.pokemonWithIngredients.pokemon.skillPercentage);
  });

  it('should return correct skill amount', () => {
    const skill = mainskill.BERRY_BURST;
    const skillAmount = skillState.skillAmount(skill);
    expect(skillAmount).toBe(skill.amount(mockMemberState.member.settings.skillLevel) / skillState.metronomeFactor);
  });

  it('should return correct metronome factor', () => {
    mockMemberState.member.pokemonWithIngredients.pokemon.skill = mainskill.METRONOME;
    expect(skillState.metronomeFactor).toBe(METRONOME_SKILLS.length);
    mockMemberState.member.pokemonWithIngredients.pokemon.skill = mainskill.BERRY_BURST;
    expect(skillState.metronomeFactor).toBe(1);
  });

  it('should initialize skillEffects map with all mainskills', () => {
    const skillEffects = skillState['skillEffects'];

    skillEffects.forEach((effect, mainskill) => {
      expect(skillEffects.has(mainskill)).toBe(true);
      expect(effect).toBeDefined();

      const skillName = mainskill.name;
      let expectedEffectName: string;

      if (mainskill.isModified) {
        const [modifier, baseName] = skillName.split('(');
        const cleanBaseName = baseName.replace(')', '').trim();
        const cleanModifier = modifier.trim();

        expectedEffectName =
          cleanBaseName.split(/[- ]/g).map(capitalize).join('') +
          cleanModifier.split(/[- ]/g).map(capitalize).join('') +
          'Effect';
      } else {
        expectedEffectName = skillName.split(/[- ]/g).map(capitalize).join('') + 'Effect';
      }

      expect(effect.constructor.name).toBe(expectedEffectName);
    });
  });
});
