<template>
  <v-app style="background-color: transparent">
    <TheBackground />
    <TheNavbar />
    <TheSnackbar />

    <v-main>
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="d-flex justify-center align-center" style="height: 400px">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          </div>
        </template>
      </Suspense>
    </v-main>
    <TheFooter></TheFooter>

    <!-- Global dialogs -->
    <PokemonSearch />
    <PokemonInputDialog />
    <FilledSlotMenu />
  </v-app>
</template>

<script lang="ts">
import TheBackground from '@/components/background/background.vue'
import FilledSlotMenu from '@/components/pokemon-input/menus/FilledSlotMenu.vue'
import TheFooter from '@/components/footer/footer.vue'
import TheNavbar from '@/components/nav-bar/nav-bar.vue'
import PokemonInputDialog from '@/components/pokemon-input/PokemonInputDialog.vue'
import PokemonSearch from '@/components/pokemon-input/pokemon-search.vue'
import TheSnackbar from '@/components/snackbar/snackbar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    TheNavbar,
    TheBackground,
    TheSnackbar,
    TheFooter,
    PokemonSearch,
    PokemonInputDialog,
    FilledSlotMenu
  }
})
</script>

<style lang="scss">
@use '@/assets/global.scss';
</style>
