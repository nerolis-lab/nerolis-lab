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
          :alt="`Minus (Cooking Power-Up S) level ${memberWithProduction.member.skillLevel}`"
          title="Minus (Cooking Power-Up S)"
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
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalPotValue }} total</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalEnergyValue }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { CookingPowerUpSMinus, IngredientMagnetSPlus, MathUtils, compactNumber, getIsland } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CookingPowerUpSMinusDetails',
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
    return { teamStore, pokemonStore, MathUtils, mainskillImage, userStore }
  },
  computed: {
    skillValuePerProc() {
      return CookingPowerUpSMinus.activations.solo.amount({
        skillLevel: this.memberWithProduction.member.skillLevel
      })
    },
    totalPotValue() {
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: CookingPowerUpSMinus.activations.solo,
          amount: this.memberWithProduction.production.skillValue['pot size'].amountToSelf,
          timeWindow: this.teamStore.timeWindow,
          areaBonus: this.userStore.islandBonus(getIsland(this.teamStore.getCurrentTeam.favoredBerries).shortName)
        })
      )
    },
    totalEnergyValue() {
      const teamMembers = this.teamStore.getCurrentTeam.members
        .filter(Boolean)
        .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      const isPaired =
        teamMembers.filter((member) => member.skill.is(IngredientMagnetSPlus, CookingPowerUpSMinus)).length > 1
      const energyAmountToSelf = this.memberWithProduction.production.skillValue.energy?.amountToSelf ?? 0
      const energyAmountToTeam = this.memberWithProduction.production.skillValue.energy?.amountToTeam ?? 0
      const energyAmount = isPaired ? energyAmountToSelf + energyAmountToTeam : 0
      return compactNumber(
        StrengthService.skillValue({
          skillActivation: CookingPowerUpSMinus.activations.paired,
          amount: energyAmount,
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
