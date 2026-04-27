<script setup lang="ts">
import { computed } from 'vue';
import { getAvatarUrlForAuthorName } from '../utils/format-utils';

const props = defineProps<{
  author: string; //author name that maps to `images/avatars/{slug}.png`
  title: string; //h3 line title next to the avatar
}>();

const imageUrl = computed(() => getAvatarUrlForAuthorName(props.author));
</script>

<template>
  <section class="about-author">
    <div class="heading">
      <v-avatar v-if="imageUrl" :image="imageUrl" class="avatar" size="40" variant="outlined" aria-hidden="true" />
      <h3>
        {{ title }}
      </h3>
    </div>
    <div class="about">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../typography' as *;

.about-author {
  margin-bottom: 24px;
}

.heading {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  margin-bottom: 8px;
}

.avatar {
  border-color: var(--color-neutral-700);
  border-width: 2px;
  box-shadow: 0 0 10px rgba(var(--color-neutral-700), 0.6);
}

h3 {
  margin: 0;
}

.about {
  :deep(p:first-of-type) {
    margin-top: 0;
  }
}
</style>
