<template>
  <div class="badge-anchor" :aria-label="ariaLabel">
    <v-img :width="size" :height="size" aria-hidden="true" :src="islandImage({ island, background: false })" />
    <span v-if="island.expert" class="expert-chip badge-overlay text-small" aria-hidden="true">EX</span>
    <span v-else-if="hasCustomBerries(island)" class="custom-chip badge-overlay text-small" aria-hidden="true">
      Custom
    </span>
  </div>
</template>

<script setup lang="ts">
import { islandImage } from '@/services/utils/image-utils'
import { hasCustomBerries, type IslandInstance } from 'sleepapi-common'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    island: IslandInstance
    size?: number
    // turn off when the island name is already shown as visible adjacent text
    showAriaLabel?: boolean
  }>(),
  { size: 48, showAriaLabel: true }
)

const ariaLabel = computed(() => {
  if (!props.showAriaLabel) return undefined
  return hasCustomBerries(props.island) ? `${props.island.name} with custom berries` : props.island.name
})
</script>

<style scoped lang="scss">
.badge-anchor {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.badge-overlay {
  position: absolute;
  bottom: -2px;
  right: -2px;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}
</style>
