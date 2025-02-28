type NumericCollection = ArrayLike<number> & Iterable<number>;

export function calculateDistribution(data: NumericCollection): Record<number, number> {
  if (data.length === 0) {
    return {};
  }
  const total = data.length;

  const maxNumber = Math.max(...data);
  const counts = new Array(maxNumber + 1).fill(0);

  for (const num of data) {
    counts[num]++;
  }

  const distribution: Record<number, number> = {};
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > 0) {
      distribution[i] = parseFloat(((counts[i] / total) * 100).toFixed(2));
    }
  }

  return distribution;
}
