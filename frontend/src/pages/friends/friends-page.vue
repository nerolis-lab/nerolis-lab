<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friend-store/friend-store'
import { useUserStore } from '@/stores/user-store'
import UserAvatar from '@/components/account/user-avatar.vue' // Assuming path

// Stores
const friendStore = useFriendStore()
const userStore = useUserStore()

// Refs
const newFriendCode = ref('')

// Computed
const currentUserFriendCode = computed(() => userStore.details?.friend_code)
const friends = computed(() => friendStore.friends)
const isLoading = computed(() => friendStore.loading)

// Methods
async function addFriend() {
  if (!newFriendCode.value.trim()) {
    alert('Please enter a friend code.')
    return
  }
  const success = await friendStore.sendFriendRequest(newFriendCode.value.trim())
  if (success) {
    alert('Friend request sent successfully!')
    newFriendCode.value = ''
  } else {
    alert('Failed to send friend request. The user may not exist, you might already be connected, or it could be your own code.')
  }
}

async function unfriend(friendCode: string) {
  const success = await friendStore.removeFriend(friendCode)
  if (success) {
    alert('Friend removed successfully!')
  } else {
    alert('Failed to remove friend.')
  }
}

function copyFriendCode() {
  if (!currentUserFriendCode.value) {
    alert('Friend code not available to copy.');
    return;
  }
  navigator.clipboard.writeText(currentUserFriendCode.value)
    .then(() => {
      alert('Friend code copied to clipboard!')
    })
    .catch(err => {
      alert('Failed to copy friend code.')
      console.error('Failed to copy: ', err)
    })
}

// Lifecycle
onMounted(() => {
  friendStore.sync()
})
</script>

<template>
  <v-container class="friends-page">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 text-center mb-6">Manage Friends</h1>

        <div v-if="isLoading" class="text-center pa-5">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4">Loading friends...</p>
        </div>

        <template v-else>
          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h6">Your Friend Code</v-card-title>
            <v-card-text>
              <p v-if="currentUserFriendCode" class="d-flex align-center">
                <span class="friend-code-text mr-3">{{ currentUserFriendCode }}</span>
                <v-btn icon="mdi-content-copy" size="small" @click="copyFriendCode" variant="tonal" title="Copy Friend Code"></v-btn>
              </p>
              <p v-else>Your friend code is not available.</p>
            </v-card-text>
          </v-card>

          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h6">Add New Friend</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="newFriendCode"
                label="Enter friend code"
                variant="outlined"
                dense
                class="mb-3"
                clearable
                hide-details="auto"
              ></v-text-field>
              <v-btn color="primary" @click="addFriend" block :disabled="!newFriendCode.trim()">Add Friend</v-btn>
            </v-card-text>
          </v-card>

          <v-card elevation="2">
            <v-card-title class="text-h6">Your Friends ({{ friends.length }})</v-card-title>
            <v-card-text>
              <div v-if="friends.length === 0" class="text-center pa-5">
                <p>You currently have no friends. Share your friend code or add a friend above!</p>
              </div>
              <v-list v-else lines="two">
                <v-list-item
                  v-for="friend in friends"
                  :key="friend.friend_code"
                  class="friend-item"
                >
                  <template v-slot:prepend>
                    <UserAvatar :avatar="friend.avatar" :name="friend.name" size="40" class="mr-4" />
                  </template>

                  <v-list-item-title class="font-weight-medium">{{ friend.name }}</v-list-item-title>
                  <v-list-item-subtitle>Code: {{ friend.friend_code }}</v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn 
                      icon="mdi-account-remove-outline" 
                      size="small" 
                      @click="unfriend(friend.friend_code)" 
                      color="error" 
                      variant="text"
                      title="Remove Friend"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.friends-page {
  padding-top: 24px;
  padding-bottom: 24px;
}

.friend-code-text {
  font-size: 1.25em; /* Increased size */
  font-weight: bold;
  letter-spacing: 0.5px; /* Added letter spacing */
}

.friend-item:not(:last-child) {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2); /* Softer border color */
}

.text-h4 { /* Vuetify helper class for larger headings */
  font-weight: 500;
}

.text-h6 { /* Vuetify helper class for card titles */
  font-weight: 500;
}

/* Ensure proper alignment and spacing within list items */
.v-list-item {
  align-items: center;
}

.v-list-item-title {
  line-height: 1.4;
}

.v-list-item-subtitle {
  line-height: 1.2;
  font-size: 0.875rem;
}
</style>
