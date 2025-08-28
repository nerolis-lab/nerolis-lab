import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { HelperBoost, type Berry, type Island, type Pokemon } from 'sleepapi-common'

export function mainskillImage(pokemon: Pokemon) {
  if (pokemon.skill.is(HelperBoost)) {
    return `/images/type/${pokemon.berry.type}.png`
  } else {
    return `/images/mainskill/${pokemon.skill.image}.png`
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

export function islandImage(params: { island: Island; background?: boolean }) {
  const { background = false, island } = params
  const maybeBackground = background ? 'background-' : ''

  return `/images/island/${maybeBackground}${island.shortName}.png`
}
