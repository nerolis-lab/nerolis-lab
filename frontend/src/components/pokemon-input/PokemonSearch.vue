<template>
  <v-dialog v-model="dialogStore.pokemonSearchDialog" max-width="600px">
    <v-card class="py-3">
      <!-- Title, search and close button -->
      <v-row no-gutters class="flex-nowrap align-center">
        <v-col class="flex-grow-1 flex-shrink-1" style="min-width: 0">
          <v-card-title class="px-2 text-truncate">Select a Pokémon</v-card-title>
        </v-col>
        <v-col class="flex-grow-0 flex-shrink-0">
          <CustomSearchBar
            v-model="searchQuery"
            @enter="selectFirstOption"
            label="Search Pokémon, ingredient or berry"
            :start-minimized="true"
            density="compact"
            :min-width="100"
            :max-width="200"
          />
        </v-col>
        <v-col cols="auto" class="flex-shrink-0">
          <v-btn icon="mdi-close" @click="dialogStore.closePokemonSearch" elevation="0" />
        </v-col>
      </v-row>

      <v-row dense class="flex-left px-3 mt-0 mb-1 justify-space-between">
        <v-chip-group v-model="selectedSpecialties" multiple>
          <CustomChip
            v-for="specialty in specialties"
            :key="specialty"
            :value="specialty"
            :color="specialty"
            :is-selected="selectedSpecialties.includes(specialty)"
            :text="capitalize(specialty)"
            size="x-small"
          />
        </v-chip-group>
        <v-badge
          v-model="pokemonSearchStore.showPokeboxBadge"
          dot
          location="top right"
          color="primary"
          @click="showPokeboxInfo"
        >
          <v-btn
            @click="pokemonSearchStore.togglePokebox()"
            :title="pokemonSearchStore.showPokebox ? 'Showing Pokebox' : 'Showing All Pokemon'"
            size="small"
            elevation="0"
            icon
          >
            <v-img
              src="/images/misc/pokebox.png"
              width="36"
              height="36"
              :style="{ filter: pokemonSearchStore.showPokebox ? 'none' : 'grayscale(100%)' }"
            />
          </v-btn>
        </v-badge>
      </v-row>

      <v-row dense class="flex-center px-3 mt-0 justify-space-between">
        <v-checkbox v-model="finalStageOnly" label="Final Stage Only" density="compact" hide-details />
        <DropdownSort
          v-model="selectedSort"
          v-model:sort-ascending="sortAscending"
          :sort-options="sortOptions"
          color="secondary"
        />
      </v-row>

      <v-divider class="my-2" />

      <!-- Pokemon list -->
      <div ref="pokemonListContainer" class="pokemon-list-container">
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        </div>
        <div
          v-else-if="pokemonSearchStore.showPokebox && savedPokemon.length === 0"
          class="d-flex justify-center align-center pa-6"
          style="height: 200px"
        >
          <div class="text-center">
            <v-icon icon="mdi-pokeball" size="48" color="grey-lighten-1" class="mb-3"></v-icon>
            <div class="text-h6 text-grey-darken-1 mb-2">Your Pokebox is empty</div>
            <div class="text-body-2 text-grey-darken-2" style="max-width: 300px">
              <span v-if="!userStore.loggedIn"> Please log in to save Pokémon to your Pokebox </span>
              <span v-else> Add Pokémon from your teams to start building your personal collection </span>
            </div>
          </div>
        </div>
        <v-row v-else dense class="d-flex justify-space-around mx-1">
          <v-col v-for="{ path, pokemon, instance } in filteredPokemon" :key="pokemon.name" class="flex-center">
            <div class="flex-column align-center">
              <v-avatar
                color="secondary"
                class="cursor-pointer"
                @click="selectPokemon(instance)"
                :size="isMobile ? 60 : 100"
                rounded="lg"
              >
                <v-img :src="path"></v-img>
              </v-avatar>
              <div v-if="pokemonSearchStore.showPokebox" class="text-center text-caption mt-1" style="max-width: 100px">
                {{ instance ? instance.name : pokemon.displayName }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>

  <!-- Pokebox info dialog -->
  <v-dialog v-model="showPokeboxInfoDialog" max-width="400px">
    <v-card class="pa-4">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon icon="mdi-pokeball" color="primary" class="mr-2"></v-icon>
        What is the Pokebox?
      </v-card-title>
      <v-card-text class="text-body-2">
        <p class="mb-3">
          The Pokebox is your personal collection of Pokémon that you've encountered and want to keep track of.
        </p>
        <p class="mb-3">
          When you create teams with specific Pokémon, those Pokémon are automatically added to your Pokebox, making it
          easy to find and reuse them in future team compositions.
        </p>
        <p class="mb-0">
          Toggle between viewing all Pokémon or just your personal collection using the Pokebox button.
        </p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="closePokeboxInfo">Got it!</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import DropdownSort from '@/components/custom-components/dropdown-sort/DropdownSort.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { UserService } from '@/services/user/user-service'
import { avatarImage } from '@/services/utils/image-utils'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonSearchStore } from '@/stores/pokemon-search-store'
import { useUserStore } from '@/stores/user-store'
import {
  capitalize,
  COMPLETE_POKEDEX,
  type Pokemon,
  type PokemonInstanceExt,
  type PokemonSpecialty
} from 'sleepapi-common'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export interface PokemonWithPath {
  path: string
  pokemon: Pokemon
  instance?: PokemonInstanceExt
}

const dialogStore = useDialogStore()
const pokemonSearchStore = usePokemonSearchStore()
const userStore = useUserStore()

const searchQuery = ref('')
const selectedSpecialties = ref<PokemonSpecialty[]>([])
const specialties: PokemonSpecialty[] = ['berry', 'ingredient', 'skill']
const finalStageOnly = ref(true)
const selectedSort = ref('pokedex')
const sortAscending = ref(true)
const sortOptions = [
  { title: '#', value: 'pokedex', description: 'Sort by Pokédex number' },
  { title: 'A-Z', value: 'name', description: 'Sort alphabetically by name' }
]

const { isMobile } = useBreakpoint()
const pokemonListContainer = ref<HTMLElement | null>(null)
const loading = ref(false)
const showPokeboxInfoDialog = ref(false)

const savedPokemon: Ref<PokemonWithPath[]> = ref([])
const completePokedex: Ref<PokemonWithPath[]> = ref(
  COMPLETE_POKEDEX.map((p) => ({
    pokemon: p,
    instance: PokemonInstanceUtils.createDefaultPokemonInstance(p),
    path: avatarImage({ pokemonName: p.name, shiny: false, happy: false })
  })).sort((a, b) => a.pokemon.pokedexNumber - b.pokemon.pokedexNumber)
)

const pokemonCollection: ComputedRef<PokemonWithPath[]> = computed(() => {
  return pokemonSearchStore.showPokebox ? savedPokemon.value : completePokedex.value
})

const filteredPokemon: ComputedRef<PokemonWithPath[]> = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  const nameFilter = (p: PokemonWithPath) => !query || p.pokemon.displayName.toLowerCase().includes(query)
  const specialtyFilter = (p: PokemonWithPath) =>
    selectedSpecialties.value.length === 0 || selectedSpecialties.value.some((s) => p.pokemon.specialty === s)
  const finalStageFilter = (p: PokemonWithPath) => !finalStageOnly.value || p.pokemon.remainingEvolutions === 0

  const filtered = pokemonCollection.value.filter(nameFilter).filter(specialtyFilter).filter(finalStageFilter)

  // Sort the filtered results
  const sorted = filtered.sort((a, b) => {
    let compareValue = 0

    switch (selectedSort.value) {
      case 'pokedex':
        compareValue = a.pokemon.pokedexNumber - b.pokemon.pokedexNumber
        break
      case 'name':
        compareValue = a.pokemon.displayName.localeCompare(b.pokemon.displayName)
        break
      case 'specialty':
        compareValue = a.pokemon.specialty.localeCompare(b.pokemon.specialty)
        break
      case 'evolution':
        compareValue = a.pokemon.remainingEvolutions - b.pokemon.remainingEvolutions
        break
      default:
        compareValue = a.pokemon.pokedexNumber - b.pokemon.pokedexNumber
    }

    return sortAscending.value ? compareValue : -compareValue
  })

  return sorted
})

const selectFirstOption = () => {
  const firstOption = filteredPokemon.value[0]
  if (firstOption && firstOption.instance) {
    selectPokemon(firstOption.instance)
  }
}

const selectPokemon = (instance: PokemonInstanceExt | undefined) => {
  if (instance) {
    dialogStore.handlePokemonSelected(instance)
  }
}

const loadPokebox = async () => {
  loading.value = true
  savedPokemon.value = await UserService.getUserPokemon().then((instances) => {
    return instances.map((instance) => ({
      pokemon: instance.pokemon,
      instance,
      path: avatarImage({ pokemonName: instance.pokemon.name, shiny: instance.shiny, happy: false })
    }))
  })
  loading.value = false
}

const showPokeboxInfo = () => {
  // true until the user has clicked the notification once, don't show the info message again
  showPokeboxInfoDialog.value = pokemonSearchStore.showPokeboxBadge
}

const closePokeboxInfo = () => {
  showPokeboxInfoDialog.value = false
  pokemonSearchStore.hidePokeboxBadge()
}

// Watch for dialog opening and fetch pokebox if user is logged in
watch(
  () => [dialogStore.pokemonSearchDialog, userStore.loggedIn],
  async ([isOpen, loggedIn]) => {
    if (isOpen && loggedIn) {
      await loadPokebox()
    }
  }
)
</script>

<style scoped>
.pokemon-list-container {
  min-height: calc(100dvh - 48px);
  transition: min-height 0.3s ease;
}
</style>
