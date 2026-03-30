<template>
  <DefaultTheme.Layout>
    <template #sidebar-nav-before>
      <SharedSidebarLinks :items="MAIN_SITE_NAV_ITEMS" link-mode="href" />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup lang="ts">
import SharedSidebarLinks from '@frontend-shared/shared-sidebar-links.vue';
import { MAIN_SITE_NAV_ITEMS } from '@frontend-shared/site-navigation';
import DefaultTheme from 'vitepress/theme';
</script>
