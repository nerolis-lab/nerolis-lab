<template>
  <v-card color="background" class="pa-4">
    <!-- Header icons -->
    <div class="flex-center">
      <v-row style="position: absolute; top: 0; width: 100%">
        <v-col class="flex-left" v-if="pokemonInstance">
          <h5 class="mr-1 text-primary">RP</h5>
          <h2>{{ pokemonInstance.rp }}</h2>
        </v-col>
        <v-col class="flex-right pr-0">
          <v-btn
            id="saveIcon"
            icon
            elevation="0"
            color="background"
            :class="{ nudge: !userStore.loggedIn }"
            @click="toggleSave"
          >
            <v-icon v-if="pokemonInstance?.saved" color="strength" size="32">mdi-bookmark</v-icon>
            <v-icon v-else-if="pokemonInstance" size="32">mdi-bookmark-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Pokemon header -->
    <v-sheet color="surface" width="100%" :height="85" location="top left" position="absolute" style="margin-top: 50px">
      <v-btn
        v-if="pokemonInstance"
        icon
        color="surface"
        elevation="0"
        style="right: 4px; position: absolute"
        size="40"
        @click="toggleShiny"
      >
        <v-icon v-if="pokemonInstance.shiny" color="strength" size="24">mdi-creation</v-icon>
        <v-icon v-else size="24">mdi-creation-outline</v-icon>
      </v-btn>
      <GenderButton v-if="pokemonInstance" :pokemon-instance="pokemonInstance" @update-gender="updateGender" />
    </v-sheet>

    <v-row no-gutters class="py-0">
      <v-col class="flex-center">
        <PokemonButton :pokemon-instance="pokemonInstance" @update-pokemon="updatePokemon" />
      </v-col>
    </v-row>

    <!-- Body -->
    <div v-if="pokemonInstance">
      <!-- Body on desktop -->
      <v-row dense>
        <v-col cols="4" v-if="viewportWidth >= pokemonNameBreakpoint" class="flex-center">
          <LevelButton :disabled="!pokemonInstance" :level="pokemonInstance?.level ?? 60" @update-level="updateLevel" />
        </v-col>
        <v-col :cols="viewportWidth >= pokemonNameBreakpoint ? 4 : 12" class="flex-center">
          <PokemonName :disabled="!pokemonInstance" :pokemon-instance="pokemonInstance" @update-name="updateName" />
        </v-col>
        <v-col cols="4" v-if="viewportWidth >= pokemonNameBreakpoint" class="flex-center">
          <RibbonButton
            :disabled="!pokemonInstance"
            :pokemon-instance="pokemonInstance"
            @update-ribbon="updateRibbon"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col>
          <v-divider />
        </v-col>
      </v-row>

      <!-- Body on mobile -->
      <v-row dense class="mt-2" v-if="viewportWidth < pokemonNameBreakpoint">
        <v-col cols="12" class="level-ribbon-container">
          <LevelButton :level="pokemonInstance?.level ?? 60" @update-level="updateLevel" />
          <RibbonButton :pokemon-instance="pokemonInstance" @update-ribbon="updateRibbon" />
        </v-col>
      </v-row>

      <!-- Ingredients -->
      <v-row no-gutters class="mt-2 validatable-section" :class="{ 'invalid-section': !ingsAreValid }">
        <v-col cols="4" class="mr-2 flex-center">
          <span class="w-100 h-50 text-center flex-center ingredients-label">Ingredients</span>
        </v-col>
        <v-col class="flex-center">
          <IngredientButton
            :ingredient-level="0"
            :pokemon-instance="pokemonInstance"
            @update-ingredient="updateIngredient"
          />
        </v-col>
        <v-col class="flex-center">
          <IngredientButton
            :ingredient-level="30"
            :pokemon-instance="pokemonInstance"
            @update-ingredient="updateIngredient"
          />
        </v-col>
        <v-col class="flex-center">
          <IngredientButton
            :ingredient-level="60"
            :pokemon-instance="pokemonInstance"
            @update-ingredient="updateIngredient"
          />
        </v-col>
        <v-col cols="12" v-if="!ingsAreValid">
          <div class="text-center text-error-3 text-small">
            Level 30 ingredient must unlock before level 60 ingredient.
          </div>
        </v-col>
      </v-row>

      <!-- Mainskill -->
      <v-row no-gutters class="mt-2">
        <v-col cols="12">
          <!-- TODO: why does this say undefined is not supported when it should be optional in MainskillButton? -->
          <MainskillButton :pokemon-instance="pokemonInstance" @update-skill-level="updateSkillLevel" />
        </v-col>
      </v-row>

      <!-- Subskills -->
      <v-row dense class="mt-2">
        <v-col cols="12">
          <SubskillButtons
            :pokemon-level="pokemonInstance?.level ?? 0"
            :selected-subskills="pokemonInstance?.subskills ?? []"
            @update-subskills="updateSubskills"
          />
        </v-col>
      </v-row>

      <!-- Nature -->
      <v-row id="nature" class="mt-2" dense>
        <v-col cols="12">
          <NatureButton :nature="pokemonInstance?.nature ?? nature.BASHFUL" @update-nature="updateNature" />
        </v-col>
      </v-row>

      <!-- Action buttons (cancel, save) -->
      <v-row dense class="mt-2" v-if="preSelectedPokemonInstance">
        <v-col cols="6">
          <v-btn id="cancelButton" class="w-100 text-body" size="large" rounded="lg" color="surface" @click="cancel"
            >Cancel</v-btn
          >
        </v-col>
        <v-col cols="6">
          <v-btn
            id="saveButton"
            :disabled="!isValid"
            class="w-100 text-body"
            size="large"
            rounded="lg"
            color="primary"
            @click="save"
            >Save</v-btn
          >
        </v-col>
      </v-row>
      <v-row dense class="mt-6" v-else>
        <v-col cols="12">
          <v-btn id="continueButton" class="w-100 text-body" size="large" rounded="lg" color="primary" @click="save">
            Continue
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row dense class="my-6">
        <v-col cols="12" class="flex-center">
          <v-icon size="48" color="secondary">mdi-arrow-up-thin</v-icon>
        </v-col>
        <v-col cols="12" class="flex-center">
          <h3 class="text-center big-fine-print">Start by selecting a Pokemon above</h3>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import GenderButton from '@/components/pokemon-input/gender-button.vue'
import IngredientButton from '@/components/pokemon-input/IngredientButton.vue'
import LevelButton from '@/components/pokemon-input/level-button.vue'
import MainskillButton from '@/components/pokemon-input/MainskillButton.vue'
import SubskillButtons from '@/components/pokemon-input/menus/subskill-buttons.vue'
import NatureButton from '@/components/pokemon-input/nature-button.vue'
import PokemonButton from '@/components/pokemon-input/pokemon-button.vue'
import PokemonName from '@/components/pokemon-input/PokemonName.vue'
import RibbonButton from '@/components/pokemon-input/RibbonButton.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useUserStore } from '@/stores/user-store'
import {
  getPokemon,
  ingredientIndex,
  nature,
  RP,
  type IngredientSet,
  type PokemonGender,
  type PokemonInstanceExt,
  type SubskillInstanceExt
} from 'sleepapi-common'
import { computed, nextTick, ref, watch } from 'vue'

interface Props {
  preSelectedPokemonInstance?: PokemonInstanceExt
}

const props = defineProps<Props>()
const emit = defineEmits<{
  cancel: []
  save: [pokemonInstance: PokemonInstanceExt]
}>()

const userStore = useUserStore()
const { viewportWidth } = useBreakpoint()

const pokemonNameBreakpoint = 600

const initializePokemonInstance = (): PokemonInstanceExt | undefined => {
  if (props.preSelectedPokemonInstance) {
    const { pokemon: _, ...pokemonInstanceWithoutPokemon } = props.preSelectedPokemonInstance

    return {
      // Deep clone all properties except pokemon to avoid mutating the original
      ...JSON.parse(JSON.stringify(pokemonInstanceWithoutPokemon)),
      // Get fresh pokemon instance with classes intact
      pokemon: getPokemon(props.preSelectedPokemonInstance.pokemon.name)
    }
  }
}

const pokemonInstance = ref<PokemonInstanceExt | undefined>(initializePokemonInstance())

watch(
  pokemonInstance,
  (newPokemon: PokemonInstanceExt | undefined) => {
    if (!newPokemon) return

    nextTick(() => {
      if (!pokemonInstance.value) {
        pokemonInstance.value = newPokemon
      }
      const rp = new RP({ ...newPokemon, ingredients: newPokemon.ingredients.filter(Boolean) })
      pokemonInstance.value.rp = rp.calc()
    })
  },
  { deep: true }
)

// if the second ingredient is locked, the third cannot be selected
// this refers to mythicals' locked ingredients, not level-based locking
const ingsAreValid = computed(() => {
  if (!pokemonInstance.value) return true
  return !(
    pokemonInstance.value?.ingredients.at(1)?.ingredient.name == 'Locked' &&
    pokemonInstance.value?.ingredients.at(2)?.ingredient.name !== 'Locked'
  )
})

const isValid = computed(() => ingsAreValid.value && pokemonInstance.value !== undefined)

const toggleSave = () => {
  if (userStore.loggedIn && pokemonInstance.value) {
    pokemonInstance.value.saved = !pokemonInstance.value.saved
  }
}

const toggleShiny = () => {
  if (pokemonInstance.value) {
    pokemonInstance.value.shiny = !pokemonInstance.value.shiny
  }
}

const updateGender = (gender: PokemonGender) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.gender = gender
  }
}

const updateSubskills = (updatedSubskills: SubskillInstanceExt[]) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.subskills = updatedSubskills
    pokemonInstance.value.subskills.sort((a, b) => a.level - b.level)
  }
}

const updatePokemon = (instance: PokemonInstanceExt) => {
  pokemonInstance.value = instance
}

const updateName = (newName: string) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.name = newName
  }
}

const updateLevel = (newLevel: number) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.level = newLevel
  }
}

const updateIngredient = (params: { ingredientSet: IngredientSet; ingredientLevel: number }) => {
  if (pokemonInstance.value) {
    const index = ingredientIndex(params.ingredientLevel)
    pokemonInstance.value.ingredients[index] = {
      level: params.ingredientLevel,
      ingredient: params.ingredientSet.ingredient,
      amount: params.ingredientSet.amount
    }
  }
}

const updateSkillLevel = (skillLevel: number) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.skillLevel = skillLevel
  }
}

const updateNature = (newNature: nature.Nature) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.nature = newNature
  }
}

const updateRibbon = (newRibbon: number) => {
  if (pokemonInstance.value) {
    pokemonInstance.value.ribbon = newRibbon
  }
}

const cancel = () => {
  emit('cancel')
}

const save = () => {
  if (pokemonInstance.value) {
    emit('save', pokemonInstance.value)
  }
}
</script>

<style lang="scss">
.validatable-section {
  border: 2px solid transparent; //to keep the section from moving when the error border is added
}

.invalid-section {
  background-color: rgba($error-3, 0.2);
  border: 2px solid $error-3;
}

.level-ribbon-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ingredients-label {
  background-color: $surface;
  border-radius: 64px;
}

.nowrap {
  display: flex;
  align-items: center;
}

.big-fine-print {
  font-size: 18px;
  font-weight: 300;
  color: #9e9e9e;
}
</style>
