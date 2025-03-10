import { GREENGRASS, ISLANDS, type Berry, type Island } from 'sleepapi-common'

export function getIsland(favoredBerries: Berry[]): Island {
  if (favoredBerries.length === 0) {
    return GREENGRASS
  }

  const berryNames = favoredBerries.map((b) => b.name)
  const containsAll = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((value) => arr2.includes(value))
  }

  for (const islnd of ISLANDS) {
    const islandBerryNames = islnd.berries.map((b) => b.name)
    if (containsAll(islandBerryNames, berryNames)) {
      return islnd
    }
  }

  return GREENGRASS
}
