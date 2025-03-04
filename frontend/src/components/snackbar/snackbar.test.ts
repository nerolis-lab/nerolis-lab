import Snackbar, { error, info, success, warning } from '@/components/snackbar/snackbar.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

const createVuetifyMock = () => {
  return {
    global: {
      stubs: {
        'v-snackbar': {
          template: `
            <div v-if="modelValue" data-test="snackbar" :data-color="color" :data-timeout="timeout">
              <div data-test="snackbar-text"><slot /></div>
              <div data-test="snackbar-actions"><slot name="actions" /></div>
            </div>
          `,
          props: ['modelValue', 'color', 'timeout']
        },
        'v-btn': {
          template: '<button data-test="close-btn" @click="$emit(\'click\')"><slot /></button>',
          props: ['icon']
        }
      }
    }
  }
}

describe('Snackbar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof Snackbar>>

  beforeEach(() => {
    wrapper = mount(Snackbar, createVuetifyMock())
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should be initially hidden', () => {
    expect(wrapper.find('[data-test="snackbar"]').exists()).toBe(false)
  })

  it('should show success message', async () => {
    success('Success message')
    await nextTick()

    const snackbar = wrapper.find('[data-test="snackbar"]')
    expect(snackbar.exists()).toBe(true)
    expect(snackbar.attributes('data-color')).toBe('success')
    expect(wrapper.find('[data-test="snackbar-text"]').text()).toBe('Success message')
  })

  it('should show error message', async () => {
    error('Error message')
    await nextTick()

    const snackbar = wrapper.find('[data-test="snackbar"]')
    expect(snackbar.exists()).toBe(true)
    expect(snackbar.attributes('data-color')).toBe('error')
    expect(wrapper.find('[data-test="snackbar-text"]').text()).toBe('Error message')
  })

  it('should show info message', async () => {
    info('Info message')
    await nextTick()

    const snackbar = wrapper.find('[data-test="snackbar"]')
    expect(snackbar.exists()).toBe(true)
    expect(snackbar.attributes('data-color')).toBe('info')
    expect(wrapper.find('[data-test="snackbar-text"]').text()).toBe('Info message')
  })

  it('should show warning message', async () => {
    warning('Warning message')
    await nextTick()

    const snackbar = wrapper.find('[data-test="snackbar"]')
    expect(snackbar.exists()).toBe(true)
    expect(snackbar.attributes('data-color')).toBe('warning')
    expect(wrapper.find('[data-test="snackbar-text"]').text()).toBe('Warning message')
  })

  it('should close when close button is clicked', async () => {
    success('Test message')
    await nextTick()

    expect(wrapper.find('[data-test="snackbar"]').exists()).toBe(true)

    await wrapper.find('[data-test="close-btn"]').trigger('click')

    expect(wrapper.find('[data-test="snackbar"]').exists()).toBe(false)
  })

  it('should support custom timeout', async () => {
    success('Test message', 3000)
    await nextTick()

    expect(wrapper.find('[data-test="snackbar"]').attributes('data-timeout')).toBe('3000')
  })
})
