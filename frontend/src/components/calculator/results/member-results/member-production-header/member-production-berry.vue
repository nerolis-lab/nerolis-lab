<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row no-gutters class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-berry font-weight-medium"> Berry </v-col>
    </v-row>

    <v-row no-gutters :class="['flex-center', 'fill-height', isMobile ? 'flex-column' : '']">
      <v-col cols="auto" class="mx-2">
        <v-img :src="berryImage(memberWithProduction.member.pokemon.berry)" height="36" width="36"></v-img>
      </v-col>
      <v-col cols="auto" class="flex-center flex-column">
        <span class="font-weight-medium">{{ berryCountLabel }}</span>
        <span v-if="averageZoneBonus > 0" class="font-weight-medium">
          +{{ averageZoneBonus.toFixed(0) }}% (Berry Zone)
        </span>
        <div class="flex-center">
          <v-img src="/images/misc/strength.png" height="16px" width="16px"></v-img>
          <span class="text-center font-weight-medium">{{ currentBerryStrength }}</span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { berryImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { MathUtils, compactNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionBerry',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const { isMobile } = useBreakpoint()
    return { teamStore, MathUtils, berryImage, isMobile }
  },
  computed: {
    berryCountLabel() {
      const amount = this.memberWithProduction.production.produceWithoutSkill.berries.at(0)?.amount ?? 0
      return `x${MathUtils.round(amount * this.timeWindowFactor, 1)}`
    },
    currentBerryStrength() {
      return compactNumber(this.memberWithProduction.production.strength.berries.total * this.timeWindowFactor, 'floor')
    },
    averageZoneBonus() {
      return this.memberWithProduction.production.produceWithoutSkill.berries.at(0)?.berryZoneBonus ?? 0
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
