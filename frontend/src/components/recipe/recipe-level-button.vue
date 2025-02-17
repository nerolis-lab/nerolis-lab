<template>
  <v-text-field
    v-model.number="localLevel"
    type="number"
    :min="1"
    :max="MAX_RECIPE_LEVEL"
    hide-details
    bg-color="secondary"
    variant="outlined"
    density="compact"
    :disabled="!loggedIn"
    @focus="highlightText"
    :rules="[rules.minLevelRule, rules.maxLevelRule]"
    @blur="handleBlur"
    :loading="loading"
    class="compact-x"
    min-width="100px"
  >
    <template #prepend-inner>
      <span>Lv.</span>
    </template>
    <template #append-inner>
      <v-icon size="20">mdi-pencil</v-icon>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import { MAX_RECIPE_LEVEL } from 'sleepapi-common'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RecipeLevelEditor',
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
    const loggedIn = userStore.loggedIn

    watch(
      () => props.modelValue,
      (newVal) => {
        localLevel.value = newVal
      }
    )

    async function handleBlur() {
      if (!localLevel.value || localLevel.value < 1 || localLevel.value > MAX_RECIPE_LEVEL) {
        localLevel.value = 1
      }
      loading.value = true
      try {
        await UserService.upsertRecipe(props.recipeName, localLevel.value)
        emit('update:modelValue', localLevel.value)
        emit('updateLevel', localLevel.value)
      } catch (error) {
        console.error('Update failed', error)
        localLevel.value = props.modelValue
      } finally {
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
