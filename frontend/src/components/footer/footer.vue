<template>
  <v-footer class="footer flex-center">
    <div class="link-container">
      <a class="simple" href="https://feedback.nerolislab.com" target="_blank" rel="noopener noreferrer">
        <v-icon class="icon" icon="mdi-forum"></v-icon>
        <span>Feedback</span>
        <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
      </a>
      <a class="simple" href="https://github.com/nerolis-lab/nerolis-lab" target="_blank" rel="noopener noreferrer">
        <GithubIcon class="icon"></GithubIcon>
        <span>GitHub</span>
        <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
      </a>
      <a class="simple" href="https://discord.gg/ndzTXRHWzK" target="_blank" rel="noopener noreferrer">
        <DiscordIcon class="icon"></DiscordIcon>
        <span>Discord</span>
        <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
      </a>
    </div>
  </v-footer>
</template>

<script lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GithubIcon from '@/components/icons/icon-github.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TheFooter',
  components: { DiscordIcon, GithubIcon }
})
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 20px;
  background: none;
  border-top: 1px solid $secondary;
  @media (min-width: 360px) {
    max-height: 50px;
    margin: 0 -10px;
  }

  @media (min-width: 400px) {
    margin: unset;
  }

  .link-container {
    flex-grow: 1;
    max-width: 800px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;

    @media (min-width: 360px) {
      flex-wrap: nowrap;
      flex-direction: row;
    }

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      min-height: 35px;

      span {
        text-decoration: underline;
      }

      .icon {
        margin-right: 4px;
      }

      .open-icon {
        margin-left: 2px;
        @media (min-width: 400px) {
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
