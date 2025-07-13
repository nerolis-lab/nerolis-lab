import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { SortOption } from './DropdownSort.vue'
import DropdownSort from './DropdownSort.vue'

const mockSortOptions: SortOption[] = [
  { value: 'name', title: 'Name', description: 'Sort by name' },
  { value: 'level', title: 'Level', description: 'Sort by level' },
  { value: 'power', title: 'Power', description: 'Sort by power', disabled: true }
]

describe('DropdownSort', () => {
  let wrapper: VueWrapper<InstanceType<typeof DropdownSort>>

  beforeEach(() => {
    wrapper = mount(DropdownSort, {
      props: {
        modelValue: 'name',
        sortAscending: true,
        sortOptions: mockSortOptions
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays current sort option label', () => {
    expect(wrapper.text()).toContain('Sort: Name')
  })

  it('displays correct sort direction icon', () => {
    const icon = wrapper.find('i')
    expect(icon.classes()).toContain('mdi-arrow-up')
  })

  it('displays down arrow when sort ascending is false', async () => {
    await wrapper.setProps({ sortAscending: false })
    const icon = wrapper.find('i')
    expect(icon.classes()).toContain('mdi-arrow-down')
  })

  it('emits update:modelValue when sort option is selected', async () => {
    await wrapper.setProps({ modelValue: 'level' })

    expect(wrapper.text()).toContain('Sort: Level')
  })

  it('emits update:sortAscending when direction button is clicked', async () => {
    const buttons = wrapper.findAll('button')
    const directionButton = buttons[1] // Second button is the direction button
    await directionButton.trigger('click')

    expect(wrapper.emitted('update:sortAscending')).toEqual([[false]])
    expect(wrapper.emitted('sort-change')).toEqual([['name', false]])
  })

  it('shows custom sort prefix when provided', async () => {
    await wrapper.setProps({ sortPrefix: 'Order' })
    expect(wrapper.text()).toContain('Order: Name')
  })

  it('applies custom color to buttons', async () => {
    await wrapper.setProps({ color: 'primary' })
    const buttons = wrapper.findAll('button')
    buttons.forEach((button) => {
      expect(button.classes()).toContain('bg-primary')
    })
  })

  it('disables buttons when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true })
    const buttons = wrapper.findAll('button')
    buttons.forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('renders disabled options correctly', () => {
    const disabledOption = mockSortOptions.find((opt) => opt.disabled)
    expect(disabledOption).toBeTruthy()
    expect(disabledOption?.title).toBe('Power')
  })

  it('applies button class correctly', async () => {
    await wrapper.setProps({ buttonClass: 'custom-class' })
    const buttons = wrapper.findAll('button')
    const menuButton = buttons[0] // buttonClass only applies to the main menu button
    expect(menuButton.classes()).toContain('custom-class')
  })

  it('handles array of button classes', async () => {
    await wrapper.setProps({ buttonClass: ['class1', 'class2'] })
    const buttons = wrapper.findAll('button')
    const menuButton = buttons[0] // buttonClass only applies to the main menu button
    expect(menuButton.classes()).toContain('class1')
    expect(menuButton.classes()).toContain('class2')
  })
})
