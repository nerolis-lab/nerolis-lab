import NavBar from '@/components/nav-bar/nav-bar.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { VApp } from 'vuetify/components'

describe('nav-bar', () => {
  it('includes a guides navigation item that points to /guides/', () => {
    const wrapper = mount(
      defineComponent({
        components: { NavBar, VApp },
        template: '<VApp><NavBar /></VApp>'
      })
    )
    const html = wrapper.html()

    expect(html).toContain('Guides')
    expect(html).toContain('/guides/')
  })
})
