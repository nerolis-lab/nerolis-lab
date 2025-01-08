<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Neroli's Lab open beta</v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
          <v-row>
            <v-col cols="12" class="flex-center"> Welcome to the open beta of Neroli's Lab! </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap">Info</v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" class="flex-center flex-column mx-2">
              <span
                >Neroli's Lab is the evolution of Sleep API we've been working on very hard since early 2024. The beta
                version of Neroli's Lab is still missing two main features from Sleep API; team finder and tier
                lists—these are under construction and will be finished before the site's full release.
              </span>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap">Support</v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" class="flex-center flex-column mx-2">
              <span
                >Please join us on Discord to report any feedback, suggestions, or issues you're having with the site.
                <a class="discord" href="https://discord.gg/ndzTXRHWzK">Join us on Discord</a>
              </span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12"> </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
