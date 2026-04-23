<script setup lang="ts">
import { onKeyStroke, useMediaQuery } from '@vueuse/core';
import { useData } from 'vitepress';
import VPNavBarSearchButton from 'vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue';
import { resolveOptionsForLanguage } from 'vitepress/dist/client/theme-default/support/docsearch.js';
import type { DefaultTheme } from 'vitepress/theme';
import { computed, defineAsyncComponent, ref } from 'vue';

// matches VitePress layout where <768px is compact nav / mobile-style search chrome
const isMobileSearchUi = useMediaQuery('(max-width: 767px)');

const VPLocalSearchBox = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue')
);

const { theme, localeIndex, lang } = useData();

const searchOptions = computed<DefaultTheme.AlgoliaSearchOptions>(() =>
  resolveOptionsForLanguage(theme.value.search?.options || {}, localeIndex.value, lang.value)
);

const showSearch = ref(false);

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;

  return element.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA';
}

onKeyStroke('k', (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    showSearch.value = true;
  }
});

onKeyStroke('/', (event) => {
  if (!isEditingContent(event)) {
    event.preventDefault();
    showSearch.value = true;
  }
});
</script>

<template>
  <div class="guides-nav-bar-search VPNavBarSearch">
    <v-btn
      v-show="isMobileSearchUi && !showSearch"
      icon
      variant="text"
      type="button"
      class="guides-toolbar-icon-btn"
      :aria-label="searchOptions.translations?.button?.buttonAriaLabel || 'Search'"
      aria-keyshortcuts="/ control+k meta+k"
      @click="showSearch = true"
    >
      <v-icon size="24">mdi-magnify</v-icon>
    </v-btn>
    <v-btn
      v-show="isMobileSearchUi && showSearch"
      icon
      variant="text"
      type="button"
      class="guides-toolbar-icon-btn"
      aria-label="Close search"
      @click="showSearch = false"
    >
      <v-icon size="24">mdi-close</v-icon>
    </v-btn>
    <VPNavBarSearchButton
      v-show="!isMobileSearchUi"
      :text="searchOptions.translations?.button?.buttonText || 'Search'"
      :aria-label="searchOptions.translations?.button?.buttonAriaLabel || 'Search'"
      aria-keyshortcuts="/ control+k meta+k"
      @click="showSearch = true"
    />
    <VPLocalSearchBox v-if="showSearch" @close="showSearch = false" />
  </div>
</template>

<style scoped lang="scss">
.guides-nav-bar-search {
  display: flex;
  align-items: center;
}
</style>
