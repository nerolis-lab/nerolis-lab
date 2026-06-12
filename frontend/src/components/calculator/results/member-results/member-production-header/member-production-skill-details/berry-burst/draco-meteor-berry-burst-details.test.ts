import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { berry, compactNumber, LATIOS, MathUtils } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: LATIOS }),
  production: {
    ...mocks.createMockMemberProductionExt().production,
    produceFromSkill: {
      berries: [
        { amount: 217.5334637964775, berry: LATIOS.berry, level: 1 },
        { amount: 42.7, berry: berry.ORAN, level: 1 }
      ],
      ingredients: []
    }
  }
})

describe('DracoMeteorBerryBurstDetails', () => {
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

  it('displays rounded self berry totals from produceFromSkill', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const factor = timeWindowFactor('24H')
    const selfAmount =
      mockMember.production.produceFromSkill.berries.find(
        (b) => b.berry.name === LATIOS.berry.name && b.level === mockMember.member.level
      )?.amount ?? 0

    expect(totalSkillValue.at(0)?.text()).toContain(
      `${compactNumber(MathUtils.round(selfAmount * factor, 1))} ${LATIOS.berry.name.toLowerCase()}`
    )
  })

  it('displays rounded team berry totals from produceFromSkill', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const factor = timeWindowFactor('24H')
    const teamAmount = mockMember.production.produceFromSkill.berries.reduce((sum, cur) => {
      return sum + (cur.berry.name === LATIOS.berry.name && cur.level === mockMember.member.level ? 0 : cur.amount)
    }, 0)

    expect(totalSkillValue.at(1)?.text()).toContain(`${compactNumber(MathUtils.round(teamAmount * factor, 1))} other`)
  })
})
