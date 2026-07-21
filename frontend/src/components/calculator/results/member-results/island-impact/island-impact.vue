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
import { capitalize, type IslandInstance, type PokemonInstanceExt } from 'sleepapi-common'
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

const effects = computed<IslandEffect[]>(() => {
  const result: IslandEffect[] = []
  const mode = expertMode.value

  if (mode) {
    if (isMainFavorite.value) {
      result.push({ image: '/images/mainskill/helps.png', value: '10%', valueClass: 'text-help', text: 'faster helps' })
      if (props.member.skillLevel < props.member.pokemon.skill.maxLevel) {
        result.push({
          image: '/images/misc/skillproc.png',
          value: '+1',
          valueClass: 'text-skill',
          text: 'main skill level'
        })
      }
    } else if (!isFavored.value) {
      result.push({ image: '/images/mainskill/helps.png', value: '15%', valueClass: 'text-help', text: 'slower helps' })
    }

    if (isFavored.value) {
      if (mode.randomBonus === 'ingredient') {
        const ingredientSpecialist = props.member.pokemon.specialty === 'ingredient'
        result.push({
          image: '/images/ingredient/ingredients.png',
          value: ingredientSpecialist ? '+1-2' : '+1',
          valueClass: 'text-ingredient',
          text: ingredientSpecialist ? 'ingredients per ingredient help' : 'ingredient per ingredient help'
        })
      } else if (mode.randomBonus === 'berry') {
        result.push({
          image: '/images/berries/berries.png',
          value: '2.4x',
          valueClass: 'text-berry',
          text: 'favored berry power'
        })
      } else {
        result.push({
          image: '/images/misc/skillproc.png',
          value: '1.25x',
          valueClass: 'text-skill',
          text: 'main skill chance'
        })
      }
    }
  } else if (isBaseFavorite.value) {
    result.push({ image: '/images/berries/berries.png', value: '2x', valueClass: 'text-berry', text: 'berry power' })
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
