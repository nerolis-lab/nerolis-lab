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
          :alt="`Ingredient Draw S (Super Luck) level ${memberWithProduction.member.skillLevel}`"
          title="Ingredient Draw S (Super Luck)"
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

    <v-col cols="auto" class="flex-center flex-column mt-1">
      <!-- Main ingredient output -->
      <div class="flex-center ga-2">
        <div v-for="(ing, index) in preparedIngredients" :key="index" class="flex-column flex-center">
          <v-img
            :src="ing.image"
            :alt="ing.ingredient.name"
            :title="ing.ingredient.name"
            height="24"
            width="24"
          ></v-img>
          <span class="font-weight-light font-italic responsive-text text-center">{{ ing.amount }}</span>
        </div>
      </div>

      <!-- Dream shard output with crit info -->
      <div class="flex-center mb-1">
        <v-img src="/images/unit/shard.png" height="20" width="20" alt="dream shards" title="dream shards"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2" data-testid="dream-shard-total">
          {{ totalDreamShardValue }} total</span
        >
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { ingredientImage, mainskillImage } from '@/services/utils/image-utils'
import { getIsland } from '@/services/utils/island/island-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { IngredientDrawSSuperLuck, MathUtils, compactNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientDrawSSuperLuckDetails',
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
    preparedIngredients() {
      return this.memberWithProduction.production.produceFromSkill.ingredients.map((ing) => ({
        amount: MathUtils.round(ing.amount * this.timeWindowFactor, 1),
        ingredient: ing.ingredient,
        image: ingredientImage(ing.ingredient.name)
      }))
    },
    totalDreamShardValue() {
      const amount = StrengthService.skillValue({
        skillActivation: IngredientDrawSSuperLuck.activations.dreamShards,
        amount: this.memberWithProduction.production.skillValue['dream shards'].amountToSelf,
        timeWindow: this.teamStore.timeWindow,
        areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
      })
      return compactNumber(amount)
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
