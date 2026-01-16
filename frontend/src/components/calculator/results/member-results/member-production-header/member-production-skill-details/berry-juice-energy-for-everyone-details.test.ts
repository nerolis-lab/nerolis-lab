import { StrengthService } from '@/services/strength/strength-service'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { EnergyForEveryoneBerryJuice, MathUtils, compactNumber, commonMocks } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import BerryJuiceEnergyForEveryoneDetails from './berry-juice-energy-for-everyone-details.vue'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({
    pokemon: commonMocks.mockPokemon({ skill: EnergyForEveryoneBerryJuice }),
    skillLevel: 6
  })
})

describe('BerryJuiceEnergyForEveryoneDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof BerryJuiceEnergyForEveryoneDetails>>
  let teamStore: ReturnType<typeof useTeamStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { members: [mockMember.member.externalId] })

    wrapper = mount(BerryJuiceEnergyForEveryoneDetails, {
      props: {
        memberWithProduction: mockMember
      }
    })
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct skill level', () => {
    const skillLevelBadge = wrapper.find('#skillLevelBadge')
    expect(skillLevelBadge.text()).toBe('Lv.6')
  })

  it('renders the correct skill image', () => {
    const skillImage = wrapper.find('img')
    expect(skillImage.exists()).toBe(true)
    expect(skillImage.attributes('src')).toContain('/images/mainskill/energy.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.num-skill-procs')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * StrengthService.timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct energy per proc', () => {
    const skillValuePerProc = wrapper.find('.energy-per-proc')
    expect(skillValuePerProc.text()).toBe(
      `x${EnergyForEveryoneBerryJuice.activations.energy.amount({ skillLevel: mockMember.member.skillLevel })}`
    )
  })

  it('displays the correct juice per proc', () => {
    const skillValuePerProc = wrapper.find('.juice-per-proc')
    const juicePerSuccess = EnergyForEveryoneBerryJuice.activations.juice.amount()
    const juicePercent = EnergyForEveryoneBerryJuice.juicePercent
    expect(skillValuePerProc.text()).toBe(`x${juicePerSuccess * juicePercent}`)
  })

  it('displays the correct total energy value', () => {
    const totalEnergyValue = wrapper.find('.energy-total')
    const expectedValue = StrengthService.skillValue({
      skillActivation: EnergyForEveryoneBerryJuice.activations.energy,
      amount: mockMember.production.skillValue.energy.amountToTeam,
      timeWindow: '24H',
      areaBonus: 1
    })
    expect(totalEnergyValue.text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct total energy value', () => {
    const totalEnergyValue = wrapper.find('.juice-total')
    const juiceAmount = mockMember.production.skillValue.items.amountToSelf
    const roundedAmount = MathUtils.round(juiceAmount, 2)
    expect(totalEnergyValue.text()).toContain(compactNumber(roundedAmount))
  })
})
