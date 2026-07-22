<template>
  <v-sheet color="secondary" rounded class="berry-sheet">
    <v-chip-group
      :model-value="selection"
      column
      multiple
      selected-class="bg-primary"
      @update:model-value="ignoreGroupModel"
    >
      <v-chip
        v-for="b in berries"
        :key="b.name"
        :value="b.name"
        class="berry-chip"
        :aria-label="capitalize(b.name)"
        @click="emit('toggle', b)"
      >
        <v-avatar size="28" rounded="0">
          <v-img :src="berryImage(b)" :alt="`${b.name.toLowerCase()} berry`" />
        </v-avatar>
        <span v-if="main && b.name === main" class="berry-badge" aria-hidden="true">
          <v-icon size="10" icon="mdi-star" />
        </span>
      </v-chip>
    </v-chip-group>
  </v-sheet>
</template>

<script setup lang="ts">
import { berryImage } from '@/services/utils/image-utils'
import { capitalize, type Berry } from 'sleepapi-common'

withDefaults(
  defineProps<{
    berries: Berry[]
    selection: string[]
    main?: string
  }>(),
  {
    main: ''
  }
)

const emit = defineEmits<{
  toggle: [berry: Berry]
}>()

// Vuetify only honors :model-value when an update listener is registered;
// without this the group tracks its own selection and highlights chips the
// parent rejected (e.g. a 4th berry past the cap). Selection flows via toggle
const ignoreGroupModel = () => undefined
</script>

<style scoped lang="scss">
.berry-sheet {
  overflow-y: auto;

  // Fixed-width tracks so the tile block centers in the leftover space
  // before a re-wrap, while rows still fill left to right; the chips
  // render inside the chip group's slide-group content wrapper
  :deep(.v-chip-group .v-slide-group__content) {
    display: grid;
    grid-template-columns: repeat(auto-fill, 44px);
    justify-content: center;
    gap: 8px;
  }
}

// Square item-grid tiles; filter/action chips elsewhere in the app stay pill shaped
.berry-chip {
  width: 44px;
  height: 44px;
  padding: 0;
  justify-content: center;
  border-radius: 8px;
  // Let the main badge sit on the tile corner
  overflow: visible;
}

.berry-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(var(--v-theme-accent));
  color: rgb(var(--v-theme-on-primary));
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}
</style>
