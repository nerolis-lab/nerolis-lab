import { mount } from '@vue/test-utils'
import type { User } from 'sleepapi-common'
import { Roles } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import UserAdminOptions from './UserAdminOptions.vue'

const vuetify = createVuetify({
  components,
  directives
})

if (typeof global.ResizeObserver === 'undefined') {
  const ResizeObserverModule = await import('resize-observer-polyfill')
  global.ResizeObserver = ResizeObserverModule.default
}

describe('UserAdminOptions', () => {
  const mockUser: User = {
    external_id: '1',
    name: 'testuser',
    friend_code: '123456',
    role: Roles.Default,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }

  it('renders with initial friend code', () => {
    const wrapper = mount(UserAdminOptions, {
      props: {
        user: mockUser,
        saveFunction: vi.fn()
      },
      global: {
        plugins: [vuetify]
      }
    })

    const textField = wrapper.find('input[type="text"]')
    expect((textField.element as HTMLInputElement).value).toBe('123456')
  })

  it('enables save button when friend code is changed and valid', async () => {
    const wrapper = mount(UserAdminOptions, {
      props: {
        user: mockUser,
        saveFunction: vi.fn()
      },
      global: {
        plugins: [vuetify]
      }
    })

    const textField = wrapper.find('input[type="text"]')
    await textField.setValue('654321')

    const saveButton = wrapper.find('button')
    expect(saveButton.attributes('disabled')).toBeUndefined()
  })

  it('disables save button when friend code is invalid', async () => {
    const wrapper = mount(UserAdminOptions, {
      props: {
        user: mockUser,
        saveFunction: vi.fn()
      },
      global: {
        plugins: [vuetify]
      }
    })

    const textField = wrapper.find('input[type="text"]')
    await textField.setValue('123')

    const saveButton = wrapper.find('button')
    expect(saveButton.attributes('disabled')).toBeDefined()
  })

  it('calls saveFunction on save button click', async () => {
    const saveFunction = vi.fn()
    const wrapper = mount(UserAdminOptions, {
      props: {
        user: mockUser,
        saveFunction
      },
      global: {
        plugins: [vuetify]
      }
    })

    const textField = wrapper.find('input[type="text"]')
    await textField.setValue('654321')

    const saveButton = wrapper.find('button')
    await saveButton.trigger('click')

    expect(saveFunction).toHaveBeenCalledWith({
      ...mockUser,
      friend_code: '654321'
    })
  })
})
