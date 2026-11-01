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
          :alt="`Mystical Fire (Cooking Advance S) level ${effectiveSkillLevel}`"
          title="Mystical Fire (Cooking Advance S)"
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
            >x{{ potSizePerProc }}</span
          >
          <v-img
            src="/images/unit/pot.png"
            height="20"
            width="20"
            alt="cooking pot size"
            title="cooking pot size"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >+{{ critValuePerProc }}%</span
          >
          <v-img
            src="/images/unit/crit.png"
            height="20"
            width="20"
            alt="meal crit chance"
            title="meal crit chance"
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
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalPotSize }} pot size</span>
      </div>
      <div class="flex-center">
        <v-img
          src="/images/unit/crit.png"
          height="20"
          width="20"
          alt="meal crit chance"
          title="meal crit chance"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalCritValue }}% crit</span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { CookingAdvanceSMysticalFire, MathUtils, compactNumber } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{ memberWithProduction: MemberWithProduction }>()
const teamStore = useTeamStore()
const effectiveSkillLevel = computed(() => props.memberWithProduction.production.skillLevel)
const baseSkillLevel = computed(() => props.memberWithProduction.member.skillLevel)
const timeWindowFactor = computed(() => teamStore.timeWindowFactor)
const potSizePerProc = computed(() =>
  CookingAdvanceSMysticalFire.activations.potSize.amount({ skillLevel: effectiveSkillLevel.value })
)
const critValuePerProc = computed(() =>
  CookingAdvanceSMysticalFire.activations.critChance.amount({ skillLevel: effectiveSkillLevel.value })
)
const totalPotSize = computed(() =>
  compactNumber(
    (props.memberWithProduction.production.skillValue['pot size']?.amountToSelf ?? 0) * timeWindowFactor.value
  )
)
const totalCritValue = computed(() =>
  compactNumber(
    (props.memberWithProduction.production.skillValue['crit chance']?.amountToSelf ?? 0) * timeWindowFactor.value
  )
)
</script>
