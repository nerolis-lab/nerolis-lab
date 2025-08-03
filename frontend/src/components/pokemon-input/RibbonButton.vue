<template>
  <div class="ribbon-carry-container">
    <v-menu id="ribbon-menu" v-model="menu" :close-on-content-click="true" offset-y>
      <template #activator="{ props }">
        <v-btn v-bind="props" icon elevation="0" size="40" color="surface" :disabled="!pokemonInstance">
          <v-avatar size="40">
            <v-img
              :src="ribbonImage"
              :class="!pokemonInstance || pokemonInstance.ribbon === 0 ? 'greyScale' : ''"
              data-testid="ribbon-image"
            ></v-img>
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-list density="compact">
          <v-list-item v-for="value in ribbonLevels" :key="value" @click="updateRibbon(value)">
            <v-list-item-title>{{ ribbonLabel(value) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <CarrySizeDisplay :pokemon-instance="pokemonInstance" />
  </div>
</template>

<script setup lang="ts">
import type { PokemonInstanceExt } from 'sleepapi-common'
import { computed, ref } from 'vue'
import CarrySizeDisplay from './CarrySizeDisplay.vue'

interface Props {
  pokemonInstance?: PokemonInstanceExt
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update-ribbon': [ribbon: number]
}>()

const menu = ref(false)
const ribbonLevels = [0, 1, 2, 3, 4]

const ribbonImage = computed(() => {
  const ribbonLevel = Math.max(props.pokemonInstance?.ribbon ?? 0, 1)
  return `/images/misc/ribbon${ribbonLevel}.png`
})

const updateRibbon = (newRibbon: number) => {
  emit('update-ribbon', newRibbon)
  menu.value = false
}

const ribbonLabel = (level: number) => {
  const labels = ['No ribbon', '200 hours', '500 hours', '1000 hours', '2000 hours']
  return labels[level]
}
</script>

<style lang="scss" scoped>
.greyScale {
  filter: grayscale(100);
}

.ribbon-carry-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
