<script setup lang="ts">
import setTheme from '@/utils/theme'

</script>

<template>
  <button @click="setTheme(true)">light</button>
  <button @click="setTheme(false)">dark</button>
  <RouterView />
</template>

<style scoped>

</style>
