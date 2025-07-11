import CompareSlot from '@/components/compare/compare-slot.vue'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { subskill, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('CompareSlot', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareSlot>>
  let dialogStore: ReturnType<typeof useDialogStore>

  const pokemonInstance = mocks.createMockPokemon({
    name: 'Ash',
    subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }],
    rp: 674
  })

  beforeEach(() => {
    dialogStore = useDialogStore()
    wrapper = mount(CompareSlot, {
      props: {
        pokemonInstance
      }
    })
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.vertical-text').text()).toBe('Ash')
    expect(wrapper.find('[data-testid="pokemon-image"]').attributes('src')).toBe(
      `/images/pokemon/${pokemonInstance.pokemon.name.toLowerCase()}.png`
    )
    expect(wrapper.find('.text-x-small').text()).toBe('RP 674')
  })

  it('computed properties return correct values', () => {
    expect(wrapper.vm.imageUrl).toBe(`/images/pokemon/${pokemonInstance.pokemon.name.toLowerCase()}.png`)
    expect(wrapper.vm.level).toBe('Level 10')
    expect(wrapper.vm.rpBadge).toBe('RP 674')
  })

  it('openDialog method opens slot actions dialog', async () => {
    expect(dialogStore.slotActionsDialog).toBe(false)
    await wrapper.find('.v-card').trigger('click')
    expect(dialogStore.slotActionsDialog).toBe(true)
  })

  it('emits edit-pokemon event when onUpdate callback is triggered', async () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = {
      ...pokemonInstance,
      name: 'New Name'
    }
    await wrapper.find('.v-card').trigger('click')

    if (dialogStore.slotActionsProps.onUpdate) {
      dialogStore.slotActionsProps.onUpdate(mockPokemonInstanceExt)
    }

    expect(wrapper.emitted('edit-pokemon')).toBeTruthy()
    expect(wrapper.emitted('edit-pokemon')![0][0]).toEqual(mockPokemonInstanceExt)
  })

  it('emits duplicate-pokemon event when onDuplicate callback is triggered', async () => {
    await wrapper.find('.v-card').trigger('click')

    if (dialogStore.slotActionsProps.onDuplicate) {
      dialogStore.slotActionsProps.onDuplicate()
    }

    expect(wrapper.emitted('duplicate-pokemon')).toBeTruthy()
    expect(wrapper.emitted('duplicate-pokemon')![0][0]).toEqual(pokemonInstance)
  })

  it('emits remove-pokemon event when onRemove callback is triggered', async () => {
    await wrapper.find('.v-card').trigger('click')

    if (dialogStore.slotActionsProps.onRemove) {
      dialogStore.slotActionsProps.onRemove()
    }

    expect(wrapper.emitted('remove-pokemon')).toBeTruthy()
    expect(wrapper.emitted('remove-pokemon')![0][0]).toEqual(pokemonInstance)
  })

  it('opens slot actions dialog when card is clicked', async () => {
    expect(dialogStore.slotActionsDialog).toBe(false)
    await wrapper.find('.v-card').trigger('click')
    expect(dialogStore.slotActionsDialog).toBe(true)
  })
})
