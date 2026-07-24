<template>
  <v-container style="max-width: 800px">
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" class="pb-4 frosted-glass">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Credits </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="px-6">
              <p class="text-center">
                Neroli's Lab wouldn't exist without the people who built it, tested it, and shared what they know along
                the way. We want to thank everyone here for their time, resources, expertise, and support in making
                Neroli's Lab a reality.
              </p>
            </v-col>
          </v-row>

          <v-row v-for="section in creditSections" :key="section.category" class="category">
            <v-col cols="12">
              <v-row class="flex-center px-2">
                <v-col>
                  <v-divider />
                </v-col>
                <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6">{{ section.category }}</v-col>
                <v-col>
                  <v-divider />
                </v-col>
              </v-row>

              <v-row dense class="flex-column px-8">
                <v-col v-for="entry in section.entries" :key="entry.name" class="flex-column entry">
                  <span class="font-weight-bold">{{ entry.name }}</span>
                  <span class="info pl-4">{{ entry.role }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface CreditEntry {
  name: string
  role: string
}

interface CreditSection {
  category: string
  entries: CreditEntry[]
}

export default defineComponent({
  name: 'CreditsPage',
  data: (): { creditSections: CreditSection[] } => ({
    creditSections: [
      {
        category: 'Core Team',
        entries: [
          {
            name: 'Webby Wisp',
            role: "Founder & lead maintainer: built both Sleep API and Neroli's Lab from the ground up!"
          },
          { name: 'Abunzu', role: 'QA & game mechanics: provides extensive testing and mechanics insight.' },
          {
            name: '3geek14',
            role: 'Mathematics & development: drives much of the codebase and turns math into reality.'
          },
          { name: 'Losningen', role: 'Infrastructure & development: keeps the servers running and contributes code.' },
          {
            name: 'tindo',
            role: 'User experience & development: shapes the look and feel of the site and contributes code.'
          }
        ]
      },
      {
        category: 'Research & Data',
        entries: [
          {
            name: 'Raenonx',
            role: "Datamining & resources: shares game data, graphics, and other resources that make Neroli's Lab possible."
          },
          {
            name: 'Goobliss',
            role: 'Research & reverse engineering: uncovered the RP formula and Pokémon stats that power many of our calculations.'
          },
          {
            name: 'Nitoyon',
            role: 'Research: shares valuable game mechanics research with the community.'
          },
          {
            name: 'the Pokémon Sleep community',
            role: 'Data & research: contributes the data, testing, and discoveries that help us better understand the game.'
          }
        ]
      },
      {
        category: 'Community',
        entries: [
          {
            name: 'Patreon supporters',
            role: "Thank you to our Patreon Supporters who help cover the costs of running the servers that bring you Neroli's Lab."
          },
          {
            name: 'Open Source Contributors',
            role: "Every bug fix, feature, and contribution helps make Neroli's Lab better."
          }
        ]
      }
    ]
  })
})
</script>
