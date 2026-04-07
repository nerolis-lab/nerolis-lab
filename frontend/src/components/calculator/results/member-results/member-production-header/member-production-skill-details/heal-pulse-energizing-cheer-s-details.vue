<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${memberWithProduction.member.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
          :alt="`Heal Pulse (Energizing Cheer S) level ${memberWithProduction.member.skillLevel}`"
          title="Heal Pulse (Energizing Cheer S)"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center num-skill-procs">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img
            src="/images/misc/skillproc.png"
            height="24"
            width="24"
            alt="skill activations"
            title="skill activations"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 energy-per-proc"
            >x{{ energyPerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 ml-1"
            >x{{ numMonsHelped }}</span
          >
          <v-img src="/images/misc/human.png" height="20" width="20" alt="teammates" title="teammates"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 helps-per-proc"
            >x{{ helpsPerProc }}</span
          >
          <v-img src="/images/unit/help.png" height="20" width="20" alt="Pokemon helps" title="Pokemon helps"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 ml-1"
            >x{{ numMonsHelped }}</span
          >
          <v-img src="/images/misc/human.png" height="20" width="20" alt="teammates" title="teammates"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1 energy-total"> {{ totalEnergyValue }} total</span>
      </div>
      <div class="flex-center mt-1">
        <v-img src="/images/unit/help.png" height="20" width="20" alt="Pokemon helps" title="Pokemon helps"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2 helps-total"> {{ totalHelpsValue }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { EnergizingCheerSHealPulse, MathUtils, compactNumber, defaultZero } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, MathUtils, mainskillImage }
  },
  computed: {
    numMonsHelped() {
      return Math.min(this.teamStore.getTeamSize, 2)
    },
    energyPerProc() {
      return EnergizingCheerSHealPulse.activations.energy.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    helpsPerProc() {
      return EnergizingCheerSHealPulse.activations.helps.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    totalEnergyValue() {
      const { amountToSelf, amountToTeam } = this.memberWithProduction.production.skillValue.energy
      const combinedAmount = defaultZero(amountToSelf) + defaultZero(amountToTeam)
      return compactNumber(combinedAmount * this.numMonsHelped)
    },
    totalHelpsValue() {
      const { amountToSelf, amountToTeam } = this.memberWithProduction.production.skillValue.helps
      const combinedAmount = defaultZero(amountToSelf) + defaultZero(amountToTeam)
      return compactNumber(combinedAmount * this.numMonsHelped)
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
