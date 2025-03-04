<template>
  <v-text-field
    v-model.number="internalValue"
    type="number"
    :min="min"
    :max="max"
    :density="density"
    :base-color="computedColor"
    variant="outlined"
    hide-details
    hide-spin-buttons
    single-line
    persistent-hint
    :rules="rules"
    min-width="50"
    @focus="highlightText"
    @blur="handleUpdate"
    @keyup.enter="handleUpdate"
  >
    <template v-if="showStatus" #append-inner>
      <v-progress-circular v-if="localLoading" indeterminate size="20" />
      <v-icon v-else-if="confirmed" size="20" color="success"> mdi-check </v-icon>
      <v-icon v-else size="20"> mdi-pencil </v-icon>
    </template>

    <template v-for="(_, name) in availableSlots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import type { Density } from '@/types/vuetify/density'
import { computed, defineComponent, type PropType, ref, watch } from 'vue'

export default defineComponent({
  name: 'NumberInput',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    rules: {
      type: Array as PropType<Array<(value: any) => boolean | string>>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: undefined
    },
    max: {
      type: Number,
      default: undefined
    },
    density: {
      type: String as PropType<Density>,
      default: null
    },
    showStatus: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update-number', 'update:modelValue'],
  setup(props, { slots }) {
    const internalValue = ref(props.modelValue)
    const confirmed = ref(false)
    const localLoading = ref(props.loading)
    let loadingStart: number | null = null
    const minLoadingTime = 500

    watch(
      () => props.modelValue,
      (newValue) => {
        internalValue.value = newValue
      }
    )

    const availableSlots = computed(() => {
      const slotNames = Object.keys(slots).filter((name): name is string => name !== 'append-inner')
      return slotNames.reduce(
        (acc, name) => {
          acc[name] = slots[name]
          return acc
        },
        {} as Record<string, unknown>
      )
    })

    watch(
      () => props.loading,
      (newVal) => {
        if (newVal) {
          loadingStart = Date.now()
          localLoading.value = true
        } else {
          if (loadingStart !== null) {
            const elapsed = Date.now() - loadingStart
            const remaining = minLoadingTime - elapsed
            if (remaining > 0) {
              setTimeout(() => {
                confirmed.value = true
                localLoading.value = false
              }, remaining)
            } else {
              confirmed.value = true
              localLoading.value = false
            }
          } else {
            confirmed.value = true
            localLoading.value = false
          }
        }
      }
    )

    const computedColor = computed(() => (confirmed.value ? 'success' : undefined))

    return {
      internalValue,
      confirmed,
      computedColor,
      localLoading,
      availableSlots,
      loadingStart,
      minLoadingTime
    }
  },
  methods: {
    highlightText(event: FocusEvent) {
      const target = event.target as HTMLInputElement
      // Slight delay to avoid browser conflicts
      setTimeout(() => target.select(), 1)
    },
    handleUpdate() {
      if (
        (this.min && this.internalValue < this.min) ||
        (this.max && this.internalValue > this.max) ||
        isNaN(this.internalValue) ||
        this.internalValue === this.modelValue
      ) {
        this.internalValue = this.modelValue
        return
      }

      this.$emit('update:modelValue', this.internalValue)
      this.$emit('update-number', this.internalValue)

      setTimeout(() => {
        this.confirmed = false
      }, 2000)
    }
  }
})
</script>
