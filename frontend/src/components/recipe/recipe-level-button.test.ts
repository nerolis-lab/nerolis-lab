import RecipeLevelEditor from '@/components/recipe/recipe-level-button.vue'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    upsertRecipe: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('@/composables/highlight-text/use-highlight-text', () => ({
  useHighlightText: () => ({ highlightText: vi.fn() })
}))

describe('RecipeLevelEditor', () => {
  let wrapper: VueWrapper<InstanceType<typeof RecipeLevelEditor>>

  beforeEach(() => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    wrapper = mount(RecipeLevelEditor, {
      props: {
        modelValue: 5,
        recipeName: 'Test Recipe'
      }
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('updates localLevel when modelValue changes', async () => {
    await wrapper.setProps({ modelValue: 10 })
    expect(wrapper.vm.localLevel).toBe(10)
  })

  it('emits update:modelValue when value changes', async () => {
    const input = wrapper.find('input')
    await input.setValue('8')
    await input.trigger('blur')

    await new Promise((resolve) => setTimeout(resolve, 550))

    expect(wrapper.emitted('updateLevel')).toBeTruthy()
    expect(wrapper.emitted('updateLevel')![0][0]).toBe(8)
  })

  it('calls UserService.upsertRecipe on blur and updates level', async () => {
    const input = wrapper.find('input')
    await input.setValue('7')
    await input.trigger('blur')

    await new Promise((resolve) => setTimeout(resolve, 550))

    expect(UserService.upsertRecipe).toHaveBeenCalledWith('Test Recipe', 7)
    expect(wrapper.emitted('updateLevel')).toBeTruthy()
    expect(wrapper.emitted('updateLevel')![0][0]).toBe(7)
  })

  it('displays loading state during API call', async () => {
    const input = wrapper.find('input')
    await input.setValue('6')
    const blurPromise = input.trigger('blur')

    expect(wrapper.vm.loading).toBe(true)
    await blurPromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('reverts to original value if API update fails', async () => {
    UserService.upsertRecipe = vi.fn().mockRejectedValueOnce(new Error('Update failed'))
    const input = wrapper.find('input')
    await input.setValue('9')
    await input.trigger('blur')

    expect(wrapper.vm.localLevel).toBe(5)
  })
})
