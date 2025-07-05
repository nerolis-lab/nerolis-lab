<template>
  <v-row class="flex-nowrap" dense>
    <v-col class="flex-left">
      <TeamSelect
        v-model="comparisonStore.teamIndex"
        placeholder-text="Select team"
        card-title="Select team"
        helper-text="Selecting a team doesn't update previous calculations. Only allowing teams with maximum of 4 members."
        :button-class="isMobile ? 'w-100' : ''"
        :show-full-details="true"
        :show-island="true"
        :show-camp="true"
        :show-sleep-score="true"
        :show-members="true"
        :show-delete-button="true"
        :max-team-size="4"
        @clear="comparisonStore.teamIndex = undefined"
      />
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
import TeamSelect from '@/components/custom-components/team-select/TeamSelect.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { MAX_TEAM_SIZE } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CompareSettings',
  components: {
    TeamSelect
  },
  setup() {
    const comparisonStore = useComparisonStore()
    const { isMobile } = useBreakpoint()

    if (comparisonStore.currentTeam && comparisonStore.currentTeam.members.filter(Boolean).length >= MAX_TEAM_SIZE) {
      comparisonStore.teamIndex = undefined
    }

    return { comparisonStore, isMobile }
  },
  data: () => ({
    isClearMenuOpen: false
  }),
  methods: {
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
</style>
