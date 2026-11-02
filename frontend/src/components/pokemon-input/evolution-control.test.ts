import EvolutionControl from '@/components/pokemon-input/evolution-control.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { EEVEE, PIKACHU, RAICHU, VAPOREON } from 'sleepapi-common'
import { afterEach, describe, expect, it } from 'vitest'

describe('EvolutionControl', () => {
  let wrapper: VueWrapper<InstanceType<typeof EvolutionControl>>

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders a devolve button when the species has a previous evolution', () => {
    wrapper = mount(EvolutionControl, {
      props: { direction: 'previous', pokemonInstance: mocks.createMockPokemon({ pokemon: RAICHU }) }
    })

    expect(wrapper.findAll('button').length).toBe(1)
  })

  it('renders no devolve button when the species has no previous evolution', () => {
    wrapper = mount(EvolutionControl, {
      props: { direction: 'previous', pokemonInstance: mocks.createMockPokemon({ pokemon: EEVEE }) }
    })

    expect(wrapper.findAll('button').length).toBe(0)
  })

  it('renders one evolve button per branch when within the inline limit', () => {
    wrapper = mount(EvolutionControl, {
      props: { direction: 'next', pokemonInstance: mocks.createMockPokemon({ pokemon: PIKACHU }) }
    })

    expect(wrapper.findAll('button').length).toBe(1)
  })

  it('renders a single picker trigger when there are more branches than the inline limit', () => {
    wrapper = mount(EvolutionControl, {
      props: { direction: 'next', pokemonInstance: mocks.createMockPokemon({ pokemon: EEVEE }) }
    })

    expect(EEVEE.evolvesInto.length).toBeGreaterThan(2)
    expect(wrapper.findAll('button').length).toBe(1)
    expect(wrapper.text()).not.toContain(VAPOREON.displayName)
  })

  it('emits evolve with a merged pokemon instance when a devolve target is selected', async () => {
    wrapper = mount(EvolutionControl, {
      props: { direction: 'previous', pokemonInstance: mocks.createMockPokemon({ pokemon: RAICHU }) }
    })

    await wrapper.find('button').trigger('click')

    const emitted = wrapper.emitted('evolve')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0][0]).toMatchObject({ pokemon: PIKACHU })
  })
})
