import CarrySizeButton from '@/components/pokemon-input/carry-size-button.vue'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { commonMocks, subskill, type Pokemon, type PokemonInstanceExt, type SubskillInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CarrySizeButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof CarrySizeButton>>

  const initialPokemon = {
    pokemon: commonMocks.mockPokemon(), //base carry size 0
    carrySize: 0,
    level: 50,
    subskills: [] as SubskillInstanceExt[]
  } as PokemonInstanceExt

  const venusaur = {
    name: 'Venusaur',
    carrySize: 15,
    previousEvolutions: 2
  } as Pokemon

  beforeEach(() => {
    wrapper = mount(CarrySizeButton, {
      props: {
        memberIndex: 0,
        pokemonInstance: {
          ...initialPokemon,
          pokemon: venusaur,
          carrySize: 20,
          subskills: [{ level: 10, subskill: subskill.INVENTORY_S }],
          ribbon: 2
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays calculated actual carry size on the button', async () => {
    expect(wrapper.text()).toContain('Carry size 29')
  })

  it('displays value added by subskills in the menu', async () => {
    await wrapper.setData({ menu: true })
    const firstDetails = document.querySelector('.carry-size-card .carry-details:first-of-type')
    expect(firstDetails!.textContent).toContain('+6 from subskills')
  })

  it('displays value added by subskills in the menu', async () => {
    await wrapper.setData({ menu: true })
    const firstDetails = document.querySelector('.carry-size-card .carry-details:last-of-type')
    expect(firstDetails!.textContent).toContain('+3 from ribbon')
  })

  it('displays carry size options correctly in the list', async () => {
    await wrapper.setData({ menu: true })
    const buttons = Array.from(document.querySelectorAll('.times-evolved-toggle button') as NodeListOf<HTMLElement>)
    const buttonTexts = buttons.map((button) => button.textContent)

    expect(buttonTexts).toEqual(['0', '1', '2'])
  })

  it('updates carry limit when an option is selected', async () => {
    await wrapper.setData({ menu: true })
    const buttons = document.querySelectorAll('.times-evolved-toggle button') as NodeListOf<HTMLElement>
    buttons[0].click()
    await flushPromises()

    expect(wrapper.emitted('update-carry')).toBeTruthy()
    expect(wrapper.emitted('update-carry')!.at(-1)).toEqual([venusaur.carrySize])
  })

  it('closes the menu when times evolved is selected', async () => {
    await wrapper.setData({ menu: true })
    const buttons = document.querySelectorAll('.times-evolved-toggle button') as NodeListOf<HTMLElement>
    buttons[2].click()
    await flushPromises()

    expect(wrapper.vm.$data.menu).toBe(false)
  })
  it('updates carry limit and selected evolutions the first time a pokemon is set', async () => {
    wrapper = mount(CarrySizeButton, {
      props: {
        memberIndex: 0,
        pokemonInstance: {
          ...initialPokemon,
          pokemon: venusaur,
          carrySize: 20
        }
      }
    })

    expect(wrapper.vm.$data.selectedEvolutions).toBe(1)
  })
})
