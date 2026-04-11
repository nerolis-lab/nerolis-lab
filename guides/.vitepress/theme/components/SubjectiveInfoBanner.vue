<template>
  <div class="subjective-info-banner" role="note">
    <span class="subjective-label">Warning: subjective</span>
    <p class="subjective-text">This article contains subjective content.</p>
  </div>
</template>

<style scoped>
.subjective-info-banner {
  margin: 1rem 0;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in oklab, var(--color-secondary-500) 45%, transparent);
  background: color-mix(in oklab, var(--color-secondary-500) 5%, transparent);
}

.subjective-label {
  display: inline-block;
  margin-bottom: 6px;
  text-transform: uppercase;
  color: var(--color-secondary-500);
}

.subjective-text {
  margin: 0;
  color: var(--color-neutral-200);
}
</style>
