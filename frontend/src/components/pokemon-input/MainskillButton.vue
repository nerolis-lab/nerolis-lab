<template>
  <v-card color="transparent">
    <v-row no-gutters>
      <v-col cols="3">
        <v-card @click="menu = !menu" class="flex-center skill-card" color="secondary" height="76">
          <v-img :src="pokemonInstance ? mainskillImage(pokemonInstance.pokemon) : ''" height="50" width="50"></v-img>
          <v-icon class="info-icon" size="16" color="white">mdi-information</v-icon>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-card class="fill-height flex-column px-2" color="transparent">
          <div class="nowrap text-x-small">
            <span class="my-1 skill-name">{{ skillName }}</span>
            <v-spacer></v-spacer>
            <span class="my-1">Lv.{{ mainskillLevel }}</span>
          </div>
          <v-divider />
          <v-slider
            v-model="mainskillLevel"
            min="1"
            :max="maxLevel"
            :ticks="defaultValues"
            show-ticks="always"
            step="1"
            color="primary"
            hide-details
            density="compact"
            class="ml-1 mr-0 text-x-small"
            thumb-size="12"
          ></v-slider>
        </v-card>
      </v-col>
    </v-row>
  </v-card>

  <v-expand-transition>
    <v-card v-if="menu" variant="plain">
      <v-row>
        <v-col cols="12">
          <v-card-text>
            {{ description }}
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-expand-transition>
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

<style scoped lang="scss">
.skill-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 40px); // Leave room for the level text
}

.skill-card {
  position: relative;
  cursor: pointer;
}

.info-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 2px;
}
</style>
