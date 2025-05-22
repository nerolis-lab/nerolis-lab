import { randomName } from '@/services/utils/name-utils'
import { faker } from '@faker-js/faker/locale/en'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@faker-js/faker/locale/en', () => {
  return {
    faker: {
      person: {
        firstName: vi.fn()
      }
    }
  }
})

describe('randomName', () => {
  it('returns a name within the specified max length', () => {
    const maxLength = 5

    faker.person.firstName = vi
      .fn()
      .mockReturnValueOnce('Alex')
      .mockReturnValueOnce('Alexander')
      .mockReturnValueOnce('Jane')

    const pikachu = COMPLETE_POKEDEX.find((p) => p.name === 'pikachu')!
    const alex = randomName(pikachu, maxLength, undefined)
    const jane = randomName(pikachu, maxLength, undefined)
    expect(alex).toBe('Alex')
    expect(jane).toBe('Jane')
  })

  it('returns a valid name when maxLength is very large', () => {
    const maxLength = 100

    faker.person.firstName = vi.fn().mockReturnValue('Alexander')

    const pikachu = COMPLETE_POKEDEX.find((p) => p.name === 'pikachu')!
    const name = randomName(pikachu, maxLength, undefined)
    expect(name).toBe('Alexander')
  })

  it('shall call faker with gender', () => {
    faker.person.firstName = vi.fn().mockReturnValue('Louis')

    const pikachu = COMPLETE_POKEDEX.find((p) => p.name === 'pikachu')!
    randomName(pikachu, 12, 'female')
    expect(faker.person.firstName).toHaveBeenLastCalledWith('female')
  })
})
