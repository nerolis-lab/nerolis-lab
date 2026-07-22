<template>
  <v-row class="flex-center px-2">
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Island Impact </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <v-row class="flex-left px-2 flex-nowrap" dense>
    <v-col cols="auto" class="flex-center">
      <v-img :src="berryImage(memberBerry)" alt="" height="40" width="40" />
    </v-col>
    <v-col class="flex-column status-col">
      <span class="text-berry text-no-wrap">{{ statusLabel }}</span>
      <div class="effect-list">
        <div v-for="effect in effects" :key="effect.text" class="flex-left">
          <v-img class="mr-1" :src="effect.image" alt="" height="28" width="28" />
          <span class="text-no-wrap">
            <span :class="[effect.valueClass, 'text-no-wrap']">{{ effect.value }}</span> {{ effect.text }}
          </span>
        </div>
      </div>
    </v-col>
  </v-row>

  <v-row class="flex-left px-2 flex-nowrap" dense>
    <v-col cols="auto" class="flex-center">
      <v-img src="/images/misc/strength.png" alt="" height="40" width="40" />
    </v-col>
    <v-col class="flex-column status-col">
      <span class="text-strength text-no-wrap">{{ island.name }}</span>
      <div class="effect-list">
        <div class="flex-left">
          <span class="text-no-wrap">
            <span class="text-strength text-no-wrap">{{ areaBonus }}%</span> area bonus
          </span>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { berryImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import {
  BASE_FAVORED_BERRY_MULTIPLIER,
  capitalize,
  EXPERT_MODE_BERRY_BONUS_MULTIPLIER,
  type IslandInstance,
  type PokemonInstanceExt
} from 'sleepapi-common'
import { computed } from 'vue'

interface IslandEffect {
  image: string
  value: string
  valueClass: string
  text: string
}

const props = defineProps<{
  member: PokemonInstanceExt
  island: IslandInstance
  effectiveSkillLevel: number
}>()

const userStore = useUserStore()

const expertMode = computed(() => (props.island.expert ? props.island.expertMode : undefined))

const memberBerry = computed(() => props.member.pokemon.berry)

const isMainFavorite = computed(() => expertMode.value?.mainFavoriteBerry.name === memberBerry.value.name)

const isSubFavorite = computed(
  () => expertMode.value?.subFavoriteBerries.some((b) => b.name === memberBerry.value.name) === true
)

const isBaseFavorite = computed(
  () => !props.island.expert && props.island.berries.some((b) => b.name === memberBerry.value.name)
)

const isFavored = computed(() => isMainFavorite.value || isSubFavorite.value)

const areaBonus = computed(() => Math.round((userStore.islandBonus(props.island.shortName) - 1) * 100))

const statusLabel = computed(() => {
  const berryName = capitalize(memberBerry.value.name)
  if (isMainFavorite.value) {
    return `${berryName} is the main favorite berry`
  }
  if (isSubFavorite.value) {
    return `${berryName} is a sub-favorite berry`
  }
  if (isBaseFavorite.value) {
    return `${berryName} is a favorite berry`
  }
  if (props.island.expert && !expertMode.value) {
    return 'No favorite berries selected'
  }
  return `${berryName} is not favored`
})

const baseFavoriteBerryEffect: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${BASE_FAVORED_BERRY_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'berry power'
}

const expertMainFavoriteFasterHelps: IslandEffect = {
  image: '/images/mainskill/helps.png',
  value: '10%',
  valueClass: 'text-help',
  text: 'faster helps'
}

const expertMainFavoriteSkillLevel: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: '+1',
  valueClass: 'text-skill',
  text: 'main skill level'
}

const expertUnfavoredSlowerHelps: IslandEffect = {
  image: '/images/mainskill/helps.png',
  value: '15%',
  valueClass: 'text-help',
  text: 'slower helps'
}

const expertIngredientBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1',
  valueClass: 'text-ingredient',
  text: 'ingredient per ingredient help'
}

const expertIngredientSpecialtyBonus: IslandEffect = {
  image: '/images/ingredient/ingredients.png',
  value: '+1-2',
  valueClass: 'text-ingredient',
  text: 'ingredients per ingredient help'
}

const expertBerryBonus: IslandEffect = {
  image: '/images/berries/berries.png',
  value: `${EXPERT_MODE_BERRY_BONUS_MULTIPLIER}x`,
  valueClass: 'text-berry',
  text: 'favored berry power'
}

const expertSkillChanceBonus: IslandEffect = {
  image: '/images/misc/skillproc.png',
  value: '1.25x',
  valueClass: 'text-skill',
  text: 'main skill chance'
}

const effects = computed<IslandEffect[]>(() => {
  const result: IslandEffect[] = []

  if (isBaseFavorite.value) {
    result.push(baseFavoriteBerryEffect)
  } else if (expertMode.value) {
    if (isMainFavorite.value) {
      result.push(expertMainFavoriteFasterHelps)
      if (props.effectiveSkillLevel > props.member.skillLevel) {
        result.push(expertMainFavoriteSkillLevel)
      }
    } else if (!isFavored.value) {
      result.push(expertUnfavoredSlowerHelps)
    }

    if (isFavored.value) {
      if (expertMode.value.randomBonus === 'ingredient') {
        const ingredientSpecialist = props.member.pokemon.specialty === 'ingredient'
        result.push(ingredientSpecialist ? expertIngredientSpecialtyBonus : expertIngredientBonus)
      } else if (expertMode.value.randomBonus === 'berry') {
        result.push(expertBerryBonus)
      } else {
        result.push(expertSkillChanceBonus)
      }
    }
  }

  return result
})
</script>

<style scoped lang="scss">
.status-col {
  align-items: flex-start;
  gap: 2px;
}

.effect-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  @media (min-width: $desktop) {
    flex-direction: row;
    align-items: center;
    column-gap: 16px;
    flex-wrap: wrap;
  }
}
</style>
