<template>
  <v-tabs
    v-model="activeTab"
    color="primary"
    grow
    bg-color="surface"
    class="mb-0 modal-tabs sticky-tabs"
    density="comfortable"
    slider-color="accent"
  >
    <v-tab value="overview" class="tab-item"
      ><v-icon start size="small">mdi-account-details-outline</v-icon>Overview</v-tab
    >
    <v-tab value="variants" class="tab-item"><v-icon start size="small">mdi-dna</v-icon>Variants</v-tab>
    <v-tab value="recipes" class="tab-item"><v-icon start size="small">mdi-silverware-fork-knife</v-icon>Recipes</v-tab>
    <v-tab value="synergy" class="tab-item"><v-icon start size="small">mdi-account-group-outline</v-icon>Synergy</v-tab>
  </v-tabs>
  <v-divider class="divider-strong"></v-divider>

  <v-window v-model="activeTab" class="modal-window-content pa-sm-3 pa-2">
    <!-- Overview Tab -->
    <v-window-item value="overview" class="pt-2">
      <v-row dense>
        <v-col cols="12" sm="5" md="4" class="text-center pa-2">
          <div class="pokemon-image-container-modal elevation-2">
            <v-img
              :src="pokemonDisplayImageUrl"
              height="140"
              contain
              class="mb-2 elevation-3 rounded-lg pokemon-detail-image arcane-glow-image"
              eager
            ></v-img>
          </div>
          <div class="text-h6 font-weight-medium mt-1">{{ pokemonName }}</div>
          <div class="text-caption text-medium-emphasis">
            ID: {{ props.pokemon.pokemonWithSettings.settings.externalId }}
          </div>
        </v-col>
        <v-col cols="12" sm="7" md="8" class="pa-md-2 pa-0">
          <v-list density="compact" bg-color="transparent" class="overview-list">
            <v-list-item class="modal-list-item mb-2" rounded="lg">
              <template v-slot:prepend
                ><v-icon :color="tierColorString" class="mr-3 list-item-icon">mdi-star-circle</v-icon></template
              >
              <v-list-item-title class="font-weight-bold list-item-title-text">Tier</v-list-item-title>
              <v-list-item-subtitle class="list-item-subtitle-value" :style="{ color: tierColorString }">{{
                props.pokemon.tier
              }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="modal-list-item mb-2" rounded="lg">
              <template v-slot:prepend
                ><v-icon color="accent" class="mr-3 list-item-icon">mdi-calculator-variant-outline</v-icon></template
              >
              <v-list-item-title class="font-weight-bold list-item-title-text">Overall Score</v-list-item-title>
              <v-list-item-subtitle class="list-item-subtitle-value">{{
                props.pokemon.score.toFixed(0)
              }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="modal-list-item mb-2" rounded="lg">
              <template v-slot:prepend>
                <v-icon :color="diffDisplay.color" class="mr-3 list-item-icon">{{ diffDisplay.icon }}</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold list-item-title-text">Rank Change</v-list-item-title>
              <v-list-item-subtitle :class="diffDisplay.class" class="list-item-subtitle-value">
                {{ diffDisplay.text }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="modal-list-item mb-2" rounded="lg">
              <template v-slot:prepend
                ><v-icon color="accent" class="mr-3 list-item-icon">mdi-leaf-maple</v-icon></template
              >
              <v-list-item-title class="font-weight-bold list-item-title-text">Nature</v-list-item-title>
              <v-list-item-subtitle class="list-item-subtitle-value">{{
                props.pokemon.pokemonWithSettings.settings.nature || 'N/A'
              }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="modal-list-item subskills-list-item" rounded="lg">
              <template v-slot:prepend
                ><v-icon color="accent" class="mr-3 list-item-icon">mdi-brain-outline</v-icon></template
              >
              <v-list-item-title class="font-weight-bold mb-1 list-item-title-text">Subskills</v-list-item-title>
              <v-chip-group class="mt-n1">
                <v-chip
                  v-for="(subskill, i) in props.pokemon.pokemonWithSettings.settings.subskills"
                  :key="i"
                  density="comfortable"
                  label
                  :color="getSubskillChipStyle(subskill).color"
                  :variant="getSubskillChipStyle(subskill).variant"
                  class="subskill-chip ma-1"
                >
                  {{ subskill }}
                </v-chip>
              </v-chip-group>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-window-item>

    <!-- Ingredient Variants Tab -->
    <v-window-item value="variants" class="pa-2">
      <p v-if="!pokemonVariants || pokemonVariants.length === 0" class="text-center text-medium-emphasis pa-4">
        No other variants found for {{ pokemonName }}.
      </p>
      <v-list density="compact" bg-color="transparent" lines="three">
        <v-list-item
          v-for="(variant, index) in pokemonVariants"
          :key="index"
          :class="{ 'variant-highlight primary-glow-border': isMainVariant(variant) }"
          class="mb-2 variant-item modal-list-item"
          rounded="lg"
        >
          <div class="d-flex align-center justify-space-between mb-1">
            <v-list-item-title
              class="font-weight-bold text-h6"
              :style="{ color: tierColorMapping[variant.tier] || tierColorMapping.F }"
            >
              Tier: {{ variant.tier }}
            </v-list-item-title>
            <span class="font-weight-medium text-body-1">Score: {{ variant.score.toFixed(0) }}</span>
          </div>

          <div class="d-flex align-center my-2">
            <span class="text-caption mr-2 font-weight-medium text-medium-emphasis">Ingredients:</span>
            <v-avatar
              v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
              :key="i"
              size="30"
              class="mr-1 elevation-1 ingredient-avatar-modal"
              tile
            >
              <v-img
                :src="ingredientDisplayImageUrl(ing.name)"
                :alt="ing.name"
                class="ingredient-img-modal"
                eager
              ></v-img>
              <v-tooltip activator="parent" location="top">{{ ing.name }} x{{ ing.amount }}</v-tooltip>
            </v-avatar>
          </div>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            Nature: {{ variant.pokemonWithSettings.settings.nature || 'N/A' }} <span class="mx-1">|</span> Subskills:
            {{ variant.pokemonWithSettings.settings.subskills?.join(', ') || 'N/A' }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-window-item>

    <!-- Top Recipes Tab -->
    <v-window-item value="recipes" class="pa-2">
      <p v-if="!topContributions || topContributions.length === 0" class="text-center text-medium-emphasis pa-4">
        No recipe contributions data.
      </p>
      <v-list density="compact" bg-color="transparent" lines="two">
        <v-list-item
          v-for="(contrib, index) in topContributions"
          :key="index"
          class="mb-2 contrib-item modal-list-item"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-avatar rounded="lg" size="48" class="mr-4 elevation-1 recipe-avatar-modal">
              <v-img :src="recipeDisplayImageUrl(contrib.recipe)" :alt="contrib.recipe" eager></v-img>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-subtitle-1">{{ contrib.recipe }}</v-list-item-title>
          <v-list-item-subtitle class="text-medium-emphasis">
            Contribution:
            <span class="font-weight-medium" :style="{ color: tierColorMapping.A }">{{
              contrib.score.toFixed(0)
            }}</span>
            <span v-if="contrib.coverage !== undefined"> (Coverage: {{ contrib.coverage?.toFixed(1) }}%)</span>
            <span v-if="contrib.skillValue !== undefined && contrib.skillValue > 0" class="ml-1 text-caption"
              >(Skill: {{ contrib.skillValue.toFixed(0) }})</span
            >
          </v-list-item-subtitle>
          <div v-if="contrib.team && contrib.team.length > 0" class="mt-1 text-caption">
            <span class="font-weight-medium text-medium-emphasis">Team:</span>
            <v-chip
              v-for="(member, tIndex) in contrib.team"
              :key="tIndex"
              density="compact"
              class="mx-0_5 team-chip"
              label
              size="small"
              variant="tonal"
            >
              <v-avatar start size="18"
                ><v-img :src="pokemonDisplayImageUrlByName(member.pokemon)" :alt="member.pokemon" eager></v-img
              ></v-avatar>
              {{ member.pokemon }}
            </v-chip>
          </div>
        </v-list-item>
      </v-list>
    </v-window-item>

    <!-- Team Synergy Tab -->
    <v-window-item value="synergy" class="pa-2">
      <p
        v-if="!synergisticTeammates || synergisticTeammates.length === 0"
        class="text-center text-medium-emphasis pa-4"
      >
        Synergy analysis pending.
      </p>
      <div class="d-flex flex-wrap ga-2 pa-1 justify-center">
        <v-chip
          v-for="(mate, index) in synergisticTeammates"
          :key="index"
          label
          size="large"
          class="ma-1 synergy-chip frosted-glass-chip"
          variant="outlined"
          color="accent"
        >
          <v-avatar start size="30" class="mr-2"
            ><v-img :src="pokemonDisplayImageUrlByName(mate.name)" :alt="mate.name" eager></v-img
          ></v-avatar>
          <span class="font-weight-medium">{{ mate.name }}</span>
          <span class="text-caption ml-1">({{ mate.count }}x)</span>
        </v-chip>
      </div>
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import type { PokemonWithTiering, RecipeContributionSimple, Tier } from 'sleepapi-common'
import { computed, ref } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
}>()

const activeTab = ref('overview')

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)
const pokemonDisplayImageUrl = computed(() =>
  getPokemonDisplayImageUrlUtil({ pokemonName: pokemonName.value, shiny: false, happy: true })
) // happy:true for detail view

const pokemonVariants = computed(() => {
  return props.allPokemonVariantsData
    .filter((p) => p.pokemonWithSettings.pokemon === pokemonName.value)
    .sort((a, b) => b.score - a.score)
})

const isMainVariant = (variant: PokemonWithTiering) => {
  const mainList = props.pokemon.pokemonWithSettings.ingredientList
  const variantList = variant.pokemonWithSettings.ingredientList
  if (mainList.length !== variantList.length) return false
  return mainList.every((ing, i) => ing.name === variantList[i]?.name && ing.amount === variantList[i]?.amount)
}

const topContributions = computed<RecipeContributionSimple[]>(() => {
  return props.pokemon.contributions?.slice(0, 3) || []
})

const synergisticTeammates = computed(() => {
  const teammateCounts: Record<string, { name: string; count: number }> = {}
  props.pokemon.contributions?.forEach((contrib) => {
    contrib.team?.forEach((teamMember) => {
      if (teamMember.pokemon !== pokemonName.value) {
        if (!teammateCounts[teamMember.pokemon]) {
          teammateCounts[teamMember.pokemon] = { name: teamMember.pokemon, count: 0 }
        }
        teammateCounts[teamMember.pokemon].count++
      }
    })
  })
  return Object.values(teammateCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrlUtil(name)
}

const recipeDisplayImageUrl = (name: string) => {
  return getRecipeImageUrlUtil(name)
}

const pokemonDisplayImageUrlByName = (name: string) => {
  return getPokemonDisplayImageUrlUtil({ pokemonName: name, shiny: false, happy: false }) // Standard portrait for team members
}

interface SubskillStyle {
  color: string
  variant: 'flat' | 'outlined' | 'tonal' | 'text' | 'plain'
  // textColor?: string; // Vuetify often handles this with chip color
}

const subskillColors: Record<string, { color: string; variant: SubskillStyle['variant'] }> = {
  default: { color: 'surface-variant', variant: 'tonal' },
  gold: { color: 'yellow-darken-2', variant: 'flat' },
  silver: { color: 'blue-grey-lighten-2', variant: 'flat' },
  white: { color: 'grey-lighten-5', variant: 'flat' }
}

const getSubskillChipStyle = (subskill: string): { color: string; variant: SubskillStyle['variant'] } => {
  const lowerSubskill = subskill.toLowerCase()
  if (lowerSubskill.includes('gold') || lowerSubskill.includes(' l')) return subskillColors.gold
  if (lowerSubskill.includes('silver') || lowerSubskill.includes(' m')) return subskillColors.silver
  if (lowerSubskill.includes('white') || lowerSubskill.includes(' s')) return subskillColors.white
  return subskillColors.default
}

const tierColorMapping: Record<Tier, string> = {
  S: 'var(--v-theme-primary)',
  A: 'var(--v-theme-strength)',
  B: 'var(--v-theme-pretty-purple, #9771e0)',
  C: 'var(--v-theme-secondary)',
  D: 'var(--v-theme-secondary-dark)',
  E: 'var(--v-theme-surface-variant, #5b577c)',
  F: 'var(--v-theme-surface, #403d58)'
}
const tierColorString = computed(() => tierColorMapping[props.pokemon.tier] || tierColorMapping.F)

const diffDisplay = computed(() => {
  const diff = props.pokemon.diff
  if (diff === undefined) {
    return {
      text: 'New Addition',
      icon: 'mdi-new-box',
      color: 'var(--v-theme-primary)', // Or another color like accent
      class: 'text-new-addition'
    }
  }
  if (diff === 0) {
    return {
      text: '-',
      icon: 'mdi-minus-circle-outline',
      color: 'grey-darken-1',
      class: ''
    }
  }
  const isPositive = diff > 0
  return {
    text: `${isPositive ? '+' : ''}${diff} ${isPositive ? '▲' : '▼'}`,
    icon: isPositive ? 'mdi-triangle' : 'mdi-triangle-down',
    color: isPositive ? 'var(--v-theme-nature-up)' : 'var(--v-theme-nature-down)',
    class: isPositive ? 'text-positive-diff' : 'text-negative-diff'
  }
})
</script>

<style scoped lang="scss">
.sticky-tabs {
  position: sticky;
  top: 0; // Assuming modal toolbar is directly above, or adjust if page has a sticky header
  z-index: 100; // Ensure tabs are above window content during scroll
}

.modal-tabs.v-tabs {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background-color: rgba(var(--v-theme-surface), 0.7) !important; // Frosted glass for tabs bar
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  .v-tab.tab-item {
    font-weight: 600;
    font-size: 0.8rem; // Slightly smaller tab text for compactness
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(var(--v-theme-on-surface), 0.75);
    &.v-tab--selected {
      color: var(--v-theme-primary);
      background-color: rgba(var(--v-theme-primary), 0.1);
    }
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.05);
    }
    .v-icon {
      margin-right: 6px;
    }
  }
}

.divider-strong {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  border-width: 1px 0 0 0;
  opacity: 1;
}

.modal-window-content {
  background-color: rgba(var(--v-theme-surface), 1);
  // The main modal card in TierListPage.vue provides the overall frosted background
}

.pokemon-image-container-modal {
  padding: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2);
}

.pokemon-detail-image {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.15);
}

.arcane-glow-image:hover {
  filter: drop-shadow(0 0 10px rgba(var(--v-theme-accent), 0.7)) brightness(1.05);
  transform: scale(1.02);
  transition:
    filter 0.3s ease,
    transform 0.3s ease;
}

.overview-list .v-list-item,
.variant-item,
.contrib-item {
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease-out,
    box-shadow 0.2s ease;
  &:hover {
    background-color: rgba(var(--v-theme-surface-variant), 0.6);
    border-color: rgba(var(--v-theme-primary), 0.5);
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }
}

.list-item-icon {
  opacity: 0.85;
  filter: drop-shadow(0 0 2px rgba(var(--v-theme-on-surface), 0.3));
}
.list-item-title-text {
  color: $accent; // Using accent for titles for better pop
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.list-item-subtitle-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: $on-surface;
}

.text-positive-diff,
.text-negative-diff,
.text-new-addition {
  font-size: 0.95rem; // Consistent with other subtitle values
  font-weight: 600;
}

.text-new-addition {
  color: var(--v-theme-primary) !important;
  font-style: italic;
}

.subskills-list-item {
  // Align items better when chip group is present
  .v-list-item__prepend {
    align-self: flex-start;
    margin-top: 8px; // Adjust as needed
  }
}

.subskill-chip {
  font-size: 0.78rem;
  height: 28px !important;
  margin: 2px !important;
  border: 1px solid transparent;
  &.v-chip--variant-flat {
    color: $on-primary !important; // Ensure good contrast on flat colored chips
    &[style*='background-color: rgb(255, 215, 0)'],
    &[style*='background-color: #ffd700'] {
      // Gold
      color: #333 !important;
    }
    &[style*='background-color: rgb(192, 192, 192)'],
    &[style*='background-color: #c0c0c0'] {
      // Silver
      color: #333 !important;
    }
    &[style*='background-color: rgb(250, 250, 250)'],
    &[style*='background-color: #fafafa'] {
      // White
      color: #333 !important;
    }
  }
}

.variant-highlight {
  border: 2px solid $primary !important;
  background-color: rgba(var(--v-theme-primary), 0.25) !important;
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.5);
}

.ingredient-avatar-modal {
  background-color: rgba(var(--v-theme-surface), 0.85);
  border-radius: 6px;
  padding: 3px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.25);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
}
.ingredient-img-modal {
  border-radius: 4px;
}

.recipe-avatar-modal {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-chip {
  background-color: rgba(var(--v-theme-surface), 0.95) !important;
  color: $on-surface;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.25);
  font-size: 0.75rem;
  padding: 0 8px !important;
  .v-avatar {
    filter: brightness(0.9);
    margin-right: 4px;
  }
}

.synergy-chip {
  border: 1px solid rgba(var(--v-theme-accent), 0.6) !important;
  color: var(--v-theme-accent) !important;
  font-weight: 500;
  background-color: rgba(var(--v-theme-accent), 0.15) !important;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(var(--v-theme-accent), 0.25) !important;
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(var(--v-theme-accent), 0.3);
  }
  .v-avatar {
    border: 1px solid rgba(var(--v-theme-accent), 0.3);
    border-radius: 50%;
  }
}

.frosted-glass-chip {
  // Re-evaluate if this specific class is still needed or if modal-list-item style is sufficient
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
}

.mx-0_5 {
  margin-left: 2px;
  margin-right: 2px;
}
</style>
