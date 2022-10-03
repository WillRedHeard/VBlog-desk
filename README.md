# 音乐播放器控件 | 需求拆分 | 实现方案

### 假期晚上无聊,心血来潮手写了一个音乐播放器,样式及功能参考了VuePress主题博客里的音乐插件,写代码前先将功能需求拆分一下滤清思路后在动手写

#### 1.播放器基础功能 切换歌曲\暂停\播放

#### 2.旋转唱片,暂停时保留旋转角度

##### 3.歌曲进度条 \  音量控制 \ 点击控制

##### 4. 隐藏控件展示迷你标签

![image-20221002214038815](C:\Users\18074\AppData\Roaming\Typora\typora-user-images\image-20221002214038815.png)



#### 先将完整代码贴上,然后在分析在实现功能时遇到的问题及解决思路和方法

```vue
   <!--   index.vue  -->
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
        <li v-if="volume == 0" ><img  @click="changeVolume(0.3)" src="src/assets/image/volumeCross.svg" alt=""> </li>
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
  <audio @timeupdate="timeupdate"  @ended="ended"  :src="musicInfo[activeMusic].url" autoplay   ref="audioRef" > </audio>
</template>

<script setup lang="ts">
/*
* VBlog 音乐播放器控件
* author 王福庭
* */
import { ref,onMounted,computed,watch } from 'vue'
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
// 音频标签 DOM
const audioRef = ref()
// 旋转唱片Dom
const cdRef = ref()
// 旋转唱片内部图片DOM 
const cdImageRef = ref()
// 音量控件 Dom
const volumeRef = ref()
// 控制当前播放音乐
let activeMusic = ref(0)
// 激活播放
let active = ref(false)
// 计算动态添加或移除旋转动画
let cdCls = computed(() => {
  return  active.value ? 'play' : ''
})
// 当前播放的时间
let progress = ref(0)
// 播放音乐总时长
let duration = ref(0)
// 初始化音量
let volume = ref(0.3)
// 修改音量
const changeVolume = (val:number) => {
  audioRef.value.volume = val
  volume.value = val
}
// 音量进度条
const volumeStyle = computed(() => {
    // 初始化时获取不到Dom实例对象 直接return
  if(!volumeRef.value) {
    return
  }
  let wrapperWidth =  volumeRef.value.clientWidth
  return `width:${(wrapperWidth * volume.value ) * 2}%`
})
// 点击音量控件进行修改音量
const touchVolume = (e:MouseEvent) => {
    // 通过点击时的鼠标落点在容器内的偏移量计算出占比 修改audio的音量
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

```

```vue
 <!--  step-bar.vue -->
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

```

```vue
 <!--  app.vue -->
<template>
  <music :musicInfo="musicInfo"></music>
</template>

<script setup lang="ts">
import music from '@/components/music/index.vue'
import type { musicType }  from  '@/components/music/index.vue'
import {ref} from "vue";
// 音乐数据   
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

```



## 问题及解决方案

#### 1.自动播放问题

chrome浏览器在 2018年时为了改善用户的体验,禁止所有媒体在加载完后用户未进行交互时自动播放,但是允许媒体禁音播放,翻阅了资料发现这个问题在chrome及主流浏览器上无法解决,无法通过js打破这一规则,所以只能在用户交互后触发播放

```javascript
const onPlay =  () => {
  duration.value = audioRef.value.duration
  audioRef.value.volume = volume.value
  audioRef.value.play()
  active.value = true
  // 移除初始化时交互监听事件
  let body = document
  body.removeEventListener('click',onPlay)
}
onMounted(() => {
  // 谷歌浏览器等主流浏览器无法实现音频进入自动播放 需要等用户对页面进行交互时才能通过JS开启播放
  let body = document
  body.addEventListener('click', onPlay)
})
```

### 2.旋转唱片暂停后旋转度数归零

音乐在播放时,只是动态给内部的img标签旋转,他的父元素其实相对是不动的,在暂停播放时动态移除play样式类,元素没有了旋转角度所以唱片会变成0度

处理方案: 在暂停时,将内部旋转的角度同步给外部元素,内部元素归零外部元素获取暂停前的旋转角度,在视角上看就会暂停,但这样还是会出现问题,多次暂停唱片旋转位置还是会出现错误其实还是同样的原因,解决第二个问题就需要将旋转的角度叠加.这里放一下参考的链接https://codepen.io/HaoyCn/pen/BZZrLd

```html
      <div ref="cdRef">
        <img ref="cdImageRef" :class="cdCls" :src="musicInfo[activeMusic].image">
      </div>
```

```javascript
// 通过watch监听播放状态 在音乐暂停时 同步旋转角度
watch(active,(newActive) => {
  if(!newActive) {
    syncTransform(cdRef.value,cdImageRef.value)
  }
})
const syncTransform = (wrapper:HTMLElement,inner:HTMLElement) => {
  //通过getComputedStyle() 这个API拿到DOM身上的style属性
  const wrapperTransform = getComputedStyle(wrapper).transform //外部旋转值  初始为none
  const innerTransform = getComputedStyle(inner).transform   //内部旋转值
  // 对外部容器进行赋值 外部为none则偏移就是子元素旋转最后的值 若不为none则叠加
  wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ',wrapperTransform)
}
```

#### 3.进度条解决方案 (音量控件原理差不多)

将进度条拆分出去通过props传递数据,通过emit回传数据修改播放事件

播放进度主要是通过当前播放时间计算 / 音频总时间  * 100,将计算的值通过百分比的方式赋值给内部进度元素

点击进度条修改播放时间,计算公式是 (点击的位置 / 容器宽度 * 100) * (音频总时长 / 100) 回传父组件修改播放进度

```javascript
<audio @timeupdate="timeupdate"></audio>
/*
 * audio标签原生方法获取当前播放媒体的总长度
 * audioRef.value.duration
 * e.target.currentTime当前播放时间 可以修改
 * audio 原生事件 timeupdate 播放进度变化时触发 
**/
const timeupdate = (e:Event) => {
  progress.value = e.target.currentTime 
}
```

进度条组件

```vue

<template>
  <div @click.stop="dumpTime" class="step-bar"  ref="stepBarRef">
    <div class="bar-inner" :style="progressStyle" ></div>
  </div>
</template>
<script setup lang="ts">
import {ref,watch,computed} from 'vue'
import {useVModels} from "@vueuse/core";
const props = defineProps<{
  progress: number // 当前播放时间
  duration: number // 音频总播放时间
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
```



# 总结

这个小demo用TS编写,在编写调试的时候确实很少看到Vue警告和报错,果然TS在开发时就解决了变量和事件的隐藏问题,当然小的项目还是继续使用JS,毕竟JS在小项目效率上效率是远大于TS的,虽然TS让代码更健壮,但实实在在的多了许多束缚.
