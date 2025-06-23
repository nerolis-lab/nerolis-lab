import HomePage from '@/pages/home-page.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import 'vuetify/styles'

describe('HomePage.vue', () => {
  it('should contain the correct title text', () => {
    const wrapper = mount(HomePage)

    const title = wrapper.find('h1.title')
    expect(title.text()).toBe("Neroli's Lab")
  })

  it('should contain the correct description text', () => {
    const wrapper = mount(HomePage)

    const description = wrapper.find('p')
    expect(description.text()).toBe('Helping you overthink sleep tracking.')
  })

  it('should contain the correct feature titles and descriptions', () => {
    const wrapper = mount(HomePage)

    const featureCards = wrapper.findAll('.feature-card')
    const featureTitles = featureCards.map((card) => card.find('h3'))
    const featureDescriptions = featureCards.map((card) => card.find('p.mb-2'))

    const expectedFeatures = [
      {
        title: 'Calculator',
        description: "Calculate your team's or pokemon's production with our realistic Sleep API-powered simulations.",
        enabled: true
      },
      {
        title: 'Compare',
        description: 'Compare your Pokémon to each other before deciding on your investments.',
        enabled: true
      },
      {
        title: 'Tier lists',
        description: 'Cooking tier lists based on millions of simulated recipe solutions.',
        enabled: true
      }
    ]

    expectedFeatures.forEach((feature, index) => {
      expect(featureTitles[index].text()).toBe(feature.title)
      expect(featureDescriptions[index].text()).toBe(feature.description)

      const cardHtml = featureCards[index].html()
      expect(cardHtml.includes('disabled')).toBe(!feature.enabled)
    })
  })
})
