<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4 heading">
            <v-col cols="12" class="flex-center text-h4"> Neroli's Lab open beta</v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
          <v-row dense>
            <v-col cols="12" class="flex-column opener px-4">
              Welcome to the open beta of Neroli's Lab! Since the site is still under development, you may find bugs or
              incomplete features.
              <v-img class="bug" src="/images/pokemon/grubbin.png" height="137" width="150"></v-img>
            </v-col>
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
            <v-col cols="12" class="flex-center flex-column px-4">
              Neroli's Lab is the evolution of Sleep API. The beta version of Neroli's Lab is still missing two main
              features from Sleep API: team finder and tier lists—these are under construction and will be finished
              before the site's full release.
              <v-img src="/images/beta/gurdurr.png" height="120" width="120"></v-img>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="flex-center flex-column px-4">
              To take advantage of our biggest new feature, saving your teams and Pokemon across devices, log in by
              clicking the Pokeball in the upper-right corner of the screen.
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
            <v-col cols="12" class="flex-center flex-column px-4">
              <span>
                We'd love to hear your feedback! You can report any suggestions or issues you're having with the site at
                <a class="simple" href="https://feedback.nerolislab.com" target="_blank" rel="noopener noreferrer">
                  <span>our feedback website</span>
                  <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
                </a>
                and vote to help us pick which features to work on next.
              </span>
              <v-img class="bug" src="/images/pokemon/caterpie.png" height="91" width="100"></v-img>
            </v-col>
            <v-col cols="12" class="flex-center flex-column px-4">
              <span>
                You can also
                <a
                  class="discord simple"
                  href="https://discord.gg/ndzTXRHWzK"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>join us on Discord</span>
                  <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
                </a>
                to discuss and get regular updates about Neroli's Lab and Pokemon Sleep.
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

<style lang="scss" scoped>
.heading {
  margin: -12px 0 !important;
}

.opener {
  padding-top: 16px;
  display: flex;

  .bug {
    align-self: center;
    margin-top: -35px;
    margin-bottom: -20px;
  }
}
</style>
