import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { berry, BerryBurst, BRAVIARY, compactNumber, MathUtils } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: BRAVIARY }),
  production: {
    ...mocks.createMockMemberProductionExt().production,
    produceFromSkill: {
      berries: [
        { amount: 100, berry: BRAVIARY.berry, level: 1 },
        { amount: 20, berry: berry.BELUE, level: 1 }
      ],
      ingredients: []
    }
  }
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/berries.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * StrengthService.timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct skill value per proc', () => {
    const skillValuePerProc = wrapper.find('.font-weight-light.text-body-2')
    expect(skillValuePerProc.text()).toBe(`x${mockMember.member.pokemon.skill.amount(mockMember.member.skillLevel)}`)
  })

  it('displays the correct total skill value', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const expectedValue = StrengthService.skillValue({
      skillActivation: BerryBurst.activations.berries,
      amount: mockMember.production.produceFromSkill.berries.reduce(
        (sum, cur) => (sum + cur.berry.name === BRAVIARY.berry.name ? cur.amount : 0),
        0
      ),
      timeWindow: '24H',
      areaBonus: 1
    })
    const expectedTeam = StrengthService.skillValue({
      skillActivation: BerryBurst.activations.berries,
      amount: mockMember.production.produceFromSkill.berries.reduce(
        (sum, cur) => (sum + cur.berry.name !== BRAVIARY.berry.name ? cur.amount : 0),
        0
      ),
      timeWindow: '24H',
      areaBonus: 1
    })
    expect(totalSkillValue.at(0)?.text()).toContain(
      `${compactNumber(expectedValue)} ${BRAVIARY.berry.name.toLowerCase()}`
    )
    expect(totalSkillValue.at(1)?.text()).toContain(`${compactNumber(expectedTeam)} other`)
  })
})
