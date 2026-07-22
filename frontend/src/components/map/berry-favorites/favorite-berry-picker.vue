<template>
  <div class="favorite-berry-picker">
    <div class="hint-row flex-between">
      <span class="hint text-small">{{ hint }}</span>
      <v-btn v-if="picks.length > 0" color="error-3" size="small" aria-label="clear favorite berries" @click="clearAll"
        >Clear</v-btn
      >
    </div>

    <BerryGrid :berries="berries" :selection="selection" :main="main" @toggle="onToggle" />

    <div class="picks">
      <template v-for="(slot, index) in pickSlots" :key="typeof slot === 'string' ? `empty-${index}` : slot.name">
        <div v-if="typeof slot !== 'string'" class="pick-slot">
          <v-btn
            class="pick-btn"
            :color="slot.isMain ? 'primary' : 'surface'"
            :aria-label="`star-${slot.name.toLowerCase()}`"
            :aria-pressed="slot.isMain"
            @click="starPick(slot.name)"
          >
            <v-avatar size="24" rounded="0">
              <v-img :src="berryImage(slot.berry)" :alt="`${slot.name.toLowerCase()} berry`" />
            </v-avatar>
            <span class="pick-name text-small">{{ capitalize(slot.name) }}</span>
            <v-icon size="16" :icon="slot.isMain ? 'mdi-star' : 'mdi-star-outline'" />
          </v-btn>
          <v-btn
            icon="mdi-delete"
            size="36"
            variant="text"
            color="error-3"
            :aria-label="`remove-${slot.name.toLowerCase()}`"
            @click="removePick(slot.name)"
          ></v-btn>
        </div>
        <div v-else class="pick-empty flex-center">
          <v-icon v-if="slot === 'Main'" size="14" icon="mdi-star-outline" />
          <span class="text-small">{{ slot }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import BerryGrid from '@/components/map/berry-favorites/berry-grid.vue'
import { berryImage } from '@/services/utils/image-utils'
import { capitalize, MAX_SUB_FAVORITE_BERRIES, type Berry } from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const MAX_FAVORITES = MAX_SUB_FAVORITE_BERRIES + 1

const props = defineProps<{
  berries: Berry[]
  main: string
  subs: string[]
}>()

const emit = defineEmits<{
  'update:main': [name: string]
  'update:subs': [names: string[]]
}>()

// Display order stays stable while starring; main only leads on initial load
const pickOrder = ref<string[]>([props.main, ...props.subs].filter(Boolean))

watch(
  () => [props.main, ...props.subs].filter(Boolean),
  (names) => {
    const kept = pickOrder.value.filter((name) => names.includes(name))
    const added = names.filter((name) => !kept.includes(name))
    pickOrder.value = [...kept, ...added]
  }
)

interface BerryPick {
  name: string
  berry: Berry
  isMain: boolean
}

const picks = computed<BerryPick[]>(() =>
  pickOrder.value
    .map((name) => ({ name, berry: props.berries.find((b) => b.name === name), isMain: name === props.main }))
    .filter((pick): pick is BerryPick => pick.berry !== undefined)
)

// Empty slots are labeled by what the next pick becomes: main first, then subs
const pickSlots = computed<Array<BerryPick | 'Main' | 'Sub'>>(() => {
  const hasMain = picks.value.some((pick) => pick.isMain)
  const empties: Array<'Main' | 'Sub'> = []
  while (picks.value.length + empties.length < MAX_FAVORITES) {
    empties.push(!hasMain && empties.length === 0 ? 'Main' : 'Sub')
  }
  return [...picks.value, ...empties]
})

const selection = computed(() => picks.value.map((pick) => pick.name))

const hint = computed(() => {
  const count = picks.value.length
  if (count === 0) return `Pick ${MAX_FAVORITES} favorite berries`
  if (count < MAX_FAVORITES) return `Pick ${MAX_FAVORITES - count} more`
  return 'Tap a pick to star it as your main favorite'
})

const onToggle = (b: Berry) => {
  if (b.name === props.main) {
    emit('update:main', '')
    return
  }
  if (props.subs.includes(b.name)) {
    emit(
      'update:subs',
      props.subs.filter((name) => name !== b.name)
    )
    return
  }
  if (!props.main) {
    emit('update:main', b.name)
    return
  }
  if (props.subs.length < MAX_SUB_FAVORITE_BERRIES) {
    emit('update:subs', [...props.subs, b.name])
  }
}

const starPick = (name: string) => {
  if (name === props.main) return
  const previousMain = props.main
  emit('update:main', name)
  emit(
    'update:subs',
    previousMain
      ? props.subs.map((sub) => (sub === name ? previousMain : sub))
      : props.subs.filter((sub) => sub !== name)
  )
}

const removePick = (name: string) => {
  if (name === props.main) {
    emit('update:main', '')
    return
  }
  emit(
    'update:subs',
    props.subs.filter((sub) => sub !== name)
  )
}

const clearAll = () => {
  emit('update:main', '')
  emit('update:subs', [])
}
</script>

<style scoped lang="scss">
$picks-row-breakpoint: 600px;

.favorite-berry-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-row {
  align-items: center;
  gap: 8px;
  min-height: 28px;
}

.hint {
  opacity: 0.7;
  padding-left: 2px;
}

.picks {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.pick-slot {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.pick-btn {
  flex: 1 1 auto;
  min-width: 0;
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: normal;

  :deep(.v-btn__content) {
    width: 100%;
    min-width: 0;
    gap: 6px;
  }
}

.pick-name {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.pick-empty {
  gap: 4px;
  min-height: 36px;
  border-radius: 4px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.3);
  color: rgb(var(--v-theme-on-surface));

  > .text-small,
  > .v-icon {
    opacity: 0.4;
  }
}

@media (min-width: $picks-row-breakpoint) {
  .picks {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
