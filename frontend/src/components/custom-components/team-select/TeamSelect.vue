<template>
  <v-menu v-model="menuOpen" :close-on-content-click="false" location="bottom" transition="slide-y-transition">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        height="48"
        append-icon="mdi-chevron-down"
        :class="buttonClass"
        color="secondary-medium-dark"
      >
        <template v-if="selectedTeam == null">
          <span v-if="modelValue === undefined">{{ placeholderText }}</span>
        </template>
        <template v-else>
          <template v-if="showFullDetails && !isMobile">
            <span>{{ selectedTeam.name }}</span>
            <v-divider vertical class="mx-4" />
            <v-img
              v-if="showIsland"
              width="36"
              height="36"
              :src="islandImage({ island: selectedTeam.island, background: false })"
            />
            <v-img
              v-if="showCamp"
              src="/images/misc/camp.png"
              width="36"
              height="36"
              class="ml-2"
              :class="{ 'camp-disabled': !selectedTeam.camp }"
              data-testid="camp-image"
            />
            <v-avatar v-if="showSleepScore" color="white" size="36" class="ml-2">
              <v-progress-circular
                :model-value="
                  sleepScore({
                    bedtime: selectedTeam.bedtime,
                    wakeup: selectedTeam.wakeup
                  })
                "
                :size="72"
                bg-color="#f0f0f0"
                color="#479EFF"
                :width="8"
                >{{
                  sleepScore({
                    bedtime: selectedTeam.bedtime,
                    wakeup: selectedTeam.wakeup
                  })
                }}</v-progress-circular
              >
            </v-avatar>
            <v-divider v-if="showMembers" vertical class="ml-4 mr-2" />
          </template>
          <template v-else>
            <span>{{ selectedTeam.name }}</span>
          </template>
          <v-img
            v-if="showMembers"
            v-for="(member, memberIndex) in selectedTeam.members.filter(Boolean)"
            :key="memberIndex"
            :src="getMemberImage(member)"
            width="36"
            height="36"
            class="ml-2"
          />
        </template>
      </v-btn>
    </template>

    <v-card :title="cardTitle" max-height="50dvh" min-width="280px" style="overflow-y: auto">
      <template v-if="showDeleteButton" #append>
        <v-btn icon elevation="0" color="transparent" @click="handleClear">
          <v-icon color="primary">mdi-delete</v-icon>
        </v-btn>
      </template>
      <v-divider />

      <v-container v-if="helperText" class="font-weight-light text-body-2">
        <span>{{ helperText }}</span>
      </v-container>

      <v-divider v-if="helperText" />

      <v-list>
        <v-list-item
          v-for="(team, i) in teams"
          :key="i"
          class="px-2"
          :variant="isTeamDisabled(team) ? 'tonal' : undefined"
          :disabled="isTeamDisabled(team)"
          @click="selectTeam(i)"
        >
          <v-row class="flex-center flex-nowrap" no-gutters>
            <v-col cols="4.1" class="text-body-2 text-truncate">
              {{ team.name }}
            </v-col>
            <v-col v-for="(member, memberIndex) in team.members" :key="memberIndex" cols="auto">
              <v-avatar>
                <v-img :src="getMemberImage(member)" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { avatarImage, islandImage } from '@/services/utils/image-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import { MAX_TEAM_SIZE } from 'sleepapi-common'
import { computed, ref } from 'vue'

export interface TeamSelectProps {
  modelValue?: number
  placeholderText?: string
  cardTitle?: string
  helperText?: string
  buttonClass?: string
  showFullDetails?: boolean
  showIsland?: boolean
  showCamp?: boolean
  showSleepScore?: boolean
  showMembers?: boolean
  showDeleteButton?: boolean
  maxTeamSize?: number
  teams?: TeamInstance[]
}

const props = withDefaults(defineProps<TeamSelectProps>(), {
  placeholderText: 'Select team',
  cardTitle: 'Select team',
  buttonClass: '',
  showFullDetails: true,
  showIsland: true,
  showCamp: true,
  showSleepScore: true,
  showMembers: true,
  showDeleteButton: true,
  maxTeamSize: MAX_TEAM_SIZE - 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined]
  clear: []
}>()

const { isMobile } = useBreakpoint()
const pokemonStore = usePokemonStore()
const teamStore = useTeamStore()

const menuOpen = ref(false)

const sleepScore = TimeUtils.sleepScore

const teams = computed(() => props.teams || teamStore.teams)

const selectedTeam = computed(() => {
  if (props.modelValue === undefined) return null
  return teams.value[props.modelValue] || null
})

const getMemberImage = (externalId?: string) => {
  if (externalId) {
    const pokemonInstance = pokemonStore.getPokemon(externalId)
    return (
      pokemonInstance &&
      avatarImage({
        pokemonName: pokemonInstance?.pokemon.name,
        happy: false,
        shiny: pokemonInstance?.shiny
      })
    )
  }
}

const isTeamDisabled = (team: TeamInstance) => {
  return team.members.filter(Boolean).length > props.maxTeamSize
}

const selectTeam = (index: number) => {
  emit('update:modelValue', index)
  menuOpen.value = false
}

const handleClear = () => {
  emit('clear')
  menuOpen.value = false
}
</script>

<style scoped>
.camp-disabled {
  filter: grayscale(100%);
}
</style>
