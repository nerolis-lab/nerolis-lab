import AdvancedSettings from '@/components/calculator/team-settings/advanced-settings/advanced-settings.vue'
import { useTeamStore } from '@/stores/team/team-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry, ingredient } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('AdvancedMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof AdvancedSettings>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(AdvancedSettings, { attachTo: document.body })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  it('renders initial layout correctly', async () => {
    expect(wrapper.vm.advancedMenu).toBe(false)
    await wrapper.find('button[aria-label="advanced settings"]').trigger('click')

    expect(wrapper.vm.advancedMenu).toBe(true)
    expect(document.querySelector('.v-dialog')).toBeTruthy()
    expect(document.querySelector('.v-card-title')?.textContent).toBe('Advanced Settings')
  })

  it('loads stockpile from team on button click', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.stockpiledIngredients = [
      { name: ingredient.BEAN_SAUSAGE.name, amount: 5 },
      { name: ingredient.FANCY_APPLE.name, amount: 5 }
    ]
    teamStore.getCurrentTeam.stockpiledBerries = [{ amount: 5, level: 0, name: berry.BELUE.name }]
    await nextTick()

    const loadStockpileBtn = wrapper.find('button[aria-label="advanced settings"]')
    await loadStockpileBtn.trigger('click')

    expect(wrapper.vm.stockpiledIngredients.length).toBe(2)
    expect(wrapper.vm.stockpiledIngredients[0].ingredient.name).toBe(ingredient.BEAN_SAUSAGE.name)
    expect(wrapper.vm.stockpiledBerries.length).toBe(1)
    expect(wrapper.vm.stockpiledBerries[0].berry.name).toBe(berry.BELUE.name)
  })

  it('disables save button when fields are invalid', async () => {
    await wrapper.find('button[aria-label="advanced settings"]').trigger('click')

    wrapper.setData({
      stockpiledIngredients: [
        { ingredient: { name: 'Tomato' }, amount: -1 } // Invalid negative value
      ]
    })
    await nextTick()

    expect(wrapper.vm.isSaveDisabled).toBe(true)
    const saveButton = document.querySelector('#saveButton') as HTMLButtonElement
    expect(saveButton.disabled).toBe(true)
  })

  it('validates ingredient amount rules correctly', async () => {
    wrapper.setData({
      stockpiledIngredients: [
        { ingredient: { name: 'Tomato' }, amount: 11000 } // Over maximum
      ]
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isSaveDisabled).toBe(true)
  })

  it('emits save event with correct data', async () => {
    await wrapper.find('button[aria-label="advanced settings"]').trigger('click')

    wrapper.setData({
      stockpiledIngredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 5 }],
      stockpiledBerries: [{ berry: berry.BELUE, amount: 3, level: 2 }]
    })

    await nextTick()

    const saveButton = document.querySelector('#saveButton') as HTMLButtonElement
    expect(saveButton).not.toBeNull()
    saveButton.click()
    await nextTick()

    expect(wrapper.emitted('save')![0]).toMatchInlineSnapshot(`
      [
        {
          "berries": [
            {
              "amount": 3,
              "level": 2,
              "name": "BELUE",
            },
          ],
          "ingredients": [
            {
              "amount": 5,
              "name": "Sausage",
            },
          ],
        },
      ]
    `)
  })
})
