export interface IngredientDistribution {
  name: string
  average: number
  median: number
  firstQuartile: number
  thirdQuartile: number
  standardDeviation: number
  values: { amount: number; probability: number }[]
}

export function summarizeIngredient(name: string, distribution: Record<number, number>): IngredientDistribution {
  const entries = Object.entries(distribution)
    .map(([amount, weight]) => ({ amount: Number(amount), weight }))
    .filter(({ amount, weight }) => Number.isFinite(amount) && Number.isFinite(weight) && weight > 0)
    .sort((a, b) => a.amount - b.amount)
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  const values = entries.map(({ amount, weight }) => ({ amount, probability: weight / total }))
  const average = values.reduce((sum, value) => sum + value.amount * value.probability, 0)
  const variance = values.reduce((sum, value) => sum + (value.amount - average) ** 2 * value.probability, 0)
  function quantile(fraction: number) {
    let cumulative = 0
    for (const [index, value] of values.entries()) {
      cumulative += value.probability
      if (Math.abs(cumulative - fraction) < 1e-9) {
        return (value.amount + (values[index + 1]?.amount ?? value.amount)) / 2
      }
      if (cumulative > fraction) return value.amount
    }
    return values.at(-1)?.amount ?? 0
  }
  return {
    name,
    average,
    median: quantile(0.5),
    firstQuartile: quantile(0.25),
    thirdQuartile: quantile(0.75),
    standardDeviation: Math.sqrt(variance),
    values
  }
}

/** Reflected Gaussian smoothing keeps ingredient density on the nonnegative axis. */
export function ingredientCurve(distribution: IngredientDistribution, upperBound: number) {
  const bandwidth = Math.max(0.5, distribution.standardDeviation * 0.18)
  const gaussian = (distance: number) => Math.exp(-0.5 * (distance / bandwidth) ** 2)
  return Array.from({ length: 241 }, (_, index) => {
    const x = (index / 240) * upperBound
    const y =
      distribution.values.reduce(
        (sum, { amount, probability }) => sum + probability * (gaussian(x - amount) + gaussian(x + amount)),
        0
      ) /
      (bandwidth * Math.sqrt(2 * Math.PI))
    return { x, y }
  })
}

// Ingredient hues with the skill chart's balanced saturation/lightness and 20% fill opacity.
const ingredientHues: Record<string, number> = {
  Apple: 355,
  Milk: 210,
  Soybean: 75,
  Honey: 45,
  Sausage: 15,
  Ginger: 30,
  Tomato: 0,
  Egg: 55,
  Oil: 85,
  Cacao: 25,
  Mushroom: 280,
  Potato: 40,
  Herb: 140,
  Corn: 60,
  Leek: 110,
  Tail: 325,
  Coffee: 20,
  Avocado: 100,
  Pumpkin: 35
}
export function ingredientColor(name: string) {
  const hue = ingredientHues[name] ?? 250
  // Convert to hex so line + `${color}33` follows the skill chart exactly.
  const saturation = 0.81
  const lightness = 0.67
  const a = saturation * Math.min(lightness, 1 - lightness)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    return Math.round(255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function ingredientUpperBound(distributions: IngredientDistribution[]) {
  return Math.max(
    10,
    Math.ceil(
      Math.max(0, ...distributions.map(({ average, standardDeviation }) => average + 3 * standardDeviation)) / 10
    ) * 10
  )
}
