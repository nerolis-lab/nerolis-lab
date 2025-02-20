<template>
  <v-text-field
    v-model="internalValue"
    :label="label"
    type="number"
    :density="null"
    variant="outlined"
    hide-details
    hide-spin-buttons
    single-line
    persistent-hint
    @focus="highlightText"
    :rules="rules"
    min-width="50"
  ></v-text-field>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'NumberInput',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    rules: {
      type: Array<(value: any) => boolean | string>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue)

    watch(internalValue, (newValue) => {
      emit('update:modelValue', newValue)
    })

    watch(
      () => props.modelValue,
      (newValue) => {
        internalValue.value = newValue
      }
    )

    return {
      internalValue
    }
  },
  methods: {
    highlightText(event: FocusEvent) {
      const target = event.target as HTMLInputElement

      // Use a slight delay to avoid browser conflicts
      setTimeout(() => target.select(), 1)
    }
  }
})
</script>
