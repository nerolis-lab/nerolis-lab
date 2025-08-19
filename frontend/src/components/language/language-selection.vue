<template>
  <v-list-group>
    <template #activator="{ props }">
      <v-list-item v-bind="props" prepend-icon="mdi-translate" :title="t('common.language.title')"> </v-list-item>
    </template>

    <v-list-item
      v-for="language in reversedLanguages"
      :key="language.code"
      :active="languageStore.currentLanguage === language.code"
      :class="{ 'v-list-item--active': languageStore.currentLanguage === language.code }"
      @click="changeLanguage(language.code)"
    >
      <template #prepend>
        <div class="language-option-flag">
          <component :is="getFlagComponent(language.code)" />
        </div>
      </template>
      <v-list-item-title>{{ language.nativeName }}</v-list-item-title>
      <template #append>
        <v-icon v-if="languageStore.currentLanguage === language.code" color="primary" size="20"> mdi-check </v-icon>
      </template>
    </v-list-item>
  </v-list-group>
</template>

<script setup lang="ts">
import FlagEn from '@/components/icons/flag-en.vue'
import FlagJa from '@/components/icons/flag-ja.vue'
import { useLanguageStore } from '@/stores/language-store'
import type { Component } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const languageStore = useLanguageStore()

const flagComponents: Record<string, Component> = {
  en: FlagEn,
  ja: FlagJa
}

const reversedLanguages = computed(() => {
  return [...languageStore.availableLanguages].reverse()
})

const getFlagComponent = (languageCode: string): Component => {
  return flagComponents[languageCode] || flagComponents.en
}

const changeLanguage = (languageCode: string) => {
  languageStore.changeLanguage(languageCode)

  locale.value = languageCode
}
</script>

<style lang="scss" scoped>
.current-language-flag,
.language-option-flag {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

.v-list-item--active {
  .language-option-flag {
    opacity: 1;
  }
}

.v-list-item:not(.v-list-item--active) {
  .language-option-flag {
    opacity: 0.7;
  }
}

.v-list-item:hover {
  .language-option-flag {
    opacity: 1;
  }
}
</style>
