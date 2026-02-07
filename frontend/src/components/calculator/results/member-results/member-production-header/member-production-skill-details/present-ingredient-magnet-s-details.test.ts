import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import type { MemberProductionExt } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { DELIBIRD, MathUtils, compactNumber, type MemberSkillValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember: MemberProductionExt = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: DELIBIRD })
})

// Set up candy in skillValue
const skillValue: MemberSkillValue = mockMember.production.skillValue
skillValue.candy = { amountToSelf: 0, amountToTeam: 20 }
mockMember.production.skillValue = skillValue

describe('PresentIngredientMagnetSDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  // Note: This test uses MemberProductionSkill which dynamically loads PresentIngredientMagnetSDetails

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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/ingredients.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * StrengthService.timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct skill value per proc', () => {
    const skillValuePerProcElements = wrapper.findAll('.font-weight-light.text-body-2')
    const skill = mockMember.member.pokemon.skill
    const expectedIngredientValue = skill.activations.ingredients.amount({
      skillLevel: mockMember.member.skillLevel
    })
    expect(skillValuePerProcElements[0].text()).toContain(`x${expectedIngredientValue}`)
  })

  it('displays the correct candy per proc', () => {
    const candyPerProcElements = wrapper.findAll('.font-weight-light.text-body-2')
    const expectedCandyValue = 4
    expect(candyPerProcElements[1].text()).toContain(`x${expectedCandyValue}`)

    // Verify candy image is present
    const candyImages = wrapper.findAll('img[alt="candy"]')
    expect(candyImages.length).toBeGreaterThan(0)
  })

  it('displays the correct total skill value', () => {
    const totalSkillValueElements = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const skill = mockMember.member.pokemon.skill
    const expectedValue = StrengthService.skillValue({
      skillActivation: skill.activations.ingredients,
      amount: mockMember.production.skillAmount,
      timeWindow: '24H',
      areaBonus: 1
    })
    expect(totalSkillValueElements[0].text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct total candy value', () => {
    const totalCandyElements = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const expectedTotalCandy = mockMember.production.skillValue.candy?.amountToTeam ?? 0
    expect(totalCandyElements[1].text()).toContain(compactNumber(expectedTotalCandy))
  })
})
