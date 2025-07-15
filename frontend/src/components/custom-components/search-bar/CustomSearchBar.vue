<template>
  <div class="search-bar-container" :class="{ minimized: !isExpanded, expanded: isExpanded }" :style="containerStyle">
    <v-text-field
      ref="textFieldRef"
      v-model="searchQuery"
      :label="isExpanded ? 'Search' : undefined"
      variant="outlined"
      dense
      hide-details
      :clearable="isExpanded && clearable"
      :density="density"
      prepend-inner-icon="mdi-magnify"
      @keydown.enter="handleEnter"
      @update:model-value="handleInput"
      @blur="handleBlur"
      :class="computedClass"
      :placeholder="isExpanded ? placeholder : undefined"
      @click="handleTextFieldClick"
    ></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

export interface Props {
  modelValue?: string
  placeholder?: string
  prependIcon?: string
  density?: 'comfortable' | 'compact' | 'default'
  clearable?: boolean
  hideDetails?: boolean
  autofocus?: boolean
  customClass?: string | string[] | Record<string, boolean>
  customStyle?: Record<string, any>
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  startMinimized?: boolean
  expandOnClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  prependIcon: 'mdi-magnify',
  variant: 'outlined',
  density: 'default',
  clearable: true,
  hideDetails: true,
  autofocus: false,
  startMinimized: false,
  expandOnClick: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  enter: [value: string]
}>()

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const isExpanded = ref(!props.startMinimized)
const textFieldRef = ref<any>(null)

const computedClass = computed(() => {
  const classes = ['custom-search-bar']

  if (props.customClass) {
    if (Array.isArray(props.customClass)) {
      classes.push(...props.customClass)
    } else if (typeof props.customClass === 'string') {
      classes.push(props.customClass)
    } else {
      Object.entries(props.customClass).forEach(([key, value]) => {
        if (value) classes.push(key)
      })
    }
  }

  return classes
})

const containerStyle = computed(() => {
  const style: Record<string, any> = {}

  if (!isExpanded.value) {
    // Minimized state handled by CSS class
    return style
  }

  // Expanded state
  if (props.minWidth) {
    style.minWidth = typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth
  }

  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
    style.width = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  } else {
    style.width = '100%'
  }

  return style
})

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

const handleEnter = () => {
  emit('enter', searchQuery.value)
}

const handleTextFieldClick = async () => {
  if (!isExpanded.value && props.expandOnClick) {
    isExpanded.value = true
    await nextTick()
    textFieldRef.value?.focus()
  }
}

const handleBlur = () => {
  if (isExpanded.value && !searchQuery.value && props.startMinimized) {
    isExpanded.value = false
  }
}

// Expose for testing
defineExpose({
  isExpanded,
  handleInput,
  handleEnter,
  handleTextFieldClick,
  handleBlur,
  textFieldRef
})
</script>

<style scoped lang="scss">
.search-bar-container {
  transition: width 0.3s ease-in-out;
  display: inline-block;
}

.search-bar-container.minimized {
  width: 48px;
}
</style>
