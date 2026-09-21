import IngredientRotationEditor from './ingredient-rotation-editor.vue'
import { mount } from '@vue/test-utils'
import { ingredient } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

describe('ingredient rotation editor', () => {
  it('edits bounds, rejects invalid values, and saves a separate copy', async () => {
    const initial = [{ name: ingredient.FANCY_APPLE.name, minimum: 5, maximum: 10 }]
    const wrapper = mount(IngredientRotationEditor, { props: { initial, alternateExists: false } })
    const save = () => wrapper.findAllComponents({ name: 'VBtn' }).find((button) => button.text() === 'Save')!
    const minimum = wrapper
      .findAllComponents({ name: 'VTextField' })
      .find((field) => field.props('label') === 'Minimum')!
    await minimum.get('input').setValue('11')
    expect(save().props('disabled')).toBe(true)
    expect(initial[0].minimum).toBe(5)
    await minimum.get('input').setValue('8')
    await save().trigger('click')
    expect(wrapper.emitted('save')![0]).toEqual([[{ ...initial[0], minimum: 8 }]])
    wrapper.unmount()
  })

  it('allows one alternate and prevents creating a second', async () => {
    const wrapper = mount(IngredientRotationEditor, { props: { initial: [], alternateExists: true } })
    const save = () => wrapper.findAllComponents({ name: 'VBtn' }).find((button) => button.text() === 'Save')!
    expect(save().props('disabled')).toBe(true)
    await wrapper.setProps({ alternateExists: false })
    await save().trigger('click')
    expect(wrapper.emitted('save')![0]).toEqual([[]])
    wrapper.unmount()
  })
})
