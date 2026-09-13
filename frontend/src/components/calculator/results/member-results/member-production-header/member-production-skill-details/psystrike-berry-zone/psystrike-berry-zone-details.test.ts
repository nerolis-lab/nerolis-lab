import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { MEWTWO, compactNumber } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const production = mocks.createMockMemberProduction()
const member = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: MEWTWO }),
  production: {
    ...production,
    skillLevel: 3,
    skillValue: {
      ...production.skillValue,
      'berry zone': { amountToSelf: 1.8, amountToTeam: 0 }
    },
    strength: { ...production.strength, skill: { total: 4321, breakdown: { base: 4000, islandBonus: 321 } } }
  }
})

describe('PsystrikeBerryZoneDetails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    useTeamStore().timeWindow = '24H'
    wrapper = mount(MemberProductionSkill, { props: { memberWithProduction: member } })
    await flushPromises()
    await vi.dynamicImportSettled()
  })

  afterEach(() => wrapper.unmount())

  it('loads Psystrike details with the new icon and skill level badge', () => {
    expect(wrapper.findComponent({ name: 'PsystrikeBerryZoneDetails' }).exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('/images/mainskill/psystrike.png')
    expect(wrapper.find('#skillLevelBadge').text()).toBe('Lv.3*')
  })

  it('shows daily adjusted strength and zone percentage from their separate production values', () => {
    expect(wrapper.text()).toContain(`${compactNumber(4321, 'floor')} total`)
    expect(wrapper.get('[data-testid="berry-zone-total"]').text()).toBe('1.8% Berry Zone')
  })

  it('scales both values for the selected eight-hour period', async () => {
    useTeamStore().timeWindow = '8H'
    await flushPromises()
    expect(wrapper.text()).toContain(`${compactNumber(4321 / 3, 'floor')} total`)
    expect(wrapper.get('[data-testid="berry-zone-total"]').text()).toBe('0.6% Berry Zone')
  })
})
