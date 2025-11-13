<template>
  <div class="recipe-card" :class="`recipe-type-${recipe.type}`">
    <div class="recipe-name">{{ formatRecipeName(recipe.displayName) }}</div>
    <div class="recipe-image-container">
      <img :src="recipeImage(recipe.name)" :alt="recipe.displayName" class="recipe-image" />
    </div>
    <div class="bonus-percentage">{{ Math.round(recipe.bonus) }}%</div>
    <div class="recipe-value">({{ getRecipeValue(recipe) }})</div>
    <div class="ingredient-list">
      <template v-for="ingredientSet in sortedIngredients" :key="ingredientSet.ingredient.name">
        <img
          :src="ingredientImage(ingredientSet.ingredient.name)"
          :alt="ingredientSet.ingredient.name"
          class="ingredient-icon"
        />
        <span class="ingredient-amount">{{ ingredientSet.amount }}</span>
      </template>
    </div>
    <div class="total-value">{{ recipe.nrOfIngredients }}</div>
  </div>
</template>

<script lang="ts">
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { calculateRecipeValue, type Recipe } from 'sleepapi-common'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'DishInfographicCard',
  props: {
    recipe: {
      type: Object as () => Recipe,
      required: true
    }
  },
  setup(props) {
    // calculate recipe value with bonus at level 1 (for display in parentheses)
    const getRecipeValue = (recipe: Recipe): number => {
      return calculateRecipeValue({
        bonus: recipe.bonus,
        ingredients: recipe.ingredients,
        level: 1
      })
    }

    // format recipe name to split into two lines if needed
    const formatRecipeName = (displayName: string): string => {
      // remove quotation marks
      let name = displayName.replace(/[""]/g, '')

      // if name has exactly two words, split them onto two lines
      const words = name.split(' ')
      if (words.length === 2) {
        name = words[0] + '\n' + words[1]
      }

      return name
    }

    const sortedIngredients = computed(() => {
      return [...props.recipe.ingredients].sort((a, b) => b.amount - a.amount)
    })

    return {
      getRecipeValue,
      formatRecipeName,
      ingredientImage,
      recipeImage,
      sortedIngredients
    }
  }
})
</script>

<style lang="scss" scoped>
.recipe-card {
  flex-grow: 0;
  flex-shrink: 0;
  width: 209px;
  height: 863px;

  display: grid;
  grid-template-rows: 190px 132px 48px 50px 310px 103px;
  justify-content: center;
  padding: 8px 0 0;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #000;

  > * {
    line-height: 1.1;
    // align-self: start;
  }
}

.recipe-type-curry {
  background-color: #feb8b7;
}

.recipe-type-salad {
  background-color: #c1f2bd;
}

.recipe-type-dessert {
  background-color: #fff1ce;
}

.recipe-name {
  font-size: 38px;
  text-align: center;
  line-height: 1.25;
  white-space: pre-line;
  grid-row: 1;
}

.recipe-image-container {
  width: 200px;
  height: 160px;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  overflow: visible;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.bonus-percentage {
  font-size: 46px;
  grid-row: 3;
  text-align: center;
}

.recipe-value {
  margin-top: 2px;
  font-size: 46px;
  grid-row: 4;
  text-align: center;
}

.ingredient-list {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 10px;
  justify-content: center;
  align-items: start;
  align-content: start;
  grid-row: 5;
  align-self: start;
}

.ingredient-icon {
  width: 87px;
  height: 79px;
  object-fit: cover;
  justify-self: center;
}

.ingredient-amount {
  font-size: 60px;
  text-align: left;
  justify-self: start;
  height: 77px;
  display: flex;
  align-items: center;
}

.total-value {
  font-size: 120px;
  grid-row: 6;
  justify-self: center;
}
</style>
