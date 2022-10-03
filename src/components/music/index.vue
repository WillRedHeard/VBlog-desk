<template>
  <section id="musicRootRef" class="music-root">
    <!--   rotate CD  -->
    <div class="rotate-cd-root">
      <div ref="cdRef">
        <img ref="cdImageRef" :class="cdCls" :src="musicInfo[activeMusic].image">
      </div>
    </div>
    <!--  music info and control  -->
    <div class="music-info">
      <!--    title  -->
      <div class="music-title">
        <img src="/src/assets/image/music.svg" alt="">
        <span>{{musicInfo[activeMusic].name}}</span>
      </div>
      <!--   author   -->
      <div class="music-author">
        <img src="/src/assets/image/author.svg" alt="">
        <span>{{musicInfo[activeMusic].author}}</span>
      </div>
      <!--   进度条   -->
      <stepBar :duration="duration" :progress="progress" @changeTime="changeTime"  />
      <!--  control -->
      <ul class="music-control">
        <li @click.stop="onPrive" ><img src="/src/assets/image/prive.svg" ></li>
        <li v-show="active" @click.stop="onStop"><img  src="/src/assets/image/stop.svg" ></li>
        <li v-show="!active" @click.stop="onPlay"><img  src="/src/assets/image/play.svg"></li>
        <li @click.stop="onNext"><img src="/src/assets/image/next.svg" ></li>
        <li v-if="volume != 0" ><img @click="changeVolume(0)" src="/src/assets/image/volume.svg" > </li>
        <li v-if="volume == 0" ><img  @click="changeVolume(0.3)" src="/src/assets/image/cross.svg" alt=""> </li>
        <li @click.stop="touchVolume" class="volume" ref="volumeRef" >
          <span :style="volumeStyle"></span>
        </li>
      </ul>
    </div>
    <!--  一开始忘记布局了 后面只能用定位的方式固定位置  -->
    <div class="right">
      <img @click="fade(true)" src="/src/assets/image/left.svg" alt="">
    </div>
  </section>
<!--  mini cd -->
  <div @click.stop="fade(false)" id="miniCd" class="miniCd">
    <img  :src="musicInfo[activeMusic].image">
  </div>
  <!--  video -->
  <audio @timeupdate="timeupdate"
         @ended="ended"
         :src="musicInfo[activeMusic].url"
         ref="audioRef"
         autoplay>
  </audio>
</template>
<script setup lang="ts">
/*
* VBlog 音乐播放器控件
* author 王福庭
* */
import { ref,onMounted,computed,watch,} from 'vue'
import gsap from "gsap";
import type { PropType } from 'vue'
import stepBar from '@/components/music/step-bar.vue'
export interface musicType {
  url: string,
  author: string,
  image: string,
  name: string
}
const props =  defineProps({
  musicInfo: {
    type:Array as PropType<musicType[]>,
    required: true
  }
})
// audio DOM
const audioRef = ref()
// cd root Dom
const cdRef = ref()
// rotate img Dom
const cdImageRef = ref()
// volume Dom
const volumeRef = ref()
// 控制当前播放音乐
let activeMusic = ref(0)
// 激活播放
let active = ref(false)
// computed and add rotate animation
let cdCls = computed(() => {
  return  active.value ? 'play' : ''
})
// 当前播放的时间
let progress = ref(0)
// 播放音乐总时长
let duration = ref(0)
// volume
let volume = ref(0.3)
const changeVolume = (val:number) => {
  audioRef.value.volume = val
  volume.value = val
}
// 音量进度条
const volumeStyle = computed(() => {
  if(!volumeRef.value) {
    return
  }
  let wrapperWidth =  volumeRef.value.clientWidth
  return `width:${(wrapperWidth * volume.value ) * 2}%`
})
// 点击音量控件进行修改音量
const touchVolume = (e:MouseEvent) => {
  audioRef.value.volume = volume.value = e.offsetX / volumeRef.value.clientWidth
}
/*
* 通过watch监听 播放状态 在音乐暂停时 同步旋转角度
* */
watch(active,(newActive) => {
  if(!newActive) {
    syncTransform(cdRef.value,cdImageRef.value)
  }
})
// 切换歌曲时 时间清空
watch(activeMusic,() => {
  progress.value = 0
})
const onPlay =  () => {
  duration.value = audioRef.value.duration
  audioRef.value.volume = volume.value
  audioRef.value.play()
  active.value = true
  // 移除初始化时交互监听
  let body = document
  body.removeEventListener('click',onPlay)
}
const onStop = () => {
  audioRef.value.pause()
  active.value = false
}
// next music
const onNext = () => {
  activeMusic.value >=  props.musicInfo.length - 1 ? activeMusic.value = 0 : activeMusic.value ++
  setTimeout(() => {
    onPlay()
  },500)
}
// prive music
const onPrive = () => {
  activeMusic.value == 0 ? activeMusic.value = props.musicInfo.length - 1 : activeMusic.value --
  setTimeout(() => {
    onPlay()
  },500)
}
// audio 原生事件 timeupdate 获取当前播放的时间
const timeupdate = (e:any) => {
  progress.value = e.target.currentTime
}
// 修改当前的播放时间
const changeTime = (value:number) => {
  audioRef.value.currentTime = value
}
// 当前音乐播放完毕
const ended = () => {
  onNext()
}
const syncTransform = (wrapper:HTMLElement,inner:HTMLElement) => {
  //通过getComputedStyle() 这个API拿到DOM身上的style属性
  const wrapperTransform = getComputedStyle(wrapper).transform //外部旋转值  初始为none
  const innerTransform = getComputedStyle(inner).transform   //内部旋转值
  // 对外部容器进行赋值 外部为none则偏移就是子元素旋转最后的值 若不为none则叠加
  // 参考 https://codepen.io/HaoyCn/pen/BZZrLd
  wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ',wrapperTransform)
}
// 播放器控件及迷你标签 淡入淡出
const fade = (type:boolean) => {
  if(type) {
    gsap.to('#musicRootRef',{opacity: 0,x:-100,duration:0.2 })
    gsap.to('#miniCd',{translateX:'0%', duration:0.2 })
  } else {
    gsap.to('#musicRootRef',{opacity: 1, x: 0,duration:0.2 })
    gsap.to('#miniCd',{translateX:'-100%', duration:0.2 })
  }
}
// Audio.volume：设置或返回音频的音量。
onMounted(() => {
  // 谷歌浏览器等主流浏览器无法实现音频进入自动播放 需要等用户对页面进行交互时才能通过JS开启播放
  let body = document
  body.addEventListener('click', onPlay)
})
</script>
<style lang="scss" scoped>
.music-root {
  position: fixed;
  top: 80vh;
  left: 1vw;
  width: 340px;
  height: 110px;
  border-radius: 70px;
  background: var(--vt-c-bg);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-shadow: var(--vt-c-shadow) 0 0 5px;
  transition: all 0.5s;
  .rotate-cd-root {
    transform: translateX(5px);
    width: 100px;
    height: 100%;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    -webkit-user-drag: none;
    div {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: white;
      overflow: hidden;
      box-shadow: var(--vt-c-shadow) 0 0 5px;
      img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        -webkit-user-drag: none
      }
    }

  }
  .music-info {
    flex: 0.8;
    border-radius: 0;
    border-top-left-radius:0;
    border-bottom-left-radius: 0px;
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    margin-left: 5px;
    .music-title, .music-author {
      margin-top: 5px;
      display: flex;
      color: var(--vt-c-text);
      span {
        margin-left: 10px;
      }
      img {
        width: 20px;
        height: 20px;
      }
    }

    .music-control {
      display: flex;
      margin-top: 10px;
      align-items: center;
      img {
        cursor: pointer;
        width: 20px;
        height: 20px;
        margin: 0 5px;
      }
      .volume {
        width: 50px;
        height: 5px;
        background-color: #f5f5f5;
        display: flex;
        justify-content: start;
        align-items: center;
        cursor: pointer;
        span {
          display: block;
          width: 0%;
          height: 100%;
          background-color: var(--vt-c-theme);
        }
      }
    }
  }
  .right {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    img {
      width: 25px;
      height: 25px;
    }
  }
}
.miniCd{
  position: fixed;
  left: 0;
  top: 60%;
  width: 50px;
  height: 40px;
  display: flex;
  justify-content: end;
  align-items: center;
  background-color: var(--vt-c-theme);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
  cursor: pointer;
  transform: translateX(-100%);
  img {
    transform: translateX(-5px);
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }

}
/* 旋转 CD 动画 */
.play {
  animation: rotate 20s linear infinite;
}
@keyframes rotate {
  0% {
    transform: rotate(0);
    transform-origin: center;

  }
  100% {
    transform: rotate(360deg);
    transform-origin: center;

  }
}
</style>
