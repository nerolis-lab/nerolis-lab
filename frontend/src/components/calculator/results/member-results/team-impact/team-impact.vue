<template>
  <v-row class="flex-center px-2">
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Team Impact </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <template v-if="!anyTeamSupport">
    <div class="flex-center pa-2">
      <span class="text-center font-weight-light text-body-2 text-no-wrap">
        Your team is not affecting this Pokémon
      </span>
    </div>
  </template>

  <template v-else-if="isMobile">
    <v-row v-if="anyTeamMainSkill" class="flex-center px-2" dense>
      <v-col cols="auto" class="flex-center text-no-wrap text-accent"> Teammate Main Skills </v-col>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>

    <v-row v-if="anyTeamMainSkill" class="flex-left px-2 flex-nowrap" dense>
      <v-col class="flex-left flex-column" style="align-items: flex-start">
        <div v-if="teamHelps > 0" class="flex-left">
          <v-img class="mr-1" src="/images/mainskill/helps.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap">
            <span class="text-help text-no-wrap">{{ teamHelps }}</span> extra helps
          </span>
        </div>
        <div v-if="teamEnergy > 0" class="flex-left">
          <v-img class="mr-1" src="/images/mainskill/energy.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap">
            <span class="text-energy text-no-wrap">{{ teamEnergy }}</span> energy recovered
          </span>
        </div>
      </v-col>

      <v-col v-if="anyTeamMainSkill" class="flex-center pl-2" style="overflow: hidden">
        <v-avatar
          v-for="(helpSupportMember, index) in teamHelpMembers"
          :key="index"
          color="help"
          :style="{ marginLeft: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(helpSupportMember)"></v-img>
        </v-avatar>
        <v-avatar
          v-for="(energySupportMember, index) in teamEnergyMembers"
          :key="index"
          color="energy"
          :style="{ marginLeft: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(energySupportMember)"></v-img>
        </v-avatar>
      </v-col>
    </v-row>

    <v-row v-if="anyTeamSubSkill" class="flex-center px-2" dense>
      <v-col>
        <v-divider />
      </v-col>
      <v-col cols="auto" class="flex-center text-no-wrap text-accent"> Teammate Subskills </v-col>
    </v-row>

    <v-row v-if="anyTeamSubSkill" class="flex-left px-2 flex-nowrap" dense>
      <v-col class="flex-center" style="overflow: hidden">
        <v-avatar
          v-for="(helpingBonusMember, index) in helpingBonusMembers"
          :key="index"
          color="hb"
          :style="{ marginRight: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(helpingBonusMember)"></v-img>
        </v-avatar>
        <v-avatar
          v-for="(energyRecoveryBonusMember, index) in energyRecoveryBonusMembers"
          :key="index"
          color="erb"
          :style="{ marginRight: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(energyRecoveryBonusMember)"></v-img>
        </v-avatar>
      </v-col>

      <v-col class="flex-right flex-column" style="align-items: flex-end">
        <div v-if="helpingBonusMembers.length > 0" class="flex-right">
          <span class="text-no-wrap mr-1">
            Helping Bonus: <span class="text-hb text-no-wrap">{{ helpingBonusMembers.length }}</span>
          </span>
          <v-img src="/images/subskill/hb.png" height="28" width="28px"></v-img>
        </div>
        <div v-if="energyRecoveryBonusMembers.length > 0" class="flex-right">
          <span class="text-no-wrap mr-1">
            Energy Recovery Bonus: <span class="text-erb text-no-wrap">{{ energyRecoveryBonusMembers.length }}</span>
          </span>
          <v-img src="/images/subskill/erb.png" height="28" width="28px"></v-img>
        </div>

        <div v-if="!anyTeamSupport" class="flex-center">
          <span class="text-center font-weight-light text-body-2 text-no-wrap">Nothing to see here</span>
        </div>
      </v-col>
    </v-row>
  </template>

  <!-- Desktop layout -->
  <template v-else>
    <v-row class="flex-center px-2" dense>
      <template v-if="anyTeamMainSkill">
        <v-col cols="auto" class="flex-center text-no-wrap text-accent"> Teammate Main Skills </v-col>
        <v-col>
          <v-divider />
        </v-col>
        <v-spacer />
      </template>
      <template v-if="anyTeamSubSkill">
        <v-col cols="auto" class="flex-center text-no-wrap text-accent"> Teammate Subskills </v-col>
        <v-col>
          <v-divider />
        </v-col>
        <v-spacer />
      </template>
    </v-row>

    <v-row class="flex-left px-2 flex-nowrap" dense>
      <v-col v-if="anyTeamMainSkill" class="flex-left flex-column" style="align-items: flex-start">
        <div v-if="teamHelps > 0" class="flex-left">
          <v-img class="mr-1" src="/images/mainskill/helps.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap">
            <span class="text-help text-no-wrap">{{ teamHelps }}</span> extra helps
          </span>
        </div>
        <div v-if="teamEnergy > 0" class="flex-left">
          <v-img class="mr-1" src="/images/mainskill/energy.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap">
            <span class="text-energy text-no-wrap">{{ teamEnergy }}</span> energy recovered
          </span>
        </div>
      </v-col>

      <v-col v-if="anyTeamMainSkill" class="flex-left pl-2" style="overflow: hidden">
        <v-avatar
          v-for="(helpSupportMember, index) in teamHelpMembers"
          :key="index"
          color="help"
          :style="{ marginLeft: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(helpSupportMember)"></v-img>
        </v-avatar>
        <v-avatar
          v-for="(energySupportMember, index) in teamEnergyMembers"
          :key="index"
          color="energy"
          :style="{ marginLeft: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(energySupportMember)"></v-img>
        </v-avatar>
      </v-col>

      <v-col v-if="anyTeamSubSkill" class="flex-left flex-column" style="align-items: flex-start">
        <div v-if="helpingBonusMembers.length > 0" class="flex-right">
          <v-img src="/images/subskill/hb.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap">
            <span class="text-hb text-no-wrap">{{ helpingBonusMembers.length }}</span> helping bonus
          </span>
        </div>
        <div v-if="energyRecoveryBonusMembers.length > 0" class="flex-right">
          <v-img src="/images/subskill/erb.png" height="28" width="28px"></v-img>
          <span class="text-no-wrap mr-1">
            <span class="text-erb text-no-wrap">{{ energyRecoveryBonusMembers.length }}</span> energy recovery bonus
          </span>
        </div>

        <div v-if="!anyTeamSupport" class="flex-center">
          <span class="text-center font-weight-light text-body-2 text-no-wrap">Nothing to see here</span>
        </div>
      </v-col>

      <v-col v-if="anyTeamSubSkill" class="flex-left" style="overflow: hidden">
        <v-avatar
          v-for="(hbMember, index) in helpingBonusMembers"
          :key="index"
          color="hb"
          :style="{ marginRight: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(hbMember)"></v-img>
        </v-avatar>
        <v-avatar
          v-for="(erbMember, index) in energyRecoveryBonusMembers"
          :key="index"
          color="erb"
          :style="{ marginRight: viewportWidth < 420 ? '-15%' : '' }"
        >
          <v-img :src="pokemonImage(erbMember)"></v-img>
        </v-avatar>
      </v-col>
    </v-row>
  </template>
</template>

<script lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { pokemonImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import {
  filterMembersWithSubskill,
  isDefined,
  MathUtils,
  subskill,
  type MemberProductionAdvanced
} from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'TeamImpact',
  props: {
    productionAdvancedStats: {
      type: Object as PropType<MemberProductionAdvanced>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const { viewportWidth, isMobile } = useBreakpoint()

    return { teamStore, pokemonStore, pokemonImage, viewportWidth, isMobile }
  },
  computed: {
    teamMembersWithProduction() {
      const teamMembers = []
      const currentMember = this.pokemonStore.getPokemon(this.teamStore.getCurrentMember ?? 'missing')
      for (const member of this.teamStore.getCurrentTeam.production?.members ?? []) {
        if (member.externalId !== currentMember?.externalId) {
          const pokemonInstance = this.pokemonStore.getPokemon(member.externalId)
          teamMembers.push({ ...member, member: pokemonInstance })
        }
      }
      return teamMembers
    },
    teamEnergy() {
      return MathUtils.round(this.productionAdvancedStats?.teamSupport?.energy ?? 0, 1)
    },
    teamHelps() {
      return MathUtils.round(this.productionAdvancedStats?.teamSupport?.helps ?? 0, 1)
    },
    teamHelpMembers() {
      return this.teamMembersWithProduction
        .filter((member) => member?.skillValue?.['helps']?.amountToTeam > 0)
        .map((member) => ({ pokemonName: member.pokemonWithIngredients.pokemon, shiny: member.member?.shiny === true }))
    },
    teamEnergyMembers() {
      return this.teamMembersWithProduction
        .filter((member) => member?.skillValue?.['energy']?.amountToTeam > 0)
        .map((member) => ({ pokemonName: member.pokemonWithIngredients.pokemon, shiny: member.member?.shiny === true }))
    },
    helpingBonusMembers() {
      const definedMembers = this.teamMembersWithProduction.map((m) => m.member).filter(isDefined)

      return filterMembersWithSubskill(definedMembers, subskill.HELPING_BONUS).map((member) => ({
        pokemonName: member.pokemon.name,
        shiny: member.shiny === true
      }))
    },
    energyRecoveryBonusMembers() {
      const definedMembers = this.teamMembersWithProduction.map((m) => m.member).filter(isDefined)

      return filterMembersWithSubskill(definedMembers, subskill.ENERGY_RECOVERY_BONUS).map((member) => ({
        pokemonName: member.pokemon.name,
        shiny: member.shiny === true
      }))
    },
    anyTeamSupport() {
      return (
        this.productionAdvancedStats?.teamSupport?.energy > 0 ||
        this.productionAdvancedStats?.teamSupport?.helps > 0 ||
        this.helpingBonusMembers.length > 0 ||
        this.energyRecoveryBonusMembers.length > 0
      )
    },
    anyTeamMainSkill() {
      return this.teamHelps > 0 || this.teamEnergy > 0
    },
    anyTeamSubSkill() {
      return this.helpingBonusMembers.length > 0 || this.energyRecoveryBonusMembers.length > 0
    }
  }
})
</script>
