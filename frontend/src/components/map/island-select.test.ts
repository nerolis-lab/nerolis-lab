import IslandSelect from '@/components/map/island-select.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry, CYAN, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('IslandSelect', () => {
  let wrapper: VueWrapper<InstanceType<typeof IslandSelect>>

  beforeEach(() => {
    wrapper = mount(IslandSelect, {
      props: {
        previousBerries: []
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('opens the dialog when the button is clicked', async () => {
    const button = wrapper.find('button')
    expect(wrapper.vm.menu).toBe(false)

    await button.trigger('click')
    expect(wrapper.vm.menu).toBe(true)
  })

  it('selects cyan berries when Cyan button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const ggButton = document.querySelector('[aria-label="greengrass"]') as HTMLElement
    expect(ggButton).not.toBeNull()
    ggButton.click()

    expect(wrapper.vm.favoredBerries).toEqual([])
  })

  it('selects cyan berries when Cyan button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const cyanButton = document.querySelector('[aria-label="cyan"]') as HTMLElement
    expect(cyanButton).not.toBeNull()
    cyanButton.click()

    expect(wrapper.vm.favoredBerries).toEqual(CYAN.berries)
  })

  it('selects taupe berries when Taupe button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="taupe"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.favoredBerries).toEqual(TAUPE.berries)
  })

  it('selects snowdrop berries when Snowdrop button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="snowdrop"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.favoredBerries).toEqual(SNOWDROP.berries)
  })

  it('selects lapis berries when Lapis button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="lapis"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.favoredBerries).toEqual(LAPIS.berries)
  })

  it('selects power plant berries when Power plant button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="powerplant"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.favoredBerries).toEqual(POWER_PLANT.berries)
  })

  it('toggles a berry correctly', async () => {
    wrapper.vm.menu = true
    await wrapper.vm.$nextTick()

    const testBerry = berry.BERRIES[0]
    const berryChip = document.querySelector(`.v-chip `) as HTMLElement
    expect(berryChip).not.toBeNull()

    berryChip.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.favoredBerries.map((s) => s.name)).toContain(testBerry.name)

    berryChip.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.favoredBerries.map((s) => s.name)).not.toContain(testBerry.name)
  })

  it('clears all selected berries when the clear button is clicked', async () => {
    wrapper.vm.menu = true
    wrapper.vm.favoredBerries = CYAN.berries
    await wrapper.vm.$nextTick()

    const clearButton = document.querySelector('button[aria-label="clear button"]') as HTMLElement
    expect(clearButton).not.toBeNull()

    clearButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.favoredBerries).toEqual([])
  })

  it('selects all berries when the all button is clicked', async () => {
    wrapper.vm.menu = true
    wrapper.vm.favoredBerries = CYAN.berries
    await wrapper.vm.$nextTick()

    const allButton = document.querySelector('button[aria-label="select all button"]') as HTMLElement
    expect(allButton).not.toBeNull()

    allButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.favoredBerries).toEqual(berry.BERRIES)
  })

  it('saves the dialog when the save button is clicked', async () => {
    wrapper.vm.menu = true
    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('button[aria-label="save button"]')
    expect(closeButton).not.toBeNull()

    closeButton?.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menu).toBe(false)
    expect(wrapper.emitted('favored-berries')).toBeTruthy()
  })
})
