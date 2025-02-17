<template>
  <v-data-table
    :items="reactiveRecipes"
    :headers="headers"
    key="key"
    dense
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
          <div class="d-flex flex-nowrap">
            <div v-for="({ ingredient, amount }, index) in item.ingredients" :key="index" class="flex-center mr-2">
              <img :src="ingredientImage(ingredient.name)" height="24" />
              <span>{{ amount }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>

    <template #[`item.userStrength`]="{ item }">
      <v-row class="flex-left">
        <img src="/images/misc/strength.png" height="24" />
        <span class="ml-2">{{ item.userStrength }}</span>
      </v-row>
    </template>

    <template #[`item.nrOfIngredients`]="{ item }">
      <span>{{ item.nrOfIngredients }}</span>
    </template>

    <template #[`item.bonus`]="{ item }">
      <span>{{ item.bonus }}%</span>
    </template>

    <template #[`item.level`]="{ item }">
      <RecipeLevelButton v-model="item.level" :recipe-name="item.name" @updateLevel="onUpdateLevel(item, $event)" />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import RecipeLevelButton from '@/components/recipe/recipe-level-button.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { type UserRecipe } from '@/pages/recipe/recipes-page.vue'
import { ingredientImage, recipeImage } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import type { DataTableHeader } from '@/types/table/table-types'
import { localizeNumber, MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RecipeTableMobile',
  components: { RecipeLevelButton },
  props: {
    recipes: {
      type: Array as () => UserRecipe[],
      required: true
    }
  },
  setup(props, { emit }) {
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const loggedIn = userStore.loggedIn
    const reactiveRecipes = ref([...props.recipes])

    const headers = ref<DataTableHeader[]>([
      { title: 'Name', key: 'displayName', align: 'center' },
      { title: 'Strength', key: 'userStrength', align: 'center' },
      { title: 'Pot Size', key: 'nrOfIngredients', align: 'center' },
      { title: 'Bonus', key: 'bonus', align: 'center' },
      { title: 'Level', key: 'level', align: 'center' }
    ])

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
      reactiveRecipes
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
