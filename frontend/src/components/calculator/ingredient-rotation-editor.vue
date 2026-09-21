<template>
  <v-card title="Ingredient requirements">
    <v-card-text>
      <p class="mb-4">
        Members below a minimum rotate in first. Once all minimums are met, members replenish to their maximums. Leave
        this list empty to use this member as the alternate.
      </p>
      <div v-for="(threshold, index) in thresholds" :key="index" class="mb-4">
        <v-select
          v-model="threshold.name"
          :items="ingredient.INGREDIENTS"
          item-title="longName"
          item-value="name"
          label="Ingredient"
          hide-details
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <img :src="ingredientImage(item.raw.name)" alt="" width="28" height="28" class="mr-2" />
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <span class="d-flex align-center ga-2">
              <img :src="ingredientImage(item.raw.name)" alt="" width="28" height="28" />
              {{ item.raw.longName }}
            </span>
          </template>
        </v-select>
        <div class="d-flex ga-2 mt-2">
          <v-text-field
            v-model.number="threshold.minimum"
            label="Minimum"
            type="number"
            min="0"
            step="1"
            hide-details
          />
          <v-text-field
            v-model.number="threshold.maximum"
            label="Maximum"
            type="number"
            min="1"
            step="1"
            hide-details
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            :aria-label="`Remove ingredient ${index + 1}`"
            @click="thresholds.splice(index, 1)"
          />
        </div>
      </div>
      <v-btn :disabled="!nextIngredient" @click="addIngredient">Add ingredient</v-btn>
      <p v-if="error" role="alert" class="text-error mt-4">{{ error }}</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn
        :disabled="!!error"
        @click="
          $emit(
            'save',
            thresholds.map((threshold) => ({ ...threshold }))
          )
        "
        >Save</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ingredientImage } from '@/services/utils/image-utils'
import { ingredient, validateIngredientThresholds, type ScheduleIngredientThreshold } from 'sleepapi-common'

const props = defineProps<{ initial: ScheduleIngredientThreshold[]; alternateExists: boolean }>()
defineEmits<{ save: [thresholds: ScheduleIngredientThreshold[]]; cancel: [] }>()
const thresholds = ref(props.initial.map((threshold) => ({ ...threshold })))
const nextIngredient = computed(() =>
  ingredient.INGREDIENTS.find((entry) => !thresholds.value.some((threshold) => threshold.name === entry.name))
)
const error = computed(
  () =>
    validateIngredientThresholds(thresholds.value) ||
    (!thresholds.value.length && props.alternateExists
      ? 'This schedule already has an alternate. Add an ingredient or remove the other alternate first.'
      : '')
)
const addIngredient = () => {
  if (nextIngredient.value) thresholds.value.push({ name: nextIngredient.value.name, minimum: 1, maximum: 10 })
}
</script>
