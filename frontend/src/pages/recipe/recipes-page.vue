<template>
  <v-container class="pa-2">
    <v-row class="frosted-glass pa-2 flex-column" no-gutters>
      <!-- Title and sort -->
      <v-row class="justify-space-between">
        <v-col class="flex-left" :class="isMobile ? 'text-h5' : 'text-h4 font-weight-semibold'"> Recipes </v-col>
        <v-col v-if="isMobile" class="flex-right">
          <v-menu>
            <template #activator="{ props }">
              <v-btn append-icon="mdi-chevron-down" color="secondary" dark v-bind="props">
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
import { capitalize, defineComponent, reactive, ref } from 'vue'

export type UserRecipe = Recipe & { level: number; userStrength: number }

export default defineComponent({
  name: 'RecipesPage',
  components: { RecipeTableDesktop, RecipeTableMobile, NumberInput, IngredientSelection },
  async setup() {
    const userStore = useUserStore()
    const { isMobile, viewportWidth } = useViewport()
    const loggedIn = userStore.loggedIn
    const loading = ref(false)
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
      isTablet: viewportWidth.value >= 600,
      loggedIn,
      userRecipes,
      capitalize,
      MAX_POT_SIZE,
      MIN_POT_SIZE
    }
  },
  data() {
    return {
      selectedSort: 'value',
      searchQuery: '',
      selectedTypes: [] as string[],
      chips: ['curry', 'salad', 'dessert'] as RecipeType[],
      potSizeRange: [7, 102], // TODO: not hard-code
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
        (recipe) => recipe.nrOfIngredients <= this.potSizeRange[1] && recipe.nrOfIngredients >= this.potSizeRange[0]
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
        return [...filtered].sort((a, b) => {
          switch (this.selectedSort) {
            case 'value':
              return b.userStrength - a.userStrength
            case 'baseValue':
              return b.value - a.value
            case 'level':
              return b.level - a.level
            case 'ingredientCount':
              return b.nrOfIngredients - a.nrOfIngredients
            case 'name':
              return b.name.localeCompare(a.name)
            case 'recipeBonus':
              return b.bonus - a.bonus
            default:
              return 0
          }
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
      if (newSort === 'level' && !this.loggedIn) {
        return
      }
      this.selectedSort = newSort
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
    }
  }
})
</script>
