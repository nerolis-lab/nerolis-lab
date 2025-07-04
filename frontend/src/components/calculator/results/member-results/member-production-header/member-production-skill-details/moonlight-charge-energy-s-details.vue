<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-2 pb-1">
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
          :alt="`Moonlight (Charge Energy S) level ${memberWithProduction.member.skillLevel}`"
          title="Moonlight (Charge Energy S)"
        ></v-img>
      </v-badge>
      <div class="ml-1">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ skillValuePerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ critValuePerProc }}</span
          >
          <v-img
            src="/images/unit/energy_crit.png"
            height="20"
            width="20"
            alt="energy crit"
            title="energy crit"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ selfSkillValue }} total</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ teamSkillValue }} team</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { getIsland } from '@/services/utils/island/island-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { ChargeEnergySMoonlight, MathUtils, compactNumber } from 'sleepapi-common'
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
    return { userStore, teamStore, MathUtils, mainskillImage }
  },
  computed: {
    skillValuePerProc() {
      return this.memberWithProduction.member.pokemon.skill.amount(this.memberWithProduction.member.skillLevel)
    },
    critValuePerProc() {
      const critAmounts = ChargeEnergySMoonlight.critAmounts
      return critAmounts[this.memberWithProduction.member.skillLevel - 1]
    },
    selfSkillValue() {
      const skillActivation = ChargeEnergySMoonlight.activations.energy
      return compactNumber(
        StrengthService.skillValue({
          skillActivation,
          amount:
            this.memberWithProduction.production.skillAmount -
            this.memberWithProduction.production.advanced.skillCritValue,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    teamSkillValue() {
      const skillActivation = ChargeEnergySMoonlight.activations.energy
      return compactNumber(
        StrengthService.skillValue({
          skillActivation,
          amount: this.memberWithProduction.production.advanced.skillCritValue,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
