<template>
  <v-row dense class="mt-0 mx-0" :class="{ 'frosted-glass': !selectable }">
    <v-col v-for="recipe in recipes" :key="recipe.name" cols="12" :class="selectable ? 'px-0' : 'px-2'">
      <v-card
        :rounded="selectable ? 'lg' : 'xl'"
        class="pa-2 recipe-card"
        :color="selectable ? 'secondary' : undefined"
        :elevation="selectable ? 0 : undefined"
        :link="selectable"
        :aria-label="selectable ? `Select ${recipe.displayName}` : undefined"
        @click="selectable && $emit('select', recipe)"
      >
        <div class="recipe-grid">
          <div class="recipe-name ml-2 font-weight-semibold">{{ recipe.displayName }}</div>
          <div class="right-column recipe-strength">
            <v-chip class="flex-center text-body-1" variant="outlined" color="strength">
              <img :src="'/images/misc/strength.png'" height="16" class="mr-1" />
              {{ localizeNumber(recipe.userStrength) }}
            </v-chip>
          </div>

          <div class="recipe-details d-flex align-center">
            <img :src="recipeImage(recipe.name)" height="54" />
            <div class="d-flex flex-column ml-2">
              <span class="text-no-wrap">{{ recipe.nrOfIngredients }} ingredients</span>
              <span class="text-no-wrap">{{ recipe.bonus }}% bonus</span>
            </div>
          </div>
          <div class="right-column recipe-level" @click.stop @keydown.stop @keyup.stop>
            <RecipeLevelButton
              v-model="recipe.level"
              :recipe-name="recipe.name"
              @updateLevel="onUpdateLevel(recipe, $event)"
            />
          </div>

          <div class="recipe-ingredients d-flex flex-nowrap">
            <div v-for="({ ingredient, amount }, index) in recipe.ingredients" :key="index" class="flex-center mr-2">
              <img :src="ingredientImage(ingredient.name)" height="24" />
              <span>{{ amount }}</span>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import RecipeLevelButton from '@/components/recipe/recipe-level-button.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import type { UserRecipe } from '@/types/recipe/user-recipe'
import { localizeNumber, MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RecipeTableMobile',
  components: { RecipeLevelButton },
  props: {
    selectable: Boolean,
    recipes: {
      type: Array as () => UserRecipe[],
      required: true
    }
  },
  setup() {
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const loggedIn = userStore.loggedIn
    return {
      recipeImage,
      ingredientImage,
      localizeNumber,
      MAX_RECIPE_LEVEL,
      highlightText,
      loggedIn
    }
  },
  emits: ['updateLevel', 'select'],
  methods: {
    onUpdateLevel(recipe: UserRecipe, newLevel: number) {
      this.$emit('updateLevel', recipe, newLevel)
    }
  }
})
</script>

<style scoped lang="scss">
.compact-x {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.no-uppercase {
  text-transform: none !important;
}

.recipe-card {
  container-type: inline-size;
}

.recipe-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'name name' 'details details' 'ingredients ingredients' 'strength level';
  gap: 8px;
  align-items: center;
}

.recipe-name {
  grid-area: name;
  overflow-wrap: anywhere;
}

.recipe-details {
  grid-area: details;
}

.recipe-strength {
  grid-area: strength;
  justify-self: start;
}

.recipe-level {
  grid-area: level;
  width: 100px;
}

.recipe-ingredients {
  grid-area: ingredients;
  min-width: 0;
}

.right-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@container (min-width: 400px) {
  .recipe-grid {
    grid-template-areas: 'name strength' 'details level' 'ingredients ingredients';
  }

  .recipe-strength {
    justify-self: stretch;
  }
}
</style>
