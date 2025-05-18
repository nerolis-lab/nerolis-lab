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
        class="mx-1 my-1"
      />

      <!-- Empty tier message -->
      <div v-if="pokemonsInTier.length === 0" class="empty-tier-message text-disabled pa-4">
        <v-icon size="x-large" class="mb-1">mdi-sleep</v-icon>
        <div>No Pokémon currently in this tier.</div>
      </div>
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
  const tierKey = `tier-${props.tier.toLowerCase()}` as keyof typeof theme.current.value.colors
  return theme.current.value.colors[tierKey] || theme.current.value.colors.surface
})

const tierRowBackgroundStyle = computed(() => getTierColor(props.tier))
</script>

<style scoped lang="scss">
.empty-tier-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70px;
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.8rem;
  .v-icon {
    font-size: 2rem;
  }
}

// Desktop adjustments for TierRow
@media (min-width: 960px) {
  .empty-tier-message {
    min-height: 80px;
    font-size: 0.9rem;
    .v-icon {
      font-size: 2.5rem;
    }
  }
}
</style>
