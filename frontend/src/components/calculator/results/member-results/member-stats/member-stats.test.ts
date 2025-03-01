import MemberStats from '@/components/calculator/results/member-results/member-stats/member-stats.vue'
import SkillDistribution from '@/components/calculator/results/member-results/member-stats/skill-distribution.vue'
import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockMemberProduction, createMockMemberProductionExt, createMockPokemon } from '@/vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockIngredient, mockIngredientSet } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

// Create a dummy production with additional properties: level, ingredient list, and dayPeriod values
const pokemonProduction: MemberProductionExt = createMockMemberProductionExt({
  member: createMockPokemon({
    rp: 100,
    level: 5,
    ingredients: [
      {
        ...mockIngredientSet({
          amount: 2,
          ingredient: mockIngredient({ name: 'Ingredient A' })
        }),
        level: 10
      },
      {
        ...mockIngredientSet({
          amount: 2,
          ingredient: mockIngredient({ name: 'Ingredient A' })
        }),
        level: 30
      }
    ]
  }),
  production: createMockMemberProduction({
    advanced: {
      ...createMockMemberProduction().advanced,
      carrySize: 50,
      dayPeriod: {
        averageFrequency: 120,
        averageEnergy: 3.333,
        spilledIngredients: []
      },
      nightPeriod: {
        averageEnergy: 0,
        averageFrequency: 60,
        spilledIngredients: [mockIngredientSet({ amount: 10, ingredient: mockIngredient({ name: 'Mock Ing' }) })]
      },
      maxFrequency: 3600
    }
  })
})

describe('MemberStats.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders RP correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('RP 100')
  })

  it('renders carry size correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('Carry limit: 50')
  })

  it('renders spilled ingredients correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('spilled')
    expect(wrapper.text()).toContain('10')
  })

  it('renders ingredient image correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const imgs = wrapper.findAll('img')
    // Check that at least one image's src includes the ingredient name (case-insensitive)
    expect(imgs.some((img) => img.attributes('src')?.toLowerCase().includes('mock ing'))).toBe(true)
  })

  it('renders level correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    expect(wrapper.text()).toContain('Level 5')
  })

  it('renders ingredient list correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    // Verify that the "Ingredient list" label appears…
    expect(wrapper.text()).toContain('Ingredient list')
    // …and that each ingredient in the list shows the static value "2"
    const countSpans = wrapper.findAll('span').filter((span) => span.text().trim() === '2')
    expect(countSpans.length).toBe(2)
  })

  it('renders day period values correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const dayCard = wrapper.find('.day-card')
    expect(dayCard.exists()).toBe(true)
    expect(dayCard.text()).toContain('Average Frequency: 02m 00s')
    expect(dayCard.text()).toContain('Average Energy: 3.3')
  })

  it('renders night period values correctly', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const nightCard = wrapper.find('.night-card')
    expect(nightCard.exists()).toBe(true)
    expect(nightCard.text()).toContain('Average Frequency: 01m')
    expect(nightCard.text()).toContain('Average Energy: 0')
  })

  it('does not render spilled ingredients section when none exist', () => {
    // Create a production with no spilled ingredients
    const productionWithoutSpilled: MemberProductionExt = createMockMemberProductionExt({
      member: createMockPokemon({
        rp: 100,
        level: 5,
        ingredients: [
          {
            ...mockIngredientSet({
              amount: 2,
              ingredient: mockIngredient({ name: 'Ingredient A' })
            }),
            level: 10
          }
        ]
      }),
      production: createMockMemberProduction({
        advanced: {
          ...createMockMemberProduction().advanced,
          carrySize: 50,
          dayPeriod: {
            averageFrequency: 120,
            averageEnergy: 3.333,
            spilledIngredients: []
          },
          nightPeriod: {
            averageEnergy: 0,
            averageFrequency: 60,
            spilledIngredients: []
          },
          maxFrequency: 3600
        }
      })
    })
    const wrapper = mount(MemberStats, { props: { pokemonProduction: productionWithoutSpilled } })
    const nightCard = wrapper.find('.night-card')
    expect(nightCard.text()).not.toContain('spilled')
  })
})

describe('MemberStats.vue - Mobile Viewport', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
      useBreakpoint: () => ({ isMobile: true })
    }))
  })

  afterEach(() => {
    vi.resetModules() // Reset the module registry to remove our mock
  })

  it('applies mobile class to SkillDistribution component', () => {
    const wrapper = mount(MemberStats, { props: { pokemonProduction } })
    const skillDistribution = wrapper.findComponent(SkillDistribution)
    expect(skillDistribution.exists()).toBe(true)
    expect(skillDistribution.classes()).toContain('mx-auto')
  })
})
