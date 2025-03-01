import { onMounted, onUnmounted, ref } from 'vue'

export function useBreakpoint() {
  const isMobile = ref(window.innerWidth < 1000)
  const isLargeDesktop = ref(window.innerWidth >= 1920)
  const viewportWidth = ref(window.innerWidth)

  function update() {
    viewportWidth.value = window.innerWidth
    isMobile.value = window.innerWidth < 1000
    isLargeDesktop.value = window.innerWidth >= 1920
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isMobile, isLargeDesktop, viewportWidth }
}
