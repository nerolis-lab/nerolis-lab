<template>
  <v-row no-gutters class="frosted-glass">
    <v-col class="flex-column d-flex pt-2 px-2">
      <span class="text-h4 font-weight-bold pb-2">Recipes</span>
      <span class="text-strength text-body-1">
        Setting your recipe levels here will affect calculations across Neroli's Lab
      </span>
    </v-col>
    <v-data-table
      :items="reactiveRecipes"
      :headers="headers"
      key="key"
      item-value="name"
      class="bg-transparent"
      hide-default-footer
      items-per-page="-1"
      density="compact"
    >
      <template #[`item.displayName`]="{ item }">
        <v-row class="d-flex flex-nowrap">
          <v-col cols="auto">
            <v-avatar size="48" :color="item.type" rounded="0">
              <v-img :src="recipeImage(item.name)" />
            </v-avatar>
          </v-col>
          <v-col class="flex-top flex-column">
            <span class="text-no-wrap text-body-1 font-weight-semibold">{{ item.displayName }}</span>
            <div v-if="!isLargeDesktop" class="d-flex flex-nowrap">
              <div v-for="({ ingredient, amount }, index) in item.ingredients" :key="index" class="flex-center mr-2">
                <img :src="ingredientImage(ingredient.name)" height="24" />
                <span>{{ amount }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>

      <template #[`item.userStrength`]="{ item }">
        <v-row class="flex-left" dense>
          <v-col cols="auto">
            <img src="/images/misc/strength.png" height="24" />
          </v-col>
          <v-col>
            <span class="text-body-1">{{ item.userStrength }}</span>
          </v-col>
        </v-row>
      </template>

      <template #[`item.ingredients`]="{ item }">
        <v-row class="flex-left" no-gutters>
          <v-col v-for="({ ingredient, amount }, index) in item.ingredients" :key="index" cols="3" class="flex-left">
            <img :src="ingredientImage(ingredient.name)" height="28" />
            <span class="text-body-1">{{ amount }}</span>
          </v-col>
        </v-row>
      </template>

      <template #[`item.nrOfIngredients`]="{ item }">
        <span class="text-body-1">{{ item.nrOfIngredients }}</span>
      </template>

      <template #[`item.bonus`]="{ item }">
        <span class="text-body-1">{{ item.bonus }}%</span>
      </template>

      <template #[`item.level`]="{ item }">
        <RecipeLevelButton v-model="item.level" :recipe-name="item.name" @updateLevel="onUpdateLevel(item, $event)" />
      </template>
    </v-data-table>
  </v-row>
</template>

<script lang="ts">
import RecipeLevelButton from '@/components/recipe/recipe-level-button.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { useViewport } from '@/composables/viewport-composable'
import { type UserRecipe } from '@/pages/recipe/recipes-page.vue'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { localizeNumber, MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RecipeTableMobile',
  components: { RecipeLevelButton },
  props: {
    recipes: {
      type: Array as () => UserRecipe[],
      required: true
    }
  },
  setup(props) {
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const loggedIn = userStore.loggedIn
    const reactiveRecipes = ref([...props.recipes])

    const { viewportWidth } = useViewport()
    const isLargeDesktop = computed(() => viewportWidth.value >= 1600)

    const headers = computed(() => {
      const baseHeaders = [
        { title: 'Name', key: 'displayName' },
        { title: 'Strength', key: 'userStrength' },
        { title: 'Size', key: 'nrOfIngredients' },
        { title: 'Bonus', key: 'bonus' },
        { title: 'Level', key: 'level' }
      ]

      if (isLargeDesktop.value) {
        baseHeaders.splice(2, 0, { title: 'Ingredients', key: 'ingredients' })
      }

      return baseHeaders
    })

    watch(
      () => props.recipes,
      (newRecipes) => {
        reactiveRecipes.value = [...newRecipes]
      },
      { deep: true }
    )

    return {
      recipeImage,
      ingredientImage,
      localizeNumber,
      MAX_RECIPE_LEVEL,
      highlightText,
      loggedIn,
      recipes: props.recipes,
      headers,
      reactiveRecipes,
      isLargeDesktop
    }
  },
  emits: ['updateLevel'],
  methods: {
    onUpdateLevel(recipe: UserRecipe, newLevel: number) {
      this.$emit('updateLevel', recipe, newLevel)
    }
  }
})
</script>

<style scoped lang="scss">
:deep(.v-table__wrapper) {
  overflow-y: hidden !important;
}

:deep(.v-table) {
  .v-data-table__tr {
    .v-data-table__td {
      border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

      &:last-child {
        border-right: none;
      }
    }
  }
}
</style>
