import { onMounted, onUnmounted, ref } from 'vue'

// TODO: we should probably rename isMobile to isTablet and isTinyMobile to isMobile
export function useBreakpoint() {
  const isMobile = ref(window.innerWidth < 1000)
  const isTinyMobile = ref(window.innerWidth < 500)
  const isLargeDesktop = ref(window.innerWidth >= 1920)
  const viewportWidth = ref(window.innerWidth)

  function update() {
    viewportWidth.value = window.innerWidth
    isMobile.value = window.innerWidth < 1000
    isTinyMobile.value = window.innerWidth < 500
    isLargeDesktop.value = window.innerWidth >= 1920
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isMobile, isTinyMobile, isLargeDesktop, viewportWidth }
}
