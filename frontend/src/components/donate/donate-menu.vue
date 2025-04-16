<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" width="250px">
    <template #activator="{ props }">
      <v-btn v-bind="props" id="navBarIcon" icon>
        <v-icon v-if="userStore.isAdminOrSupporter" size="32" :color="userStore.roleData.color">mdi-heart</v-icon>
        <v-icon v-else-if="!menu" size="32" color="pink">mdi-heart-outline</v-icon>
        <v-icon v-else class="animate-heart" size="32" color="pink">mdi-heart</v-icon>
      </v-btn>
    </template>

    <v-card id="donateMenu">
      <v-col cols="auto" class="text-center">
        <v-avatar size="72" color="background" class="mb-2">
          <v-icon size="48" :color="userStore.isAdminOrSupporter ? userStore.roleData.color : 'pink'">mdi-heart</v-icon>
        </v-avatar>

        <h6 v-if="userStore.isAdminOrSupporter" class="text-h6">Thank you!</h6>
        <h6 v-else class="text-h6">Enjoy Neroli's Lab?</h6>
      </v-col>

      <v-divider />

      <v-list>
        <v-list-item v-if="userStore.isAdminOrSupporter" class="text-center text-subtitle-1">
          Thanks to your support, Neroli's Lab is able to operate free of charge for everyone!
        </v-list-item>
        <v-list-item v-if="!userStore.isAdminOrSupporter" class="text-center text-subtitle-1">
          With just $1/month, you can support the development of Neroli's Lab and help keep it free for everyone!
        </v-list-item>
        <v-list-item v-if="!userStore.isAdminOrSupporter">
          <v-card
            id="patreonButton"
            title="Patreon"
            class="text-center"
            rounded="xl"
            color="#181717"
            style="cursor: pointer"
            @click="openPatreon"
          >
            <template #prepend>
              <PatreonIcon />
            </template>
            <template #append>
              <v-icon size="24">mdi-open-in-new</v-icon>
            </template>
          </v-card>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DonateMenu',
  components: {
    PatreonIcon
  },
  setup() {
    const userStore = useUserStore()
    return {
      userStore
    }
  },
  data: () => ({
    menu: false
  }),
  methods: {
    toggleMenu() {
      this.menu = !this.menu
    },
    openPatreon() {
      window.open('https://www.patreon.com/NerolisLab', '_blank')
    }
  }
})
</script>

<style lang="scss" scoped>
.animate-heart {
  position: relative;
  animation: heartPop 0.5s ease forwards;
}

.animate-heart::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 182, 193, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  opacity: 0;
  animation: pulseEffect 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes heartPop {
  0% {
    transform: scale(0.8);
  }
  30% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulseEffect {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
</style>
