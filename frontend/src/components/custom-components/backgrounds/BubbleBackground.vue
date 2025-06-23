<template>
  <div class="bubble-background" :style="gradientStyle">
    <div class="bubbles-container">
      <div
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="bubble"
        :class="{ 'bubble-outline': bubble.isOutline }"
        :style="bubbleStyle(bubble)"
      ></div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

export interface Bubble {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  isOutline: boolean
  speedY: number
  speedX: number
}

const props = defineProps({
  baseColor: {
    type: String,
    default: '#4896FF'
  },
  bubbleCount: {
    type: Number,
    default: 15
  }
})

const bubbles = ref<Bubble[]>([])
let animationFrameId: number | null = null

const gradientStyle = computed(() => {
  const color = props.baseColor
  const lighterColor = lightenColor(color, 10)
  const darkerColor = darkenColor(color, 30)
  return {
    backgroundImage: `linear-gradient(to bottom, ${lighterColor}, ${darkerColor})`
  }
})

function lightenColor(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '')
  const num = parseInt(hex, 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}

function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent)
}

function bubbleStyle(bubble: Bubble) {
  return {
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    width: `${bubble.size}px`,
    height: `${bubble.size}px`,
    opacity: bubble.opacity,
    transform: 'translate(-50%, -50%)'
  }
}

function createBubble(id: number, isInitial = false): Bubble {
  const isOutline = Math.random() > 0.4
  return {
    id,
    x: Math.random() * 100,
    y: isInitial ? Math.random() * 120 - 20 : 100 + Math.random() * 20,
    size: Math.random() * 40 + 10,
    opacity: Math.random() * 0.3 + 0.1,
    isOutline,
    speedY: Math.random() * 0.03 + 0.01,
    speedX: (Math.random() - 0.5) * 0.005
  }
}

function initializeBubbles() {
  bubbles.value = []
  for (let i = 0; i < props.bubbleCount; i++) {
    bubbles.value.push(createBubble(i, true))
  }
}

function animateBubbles() {
  bubbles.value = bubbles.value.map((bubble) => {
    let newY = bubble.y - bubble.speedY
    let newX = bubble.x + bubble.speedX

    // Recycle bubble if it goes off-screen (top)
    if (newY < -((bubble.size / window.innerHeight) * 100) - 10) {
      return {
        ...createBubble(bubble.id),
        y: 100 + Math.random() * 20,
        id: bubble.id
      }
    }

    // Boundary check for X (bounce off sides gently)
    if (newX > 100 - (bubble.size / window.innerWidth) * 5 || newX < (bubble.size / window.innerWidth) * 5) {
      bubble.speedX *= -1
      newX = bubble.x + bubble.speedX
    }

    return { ...bubble, y: newY, x: newX }
  })

  animationFrameId = requestAnimationFrame(animateBubbles)
}

onMounted(() => {
  initializeBubbles()
  animateBubbles()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped lang="scss">
.bubble-background {
  position: relative;
  overflow: hidden;
}

.bubbles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
}

.bubble-outline {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.6);
}
</style>
