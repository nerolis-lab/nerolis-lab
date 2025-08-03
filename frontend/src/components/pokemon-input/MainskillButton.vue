<template>
  <v-menu v-model="menu" :close-on-content-click="true" offset-y>
    <template #activator="{ props }">
      <v-card v-bind="props">
        <v-row no-gutters>
          <v-col cols="3">
            <v-card class="flex-center rounded-te-0 rounded-be-0 fill-height" color="secondary">
              <v-img
                class="ma-2"
                :src="pokemonInstance ? mainskillImage(pokemonInstance.pokemon) : ''"
                max-height="50px"
              ></v-img>
            </v-card>
          </v-col>
          <v-col cols="9">
            <v-card class="fill-height rounded-ts-0 rounded-bs-0 flex-column px-2" style="align-content: center">
              <div class="nowrap text-x-small">
                <span class="my-1">{{ skillName }}</span>
                <v-spacer></v-spacer>
                <span class="my-1">Lv.{{ mainskillLevel }}</span>
              </div>
              <v-divider />
              <div class="nowrap text-x-small">
                <span class="my-1"> {{ description }} </span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <v-card>
      <!-- hide overflow since selecting max value appears to give slight scrollbar -->
      <v-col cols="12" class="flex-center" style="overflow: hidden">
        <v-slider
          v-model="mainskillLevel"
          min="1"
          :max="maxLevel"
          :ticks="defaultValues"
          show-ticks="always"
          step="1"
          color="primary"
        ></v-slider>
      </v-col>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { type PokemonInstanceExt } from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

interface Props {
  pokemonInstance?: PokemonInstanceExt
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update-skill-level': [level: number]
}>()

const menu = ref(false)
const mainskillLevel = ref(props.pokemonInstance?.skillLevel ?? 1)
const maxLevel = computed(() => props.pokemonInstance?.pokemon.skill.maxLevel ?? 1)

const skillName = computed(() => {
  return props.pokemonInstance?.pokemon.skill.name ?? 'Unknown skill'
})

const description = computed(() => {
  if (!props.pokemonInstance) return 'Unknown description'
  return props.pokemonInstance.pokemon.skill.description(mainskillLevel.value)
})

const defaultValues = computed(() => {
  if (!props.pokemonInstance) return undefined

  return Array.from({ length: props.pokemonInstance.pokemon.skill.maxLevel }, (_, i) => i + 1).reduce(
    (acc, val) => {
      acc[val] = val.toString()
      return acc
    },
    {} as Record<number, string>
  )
})

watch(
  () => props.pokemonInstance,
  (newInstance) => {
    if (newInstance) {
      mainskillLevel.value = newInstance.skillLevel
    }
  }
)

watch(mainskillLevel, (newLevel) => {
  emit('update-skill-level', newLevel)
})
</script>
