<template>
  <v-card title="Ingredient requirements">
    <v-card-text>
      <p class="mb-4">
        Members below a minimum rotate in first. Once all minimums are met, members replenish to their maximums. Leave
        this list empty to use this member as the alternate.
      </p>
      <div v-if="thresholds.length" class="ingredient-requirement-grid mb-2 text-body-2">
        <span>Minimum</span>
        <span class="maximum-heading">Maximum</span>
      </div>
      <div
        v-for="(threshold, index) in thresholds"
        :key="threshold.name"
        class="ingredient-requirement-grid ingredient-requirement-row mb-3"
      >
        <v-text-field
          v-model.number="threshold.minimum"
          :aria-label="`Minimum ${getIngredient(threshold.name).longName}`"
          type="number"
          min="0"
          step="1"
          hide-spin-buttons
          hide-details
          bg-color="secondary"
          variant="outlined"
          density="compact"
          @focus="highlightText"
        >
          <template #append-inner><v-icon>mdi-pencil</v-icon></template>
        </v-text-field>
        <img
          :src="ingredientImage(threshold.name)"
          :alt="getIngredient(threshold.name).longName"
          :title="getIngredient(threshold.name).longName"
          width="32"
          height="32"
        />
        <v-text-field
          v-model.number="threshold.maximum"
          :aria-label="`Maximum ${getIngredient(threshold.name).longName}`"
          type="number"
          min="1"
          step="1"
          hide-spin-buttons
          hide-details
          bg-color="secondary"
          variant="outlined"
          density="compact"
          @focus="highlightText"
        >
          <template #append-inner><v-icon>mdi-pencil</v-icon></template>
        </v-text-field>
        <v-btn
          icon="mdi-close-circle"
          variant="text"
          size="40"
          :aria-label="`Remove ${getIngredient(threshold.name).longName}`"
          @click="thresholds.splice(index, 1)"
        />
      </div>
      <IngredientSelection
        :pre-selected-ingredients="thresholds.map((threshold) => getIngredient(threshold.name))"
        @update-ingredients="updateIngredients"
      />
      <p v-if="error" role="alert" class="text-error mt-4">{{ error }}</p>
    </v-card-text>
    <v-container class="pt-0">
      <v-row dense class="mt-4">
        <v-col cols="6">
          <v-btn class="w-100" size="large" rounded="lg" color="secondary" @click="$emit('cancel')"> Cancel </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn
            :disabled="!!error"
            class="w-100"
            color="primary"
            size="large"
            rounded="lg"
            @click="
              $emit(
                'save',
                thresholds.map((threshold) => ({ ...threshold }))
              )
            "
            >Save</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ingredientImage } from '@/services/utils/image-utils'
import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import {
  getIngredient,
  validateIngredientThresholds,
  type Ingredient,
  type ScheduleIngredientThreshold
} from 'sleepapi-common'

const props = defineProps<{ initial: ScheduleIngredientThreshold[]; alternateExists: boolean }>()
defineEmits<{ save: [thresholds: ScheduleIngredientThreshold[]]; cancel: [] }>()
const thresholds = ref(props.initial.map((threshold) => ({ ...threshold })))
const highlightText = (event: FocusEvent) => (event.target as HTMLInputElement).select()
const error = computed(
  () =>
    validateIngredientThresholds(thresholds.value) ||
    (!thresholds.value.length && props.alternateExists
      ? 'This schedule already has an alternate. Add an ingredient or remove the other alternate first.'
      : '')
)
const updateIngredients = (ingredients: Ingredient[]) => {
  const existing = new Map(thresholds.value.map((threshold) => [threshold.name, threshold]))
  thresholds.value = ingredients.map(
    (ingredient) => existing.get(ingredient.name) ?? { name: ingredient.name, minimum: 1, maximum: 10 }
  )
}
</script>

<style scoped>
.ingredient-requirement-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 6px;
}
.maximum-heading {
  grid-column: 3;
}
.ingredient-requirement-row > img {
  justify-self: center;
}
</style>
