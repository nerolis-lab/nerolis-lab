<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row no-gutters class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-skill font-weight-medium"> Skill </v-col>
    </v-row>

    <v-row no-gutters class="flex-center fill-height">
      <component :is="skillComponent" :member-with-production="memberWithProduction"></component>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineAsyncComponent, defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionSkill',
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, MathUtils, mainskillImage }
  },
  computed: {
    skillComponent() {
      const skillName = this.memberWithProduction.member.pokemon.skill.name
        .toLowerCase()
        .replace(/[()]/g, '')
        .replace(/\s+/g, '-')

      // Dynamically import the component based on the skill name
      return defineAsyncComponent(
        () =>
          import(
            `@/components/calculator/results/member-results/member-production-skill-details/${skillName.toLowerCase()}-details.vue`
          )
      )
    }
  }
})
</script>
