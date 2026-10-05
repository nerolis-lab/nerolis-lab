<template>
  <v-dialog
    :model-value="dialogStore.scheduleDialog"
    max-width="900px"
    scrollable
    @update:model-value="!$event && closeSchedule()"
  >
    <v-card v-if="slotIndex !== null" title="Schedule">
      <v-card-text class="pb-2">
        <v-select
          :model-value="scheduleType"
          class="mb-6"
          density="compact"
          hide-details
          item-title="title"
          item-value="value"
          :items="scheduleTypes"
          label="Rotate by"
          :disabled="saving || shifts.length === 0"
          @update:model-value="changeScheduleType"
        />
        <v-row
          :inert="saving"
          class="schedule-row flex-nowrap"
          :class="{ 'schedule-row-timed': scheduleType === 'time' }"
          :style="
            scheduleType === 'ingredients' ? { paddingBottom: `${60 + ingredientRequirementRows * 28}px` } : undefined
          "
          dense
        >
          <v-col
            v-for="{ shift, pokemon, subskillBadge } in scheduleTiles"
            :key="`${shift.externalId}-${shift.startTime}`"
            class="schedule-tile"
            cols="auto"
          >
            <PokemonSlotDisplay
              v-if="pokemon"
              :name="pokemon.name"
              :image-url="image(shift.externalId)"
              :level="`Level ${pokemon.level}`"
              :badge="subskillBadge"
              badge-color="subskillGold"
              background-color="secondary"
              @click="selectedShift = shift"
            />
            <v-btn
              v-if="scheduleType === 'time'"
              class="schedule-time-button"
              color="primary"
              :aria-label="`Edit shift start time for ${pokemon?.name ?? 'Pokemon'}: ${shift.startTime}`"
              :disabled="saving"
              @click="openTimePicker(shift)"
              >{{ shift.startTime }}</v-btn
            >
            <div v-if="scheduleType === 'ingredients'" class="schedule-ingredient-details">
              <v-btn
                class="w-100"
                color="primary"
                :disabled="saving"
                :aria-label="`Edit ingredient requirements for ${pokemon?.name ?? 'Pokemon'}`"
                @click="ingredientShift = shift"
                >{{ shift.ingredientThresholds?.length ? 'Ingredients' : 'Alternate' }}</v-btn
              >
              <ul class="schedule-ingredient-requirements mt-2">
                <li v-for="threshold in shift.ingredientThresholds" :key="threshold.name">
                  <span>{{ threshold.minimum }} &lt;=</span>
                  <img
                    :src="ingredientImage(threshold.name)"
                    :alt="getIngredient(threshold.name).longName"
                    :title="getIngredient(threshold.name).longName"
                    width="24"
                    height="24"
                  />
                  <span>&lt; {{ threshold.maximum }}</span>
                </li>
              </ul>
            </div>
          </v-col>
          <v-col v-if="!limitedToTwo || shifts.length < 2" class="schedule-tile schedule-add-slot" cols="auto">
            <v-card class="schedule-add-card w-100 fill-height frosted-glass d-flex align-center" @click="addPokemon">
              <v-icon class="w-100" color="secondary" size="44">mdi-plus</v-icon>
            </v-card>
          </v-col>
        </v-row>
        <template v-if="conditionalDefinition">
          <p class="text-body-2 mt-4">
            {{ targetDescription }}
          </p>
          <v-text-field
            id="rotationTarget"
            hide-details="auto"
            v-model="conditionTarget"
            :label="targetLabel"
            :inputmode="conditionalDefinition.inputmode"
            :error-messages="targetError"
            :loading="saving"
            @keydown.enter.prevent="saveTarget"
            @blur="saveTarget"
            type="text"
          />
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="text-body" size="large" rounded="lg" color="primary" @click="closeSchedule">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shiftMenu" max-width="360px">
    <v-card v-if="selectedShift" title="Scheduled Pokémon">
      <v-list>
        <template v-if="scheduleType === 'ingredients'">
          <v-list-item
            title="Move earlier"
            prepend-icon="mdi-arrow-left"
            :disabled="saving || !canMoveSelected(-1)"
            @click="moveSelected(-1)"
          />
          <v-list-item
            title="Move later"
            prepend-icon="mdi-arrow-right"
            :disabled="saving || !canMoveSelected(1)"
            @click="moveSelected(1)"
          />
        </template>
        <v-list-item prepend-icon="mdi-pencil" :disabled="saving" title="Edit" @click="editPokemon" />
        <v-list-item
          id="schedule-pokebox-button"
          :disabled="saving || !userStore.loggedIn"
          :prepend-icon="selectedPokemon?.saved ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
          @click="togglePokebox"
          >{{ selectedPokemon?.saved ? 'Remove from Pokebox' : 'Save to Pokebox' }}</v-list-item
        >
        <v-list-item
          :disabled="saving || shifts.length === 1"
          prepend-icon="mdi-delete"
          title="Remove from schedule"
          @click="removeShift"
        />
      </v-list>
    </v-card>
  </v-dialog>

  <v-dialog v-model="timePicker" max-width="400px">
    <v-card title="Select shift start time">
      <v-time-picker v-model="updatedTime" color="primary" format="24hr" :allowed-minutes="allowedStep" />
      <v-card-actions
        ><v-spacer /><v-btn @click="timePicker = false">Cancel</v-btn
        ><v-btn color="primary" @click="saveTime">Save</v-btn></v-card-actions
      >
    </v-card>
  </v-dialog>
  <v-dialog
    :model-value="!!ingredientShift"
    max-width="560px"
    @update:model-value="!$event && (ingredientShift = null)"
  >
    <IngredientRotationEditor
      v-if="ingredientShift"
      :initial="ingredientShift.ingredientThresholds ?? []"
      :alternate-exists="
        scheduleShifts.some((shift) => shift !== ingredientShift && !shift.ingredientThresholds?.length)
      "
      @cancel="ingredientShift = null"
      @save="saveIngredientThresholds"
    />
  </v-dialog>
  <v-dialog ref="ingredientExplainerDialog" v-model="showIngredientExplainer" max-width="440px">
    <v-card class="pa-4">
      <v-card-title class="text-h6">Ingredient rotation</v-card-title>
      <v-card-text class="text-body-2">
        <p class="mb-3">Pokémon rotate as ingredient supplies change during the simulation.</p>
        <ol class="pl-4">
          <li class="mb-2">
            <strong>Minimums:</strong> Pokémon rotate in to keep ingredients above their minimums.
          </li>
          <li class="mb-2">
            <strong>Maximums:</strong> Once all minimums are met, Pokémon rotate in until their ingredients reach their
            maximums.
          </li>
          <li class="mb-2">
            <strong>Alternates:</strong> A Pokémon with no ingredient targets waits at the end of the schedule and is
            rotated in when all maximums are met. Without an alternate, the first Pokémon stays in.
          </li>
          <li>
            <strong>Priority:</strong> Ingredient targets are prioritized from left to right, with minimums always met
            first.
          </li>
        </ol>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="acknowledgeIngredientExplainer">Got it</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { UserService } from '@/services/user/user-service'
import PokemonSlotDisplay from '@/components/custom-components/pokemon-slot-display.vue'
import IngredientRotationEditor from './ingredient-rotation-editor.vue'
import { ingredientImage, pokemonImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { useScheduleStore } from '@/stores/schedule-store'
import {
  conditionalScheduleDefinitions,
  getConditionalScheduleDefinition,
  getScheduleTarget,
  withScheduleTarget,
  validateScheduleTarget,
  ingredient,
  getIngredient,
  orderIngredientSchedule,
  validateIngredientThresholds,
  type ScheduleIngredientThreshold,
  subskill,
  type PokemonInstance,
  type TeamScheduleShift,
  type TeamScheduleType
} from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const dialogStore = useDialogStore()
const teamStore = useTeamStore()
const pokemonStore = usePokemonStore()
const userStore = useUserStore()
const scheduleStore = useScheduleStore()
const showIngredientExplainer = ref(false)
const acknowledgeIngredientExplainer = () => {
  scheduleStore.ingredientExplainerAcknowledged = true
  showIngredientExplainer.value = false
}
const selectedShift = ref<TeamScheduleShift | null>(null)
const timeShift = ref<TeamScheduleShift | null>(null)
const ingredientShift = ref<TeamScheduleShift | null>(null)
const timePicker = ref(false)
const updatedTime = ref<string | null>(null)
const conditionTarget = ref('1')
const saving = ref(false)
const scheduleShifts = ref<TeamScheduleShift[]>([])
const pokemonFor = (externalId: string) => pokemonStore.getPokemon(externalId)
const selectedPokemon = computed(() => selectedShift.value && pokemonFor(selectedShift.value.externalId))

const slotIndex = computed(() => dialogStore.scheduleSlotIndex)
const shifts = computed(() => {
  if (scheduleType.value !== 'time') return scheduleShifts.value
  const minutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
  }
  const wakeup = minutes(teamStore.getCurrentTeam.wakeup)
  const sinceWakeup = (time: string) => (minutes(time) - wakeup + 1440) % 1440
  return scheduleShifts.value.slice().sort((a, b) => sinceWakeup(a.startTime) - sinceWakeup(b.startTime))
})
const scheduleType = ref<TeamScheduleType>('time')
const ingredientRequirementRows = computed(() =>
  Math.max(0, ...shifts.value.map((shift) => shift.ingredientThresholds?.length ?? 0))
)
const scheduleTiles = computed(() =>
  shifts.value.map((shift) => {
    const pokemon = pokemonFor(shift.externalId)
    const subskillBadge = [subskill.HELPING_BONUS, subskill.ENERGY_RECOVERY_BONUS]
      .filter((teamSubskill) =>
        pokemon?.subskills.some(
          (support) =>
            support.subskill.name.toLowerCase() === teamSubskill.name.toLowerCase() && support.level <= pokemon.level
        )
      )
      .map((teamSubskill) => teamSubskill.shortName)
      .join(' + ')
    return { shift, pokemon, subskillBadge }
  })
)
const conditionalDefinition = computed(() => getConditionalScheduleDefinition(scheduleType.value))
const limitedToTwo = computed(() => !!conditionalDefinition.value)
const targetError = computed(() => validateScheduleTarget(scheduleType.value, Number(conditionTarget.value)))
const primaryPokemon = computed(() => {
  const externalId = slotIndex.value === null ? undefined : teamStore.getCurrentTeam.members[slotIndex.value]
  return externalId ? pokemonFor(externalId) : undefined
})
const targetDescription = computed(() => {
  const description = conditionalDefinition.value?.description
  return typeof description === 'function' ? description(primaryPokemon.value?.pokemon) : description
})
const targetLabel = computed(() => {
  const label = conditionalDefinition.value?.targetLabel
  return typeof label === 'function' ? label(primaryPokemon.value?.pokemon) : label
})
const scheduleTypes = [
  { title: 'Time', value: 'time' },
  { title: 'Ingredients', value: 'ingredients' },
  ...Object.entries(conditionalScheduleDefinitions).map(([value, definition]) => ({
    title: definition.title,
    value
  }))
]
const shiftMenu = computed({
  get: () => selectedShift.value !== null,
  set: (open) => !open && (selectedShift.value = null)
})

watch(
  [() => dialogStore.scheduleDialog, () => slotIndex.value],
  ([open]) => {
    selectedShift.value = null
    timeShift.value = null
    ingredientShift.value = null
    timePicker.value = false
    if (!open || slotIndex.value === null) {
      scheduleShifts.value = []
      return
    }
    const next = teamStore.getSchedule(slotIndex.value).map((shift) => ({ ...shift }))
    scheduleShifts.value = next
    scheduleType.value = next[0]?.type ?? 'time'
    conditionTarget.value = String(
      (next[0] && getScheduleTarget(next[0])) ?? conditionalDefinition.value?.defaultTarget ?? 1
    )
  },
  { immediate: true }
)

watch(
  [() => dialogStore.scheduleDialog, scheduleType],
  ([open, type]) => {
    showIngredientExplainer.value = open && type === 'ingredients' && !scheduleStore.ingredientExplainerAcknowledged
  },
  { immediate: true }
)

const image = (externalId: string) => {
  const pokemon = pokemonFor(externalId)
  return pokemon ? pokemonImage({ pokemonName: pokemon.pokemon.name, shiny: pokemon.shiny }) : ''
}
const allowedStep = (minute: number) => minute % 5 === 0

// Serialize saves so a slower earlier calculation cannot replace a later edit.
let saveQueue = Promise.resolve()
let pendingSaves = 0
const runSave = (action: () => Promise<void>) => {
  pendingSaves++
  saving.value = true
  const save = saveQueue.then(action, action)
  saveQueue = save.finally(() => {
    pendingSaves--
    saving.value = pendingSaves > 0
  })
  return saveQueue
}
const persistSchedule = (next: TeamScheduleShift[]) => {
  const index = slotIndex.value
  if (index === null || JSON.stringify(next) === JSON.stringify(scheduleShifts.value)) return Promise.resolve()
  scheduleShifts.value = next
  return runSave(async () => {
    await teamStore.setSchedule(index, next)
  })
}

const changeScheduleType = async (type: TeamScheduleType) => {
  if (saving.value) return
  const definition = getConditionalScheduleDefinition(type)
  const currentShifts = shifts.value
  scheduleType.value = type
  const next = (limitedToTwo.value ? currentShifts.slice(0, 2) : currentShifts).map((shift, index) =>
    withScheduleTarget(
      shift,
      type,
      index === 0
        ? ((shift.type === type ? getScheduleTarget(shift) : undefined) ?? definition?.defaultTarget)
        : undefined
    )
  )
  conditionTarget.value = String(
    (next[0] && getScheduleTarget(next[0])) ?? conditionalDefinition.value?.defaultTarget ?? 1
  )
  await persistSchedule(
    type === 'ingredients'
      ? orderIngredientSchedule(
          next.map((shift) => ({
            ...shift,
            ingredientThresholds: shift.ingredientThresholds ?? defaultIngredientThresholds(shift.externalId)
          }))
        )
      : next
  )
}
const defaultIngredientThresholds = (externalId: string): ScheduleIngredientThreshold[] => [
  {
    name: pokemonFor(externalId)?.ingredients[0]?.ingredient.name ?? ingredient.INGREDIENTS[0].name,
    minimum: 1,
    maximum: 10
  }
]
const saveIngredientThresholds = async (thresholds: ScheduleIngredientThreshold[]) => {
  if (saving.value || !ingredientShift.value || validateIngredientThresholds(thresholds)) return
  if (
    !thresholds.length &&
    scheduleShifts.value.some((shift) => shift !== ingredientShift.value && !shift.ingredientThresholds?.length)
  )
    return
  const updated = scheduleShifts.value.map((shift) =>
    shift === ingredientShift.value ? { ...shift, ingredientThresholds: thresholds } : shift
  )
  if (!scheduleShifts.value.includes(ingredientShift.value)) {
    updated.push({ ...ingredientShift.value, ingredientThresholds: thresholds })
  }
  ingredientShift.value = null
  await persistSchedule(orderIngredientSchedule(updated))
}
const canMoveSelected = (direction: number) => {
  const index = selectedShift.value ? scheduleShifts.value.indexOf(selectedShift.value) : -1
  return (
    index >= 0 &&
    !!selectedShift.value?.ingredientThresholds?.length &&
    !!scheduleShifts.value[index + direction]?.ingredientThresholds?.length
  )
}
const moveSelected = async (direction: number) => {
  if (saving.value || !canMoveSelected(direction)) return
  const next = scheduleShifts.value.slice()
  const index = next.indexOf(selectedShift.value!)
  ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
  selectedShift.value = null
  await persistSchedule(next)
}
const closeSchedule = async () => {
  // Closing never saves a separate draft, but lets already requested saves finish.
  while (saving.value) await saveQueue
  dialogStore.closeSchedule()
}
const saveTarget = async () => {
  if (targetError.value || !limitedToTwo.value || slotIndex.value === null) return
  const target = Number(conditionTarget.value)
  await persistSchedule(
    scheduleShifts.value.map((shift, index) =>
      withScheduleTarget(shift, scheduleType.value, index === 0 ? target : undefined)
    )
  )
}
const addPokemon = () => {
  if (saving.value || (limitedToTwo.value && shifts.value.length >= 2)) return
  dialogStore.openPokemonSearch(async (pokemon) => {
    if (slotIndex.value === null || saving.value) return
    pokemonStore.upsertLocalPokemon(pokemon)
    const latest =
      scheduleType.value === 'ingredients'
        ? scheduleShifts.value.reduce(
            (latest, shift) => (shift.startTime > latest ? shift.startTime : latest),
            teamStore.getCurrentTeam.wakeup
          )
        : (shifts.value.at(-1)?.startTime ?? teamStore.getCurrentTeam.wakeup)
    const [hour, minute] = latest.split(':').map(Number)
    const nextMinutes = (hour * 60 + minute + 5) % 1440
    const added: TeamScheduleShift = {
      slotIndex: slotIndex.value,
      externalId: pokemon.externalId,
      startTime: `${String(Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`,
      type: scheduleType.value
    }
    if (scheduleType.value === 'ingredients') {
      added.ingredientThresholds = []
      ingredientShift.value = added
      return
    }
    await persistSchedule([...scheduleShifts.value, added])
  })
}
const removeShift = async () => {
  if (saving.value || !selectedShift.value || shifts.value.length === 1) return
  const index = scheduleShifts.value.indexOf(selectedShift.value)
  selectedShift.value = null
  const remaining = scheduleShifts.value.filter((_, shiftIndex) => shiftIndex !== index)
  if (limitedToTwo.value && index === 0) {
    remaining[0] = withScheduleTarget(remaining[0], scheduleType.value, getScheduleTarget(scheduleShifts.value[0]))
  }
  await persistSchedule(remaining)
}
const saveTime = async () => {
  if (saving.value) return
  if (!timeShift.value || !updatedTime.value) return
  if (shifts.value.some((shift) => shift !== timeShift.value && shift.startTime === updatedTime.value)) return
  const shiftToUpdate = timeShift.value
  const nextShifts = scheduleShifts.value.map((shift) =>
    shift === shiftToUpdate ? { ...shift, startTime: updatedTime.value! } : shift
  )
  timeShift.value = null
  timePicker.value = false
  await persistSchedule(nextShifts)
}
const openTimePicker = (shift: TeamScheduleShift) => {
  timeShift.value = shift
  updatedTime.value = shift.startTime
  timePicker.value = true
}
const savePokemon = (updated: PokemonInstance) =>
  runSave(async () => {
    pokemonStore.upsertLocalPokemon(updated)
    const inSchedule = teamStore.getCurrentTeam.schedule?.some((shift) => shift.externalId === updated.externalId)
    const primaryIndex = teamStore.getCurrentTeam.members.indexOf(updated.externalId)
    if (inSchedule) {
      await teamStore.updateTeam()
      await teamStore.calculateProduction(teamStore.currentIndex)
      teamStore.resetCurrentTeamIvs()
    } else if (primaryIndex >= 0) {
      await teamStore.updateTeamMember(updated, primaryIndex)
    } else {
      if (userStore.loggedIn) await UserService.upsertPokemon(updated)
      await teamStore.calculateProduction(teamStore.currentIndex)
      teamStore.resetCurrentTeamIvs()
    }
  })
const editPokemon = () => {
  const shift = selectedShift.value
  const pokemon = shift && pokemonFor(shift.externalId)
  if (!pokemon || saving.value) return
  dialogStore.openPokemonInput(savePokemon, pokemon)
  selectedShift.value = null
}
const togglePokebox = async () => {
  const pokemon = selectedPokemon.value
  if (!userStore.loggedIn || !pokemon || saving.value) return
  await savePokemon({ ...pokemon, saved: !pokemon.saved })
}
</script>

<style scoped>
.schedule-row {
  overflow-x: auto;
  padding-bottom: 8px;
}
.schedule-row-timed {
  padding-bottom: 52px;
}
.schedule-time-button {
  position: absolute;
  top: 100%;
  left: 50%;
  /* Match the Pokémon card inside the dense column's 4px side padding. */
  width: calc(100% - 8px);
  min-width: 0;
  margin-top: 8px;
  transform: translateX(-50%);
}
.schedule-tile {
  position: relative;
  flex: 1 0 18%;
  min-width: 18%;
  max-width: 18%;
  max-height: 25dvh;
  aspect-ratio: 6 / 10;
}
.schedule-ingredient-details {
  position: absolute;
  top: 100%;
  left: 4px;
  width: calc(100% - 8px);
  margin-top: 8px;
}
.schedule-ingredient-requirements {
  list-style: none;
  padding: 0;
}
.schedule-ingredient-requirements li {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  white-space: nowrap;
}
.schedule-add-slot {
  flex-basis: 20%;
  min-width: 20%;
  max-width: 20%;
}
</style>
