<template>
<div id="app">
    <router-view v-if="isRouterAlive"></router-view>
    <audio id="audio" preload="auto" loop>
        <source src="./assets/voice.mp3" type="audio/mp3" />
    </audio>
</div>
</template>

<script>
import common from "./mixins/common";
export default {
    name: "my-project",
    mixins: [common()],
    provide () {
        // 父组件中通过provide来提供变量，在子组件中通过inject来注入变量。
        return {
        reload: this.reload,
        }
    },
    data () {
        return {
              isRouterAlive: true // 控制视图是否显示的变量
        }
    },
    mounted () {
      let ip = returnCitySN["cip"]; // ip
        let adress = returnCitySN["cname"]; // 地址
        this.$store.commit('SET_USER_IP',{ip,adress})
        // 禁止拖入文件图片等
        document.ondrop = function(event) {
            return false;
            };
        document.ondragenter  = function(event) {
            return false;
        };
        document.ondragover  = function(event) {
            return false;
        };
    },
    methods: {
        reload () {
            this.isRouterAlive = false // 先关闭
            this.$nextTick(function () {
            this.isRouterAlive = true // 再打开
        })
    }
    }
};
</script>

<style>
/* CSS */
#app {
    height: 100%;
    overflow: hidden;
}
</style>
