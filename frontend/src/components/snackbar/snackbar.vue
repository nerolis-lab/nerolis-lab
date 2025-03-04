<!-- src/components/snackbar/Snackbar.vue -->
<template>
  <v-snackbar v-model="isVisible" :color="snackbarColor" :timeout="snackbarTimeout">
    {{ snackbarText }}
    <template v-slot:actions v-if="closable">
      <v-btn icon="mdi-close" variant="text" @click="isVisible = false" />
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

const isVisible = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const snackbarTimeout = ref(5000)
const closable = ref(true)

function showSnackbar(text: string, color: string, timeout = 5000) {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarTimeout.value = timeout
  isVisible.value = true
}

export function success(message: string, timeout = 5000) {
  showSnackbar(message, 'success', timeout)
}

export function error(message: string, timeout = 5000) {
  showSnackbar(message, 'error', timeout)
}

export function info(message: string, timeout = 5000) {
  showSnackbar(message, 'info', timeout)
}

export function warning(message: string, timeout = 5000) {
  showSnackbar(message, 'warning', timeout)
}

export default defineComponent({
  name: 'Snackbar',
  setup() {
    return {
      isVisible,
      snackbarText,
      snackbarColor,
      snackbarTimeout,
      closable
    }
  }
})
</script>
