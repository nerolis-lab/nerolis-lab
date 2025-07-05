<template>
  <v-menu>
    <template #activator="{ props: activatorProps }">
      <v-chip
        :value="value"
        :color="color"
        :variant="isSelected ? 'elevated' : 'outlined'"
        :size="size"
        :density="density"
        :disabled="disabled"
        :style="computedStyle"
        :class="computedClass"
        :prepend-avatar="prependAvatar"
        :append-avatar="appendAvatar"
        v-bind="{ ...$attrs, ...(interactive ? activatorProps : {}) }"
        @click="handleClick"
      >
        <slot>{{ text }}</slot>

        <template #append>
          <slot name="append" />
        </template>
      </v-chip>
    </template>

    <v-card :prepend-avatar="prependAvatar">
      <template #title>
        <slot name="menu-title" />
      </template>
      <slot name="menu-content" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Props {
  value?: any
  text?: string
  color?: string
  isSelected?: boolean
  appendAvatar?: string
  prependAvatar?: string
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  density?: 'default' | 'comfortable' | 'compact'
  disabled?: boolean
  interactive?: boolean
  class?: string | string[] | Record<string, boolean>
  customStyle?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  size: 'default',
  density: 'default',
  disabled: false,
  interactive: true
})

const emit = defineEmits<{
  click: [value: any]
}>()

const computedStyle = computed(() => {
  const baseStyle = props.customStyle || {}

  // Apply color CSS variable when not selected (like recipes page)
  if (!props.isSelected && props.color) {
    return {
      ...baseStyle,
      color: `var(--${props.color})`
    }
  }

  return baseStyle
})

const computedClass = computed(() => {
  const classes = ['text-body-1']

  // Add non-interactive class when interactive is false
  if (!props.interactive) {
    classes.push('non-interactive')
  }

  if (props.class) {
    if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else if (typeof props.class === 'string') {
      classes.push(props.class)
    } else {
      // Handle object format
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key)
      })
    }
  }

  return classes
})

const handleClick = () => {
  if (!props.disabled && props.interactive) {
    emit('click', props.value)
  }
}
</script>

<style scoped lang="scss">
.v-chip {
  transition: all 0.2s ease;

  &:hover:not(.v-chip--disabled):not(.non-interactive) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.non-interactive {
    cursor: default;
    pointer-events: auto;

    :deep(.v-ripple__container) {
      display: none;
    }
  }
}
</style>
