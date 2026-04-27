<script setup lang="ts">
import sneaselPhone from '../../../images/misc/sneasel-phone-speech.svg';
</script>

<template>
  <div class="panel" role="note">
    <img :src="sneaselPhone" class="speaker" aria-hidden="true" alt="" width="51" height="100" />

    <div class="frame">
      <div class="inner">
        <p class="bar">Subjective Info</p>
        <div class="content">
          <p class="copy">
            The following content contains subjective advice or recommendations. Please take it into consideration and
            <strong>make your own decisions based on your playstyle and goals.</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../typography' as *;

.panel {
  position: relative;
  margin: 32px 0 16px;
}

.speaker {
  position: absolute;
  margin: 0;
  z-index: 2;
  top: -31px;
  left: -2px;
  pointer-events: none;
}

.frame {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  padding: 8px;
  background: var(--color-neutral-700);
  border-radius: 20px;
  box-shadow: 0 3px 18px rgba(0, 0, 0, 0.2);
}

.inner {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  min-height: 4.5rem;
  background: var(--color-neutral-700);
  border: 2px solid var(--color-primary-600);
  border-radius: 14px;
  overflow: hidden;
}

.bar {
  @include typography-strong;
  margin: 0;
  padding: 4px 0;
  text-align: center;
  background: var(--color-primary-500);
  border-bottom: 1px solid var(--color-primary-600);
}

.content {
  padding: 20px 16px;
}

.copy {
  margin: 0;
  font-family: var(--font-family-prose, inherit);
  font-size: 0.95rem;
  line-height: 1.55;
  text-align: left;
}

.plain {
  color: var(--color-neutral-100);
}

strong {
  color: var(--color-primary-400);
}
</style>
