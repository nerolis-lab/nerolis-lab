export function rollToOutput<TSkillOutput extends string | number | symbol>(
  roll: number,
  probabilities: Record<TSkillOutput, number>
): TSkillOutput {
  const allOutputs: TSkillOutput[] = Object.keys(probabilities) as TSkillOutput[];

  if (allOutputs.length === 0) {
    throw new Error('No skill outputs provided');
  }

  let totalProbability = 0;
  for (const output of allOutputs) {
    totalProbability += probabilities[output];
  }

  let cumulativeProbability = 0;
  for (const output of allOutputs) {
    cumulativeProbability += probabilities[output];
    if (roll * totalProbability < cumulativeProbability) {
      return output;
    }
  }

  // In case of rounding issues, return some default value.
  return allOutputs[0];
}
