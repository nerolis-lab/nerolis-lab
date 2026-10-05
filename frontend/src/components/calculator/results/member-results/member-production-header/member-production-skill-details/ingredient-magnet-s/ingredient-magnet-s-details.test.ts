import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { MathUtils, VAPOREON, VENUSAUR, DELIBIRD, PLUSLE, type MemberSkillValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: VAPOREON })
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

  it.each([VENUSAUR, DELIBIRD, PLUSLE])(
    'shows zero ingredient totals for $name without a skill trigger',
    async (pokemon) => {
      const member = mocks.createMockPokemon({ pokemon })
      await wrapper.setProps({
        memberWithProduction: mocks.createMockMemberWithProduction({
          member,
          production: mocks.createMockMemberProduction(
            {
              skillProcs: 0,
              skillValue: {} as MemberSkillValue,
              produceFromSkill: { berries: [], ingredients: [] }
            },
            member
          )
        })
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      expect(wrapper.text()).toContain('0 of each ing')
      expect(wrapper.text()).toContain(pokemon === PLUSLE ? '0 random' : '0 total')
      expect(wrapper.text()).not.toContain('NaN')
    }
  )

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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/ingredients.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })
})
