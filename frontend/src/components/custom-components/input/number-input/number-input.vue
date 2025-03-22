<template>
  <v-text-field
    v-model.number="internalValue"
    type="number"
    :min="min"
    :max="max"
    :step="step"
    :density="density"
    :base-color="computedColor"
    variant="outlined"
    hide-details
    hide-spin-buttons
    persistent-hint
    :rules="combinedRules"
    :min-width="suffix ? '55' : '50'"
    :suffix="suffix"
    @focus="highlightText"
    @blur="handleUpdate"
    @keyup.enter="handleUpdate"
  >
    <template v-if="showStatus" #append-inner>
      <v-progress-circular v-if="localLoading" indeterminate size="20" />
      <v-icon v-else-if="confirmed" size="20" color="success"> mdi-check </v-icon>
      <v-icon v-else size="20"> {{ appendIcon }} </v-icon>
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
    step: {
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
    },
    appendIcon: {
      type: String,
      default: 'mdi-pencil'
    },
    suffix: {
      type: String,
      default: null
    }
  },
  emits: ['update-number', 'update:modelValue'],
  setup(props, { slots }) {
    const internalValue = ref(props.modelValue)
    const confirmed = ref(false)
    const localLoading = ref(props.loading)
    let loadingStart: number | null = null
    const minLoadingTime = 500
    const isReverting = ref(false)

    watch(
      () => props.modelValue,
      (newValue) => {
        internalValue.value = newValue
      }
    )

    const availableSlots = computed(() => {
      return Object.keys(slots).reduce(
        (acc, name) => {
          acc[name] = slots[name]
          return acc
        },
        {} as Record<string, unknown>
      )
    })

    // Automatic rules based on min/max/step props
    const autoRules = computed(() => {
      const rules: Array<(value: any) => boolean | string> = []

      if (props.min !== undefined) {
        rules.push((value: number) => value >= props.min! || `Value must be ${props.min!} or more`)
      }

      if (props.max !== undefined) {
        rules.push((value: number) => value <= props.max! || `Value must be ${props.max!} or less`)
      }

      if (props.step !== undefined) {
        rules.push((value: number) => {
          if (isNaN(value)) return true

          // Calculate base for step validation
          const base = props.min !== undefined ? props.min : 0

          // Check if value is at correct step from base
          const isValid = (value - base) % props.step! === 0

          return isValid || `Value must be in increments of ${props.step!} from ${base}`
        })
      }

      return rules
    })

    // Combine auto rules with prop rules
    const combinedRules = computed(() => {
      return [...autoRules.value, ...props.rules]
    })

    // Check if current value violates any rules
    const checkRules = (value: number): boolean => {
      for (const rule of combinedRules.value) {
        const result = rule(value)
        if (typeof result === 'string') {
          return false
        }
      }
      return true
    }

    watch(
      () => props.loading,
      (newVal) => {
        if (newVal) {
          confirmed.value = false
          loadingStart = Date.now()
          localLoading.value = true
        } else {
          const completeLoading = () => {
            localLoading.value = false
            confirmed.value = true

            setTimeout(() => {
              confirmed.value = false
            }, 2000)
          }

          if (loadingStart !== null) {
            const elapsed = Date.now() - loadingStart
            const remaining = minLoadingTime - elapsed

            if (remaining > 0) {
              setTimeout(completeLoading, remaining)
            } else {
              completeLoading()
            }
          } else {
            completeLoading()
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
      minLoadingTime,
      combinedRules,
      checkRules,
      isReverting
    }
  },
  methods: {
    highlightText(event: FocusEvent) {
      const target = event.target as HTMLInputElement
      // Slight delay to avoid browser conflicts
      setTimeout(() => target.select(), 1)
    },
    handleUpdate() {
      const numValue = Number(this.internalValue)

      // If value is not valid according to our rules
      if (isNaN(numValue) || !this.checkRules(numValue)) {
        if (!this.isReverting) {
          this.isReverting = true
          setTimeout(() => {
            this.internalValue = this.modelValue
            this.isReverting = false
          }, 500)
        }
        return
      }

      // Don't emit if value hasn't changed
      if (numValue === this.modelValue) {
        return
      }

      this.$emit('update:modelValue', numValue)
      this.$emit('update-number', numValue)
    }
  }
})
</script>
