import type { Recipe } from 'sleepapi-common'

export type UserRecipe = Recipe & { level: number; userStrength: number }
