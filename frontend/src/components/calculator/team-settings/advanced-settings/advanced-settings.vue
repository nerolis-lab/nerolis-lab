<template>
  <v-dialog v-model="advancedMenu" max-width="550px">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        color="transparent"
        elevation="0"
        aria-label="advanced settings"
        @click="loadStockpileFromTeam"
      >
        <v-avatar size="48">
          <v-icon size="36" color="accent">mdi-cog</v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-card rounded="xl">
      <v-container>
        <v-row class="flex-center">
          <v-card-title class="text-h5">Advanced Settings</v-card-title>
        </v-row>

        <v-row dense>
          <v-col class="w-100">
            <span class="text-h6 text-no-wrap mb-2">Weekly Starting Inventory</span>
          </v-col>

          <v-col>
            <v-row dense :class="['flex-right', isMobile ? 'justify-space-between' : '', 'flex-nowrap']">
              <v-col cols="auto">
                <v-chip :color="ingredientChipColor" variant="outlined">
                  <v-img src="/images/ingredient/ingredients.png" class="me-2" contain width="24" height="24"></v-img>
                  <span class="font-weight-medium">
                    {{ stockpiledIngredientsAmount }} / {{ MAX_INGREDIENT_INVENTORY }}
                  </span>
                </v-chip>
              </v-col>

              <v-col cols="auto">
                <v-chip variant="outlined">
                  <v-img src="/images/berries/berries.png" class="me-2" contain width="24" height="24"></v-img>
                  <span class="font-weight-medium">{{ stockpiledBerryAmount }}</span>
                </v-chip>
              </v-col>
            </v-row>
          </v-col>

          <span v-if="stockpiledIngredientsAmount > MAX_INGREDIENT_INVENTORY" class="text-strength">
            Exceeding the ingredient inventory limit requires your Pokémon to start the week holding ingredients
          </span>
        </v-row>

        <v-row class="mb-2">
          <v-divider />
        </v-row>

        <v-row v-for="(ingredientSet, index) in stockpiledIngredients" :key="index" dense>
          <v-col>
            <v-text-field
              v-model="ingredientSet.amount"
              type="number"
              min="0"
              max="10000"
              hide-details="auto"
              bg-color="secondary"
              variant="outlined"
              density="compact"
              @focus="highlightText"
              :rules="[rules.minRule, rules.maxIngredientsRule]"
              @blur="ingredientSet.amount = ingredientSet.amount || 0"
            >
              <!-- Prepend Avatar -->
              <template #prepend-inner>
                <v-avatar size="32" class="mr-2">
                  <v-img :src="ingredientImage(ingredientSet.ingredient.name)" />
                </v-avatar>
              </template>

              <!-- Append Pencil Icon -->
              <template #append-inner>
                <v-icon>mdi-pencil</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <v-col :class="[isMobile ? '' : 'mr-6']" :cols="isMobile ? 'auto' : ''">
            <v-btn
              variant="flat"
              icon="mdi-close-circle"
              density="comfortable"
              @click="stockpiledIngredients.splice(index, 1)"
            >
            </v-btn>
          </v-col>
        </v-row>

        <IngredientSelection
          :pre-selected-ingredients="stockpiledIngredients.map((m) => m.ingredient)"
          @update-ingredients="addIngredients"
        />

        <v-row class="mb-3">
          <v-divider />
        </v-row>

        <v-row v-for="(berrySet, index) in stockpiledBerries" :key="index" no-gutters>
          <v-col>
            <v-text-field
              v-model="berrySet.amount"
              type="number"
              min="0"
              max="1000"
              hide-details="auto"
              bg-color="secondary"
              variant="outlined"
              density="compact"
              @focus="highlightText"
              :rules="[rules.minRule, rules.maxBerriesRule]"
              @blur="berrySet.amount = berrySet.amount || 0"
            >
              <!-- Prepend Avatar -->
              <template #prepend-inner>
                <v-avatar size="20" class="mr-2">
                  <v-img :src="berryImage(berrySet.berry)" />
                </v-avatar>
              </template>

              <!-- Append Pencil Icon -->
              <template #append-inner>
                <v-icon size="20">mdi-pencil</v-icon>
              </template>
            </v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              v-model="berrySet.level"
              type="number"
              min="1"
              max="100"
              :hide-details="shouldHideDetails({ amount: berrySet.level, min: 1, max: 100 })"
              bg-color="secondary"
              variant="outlined"
              density="compact"
              @focus="highlightText"
              :rules="[rules.minLevelRule, rules.maxLevelRule]"
              @blur="berrySet.level = berrySet.level || 60"
              class="ml-2"
            >
              <!-- Prepend Avatar -->
              <template #prepend-inner> <span>Lv.</span></template>

              <!-- Append Pencil Icon -->
              <template #append-inner>
                <v-icon size="20">mdi-pencil</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="flat" icon="mdi-close-circle" @click="stockpiledBerries.splice(index, 1)"> </v-btn>
          </v-col>
        </v-row>

        <v-menu v-model="berryMenuOpen" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-row no-gutters>
              <v-col>
                <v-btn
                  append-icon="mdi-chevron-down"
                  color="secondary"
                  aria-label="add berries"
                  v-bind="props"
                  class="w-100"
                  @click="initializeBerryMenuSelection"
                >
                  Berries
                </v-btn>
              </v-col>
            </v-row>
          </template>

          <v-container
            class="bg-secondary-dark flex-center flex-column elevation-10"
            :style="{ 'max-width': '518px', width: `${viewportWidth - 80}px` }"
          >
            <div class="text-subtitle-2 text-center font-weight-light mb-4">
              Click to add up to 5 berries. You can click the same berry multiple times. You can set the individual
              amounts after clicking add.
            </div>

            <v-row class="flex-left" dense>
              <v-col
                v-for="(berryOption, index) in berryDefaultOptions"
                :key="index"
                class="flex-left flex-column"
                cols="3"
              >
                <v-card
                  variant="flat"
                  class="flex-left flex-column w-100 mx-2"
                  color="secondary-medium-dark"
                  @click="addBerryToMenuSelection(berryOption)"
                  :disabled="menuSelectedBerries.length >= MAX_TEAM_SIZE"
                >
                  <span v-if="!isMobile">{{ berryOption.berry.name }}</span>
                  <v-avatar size="32">
                    <v-img :src="berryImage(berryOption.berry)" />
                  </v-avatar>
                </v-card>
              </v-col>
            </v-row>

            <!-- Chip group to show selected berries -->
            <v-row dense class="mt-2 w-100">
              <v-col class="pa-0">
                <v-sheet color="secondary" rounded min-height="48">
                  <v-chip-group column multiple class="ml-2">
                    <v-chip v-for="(berry, index) in menuSelectedBerries" :key="berry.uuid" class="mx-1">
                      <v-avatar size="24">
                        <v-img :src="berryImage(berry.berry)" />
                      </v-avatar>
                      <v-icon small class="ml-1" @click.stop="removeBerryFromMenuSelection(index)">
                        mdi-close-circle
                      </v-icon>
                    </v-chip>
                  </v-chip-group>
                </v-sheet>
              </v-col>
            </v-row>

            <v-row dense class="mt-2 justify-space-between flex-center w-100">
              <v-col cols="5" class="flex-left">
                <v-btn
                  id="cancelButton"
                  class="w-100"
                  size="large"
                  rounded="lg"
                  color="secondary-medium-dark"
                  @click="closeBerryMenu"
                >
                  Cancel
                </v-btn>
              </v-col>
              <v-col cols="5" class="flex-right">
                <v-btn
                  id="addButton"
                  class="w-100"
                  size="large"
                  rounded="lg"
                  color="primary"
                  @click="commitBerrySelection"
                >
                  Add
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-menu>

        <v-row dense class="mt-4">
          <v-col cols="6">
            <v-btn
              id="cancelButton"
              class="w-100 responsive-text"
              size="large"
              rounded="lg"
              color="secondary"
              @click="toggleAdvancedMenu"
              >Cancel</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn
              :disabled="isSaveDisabled"
              id="saveButton"
              class="w-100 responsive-text"
              size="large"
              rounded="lg"
              color="primary"
              @click="save"
              >Save</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { berryImage, ingredientImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import {
  berry,
  berryPowerForLevel,
  capitalize,
  getBerry,
  getIngredient,
  MAX_INGREDIENT_INVENTORY,
  MAX_STOCKPILED_BERRIES,
  MAX_TEAM_SIZE,
  uuid,
  type BerrySet,
  type Ingredient,
  type IngredientSet
} from 'sleepapi-common'
import { defineComponent } from 'vue'

export interface BerrySetUnique extends BerrySet {
  uuid: string
}

export default defineComponent({
  name: 'AdvancedMenu',
  components: {
    IngredientSelection
  },
  emits: ['save'],
  setup() {
    const teamStore = useTeamStore()
    const { isMobile, viewportWidth } = useBreakpoint()
    return {
      teamStore,
      MAX_INGREDIENT_INVENTORY,
      ingredientImage,
      berryImage,
      berryPowerForLevel,
      capitalize,
      isMobile,
      viewportWidth,
      MAX_TEAM_SIZE
    }
  },
  data: () => ({
    advancedMenu: false,
    ingredientMenuOpen: false,
    berryMenuOpen: false,

    stockpiledIngredients: [] as IngredientSet[],
    stockpiledBerries: [] as BerrySetUnique[],

    menuSelectedIngredients: [] as IngredientSet[],
    menuSelectedBerries: [] as BerrySetUnique[],
    rules: {
      minRule: (value: number) => value >= 0 || 'Value must be at least 0',
      maxIngredientsRule: (value: number) => value <= 10000 || `Value must be 10000 or less`,
      maxBerriesRule: (value: number) =>
        value <= MAX_STOCKPILED_BERRIES * MAX_TEAM_SIZE ||
        `Value must be ${MAX_STOCKPILED_BERRIES * MAX_TEAM_SIZE} or less`,
      minLevelRule: (value: number) => value >= 1 || 'Value must be at least 1',
      maxLevelRule: (value: number) => value <= 100 || 'Value must be 100 or less'
    }
  }),
  methods: {
    loadStockpileFromTeam() {
      this.stockpiledIngredients = this.teamStore.getCurrentTeam.stockpiledIngredients.map((ingredient) => ({
        ingredient: getIngredient(ingredient.name),
        amount: ingredient.amount
      }))
      this.stockpiledBerries = this.teamStore.getCurrentTeam.stockpiledBerries.map((berry) => ({
        berry: getBerry(berry.name),
        amount: berry.amount,
        level: berry.level,
        uuid: uuid.v4()
      }))
    },
    toggleAdvancedMenu() {
      this.advancedMenu = !this.advancedMenu
    },
    highlightText(event: FocusEvent) {
      const target = event.target as HTMLInputElement

      setTimeout(() => target.select(), 1)
    },
    addIngredients(ingredients: Ingredient[]) {
      this.stockpiledIngredients = ingredients.map((ingredient) => ({
        ingredient,
        amount: this.stockpiledIngredients.find((i) => i.ingredient.name === ingredient.name)?.amount || 0
      }))
    },
    initializeBerryMenuSelection() {
      this.menuSelectedBerries = [...this.stockpiledBerries]
    },
    closeBerryMenu() {
      this.berryMenuOpen = false
    },
    addBerryToMenuSelection(berryOption: BerrySetUnique) {
      this.menuSelectedBerries.push({
        berry: berryOption.berry,
        amount: 1,
        level: 1,
        uuid: uuid.v4()
      })
    },
    removeBerryFromMenuSelection(index: number) {
      this.menuSelectedBerries.splice(index, 1)
    },
    commitBerrySelection() {
      this.stockpiledBerries = [...this.menuSelectedBerries]
      this.closeBerryMenu()
    },
    save() {
      const ingredients = this.stockpiledIngredients.map((ingredient) => ({
        name: ingredient.ingredient.name,
        amount: ingredient.amount
      }))
      const berries = this.stockpiledBerries.map((berry) => ({
        name: berry.berry.name,
        amount: berry.amount,
        level: berry.level
      }))

      this.$emit('save', { ingredients, berries })
      this.toggleAdvancedMenu()
    },
    shouldHideDetails(params: { amount: number; min: number; max: number }): boolean {
      const { amount, min, max } = params
      return amount >= min && amount <= max
    },
    validateRule(rule: (value: number) => boolean | string, value: number): boolean {
      // Return true if the rule fails (i.e., returns a string)
      return typeof rule(value) === 'string'
    }
  },
  computed: {
    berryDefaultOptions(): BerrySetUnique[] {
      return berry.BERRIES.map((berry) => ({
        berry,
        amount: 0,
        level: 1,
        uuid: uuid.v4()
      })).sort((a, b) => a.berry.name.localeCompare(b.berry.name))
    },
    stockpiledIngredientsAmount(): number {
      return this.stockpiledIngredients.reduce((acc, ingredient) => acc + Number(ingredient.amount), 0)
    },
    stockpiledBerryAmount(): number {
      return this.stockpiledBerries.reduce((acc, berry) => acc + Number(berry.amount), 0)
    },
    ingredientChipColor(): string {
      return this.stockpiledIngredientsAmount > MAX_INGREDIENT_INVENTORY ? 'strength' : 'default'
    },
    isSaveDisabled(): boolean {
      const ingredientsInvalid = this.stockpiledIngredients.some((ingredient) => {
        return (
          this.validateRule(this.rules.minRule, ingredient.amount) ||
          this.validateRule(this.rules.maxIngredientsRule, ingredient.amount)
        )
      })

      const berriesInvalid = this.stockpiledBerries.some((berry) => {
        return (
          this.validateRule(this.rules.minRule, berry.amount) ||
          this.validateRule(this.rules.maxBerriesRule, berry.amount) ||
          this.validateRule(this.rules.minLevelRule, berry.level) ||
          this.validateRule(this.rules.maxLevelRule, berry.level)
        )
      })

      return ingredientsInvalid || berriesInvalid
    }
  }
})
</script>

<style scoped lang="scss">
.grid-container {
  display: grid;
  grid-gap: 10px;
  justify-content: center;
  align-content: flex-start;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));

  &.desktop {
    grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
  }
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
}
</style>
