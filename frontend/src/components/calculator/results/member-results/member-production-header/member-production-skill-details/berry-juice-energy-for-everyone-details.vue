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
          :alt="`Berry Juice (Energy for Everyone) level ${memberWithProduction.member.skillLevel}`"
          title="Berry Juice (Energy for Everyone)"
        ></v-img>
      </v-badge>
      <div class="ml-2">
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ energyValuePerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ juicePerProc }}</span
          >
          <v-img
            src="/images/misc/berry-juice.png"
            height="20"
            width="20"
            alt="berry juice"
            title="berry juice"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalEnergyValue }} total</span>
      </div>
      <div class="flex-center mt-1">
        <v-img src="/images/misc/berry-juice.png" height="20" width="20" alt="berry juice" title="berry juice"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalJuice }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { EnergyForEveryoneBerryJuice, MathUtils, compactNumber, defaultZero, getIsland } from 'sleepapi-common'
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
    return { teamStore, MathUtils, mainskillImage, berryImage, userStore }
  },
  computed: {
    energyValuePerProc() {
      return EnergyForEveryoneBerryJuice.activations.energy.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    juicePerProc() {
      const juiceAmount =
        EnergyForEveryoneBerryJuice.activations.juice.amount() * EnergyForEveryoneBerryJuice.juicePercent
      return compactNumber(MathUtils.round(juiceAmount, 2))
    },
    totalEnergyValue() {
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: EnergyForEveryoneBerryJuice.activations.energy,
          amount: defaultZero(this.memberWithProduction.production.skillValue['energy'].amountToTeam),
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(this.teamStore.getCurrentTeam.island.shortName)
        })
      )
    },
    totalJuice() {
      const juiceAmount = MathUtils.round(this.memberWithProduction.production.skillValue.items?.amountToSelf ?? 0, 2)
      return compactNumber(juiceAmount)
    },

    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
