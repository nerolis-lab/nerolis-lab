<template>
  <v-app-bar color="background">
    <template #prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon size="24">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>
      <div class="page-title">{{ $route.name }}<RouterLink to="/beta" class="beta-tag">beta</RouterLink></div>
    </v-app-bar-title>

    <template #append>
      <DonateMenu />
      <InboxMenu v-if="loggedIn" />
      <AccountMenu />
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list nav>
      <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-calculator" title="Calculator" to="/calculator"></v-list-item>
      <v-list-item prepend-icon="mdi-compare-horizontal" title="Compare" to="/compare"></v-list-item>
      <v-list-item prepend-icon="mdi-podium" title="Tier lists" to="/tierlist"></v-list-item>
      <v-list-item prepend-icon="mdi-food" title="Recipes" to="/recipes"></v-list-item>

      <v-list-item>
        <v-divider />
      </v-list-item>

      <v-list-item prepend-icon="mdi-cog" title="Settings" to="/settings"></v-list-item>
      <v-list-item v-if="isAdmin" prepend-icon="mdi-shield-account" title="Admin" to="/admin"></v-list-item>

      <v-list-item>
        <v-divider />
      </v-list-item>

      <LanguageSelection />
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import AccountMenu from '@/components/account/account-menu.vue'
import DonateMenu from '@/components/donate/donate-menu.vue'
import InboxMenu from '@/components/inbox/inbox-menu.vue'
import LanguageSelection from '@/components/language/language-selection.vue'
import { useLanguageStore } from '@/stores/language-store'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'TheNavBar',
  components: {
    AccountMenu,
    DonateMenu,
    InboxMenu,
    LanguageSelection
  },
  setup() {
    const userStore = useUserStore()
    const languageStore = useLanguageStore()
    const { locale } = useI18n()

    // Initialize language on app load
    onMounted(() => {
      languageStore.initializeLanguage()
      locale.value = languageStore.currentLanguage
    })

    return {
      isAdmin: userStore.role === Roles.Admin,
      loggedIn: userStore.loggedIn
    }
  },
  data: () => ({
    drawer: false
  })
})
</script>

<style lang="scss" scoped>
.page-title {
  display: flex;
}

.beta-tag {
  color: $primary;
  font-style: italic;
  font-size: 16px;
  margin: -6px 0 0 5px;
}

@media (max-width: $desktop) {
  .v-app-bar-title {
    margin-inline-start: 0px !important;
  }
}
</style>
