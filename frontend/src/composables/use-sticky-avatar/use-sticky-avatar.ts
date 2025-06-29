import { nextTick, onMounted, onUnmounted, ref, type ComponentPublicInstance, type Ref } from 'vue'

export function useStickyAvatar(
  targetElement: Ref<HTMLElement | ComponentPublicInstance | null>,
  isEnabled: Ref<boolean>
) {
  const showStickyAvatar = ref(false)
  let intersectionObserver: IntersectionObserver | null = null

  const setupObserver = () => {
    if (!isEnabled.value || !targetElement.value) return

    nextTick(() => {
      if (!targetElement.value) return

      const element = (targetElement.value as ComponentPublicInstance)?.$el || (targetElement.value as HTMLElement)

      if (element && !intersectionObserver) {
        intersectionObserver = new IntersectionObserver(
          (entries) => {
            requestAnimationFrame(() => {
              const entry = entries[0]
              // Show sticky avatar when target element is not fully visible
              showStickyAvatar.value = entry.intersectionRatio < 0.9
            })
          },
          {
            threshold: [0.9],
            rootMargin: '0px'
          }
        )

        intersectionObserver.observe(element)
      }
    })
  }

  const cleanup = () => {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
  }

  onMounted(setupObserver)
  onUnmounted(cleanup)

  return {
    showStickyAvatar
  }
}
