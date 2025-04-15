<template>
  <v-container class="team-container pt-2">
    <v-row v-if="!isMobile" id="desktop-layout" class="d-flex justify-left flex-nowrap">
      <v-col cols="auto">
        <v-card-actions class="px-0" :disabled="!userStore.loggedIn">
          <v-btn
            icon="mdi-chevron-left"
            size="36"
            class="px-0 mx-auto"
            variant="plain"
            aria-label="previous team"
            :disabled="!userStore.loggedIn"
            @click="teamStore.prev"
          ></v-btn>

          <TeamName />

          <v-btn icon="mdi-delete" size="36" color="primary" aria-label="delete team" @click="openDeleteMenu"></v-btn>

          <v-btn
            icon="mdi-chevron-right"
            size="36"
            class="px-0 mx-auto"
            variant="plain"
            aria-label="next team"
            :disabled="!userStore.loggedIn"
            @click="teamStore.next"
          ></v-btn>
        </v-card-actions>

        <TeamSettings />

        <v-window v-model="teamStore.currentIndex" continuous class="mt-2">
          <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
            <v-row class="flex-column" dense style="height: 75dvh">
              <v-col v-for="member in teamSlots" :key="member" :class="[teamSlots > 1 ? 'team-slot' : '']">
                <TeamSlot :member-index="member - 1" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>

      <v-col v-if="teamStore.getCurrentTeam.production" class="mt-3">
        <v-card :loading="teamStore.loadingTeams" class="fill-height frosted-glass">
          <template v-if="teamStore.getTeamSize > 1">
            <v-tabs v-model="teamStore.tab" class="d-flex justify-space-around">
              <v-tab
                v-for="(tabItem, index) in tabs"
                :key="tabItem.value"
                :value="tabItem.value"
                :data-index="index"
                :class="[teamStore.tab === tabItem.value ? 'frosted-glass-light' : 'bg-surface', 'tab-item']"
              >
                {{ tabItem.label }}
              </v-tab>
            </v-tabs>

            <v-tabs-window v-model="teamStore.tab">
              <v-tabs-window-item value="overview">
                <TeamResults />
              </v-tabs-window-item>

              <v-tabs-window-item value="members">
                <MemberResults />
              </v-tabs-window-item>

              <v-tabs-window-item value="cooking">
                <CookingResults />
              </v-tabs-window-item>
            </v-tabs-window>
          </template>
          <template v-else>
            <MemberResults />
          </template>
        </v-card>
      </v-col>
      <v-col v-else-if="teamStore.getTeamSize > 0" class="mt-3">
        <v-card class="fill-height">
          <v-col cols="12">
            <v-skeleton-loader type="card"></v-skeleton-loader>
            <v-skeleton-loader type="subtitle"></v-skeleton-loader>
          </v-col>

          <v-row>
            <v-col cols="6">
              <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mobile Layout -->
    <div v-else id="mobile-layout">
      <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
        <v-btn
          icon="mdi-chevron-left"
          size="36"
          class="px-0 mx-auto"
          variant="plain"
          aria-label="previous team"
          :disabled="!userStore.loggedIn"
          @click="teamStore.prev"
        ></v-btn>

        <TeamName />

        <v-btn icon="mdi-delete" size="36" color="primary" aria-label="delete team" @click="openDeleteMenu"></v-btn>

        <v-btn
          icon="mdi-chevron-right"
          size="36"
          class="px-0 mx-auto"
          variant="plain"
          aria-label="next team"
          :disabled="!userStore.loggedIn"
          @click="teamStore.next"
        ></v-btn>
      </v-card-actions>

      <v-window v-model="teamStore.currentIndex" continuous style="margin-top: -5px">
        <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
          <v-row class="flex-nowrap" dense>
            <v-col v-for="member in teamSlots" :key="member" class="team-slot" style="position: relative">
              <TeamSlot :member-index="member - 1" />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>

      <TeamSettings class="pt-3 pb-2" />

      <v-row v-if="teamStore.getCurrentTeam.production" dense>
        <v-col cols="12">
          <v-card :loading="teamStore.loadingTeams" class="fill-height frosted-glass">
            <template v-if="teamStore.getTeamSize > 1">
              <v-tabs v-model="teamStore.tab" class="d-flex justify-space-around">
                <v-tab
                  v-for="(tabItem, index) in tabs"
                  :key="tabItem.value"
                  :value="tabItem.value"
                  :data-index="index"
                  :class="[teamStore.tab === tabItem.value ? 'frosted-glass-light' : 'bg-surface', 'tab-item']"
                >
                  {{ tabItem.label }}
                </v-tab>
              </v-tabs>

              <v-tabs-window v-model="teamStore.tab">
                <v-tabs-window-item value="overview">
                  <TeamResults />
                </v-tabs-window-item>

                <v-tabs-window-item value="members">
                  <MemberResults />
                </v-tabs-window-item>

                <v-tabs-window-item value="cooking">
                  <CookingResults />
                </v-tabs-window-item>
              </v-tabs-window>
            </template>
            <template v-else>
              <MemberResults />
            </template>
          </v-card>
        </v-col>
      </v-row>
      <v-col v-else-if="teamStore.getTeamSize > 0" class="mt-3">
        <v-card class="fill-height">
          <v-col cols="12">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>

          <v-col cols="12">
            <v-skeleton-loader max-height="50" type="image"></v-skeleton-loader>
          </v-col>
          <v-row>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </div>

    <!-- Optimizer Section -->
    <div class="optimizer-section">
      <v-card class="p-4" width="100%">
        <!-- Progress Bar -->
        <!-- <v-progress-linear :value="(scored / total) * 100" height="20" color="primary" class="mb-4">
          <template #default> Scored {{ scored }} / {{ total }} </template>
        </v-progress-linear> -->

        <v-progress-linear :model-value="progressValue" :height="20" color="primary" class="mb-4">
          <template #default> Scored {{ totalTeamsSearched }} / {{ total - scored + totalTeamsSearched }} </template>
        </v-progress-linear>

        <!-- Total Teams Info -->
        <div class="d-flex justify-space-between">
          <span>Total: {{ totalTeamsSearched }}</span>
          <span>Total Possible Teams: {{ totalPossibleTeams }}</span>
        </div>

        <!-- Current Best Team Strength -->
        <div class="text-center mt-2">
          <strong>
            Best Team Strength:
            <span :style="{ color: 'rgb(var(--v-theme-strength))' }">
              {{ Math.round(bestTeamStrength) }}
            </span>
          </strong>
        </div>

        <!-- Current Best Team -->
        <div class="d-flex justify-center mt-4">
          <table>
            <tr>
              <!-- Pokémon Images -->
              <td v-for="(sprite, index) in bestTeamSprites" :key="index" class="text-center">
                <img :src="sprite" alt="Pokemon Sprite" class="mx-2" width="50" height="50" />
              </td>
            </tr>
            <tr>
              <!-- Pokémon Custom Names -->
              <td v-for="(member, index) in bestTeam" :key="index" class="text-center">
                <strong>{{ member.name || '' }}</strong>
              </td>
            </tr>
            <tr>
              <!-- Pokémon Display Names -->
              <td v-for="(member, index) in bestTeam" :key="index" class="text-center">
                {{ member.pokemon.displayName }}
              </td>
            </tr>
          </table>
        </div>
      </v-card>
    </div>
  </v-container>

  <v-dialog v-model="isDeleteOpen" aria-label="delete team menu">
    <v-row class="flex-center">
      <v-col cols="auto">
        <v-card max-width="400px">
          <v-card-title>Confirm delete team</v-card-title>
          <v-card-text>Do you really want to delete this team?</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="toggleDeleteMenu">Close</v-btn>
            <v-row>
              <v-btn color="surface" aria-label="close button" @click="toggleDeleteMenu">Close</v-btn>

              <v-btn color="primary" aria-label="delete button" @click="deleteTeam">Delete team</v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-dialog>

  <div class="team-section">
    <div class="button-container">
      <v-btn color="primary" @click="startFindOptimalTeam">Find Optimal Team</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import CookingResults from '@/components/calculator/results/cooking-results.vue'
import MemberResults from '@/components/calculator/results/member-results/member-results.vue'
import TeamResults from '@/components/calculator/results/team-results.vue'
import TeamName from '@/components/calculator/team-name.vue'
import TeamSettings from '@/components/calculator/team-settings/team-settings.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { findOptimalTeam } from '@/services/team/find-optimal'
import { pokemonImage } from '@/services/utils/image-utils'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { defineComponent, ref, watch } from 'vue'

const MAX_TEAM_MEMBERS = 5

export default defineComponent({
  components: {
    TeamSlot,
    TeamName,
    TeamSettings,
    TeamResults,
    MemberResults,
    CookingResults
  },
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const notificationStore = useNotificationStore()

    const { isMobile } = useBreakpoint()

    const isLoading = ref(false)
    const scored = ref(0)
    const total = ref(0)
    const totalTeamsSearched = ref(0)
    const totalPossibleTeams = ref(0)
    const bestTeam = ref([]) // Store the current best team
    const bestTeamSprites = ref<string[]>([]) // Store the sprites for the best team
    const bestTeamStrength = ref(0) // Store the strength of the best team
    const teamsToCheck = ref([])

    const startFindOptimalTeam = async () => {
      isLoading.value = true
      scored.value = 0
      total.value = 0
      totalTeamsSearched.value = 0
      totalPossibleTeams.value = 0
      bestTeam.value = []
      bestTeamSprites.value = []
      bestTeamStrength.value = 0

      await findOptimalTeam(
        (
          currentScored,
          currentTotal,
          currentTotalTeamsSearched,
          currentTotalPossibleTeams,
          currentBestTeam,
          currentBestTeamStrength
        ) => {
          scored.value = currentScored
          total.value = currentTotal
          totalTeamsSearched.value = currentTotalTeamsSearched
          totalPossibleTeams.value = currentTotalPossibleTeams
          bestTeam.value = currentBestTeam // Update the best team
          bestTeamStrength.value = currentBestTeamStrength // Update the best team's strength
        }
      )

      isLoading.value = false
    }

    // Watch for changes to the best team and update the sprites
    watch(bestTeam, (newTeam) => {
      bestTeamSprites.value = newTeam.map((member: any) =>
        pokemonImage({
          pokemonName: member.pokemon.name,
          shiny: member.shiny
        })
      )
    })

    const getPokemonImage = (member: any) => {
      return pokemonImage({
        pokemonName: member.pokemon.name,
        shiny: member.shiny
      })
    }

    return {
      userStore,
      teamStore,
      pokemonStore,
      notificationStore,
      isMobile,
      isLoading,
      scored,
      total,
      totalTeamsSearched,
      totalPossibleTeams,
      bestTeam,
      bestTeamSprites,
      bestTeamStrength,
      startFindOptimalTeam,
      getPokemonImage,
      teamsToCheck
    }
  },
  data: () => ({
    tabs: [
      { value: 'overview', label: 'Overview' },
      { value: 'members', label: 'Members' },
      { value: 'cooking', label: 'Cooking' }
    ],
    isDeleteOpen: false
  }),
  computed: {
    teamProduction() {
      const production = this.teamStore.getCurrentTeam.production
      const berries = production?.team.berries
      const ingredients = production?.team.ingredients
      return berries && ingredients ? `${berries}\n${ingredients}` : 'No production'
    },
    teamSlots() {
      return this.teamStore.getTeamSize === 0 ? 1 : MAX_TEAM_MEMBERS
    },
    progressValue() {
      // Calculate the progress value reactively
      return (this.totalTeamsSearched / (this.total - this.scored + this.totalTeamsSearched)) * 100
    }
  },
  methods: {
    openDeleteMenu() {
      this.isDeleteOpen = true
    },
    toggleDeleteMenu() {
      this.isDeleteOpen = !this.isDeleteOpen
    },
    deleteTeam() {
      this.toggleDeleteMenu()
      this.teamStore.deleteTeam()
    }
  },
  watch: {
    'teamStore.currentIndex': {
      async handler(newIndex) {
        if (!this.teamStore.teams[newIndex].production) {
          await this.teamStore.calculateProduction(newIndex)
        }
      },
      immediate: true
    }
  },
  async mounted() {
    await this.teamStore.syncTeams()

    if (!this.teamStore.getCurrentTeam.production) {
      await this.teamStore.calculateProduction(this.teamStore.currentIndex)
    }
  }
})
</script>
<style lang="scss">
.tab-item {
  flex: 1;
}

.team-slot {
  aspect-ratio: 6 / 10;
  max-height: 20dvh;
}

.team-container {
  max-width: 100%;
}

.team-section {
  position: relative;
}

.button-container {
  position: absolute;
  top: -10px;
  left: 10px;
}

.optimizer-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@media (min-width: $desktop) {
  .team-container {
    max-width: 90dvw;
  }

  .team-slot {
    aspect-ratio: 6 / 9;
    max-height: 15dvh;
  }
}
</style>
