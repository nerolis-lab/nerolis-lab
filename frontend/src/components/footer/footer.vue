<template>
  <v-footer class="footer flex-center">
    <div class="link-container">
      <a href="https://feedback.nerolislab.com">
        <v-icon class="icon" icon="mdi-forum"></v-icon>
        <span>Feedback</span>
      </a>
      <a href="https://github.com/nerolis-lab/nerolis-lab" target="_blank" rel="noopener noreferrer">
        <GithubIcon class="icon"></GithubIcon>
        <span>GitHub</span>
        <v-icon class="open-icon" icon="mdi-open-in-new" size="x-small"></v-icon>
      </a>
      <a href="https://discord.gg/ndzTXRHWzK" target="_blank" rel="noopener noreferrer">
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
  background: none;
  border-top: 1px solid $secondary;
  @media (min-width: 350px) {
    max-height: 50px;
    margin: 0 -7px;
  }

  @media (min-width: 400px) {
    max-height: 50px;
    margin: unset;
  }

  .link-container {
    flex-grow: 1;
    max-width: 800px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: column;

    @media (min-width: 350px) {
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
