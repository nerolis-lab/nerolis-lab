<template>
  <v-row class="flex-center px-2">
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Stats </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <v-row class="flex-column px-2" dense>
    <!-- RP  -->
    <v-col class="text-no-wrap">
      <span> <span class="text-primary font-weight-medium">RP</span> {{ rp }}</span>
    </v-col>

    <!-- Max frequency -->
    <v-col class="text-no-wrap">
      <span>
        Max frequency: <span class="font-weight-medium">{{ frequency }}</span>
      </span>
    </v-col>

    <!-- Carry limit -->
    <v-col class="text-no-wrap">
      <span>
        Carry limit: <span class="font-weight-medium">{{ carrySize }}</span>
      </span>
    </v-col>

    <!-- Spilled ingredients -->
    <v-col v-if="spilledIngredients.length > 0" class="d-flex">
      <span class="mr-2 text-no-wrap"> Spilled ingredients: </span>
      <v-row class="flex-left flex-nowrap" dense>
        <v-col v-for="(ingredientSet, index) in spilledIngredients" :key="index" cols="auto">
          <div class="flex-center">
            <div class="text-center">
              {{ MathUtils.round(ingredientSet.amount, 1) }}
            </div>
            <v-img :src="ingredientImage(ingredientSet.ingredient.name.toLowerCase())" height="24" width="24"></v-img>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <SkillDistribution :pokemonProduction="pokemonProduction" />
</template>

<script lang="ts">
import SkillDistribution from '@/components/calculator/results/member-results/member-stats/skill-distribution.vue'
import { ingredientImage } from '@/services/utils/image-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { computed, defineComponent, ref, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberStats',
  components: {
    SkillDistribution
  },
  props: {
    pokemonProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup(props: { pokemonProduction: MemberProductionExt }) {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const showSkillDistribution = ref(false)

    const rp = computed(() => props.pokemonProduction.member.rp)
    const carrySize = computed(() => props.pokemonProduction.production.advanced.carrySize)
    const spilledIngredients = computed(() => props.pokemonProduction.production.advanced.spilledIngredients)
    const frequency = computed(() =>
      TimeUtils.prettifySeconds(props.pokemonProduction.production.advanced.maxFrequency)
    )

    return {
      teamStore,
      pokemonStore,
      rp,
      carrySize,
      spilledIngredients,
      ingredientImage,
      frequency,
      MathUtils,
      showSkillDistribution
    }
  }
})
</script>
