<template>
  <music :musicInfo="musicInfo"></music>
</template>

<script setup lang="ts">
import music from '@/components/music/index.vue'
import type { musicType }  from  '@/components/music/index.vue'
import {ref} from "vue";
const musicInfo = ref<musicType[]>([
  {
    image: 'https://assets.smallsunnyfox.com/music/2.jpg',
    author:'Plastic / Fallin` Dild',
    name: '강남역 4번 출구',
    url: 'https://assets.smallsunnyfox.com/music/2.mp3'

  },
  {
    image: 'https://assets.smallsunnyfox.com/music/3.jpg',
    author:'최낙타',
    name: '用胳膊当枕头',
    url: 'https://assets.smallsunnyfox.com/music/3.mp3'
  }
])
</script>
