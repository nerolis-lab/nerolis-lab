<template>
  <v-container class="quick-calculator-container">
    <BubbleBackground class="rounded-lg">
      <!-- Header -->
      <div class="sleep-header-content">
        <div class="flex-center flex-wrap">
          <h1 class="text-h4 text-no-wrap mb-0">Quick Calc</h1>
        </div>
        <v-divider length="200px" class="mx-auto my-2" />
        <p class="text-subtitle-1">Lightning-fast Pokemon evaluation</p>
      </div>

      <!-- Main Content -->
      <div class="sleep-controls">
        <v-row no-gutters class="flex-wrap">
          <!-- Pokemon Input -->
          <v-col cols="12" md="8" class="pa-2">
            <v-card class="h-100">
              <v-card-title>Pokemon Setup</v-card-title>
              <v-card-text>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-pokeball</v-icon>
                  <p class="text-h6 mt-4">Quick Pokemon input coming soon...</p>
                  <p class="text-body-2 text-grey">Lightning-fast Pokemon configuration with smart defaults</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Results -->
          <v-col cols="12" md="4" class="pa-2">
            <v-card class="h-100">
              <v-card-title>Results</v-card-title>
              <v-card-text>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-chart-radar</v-icon>
                  <p class="text-h6 mt-4">Results preview</p>
                  <p class="text-body-2 text-grey">Production totals and IV performance chart</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </BubbleBackground>
  </v-container>
</template>

<script setup lang="ts">
import BubbleBackground from '@/components/custom-components/backgrounds/BubbleBackground.vue'
</script>

<style scoped lang="scss">
// Header content
.sleep-header-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px 20px 10px 20px;

  h1 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    animation: fadeInUp 0.8s both;
  }

  p {
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    animation: fadeInUp 0.8s 0.2s both;
  }
}

.sleep-controls {
  padding: 15px 15px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
