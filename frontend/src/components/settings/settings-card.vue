<template>
  <v-card class="frosted-glass mx-4" rounded="lg" :title="title">
    <template #prepend>
      <v-icon :icon="icon" color="strength" />
    </template>
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsCard',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  }
})
</script>
