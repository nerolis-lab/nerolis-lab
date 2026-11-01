<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
      <v-badge
        id="skillLevelBadge"
        :content="skillLevelBadgeText(effectiveSkillLevel, baseSkillLevel)"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
          :alt="`Cooking Advance S level ${effectiveSkillLevel}`"
          title="Cooking Advance S"
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
            >x{{ potAmountPerProc }}</span
          >
          <v-img
            src="/images/unit/pot.png"
            height="20"
            width="20"
            alt="cooking pot size"
            title="cooking pot size"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img
          src="/images/unit/pot.png"
          height="20"
          width="20"
          alt="cooking pot size"
          title="cooking pot size"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalPotAmount }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { CookingAdvanceS, MathUtils, compactNumber } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{ memberWithProduction: MemberWithProduction }>()
const teamStore = useTeamStore()
const effectiveSkillLevel = computed(() => props.memberWithProduction.production.skillLevel)
const baseSkillLevel = computed(() => props.memberWithProduction.member.skillLevel)
const timeWindowFactor = computed(() => teamStore.timeWindowFactor)
const potAmountPerProc = computed(() =>
  CookingAdvanceS.activations.potSize.amount({ skillLevel: effectiveSkillLevel.value })
)
const totalPotAmount = computed(() =>
  compactNumber(
    (props.memberWithProduction.production.skillValue['pot size']?.amountToSelf ?? 0) * timeWindowFactor.value
  )
)
</script>
