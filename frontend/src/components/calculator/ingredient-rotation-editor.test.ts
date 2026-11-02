import IngredientRotationEditor from './ingredient-rotation-editor.vue'
import IngredientSelection from '@/components/custom-components/input/ingredient-selection/ingredient-selection.vue'
import { mount } from '@vue/test-utils'
import { ingredient } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('ingredient rotation editor', () => {
  it('preserves edited bounds when updating the grid selection and synchronizes row removal', async () => {
    const initial = [{ name: ingredient.FANCY_APPLE.name, minimum: 5, maximum: 20 }]
    const wrapper = mount(IngredientRotationEditor, { props: { initial, alternateExists: false } })
    const grid = wrapper.findComponent(IngredientSelection)
    await wrapper.findAllComponents({ name: 'VTextField' })[0].get('input').setValue('8')
    grid.vm.$emit('updateIngredients', [ingredient.FANCY_APPLE, ingredient.HONEY])
    await nextTick()
    expect(wrapper.findAll('.ingredient-requirement-row')).toHaveLength(2)
    expect(wrapper.findAllComponents({ name: 'VTextField' })[0].props('modelValue')).toBe(8)
    await wrapper.get(`[aria-label="Remove ${ingredient.HONEY.longName}"]`).trigger('click')
    expect(grid.props('preSelectedIngredients')).toEqual([ingredient.FANCY_APPLE])
    await wrapper
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.text() === 'Save')!
      .trigger('click')
    expect(wrapper.emitted('save')![0]).toEqual([[{ ...initial[0], minimum: 8 }]])
    grid.vm.$emit('updateIngredients', [])
    await nextTick()
    expect(wrapper.findAll('.ingredient-requirement-row')).toHaveLength(0)
    expect(initial[0].minimum).toBe(5)
    wrapper.unmount()
  })

  it('edits bounds, rejects invalid values, and saves a separate copy', async () => {
    const initial = [{ name: ingredient.FANCY_APPLE.name, minimum: 5, maximum: 10 }]
    const wrapper = mount(IngredientRotationEditor, { props: { initial, alternateExists: false } })
    const save = () => wrapper.findAllComponents({ name: 'VBtn' }).find((button) => button.text() === 'Save')!
    const minimum = wrapper.get(`input[aria-label="Minimum ${ingredient.FANCY_APPLE.longName}"]`)
    await minimum.setValue('11')
    expect(save().props('disabled')).toBe(true)
    expect(initial[0].minimum).toBe(5)
    await minimum.setValue('8')
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
