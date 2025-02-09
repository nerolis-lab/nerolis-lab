import Divider from '@/components/custom-components/divider/divider.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('Divider', () => {
  it('renders correctly', () => {
    const wrapper = mount(Divider)

    // Check if the divider is present
    const vDivider = wrapper.find('hr.v-divider')
    expect(vDivider.exists()).toBe(true)

    // Check if it is within a centered row
    const vRow = wrapper.find('div.v-row.flex-center')
    expect(vRow.exists()).toBe(true)

    // Check if column has correct classes
    const vCol = wrapper.find('div.v-col.v-col-12.flex-center')
    expect(vCol.exists()).toBe(true)
  })
})
