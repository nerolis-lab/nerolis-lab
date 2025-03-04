<template>
  <NumberInput
    :model-value="localLevel"
    :rules="[rules.minLevelRule, rules.maxLevelRule]"
    @update-number="handleBlur"
    :min="1"
    :max="MAX_RECIPE_LEVEL"
    density="compact"
    min-width="100"
    :disabled="!loggedIn"
    :loading="loading"
    class="compact-x"
  >
    <template #prepend-inner>
      <span class="font-weight-light">Lv.</span>
    </template>
  </NumberInput>
</template>

<script lang="ts">
import NumberInput from '@/components/custom-components/input/number-input/number-input.vue'
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { UserService } from '@/services/user/user-service'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RecipeLevelEditor',
  components: { NumberInput },
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    recipeName: {
      type: String,
      required: true
    }
  },
  data: () => ({
    rules: {
      minLevelRule: (value: number) => value >= 1 || 'Value must be at least 1',
      maxLevelRule: (value: number) => value <= MAX_RECIPE_LEVEL || `Value must be ${MAX_RECIPE_LEVEL} or less`
    }
  }),
  emits: ['update:modelValue', 'updateLevel'],
  setup(props, { emit }) {
    const localLevel = ref(props.modelValue)
    const loading = ref(false)
    const { highlightText } = useHighlightText()
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const loggedIn = userStore.loggedIn

    watch(
      () => props.modelValue,
      (newVal) => {
        localLevel.value = newVal
      }
    )

    async function handleBlur(newValue: number) {
      loading.value = true
      try {
        await UserService.upsertRecipe(props.recipeName, newValue)

        setTimeout(() => {
          emit('updateLevel', newValue)
        }, 500)
      } catch (error) {
        console.error('Update failed', error)
        localLevel.value = props.modelValue
      } finally {
        teamStore.clearCalculatorCache()
        loading.value = false
      }
    }

    return {
      localLevel,
      loading,
      highlightText,
      loggedIn,
      MAX_RECIPE_LEVEL,
      handleBlur
    }
  }
})
</script>

<style scoped lang="scss">
.compact-x {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
