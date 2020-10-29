<template>
    <a-config-provider :locale="locale">
        <div id="app">
            <router-view v-if="isRouterAlive"></router-view>
            <audio id="audio" preload="auto" loop>
                <source src="./assets/voice.mp3" type="audio/mp3" />
            </audio>
        </div>
    </a-config-provider>
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
            ip:'',
            address:'',
            isRouterAlive: true, // 控制视图是否显示的变量 
        }
    },
    mounted () {
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
        // 退出程序事件
        this.$electron.ipcRenderer.on("before_closed",()=>{
            let {  kefu_code ,seller_code} = this.$route.query
            try {
                let info = JSON.parse(localStorage.getItem(seller_code))
                delete info[kefu_code]
                localStorage.setItem(seller_code,JSON.stringify(info))
            } catch (error) {
                console.log(error)
            }finally{
                this.$router.push({name:'Login'})
                this.$store.commit('SET_USER_INFO','')
                this.$store.commit('RESETVUEX')
                this.$electron.ipcRenderer.send('app-exit')
            }
        });
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
 .ant-layout-header {
    height: 55px !important;
    padding: 0 50px !important;
    line-height: 55px !important;
    background: #2a2b2d !important;
}
.ant-menu-dark, .ant-menu-dark .ant-menu-sub {
    color: rgba(255, 255, 255, 0.65);
    background: #2a2b2d !important;
}
</style>
