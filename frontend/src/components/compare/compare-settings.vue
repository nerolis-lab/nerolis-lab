<template>
  <v-row class="flex-nowrap" dense>
    <v-col class="flex-left">
      <v-menu v-model="teamMenu" offset-y :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn v-bind="props" height="48" append-icon="mdi-chevron-down" :class="isMobile ? 'w-100' : ''">
            <template v-if="comparisonStore.currentTeam == null">
              <span v-if="!comparisonStore.teamIndex"> Select team </span>
            </template>
            <template v-else>
              <template v-if="!isMobile">
                <span>{{ comparisonStore.currentTeam.name }}</span>
                <v-divider vertical class="mx-4" />
                <v-img
                  width="36"
                  height="36"
                  :src="islandImage({ favoredBerries: comparisonStore.currentTeam.favoredBerries, background: false })"
                >
                </v-img>
                <v-img
                  src="/images/misc/camp.png"
                  width="36"
                  height="36"
                  class="ml-2"
                  :class="{ 'camp-disabled': !camp }"
                />
                <v-avatar color="white" size="36" class="ml-2">
                  <v-progress-circular
                    :model-value="
                      sleepScore({
                        bedtime: comparisonStore.currentTeam.bedtime,
                        wakeup: comparisonStore.currentTeam.wakeup
                      })
                    "
                    :size="72"
                    bg-color="#f0f0f0"
                    color="#479EFF"
                    :width="8"
                    >{{
                      sleepScore({
                        bedtime: comparisonStore.currentTeam.bedtime,
                        wakeup: comparisonStore.currentTeam.wakeup
                      })
                    }}</v-progress-circular
                  >
                </v-avatar>
                <v-divider vertical class="ml-4 mr-2" />
              </template>
              <v-img
                v-for="(member, memberIndex) in comparisonStore.currentTeam.members.filter(Boolean)"
                :key="memberIndex"
                :src="memberImage(member)"
                width="36"
                height="36"
                class="ml-2"
              ></v-img>
            </template>
          </v-btn>
        </template>

        <v-card title="Select team" max-height="50dvh" style="overflow-y: auto">
          <template #append>
            <v-btn icon elevation="0" color="transparent" @click="comparisonStore.teamIndex = undefined">
              <v-icon color="primary">mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-divider />

          <v-container class="font-weight-light text-body-2">
            <span>Selecting a team doesn't update previous calculations. </span>
            <span>Only allowing teams with maximum of 4 members. </span>
          </v-container>

          <v-divider />

          <v-list>
            <v-list-item
              v-for="(team, i) in teamStore.teams"
              :key="i"
              class="px-2"
              :variant="teamDisabled(team.members) ? 'tonal' : undefined"
              :disabled="teamDisabled(team.members)"
              @click="selectTeam(i)"
            >
              <v-row class="flex-center flex-nowrap" no-gutters>
                <v-col cols="4.1" class="text-body-2 text-truncate">
                  {{ team.name }}
                </v-col>
                <v-col v-for="(member, memberIndex) in team.members" :key="memberIndex" cols="auto">
                  <v-avatar>
                    <v-img :src="memberImage(member)"></v-img>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-col>

    <v-col cols="auto" class="flex-center">
      <v-btn icon elevation="0" color="transparent" size="36" @click="toggleClearMenu">
        <v-icon color="primary" size="36" alt="delete team icon">mdi-delete</v-icon>
      </v-btn>
    </v-col>

    <v-col cols="auto">
      <div
        class="clock-container"
        @click="comparisonStore.timeWindow = comparisonStore.timeWindow === '8H' ? '24H' : '8H'"
      >
        <svg viewBox="0 0 48 48" class="clock-face">
          <circle
            v-for="i in 12"
            :key="i"
            :cx="24 + 21 * Math.cos(((i * 30 - 90) * Math.PI) / 180)"
            :cy="24 + 21 * Math.sin(((i * 30 - 90) * Math.PI) / 180)"
            r="1.5"
            fill="white"
          />
        </svg>
        <v-progress-circular
          :size="48"
          width="6"
          :model-value="comparisonStore.timeWindow === '8H' ? 40 : 100"
          color="primary"
        >
          <template #default>
            <span class="text-white font-weight-medium" style="z-index: 2">
              {{ comparisonStore.timeWindow }}
            </span>
          </template>
        </v-progress-circular>
      </div>
    </v-col>

    <v-dialog v-model="isClearMenuOpen" aria-label="clear team menu">
      <v-row class="flex-center">
        <v-col cols="auto">
          <v-card max-width="400px">
            <v-card-title>Confirm reset</v-card-title>
            <v-card-text>Do you really want to remove these Pokémon and clear the settings?</v-card-text>

            <v-card-actions class="flex-right">
              <v-btn aria-label="cancel button" @click="toggleClearMenu">Cancel</v-btn>
              <v-btn color="primary" aria-label="clear button" @click="clearTeam">Clear compare</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { avatarImage, islandImage } from '@/services/utils/image-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_SIZE } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CompareSettings',
  setup() {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const { isMobile } = useBreakpoint()

    if (comparisonStore.currentTeam && comparisonStore.currentTeam.members.filter(Boolean).length >= MAX_TEAM_SIZE) {
      comparisonStore.teamIndex = undefined
    }

    return { comparisonStore, teamStore, pokemonStore, isMobile, islandImage, sleepScore: TimeUtils.sleepScore }
  },
  data: () => ({
    teamMenu: false,
    isClearMenuOpen: false
  }),
  computed: {
    camp() {
      return this.comparisonStore.currentTeam?.camp
    }
  },
  methods: {
    selectTeam(teamIndex: number) {
      this.comparisonStore.teamIndex = teamIndex
      this.teamMenu = false
    },
    teamDisabled(members: (string | undefined)[]) {
      return members.filter(Boolean).length > 4
    },
    memberImage(externalId?: string) {
      if (externalId) {
        const pokemonInstance = this.pokemonStore.getPokemon(externalId)
        return (
          pokemonInstance &&
          avatarImage({
            pokemonName: pokemonInstance?.pokemon.name,
            happy: false,
            shiny: pokemonInstance?.shiny
          })
        )
      }
    },
    toggleClearMenu() {
      this.isClearMenuOpen = !this.isClearMenuOpen
    },
    clearTeam() {
      this.toggleClearMenu()
      this.comparisonStore.$reset()
    }
  }
})
</script>

<style lang="scss">
.clock-container {
  position: relative;
}

.clock-face {
  position: absolute;
  z-index: 2;
}

.camp-disabled {
  filter: grayscale(100%);
}
</style>
