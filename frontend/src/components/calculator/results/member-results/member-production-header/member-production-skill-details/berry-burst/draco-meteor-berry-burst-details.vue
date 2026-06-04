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
          :alt="`Draco Meteor (Berry Burst) level ${memberWithProduction.member.skillLevel}`"
          title="Draco Meteor (Berry Burst)"
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
            >x{{ selfBerriesPerProc }}</span
          >
          <v-img
            :src="berryImage(memberWithProduction.member.pokemon.berry)"
            height="20"
            width="20"
            alt="berries"
            title="berries"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ teamBerriesPerProc }}</span
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
          :alt="`${berryName} berries`"
          :title="`${berryName} berries`"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalSelfBerries }} {{ berryName }}</span>
      </div>
      <div class="flex-center">
        <v-img
          src="/images/berries/berries.png"
          height="20"
          width="20"
          alt="miscellaneous berries"
          title="berries"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ totalTeamBerries }} other </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { BerryBurstDracoMeteor, MathUtils } from 'sleepapi-common'
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
    const pokemonStore = usePokemonStore()
    return { teamStore, pokemonStore, MathUtils, mainskillImage, berryImage }
  },
  computed: {
    isPaired() {
      const latiasIfOnTeam = this.teamStore.getCurrentTeam.members
        .filter(Boolean)
        .map((member) => this.pokemonStore.getPokemon(member!)?.pokemon)
        .find((member) => member?.name === 'LATIAS')
      return latiasIfOnTeam !== undefined
    },
    skillActivation() {
      return this.isPaired ? BerryBurstDracoMeteor.activations.paired : BerryBurstDracoMeteor.activations.solo
    },
    skillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    berryName() {
      return this.memberWithProduction.member.pokemon.berry.name.toLowerCase()
    },
    selfBerriesPerProc() {
      return this.skillActivation.amount({ skillLevel: this.skillLevel })
    },
    teamBerriesPerProc() {
      return this.skillActivation.teamAmount!({ skillLevel: this.skillLevel })
    },
    totalSelfBerries() {
      const { amountToSelf } = this.memberWithProduction.production.skillValue.berries
      return amountToSelf
    },
    totalTeamBerries() {
      const { amountToTeam } = this.memberWithProduction.production.skillValue.berries
      return amountToTeam
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
