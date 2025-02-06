<template>
  <v-card id="teamNameCard" class="flex-grow-1 text-center" rounded="xl">
    <v-row>
      <v-col class="team-name">
        <v-text-field
          v-model="teamStore.getCurrentTeam.name"
          :rules="[
            (v: any) =>
              (v || '').length <= maxTeamNameLength || `Description must be ${maxTeamNameLength} characters or less`
          ]"
          append-inner-icon="mdi-pencil"
          label="Team name"
          density="compact"
          variant="solo"
          hide-details
          single-line
          @focus="highlightText"
          @blur="updateTeamName"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamName',
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const notificationStore = useNotificationStore()
    const { highlightText } = useHighlightText()
    return { userStore, teamStore, notificationStore, highlightText }
  },
  data: () => ({
    isEditDialogOpen: false,
    maxTeamNameLength: 24
  }),
  computed: {
    remainingChars() {
      return this.maxTeamNameLength - (this.currentTeamName.length || 0)
    },
    currentTeamName() {
      return this.teamStore.getCurrentTeam.name
    }
  },
  methods: {
    updateTeamName() {
      if (this.remainingChars >= 0) {
        if (this.remainingChars === this.maxTeamNameLength) {
          this.teamStore.getCurrentTeam.name = `Helper team ${this.teamStore.currentIndex + 1}`
        }
        this.teamStore.updateTeam()
        this.isEditDialogOpen = false
      } else if (this.remainingChars < 0) {
        this.teamStore.getCurrentTeam.name = this.currentTeamName.slice(0, this.maxTeamNameLength)
      }
    }
  }
})
</script>

<style lang="scss">
.team-name {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}

.text-center input {
  text-align: center;
}
</style>
