<template>
  <v-card color="background" class="pa-4">
    <div class="flex-center">
      <v-row style="position: absolute; top: 0; width: 100%">
        <v-col class="flex-left">
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
            <v-icon v-if="pokemonInstance.saved" color="strength" size="32">mdi-bookmark</v-icon>
            <v-icon v-else size="32">mdi-bookmark-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <v-sheet color="surface" width="100%" :height="85" location="top left" position="absolute" style="margin-top: 50px">
      <v-btn icon color="surface" elevation="0" style="right: 4px; position: absolute" size="40" @click="toggleShiny">
        <v-icon v-if="pokemonInstance.shiny" color="strength" size="24">mdi-creation</v-icon>
        <v-icon v-else size="24">mdi-creation-outline</v-icon>
      </v-btn>
      <GenderButton :pokemon-instance="pokemonInstance" @update-gender="updateGender" />
    </v-sheet>

    <v-row no-gutters class="py-0">
      <v-col class="flex-center">
        <PokemonButton :pokemon-instance="pokemonInstance" @update-pokemon="updatePokemon" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="4" v-if="viewportWidth >= pokemonNameBreakpoint" class="flex-center">
        <LevelButton :level="pokemonInstance.level" @update-level="updateLevel" />
      </v-col>
      <v-col :cols="viewportWidth >= pokemonNameBreakpoint ? 4 : 12" class="flex-center">
        <PokemonName :pokemon-instance="pokemonInstance" @update-name="updateName" />
      </v-col>
      <v-col cols="4" v-if="viewportWidth >= pokemonNameBreakpoint" class="flex-center">
        <RibbonButton :pokemon-instance="pokemonInstance" @update-ribbon="updateRibbon" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>

    <v-row dense class="mt-2" v-if="viewportWidth < pokemonNameBreakpoint">
      <v-col cols="12" class="level-ribbon-container">
        <LevelButton :level="pokemonInstance.level" @update-level="updateLevel" />
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
        <MainskillButton :pokemon-instance="pokemonInstance" @update-skill-level="updateSkillLevel" />
      </v-col>
    </v-row>

    <v-row dense class="mt-2">
      <v-col cols="12">
        <SubskillButtons
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskills="updateSubskills"
        />
      </v-col>
    </v-row>

    <v-row id="nature" class="mt-2" dense>
      <v-col cols="12">
        <NatureButton :nature="pokemonInstance.nature" @update-nature="updateNature" />
      </v-col>
    </v-row>

    <v-row dense class="mt-2">
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
  </v-card>
</template>

<script lang="ts">
import CarrySizeDisplay from '@/components/pokemon-input/carry-size-display.vue'
import GenderButton from '@/components/pokemon-input/gender-button.vue'
import IngredientButton from '@/components/pokemon-input/ingredient-button.vue'
import LevelButton from '@/components/pokemon-input/level-button.vue'
import MainskillButton from '@/components/pokemon-input/mainskill-button.vue'
import SubskillButtons from '@/components/pokemon-input/menus/subskill-buttons.vue'
import NatureButton from '@/components/pokemon-input/nature-button.vue'
import PokemonButton from '@/components/pokemon-input/pokemon-button.vue'
import PokemonName from '@/components/pokemon-input/pokemon-name.vue'
import RibbonButton from '@/components/pokemon-input/ribbon-button.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useTeamStore } from '@/stores/team/team-store'
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
import { defineComponent, nextTick, type PropType } from 'vue'

export default defineComponent({
  name: 'PokemonInput',
  components: {
    SubskillButtons,
    PokemonButton,
    PokemonName,
    LevelButton,
    CarrySizeDisplay,
    IngredientButton,
    MainskillButton,
    NatureButton,
    RibbonButton,
    GenderButton
  },
  props: {
    preSelectedPokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['cancel', 'save'],
  setup() {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    const { viewportWidth } = useBreakpoint()

    const pokemonNameBreakpoint = 600

    return { teamStore, userStore, viewportWidth, pokemonNameBreakpoint }
  },
  data(this: { preSelectedPokemonInstance: PokemonInstanceExt }) {
    const { pokemon: _, ...pokemonInstanceWithoutPokemon } = this.preSelectedPokemonInstance

    return {
      pokemonInstance: {
        // Deep clone all properties except pokemon to avoid mutating the original
        ...JSON.parse(JSON.stringify(pokemonInstanceWithoutPokemon)),
        // Get fresh pokemon instance with classes intact
        pokemon: getPokemon(this.preSelectedPokemonInstance.pokemon.name)
      } as PokemonInstanceExt
    }
  },
  watch: {
    pokemonInstance: {
      deep: true,
      handler(newPokemon: PokemonInstanceExt) {
        nextTick(() => {
          const rp = new RP({ ...newPokemon, ingredients: newPokemon.ingredients.filter(Boolean) })
          this.pokemonInstance.rp = rp.calc()
        })
      }
    }
  },
  computed: {
    isValid() {
      return this.ingsAreValid
    },
    ingsAreValid() {
      // if the second ingredient is locked, the third cannot be selected
      // this refers to mythicals' locked ingredients, not level-based locking
      return !(
        this.pokemonInstance.ingredients[1].ingredient.name == 'Locked' &&
        this.pokemonInstance.ingredients[2].ingredient.name !== 'Locked'
      )
    }
  },
  methods: {
    toggleSave() {
      if (this.userStore.loggedIn) {
        this.pokemonInstance.saved = !this.pokemonInstance.saved
      }
    },
    toggleShiny() {
      this.pokemonInstance.shiny = !this.pokemonInstance.shiny
    },
    updateGender(gender: PokemonGender) {
      this.pokemonInstance.gender = gender
    },
    updateSubskills(updatedSubskills: SubskillInstanceExt[]) {
      this.pokemonInstance.subskills = updatedSubskills
      this.pokemonInstance.subskills.sort((a, b) => a.level - b.level)
    },
    updatePokemon(instance: PokemonInstanceExt) {
      this.pokemonInstance = instance
    },
    updateName(newName: string) {
      this.pokemonInstance.name = newName
    },
    updateLevel(newLevel: number) {
      this.pokemonInstance.level = newLevel
    },
    updateCarry(newLimit: number) {
      this.pokemonInstance.carrySize = newLimit
    },
    updateIngredient(params: { ingredientSet: IngredientSet; ingredientLevel: number }) {
      const index = ingredientIndex(params.ingredientLevel)
      this.pokemonInstance.ingredients[index] = {
        level: params.ingredientLevel,
        ingredient: params.ingredientSet.ingredient,
        amount: params.ingredientSet.amount
      }
    },
    updateSkillLevel(skillLevel: number) {
      this.pokemonInstance.skillLevel = skillLevel
    },
    updateNature(newNature: nature.Nature) {
      this.pokemonInstance.nature = newNature
    },
    updateRibbon(newRibbon: number) {
      this.pokemonInstance.ribbon = newRibbon
    },
    resetSubskills() {
      this.pokemonInstance.subskills = []
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      this.$emit('save', this.pokemonInstance)
    }
  }
})
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
</style>
