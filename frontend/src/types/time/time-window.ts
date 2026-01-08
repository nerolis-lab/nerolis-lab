export type TimeWindowDay = '8H' | '24H'
export type TimeWindowWeek = '8H' | '24H' | 'WEEK'

export function timeWindowFactor(timeWindow: TimeWindowWeek): number {
  switch (timeWindow) {
    case 'WEEK':
      return 7
    case '24H':
      return 1
    case '8H':
      return 1 / 3
    default:
      return 1
  }
}
