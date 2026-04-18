import IslandSelect from '@/components/map/island-select.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import {
  berry,
  CYAN,
  DEFAULT_ISLAND,
  GREENGRASS,
  GREENGRASS_EXPERT,
  LAPIS,
  POWER_PLANT,
  SNOWDROP,
  TAUPE,
  type IslandInstance
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('IslandSelect', () => {
  let wrapper: VueWrapper<InstanceType<typeof IslandSelect>>

  beforeEach(() => {
    wrapper = mount(IslandSelect, {
      props: {
        previousIsland: DEFAULT_ISLAND
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

    expect(wrapper.vm.island).toEqual({ ...GREENGRASS, areaBonus: 0 })
  })

  it('selects cyan berries when Cyan button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const cyanButton = document.querySelector('[aria-label="cyan"]') as HTMLElement
    expect(cyanButton).not.toBeNull()
    cyanButton.click()

    expect(wrapper.vm.island).toEqual({ ...CYAN, areaBonus: 0 })
  })

  it('selects taupe berries when Taupe button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="taupe"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.island).toEqual({ ...TAUPE, areaBonus: 0 })
  })

  it('selects snowdrop berries when Snowdrop button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="snowdrop"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.island).toEqual({ ...SNOWDROP, areaBonus: 0 })
  })

  it('selects lapis berries when Lapis button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="lapis"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.island).toEqual({ ...LAPIS, areaBonus: 0 })
  })

  it('selects power plant berries when Power plant button is clicked', async () => {
    wrapper.vm.menu = true // Open the dialog
    await wrapper.vm.$nextTick()

    const button = document.querySelector('[aria-label="powerplant"]') as HTMLElement
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.island).toEqual({ ...POWER_PLANT, areaBonus: 0 })
  })

  it('toggles a berry correctly', async () => {
    wrapper.vm.menu = true
    await wrapper.vm.$nextTick()

    const testBerry = berry.BERRIES.slice().sort((a, b) => a.name.localeCompare(b.name))[0]
    const berryChip = document.querySelector(`.v-chip `) as HTMLElement
    expect(berryChip).not.toBeNull()

    berryChip.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.island.berries.map((s) => s.name)).toContain(testBerry.name)

    berryChip.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.island.berries.map((s) => s.name)).not.toContain(testBerry.name)
  })

  it('clears all selected berries when the clear button is clicked', async () => {
    wrapper.vm.menu = true
    wrapper.vm.island = { ...CYAN, areaBonus: 0 }
    await wrapper.vm.$nextTick()

    const clearButton = document.querySelector('button[aria-label="clear button"]') as HTMLElement
    expect(clearButton).not.toBeNull()

    clearButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.island.berries).toEqual([])
  })

  it('selects all berries when the all button is clicked', async () => {
    wrapper.vm.menu = true
    wrapper.vm.island = { ...CYAN, areaBonus: 0 }
    await wrapper.vm.$nextTick()

    const allButton = document.querySelector('button[aria-label="select all button"]') as HTMLElement
    expect(allButton).not.toBeNull()

    allButton.click()
    await wrapper.vm.$nextTick()

    const sortedNames = berry.BERRIES.slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((b) => b.name)
    expect(wrapper.vm.island.berries.map((b) => b.name)).toEqual(sortedNames)
  })

  it('saves the dialog when the save button is clicked', async () => {
    wrapper.vm.menu = true
    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('button[aria-label="save button"]')
    expect(closeButton).not.toBeNull()

    closeButton?.dispatchEvent(new Event('click'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menu).toBe(false)
    expect(wrapper.emitted('update-island')).toBeTruthy()
  })

  it('updates the selected island when the previousIsland prop changes', async () => {
    const newIsland = { ...CYAN, areaBonus: 0 }

    await wrapper.setProps({ previousIsland: newIsland })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.island).toEqual(newIsland)
    expect(wrapper.vm.island.shortName).toBe(CYAN.shortName)
  })

  describe('Expert Mode', () => {
    const sortedBerries = berry.BERRIES.slice().sort((a, b) => a.name.localeCompare(b.name))

    const mountWithExpertIsland = () => {
      const expertIsland: IslandInstance = { ...GREENGRASS_EXPERT, areaBonus: 0 }
      return mount(IslandSelect, {
        props: { previousIsland: expertIsland }
      })
    }

    it('exposes both base and expert islands as selectable', () => {
      const shortNames = wrapper.vm.selectableIslands.map((i) => i.shortName)
      expect(shortNames).toContain(GREENGRASS.shortName)
      expect(shortNames).toContain(GREENGRASS_EXPERT.shortName)
    })

    it('is not expert when initialized with a base island', () => {
      expect(wrapper.vm.isExpertIsland).toBe(false)
    })

    it('becomes expert when the GGEX island is selected and populates defaults', () => {
      const expertIsland: IslandInstance = { ...GREENGRASS_EXPERT, areaBonus: 0 }
      wrapper.vm.selectIsland(expertIsland)

      expect(wrapper.vm.isExpertIsland).toBe(true)
      expect(wrapper.vm.island.expertMode).toBeDefined()
      expect(wrapper.vm.island.expertMode?.mainFavoriteBerry).toBeDefined()
      expect(wrapper.vm.island.expertMode?.subFavoriteBerries).toEqual([])
      expect(wrapper.vm.island.expertMode?.randomBonus).toBe('ingredient')
    })

    it('clears expertMode when switching back to a non-expert island', () => {
      wrapper.vm.selectIsland({ ...GREENGRASS_EXPERT, areaBonus: 0 })
      expect(wrapper.vm.island.expertMode).toBeDefined()

      wrapper.vm.selectIsland({ ...CYAN, areaBonus: 0 })
      expect(wrapper.vm.isExpertIsland).toBe(false)
      expect(wrapper.vm.island.expertMode).toBeUndefined()
    })

    it('selects a main favorite berry', () => {
      const expertWrapper = mountWithExpertIsland()
      const target = sortedBerries[2]

      expertWrapper.vm.selectMainFavoriteBerry(target.name)

      expect(expertWrapper.vm.island.expertMode?.mainFavoriteBerry.name).toBe(target.name)
      expect(expertWrapper.vm.mainFavoriteBerry).toBe(target.name)
      expertWrapper.unmount()
    })

    it('selecting a main favorite berry removes it from sub favorites', () => {
      const expertWrapper = mountWithExpertIsland()
      // Pick a distinct main first so subs can include any of the earlier berries
      const neutralMain = sortedBerries[sortedBerries.length - 1]
      expertWrapper.vm.selectMainFavoriteBerry(neutralMain.name)

      const a = sortedBerries[0]
      const b = sortedBerries[1]

      expertWrapper.vm.selectSubFavoriteBerries([a.name, b.name])
      expect(expertWrapper.vm.subFavoriteBerries).toEqual([a.name, b.name])

      expertWrapper.vm.selectMainFavoriteBerry(a.name)
      expect(expertWrapper.vm.island.expertMode?.mainFavoriteBerry.name).toBe(a.name)
      expect(expertWrapper.vm.subFavoriteBerries).toEqual([b.name])
      expertWrapper.unmount()
    })

    it('selects sub favorite berries and filters out the main berry', () => {
      const expertWrapper = mountWithExpertIsland()
      const main = expertWrapper.vm.island.expertMode?.mainFavoriteBerry.name
      expect(main).toBeDefined()

      const others = sortedBerries.filter((b) => b.name !== main).slice(0, 3)
      expertWrapper.vm.selectSubFavoriteBerries([main!, ...others.map((b) => b.name)])

      expect(expertWrapper.vm.subFavoriteBerries).not.toContain(main)
      expect(expertWrapper.vm.subFavoriteBerries).toEqual(others.map((b) => b.name))
      expertWrapper.unmount()
    })

    it('sets the weekly random bonus', () => {
      const expertWrapper = mountWithExpertIsland()

      expertWrapper.vm.selectRandomBonus('berry')
      expect(expertWrapper.vm.randomBonus).toBe('berry')
      expect(expertWrapper.vm.island.expertMode?.randomBonus).toBe('berry')

      expertWrapper.vm.selectRandomBonus('skill')
      expect(expertWrapper.vm.island.expertMode?.randomBonus).toBe('skill')
      expertWrapper.unmount()
    })

    it('ignores invalid random bonus values', () => {
      const expertWrapper = mountWithExpertIsland()
      expertWrapper.vm.selectRandomBonus('invalid')
      expect(expertWrapper.vm.island.expertMode?.randomBonus).toBe('ingredient')
      expertWrapper.unmount()
    })

    it('save emits an island whose berries include the main and sub favorites', () => {
      const expertWrapper = mountWithExpertIsland()
      const main = sortedBerries[0]
      const sub1 = sortedBerries[1]
      const sub2 = sortedBerries[2]

      expertWrapper.vm.selectMainFavoriteBerry(main.name)
      expertWrapper.vm.selectSubFavoriteBerries([sub1.name, sub2.name])
      expertWrapper.vm.selectRandomBonus('skill')
      expertWrapper.vm.saveBerries()

      const emitted = expertWrapper.emitted('update-island')
      expect(emitted).toBeTruthy()
      const emittedIsland = emitted![0][0] as IslandInstance
      expect(emittedIsland.expertMode?.mainFavoriteBerry.name).toBe(main.name)
      expect(emittedIsland.expertMode?.subFavoriteBerries.map((b) => b.name)).toEqual([sub1.name, sub2.name])
      expect(emittedIsland.expertMode?.randomBonus).toBe('skill')
      expect(emittedIsland.berries.map((b) => b.name)).toEqual([main.name, sub1.name, sub2.name])
      expect(expertWrapper.vm.menu).toBe(false)
      expertWrapper.unmount()
    })

    describe('Expert Mode toggle', () => {
      it('starts with the toggle off when mounted with a base island', () => {
        expect(wrapper.vm.expertToggle).toBe(false)
        expect(wrapper.vm.isExpertIsland).toBe(false)
      })

      it('starts with the toggle on when mounted with an expert island', () => {
        const expertWrapper = mountWithExpertIsland()
        expect(expertWrapper.vm.expertToggle).toBe(true)
        expect(expertWrapper.vm.isExpertIsland).toBe(true)
        expertWrapper.unmount()
      })

      it('only displays base islands when toggle is off', () => {
        expect(wrapper.vm.expertToggle).toBe(false)
        expect(wrapper.vm.displayedIslands.every((i) => !i.expert)).toBe(true)
      })

      it('only displays expert islands when toggle is on', () => {
        const expertWrapper = mountWithExpertIsland()
        expect(expertWrapper.vm.displayedIslands.every((i) => i.expert)).toBe(true)
        expect(expertWrapper.vm.displayedIslands.length).toBeGreaterThan(0)
        expertWrapper.unmount()
      })

      it('switches to the paired expert island when toggling on from a base island with an expert pair', () => {
        // Start on GREENGRASS (has GGEX pair)
        wrapper.vm.selectIsland({ ...GREENGRASS, areaBonus: 0 })
        expect(wrapper.vm.isExpertIsland).toBe(false)

        wrapper.vm.onExpertToggle(true)

        expect(wrapper.vm.isExpertIsland).toBe(true)
        expect(wrapper.vm.island.shortName).toBe(GREENGRASS_EXPERT.shortName)
      })

      it('switches to the first expert island when toggling on from a base island without a paired expert', () => {
        wrapper.vm.selectIsland({ ...CYAN, areaBonus: 0 })
        expect(wrapper.vm.isExpertIsland).toBe(false)

        wrapper.vm.onExpertToggle(true)

        expect(wrapper.vm.isExpertIsland).toBe(true)
        // Only one expert island currently exists, so it should be selected
        expect(wrapper.vm.island.shortName).toBe(GREENGRASS_EXPERT.shortName)
      })

      it('switches back to the base island of the current expert when toggling off', () => {
        const expertWrapper = mountWithExpertIsland()
        expect(expertWrapper.vm.isExpertIsland).toBe(true)

        expertWrapper.vm.onExpertToggle(false)

        expect(expertWrapper.vm.isExpertIsland).toBe(false)
        expect(expertWrapper.vm.island.shortName).toBe(GREENGRASS.shortName)
        expertWrapper.unmount()
      })
    })

    describe('Expert bonus hints', () => {
      it('exposes hint text for each random bonus option', () => {
        const options = wrapper.vm.RANDOM_BONUS_OPTIONS
        const values = options.map((o) => o.value).sort()
        expect(values).toEqual(['berry', 'ingredient', 'skill'])
        expect(options.every((o) => o.hint.length > 0)).toBe(true)
      })
    })
  })
})
