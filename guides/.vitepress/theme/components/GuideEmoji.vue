<script setup lang="ts">
import { computed } from 'vue';
import { resolveGuideEmojiUrl } from '../utils/guide-emoji-paths';

const props = defineProps<{
  name: string;
}>();

const resolvedSrc = computed(() => resolveGuideEmojiUrl(props.name) ?? '');
</script>

<template>
  <img
    v-if="resolvedSrc"
    class="guide-emoji"
    :src="resolvedSrc"
    :alt="`:${name}:`"
    :title="`:${name}:`"
    loading="lazy"
    decoding="async"
  />
</template>
