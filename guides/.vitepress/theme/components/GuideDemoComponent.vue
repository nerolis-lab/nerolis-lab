<template>
  <div class="guide-demo-component" role="note">
    <h4 class="demo-label">Demo Component</h4>
    <p>
      Use the fields to set how long you slept (hours and minutes); the sleep score updates automatically. The score
      uses the same formula as the main app by importing shared code from <code>sleepapi-common</code>. In the script,
      <code>ref</code> holds the inputs, <code>computed</code> properties derive the score and text color, and
      <code>resetDuration</code> runs when you press Reset.
    </p>

    <div class="demo-fields">
      <v-text-field
        v-model.number="sleepHours"
        class="demo-field"
        label="Hours"
        type="number"
        min="0"
        max="24"
        step="1"
        suffix="h"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-text-field
        v-model.number="sleepMinutes"
        class="demo-field"
        label="Minutes"
        type="number"
        min="0"
        max="59"
        step="1"
        suffix="min"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-btn color="primary" @click="resetDuration">Reset</v-btn>
    </div>

    <div class="demo-results">
      <span class="demo-result-label">Sleep score is </span>
      <output class="demo-result-value" :class="sleepScoreToneClass" aria-live="polite">{{ sleepScore }}</output>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sleepScoreFromDurationMinutes } from 'sleepapi-common';
import { computed, ref } from 'vue';

const DEFAULT_HOURS = 8;
const DEFAULT_MINUTES = 0;

// ref makes sure vue updates the template when the value changes
const sleepHours = ref(DEFAULT_HOURS);
const sleepMinutes = ref(DEFAULT_MINUTES);

// computed property to calculate the total minutes of sleep
const totalMinutes = computed(() => {
  const h = Math.max(0, Math.min(24, Math.floor(sleepHours.value)));
  const m = Math.max(0, Math.min(59, Math.floor(sleepMinutes.value)));
  return h * 60 + m;
});

// computed  property to calculate the sleep score, updates automatically when totalMinutes changes
const sleepScore = computed(() => sleepScoreFromDurationMinutes(totalMinutes.value));

// computed CSS class name updates automatically when sleepScore changes to assign a color
const sleepScoreToneClass = computed(() => {
  const s = sleepScore.value;
  if (s < 50) {
    // these classesa are defined by vuetify based on the theme colors
    // reference: https://vuetifyjs.com/en/features/theme/#custom-theme-colors
    return 'text-error'; 
  }
  if (s < 80) {
    return 'text-secondary';
  }
  return 'text-success';
});

// this function gets called when the reset button is clicked
function resetDuration(): void {
  sleepHours.value = DEFAULT_HOURS;
  sleepMinutes.value = DEFAULT_MINUTES;
}
</script>

<style scoped>
.guide-demo-component {
  padding: 16px;
  border-radius: 8px;
  background: var(--color-neutral-700);

  .demo-label {
    margin: 0 0 8px 0;
  }

  .demo-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
    margin: 16px 0;

    .demo-field {
      flex: 1 1 100px;
    }
  }

  .demo-result-value {
    font-weight: 700;
  }
}
</style>
