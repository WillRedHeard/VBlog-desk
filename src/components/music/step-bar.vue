<template>
  <div @click.stop="dumpTime" class="step-bar"  ref="stepBarRef">
    <div class="bar-inner" :style="progressStyle" ></div>
  </div>
</template>

<script setup lang="ts">
import {ref,watch,computed} from 'vue'
import {useVModels} from "@vueuse/core";
const props = defineProps<{
  progress: number
  duration: number
}>()
const emit =  defineEmits(['changeTime'])
const { progress, duration } = useVModels(props,emit)
// 进度条 Dom
const stepBarRef = ref()
// 进度条进度
let offSet = ref<number>(0)
const progressStyle = computed(() => {
  offSet.value = (progress?.value / duration?.value) * 100
  return `width:${offSet.value}%`
})
/*
* 点击进度条 修改音乐播放时间
* */
const dumpTime = (e:MouseEvent) => {
  const clientWidth:number = stepBarRef.value.clientWidth
  const clickOffSetX:number = e.offsetX
  const currentTime:number = ((clickOffSetX / clientWidth) * 100) * (duration.value / 100)
  emit('changeTime', currentTime)

}
</script>
<style lang="scss" scoped>

.step-bar {
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  height: 5px;
  background: var(--vt-c-text);
  display:flex;

}
.bar-inner {
  height: 100%;
  background: var(--vt-c-theme);
}
</style>
