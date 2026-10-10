type NumericCollection = ArrayLike<number> & Iterable<number>;

export function calculateDistribution(data: NumericCollection): Record<number, number> {
  const counts = new Map<number, number>();
  for (const value of data) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Object.fromEntries(
    [...counts]
      .sort(([a], [b]) => a - b)
      .map(([value, count]) => [value, Number(((count / data.length) * 100).toFixed(2))])
  );
}
