import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-header/member-production-berry.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { GENGAR, MathUtils, berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: GENGAR }),
  production: {
    ...mocks.createMockMemberProductionExt().production,
    produceWithoutSkill: {
      berries: [{ amount: 20, berry: berry.BLUK, level: 1 }],
      ingredients: []
    }
  }
})

describe('MemberProductionBerry', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionBerry>>

  beforeEach(() => {
    wrapper = mount(MemberProductionBerry, {
      props: {
        memberWithProduction: mockMember
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct berry image', () => {
    const berryImg = wrapper.find('img')
    expect(berryImg.attributes('src')).toBe(berryImage(mockMember.production.produceWithoutSkill.berries[0].berry))
  })

  it('displays the correct berry amount', () => {
    const amountSpan = wrapper.find('span.font-weight-medium')
    const timeWindowFactor = StrengthService.timeWindowFactor(useTeamStore().timeWindow)
    expect(amountSpan.text()).toBe(
      `x${MathUtils.round(mockMember.production.produceWithoutSkill.berries[0].amount * timeWindowFactor, 1)}`
    )
  })

  it('displays the correct berry strength', () => {
    const strengthSpan = wrapper.findAll('span.font-weight-medium').at(1)
    const teamStore = useTeamStore()
    const currentBerryStrength = StrengthService.berryStrength({
      favoredBerries: teamStore.getCurrentTeam.favoredBerries,
      berries: mockMember.production.produceWithoutSkill.berries,
      timeWindow: teamStore.timeWindow,
      areaBonus: 1
    })
    expect(strengthSpan?.text()).toBe(`${currentBerryStrength}`)
  })
})
