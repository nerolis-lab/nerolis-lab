<template>
  <div class="infographic-page">
    <div class="download-controls">
      <label class="toggle-label">
        <input type="checkbox" v-model="showAllDishes" />
        <span>Show All Dishes</span>
      </label>
      <button @click="downloadInfographic" :disabled="isDownloading" class="download-button">
        {{ isDownloading ? 'Preparing...' : 'Download Infographic' }}
      </button>
    </div>
    <div ref="infographicContainer" class="infographic-container">
      <!-- Left Section: Recipe Data -->
      <div class="recipe-section">
        <div class="recipe-grid">
          <!-- Curries Row -->
          <div class="recipe-row">
            <img :src="recipeImage(mixedCurry.name)" :alt="mixedCurry.displayName" class="mixed-recipe-image" />
            <DishInfographicCard v-for="recipe in curries" :key="recipe.name" :recipe="recipe" />
          </div>

          <!-- Salads Row -->
          <div class="recipe-row">
            <img :src="recipeImage(mixedSalad.name)" :alt="mixedSalad.displayName" class="mixed-recipe-image" />
            <DishInfographicCard v-for="recipe in salads" :key="recipe.name" :recipe="recipe" />
          </div>

          <!-- Desserts Row -->
          <div class="recipe-row">
            <img :src="recipeImage(mixedJuice.name)" :alt="mixedJuice.displayName" class="mixed-recipe-image" />
            <DishInfographicCard v-for="recipe in desserts" :key="recipe.name" :recipe="recipe" />
          </div>
        </div>
        <div class="footer-note">
          * The percentage values indicate the recipe bonus for each dish (i.e. the % value increase on the base
          ingredients of the dish)
        </div>
      </div>

      <!-- Right Section: Ingredient Base Strength List -->
      <div class="ingredient-strength-section">
        <div v-for="ingredient in sortedIngredients" :key="ingredient.name" class="strength-item">
          <img :src="ingredientImage(ingredient.name)" :alt="ingredient.name" class="strength-ingredient-icon" />
          <span class="strength-value">{{ ingredient.value }} BP</span>
        </div>
      </div>
      <div class="credits">
        <div>original by</div>
        <div>Anti</div>
        <div>maintained by</div>
        <div>tindo</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { curry, dessert, ingredient, RECIPES, salad } from 'sleepapi-common'
import { computed, defineComponent, ref } from 'vue'
import DishInfographicCard from './dish-infographic-card.vue'

export default defineComponent({
  name: 'DishInfographicPage',
  components: {
    DishInfographicCard
  },
  setup() {
    const infographicContainer = ref<HTMLElement | null>(null)
    const isDownloading = ref(false)
    const showAllDishes = ref(false)

    // filter out mixed recipes (they have no ingredients)
    const recipesWithIngredients = RECIPES.filter((recipe) => recipe.ingredients.length > 0)

    // group recipes by type and sort by value (descending), then take top 9 or all, then reverse to show least to most powerful
    const curries = computed(() => {
      const filtered = recipesWithIngredients.filter((r) => r.type === 'curry').sort((a, b) => b.value - a.value)
      const limited = showAllDishes.value ? filtered : filtered.slice(0, 9)
      return limited.reverse()
    })

    const salads = computed(() => {
      const filtered = recipesWithIngredients.filter((r) => r.type === 'salad').sort((a, b) => b.value - a.value)
      const limited = showAllDishes.value ? filtered : filtered.slice(0, 9)
      return limited.reverse()
    })

    const desserts = computed(() => {
      const filtered = recipesWithIngredients.filter((r) => r.type === 'dessert').sort((a, b) => b.value - a.value)
      const limited = showAllDishes.value ? filtered : filtered.slice(0, 9)
      return limited.reverse()
    })

    // sort ingredients by value (base strength)
    const sortedIngredients = [...ingredient.INGREDIENTS].sort((a, b) => a.value - b.value)

    // mixed recipes for each type
    const mixedCurry = curry.MIXED_CURRY
    const mixedSalad = salad.MIXED_SALAD
    const mixedJuice = dessert.MIXED_JUICE

    const downloadInfographic = async () => {
      if (!infographicContainer.value) {
        console.error('Infographic container not found')
        return
      }

      isDownloading.value = true
      try {
        const { default: html2canvas } = await import('html2canvas')

        const canvas = await html2canvas(infographicContainer.value, {
          backgroundColor: '#1a3a3a',
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          scale: 2,
          width: infographicContainer.value.scrollWidth,
          height: infographicContainer.value.scrollHeight,
          logging: false,
          allowTaint: true,
          foreignObjectRendering: false,
          imageTimeout: 15000
        })

        const image = canvas.toDataURL('image/png', 0.95)
        const link = document.createElement('a')
        link.download = 'dish-infographic.png'
        link.href = image
        link.click()
      } catch (err) {
        console.error('Failed to download infographic:', err)
        alert('Failed to download infographic. Check console for details.')
      } finally {
        isDownloading.value = false
      }
    }

    return {
      curries,
      salads,
      desserts,
      sortedIngredients,
      ingredientImage,
      recipeImage,
      mixedCurry,
      mixedSalad,
      mixedJuice,
      infographicContainer,
      isDownloading,
      showAllDishes,
      downloadInfographic
    }
  }
})
</script>

<style lang="scss" scoped>
.infographic-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.download-controls {
  margin-bottom: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 20px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.download-button {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
}

.infographic-container {
  background-color: #1a3a3a;
  background-image: url('@/assets/images/placeholder-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  width: fit-content;
  font-family: 'Noto Sans New Tai Lue', sans-serif;
  font-weight: 700;
  position: relative;
}

.recipe-section {
  background-color: #a8d5ba;
  padding: 50px 50px 80px;
  flex-shrink: 0;
  position: relative;
}

.recipe-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recipe-row {
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: flex-start;
}

.ingredient-strength-section {
  background-color: #5a8a7a;
  padding: 50px 10px 80px;
  flex-shrink: 0;
  width: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.strength-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.strength-ingredient-icon {
  width: 120px;
  height: 72px;
  object-fit: cover;
  overflow: visible;
  flex-shrink: 0;
}

.strength-value {
  font-size: 72px;
  color: #000000;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 72px;
  flex-shrink: 0;
  text-align: right;
  width: 250px;
  line-height: 72px;
}

.footer-note {
  position: absolute;
  bottom: 20px;
  right: 50px;
  font-size: 36px;
  color: #000000;
  font-style: italic;
  text-align: right;
}

.credits {
  position: absolute;
  bottom: 80px;
  left: 80px;
  color: #555;
  font-size: 36px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}
</style>
