import TeamName from '@/components/calculator/team-name.vue'
import { useTeamStore } from '@/stores/team/team-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('TeamSlotName', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamName>>

  beforeEach(() => {
    wrapper = mount(TeamName)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays team name correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.loadingTeams = false
    teamStore.teams[0].name = 'Team 1'
    wrapper = mount(TeamName)

    const teamNameSpan = teamStore.getCurrentTeam.name
    expect(teamNameSpan).toBe('Team 1')
  })

  it('updates team name correctly when input changes', async () => {
    const teamStore = useTeamStore()
    teamStore.loadingTeams = false
    teamStore.teams[0].name = 'Old Team Name'
    wrapper = mount(TeamName)

    const input = wrapper.find('input')
    await input.setValue('New Team Name')

    expect(teamStore.getCurrentTeam.name).toBe('New Team Name')
    wrapper.vm.updateTeamName()
    expect(teamStore.getCurrentTeam.name).toBe('New Team Name')
  })
  it('restricts input value length to maxTeamNameLength', async () => {
    const teamStore = useTeamStore()
    teamStore.loadingTeams = false
    teamStore.teams[0].name = 'Short Name'
    wrapper = mount(TeamName)

    const input = wrapper.find('input')
    const longName = 'A'.repeat(wrapper.vm.maxTeamNameLength + 1)
    await input.setValue(longName)
    await input.trigger('blur')

    expect(teamStore.getCurrentTeam.name.length).toBe(wrapper.vm.maxTeamNameLength)
  })
})
