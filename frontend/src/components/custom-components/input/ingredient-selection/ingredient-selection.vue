<template>
  <v-menu v-model="ingredientMenuOpen" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-row dense>
        <v-col>
          <v-btn
            append-icon="mdi-chevron-down"
            color="secondary"
            aria-label="add ingredients"
            v-bind="props"
            class="w-100"
          >
            <span v-if="selectedIngredients.length === 0"> Ingredients </span>
            <div v-else-if="selectedIngredients.length < 6" class="flex-center flex-nowrap">
              <span class="mr-2">Includes: </span>
              <v-img
                height="30"
                width="30"
                v-for="(ingredient, index) in selectedIngredients"
                :key="index"
                :src="ingredientImage(ingredient.name)"
              />
            </div>
            <span v-else>Includes: {{ selectedIngredients.length }} ingredients</span>
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-container class="bg-secondary-dark elevation-10">
      <v-row dense class="grid-container" :class="isMobile ? 'mobile' : 'desktop'">
        <v-card
          v-for="(ingredient, index) in ingredients"
          class="grid-item"
          :key="index"
          :color="isMenuIngredientSelected(ingredient) ? 'secondary' : 'secondary-dark'"
          :class="isMenuIngredientSelected(ingredient) ? 'elevation-0' : 'elevation-4'"
          @click="toggleMenuIngredient(ingredient)"
        >
          <span v-if="!isMobile">{{ ingredient.name }}</span>
          <v-avatar size="40">
            <v-img :src="ingredientImage(ingredient.name)" />
          </v-avatar>
        </v-card>
      </v-row>

      <v-row dense class="mt-2 justify-space-between flex-center w-100">
        <v-col cols="4" class="flex-left">
          <v-btn
            id="cancelButton"
            class="w-100"
            size="large"
            rounded="lg"
            color="secondary-medium-dark"
            @click="cancelIngredients"
          >
            Cancel
          </v-btn>
        </v-col>
        <v-col cols="4" class="flex-left">
          <v-btn class="w-100" size="large" rounded="lg" color="secondary-medium-dark" @click="resetIngredients">
            Clear
          </v-btn>
        </v-col>
        <v-col cols="4" class="flex-right">
          <v-btn id="updateButton" class="w-100" size="large" rounded="lg" color="primary" @click="updateIngredients">
            Update
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-menu>
</template>

<script lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { ingredientImage } from '@/services/utils/image-utils'
import { ingredient, type Ingredient } from 'sleepapi-common'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'IngredientSelection',
  props: {
    preSelectedIngredients: {
      type: Array<Ingredient>,
      default: () => []
    }
  },
  emits: ['updateIngredients'],
  setup(props, { emit }) {
    const ingredientMenuOpen = ref(false)
    const selectedIngredients = ref([...props.preSelectedIngredients])
    const tempSelectedIngredients = ref([...props.preSelectedIngredients])

    function closeIngredientMenu() {
      ingredientMenuOpen.value = false
    }

    function cancelIngredients() {
      tempSelectedIngredients.value = [...selectedIngredients.value]
      closeIngredientMenu()
    }

    function resetIngredients() {
      tempSelectedIngredients.value = []
    }

    function updateIngredients() {
      selectedIngredients.value = [...tempSelectedIngredients.value]
      emit('updateIngredients', selectedIngredients.value)
      closeIngredientMenu()
    }

    function isMenuIngredientSelected(ingredient: Ingredient) {
      return tempSelectedIngredients.value.some((i) => i.name === ingredient.name)
    }

    function toggleMenuIngredient(ingredient: Ingredient) {
      if (isMenuIngredientSelected(ingredient)) {
        tempSelectedIngredients.value = tempSelectedIngredients.value.filter((i) => i.name !== ingredient.name)
      } else {
        tempSelectedIngredients.value = [...tempSelectedIngredients.value, ingredient]
      }
    }

    watch(ingredientMenuOpen, (isOpen) => {
      if (isOpen) {
        tempSelectedIngredients.value = [...selectedIngredients.value]
      }
    })

    const { isMobile } = useBreakpoint()

    return {
      closeIngredientMenu,
      cancelIngredients,
      resetIngredients,
      updateIngredients,
      isMenuIngredientSelected,
      toggleMenuIngredient,
      ingredientMenuOpen,
      ingredientImage,
      ingredients: ingredient.INGREDIENTS,
      isMobile,
      selectedIngredients,
      tempSelectedIngredients
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
