<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import { computed, onMounted } from 'vue';
import { formatList, getAvatarUrlForAuthorName } from '../utils/format-utils';

const { frontmatter } = useData();
const route = useRoute();

const fullTitle = computed(() => {
  const v = frontmatter.value.fullTitle;
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : '';
});

const authors = computed(() => {
  const author = frontmatter.value.author;
  if (typeof author !== 'string' || author.trim().length === 0) {
    return [];
  }

  return author
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((name: string) => ({
      name,
      url: getAvatarUrlForAuthorName(name)
    }));
});

const authorsWithAvatars = computed(() =>
  authors.value.filter((a): a is { name: string; url: string } => a.url !== undefined)
);

const authorByline = computed(() => {
  return formatList(authors.value.map((author) => author.name));
});

const hasCompleteHeading = computed(() => fullTitle.value.length > 0 && authorByline.value.length > 0);

onMounted(() => {
  if (hasCompleteHeading.value) {
    return;
  }
  console.warn(
    `[guides] Each guide page requires non-empty frontmatter fullTitle and author (comma-separated names). Missing or incomplete for: ${route.path}`
  );
});
</script>

<template>
  <div v-if="hasCompleteHeading" class="doc-heading">
    <h1>{{ fullTitle }}</h1>
    <div class="author-byline">
      <div v-if="authorsWithAvatars.length > 0" class="author-avatars" aria-hidden="true">
        <v-avatar
          v-for="(author, index) in authorsWithAvatars"
          :key="`${author.name}-${index}`"
          class="author-avatar"
          size="40"
          variant="outlined"
          :image="author.url"
          :style="{ zIndex: authorsWithAvatars.length - index }"
        />
      </div>
      <p class="author-names">by {{ authorByline }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../typography' as *;

.doc-heading {
  margin-bottom: 24px;

  h1 {
    font-family: var(--font-family-base);
    @include typography-h1-page;
    color: var(--color-secondary-500);
    margin: 0;
  }
}

.author-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.author-avatars {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.author-avatar {
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  border-color: var(--color-neutral-700);
  border-width: 2px;
  box-shadow: 0 0 10px rgba(var(--color-neutral-700), 0.6);

  &:not(:first-child) {
    margin-left: -10px;
  }
}

.author-names {
  @include typography-small;
  color: var(--color-neutral-300);
  margin: 0;
}
</style>
