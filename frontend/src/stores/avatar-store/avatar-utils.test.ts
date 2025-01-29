import { findPokemon } from '@/stores/avatar-store/avatar-utils'
import { BULBASAUR, EEVEE_HOLIDAY } from 'sleepapi-common'

describe('AvatarUtils', () => {
  describe('findPokemon', () => {
    it('should return the pokemon with the given name', () => {
      const pokemon = findPokemon('bulbasaur')
      expect(pokemon).toEqual(BULBASAUR)
    })

    it('should remove happy', () => {
      const pokemon = findPokemon('bulbasaur_happy')
      expect(pokemon).toEqual(BULBASAUR)
    })

    it('should remove shiny', () => {
      const pokemon = findPokemon('bulbasaur_shiny')
      expect(pokemon).toEqual(BULBASAUR)
    })

    it('should remove happy_shiny', () => {
      const pokemon = findPokemon('bulbasaur_shiny')
      expect(pokemon).toEqual(BULBASAUR)
    })

    it('should support names with underscores', () => {
      const pokemon = findPokemon('eevee_holiday')
      expect(pokemon).toEqual(EEVEE_HOLIDAY)
    })
  })
})
