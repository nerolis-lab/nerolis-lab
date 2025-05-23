import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-header/member-production-berry.vue'
import MemberProductionHeader from '@/components/calculator/results/member-results/member-production-header/member-production-header.vue'
import MemberProductionIngredient from '@/components/calculator/results/member-results/member-production-header/member-production-ingredient.vue'
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberProductionExt()

describe('MemberProductionHeader', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionHeader>>

  beforeEach(() => {
    wrapper = mount(MemberProductionHeader, {
      props: {
        member: mockMember
      },
      global: {
        stubs: {
          MemberProductionBerry: true,
          MemberProductionIngredient: true,
          MemberProductionSkill: true
        }
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

  it('renders the MemberProductionBerry component', () => {
    const berryComponent = wrapper.findComponent(MemberProductionBerry)
    expect(berryComponent.exists()).toBe(true)
  })

  it('renders the MemberProductionIngredient component', () => {
    const ingredientComponent = wrapper.findComponent(MemberProductionIngredient)
    expect(ingredientComponent.exists()).toBe(true)
  })

  it('renders the MemberProductionSkill component', () => {
    const skillComponent = wrapper.findComponent(MemberProductionSkill)
    expect(skillComponent.exists()).toBe(true)
  })
})
