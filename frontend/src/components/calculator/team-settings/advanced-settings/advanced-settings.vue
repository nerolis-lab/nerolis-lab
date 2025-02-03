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
            Exceeding the ingredient inventory limit requires your Pokémon to start the week with holding ingredients
          </span>
        </v-row>

        <v-row>
          <v-divider />
        </v-row>

        <v-row>
          <v-col>
            <v-form>
              <v-autocomplete
                v-model="stockpiledIngredients"
                :items="ingredientDefaultOptions"
                item-text="ingredient.name"
                label="Add ingredients"
                prepend-inner-icon="mdi-magnify"
                multiple
                hide-details
                hide-selected
                :custom-filter="customIngredientFilter"
              >
                <template #selection="data">
                  <span></span>
                </template>

                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    density="compact"
                    :prepend-avatar="ingredientImage(item.raw.ingredient.name)"
                    :subtitle="`${item.raw.ingredient.value} value`"
                    :title="item.raw.ingredient.name"
                  />
                </template>
              </v-autocomplete>
            </v-form>
          </v-col>
        </v-row>

        <v-row v-for="(ingredientSet, index) in stockpiledIngredients" :key="index" dense>
          <v-col>
            <v-text-field
              v-model="ingredientSet.amount"
              type="number"
              min="0"
              max="1000"
              hide-details="auto"
              bg-color="secondary"
              variant="outlined"
              density="compact"
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

        <v-row>
          <v-divider />
        </v-row>

        <v-row class="pb-1">
          <v-col>
            <v-form>
              <v-autocomplete
                v-model="stockpiledBerries"
                :items="berryDefaultOptions"
                item-value="uuid"
                item-text="uuid"
                label="Add berries"
                prepend-inner-icon="mdi-magnify"
                multiple
                hide-details
                :custom-filter="customBerryFilter"
                :return-object="true"
                @update:model-value="addBerry"
              >
                <template #selection="data">
                  <span></span>
                </template>

                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :prepend-avatar="berryImage(item.raw.berry)"
                    density="compact"
                    :subtitle="`${capitalize(item.raw.berry.type)} - ${berryPowerForLevel(item.raw.berry, item.raw.level)} value`"
                    :title="item.raw.berry.name"
                  ></v-list-item>
                </template>
              </v-autocomplete>
            </v-form>
          </v-col>
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

        <v-row dense class="mt-2">
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
import { useViewport } from '@/composables/viewport-composable'
import { berryImage, ingredientImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import {
  berry,
  berryPowerForLevel,
  capitalize,
  getBerry,
  getIngredient,
  ingredient,
  MAX_INGREDIENT_INVENTORY,
  MAX_STOCKPILED_BERRIES,
  uuid,
  type BerrySet,
  type IngredientSet
} from 'sleepapi-common'
import { defineComponent } from 'vue'

export interface BerrySetUnique extends BerrySet {
  uuid: string
}

export default defineComponent({
  name: 'AdvancedMenu',
  emits: ['save'],
  setup() {
    const teamStore = useTeamStore()
    const { isMobile } = useViewport()
    return {
      teamStore,
      MAX_INGREDIENT_INVENTORY,
      ingredientImage,
      berryImage,
      berryPowerForLevel,
      capitalize,
      isMobile
    }
  },
  data: () => ({
    advancedMenu: false,
    stockpiledIngredients: [] as IngredientSet[],
    stockpiledBerries: [] as BerrySetUnique[],
    rules: {
      minRule: (value: number) => value >= 0 || 'Value must be at least 0',
      maxIngredientsRule: (value: number) =>
        value <= MAX_STOCKPILED_BERRIES || `Value must be ${MAX_STOCKPILED_BERRIES} or less`,
      maxBerriesRule: (value: number) =>
        value <= MAX_STOCKPILED_BERRIES * MAX_TEAM_MEMBERS ||
        `Value must be ${MAX_STOCKPILED_BERRIES * MAX_TEAM_MEMBERS} or less`,
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
    // item as type any since vuetify both doesn't export the type and also literally uses any internally
    customIngredientFilter(itemTitle: string, queryText: string, item?: { value: any; raw: IngredientSet }): boolean {
      const textOne = item?.raw.ingredient.name.toLowerCase()
      const textTwo = item?.raw.ingredient.longName.toLowerCase()
      const searchText = queryText.toLowerCase()

      return (!!textOne && textOne.indexOf(searchText) > -1) || (!!textTwo && textTwo.indexOf(searchText) > -1)
    },
    // item as type any since vuetify both doesn't export the type and also literally uses any internally
    customBerryFilter(itemTitle: string, queryText: string, item?: { value: any; raw: BerrySetUnique }): boolean {
      const textOne = item?.raw.berry.name.toLowerCase()
      const searchText = queryText.toLowerCase()

      return !!textOne && textOne.indexOf(searchText) > -1
    },
    shouldHideDetails(params: { amount: number; min: number; max: number }): boolean {
      const { amount, min, max } = params
      return amount >= min && amount <= max
    },
    addBerry(selectedBerries: BerrySetUnique[]) {
      this.stockpiledBerries[this.stockpiledBerries.length - 1] = {
        amount: 0,
        berry: selectedBerries[0].berry,
        level: 1,
        uuid: uuid.v4()
      }
    },
    validateRule(rule: (value: number) => boolean | string, value: number): boolean {
      // Return true if the rule fails (i.e., returns a string)
      return typeof rule(value) === 'string'
    }
  },
  computed: {
    ingredientDefaultOptions(): IngredientSet[] {
      return ingredient.INGREDIENTS.map((ingredient) => ({
        ingredient,
        amount: 0
      }))
        .filter(
          (ingredient) =>
            !this.stockpiledIngredients.some(
              (stockpiledIngredient) => stockpiledIngredient.ingredient.name === ingredient.ingredient.name
            )
        )
        .sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))
    },
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
      // Validate ingredients
      const ingredientsInvalid = this.stockpiledIngredients.some((ingredient) => {
        return (
          this.validateRule(this.rules.minRule, ingredient.amount) ||
          this.validateRule(this.rules.maxIngredientsRule, ingredient.amount)
        )
      })

      // Validate berries
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
