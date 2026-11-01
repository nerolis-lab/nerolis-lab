import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import type { MemberSkillValue } from 'sleepapi-common'
import {
  CookingAdvanceS,
  CookingAdvanceSMysticalFire,
  MISDREAVUS,
  MISMAGIUS,
  MathUtils,
  compactNumber
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: MISMAGIUS })
})

describe('MemberProductionSkill', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(async () => {
    wrapper = mount(MemberProductionSkill, {
      props: {
        memberWithProduction: mockMember
      }
    })
    await flushPromises()
    await vi.dynamicImportSettled()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct skill level', () => {
    const skillLevelBadge = wrapper.find('#skillLevelBadge')
    expect(skillLevelBadge.text()).toBe('Lv.1')
  })

  it('renders the correct skill image', () => {
    const skillImage = wrapper.find('img')
    expect(skillImage.exists()).toBe(true)
    expect(skillImage.attributes('src')).toContain('/images/mainskill/pot.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct pot size and crit values per proc', () => {
    const textLines = wrapper.findAll('.font-weight-light.text-body-2')
    expect(textLines[0].text()).toBe(`x${CookingAdvanceSMysticalFire.activations.potSize.amount({ skillLevel: 1 })}`)
    expect(textLines[1].text()).toBe(
      `+${CookingAdvanceSMysticalFire.activations.critChance.amount({ skillLevel: 1 })}%`
    )
  })

  it('displays the correct total pot size and crit values', () => {
    const totalValues = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center.ml-2')
    const expectedPotSize = mockMember.production.skillValue['pot size'].amountToSelf * timeWindowFactor('24H')
    const expectedCritValue = mockMember.production.skillValue['crit chance'].amountToSelf * timeWindowFactor('24H')

    expect(totalValues[0].text()).toContain(compactNumber(expectedPotSize))
    expect(totalValues[1].text()).toContain(`${compactNumber(expectedCritValue)}%`)
  })

  it('renders while evolving Misdreavus and updates when new results arrive', async () => {
    const member = mocks.createMockPokemon({ pokemon: MISDREAVUS })
    const production = {
      ...mockMember.production,
      skillValue: { 'pot size': { amountToSelf: 14, amountToTeam: 0 } } as MemberSkillValue
    }
    await wrapper.setProps({ memberWithProduction: { member, production } })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('img').attributes('title')).toBe('Cooking Power-Up S')

    // Species changes retain the previous results until recalculation completes; missing totals show zero meanwhile.
    const evolvedMember = { ...member, pokemon: MISMAGIUS }
    await wrapper.setProps({ memberWithProduction: { member: evolvedMember, production } })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('img').attributes('title')).toBe('Mystical Fire (Cooking Advance S)')
    expect(wrapper.text()).toContain('0% crit')

    await wrapper.setProps({
      memberWithProduction: {
        member: evolvedMember,
        production: {
          ...production,
          skillValue: {
            'pot size': { amountToSelf: 21, amountToTeam: 0 },
            'crit chance': { amountToSelf: 3, amountToTeam: 0 }
          } as MemberSkillValue
        }
      }
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.text()).toContain(`${compactNumber(21 * timeWindowFactor('24H'))} pot size`)
    expect(wrapper.text()).toContain(`${compactNumber(3 * timeWindowFactor('24H'))}% crit`)
  })

  it.each([CookingAdvanceS, CookingAdvanceSMysticalFire])('renders $name with no skill activations', async (skill) => {
    await wrapper.setProps({
      memberWithProduction: {
        member: { ...mockMember.member, pokemon: { ...MISMAGIUS, skill } },
        production: { ...mockMember.production, skillProcs: 0, skillValue: {} as MemberSkillValue }
      }
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('#skillLevelBadge').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('NaN')
    if (skill === CookingAdvanceSMysticalFire) {
      expect(wrapper.text()).toContain('0 pot size')
      expect(wrapper.text()).toContain('0% crit')
    } else {
      expect(wrapper.text()).toContain('0 total')
    }
  })
})
