<template>
  <v-container :class="!isLargeDesktop ? 'pa-2' : 'flex-top'">
    <v-row
      class="frosted-glass pa-2 flex-column"
      :class="isLargeDesktop ? 'mr-3' : ''"
      :style="isLargeDesktop ? ['min-width: 500px', 'position: sticky', 'top: 80px'] : ''"
      no-gutters
    >
      <!-- Title and sort -->
      <v-row dense>
        <v-col
          class="d-flex flex-wrap justify-space-between"
          :class="isMobile ? 'text-h5' : 'text-h5 font-weight-semibold'"
        >
          {{ isLargeDesktop ? 'Filters' : 'Recipes' }}
          <div v-if="isMobile">
            <DropdownSort
              v-model="selectedSort"
              v-model:sort-ascending="sortAscending"
              :sort-options="computedSortOptions"
              color="secondary"
            />
          </div>
        </v-col>
      </v-row>

      <!-- Chip Group Row for filtering by recipe type -->
      <v-row dense class="flex-left">
        <v-chip-group v-model="selectedTypes" multiple>
          <CustomChip
            v-for="chip in chips"
            :key="chip"
            :value="chip"
            :color="chip"
            :is-selected="selectedTypes.includes(chip)"
            :append-avatar="recipeTypeImage(chip)"
            :text="capitalize(chip)"
          />
        </v-chip-group>
      </v-row>

      <v-row no-gutters class="flex-left my-1 w-100 text-body-1" :class="isMobile ? 'flex-column' : 'flex-row'">
        <v-col :cols="isMobile || isLargeDesktop ? '' : '6'" class="flex-nowrap flex-left">
          <v-col cols="auto" class="pa-0"> Size </v-col>
          <v-col cols="auto" class="mx-1 pa-0">
            <NumberInput
              v-model="potSizeRange[0]"
              style="max-width: 58px"
              :show-status="false"
              @update-number="updatePotSize"
              :min="minIngredients"
              :max="maxIngredients"
            />
          </v-col>
          <v-col class="pa-0">
            <v-range-slider
              v-model="potSizeRange"
              :max="maxIngredients"
              :min="7"
              :step="3"
              thumb-label
              color="accent"
              hide-details
              @end="updatePotSize"
              min-width="140px"
            />
          </v-col>
          <v-col cols="auto" class="mx-1 pa-0">
            <NumberInput
              v-model="potSizeRange[1]"
              style="max-width: 58px"
              :show-status="false"
              @update-number="updatePotSize"
              :min="minIngredients"
              :max="maxIngredients"
            />
          </v-col>
        </v-col>
        <v-col cols="auto" class="flex-center" v-if="!isMobile" style="align-self: stretch"> </v-col>
      </v-row>

      <v-row dense>
        <v-col :cols="isMobile || isLargeDesktop ? '' : '6'">
          <IngredientSelection
            :pre-selected-ingredients="filteredIngredients"
            @update-ingredients="updateFilteredIngredients"
          />
        </v-col>
      </v-row>

      <v-row dense :class="isMobile ? 'flex-column' : 'flex-row'">
        <v-col v-if="!isLargeDesktop" v:cols="isMobile ? '' : '6'" class="flex-left">
          <span v-if="loggedIn" class="text-strength text-body-1">
            Setting your recipe levels here will affect calculations across Neroli's Lab
          </span>
          <span v-else class="text-strength text-body-1"> Please log in to configure your recipe levels </span>
        </v-col>
        <v-col cols="1" class="flex-center" v-if="!isMobile && !isLargeDesktop" style="align-self: stretch"> </v-col>
        <v-col :cols="isMobile || isLargeDesktop ? '' : '5'" class="flex-right">
          <CustomSearchBar v-model="searchQuery" density="compact" label="Search recipes..." />
        </v-col>
      </v-row>
    </v-row>

    <RecipeTableMobile v-if="isMobile" :recipes="filteredRecipes" @update-level="updateRecipeLevel" />
    <RecipeTableDesktop v-else :recipes="filteredRecipes" @update-level="updateRecipeLevel" />
  </v-container>
</template>

<script lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import DropdownSort from '@/components/custom-components/dropdown-sort/DropdownSort.vue'
import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import RecipeTableDesktop from '@/components/recipe/recipe-table-desktop.vue'
import RecipeTableMobile from '@/components/recipe/recipe-table-mobile.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import { calculateRecipeValue, MAX_POT_SIZE, RECIPES, type Ingredient, type RecipeType } from 'sleepapi-common'
import { capitalize, defineComponent, reactive, ref } from 'vue'

export default defineComponent({
  name: 'RecipesPage',
  components: {
    RecipeTableDesktop,
    RecipeTableMobile,
    NumberInput,
    IngredientSelection,
    CustomChip,
    CustomSearchBar,
    DropdownSort
  },
  async setup() {
    const userStore = useUserStore()
    const { isMobile, isLargeDesktop } = useBreakpoint()
    const loggedIn = userStore.loggedIn
    const loading = ref(false)

    const userRecipes: UserRecipe[] = reactive(
      RECIPES.map((recipe) => {
        const level = 1
        const userStrength = recipe.value
        const sortedIngredients = recipe.ingredients.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))
        return {
          ...recipe,
          ingredients: sortedIngredients,
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
      isLargeDesktop,
      loggedIn,
      userRecipes,
      capitalize,
      MAX_POT_SIZE
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
      filteredIngredients: [] as Ingredient[],
      minIngredients,
      maxIngredients
    }
  },
  computed: {
    computedSortOptions() {
      return [
        {
          value: 'value',
          title: 'Value',
          description: 'Strength value at current recipe level',
          disabled: false
        },
        {
          value: 'baseValue',
          title: 'Base Value',
          description: 'Base strength value without recipe level',
          disabled: false
        },
        {
          value: 'level',
          title: 'Level',
          description: this.loggedIn ? 'Your current recipe level' : 'Requires logging in',
          disabled: !this.loggedIn
        },
        {
          value: 'ingredientCount',
          title: 'Size',
          description: 'The number of ingredients in the recipe',
          disabled: false
        },
        { value: 'name', title: 'Name', description: "The recipe's name", disabled: false },
        {
          value: 'recipeBonus',
          title: 'Bonus %',
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
    }
  },
  methods: {
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
