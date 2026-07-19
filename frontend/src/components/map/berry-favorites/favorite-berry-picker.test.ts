import FavoriteBerryPicker from '@/components/map/berry-favorites/favorite-berry-picker.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry, capitalize } from 'sleepapi-common'
import { afterEach, describe, expect, it } from 'vitest'

const sortedBerries = berry.BERRIES.slice().sort((a, b) => a.name.localeCompare(b.name))
const [berryA, berryB, berryC, berryD] = sortedBerries.map((b) => b.name)

type PickerWrapper = VueWrapper<InstanceType<typeof FavoriteBerryPicker>>

const mountPicker = (main = '', subs: string[] = []): PickerWrapper =>
  mount(FavoriteBerryPicker, {
    props: { berries: sortedBerries, main, subs }
  })

const gridChip = (wrapper: PickerWrapper, name: string) => wrapper.find(`[aria-label="picks-${name.toLowerCase()}"]`)

const starButton = (wrapper: PickerWrapper, name: string) =>
  wrapper.find(`button[aria-label="star-${name.toLowerCase()}"]`)

const removeButton = (wrapper: PickerWrapper, name: string) =>
  wrapper.find(`button[aria-label="remove-${name.toLowerCase()}"]`)

const clearButton = (wrapper: PickerWrapper) => wrapper.find('button[aria-label="clear favorite berries"]')

const placeholderLabels = (wrapper: PickerWrapper) => wrapper.findAll('.pick-empty').map((slot) => slot.text())

describe('FavoriteBerryPicker', () => {
  let wrapper: PickerWrapper

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    wrapper = mountPicker()
    expect(wrapper.exists()).toBe(true)
  })

  describe('hint', () => {
    it('prompts for 3 picks when nothing is selected', () => {
      wrapper = mountPicker()
      expect(wrapper.find('.hint').text()).toBe('Pick 3 favorite berries')
    })

    it('counts down remaining picks', () => {
      wrapper = mountPicker(berryA, [berryB])
      expect(wrapper.find('.hint').text()).toBe('Pick 1 more')
    })

    it('explains starring when all picks are made', () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      expect(wrapper.find('.hint').text()).toBe('Tap a pick to star it as your main favorite')
    })
  })

  describe('placeholder slots', () => {
    it('labels empty slots Main, Sub, Sub when nothing is picked', () => {
      wrapper = mountPicker()
      expect(placeholderLabels(wrapper)).toEqual(['Main', 'Sub', 'Sub'])
    })

    it('labels remaining slots Sub once a main is picked', () => {
      wrapper = mountPicker(berryA)
      expect(placeholderLabels(wrapper)).toEqual(['Sub', 'Sub'])
    })

    it('labels the empty slot Main when subs exist without a main', () => {
      wrapper = mountPicker('', [berryA, berryB])
      expect(placeholderLabels(wrapper)).toEqual(['Main'])
    })
  })

  describe('grid picking', () => {
    it('makes the first pick the main favorite', async () => {
      wrapper = mountPicker()
      await gridChip(wrapper, berryA).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([[berryA]])
      expect(wrapper.emitted('update:subs')).toBeFalsy()
    })

    it('adds later picks as subs', async () => {
      wrapper = mountPicker(berryA)
      await gridChip(wrapper, berryB).trigger('click')

      expect(wrapper.emitted('update:main')).toBeFalsy()
      expect(wrapper.emitted('update:subs')).toEqual([[[berryB]]])
    })

    it('ignores new picks when 3 berries are already picked', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      await gridChip(wrapper, berryD).trigger('click')

      expect(wrapper.emitted('update:main')).toBeFalsy()
      expect(wrapper.emitted('update:subs')).toBeFalsy()
      expect(gridChip(wrapper, berryD).classes()).not.toContain('bg-primary')
    })

    it('unpicks the main when its chip is toggled', async () => {
      wrapper = mountPicker(berryA, [berryB])
      await gridChip(wrapper, berryA).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([['']])
    })

    it('unpicks a sub when its chip is toggled', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      await gridChip(wrapper, berryB).trigger('click')

      expect(wrapper.emitted('update:subs')).toEqual([[[berryC]]])
    })

    it('highlights picked chips and badges the main in the grid', () => {
      wrapper = mountPicker(berryA, [berryB])

      expect(gridChip(wrapper, berryA).classes()).toContain('bg-primary')
      expect(gridChip(wrapper, berryB).classes()).toContain('bg-primary')
      expect(gridChip(wrapper, berryC).classes()).not.toContain('bg-primary')
      expect(gridChip(wrapper, berryA).find('.berry-badge').exists()).toBe(true)
      expect(gridChip(wrapper, berryB).find('.berry-badge').exists()).toBe(false)
    })
  })

  describe('starring', () => {
    it('shows the starred pick as solid primary and subs as surface', () => {
      wrapper = mountPicker(berryA, [berryB])

      expect(starButton(wrapper, berryA).classes()).toContain('bg-primary')
      expect(starButton(wrapper, berryB).classes()).toContain('bg-surface')
    })

    it('swaps a starred sub with the current main', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      await starButton(wrapper, berryB).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([[berryB]])
      expect(wrapper.emitted('update:subs')).toEqual([[[berryA, berryC]]])
    })

    it('promotes a sub to main when no main exists', async () => {
      wrapper = mountPicker('', [berryA, berryB])
      await starButton(wrapper, berryA).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([[berryA]])
      expect(wrapper.emitted('update:subs')).toEqual([[[berryB]]])
    })

    it('does nothing when the main is starred again', async () => {
      wrapper = mountPicker(berryA, [berryB])
      await starButton(wrapper, berryA).trigger('click')

      expect(wrapper.emitted('update:main')).toBeFalsy()
      expect(wrapper.emitted('update:subs')).toBeFalsy()
    })

    it('keeps the display order stable when the main changes', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      expect(wrapper.findAll('.pick-name').map((n) => n.text())).toEqual([berryA, berryB, berryC].map(capitalize))

      await wrapper.setProps({ main: berryB, subs: [berryA, berryC] })
      expect(wrapper.findAll('.pick-name').map((n) => n.text())).toEqual([berryA, berryB, berryC].map(capitalize))
      expect(starButton(wrapper, berryB).attributes('aria-pressed')).toBe('true')
      expect(starButton(wrapper, berryA).attributes('aria-pressed')).toBe('false')
    })
  })

  describe('removing', () => {
    it('removes the main with its remove button', async () => {
      wrapper = mountPicker(berryA, [berryB])
      await removeButton(wrapper, berryA).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([['']])
      expect(wrapper.emitted('update:subs')).toBeFalsy()
    })

    it('removes a sub with its remove button', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      await removeButton(wrapper, berryC).trigger('click')

      expect(wrapper.emitted('update:main')).toBeFalsy()
      expect(wrapper.emitted('update:subs')).toEqual([[[berryB]]])
    })
  })

  describe('clearing', () => {
    it('hides the clear button when nothing is picked', () => {
      wrapper = mountPicker()
      expect(clearButton(wrapper).exists()).toBe(false)
    })

    it('clears both main and subs', async () => {
      wrapper = mountPicker(berryA, [berryB, berryC])
      await clearButton(wrapper).trigger('click')

      expect(wrapper.emitted('update:main')).toEqual([['']])
      expect(wrapper.emitted('update:subs')).toEqual([[[]]])
    })
  })
})
