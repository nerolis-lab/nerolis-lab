import MemberStats from '@/components/calculator/results/member-results/member-stats/member-stats.vue'
import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockMemberProduction, createMockMemberProductionExt, createMockPokemon } from '@/vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockIngredient, mockIngredientSet } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

describe('MemberStats.vue', () => {
  const pokemonProduction: MemberProductionExt = createMockMemberProductionExt({
    member: createMockPokemon({ rp: 100 }),
    production: createMockMemberProduction({
      advanced: {
        ...createMockMemberProduction().advanced,
        carrySize: 50,
        spilledIngredients: [mockIngredientSet({ amount: 10, ingredient: mockIngredient({ name: 'Mock Ing' }) })],
        maxFrequency: 3600
      }
    })
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders RP correctly', () => {
    const wrapper = mount(MemberStats, {
      props: { pokemonProduction }
    })
    expect(wrapper.text()).toContain('RP 100')
  })

  it('renders carry size correctly', () => {
    const wrapper = mount(MemberStats, {
      props: { pokemonProduction }
    })
    expect(wrapper.text()).toContain('Carry limit: 50')
  })

  it('renders max frequency correctly', () => {
    const wrapper = mount(MemberStats, {
      props: { pokemonProduction }
    })
    expect(wrapper.text()).toContain('Max frequency: 01h 00m 00s')
  })

  it('renders spilled ingredients correctly', () => {
    const wrapper = mount(MemberStats, {
      props: { pokemonProduction }
    })
    expect(wrapper.text()).toContain('Spilled ingredients:')
    expect(wrapper.text()).toContain('10')
  })

  it('renders ingredient image correctly', () => {
    const wrapper = mount(MemberStats, {
      props: { pokemonProduction }
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('mock ing')
  })
})
