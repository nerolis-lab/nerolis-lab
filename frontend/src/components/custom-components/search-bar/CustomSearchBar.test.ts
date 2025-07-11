import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import CustomSearchBar from './CustomSearchBar.vue'

describe('CustomSearchBar', () => {
  let wrapper: VueWrapper<InstanceType<typeof CustomSearchBar>>

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Basic functionality', () => {
    it('renders correctly', () => {
      wrapper = mount(CustomSearchBar)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.search-bar-container').exists()).toBe(true)
    })

    it('applies minimized class when not expanded', () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true } })
      expect(wrapper.find('.search-bar-container').classes()).toContain('minimized')
      expect(wrapper.find('.search-bar-container').classes()).not.toContain('expanded')
    })

    it('applies expanded class when expanded', () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false } })
      expect(wrapper.find('.search-bar-container').classes()).toContain('expanded')
      expect(wrapper.find('.search-bar-container').classes()).not.toContain('minimized')
    })
  })

  describe('Props', () => {
    it('respects startMinimized prop', () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true } })
      expect(wrapper.vm.isExpanded).toBe(false)

      wrapper = mount(CustomSearchBar, { props: { startMinimized: false } })
      expect(wrapper.vm.isExpanded).toBe(true)
    })

    it('uses provided placeholder', () => {
      wrapper = mount(CustomSearchBar, { props: { placeholder: 'Custom search...' } })
      expect(wrapper.vm.placeholder).toBe('Custom search...')
    })

    it('uses provided density', () => {
      wrapper = mount(CustomSearchBar, { props: { density: 'compact' } })
      expect(wrapper.vm.density).toBe('compact')
    })
  })

  describe('Minimized/Expanded behavior', () => {
    it('expands on click when minimized and expandOnClick is true', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true, expandOnClick: true } })

      expect(wrapper.vm.isExpanded).toBe(false)

      await wrapper.find('.search-bar-container').trigger('click')
      await nextTick()

      expect(wrapper.vm.isExpanded).toBe(true)
    })

    it('does not expand on click when expandOnClick is false', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true, expandOnClick: false } })

      expect(wrapper.vm.isExpanded).toBe(false)

      await wrapper.find('.search-bar-container').trigger('click')
      await nextTick()

      expect(wrapper.vm.isExpanded).toBe(false)
    })

    it('does not trigger click handler when already expanded', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false } })

      const initialExpanded = wrapper.vm.isExpanded
      expect(initialExpanded).toBe(true)

      await wrapper.find('.search-bar-container').trigger('click')
      await nextTick()

      expect(wrapper.vm.isExpanded).toBe(initialExpanded)
    })
  })

  describe('Events', () => {
    it('emits update:modelValue on input', async () => {
      wrapper = mount(CustomSearchBar)

      // Simulate input by calling the handleInput method directly
      wrapper.vm.handleInput('test value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
    })

    it('emits enter event on enter key', async () => {
      wrapper = mount(CustomSearchBar, { props: { modelValue: 'search term' } })

      // Simulate enter by calling the handleEnter method directly
      wrapper.vm.handleEnter()

      expect(wrapper.emitted('enter')).toBeTruthy()
      expect(wrapper.emitted('enter')?.[0]).toEqual(['search term'])
    })
  })

  describe('Styling', () => {
    it('applies 100% width when expanded without maxWidth', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false } })

      const container = wrapper.find('.search-bar-container')
      expect(container.attributes('style')).toContain('width: 100%')
    })

    it('applies maxWidth when expanded', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false, maxWidth: 350 } })

      const container = wrapper.find('.search-bar-container')
      expect(container.attributes('style')).toContain('width: 350px')
      expect(container.attributes('style')).toContain('max-width: 350px')
    })

    it('prefers maxWidth over width', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false, width: 400, maxWidth: 350 } })

      const container = wrapper.find('.search-bar-container')
      expect(container.attributes('style')).toContain('width: 350px')
      expect(container.attributes('style')).toContain('max-width: 350px')
    })

    it('has no width style when minimized', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true, maxWidth: 350 } })

      const container = wrapper.find('.search-bar-container')
      expect(container.attributes('style') || '').not.toContain('width: 350px')
    })
  })

  describe('Blur behavior', () => {
    it('minimizes on blur when conditions are met', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true } })

      // First expand it
      await wrapper.find('.search-bar-container').trigger('click')
      await nextTick()
      expect(wrapper.vm.isExpanded).toBe(true)

      // Call blur handler directly
      wrapper.vm.handleBlur()
      expect(wrapper.vm.isExpanded).toBe(false)
    })

    it('does not minimize on blur when has value', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true, modelValue: 'test' } })

      // First expand it
      await wrapper.find('.search-bar-container').trigger('click')
      await nextTick()
      expect(wrapper.vm.isExpanded).toBe(true)

      // Call blur handler directly
      wrapper.vm.handleBlur()
      expect(wrapper.vm.isExpanded).toBe(true)
    })

    it('does not minimize on blur when startMinimized is false', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: false } })

      // Call blur handler directly
      wrapper.vm.handleBlur()
      expect(wrapper.vm.isExpanded).toBe(true)
    })
  })

  describe('Container click behavior', () => {
    it('expands and sets up for focus when clicked while minimized', async () => {
      wrapper = mount(CustomSearchBar, { props: { startMinimized: true } })

      expect(wrapper.vm.isExpanded).toBe(false)

      // Call the handler directly since we can't properly mock the ref
      await wrapper.vm.handleContainerClick()
      await nextTick()

      // Verify it expanded
      expect(wrapper.vm.isExpanded).toBe(true)
    })
  })
})
