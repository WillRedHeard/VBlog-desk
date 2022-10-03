/*
* 更改主题色
* @author 王福庭
* */
export interface Theme {
    name: string,
    value: string
}
const darkTheme:Theme[] = [
    {
        name:'--vt-c-bg',
        value: '#242424'
    },
    {
        name: '--vt-c-shadow',
        value: '#f5f5f5'
    },
    {
        name: '--vt-c-text',
        value: '#f5f5f5'
    },
    {
        name: '--vt-c-step-bar',
        value: '#f5f5f5'
    },
]
const light:Theme[] = [
    {
        name:'--vt-c-bg',
        value: '#fff'
    },
    {
        name: '--vt-c-shadow',
        value: 'rgba(0,0,0,0.9)'
    },
    {
        name: '--vt-c-text',
        value: '#222'
    },
    {
        name: '--vt-c-step-bar',
        value: '#222'
    },
]
const setTheme = (theme:boolean = true) => {
    if (theme) {
        light.forEach(ele => {
            document.documentElement.style.setProperty(ele.name, ele.value)
        })
    } else  {
        darkTheme.forEach(ele => {
            document.documentElement.style.setProperty(ele.name, ele.value)
        })
    }
}
export default setTheme
// --vt-c-bg: #242424;
// --vt-c-shadow: #f5f5f5 ;
// --vt-c-text:#f5f5f5 ;
// --vt-c-step-bar: #f5f5f5;
// --vt-c-theme:#3eaf7c;
// --vt-c-black: #181818;
// --vt-c-black-soft: #222222;
// --vt-c-black-mute: #282828;
