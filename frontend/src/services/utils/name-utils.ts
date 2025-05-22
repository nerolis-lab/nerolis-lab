import { useUserStore } from '@/stores/user-store'
import { faker } from '@faker-js/faker/locale/en'
import type { Pokemon, PokemonGender } from 'sleepapi-common' // Assuming 'Pokemon' is the correct type

export function randomName(pokemon: Pokemon, maxLength: number, gender: PokemonGender): string {
  const userStore = useUserStore()

  if (!userStore.useRandomName) {
    return pokemon.displayName.slice(0, maxLength)
  }

  let name = faker.person.firstName(gender)
  while (name.length > maxLength) {
    name = faker.person.firstName(gender)
  }
  return name
}
