<template>
  <v-container>
    <BubbleBackground class="mb-4 rounded-lg">
      <!-- Header title-->
      <div class="sleep-header-content">
        <div class="flex-center flex-wrap">
          <h1 class="text-h3 font-weight-bold text-white mb-0">Pokémon</h1>
          <h1 class="text-h3 font-weight-bold text-white mb-0 text-no-wrap ml-2">Tier List</h1>
        </div>
        <div class="divider mt-2 mb-2"></div>
        <p class="text-subtitle-1 text-white mt-1">Performance Rankings</p>
      </div>

      <!-- Header controls -->
      <div class="sleep-controls">
        <div class="flex-center justify-space-between w-100">
          <v-text-field
            v-model="searchQuery"
            label="Search..."
            prepend-inner-icon="mdi-magnify"
            flat
            hide-details
            clearable
            density="compact"
            bg-color="rgba(255, 255, 255, 0.15)"
            variant="solo-filled"
            min-width="150px"
            max-width="350px"
          ></v-text-field>

          <v-btn
            icon="mdi-share-variant"
            class="rounded ml-2"
            height="40"
            width="40"
            base-color="rgba(255, 255, 255, 0.15)"
            @click="openShareDialog"
            elevation="0"
          >
          </v-btn>
        </div>

        <div
          :class="[
            'd-flex',
            'align-center',
            isTinyMobile ? 'justify-space-between' : 'justify-start',
            'flex-nowrap',
            'mt-2'
          ]"
        >
          <v-btn-toggle v-model="selectedLevel" mandatory base-color="surface" color="primary" density="comfortable">
            <v-btn :value="30">Lv 30</v-btn>
            <v-btn :value="60">Lv 60</v-btn>
          </v-btn-toggle>

          <v-btn icon @click="toggleCamp" color="transparent" elevation="0" height="40" width="40" class="ml-2">
            <v-img
              height="40"
              width="40"
              src="/images/misc/camp.png"
              :alt="camp ? 'Camp Mode On' : 'Camp Mode Off'"
              :class="{ 'camp-active': camp, 'camp-inactive': !camp }"
            />
          </v-btn>
        </div>

        <div :class="['mt-2', 'd-flex justify-space-between', 'w-100']">
          <!-- Risers -->
          <div :class="isMobile ? 'd-flex flex-column' : 'flex-center'">
            <div v-for="r in trendingPokemon.risers" :key="r.name" class="ma-1">
              <v-chip :color="getNatureColor(true)">
                <v-icon start size="small">mdi-trending-up</v-icon>
                {{ r.name }} (+{{ r.diff }})
              </v-chip>
            </div>
          </div>

          <!-- Fallers -->
          <div :class="isMobile ? 'd-flex flex-column align-end' : 'flex-center'">
            <div v-for="f in trendingPokemon.fallers" :key="f.name" class="ma-1">
              <v-chip :color="getNatureColor(false)">
                <v-icon start size="small">mdi-trending-down</v-icon>
                {{ f.name }} ({{ f.diff }})
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </BubbleBackground>

    <!-- Loading/Error State -->
    <v-row v-if="isLoading" justify="center" class="my-10">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-3 text-h6">Loading Arcane Data...</p>
      </v-col>
    </v-row>
    <v-row v-else-if="error" justify="center" class="my-6">
      <v-col md="6" sm="8" cols="12">
        <v-alert type="error" prominent border="start" variant="tonal" class="frosted-glass-error">
          <template v-slot:title><span class="font-weight-bold">Data Transmission Failed</span></template>
          Could not retrieve Pokémon tier data. The archives may be temporarily offline.
          <div class="text-caption mt-2">Error: {{ error }}</div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Tier List Display Area -->
    <div v-else-if="filteredTierList.length > 0" class="tier-list-container">
      <TierRow
        v-for="tierKey in displayedTiers"
        :key="tierKey"
        :tier="tierKey"
        :pokemonsInTier="groupedPokemonByTier[tierKey] || []"
        @click:pokemon="handlePokemonClick"
      />
    </div>
    <v-row v-else class="my-10">
      <v-col cols="12" class="text-center text-disabled">
        <v-icon size="x-large">{{ searchQuery ? 'mdi-feature-search-outline' : 'mdi-magnify-scan' }}</v-icon>
        <p class="mt-2 text-h6">
          {{ searchQuery ? 'No Pokémon match your search.' : 'No Pokémon data found for the selected criteria.' }}
        </p>
      </v-col>
    </v-row>

    <!-- Pokemon Detail Modal -->
    <v-dialog v-model="showDetailModal" max-width="750px" scrollable>
      <PokemonDetailModal
        v-if="selectedPokemonForDetail"
        :pokemon="selectedPokemonForDetail"
        :allPokemonVariantsData="selectedPokemonAllVariants"
      />
      <!-- Fallback or loading state for modal if needed, though v-if on component handles it -->
    </v-dialog>

    <!-- Share Dialog -->
    <v-dialog v-model="showShareDialog" max-width="500px">
      <v-card class="">
        <v-card-title class="d-flex align-center">
          <v-icon start color="accent">mdi-share-variant</v-icon>
          Share Tier List
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="shareableLink"
            label="Shareable Link"
            readonly
            variant="outlined"
            density="compact"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyShareLink"
            class="mb-4"
          ></v-text-field>

          <v-btn block color="primary" @click="downloadTierListImage" class="mt-2" :loading="isDownloadingImage">
            <v-icon start>mdi-download</v-icon>
            Download as Image
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showShareDialog = false" color="secondary">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import BubbleBackground from '@/components/custom-components/backgrounds/BubbleBackground.vue'
import PokemonDetailModal from '@/components/tierlist/PokemonDetailModal.vue'
import TierRow from '@/components/tierlist/TierRow.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { tierlistService } from '@/services/tierlist-service'
import { getPokemon, type PokemonWithTiering, type Tier, type TierlistSettings } from 'sleepapi-common'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const camp = ref(false)
const selectedLevel = ref<30 | 60>(30)
const tierList = ref<PokemonWithTiering[]>([])
const searchQuery = ref('')

const isLoading = ref(false)
const error = ref<string | null>(null)

const showDetailModal = ref(false)
const selectedPokemonForDetail = ref<PokemonWithTiering | null>(null)
const selectedPokemonAllVariants = ref<PokemonWithTiering[]>([]) // For the modal

const showShareDialog = ref(false)
const shareableLink = ref('')
const isDownloadingImage = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const displayedTiersOrder: Tier[] = ['S', 'A', 'B', 'C', 'D', 'F'] // E tier removed as per example data

const currentSettings = computed(
  (): TierlistSettings => ({
    level: selectedLevel.value,
    camp: camp.value
  })
)

const { isTinyMobile, isMobile } = useBreakpoint()

const filteredTierList = computed(() => {
  if (!searchQuery.value) {
    return tierList.value
  }
  const searchLower = searchQuery.value.toLowerCase()
  return tierList.value.filter((pokemon) => {
    const nameMatch = pokemon.pokemonWithSettings.pokemon.toLowerCase().includes(searchLower)
    const ingredientMatch = pokemon.pokemonWithSettings.ingredientList.some((ing) =>
      ing.name.toLowerCase().includes(searchLower)
    )
    const recipeMatch = pokemon.contributions?.some((contrib) => contrib.recipe.toLowerCase().includes(searchLower))
    return nameMatch || ingredientMatch || recipeMatch
  })
})

const groupedPokemonByTier = computed(() => {
  const groups: Record<Tier, PokemonWithTiering[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
  }
  filteredTierList.value.forEach((pokemon) => {
    if (groups[pokemon.tier]) {
      groups[pokemon.tier].push(pokemon)
    } else {
      // Handle unexpected tiers if necessary, though our type constrains it
      console.warn(`Unexpected tier: ${pokemon.tier} for ${pokemon.pokemonWithSettings.pokemon}`)
    }
  })
  return groups
})

const displayedTiers = computed(() => {
  return displayedTiersOrder.filter(
    (tier) => groupedPokemonByTier.value[tier]?.length > 0 || tier === 'S' || tier === 'A' || tier === 'B'
  ) // Always show S,A,B, then others if they have Pokemon
})

const trendingPokemon = computed(() => {
  if (!tierList.value || tierList.value.length === 0) return { risers: [], fallers: [] }

  const risers = tierList.value
    .filter((p) => p.diff !== undefined && p.diff > 0)
    .sort((a, b) => b.diff! - a.diff!)
    .slice(0, 3)
    .map((p) => ({ name: getPokemon(p.pokemonWithSettings.pokemon).displayName, diff: p.diff! }))

  const fallers = tierList.value
    .filter((p) => p.diff !== undefined && p.diff < 0)
    .sort((a, b) => a.diff! - b.diff!)
    .slice(0, 3)
    .map((p) => ({ name: getPokemon(p.pokemonWithSettings.pokemon).displayName, diff: p.diff! }))

  return { risers, fallers }
})

const getNatureColor = (isPositive: boolean) => {
  return isPositive ? 'success' : 'error-3'
}

const loadTierlist = async (settings: TierlistSettings) => {
  isLoading.value = true
  error.value = null
  try {
    tierList.value = await tierlistService.fetchTierlist(settings)
    // After fetching, the service has stored the raw data. We don't need to get it separately here anymore
    // as getPokemonVariants in the service will use the internally stored raw data.
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unknown error occurred'
    tierList.value = []
  } finally {
    isLoading.value = false
  }
}

const updateRoute = () => {
  router
    .push({
      name: route.name ?? undefined, // Keep current route name
      query: {
        level: selectedLevel.value.toString(),
        camp: String(camp.value) // Explicitly use String() constructor
      }
    })
    .catch((err) => {
      // Optional: catch navigation errors, e.g., if navigating to the same route with same query
      if (err.name !== 'NavigationDuplicated') {
        console.error('Router push error:', err)
      }
    })
}

const toggleCamp = () => {
  camp.value = !camp.value
}

const handlePokemonClick = (pokemon: PokemonWithTiering) => {
  selectedPokemonForDetail.value = pokemon
  // Fetch all variants for the selected Pokémon from the service, which uses its stored raw data
  selectedPokemonAllVariants.value = tierlistService.getPokemonVariants(pokemon.pokemonWithSettings.pokemon)
  showDetailModal.value = true
}

const openShareDialog = () => {
  shareableLink.value = window.location.href
  showShareDialog.value = true
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareableLink.value)
    snackbar.value = { show: true, text: 'Link copied to clipboard!', color: 'success' }
  } catch (err) {
    console.error('Failed to copy link: ', err)
    snackbar.value = { show: true, text: 'Failed to copy link', color: 'error' }
  }
}

const downloadTierListImage = async () => {
  isDownloadingImage.value = true
  const elementToCapture = document.querySelector('.tier-list-container') as HTMLElement | null

  if (!elementToCapture) {
    snackbar.value = { show: true, text: 'Tier list element not found for download.', color: 'error' }
    isDownloadingImage.value = false
    return
  }

  // No style manipulations or scroll tricks needed if eager loading works as expected
  // Adding a minimal delay for any final DOM settlements before capture
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(elementToCapture, {
      backgroundColor: '#191224',
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: elementToCapture.scrollWidth,
      height: elementToCapture.scrollHeight,
      logging: false,
      imageTimeout: 0
    })
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `pokemon_tierlist_L${selectedLevel.value}_camp_${camp.value ? 'on' : 'off'}.png`
    link.href = image
    link.click()
    snackbar.value = { show: true, text: 'Image download started!', color: 'success' }
  } catch (err) {
    console.error('Failed to download image with html2canvas:', err)
    snackbar.value = { show: true, text: 'Failed to download image. Check console.', color: 'error' }
  } finally {
    isDownloadingImage.value = false
  }
}

// Initialize from route query params or defaults
onMounted(() => {
  const queryLevel = route.query.level ? parseInt(route.query.level as string) : undefined
  const queryCamp = route.query.camp ? route.query.camp === 'true' : undefined

  selectedLevel.value = queryLevel === 30 || queryLevel === 60 ? queryLevel : 30
  camp.value = queryCamp === true

  // Initial load based on (potentially updated) selectedLevel and camp
  loadTierlist(currentSettings.value)
  // Reflect initial state in URL if not already there from direct navigation
  if (route.query.level !== selectedLevel.value.toString() || route.query.camp !== camp.value.toString()) {
    updateRoute()
  }
})

// Watch for changes in camp or selectedLevel to refetch data and update route
watch(
  [camp, selectedLevel],
  (newValues, oldValues) => {
    // Prevent initial redundant call if onMounted already handled it via route params
    if (newValues[0] !== oldValues[0] || newValues[1] !== oldValues[1] || !route.query.level || !route.query.camp) {
      loadTierlist(currentSettings.value)
      updateRoute()
    }
  },
  { deep: false }
) // deep: false should be fine for primitive refs array

// Watch for route changes (e.g., browser back/forward) to update selections
// This watcher should ideally only react if the internal state (selectedLevel, camp) differs from route query
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    const queryLevel = newQuery.level ? parseInt(newQuery.level as string) : undefined
    const queryCamp = newQuery.camp ? newQuery.camp === 'true' : undefined

    let needsUpdate = false
    if ((queryLevel === 30 || queryLevel === 60) && selectedLevel.value !== queryLevel) {
      selectedLevel.value = queryLevel
      needsUpdate = true
    }
    if (queryCamp !== undefined && camp.value !== queryCamp) {
      camp.value = queryCamp
      needsUpdate = true
    }
    // Only load if there was a change triggered by the route that differs from current state
    // and to avoid double loading if the other watcher already triggered a load.
    if (needsUpdate && (oldQuery.level !== newQuery.level || oldQuery.camp !== newQuery.camp)) {
      loadTierlist(currentSettings.value)
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
// Header content
.sleep-header-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px 20px 20px;

  h1 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    animation: fadeInUp 0.8s both;
  }

  p {
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    animation: fadeInUp 0.8s 0.2s both;
  }

  .divider {
    height: 2px;
    width: 200px;
    background-color: rgba(255, 255, 255, 0.5);
    margin: 0 auto;
  }
}

.sleep-controls {
  padding: 15px 15px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.camp-inactive {
  filter: grayscale(80%) opacity(0.6);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
