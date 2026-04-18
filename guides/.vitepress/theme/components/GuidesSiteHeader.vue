<template>
  <div class="guides-site-header">
    <v-toolbar
      tag="header"
      color="background"
      density="default"
      elevation="2"
      class="guides-site-toolbar vp-raw"
      role="navigation"
      aria-label="Site"
    >
      <template #prepend>
        <v-app-bar-nav-icon
          :aria-expanded="siteNavOpen"
          :aria-label="siteNavOpen ? 'Close site menu' : 'Open site menu'"
          @click.stop="onToggleSiteNav"
        >
          <v-icon size="24">mdi-menu</v-icon>
        </v-app-bar-nav-icon>
      </template>

      <v-toolbar-title>
        <div class="page-title">{{ pageTitle }}</div>
      </v-toolbar-title>

      <div class="search">
        <VPNavBarSearch />
      </div>

      <template #append>
        <v-btn
          v-if="hasSidebar"
          class="guides-doc-sidebar-toggle"
          icon
          variant="text"
          aria-label="Open guides navigation"
          aria-controls="VPSidebarNav"
          :aria-expanded="docSidebarOpen"
          @click="emit('toggleDocSidebar')"
        >
          <v-icon size="24">mdi-book-open-variant-outline</v-icon>
        </v-btn>
      </template>
    </v-toolbar>

    <ClientOnly>
      <v-navigation-drawer
        v-model="siteNavOpen"
        temporary
        location="start"
        color="surface"
        class="site-nav-drawer vp-raw"
        :scrim="true"
      >
        <v-list nav class="site-nav-drawer-list" @click="onSiteDrawerListClick">
          <template v-for="item in siteDrawerItems" :key="item.id">
            <v-list-item v-if="item.dividerBefore">
              <v-divider />
            </v-list-item>
            <v-list-item
              :prepend-icon="item.icon"
              :title="item.label"
              :href="mainAppNavHref(item.path)"
              :active="isSiteNavActive(item)"
              rounded="lg"
            />
          </template>
        </v-list>
      </v-navigation-drawer>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { SiteNavItem } from 'sleepapi-common';
import { siteNavItemsForGuides } from 'sleepapi-common';
import { VPNavBarSearch } from 'vitepress/theme';
import { computed } from 'vue';
import { useMainAppNavHref } from '../composables/useMainAppNavHref';

defineProps<{
  pageTitle: string;
  hasSidebar: boolean;
  docSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  toggleDocSidebar: [];
  closeDocSidebar: [];
}>();

const siteNavOpen = defineModel<boolean>('siteNavOpen', { required: true });

const mainAppNavHref = useMainAppNavHref();

const siteDrawerItems = computed(() => siteNavItemsForGuides());

function onToggleSiteNav() {
  const opening = !siteNavOpen.value;
  if (opening) {
    emit('closeDocSidebar');
  }
  siteNavOpen.value = opening;
}

function onSiteNavClickOutside() {
  siteNavOpen.value = false;
}

function onSiteDrawerListClick(e: MouseEvent) {
  const target = e.target;
  if (target instanceof Element && target.closest('a[href]')) {
    siteNavOpen.value = false;
  }
}

function isSiteNavActive(item: SiteNavItem): boolean {
  return item.id === 'guides';
}
</script>

<style scoped lang="scss">
@use '../breakpoints' as *;

.search {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 auto;
  min-width: 0;
  margin-inline-end: 8px;

  @include medium-and-up {
    margin-inline-end: 16px;
  }
}
</style>
