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
          :alt="`Ingredient Magnet S level ${memberWithProduction.member.skillLevel}`"
          title="Ingredient Magnet S"
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
          <v-img
            src="/images/ingredient/ingredients.png"
            height="20"
            width="20"
            alt="ingredients"
            title="ingredients"
          ></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img
          src="/images/ingredient/ingredients.png"
          height="20"
          width="20"
          alt="ingredients"
          title="ingredients"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalSkillValue }} total</span>
      </div>
      <span class="font-weight-light font-italic responsive-text text-center">
        {{ amountOfEachIngredient }} of each ing</span
      >
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
import { IngredientMagnetS, MathUtils, compactNumber, ingredient } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientMagnetSDetails',
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
    totalSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: IngredientMagnetS.activations.ingredients,
          amount: this.memberWithProduction.production.skillAmount,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    amountOfEachIngredient() {
      return compactNumber(
        MathUtils.round(
          StrengthService.skillValue({
            skillActivation: IngredientMagnetS.activations.ingredients,
            amount: this.memberWithProduction.production.skillAmount,
            timeWindow: this.teamStore.timeWindow,
            areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
          }) / ingredient.TOTAL_NUMBER_OF_INGREDIENTS,
          2
        )
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
