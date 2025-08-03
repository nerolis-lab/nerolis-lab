<template>
  <v-badge
    color="secondary"
    class="flex-center"
    location="top left"
    offset-x="auto"
    :model-value="pokemonInstance !== undefined && locked"
  >
    <template #badge>
      <v-icon left class="mr-1">mdi-lock</v-icon>
      Lv.{{ ingredientLevel }}
    </template>
    <v-speed-dial
      :content-class="{ 'wide-speed-dial': otherIngredientOptions.length > 2 }"
      v-model="fab"
      location="top center"
      transition="fade-transition"
    >
      <template #activator="{ props }">
        <v-badge
          :model-value="pokemonInstance !== undefined && !locked"
          :content="ingredientSet?.amount"
          color="accent"
          text-color="background"
          offset-x="5"
          offset-y="5"
        >
          <v-btn icon :class="{ 'disabled-image-btn': locked }" :disabled="disabled" v-bind="props">
            <v-avatar>
              <v-img id="ingredientImage" :src="ingredientImage" v-if="ingredientImage"></v-img>
              <span v-else>?</span>
            </v-avatar>
          </v-btn>
        </v-badge>
      </template>

      <v-btn
        v-for="key in otherIngredientOptions"
        :key="key.ingredient.name"
        color="accent"
        size="48"
        icon
        @click="handleIngredientClick(key)"
      >
        <v-avatar>
          <v-img :src="ingredientImageForNameKey(key.ingredient.name)"></v-img>
        </v-avatar>
      </v-btn>
    </v-speed-dial>
  </v-badge>
</template>

<script setup lang="ts">
import { type IngredientSet, type PokemonInstanceExt } from 'sleepapi-common'
import { computed, onBeforeUnmount, ref } from 'vue'

interface Props {
  ingredientLevel: number
  pokemonInstance?: PokemonInstanceExt
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update-ingredient': [params: { ingredientSet: IngredientSet; ingredientLevel: number }]
}>()

const fab = ref(false)
const updateTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const ingredientSet = computed(() => {
  if (!props.pokemonInstance) return undefined
  return props.pokemonInstance.ingredients[Math.floor(Math.min(props.ingredientLevel / 30, 2))]
})

const ingredientImage = computed(() => {
  return ingredientSet.value ? `/images/ingredient/${ingredientSet.value.ingredient.name.toLowerCase()}.png` : undefined
})

const pokemonLevel = computed(() => props.pokemonInstance?.level ?? 0)

const locked = computed(() => {
  return pokemonLevel.value < props.ingredientLevel
})

const disabled = computed(() => {
  return !ingredientSet.value || otherIngredientOptions.value.length === 0
})

const otherIngredientOptions = computed(() => {
  if (!props.pokemonInstance) return []

  let ingredientOptions: IngredientSet[] = []

  if (props.ingredientLevel === 0) {
    ingredientOptions = props.pokemonInstance.pokemon.ingredient0
  } else if (props.ingredientLevel === 30) {
    ingredientOptions = props.pokemonInstance.pokemon.ingredient30
  } else {
    ingredientOptions = props.pokemonInstance.pokemon.ingredient60
  }

  return ingredientOptions.filter(
    (ing) => ing.ingredient.name.toLowerCase() !== ingredientSet.value?.ingredient.name.toLowerCase()
  )
})

onBeforeUnmount(() => {
  if (updateTimer.value) {
    clearTimeout(updateTimer.value)
  }
})

const ingredientImageForNameKey = (key: string) => {
  return `/images/ingredient/${key.toLowerCase()}.png`
}

const handleIngredientClick = (newIngredientSet: IngredientSet) => {
  if (updateTimer.value) {
    clearTimeout(updateTimer.value)
  }
  updateTimer.value = setTimeout(() => {
    updateIngredient(newIngredientSet)
    updateTimer.value = null
  }, 200) // Delay update by 200ms to smooth transition
}

const updateIngredient = (newIngredientSet: IngredientSet) => {
  if (!ingredientSet.value) {
    return
  }

  emit('update-ingredient', {
    ingredientSet: newIngredientSet,
    ingredientLevel: props.ingredientLevel
  })
}
</script>

<style lang="scss">
.wide-speed-dial.v-overlay__content.v-speed-dial__content {
  flex-direction: row !important;
  flex-wrap: wrap;
  width: 176px;
  justify-content: center;
  padding: 8px;
  border-radius: 16px;
  background-color: rgba($background, 0.8);

  button {
    transition-delay: 0s;
  }
}
</style>
