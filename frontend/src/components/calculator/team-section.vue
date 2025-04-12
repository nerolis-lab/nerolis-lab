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
      <v-btn color="primary" @click="findOptimalTeam">Find Optimal Team</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CookingResults from '@/components/calculator/results/cooking-results.vue'
import MemberResults from '@/components/calculator/results/member-results/member-results.vue'
import TeamResults from '@/components/calculator/results/team-results.vue'
import TeamName from '@/components/calculator/team-name.vue'
import TeamSettings from '@/components/calculator/team-settings/team-settings.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { type PokemonInstanceExt } from 'sleepapi-common'
import { UserService } from '@/services/user/user-service'
import { calculateAndCachePokemonStrengths } from '@/services/strength/individual-strength-calculator'

const MAX_TEAM_MEMBERS = 5;

const generateCombinations = <T>(array: T[], size: number): T[][] => {
  if (size === 0) return [[]];
  if (array.length === 0) return [];
  const [first, ...rest] = array;
  const withFirst = generateCombinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = generateCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
};

const findOptimalTeam = async () => {
  console.log('findOptimalTeam triggered')
  const teamStore = useTeamStore()

  try {
    // Step 1: Calculate or retrieve cached Pokémon strengths
    const sortedPokemon = await calculateAndCachePokemonStrengths()

    // Log only the names and scores
    const namesAndScores = sortedPokemon.map((entry) => ({
      name: entry.pokemon.pokemon.displayName,
      strength: entry.strength,
    }))
    console.log('Sorted Names and Scores:', namesAndScores)

    // Step 2: Fetch Pokémon from the Pokebox
    const boxedPokemon = await UserService.getUserPokemon()
    console.log('Boxed Pokémon:', boxedPokemon)

    // Log all boxed Pokémon names
    console.log('Logging all boxed Pokémon names:')
    boxedPokemon.forEach((pokemon) => {
      console.log(pokemon.name) // Assuming each Pokémon object has a `name` property
    })

    // Step 3: Get the current team
    const currentTeam = teamStore.getCurrentTeam.members.filter(
      (member): member is PokemonInstanceExt => member !== undefined && typeof member !== 'string'
    )
    console.log('Filtered current team members:', currentTeam)

    // Step 4: Calculate open slots
    const openSlots = MAX_TEAM_MEMBERS - currentTeam.length
    console.log('Open slots:', openSlots)

    // Step 5: Generate combinations of Pokémon for the open slots
    const combinations = generateCombinations(boxedPokemon, openSlots)
    console.log('Generated combinations:', combinations)

    let highestStrength = 0
    let bestTeam: (string | PokemonInstanceExt | undefined)[] = [...currentTeam]

    // Step 6: Test each combination
    for (const combination of combinations) {
      const testTeam = [...currentTeam, ...combination]
      console.log('Testing team:', testTeam)

      const validTestTeam = testTeam.filter(
(member): member is PokemonInstanceExt => member !== undefined && typeof member !== 'string'
      )
      const strength = await teamStore.calculateTeamStrength(validTestTeam)
      console.log('Team strength:', strength)

      if (strength > highestStrength) {
        highestStrength = strength
        bestTeam = testTeam as (string | PokemonInstanceExt | undefined)[]
        console.log('New best team found:', bestTeam, 'with strength:', highestStrength)
      }
    }

    // Step 7: Update the team with the best combination
    teamStore.updateTeamMembers(
      bestTeam.filter(
(member): member is PokemonInstanceExt => member !== undefined && typeof member !== 'string'
)
    )
    const optimalTeamNames = bestTeam
      .filter((member): member is PokemonInstanceExt => member !== undefined && typeof member !== 'string')
      .map((member) => member.pokemon.displayName)
    console.log('Optimal Team:', optimalTeamNames)
  } catch (error) {
    console.error('Error in findOptimalTeam:', error)
  }
}

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

    return { userStore, teamStore, pokemonStore, notificationStore, isMobile, findOptimalTeam }
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
});</script><style lang="scss">
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
