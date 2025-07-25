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
          :alt="`Berry Burst level ${memberWithProduction.member.skillLevel}`"
          title="Berry Burst"
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
            >x{{ skillValuePerProc }}</span
          >
          <v-img src="/images/berries/berries.png" height="20" width="20" alt="berries" title="berries"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img
          :src="berryImage(memberWithProduction.member.pokemon.berry)"
          height="20"
          width="20"
          :alt="`${berryName} berry`"
          :title="`${berryName} berry`"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueBluk }} {{ berryName }}</span>
      </div>
      <div class="flex-center">
        <v-img
          src="/images/berries/berries.png"
          height="20"
          width="20"
          alt="miscellaneous berries"
          title="berries"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueTeam }} other </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { getIsland } from '@/services/utils/island/island-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { BerryBurst, MathUtils, compactNumber } from 'sleepapi-common'
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
    berryName() {
      return this.memberWithProduction.member.pokemon.berry.name.toLowerCase()
    },
    skillValuePerProc() {
      return this.memberWithProduction.member.pokemon.skill.amount(this.memberWithProduction.member.skillLevel)
    },
    skillValueBluk() {
      const amount =
        this.memberWithProduction.production.produceFromSkill.berries.find(
          (b) =>
            b.berry.name === this.memberWithProduction.member.pokemon.berry.name &&
            b.level === this.memberWithProduction.member.level
        )?.amount ?? 0
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: BerryBurst.activations.berries,
          amount,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    skillValueTeam() {
      const amount = this.memberWithProduction.production.produceFromSkill.berries.reduce(
        (sum, cur) =>
          sum +
          (cur.berry.name !== this.memberWithProduction.member.pokemon.berry.name ||
          cur.level !== this.memberWithProduction.member.level
            ? cur.amount
            : 0),
        0
      )
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: BerryBurst.activations.berries,
          amount,
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
