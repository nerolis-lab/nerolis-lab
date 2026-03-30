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
    <div class="drawer-content">
      <SharedSidebarLinks :items="mainNavItems" />
      <v-divider class="my-2" />
      <v-list nav>
        <v-list-item prepend-icon="mdi-cog" title="Settings" to="/settings"></v-list-item>
        <v-list-item v-if="isAdmin" prepend-icon="mdi-shield-account" title="Admin" to="/admin"></v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import AccountMenu from '@/components/account/account-menu.vue'
import DonateMenu from '@/components/donate/donate-menu.vue'
import InboxMenu from '@/components/inbox/inbox-menu.vue'
import { MAIN_SITE_NAV_ITEMS } from '@/shared/site-navigation'
import SharedSidebarLinks from '@/shared/shared-sidebar-links.vue'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TheNavBar',
  components: {
    AccountMenu,
    DonateMenu,
    InboxMenu,
    SharedSidebarLinks
  },
  setup() {
    const userStore = useUserStore()
    return { isAdmin: userStore.role === Roles.Admin, loggedIn: userStore.loggedIn, mainNavItems: MAIN_SITE_NAV_ITEMS }
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

.drawer-content {
  padding: 8px;
}

@media (max-width: $desktop) {
  .v-app-bar-title {
    margin-inline-start: 0px !important;
  }
}
</style>
