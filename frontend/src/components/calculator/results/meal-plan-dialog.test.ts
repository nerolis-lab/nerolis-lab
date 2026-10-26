import MealPlanDialog from './meal-plan-dialog.vue'
import RecipeTableMobile from '@/components/recipe/recipe-table-mobile.vue'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { calculateRecipeValue, commonMocks } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('meal plan recipe selection', () => {
  let wrapper: VueWrapper<InstanceType<typeof MealPlanDialog>>

  beforeEach(async () => {
    useUserStore().setInitialLoginData(commonMocks.loginResponse())
    vi.spyOn(UserService, 'getRecipes').mockResolvedValue({})
    vi.spyOn(UserService, 'upsertRecipe').mockImplementation(async (recipe, level) => ({ recipe, level }))
    wrapper = mount(MealPlanDialog, { props: { modelValue: true, meal: 'breakfast' }, attachTo: document.body })
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('selects a recipe from the shared recipe cards', async () => {
    const cards = wrapper.findComponent(RecipeTableMobile)
    const recipe = cards.props('recipes')[0]
    await cards.find('.recipe-card').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[{ kind: 'recipe', recipe: recipe.name, fallbackToBest: true }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('saves the fallback preference without closing and restores each meal preference', async () => {
    const recipe = wrapper.findComponent(RecipeTableMobile).props('recipes')[0]
    const choice = { kind: 'recipe' as const, recipe: recipe.name }
    await wrapper.setProps({ choice })
    const checkbox = wrapper.findComponent({ name: 'VCheckbox' }).find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    await checkbox.setValue(false)
    expect(wrapper.emitted('update:choice')).toEqual([[{ ...choice, fallbackToBest: false }]])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ choice: { ...choice, fallbackToBest: false }, modelValue: false })
    await wrapper.setProps({ modelValue: true })
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    await wrapper.setProps({ meal: 'lunch', choice })
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('includes an unchecked preference when selecting a new recipe', async () => {
    await wrapper.findComponent({ name: 'VCheckbox' }).find('input[type="checkbox"]').setValue(false)
    const cards = wrapper.findComponent(RecipeTableMobile)
    await cards.find('.recipe-card').trigger('click')
    expect(wrapper.emitted('select')).toEqual([
      [{ kind: 'recipe', recipe: cards.props('recipes')[0].name, fallbackToBest: false }]
    ])
  })

  it('saves recipe levels and updates strength without selecting a meal', async () => {
    const cards = wrapper.findComponent(RecipeTableMobile)
    const recipe = cards.props('recipes')[0]
    const input = cards.find('.recipe-level input')
    await input.trigger('click')
    await input.setValue('10')
    await input.trigger('keyup', { key: 'Enter' })
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 550))
    await flushPromises()
    expect(UserService.upsertRecipe).toHaveBeenCalledWith(recipe.name, 10)
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(cards.props('recipes').find((item) => item.name === recipe.name)).toMatchObject({
      level: 10,
      userStrength: calculateRecipeValue({ bonus: recipe.bonus, ingredients: recipe.ingredients, level: 10 })
    })
  })
})
