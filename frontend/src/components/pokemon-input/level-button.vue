<template>
  <v-menu v-model="menu" :close-on-content-click="true" offset-y>
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        v-model.number="customValue"
        class="w-100 text-center level-input"
        label="Level"
        density="compact"
        persistent-hint
        variant="outlined"
        hide-details
        hide-spin-buttons
        type="number"
        @focus="highlightText"
        :rules="[(v: any) => (v <= 100 && v >= 1) || `Level must be 1-100`]"
        @keydown.enter="menu = false"
      ></v-text-field>
    </template>

    <v-btn-toggle v-model="customValue" class="rounded-b-0">
      <v-btn v-for="value in firstRowValues" :key="value" :value="value" color="primary" @click="selectValue(value)">
        {{ value }}
      </v-btn>
    </v-btn-toggle>
    <v-btn-toggle v-model="customValue" class="rounded-t-0">
      <v-btn v-for="value in secondRowValues" :key="value" :value="value" color="primary" @click="selectValue(value)">
        {{ value }}
      </v-btn>
    </v-btn-toggle>
  </v-menu>
</template>

<script lang="ts">
export default {
  name: 'LevelButton',
  props: {
    level: {
      type: Number,
      required: true
    }
  },
  emits: ['update-level'],
  data: () => ({
    menu: false,
    customValue: 60,
    defaultValues: [25, 30, 50, 60, 75, 100]
  }),
  computed: {
    firstRowValues() {
      return this.defaultValues.slice(0, Math.ceil(this.defaultValues.length / 2))
    },
    secondRowValues() {
      return this.defaultValues.slice(Math.ceil(this.defaultValues.length / 2))
    }
  },
  watch: {
    level(newValue) {
      this.customValue = newValue
    },
    customValue() {
      if (this.customValue >= 1 && this.customValue <= 100) {
        this.updateLevel(this.customValue)
      }
    }
  },
  mounted() {
    this.customValue = this.level
  },
  methods: {
    selectValue(value: number) {
      this.customValue = value
      this.menu = false
    },
    updateLevel(newLevel: number) {
      this.$emit('update-level', newLevel)
    },
    highlightText(event: FocusEvent) {
      const target = event.target as HTMLInputElement

      // Use a slight delay to avoid browser conflicts
      setTimeout(() => target.select(), 1)
    }
  }
}
</script>

<style lang="scss">
.level-input {
  flex-basis: 85px;
  flex-grow: 1;
  flex-shrink: 0;
  max-width: 150px;
  text-align: center;
}
</style>
