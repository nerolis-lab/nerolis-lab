<script setup lang="ts">
import { getGuideEmojiCatalogByCategory } from '../utils/guide-emoji-paths';

const byCategory = getGuideEmojiCatalogByCategory();

function categoryHeading(category: string): string {
  if (category.length === 0) {
    return category;
  }
  return category.charAt(0).toUpperCase() + category.slice(1);
}
</script>

<template>
  <div class="emoji-catalog">
    <section v-for="group in byCategory" :key="group.category">
      <h3 :id="group.category">{{ categoryHeading(group.category) }}</h3>
      <ul role="list">
        <li v-for="it in group.items" :key="it.name">
          <img :src="it.url" :alt="`:${it.name}:`" loading="lazy" decoding="async" />
          <code>:{{ it.name }}:</code>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.emoji-catalog {
  section {
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    margin-bottom: 16px;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
    gap: 12px 16px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  img {
    margin: 0;
    height: 2.5rem;
  }
}
</style>
