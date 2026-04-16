<script setup lang="ts">
/**
 * Fork of VitePress default Layout; coordinates useSidebarControl() with GuidesSiteHeader (site nav).
 * See node_modules/vitepress/dist/client/theme-default/Layout.vue - keep in sync on upgrades.
 */
import { useData, useRoute } from 'vitepress';
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue';
import VPContent from 'vitepress/dist/client/theme-default/components/VPContent.vue';
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue';
import VPLocalNav from 'vitepress/dist/client/theme-default/components/VPLocalNav.vue';
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue';
import VPSidebar from 'vitepress/dist/client/theme-default/components/VPSidebar.vue';
import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue';
import {
  layoutInfoInjectionKey,
  registerWatchers,
  useLayout
} from 'vitepress/dist/client/theme-default/composables/layout.js';
import { useSidebarControl } from 'vitepress/dist/client/theme-default/composables/sidebar.js';
import { computed, provide, ref, useSlots, watch } from 'vue';
import GuidesDocHeading from './components/GuidesDocHeading.vue';
import GuidesSiteHeader from './components/GuidesSiteHeader.vue';

const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar, toggle: toggleSidebar } = useSidebarControl();

registerWatchers({ closeSidebar });

const { hasSidebar } = useLayout();

const route = useRoute();
const siteNavOpen = ref(false);

watch(
  () => route.path,
  () => {
    siteNavOpen.value = false;
  }
);

const { frontmatter, page, site } = useData();

const pageTitle = computed(() => {
  const t = page.value.title;
  if (typeof t === 'string' && t.trim().length > 0) {
    return t;
  }
  return site.value.title;
});

const slots = useSlots();
const heroImageSlotExists = computed(() => !!slots['home-hero-image']);

provide(layoutInfoInjectionKey, { heroImageSlotExists });

function onToggleDocSidebar() {
  siteNavOpen.value = false;
  toggleSidebar();
}

function onOpenDocSidebar() {
  siteNavOpen.value = false;
  openSidebar();
}
</script>

<template>
  <v-app class="guides-app">
    <div v-if="frontmatter.layout !== false" class="Layout guides-shell" :class="frontmatter.pageClass">
      <slot name="layout-top" />
      <GuidesSiteHeader
        v-model:site-nav-open="siteNavOpen"
        :page-title="pageTitle"
        :has-sidebar="hasSidebar"
        :doc-sidebar-open="isSidebarOpen"
        @toggle-doc-sidebar="onToggleDocSidebar"
        @close-doc-sidebar="closeSidebar"
      />
      <VPSkipLink />
      <VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />
      <VPNav>
        <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
        <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
        <template #nav-bar-content-before><slot name="nav-bar-content-before" /></template>
        <template #nav-bar-content-after><slot name="nav-bar-content-after" /></template>
        <template #nav-screen-content-before><slot name="nav-screen-content-before" /></template>
        <template #nav-screen-content-after><slot name="nav-screen-content-after" /></template>
      </VPNav>
      <VPLocalNav :open="isSidebarOpen" @open-menu="onOpenDocSidebar" />

      <VPSidebar :open="isSidebarOpen">
        <template #sidebar-nav-before><slot name="sidebar-nav-before" /></template>
        <template #sidebar-nav-after><slot name="sidebar-nav-after" /></template>
      </VPSidebar>

      <VPContent>
        <template #doc-before>
          <GuidesDocHeading />
          <slot name="doc-before" />
        </template>
        <template #page-top><slot name="page-top" /></template>
        <template #page-bottom><slot name="page-bottom" /></template>

        <template #not-found><slot name="not-found" /></template>
        <template #home-hero-before><slot name="home-hero-before" /></template>
        <template #home-hero-info-before><slot name="home-hero-info-before" /></template>
        <template #home-hero-info><slot name="home-hero-info" /></template>
        <template #home-hero-info-after><slot name="home-hero-info-after" /></template>
        <template #home-hero-actions-after><slot name="home-hero-actions-after" /></template>
        <template #home-hero-actions-before-actions><slot name="home-hero-actions-before-actions" /></template>
        <template #home-hero-image><slot name="home-hero-image" /></template>
        <template #home-hero-after><slot name="home-hero-after" /></template>
        <template #home-features-before><slot name="home-features-before" /></template>
        <template #home-features-after><slot name="home-features-after" /></template>

        <template #doc-footer-before><slot name="doc-footer-before" /></template>
        <template #doc-after><slot name="doc-after" /></template>
        <template #doc-top><slot name="doc-top" /></template>
        <template #doc-bottom><slot name="doc-bottom" /></template>

        <template #aside-top><slot name="aside-top" /></template>
        <template #aside-bottom><slot name="aside-bottom" /></template>
        <template #aside-outline-before><slot name="aside-outline-before" /></template>
        <template #aside-outline-after><slot name="aside-outline-after" /></template>
        <template #aside-ads-before><slot name="aside-ads-before" /></template>
        <template #aside-ads-after><slot name="aside-ads-after" /></template>
      </VPContent>

      <VPFooter />
      <slot name="layout-bottom" />
    </div>
    <Content v-else />
  </v-app>
</template>

<style scoped>
.Layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
