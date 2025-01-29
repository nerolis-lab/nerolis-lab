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
      <v-list-item prepend-icon="mdi-cog" title="Settings" to="/settings"></v-list-item>
      <v-list-item v-if="isAdmin" prepend-icon="mdi-shield-account" title="Admin" to="/admin"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import AccountMenu from '@/components/account/account-menu.vue'
import DonateMenu from '@/components/donate/donate-menu.vue'
import InboxMenu from '@/components/inbox/inbox-menu.vue'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent } from 'vue'
import type { CallbackTypes } from 'vue3-google-login'

// used because this is imported by AccountMenu from vue3-google-login and this component thinks it's importing a private type
type _EnsureUsed = CallbackTypes.CodePopupResponse

export default defineComponent({
  name: 'TheNavBar',
  components: {
    AccountMenu,
    DonateMenu,
    InboxMenu
  },
  setup() {
    const userStore = useUserStore()
    return { isAdmin: userStore.role === Roles.Admin, loggedIn: userStore.loggedIn }
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
  color: $skill;
  font-style: italic;
  font-size: 16px;
  margin: -6px 0 0 5px;
}
</style>
