<template>
  <v-card :color="tierRowBackgroundStyle" class="flex-left align-stretch mb-3">
    <v-card :color="tierLabelColor" min-width="60px" max-width="60px" class="flex-center">
      <span class="text-h4 font-weight-semibold">{{ tier }}</span>
    </v-card>
    <div class="flex-left flex-wrap ml-1">
      <PokemonCard
        v-for="pokemonInTier in pokemonsInTier"
        :key="pokemonInTier.pokemonWithSettings.settings.externalId"
        :pokemon="pokemonInTier"
        @click:pokemon="$emit('click:pokemon', $event)"
        class="ma-1"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { getTierColor } from '@/services/utils/tierlist-utils'
import type { PokemonWithTiering, Tier } from 'sleepapi-common'
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import PokemonCard from './PokemonCard.vue'

const props = defineProps<{
  tier: Tier
  pokemonsInTier: PokemonWithTiering[]
}>()

const emit = defineEmits(['click:pokemon'])

const theme = useTheme()

const tierLabelColor = computed(() => {
  const tierKey = `tier-${props.tier.toLowerCase()}`
  return theme.current.value.colors[tierKey] || theme.current.value.colors.surface
})

const tierRowBackgroundStyle = computed(() => getTierColor(props.tier))
</script>
