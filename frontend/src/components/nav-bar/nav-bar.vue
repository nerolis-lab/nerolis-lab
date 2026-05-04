<template>
  <v-app-bar color="background">
    <template #prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon size="24">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>
      <div class="page-title">{{ $route.name }}</div>
    </v-app-bar-title>

    <template #append>
      <DonateMenu />
      <InboxMenu v-if="loggedIn" />
      <AccountMenu />
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list nav>
      <template v-for="item in drawerItems" :key="item.id">
        <v-list-item v-if="item.dividerBefore">
          <v-divider />
        </v-list-item>
        <v-list-item
          :prepend-icon="item.icon"
          :title="item.label"
          :to="item.spa ? item.path : undefined"
          :href="item.spa ? undefined : item.path"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import AccountMenu from '@/components/account/account-menu.vue'
import DonateMenu from '@/components/donate/donate-menu.vue'
import InboxMenu from '@/components/inbox/inbox-menu.vue'
import { useUserStore } from '@/stores/user-store'
import { Roles, siteNavItemsForFrontend } from 'sleepapi-common'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'TheNavBar',
  components: {
    AccountMenu,
    DonateMenu,
    InboxMenu
  },
  setup() {
    const userStore = useUserStore()
    const drawerItems = computed(() => siteNavItemsForFrontend(userStore.role === Roles.Admin))
    return { drawerItems, loggedIn: userStore.loggedIn }
  },
  data: () => ({
    drawer: false
  })
})
</script>

<style lang="scss" scoped>
$nav-bar-title-breakpoint: 960px;

.page-title {
  display: flex;
}

.v-app-bar {
  :deep(.v-app-bar-title) {
    margin-inline-start: 0;

    @media (min-width: $nav-bar-title-breakpoint) {
      margin-inline-start: 20px;
    }
  }
}
</style>
