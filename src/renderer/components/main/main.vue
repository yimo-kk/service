<template>
  <a-layout style="height:100%;">
    <a-layout-header class="header">
      <div class="header">
        <div class="log">
          <img src="../../assets/logo.png" alt />
          <p class="systemName">客服系统</p>
        </div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['AwaitChat']"
          :style="{ lineHeight: '64px' }"
          :selectedKeys="[selectedKey]"
          @select="selectMenu"
        >
          <a-menu-item key="CurrentChat">
            <div class="flex_center">
              <customIcon type="icon-liaotian" style="color:#fff;fontSize:18px"></customIcon>
              <p>当前会话</p>
              <a-badge :count="$store.getters.currentNum" :overflow-count="99"  :offset="[0,-18]" >
              </a-badge>
            </div>
          </a-menu-item>
          <a-menu-item key="AwaitChat">
            <div class="flex_center">
                <customIcon type="icon-dengdai" style="color:#fff;fontSize:18px"></customIcon>
                <p>待接入会话</p> 
                <a-badge :count="awaitList.length" :overflow-count="99"  :offset="[0,-18]" >
              </a-badge>
            </div>
          </a-menu-item>
          <a-menu-item key="GroupChat">
            <div class="flex_center">
              <customIcon type="icon--qunliaoshezhi" style="color:#fff;fontSize:18px"></customIcon>
              <p>群聊管理</p>
              <a-badge :count="$store.getters.groupChatNum" :overflow-count="99"  :offset="[0,-10]" > </a-badge>
              <!-- <a-badge :dot='true'  v-show="$store.getters.groupChatNum" :offset="[0,-10]" /> -->
            </div>
          </a-menu-item>
        </a-menu> 
      </div>
      <service-header  @setStatus='setStatus'></service-header>
    </a-layout-header>
    <a-layout class="body_content">
      <div v-if="selectedKey === 'AwaitChat'" style="height:100%;">
        <AwaitChat @selectMenu="selectMenu"></AwaitChat>
      </div>
      <div v-if="selectedKey === 'CurrentChat'" style="height:100%">
        <CurrentChat @goAwaitChat="selectMenu"></CurrentChat>
      </div>
      <div v-if="selectedKey === 'GroupChat'" style="height:100%">
        <GroupChat></GroupChat>
      </div>
    </a-layout>
  </a-layout>
</template>

<script>
import serviceHeader from "@/components/serviceHeader/serviceHeader.vue";
import AwaitChat from "@/view/awaitChat/index";
import CurrentChat from "@/view/currentChat/index";
import GroupChat from "@/view/groupChat/index";
import { updateKefuStatus } from "@/api/login";
import common from "@/mixins/common";
import { handleRelink } from "@/api/current.js";
import { mapMutations, mapActions } from "vuex";
export default {
  name: "Main",
  mixins: [common()],
  components: {
    serviceHeader,
    AwaitChat,
    CurrentChat,
    GroupChat,
  },
  data() {
    return {
      selectedKey: "CurrentChat",
    };
  },
  computed: {
    relinkMessage() {
      return this.$store.state.Socket.relinkMessage;
    },
    userMessage() {
      return this.$store.state.Socket.userMessage;
    },
    refuseMessage() {
      return this.$store.state.Socket.refuseMessage;
    },
    groupMessage() {
      return this.$store.state.Socket.groupMessage;
    },
    awaitList() {
      return this.$store.state.Socket.awaitList;
    },
    currentChatList(){
      return this.$store.state.Socket.currentChatList;
    },
    groupChatNum(){
      return this.$store.state.Socket.groupChatNum;
    },
     oldUser(){
      return this.$store.state.Socket.oldUser;
    }
    
  },
  watch: {
    oldUser:{
      handler(newVal) {
         this.play();
         this.$electron.ipcRenderer.send("message_prompt");
      },
      deep:true
    },
    // 收到转接
    relinkMessage: {
      handler(newVal) {
        let val = JSON.parse(JSON.stringify(newVal));
        if (val.kefu_code == this.$store.state.Login.userInfo.kefu_code) {
          this.play();
          this.$electron.ipcRenderer.send("message_prompt");
          this.$electron.ipcRenderer.send("isVisible_box", val.message);
          let that = this;
          this.$confirm({
            title: "转接通知",
            content: val.message,
            okText: "确认",
            cancelText: "拒绝",
            onOk() {
              that.$socket.emit("message", {
                username: val.user_name,
                from_kefu_code: val.from_kefu_code,
                kefu_name: val.kefu_name,
                kefu_code: val.kefu_code,
                cmd: "relink-accept",
              });
              that.$socket.emit("message", {
                username: val.user_name,
                kefu_code: that.$store.state.Login.userInfo.kefu_code,
                kefu_name: that.$store.state.Login.userInfo.kefu_name,
                uid:val.user_id,
                seller_code:that.$store.state.Login.userInfo.seller_code,
                cmd: "service-prompt",
              });
              that.handleRelink({
                seller_code: that.$store.state.Login.userInfo.seller_code,
                uid: val.user_id,
                kefu_code: that.$store.state.Login.userInfo.kefu_code,
                from_kefu_code: val.from_kefu_code,
              });
              that.selectedKey = "CurrentChat";
            },
            onCancel() {
              that.$socket.emit("message", {
                username: val.user_name,
                from_kefu_code: val.from_kefu_code,
                kefu_name: that.$store.state.Login.userInfo.kefu_name,
                kefu_code: that.$store.state.Login.userInfo.kefu_code,
                cmd: "relink-refuse",
              });
            },
          });
        }
      },
      deep: true,
    },
    // 收到用户发来消息
    userMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        // 消息声音提示和任务栏闪烁
        if (data.from_name !== this.$store.state.Login.userInfo.kefu_name) {
          this.play();
          this.$electron.ipcRenderer.send("message_prompt");
          this.$electron.ipcRenderer.send("message_tray");
          this.$electron.ipcRenderer.send(
            "isVisible_box",
            `${data.from_name}给你发了新消息了`
          );
          if(newVal.from_name != this.$store.state.Socket.currentUser.activtyeUsername){
              let arr = JSON.parse(JSON.stringify(this.currentChatList))
              let list = arr.map((item) => {
                item.username == data.from_name && (item.noReadNum += 1)
                return item;
              });
              this.SET_CURRENT_CHAT_LIST(list)
          }
           
         
        }
      },
      deep: true,
    },
    groupMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        if (data.from_name !== this.$store.state.Login.userInfo.kefu_name) {
          this.play();
          this.$electron.ipcRenderer.send("message_prompt");
          this.$electron.ipcRenderer.send("message_tray");
          this.$electron.ipcRenderer.send(
            "isVisible_box",
            `收到一条新的群消息！`
          );
        }
        if (this.$store.state.Socket.chatList.length && data.group_id != this.$store.state.Socket.activityGroup.activityId) {
          let chatList = this.arrayExists(
            this.$store.state.Socket.chatList,
            data.group_id,
            true
          );
          this.SET_CHAT_LIST(chatList);
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(["getGroupList",'getAwaitList','getCurrentListData']),
    ...mapMutations(["SET_CHAT_LIST","SET_CURRENT_USER",'SET_CURRENT_CHAT_LIST','SET_GROUP_CHAT_NUM','SET_STATUS']),
    selectMenu(val) {
      this.selectedKey = val.key;
    },
    handleRelink(data) {
      handleRelink(data).then((result) => {
        this.$message.success("转接成功");
      });
    },
    updateKefuStatus() {
      updateKefuStatus(this.$store.state.Login.userInfo.kefu_code).then(
        (result) => {
          this.SET_STATUS({online_status:1})
          this.$socket.emit("message",
            {
              cmd: "service-status",
              kefu_code:this.$store.state.Login.userInfo.kefu_code,
              online_status:1,
              });
        }
      );
    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr));
      let list = con_arr.map((item) => {
        item.group_id == value && (item.noReadNum = bool ? item.noReadNum + 1 :0);
        return item;
      });
      return list;
    },
    // getCurrentUserListData(){
    //   this.getCurrentListData() 
    //   .then((result) => {
    //      this.SET_CURRENT_USER({
    //           activtyUid: this.currentChatList[0].uid,
    //           activtyeUsername: this.currentChatList[0].username,
    //           login_ip:this.currentChatList[0].login_ip, 
    //           area:this.currentChatList[0].area
    //         });
    //   })
    // },
    setStatus(index){
      this.$socket.emit("message", {
          cmd: "service-status",
          kefu_code:this.$store.state.Login.userInfo.kefu_code,
          online_status:index,
      });
    }
  },
  created() {},
  mounted() {
    this.updateKefuStatus();
    // this.getGroupList();
    // this.getCurrentUserListData()
    // 等待接入
     this.getAwaitList({
      seller_code: this.$store.state.Login.userInfo.seller_code,
      username: "",
    });
  },
};
</script>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;

  .log {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 100px;
    margin-left: -20px;

    img {
      width: 50px;
      height: 50px;
      border-radius: 10px;
    }

    .systemName {
      color: #7c32af;
      margin-left: 20px;
    }
  }
}

.body_content {
  padding: 20px 10px 0 10px;
  height: 100%;
}
/deep/.ant-badge-count {
    min-width: 16px;
    height: 16px;
    padding: 0 5px;
    font-size: 10px;
    line-height: 16px;
}
</style>
