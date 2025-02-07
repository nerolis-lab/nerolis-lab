<template>
  <v-app style="background-color: transparent">
    <TheBackground />
    <TheNavbar />

    <v-main>
      <!-- <ServiceWorkerUpdate /> -->
      <RouterView />
    </v-main>
    <TheFooter></TheFooter>
  </v-app>
</template>

<script lang="ts">
import TheBackground from '@/components/background/background.vue'
import TheNavbar from '@/components/nav-bar/nav-bar.vue'
import TheFooter from '@/components/footer/footer.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    TheNavbar,
    TheBackground,
    TheFooter
  }
})
</script>

<style lang="scss">
@use '@/assets/global.scss';
</style>
