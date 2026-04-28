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
import { MathUtils, ModifiedMainskill } from 'sleepapi-common'
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
      const skill = this.memberWithProduction.member.pokemon.skill
      const skillName = this.normalize(skill.name)

      // Remove `-range` from variable Dream Shard Magnet and Charge Strength skills.
      // Perhaps a future refactor will make `baseSkill` a field for all Mainskills,
      // and then the variable skills won't need this hack.
      const baseSkillName = (
        skill.isModified ? this.normalize((skill as ModifiedMainskill).baseSkill.name) : skillName
      ).replace('-range', '')

      // Dynamically import the component based on the skill name
      return defineAsyncComponent(
        () =>
          import(
            `@/components/calculator/results/member-results/member-production-header/member-production-skill-details/${baseSkillName}/${skillName}-details.vue`
          )
      )
    }
  },
  methods: {
    normalize(name: string) {
      return name.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')
    }
  }
})
</script>
