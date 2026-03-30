<template>
  <v-list nav density="comfortable">
    <v-list-item
      v-for="item in items"
      :key="item.href"
      :prepend-icon="item.icon"
      :title="item.title"
      :to="linkMode === 'href' ? undefined : toProp(item.href)"
      :href="linkMode === 'href' ? item.href : hrefProp(item.href)"
    />
  </v-list>
</template>

<script setup lang="ts">
import type { SiteNavItem } from './site-navigation';

const props = withDefaults(
  defineProps<{
    items: SiteNavItem[];
    linkMode?: 'auto' | 'href';
  }>(),
  {
    linkMode: 'auto'
  }
);

function toProp(href: string): string | undefined {
  if (href === '/guides/') return undefined;
  return href;
}

function hrefProp(href: string): string | undefined {
  if (href === '/guides/') return href;
  return undefined;
}
</script>
