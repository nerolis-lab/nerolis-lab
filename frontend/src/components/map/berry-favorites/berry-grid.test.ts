import BerryGrid from '@/components/map/berry-favorites/berry-grid.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const sortedBerries = berry.BERRIES.slice().sort((a, b) => a.name.localeCompare(b.name))

const chip = (wrapper: VueWrapper<InstanceType<typeof BerryGrid>>, name: string, prefix = 'berry') =>
  wrapper.find(`[aria-label="${prefix}-${name.toLowerCase()}"]`)

describe('BerryGrid', () => {
  let wrapper: VueWrapper<InstanceType<typeof BerryGrid>>

  beforeEach(() => {
    wrapper = mount(BerryGrid, {
      props: {
        berries: sortedBerries,
        selection: []
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders one chip per berry', () => {
    expect(wrapper.findAll('.v-chip')).toHaveLength(sortedBerries.length)
  })

  it('labels chips with the default aria prefix', () => {
    expect(chip(wrapper, sortedBerries[0].name).exists()).toBe(true)
  })

  it('labels chips with a custom aria prefix', async () => {
    await wrapper.setProps({ ariaPrefix: 'picks' })
    expect(chip(wrapper, sortedBerries[0].name, 'picks').exists()).toBe(true)
  })

  it('emits toggle with the clicked berry', async () => {
    const target = sortedBerries[3]
    await chip(wrapper, target.name).trigger('click')

    const emitted = wrapper.emitted('toggle')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(target)
  })

  it('does not highlight a clicked chip unless the parent adds it to the selection', async () => {
    const target = sortedBerries[3]
    await chip(wrapper, target.name).trigger('click')

    expect(chip(wrapper, target.name).classes()).not.toContain('bg-primary')
  })

  it('marks selected berries with the bg-primary selected class', async () => {
    const selected = sortedBerries[0]
    const unselected = sortedBerries[1]
    await wrapper.setProps({ selection: [selected.name] })

    expect(chip(wrapper, selected.name).classes()).toContain('bg-primary')
    expect(chip(wrapper, unselected.name).classes()).not.toContain('bg-primary')
  })

  it('shows the star badge only on the main berry', async () => {
    const main = sortedBerries[0]
    const sub = sortedBerries[1]
    await wrapper.setProps({ selection: [main.name, sub.name], main: main.name })

    expect(chip(wrapper, main.name).find('.berry-badge').exists()).toBe(true)
    expect(chip(wrapper, sub.name).find('.berry-badge').exists()).toBe(false)
  })
})
