import { existsSync } from 'fs'
import path from 'path'
import { COMPLETE_POKEDEX, type Pokedex } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

function checkMissingImages(pokedex: Pokedex, imageTypeSuffix: string, folderPath: string): string[] {
  const imagesFolderPath = path.join(__dirname, folderPath)
  const missingImages: string[] = []

  pokedex.forEach((poke) => {
    const imageName = `${poke.name.toLowerCase()}${imageTypeSuffix}.png`
    const imagePath = path.join(imagesFolderPath, imageName)

    if (!existsSync(imagePath)) {
      missingImages.push(imageName)
    }
  })

  return missingImages
}

const shinyPokedex = COMPLETE_POKEDEX.filter((mon) => !mon.shinyLocked)

describe('Pokémon images check', () => {
  it('should have a standard image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(COMPLETE_POKEDEX, '', '../../public/images/pokemon')
    expect(missingImages).toEqual([])
  })

  it('should have a shiny image for each non-shiny-locked Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(shinyPokedex, '_shiny', '../../public/images/pokemon')
    expect(missingImages).toEqual([])
  })

  it('should have a portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(COMPLETE_POKEDEX, '', '../../public/images/avatar/portrait')
    expect(missingImages).toEqual([])
  })

  it('should have a shiny portrait image for each non-shiny-locked Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(shinyPokedex, '_shiny', '../../public/images/avatar/portrait')
    expect(missingImages).toEqual([])
  })

  it('should have a happy portrait image for each Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(COMPLETE_POKEDEX, '_happy', '../../public/images/avatar/happy')
    expect(missingImages).toEqual([])
  })

  it('should have a happy shiny portrait image for each non-shiny-locked Pokémon in the COMPLETE_POKEDEX', () => {
    const missingImages = checkMissingImages(shinyPokedex, '_happy_shiny', '../../public/images/avatar/happy')
    expect(missingImages).toEqual([])
  })
})
