import {
  BASE_FAVORED_BERRY_MULTIPLIER,
  EXPERT_MODE_BERRY_BONUS_MULTIPLIER,
  type IslandShortName
} from 'sleepapi-common'

export interface IslandEffect {
  image?: string
  icon?: string
  value: string
  valueClass: string
  text: string
}

export interface ExpertIslandEffectConfig {
  mainFavoriteExtraEffects: IslandEffect[]
  unfavoredExtraEffects: IslandEffect[]
}

export const EXPERT_ISLAND_EFFECTS: Partial<Record<IslandShortName, ExpertIslandEffectConfig>> = {
  GGEX: {
    mainFavoriteExtraEffects: [expertMainFasterHelps('10%')],
    unfavoredExtraEffects: [expertUnfavoredSlowerHelps('15%')]
  },
  CBEX: {
    mainFavoriteExtraEffects: [
      expertMainFasterHelps('20%'),
      {
        icon: 'mdi-bag-personal-outline',
        value: '+5',
        valueClass: 'text-help',
        text: 'carry size'
      }
    ],
    unfavoredExtraEffects: [expertUnfavoredSlowerHelps('35%')]
  }
}

export const baseFavoriteBerryEffect: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${BASE_FAVORED_BERRY_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'berry power'
}

export const expertMainFavoriteSkillLevel: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: '+1',
  valueClass: 'text-skill',
  text: 'main skill level'
}

export const expertIngredientBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1',
  valueClass: 'text-ingredient',
  text: 'ingredient per ingredient help'
}

export const expertIngredientSpecialtyBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1-2',
  valueClass: 'text-ingredient',
  text: 'ingredients per ingredient help'
}

export const expertBerryBonus: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${EXPERT_MODE_BERRY_BONUS_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'favored berry power'
}

export const expertSkillChanceBonus: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: '1.25x',
  valueClass: 'text-skill',
  text: 'main skill chance'
}

function expertMainFasterHelps(helpIncrease: string): IslandEffect {
  return {
    image: '/images/mainskill/helps.png',
    value: helpIncrease,
    valueClass: 'text-help',
    text: 'faster helps'
  }
}

function expertUnfavoredSlowerHelps(helpDecrease: string): IslandEffect {
  return {
    image: '/images/mainskill/helps.png',
    value: helpDecrease,
    valueClass: 'text-help',
    text: 'slower helps'
  }
}
