<template>
  <v-card class="ma-4" elevation="2">
    <v-card-text>
      <v-row align="center" justify="start">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="editableFriendCode"
            label="Friend Code"
            :rules="[rules.friendCode]"
            maxlength="6"
            counter
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="2">
          <v-btn color="primary" @click="onSave" :disabled="!isChanged || !isFriendCodeValid">Save</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { User } from 'sleepapi-common'
import { computed, ref } from 'vue'

const props = defineProps<{
  user: User
  saveFunction: (user: User) => Promise<void>
}>()

const editableFriendCode = ref(props.user.friend_code ?? '')

const isChanged = computed(() => editableFriendCode.value !== (props.user.friend_code ?? ''))
const isFriendCodeValid = computed(() => editableFriendCode.value && /^[a-zA-Z0-9]{6}$/.test(editableFriendCode.value))

const onSave = async () => {
  const userToUpdate: User = { ...props.user, friend_code: editableFriendCode.value }
  await props.saveFunction(userToUpdate)
}

const rules = {
  friendCode: (value: string) =>
    (value && /^[a-zA-Z0-9]{6}$/.test(value)) || 'Friend code must be 6 alphanumeric characters.'
}
</script>
