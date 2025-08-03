<template>
  <div class="carry-size-display">Carry size {{ calculatedCarrySize }}</div>
</template>

<script setup lang="ts">
import {
  calculateRibbonCarrySize,
  calculateSubskillCarrySize,
  CarrySizeUtils,
  limitSubSkillsToLevel,
  type PokemonInstanceExt
} from 'sleepapi-common'
import { computed } from 'vue'

interface Props {
  pokemonInstance?: PokemonInstanceExt
}

const props = defineProps<Props>()

const activeSubskills = computed(() => {
  if (!props.pokemonInstance) return new Set<string>()

  const subskills = new Set(props.pokemonInstance.subskills.map((s) => s.subskill.name))
  return limitSubSkillsToLevel(subskills, props.pokemonInstance.level)
})

const calculatedCarrySize = computed(() => {
  if (!props.pokemonInstance) return 0

  return CarrySizeUtils.calculateCarrySize({
    baseWithEvolutions: props.pokemonInstance.carrySize,
    subskillsLevelLimited: activeSubskills.value,
    ribbon: props.pokemonInstance.ribbon,
    camp: false
  })
})

const carryGainFromSubskills = computed(() => {
  return calculateSubskillCarrySize(activeSubskills.value)
})

const carryGainFromRibbon = computed(() => {
  if (!props.pokemonInstance) return 0
  return calculateRibbonCarrySize(props.pokemonInstance.ribbon)
})
</script>

<style lang="scss" scoped>
.carry-size-display {
  letter-spacing: 0.04em;
  white-space: nowrap;
}
</style>
