<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <div class="d-flex">
        <v-btn :color="color" v-bind="menuProps" :class="buttonClass" :disabled="disabled" class="rounded-e-0">
          <span>{{ sortPrefix }}: {{ currentSortLabel }}</span>
        </v-btn>
        <v-btn :color="color" :disabled="disabled" class="rounded-s-0" @click="toggleSortDirection" width="40">
          <v-icon>
            {{ sortAscending ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
          </v-icon>
        </v-btn>
      </div>
    </template>

    <v-list>
      <v-list-item
        v-for="option in sortOptions"
        :key="option.value"
        :disabled="option.disabled"
        @click="option.disabled ? null : selectSort(option.value)"
      >
        <v-list-item-title>{{ option.title }}</v-list-item-title>
        <v-list-item-subtitle v-if="option.description" :class="option.disabled ? 'text-primary' : ''">
          {{ option.description }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SortOption {
  value: string
  title: string
  description?: string
  disabled?: boolean
}

export interface Props {
  modelValue: string
  sortAscending: boolean
  sortOptions: SortOption[]
  sortPrefix?: string
  color?: string
  buttonClass?: string | string[] | Record<string, boolean>
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sortPrefix: 'Sort',
  color: 'secondary',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:sortAscending': [value: boolean]
  'sort-change': [value: string, ascending: boolean]
}>()

const currentSortLabel = computed(() => {
  const currentOption = props.sortOptions.find((option) => option.value === props.modelValue)
  return currentOption?.title || ''
})

const selectSort = (value: string) => {
  emit('update:modelValue', value)
  emit('sort-change', value, props.sortAscending)
}

const toggleSortDirection = () => {
  const newDirection = !props.sortAscending
  emit('update:sortAscending', newDirection)
  emit('sort-change', props.modelValue, newDirection)
}
</script>

<style scoped lang="scss">
.v-btn {
  min-width: 0px;
  padding: 0 6px !important;
}
</style>
