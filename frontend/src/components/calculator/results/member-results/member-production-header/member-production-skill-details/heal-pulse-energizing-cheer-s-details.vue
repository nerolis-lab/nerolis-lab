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
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1 helps-per-proc"
            >x{{ helpsPerProc }}</span
          >
          <v-img src="/images/unit/help.png" height="20" width="20" alt="Pokemon helps" title="Pokemon helps"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1 energy-total"> {{ totalEnergyValue }} total</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/unit/help.png" height="20" width="20" alt="Pokemon helps" title="Pokemon helps"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2 helps-total">
          {{ totalHelpsValue }} total helps</span
        >
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
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
    const userStore = useUserStore()
    return { teamStore, MathUtils, mainskillImage, userStore }
  },
  computed: {
    energyPerProc() {
      return EnergizingCheerSHealPulse.activations.energy.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    helpsPerProc() {
      return EnergizingCheerSHealPulse.activations.extraHelps.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    energyFromSkillValue() {
      const e = this.memberWithProduction.production.skillValue['energy']
      return defaultZero(e?.amountToSelf) + defaultZero(e?.amountToTeam)
    },
    helpsFromSkillValue() {
      const h = this.memberWithProduction.production.skillValue['helps']
      return defaultZero(h?.amountToSelf) + defaultZero(h?.amountToTeam)
    },
    totalEnergyValue() {
      const amount =
        this.energyFromSkillValue > 0 ? this.energyFromSkillValue : this.memberWithProduction.production.skillAmount
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: EnergizingCheerSHealPulse.activations.energy,
          amount,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
        })
      )
    },
    totalHelpsValue() {
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: EnergizingCheerSHealPulse.activations.extraHelps,
          amount: this.helpsFromSkillValue,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
        })
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
