<template>
  <v-container class="pa-2">
    <v-row class="frosted-glass pa-2 flex-column" no-gutters>
      <!-- Title and sort -->
      <v-row dense>
        <v-col
          class="d-flex flex-wrap justify-space-between"
          :class="isMobile ? 'text-h5' : 'text-h4 font-weight-semibold'"
        >
          Recipes
          <div v-if="isMobile">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  :prepend-icon="sortAscending ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                  append-icon="mdi-chevron-down"
                  color="secondary"
                  dark
                  v-bind="props"
                >
                  Sort: {{ currentSortLabel }}
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="option in computedSortOptions"
                  :key="option.value"
                  :disabled="option.disabled"
                  @click="option.disabled ? null : selectSort(option.value)"
                >
                  <v-list-item-title>{{ option.title }}</v-list-item-title>
                  <v-list-item-subtitle :class="option.disabled ? 'text-primary' : ''">
                    {{ option.description }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-col>
      </v-row>

      <!-- Chip Group Row for filtering by recipe type -->
      <v-row dense class="flex-left">
        <v-chip-group v-model="selectedTypes" multiple>
          <v-chip
            v-for="chip in chips"
            :key="chip"
            :value="chip"
            :color="chip"
            :variant="selectedTypes.includes(chip) ? 'elevated' : 'outlined'"
            :append-avatar="recipeTypeImage(chip)"
            :style="!selectedTypes.includes(chip) ? { color: `var(--${chip})` } : {}"
          >
            {{ capitalize(chip) }}
          </v-chip>
        </v-chip-group>
      </v-row>

      <v-row no-gutters class="flex-center my-1 w-100" :class="isMobile ? 'flex-column' : 'flex-row'">
        <v-col :cols="isMobile ? '' : '6'" class="flex-nowrap flex-center">
          <v-col cols="auto" class="pa-0"> Size </v-col>
          <v-col cols="auto" class="ml-2 pa-0">
            <NumberInput :model-value="potSizeRange[0]" label="min" style="max-width: 58px" />
          </v-col>
          <v-col class="ml-1 pa-0">
            <v-range-slider
              v-model="potSizeRange"
              :max="102"
              :min="7"
              :step="3"
              thumb-label
              color="accent"
              hide-details
              @end="updatePotSize"
            />
          </v-col>
          <v-col cols="auto" class="ml-1 pa-0">
            <NumberInput :model-value="potSizeRange[1]" label="max" style="max-width: 58px" />
          </v-col>
        </v-col>
        <v-col cols="auto" class="flex-center" v-if="!isMobile" style="align-self: stretch"> </v-col>
        <v-col class="flex-center" :class="isMobile ? 'mt-2' : 'ml-2'">
          <IngredientSelection
            :pre-selected-ingredients="filteredIngredients"
            @update-ingredients="updateFilteredIngredients"
          />
        </v-col>
      </v-row>

      <v-row no-gutters :class="isMobile ? 'flex-column' : 'flex-row'">
        <v-col :cols="isMobile ? '' : '6'" class="flex-left">
          <span class="text-strength">
            Setting your recipe levels here will affect calculations across Neroli's Lab
          </span>
        </v-col>
        <v-col cols="1" class="flex-center" v-if="!isMobile" style="align-self: stretch"> </v-col>
        <v-col :cols="isMobile ? '' : '5'" class="flex-right">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            color="secondary"
            hide-details
            clearable
            class="ml-2"
            prepend-inner-icon="mdi-magnify"
            label="Search recipes..."
          />
        </v-col>
      </v-row>

      <!-- Recipe table row -->
      <RecipeTableMobile v-if="!isTablet" :recipes="filteredRecipes" @update-level="updateRecipeLevel" />
      <RecipeTableDesktop v-else :recipes="filteredRecipes" @update-level="updateRecipeLevel" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import RecipeTableDesktop from '@/components/recipe/recipe-table-desktop.vue'
import RecipeTableMobile from '@/components/recipe/recipe-table-mobile.vue'
import { useViewport } from '@/composables/viewport-composable'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import {
  calculateRecipeValue,
  MAX_POT_SIZE,
  MIN_POT_SIZE,
  RECIPES,
  type Ingredient,
  type Recipe,
  type RecipeType
} from 'sleepapi-common'
import { capitalize, computed, defineComponent, reactive, ref } from 'vue'

export type UserRecipe = Recipe & { level: number; userStrength: number }

export default defineComponent({
  name: 'RecipesPage',
  components: { RecipeTableDesktop, RecipeTableMobile, NumberInput, IngredientSelection },
  async setup() {
    const userStore = useUserStore()
    const { isMobile, viewportWidth } = useViewport()
    const loggedIn = userStore.loggedIn
    const loading = ref(false)
    const isTablet = computed(() => viewportWidth.value >= 600)

    const userRecipes: UserRecipe[] = reactive(
      RECIPES.map((recipe) => {
        const level = 1,
          userStrength = recipe.value
        return {
          ...recipe,
          userStrength,
          level
        }
      })
    )

    if (userStore.loggedIn) {
      loading.value = true
      const serverRecipes = await UserService.getRecipes()
      for (const userRecipe of userRecipes) {
        const userRecipeLevel = serverRecipes[userRecipe.name]
        if (userRecipeLevel) {
          userRecipe.level = userRecipeLevel
          userRecipe.userStrength = calculateRecipeValue({
            bonus: userRecipe.bonus,
            ingredients: userRecipe.ingredients,
            level: userRecipeLevel
          })
        }
      }
      loading.value = false
    }

    return {
      isMobile,
      isTablet,
      loggedIn,
      userRecipes,
      capitalize,
      MAX_POT_SIZE,
      MIN_POT_SIZE
    }
  },
  data() {
    const minIngredients = Math.min(...RECIPES.map((m) => m.nrOfIngredients))
    const maxIngredients = Math.max(...RECIPES.map((m) => m.nrOfIngredients))
    return {
      selectedSort: 'value',
      sortAscending: false,
      searchQuery: '',
      selectedTypes: [] as string[],
      chips: ['curry', 'salad', 'dessert'] as RecipeType[],
      potSizeRange: [minIngredients, maxIngredients],
      filterPotSizeRange: [minIngredients, maxIngredients],
      filteredIngredients: [] as Ingredient[]
    }
  },
  computed: {
    computedSortOptions() {
      return [
        {
          value: 'value',
          label: 'Value',
          title: 'Value',
          description: 'Strength value at current recipe level',
          disabled: false
        },
        {
          value: 'baseValue',
          label: 'Base Value',
          title: 'Base Value',
          description: 'Base strength value',
          disabled: false
        },
        {
          value: 'level',
          label: 'Level',
          title: 'Level',
          description: this.loggedIn ? 'Your current recipe level' : 'Requires logging in',
          disabled: !this.loggedIn
        },
        {
          value: 'ingredientCount',
          label: 'Ing. Count',
          title: 'Ingredient Count',
          description: 'The number of ingredients in the recipe',
          disabled: false
        },
        { value: 'name', label: 'Name', title: 'Name', description: "The recipe's name", disabled: false },
        {
          value: 'recipeBonus',
          label: 'Bonus %',
          title: 'Recipe bonus %',
          description: 'The bonus % the recipe applies to its ingredients',
          disabled: false
        }
      ]
    },
    filteredRecipes() {
      let filtered = this.userRecipes

      // **Filter by Chip Selection**
      if (this.selectedTypes && this.selectedTypes.length > 0) {
        // Assuming recipe.type is in lower-case; adjust if needed.
        filtered = filtered.filter((recipe) => this.selectedTypes.includes(recipe.type.toLowerCase()))
      }

      // **Filter by Search Query**
      if (this.searchQuery) {
        const searchTerm = this.searchQuery.toLowerCase()
        filtered = filtered.filter((recipe) => {
          const matchesName = recipe.name.toLowerCase().includes(searchTerm)
          const matchesType = recipe.type.toLowerCase().includes(searchTerm)
          const matchesIngredient = recipe.ingredients.some(({ ingredient }) =>
            ingredient.name.toLowerCase().includes(searchTerm)
          )
          return matchesName || matchesType || matchesIngredient
        })
      }

      // **Filter by currentPotSize**
      filtered = filtered.filter(
        (recipe) =>
          recipe.nrOfIngredients <= this.filterPotSizeRange[1] && recipe.nrOfIngredients >= this.filterPotSizeRange[0]
      )

      // **Filter by Ingredients**
      if (this.filteredIngredients.length > 0) {
        filtered = filtered.filter((recipe) =>
          this.filteredIngredients.every((ingredient) =>
            recipe.ingredients.some((recipeIngredient) => recipeIngredient.ingredient.name === ingredient.name)
          )
        )
      }

      // **Sorting**
      if (!this.isMobile) {
        return filtered.sort((a, b) => b.userStrength - a.userStrength)
      } else {
        const order = this.sortAscending ? 1 : -1

        return [...filtered].sort((a, b) => {
          let compareValue = 0
          switch (this.selectedSort) {
            case 'value':
              compareValue = a.userStrength - b.userStrength
              break
            case 'baseValue':
              compareValue = a.value - b.value
              break
            case 'level':
              compareValue = a.level - b.level
              break
            case 'ingredientCount':
              compareValue = a.nrOfIngredients - b.nrOfIngredients
              break
            case 'name':
              compareValue = a.name.localeCompare(b.name)
              break
            case 'recipeBonus':
              compareValue = a.bonus - b.bonus
              break
            default:
              compareValue = 0
          }
          return compareValue * order
        })
      }
    },
    currentSortLabel(): string {
      const found = this.computedSortOptions.find((option) => option.value === this.selectedSort)
      return found ? found.label : ''
    }
  },
  methods: {
    selectSort(newSort: string) {
      if (this.selectedSort === newSort) {
        this.sortAscending = !this.sortAscending
      } else {
        this.selectedSort = newSort
        this.sortAscending = false
      }
    },
    updateRecipeLevel(recipe: UserRecipe, newLevel: number) {
      const index = this.userRecipes.findIndex((r) => r.name === recipe.name)
      if (index !== -1) {
        this.userRecipes[index].level = newLevel
        this.userRecipes[index].userStrength = calculateRecipeValue({
          bonus: this.userRecipes[index].bonus,
          ingredients: this.userRecipes[index].ingredients,
          level: newLevel
        })
      }
    },
    recipeTypeImage(recipeType: RecipeType) {
      return recipeType === 'dessert' ? '/images/recipe/mixedjuice.png' : `/images/recipe/mixed${recipeType}.png`
    },
    updateFilteredIngredients(ingredients: Ingredient[]) {
      this.filteredIngredients = ingredients
    },
    updatePotSize() {
      this.filterPotSizeRange = [...this.potSizeRange]
    }
  }
})
</script>
