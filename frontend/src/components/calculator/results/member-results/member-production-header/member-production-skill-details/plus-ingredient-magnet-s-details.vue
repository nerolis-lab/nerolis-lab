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
          :alt="`Plus (Ingredient Magnet S) level ${memberWithProduction.member.skillLevel}`"
          title="Plus (Ingredient Magnet S)"
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
            >x{{ combinedIngCountPerProc }}</span
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
      <!-- Magnet ingredient output -->
      <div class="flex-center">
        <v-img
          src="/images/ingredient/ingredients.png"
          height="20"
          width="20"
          alt="ingredients"
          title="ingredients"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ magnetIngCountTotal }} random</span>
      </div>
      <span class="font-weight-light font-italic text-x-small text-center">
        {{ amountOfEachIngredient }} of each ing</span
      >
      <!-- A-slot ingredient output -->
      <div class="flex-center">
        <v-img
          :src="aIng.image"
          :alt="aIng.ingredient.name"
          :title="aIng.ingredient.name"
          height="20"
          width="20"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2">{{ aIngCountTotal }} bonus</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { ingredientImage, mainskillImage } from '@/services/utils/image-utils'
import { getIsland } from '@/services/utils/island/island-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { CookingPowerUpSMinus, IngredientMagnetSPlus, MathUtils, compactNumber, ingredient } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'IngredientMagnetSPlusDetails',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()
    return { teamStore, pokemonStore, userStore, MathUtils, mainskillImage }
  },
  computed: {
    aIng() {
      const ing = this.memberWithProduction.member.ingredients[0].ingredient
      return {
        ingredient: ing,
        image: ingredientImage(ing.name)
      }
    },
    combinedIngCountPerProc() {
      const magnetIngs = IngredientMagnetSPlus.activations.solo.amount(this.memberWithProduction.member.skillLevel)
      const aSlotIngs = IngredientMagnetSPlus.activations.paired.amount(this.memberWithProduction.member.skillLevel)
      const teamMembers = this.teamStore.getCurrentTeam.members
        .filter(Boolean)
        .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      const isPaired =
        teamMembers.filter((member) => member.skill.is(IngredientMagnetSPlus, CookingPowerUpSMinus)).length > 1
      return isPaired ? aSlotIngs + magnetIngs : magnetIngs
    },
    averageMagnetAmount() {
      const amountsIgnoringA = this.memberWithProduction.production.produceFromSkill.ingredients
        .filter((ing) => ing.ingredient.name !== this.memberWithProduction.member.ingredients[0].ingredient.name)
        .map((ingSet) => ingSet.amount)
      const totalIgnoringA = amountsIgnoringA.reduce((sum, amount) => sum + amount, 0)
      const averageAmount = totalIgnoringA / amountsIgnoringA.length
      return averageAmount
    },
    magnetIngCountTotal() {
      const amount = this.averageMagnetAmount * ingredient.TOTAL_NUMBER_OF_INGREDIENTS
      const skillActivation = this.memberWithProduction.member.pokemon.skill.activations.solo
      return compactNumber(
        StrengthService.skillValue({
          skillActivation,
          amount,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    aIngCountTotal() {
      const amountIncludingMagnet =
        this.memberWithProduction.production.produceFromSkill.ingredients.find(
          (ing) => ing.ingredient.name === this.memberWithProduction.member.ingredients[0].ingredient.name
        )?.amount ?? 0
      const amount = Math.max(amountIncludingMagnet - this.averageMagnetAmount, 0)
      const skillActivation = this.memberWithProduction.member.pokemon.skill.getFirstActivation()
      if (!skillActivation) {
        return 0
      }
      return compactNumber(
        StrengthService.skillValue({
          skillActivation,
          amount,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    amountOfEachIngredient() {
      return compactNumber(
        MathUtils.round(
          StrengthService.skillValue({
            skillActivation: IngredientMagnetSPlus.activations.solo,
            amount: this.averageMagnetAmount,
            timeWindow: this.teamStore.timeWindow,
            areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
          }),
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
