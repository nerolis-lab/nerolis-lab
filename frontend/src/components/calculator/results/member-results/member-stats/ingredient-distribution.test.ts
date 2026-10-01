import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IngredientDistribution from './ingredient-distribution.vue'
import { mocks } from '@/vitest'

describe('IngredientDistribution', () => {
  function createWrapper(
    ingredientDistributions: Record<string, Record<number, number>> = {
      Egg: { 0: 75, 20: 25 },
      Herb: { 10: 100 }
    }
  ) {
    const pokemonProduction = mocks.createMockMemberWithProduction({
      production: mocks.createMockMemberProduction({
        advanced: {
          ...mocks.createMockMemberProduction().advanced,
          ingredientDistributions,
          nonSignificantIngredientAverage: 3.5
        }
      })
    })
    return mount(IngredientDistribution, {
      props: { pokemonProduction },
      global: {
        stubs: {
          VDialog: {
            name: 'VDialog',
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<div><slot name="activator" :props="{}" /><slot /></div>'
          }
        }
      }
    })
  }
  it('shows checkboxes, curves, sprite indicators and the other-ingredient average', () => {
    const wrapper = createWrapper()
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2)
    expect(wrapper.findAll('path')).toHaveLength(2)
    expect(wrapper.findAll('svg image')).toHaveLength(2)
    expect(wrapper.text()).toContain('Other ingredients: 3.5')
    expect(wrapper.find('path').attributes('aria-label')).toContain('Average: 5')
    wrapper.unmount()
  })
  it('toggles curves and shows observed statistics in the selected mode', async () => {
    const wrapper = createWrapper()
    await wrapper.find('path').trigger('mouseenter')
    expect(wrapper.find('[role="tooltip"]').text()).toContain('-2 stddev')
    const averagePosition = parseFloat((wrapper.find('[role=tooltip]').element as HTMLElement).style.left)
    const median = wrapper.findAll('button').find((button) => button.text() === 'Median')!
    await median.trigger('click')
    expect(wrapper.find('[role="tooltip"]').text()).toContain('1st quartile')
    const medianPosition = parseFloat((wrapper.find('[role=tooltip]').element as HTMLElement).style.left)
    expect(medianPosition).toBeLessThan(averagePosition)
    expect(wrapper.find('[role="tooltip"]').text()).not.toContain('stddev')
    await wrapper.find('input[type="checkbox"]').setValue(false)
    expect(wrapper.findAll('path')).toHaveLength(1)
    expect(wrapper.find('[role="tooltip"]').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
  it('keeps the same tooltip mounted while switching curves for smooth movement', async () => {
    const wrapper = createWrapper()
    const paths = wrapper.findAll('path')
    await paths[0].trigger('mouseenter')
    const tooltip = wrapper.find('[role="tooltip"]').element
    await paths[0].trigger('mouseleave')
    await paths[1].trigger('mouseenter')
    expect(wrapper.find('[role="tooltip"]').element).toBe(tooltip)
    expect(wrapper.find('[role="tooltip"]').text()).toContain('Herb')
    expect(wrapper.find('[role="tooltip"]').classes()).toContain('visible')
    wrapper.unmount()
  })
  it('defaults to the three highest averages and restores that selection on every opening', async () => {
    const wrapper = createWrapper({
      Egg: { 0: 90, 100: 10 },
      Herb: { 30: 100 },
      Cacao: { 20: 100 },
      Potato: { 15: 100 },
      Ginger: { 1: 100 }
    })
    const checkedNames = () =>
      wrapper
        .findAll('input[type="checkbox"]')
        .filter((input) => (input.element as HTMLInputElement).checked)
        .map((input) => input.attributes('value'))
    expect(checkedNames()).toEqual(['Herb', 'Cacao', 'Potato'])
    expect(wrapper.findAll('path')).toHaveLength(3)
    // All significant ingredients stay available, and hidden distributions still set the shared range.
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(5)
    expect(wrapper.findAll('svg text').map((text) => text.text())).toContain('100')
    const dialog = wrapper.findComponent({ name: 'VDialog' })
    dialog.vm.$emit('update:modelValue', true)
    await wrapper.vm.$nextTick()
    await wrapper.find('input[value="Egg"]').setValue(true)
    expect(wrapper.findAll('path')).toHaveLength(4)
    dialog.vm.$emit('update:modelValue', false)
    await wrapper.vm.$nextTick()
    dialog.vm.$emit('update:modelValue', true)
    await wrapper.vm.$nextTick()
    expect(checkedNames()).toEqual(['Herb', 'Cacao', 'Potato'])
    expect(wrapper.findAll('path')).toHaveLength(3)
    wrapper.unmount()
  })
})
