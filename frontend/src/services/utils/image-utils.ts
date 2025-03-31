import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import {
  CYAN,
  LAPIS,
  mainskill,
  POWER_PLANT,
  SNOWDROP,
  TAUPE,
  type Berry,
  type Island,
  type Pokemon
} from 'sleepapi-common'

export function mainskillImage(pokemon: Pokemon) {
  if (pokemon.skill.isSameOrModifiedVersion(mainskill.HELPER_BOOST)) {
    return `/images/type/${pokemon.berry.type}.png`
  } else {
    const maybeModifier =
      pokemon.skill.modifier.type === 'Base' ? '' : `${pokemon.skill.modifier.type.replace(/ /g, '_').toLowerCase()}_`
    return `/images/mainskill/${maybeModifier}${pokemon.skill.unit}.png`
  }
}

export function ingredientImage(rawName: string) {
  const name = rawName.toLowerCase()
  return name === 'magnet' ? '/images/ingredient/ingredients.png' : `/images/ingredient/${name}.png`
}

export function recipeImage(rawName: string) {
  const name = rawName.toLowerCase()
  return `/images/recipe/${name.replace(/[_]/g, '').toLowerCase()}.png`
}

export function userAvatar(): string {
  const userStore = useUserStore()
  const avatarStore = useAvatarStore()
  const avatarName = userStore.avatar ?? 'default'

  return avatarStore.getAvatarPath(avatarName)
}

export function pokemonImage(params: { pokemonName: string; shiny: boolean }) {
  const { pokemonName, shiny } = params
  return `/images/pokemon/${pokemonName.toLowerCase()}${shiny ? '_shiny' : ''}.png`
}

export function avatarImage(params: { pokemonName: string; shiny: boolean; happy: boolean }) {
  const { pokemonName, shiny, happy } = params
  return `/images/avatar/${happy ? 'happy' : 'portrait'}/${pokemonName.toLowerCase()}${happy ? '_happy' : ''}${shiny ? '_shiny' : ''}.png`
}

export function berryImage(berry: Berry) {
  return `/images/berries/${berry.name.toLowerCase()}.png`
}

export function islandImage(params: { favoredBerries?: Berry[]; background?: boolean; island?: Island }) {
  const { favoredBerries, background = false, island: directIsland } = params
  const maybeBackground = background ? 'background-' : ''

  if (directIsland) {
    return `/images/island/${maybeBackground}${directIsland.shortName}.png`
  }

  if (!favoredBerries || favoredBerries.length === 0) {
    return `/images/island/${maybeBackground}greengrass.png`
  }

  const berryNames = favoredBerries.map((b) => b.name)
  const arraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((value, index) => value === arr2[index])
  }

  const cyanKey = `/images/island/${maybeBackground}cyan.png`
  const taupeKey = `/images/island/${maybeBackground}taupe.png`
  const snowdropKey = `/images/island/${maybeBackground}snowdrop.png`
  const lapisKey = `/images/island/${maybeBackground}lapis.png`
  const powerplantKey = `/images/island/${maybeBackground}powerplant.png`

  const berryImageMap = {
    [cyanKey]: CYAN.berries,
    [taupeKey]: TAUPE.berries,
    [snowdropKey]: SNOWDROP.berries,
    [lapisKey]: LAPIS.berries,
    [powerplantKey]: POWER_PLANT.berries
  }

  for (const [imagePath, islandberries] of Object.entries(berryImageMap)) {
    const berryArrayNames = islandberries.map((b) => b.name)
    if (arraysEqual(berryNames, berryArrayNames)) {
      return imagePath
    }
  }

  return `/images/island/${maybeBackground}greengrass.png`
}
