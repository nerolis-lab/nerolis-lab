<template>
  <div v-if="nature.positiveModifier !== 'neutral'">
    <div class="nowrap text-x-small">
      <span class="nowrap mr-1">{{ getModifiedStat('positive') }}</span>
      <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
      <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
    </div>
    <div class="nowrap text-x-small">
      <span class="nowrap mr-1">{{ getModifiedStat('negative') }}</span>
      <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
      <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
    </div>
  </div>
  <div v-else>
    <div class="nowrap text-x-small">
      <span class="nowrap mr-1">This nature has no effect</span>
    </div>
  </div>
</template>

<script lang="ts">
import type { nature } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'NatureModifiers',
  props: {
    nature: {
      type: Object as PropType<nature.Nature>,
      required: true
    },
    short: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getModifiedStat(modifier: 'positive' | 'negative') {
      const modifiers: { [key: string]: { value: number; message: string } } = {
        frequency: {
          value: this.nature.frequency,
          message: this.short ? 'Speed' : 'Speed of help'
        },
        ingredient: {
          value: this.nature.ingredient,
          message: this.short ? 'Ing' : 'Ingredient finding'
        },
        skill: { value: this.nature.skill, message: this.short ? 'Skill' : 'Main skill chance' },
        energy: { value: this.nature.energy, message: this.short ? 'Energy' : 'Energy recovery' },
        exp: { value: this.nature.exp, message: 'EXP' }
      }

      for (const key in modifiers) {
        if (modifiers[key].value > 1 && modifier === 'positive') {
          return modifiers[key].message
        } else if (modifiers[key].value < 1 && modifier === 'negative') {
          return modifiers[key].message
        }
      }

      return 'This nature has no effect'
    }
  }
}
</script>

<style scoped lang="scss">
.responsive-icon {
  font-size: 0.875rem !important;
}
</style>
