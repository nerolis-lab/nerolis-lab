<template>
  <div
    v-if="items && items.length > 0"
    ref="tickerContainerRef"
    class="ticker-container"
    @mouseenter="handleMouseEnterTicker"
    @mouseleave="handleMouseLeaveTicker"
    @mousemove="handleMouseMoveTicker"
    @click="handleTickerClick"
    @mousedown.prevent="handleMouseDown"
    @touchstart.prevent="handleTouchStart"
  >
    <div ref="tickerWrapperRef" class="ticker-wrapper" :style="{ transform: `translateX(${translateX}px)` }">
      <slot v-for="item in items" :item="item" :key="item.uniqueKey"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

interface TickerItem {
  uniqueKey: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const props = defineProps({
  items: {
    type: Array as PropType<TickerItem[]>,
    required: true,
    default: () => []
  }
})

const tickerContainerRef = ref<HTMLElement | null>(null)
const tickerWrapperRef = ref<HTMLElement | null>(null)
const translateX = ref(0)
const isHoveringTicker = ref(false)
const isHoveringReverseZone = ref(false) // True if hovering on the left 20% for reverse
const isPausedByClick = ref(false)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragInitialTranslateX = ref(0)
let animationFrameId: number | null = null
const SCROLL_SPEED = 0.1 // Pixels per frame
const REVERSE_ZONE_PERCENTAGE = 0.2 // Left 20% of the ticker container

const tickerWrapperWidth = computed(() => tickerWrapperRef.value?.scrollWidth ?? 0)
const tickerContainerWidth = computed(() => tickerContainerRef.value?.clientWidth ?? 0)

const animateTicker = () => {
  if (!tickerWrapperRef.value || !tickerContainerRef.value) {
    animationFrameId = requestAnimationFrame(animateTicker)
    return
  }

  const wrapperWidth = tickerWrapperWidth.value
  const containerWidth = tickerContainerWidth.value

  if (wrapperWidth <= containerWidth) {
    translateX.value = 0
    stopAnimation()
    animationFrameId = requestAnimationFrame(animateTicker)
    return
  }

  if (!isPausedByClick.value && !isDragging.value) {
    if (isHoveringTicker.value) {
      if (isHoveringReverseZone.value) {
        translateX.value += SCROLL_SPEED
        if (translateX.value > 0) {
          translateX.value = -(wrapperWidth / 2)
        }
      }
    } else {
      translateX.value -= SCROLL_SPEED
      if (translateX.value < -(wrapperWidth / 2)) {
        translateX.value = 0
      }
    }
  }

  animationFrameId = requestAnimationFrame(animateTicker)
}

const startAnimation = () => {
  if (animationFrameId === null && props.items.length > 0) {
    animateTicker()
  }
}

const stopAnimation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

const handleMouseEnterTicker = () => {
  isHoveringTicker.value = true
}

const handleMouseLeaveTicker = () => {
  isHoveringTicker.value = false
  isHoveringReverseZone.value = false
  if (!isPausedByClick.value && !isDragging.value) {
    startAnimation()
  }
}

const handleMouseMoveTicker = (event: MouseEvent) => {
  if (isHoveringTicker.value && tickerContainerRef.value) {
    const rect = tickerContainerRef.value.getBoundingClientRect()
    const mouseXInContainer = event.clientX - rect.left
    const reverseZoneWidth = rect.width * REVERSE_ZONE_PERCENTAGE
    isHoveringReverseZone.value = mouseXInContainer < reverseZoneWidth
  }
}

const handleTickerClick = () => {
  isPausedByClick.value = !isPausedByClick.value
  if (isPausedByClick.value) {
    stopAnimation()
  } else {
    startAnimation()
  }
}

const pointerDown = (clientX: number) => {
  if (!tickerWrapperRef.value) return
  isDragging.value = true
  dragStartX.value = clientX
  dragInitialTranslateX.value = translateX.value
  stopAnimation()
  if (tickerContainerRef.value) tickerContainerRef.value.style.cursor = 'grabbing'
}

const pointerMove = (clientX: number) => {
  if (!isDragging.value || !tickerWrapperRef.value || !tickerContainerRef.value) return

  const dx = clientX - dragStartX.value
  let newTranslateX = dragInitialTranslateX.value + dx

  const wrapperWidth = tickerWrapperWidth.value
  const containerWidth = tickerContainerWidth.value

  const minTranslateX = -(wrapperWidth - containerWidth) - 20
  const maxTranslateX = 20

  if (wrapperWidth <= containerWidth) {
    newTranslateX = 0
  } else {
    newTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX))
  }

  translateX.value = newTranslateX
}

const pointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (tickerContainerRef.value) tickerContainerRef.value.style.cursor = 'grab'
  if (!isPausedByClick.value) {
    startAnimation()
  }
}

const handleMouseDown = (event: MouseEvent) => {
  pointerDown(event.clientX)
}

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    pointerDown(event.touches[0].clientX)
  }
}

const handleGlobalMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    pointerMove(event.clientX)
  }
}

const handleGlobalTouchMove = (event: TouchEvent) => {
  if (isDragging.value && event.touches.length === 1) {
    pointerMove(event.touches[0].clientX)
  }
}

const handleGlobalMouseUp = () => {
  pointerUp()
}

const handleGlobalTouchEnd = () => {
  pointerUp()
}

onMounted(() => {
  if (tickerContainerRef.value && tickerWrapperRef.value && props.items.length > 0) {
    // Delay startAnimation to ensure DOM is fully ready, especially for width calculations
    nextTick(() => {
      startAnimation()
    })
  }
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleGlobalMouseUp)
  window.addEventListener('touchmove', handleGlobalTouchMove)
  window.addEventListener('touchend', handleGlobalTouchEnd)
})

onBeforeUnmount(() => {
  stopAnimation()
  window.removeEventListener('mousemove', handleGlobalMouseMove)
  window.removeEventListener('mouseup', handleGlobalMouseUp)
  window.removeEventListener('touchmove', handleGlobalTouchMove)
  window.removeEventListener('touchend', handleGlobalTouchEnd)
})

watch(
  () => props.items,
  async (newItems, oldItems) => {
    if (JSON.stringify(newItems) !== JSON.stringify(oldItems)) {
      stopAnimation()
      translateX.value = 0
      await nextTick()
      if (
        tickerContainerRef.value &&
        tickerWrapperRef.value &&
        !isPausedByClick.value &&
        !isDragging.value &&
        newItems.length > 0
      ) {
        startAnimation()
      }
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.ticker-container {
  width: 100%;
  overflow: hidden;
  height: auto;
  padding: 4px 0;
  cursor: grab;
  user-select: none;
}

.ticker-wrapper {
  display: flex;
  width: fit-content;
  will-change: transform;
  white-space: nowrap;
}
</style>
