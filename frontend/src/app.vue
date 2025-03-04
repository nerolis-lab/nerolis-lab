<template>
  <v-app style="background-color: transparent">
    <TheBackground />
    <TheNavbar />
    <TheSnackbar />

    <v-main>
      <RouterView />
    </v-main>
    <TheFooter></TheFooter>
  </v-app>
</template>

<script lang="ts">
import TheBackground from '@/components/background/background.vue'
import TheFooter from '@/components/footer/footer.vue'
import TheNavbar from '@/components/nav-bar/nav-bar.vue'
import TheSnackbar from '@/components/snackbar/snackbar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    TheNavbar,
    TheBackground,
    TheSnackbar,
    TheFooter
  }
})
</script>

<style lang="scss">
@use '@/assets/global.scss';
</style>
