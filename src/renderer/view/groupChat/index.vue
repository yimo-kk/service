<template>
  <div class="groupChat"> 
    <a-row style="height: 100%" v-if="$store.state.Socket.chatList.length">
      <a-col :span="5" class="chat_left">
        <div v-if="$store.state.Socket.chatList.length">
          <div
            v-for="item in this.$store.state.Socket.chatList"
            :key="item.id"
            :class="[
              'hover_item',
              item.group_id == activityGroup.activityId ? 'activt_item' : '',
            ]"
          >
            <ListItem :groupData="item" @selectGroup="selectGroup"></ListItem>
          </div>
        </div>
        <!-- <div v-else class="list_loading">
          <a-spin :spinning="list_loading"></a-spin>
        </div> -->
      </a-col>
      <a-col :span="centerNum" style="height: 100%">
        <div class="chat_content">
          <a-page-header
            style="border: 1px solid rgb(235, 237, 240)"
            :title="activityGroup.activityTitle"
          >
            <template slot="extra">
              <p key="1" class="more" @click="clickMore" :title="rightNum?'收起':'展开'">
                <a-icon type="ellipsis" />
              </p>
            </template>
          </a-page-header>
          <ChatBox
            :chatLogList="chatLogList"
            @sendMessage="sendMessage"
            @uploadImage="uploadImage"
            @stopSpeak="stopSpeak"
            @kickOut="executionKickOut"
            @addBlacklist='addBlacklist'
            @removeblack='sendBlackMessage'
            @removeforbid='sendForbidMessage'
            :logLoading="logLoading"
            :isHeadImg="true"
            :isAdmin='isAdmin'
          ></ChatBox>
        </div>
      </a-col>
      <a-col :span="rightNum">
        <transition name="bounce">
          <div v-show="rightNum">
            <a-tabs type="card" v-model="activtTabs">
              <a-tab-pane key="1" tab="群组成员">
                 <div v-show="isGroupList" style="textAlign: center">
                  <a-spin tip />
                </div>
                <div v-if="groupList.length && !isGroupList ">
                <div class="group_list">
                  <a-checkbox-group
                    v-model="checkedList"
                    :options="groupList"
                    @change="onChangeCheckbox"
                    style="display: block"
                  >
                    <div slot="label" slot-scope="scope" class="checkboxLabel">
                     <div style="display: flex; alignItems: center">
                        <div class="group_list_item">
                          <img class="headimg" v-lazy="scope.headimg" alt />
                          <a-badge
                            :status="
                              scope.online_status ? 'success' : 'default'
                            "
                            :offset="[4, 12]"
                            :title="scope.online_status ? '在线' : '离线'"
                          >
                          </a-badge>
                      </div>
                      <p class="group_list_item_username dwote" :title="scope.username">
                        {{ `${scope.username}${scope.isAdmin?'(管理员)':''}` }}
                      </p>
                    </div>
                   <div style="display: flex;alignItems:center;marginLeft:10px">
                       <customIcon
                        v-if="scope.forbid"
                        :title="scope.forbid?'被禁言':''"
                        type="icon-32jinyan"
                        style="fontSize: 13px"
                      ></customIcon>
                     <customIcon
                      v-if="scope.list_id"
                      :title="scope.list_id?'被拉黑':''"
                      type="icon-lahei"
                      style="fontSize: 13px;marginLeft:10px"
                    ></customIcon>
                     <!-- <a-icon type="close-circle" v-if="scope.status" :title="scope.status?'被禁言':''" class="is_stop_speak" /> -->
                   </div>
                     </div>
                    </a-checkbox-group
                  >
                </div>
                 <a-collapse accordion v-if="isAdmin">
                  <a-collapse-panel
                            header="其他操作"
                            :key="1"
                          >
                        <div class="other">
                          <div>
                          <a-button @click="disableSendMsg">
                            <customIcon
                              title="禁言"
                              type="icon-32jinyan"
                              style="fontSize: 13px"
                            ></customIcon>禁言
                          </a-button>
                        </div>
                        <div>
                          <a-button @click="removeforbid">
                            <customIcon
                              title="解除黑名单"
                              type="icon-yichu"
                              style="fontSize: 13px"
                            ></customIcon>解除禁言
                          </a-button>
                        </div>
                        <div>
                          <a-button @click="addBlacks">
                          <customIcon
                              title="加入黑名单"
                              type="icon-lahei"
                              style="fontSize: 13px"
                            ></customIcon>加入黑名单
                          </a-button>
                        </div>
                        <div>
                          <a-button @click="removeblack">
                          <customIcon
                              title="移除黑名单"
                              type="icon-yichu"
                              style="fontSize: 13px"
                            ></customIcon>移除黑名单
                          </a-button>
                        </div>
                        <div v-show="activityGroup.is_invite">
                          <a-button @click="operationGroupUser">
                            <a-icon type="minus-circle" style="fontSize: 16px" />
                            踢出群聊
                          </a-button>
                        </div>
                        <div v-show="activityGroup.is_invite">
                          <a-button @click="addGroup" >
                            <a-icon type="plus-circle" style="fontSize: 16px" />
                            拉人进群
                          </a-button>
                        </div>
                        </div>
                  </a-collapse-panel>
                 </a-collapse>
                </div>
                <p v-else-if='!isGroupList' style="textAlign:center">暂无群成员...</p>
              </a-tab-pane>
            </a-tabs>
          </div>
        </transition>
      </a-col>
    </a-row>
     <!-- 无会话展示 -->
    <div v-else style="paddingTop:35px">
      <a-empty :image-style="{
      height: '100%',
    }">
        <span slot="description">暂无群聊，请联系商家创建群！</span>
      </a-empty>
    </div>
    <!-- 拉人进群 -->
    <a-modal
      title="添加群成员"
      v-model="isAddGroup"
      @ok="handleAddGroup"
      okText="确定"
      cancelText="取消"
    >
      <addGroupList
        :addGroupList="notGroupList"
        :selectAddlist="[]"
        :isAddGroup="isAddGroup"
        :isNotGroupList="isNotGroupList"
        @onChangeCheckbox="onChangeAddGroupUser"
      ></addGroupList>
    </a-modal>
  </div>
</template>

<script>
import ListItem from "@/components/chatBox/listItem";
import ChatBox from "@/components/chatBox/chatBox";
import addGroupList from "./component/addGroupList";
import memberList from "./component/memberList";
import common from "@/mixins/common";
import { mapMutations, mapActions } from "vuex";
import {
  conversionFace,
  compressImage,
  isImage,
  conversion,
} from "@/utils/libs.js";
import {
  getGroupChatLog,
  getGroupUsersList,
  prohibitSay,
  kickUsersGroup,
  getNotGroupUsersList,
  pullUsersGroup, 
} from "@/api/group.js";
export default {
  name: "GroupChat",
  mixins: [common()],
  components: {
    ListItem,
    ChatBox,
    memberList,
    addGroupList,
  }, 
  data() {
    return {
      checkedList: [],
      isGroupList: false,
      // list_loading: false,
      rightNum: 0,
      centerNum: 19,
      chatLogList: [],
      logLoading: false,
      groupList: [],
      selectGroupUserId: "",
      activtTabs: "1",
      handleGroupUser: [],
      isAddGroup: false,
      isNotGroupList: false,
      notGroupList: [],
      selectAddList: [],
      addGroupListUser: [],
      isAdmin:false
    };
  },
  computed: {
    groupMessage() {
      return this.$store.state.Socket.groupMessage;
    },
    activityGroup() {
      return this.$store.state.Socket.activityGroup;
    },
    groupBlack() {
      return this.$store.state.Socket.groupBlack;
    },
    userBlack() {
      return this.$store.state.Socket.userBlack;
    },
     groupForbid() {
      return this.$store.state.Socket.groupForbid;
    },
    userForbid() {
      return this.$store.state.Socket.userForbid;
    },
  },
  watch: {
    
    groupMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        if (data.group_id == this.activityGroup.activityId) {
          data.type === 0 &&
            (data.message = conversionFace(data.content || data.message));
          this.chatLogList.push(data);
        }
      },
      deep: true,
    },
    // 拉黑
    groupBlack:{
        handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = 'forbid'
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code:this.$store.state.Login.userInfo.seller_code
        })
      },
      deep: true,
    },
    userBlack:{
        handler(newVal) {
          let data = JSON.parse(JSON.stringify(newVal));
          data.forbid = 'forbid'
          this.chatLogList.push(data);
          this.getGroupMemberList({
            group_id: this.activityGroup.activityId,
            seller_code:this.$store.state.Login.userInfo.seller_code
          })
      },
      deep: true,
    },
    // 禁言
    groupForbid:{
        handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = 'forbid'
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code:this.$store.state.Login.userInfo.seller_code
        })
      },
      deep: true,
    },
    userForbid:{
        handler(newVal) {
          let data = JSON.parse(JSON.stringify(newVal));
          data.forbid = 'forbid'
          this.chatLogList.push(data);
          this.getGroupMemberList({
            group_id: this.activityGroup.activityId,
            seller_code:this.$store.state.Login.userInfo.seller_code
          })
      },
      deep: true,
    },
  },

  methods: {
    ...mapMutations(["SET_CHAT_LIST", "SET_ACTIVITY_GROUP"]),
    ...mapActions(["getGroupList"]),
    sendMessage(content, type) {
      if (!content.length && type === 0) return;
      let my_send = {
        cmd: "user-group",
        message: content,
        from_id: this.$store.state.Login.userInfo.kefu_id,
        from_name: this.$store.state.Login.userInfo.kefu_name,
        from_avatar: this.$store.state.Login.userInfo.kefu_avatar,
        group_id: this.activityGroup.activityId,
        seller_code: this.$store.state.Login.userInfo.seller_code,
        kefu_code: this.$store.state.Login.userInfo.kefu_code,
        state: 1,
        type: type,
        from_ip:this.$store.state.Socket.userIp.ip
      };
      let sendMessage = JSON.parse(JSON.stringify(my_send));
      type === 0 && (sendMessage.message = conversion(my_send.message));
      this.$socket.emit("message", sendMessage);
    },
    uploadImage(file, type) {
      if (!isImage(file.file.type)) {
        this.$toast("请正确选择图片！");
      } else {
        compressImage(
          file.file,
          (imgData) => {
            this.sendMessage(imgData, type);
          },
          (error) => {
            // 压缩出错
            this.$message.error("发送失败，请重新发送！");
          }
        );
      }
    },
    clickMore() {
      if (!this.rightNum) {
        this.rightNum = 5;
        this.centerNum = 14;
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
           seller_code:this.$store.state.Login.userInfo.seller_code
        });
      } else {
        this.rightNum = 0;
        this.centerNum = 19;
      }
    },
    selectGroup(data) {
      if (this.activityGroup.activityId === data.group_id) return;
      this.SET_ACTIVITY_GROUP({
        activityId: data.group_id,
        activityTitle: data.group_name,
        is_invite:data.is_invite
      });
      this.chatLogList = [];
      this.getGroupChatLog({
        group_id: data.group_id,
        kefu_code:this.$store.state.Login.userInfo.kefu_code,
        kefu_id:this.$store.state.Login.userInfo.kefu_id
      });

      if (this.$store.state.Socket.chatList.length) {
        let chatList = this.arrayExists(
          this.$store.state.Socket.chatList,
          data.group_id,
          false
        );
        this.SET_CHAT_LIST(chatList);
      }
      if (this.activtTabs == "1" && this.rightNum) {
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
           seller_code:this.$store.state.Login.userInfo.seller_code
        });
      }
    },
    getGroupChatLog(data) {
      this.logLoading = true;
      getGroupChatLog(data)
        .then((result) => {
          this.logLoading = false;
           this.isAdmin = result.isAdmin
          this.chatLogList = result.data.map((item) => {
            if (item.type == 0) {
              item.content
                ? (item.content = conversionFace(item.content))
                : (item.message = conversionFace(item.message));

            }
            return item;
          });
        })
        .catch((err) => {
          this.logLoading = false;
        });
    },
    getGroupMemberList(data) {
      this.groupList=[]
      this.isGroupList = true;
      getGroupUsersList(data)
        .then((result) => {
          this.isGroupList = false;
          if (result.code === 0) {
            result.data.forEach((item,index) => {
              item.value = index;
            });
            this.groupList = result.data;
          }
        })
        .catch((err) => {
          this.isGroupList = false;
        });
    },
    operationGroupUser() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error("请选择操作的群成员！");
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        let { uid, username } = item;
        return { uid, username };
      });
        this.executionKickOut(arr);
    },
    // 批量禁言
    disableSendMsg(){
       if (this.handleGroupUser.length <= 0) {
        this.$message.error("请选择操作的群成员！");
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        if(item.type == 1){ 
          return { 
            kefu_code:item.kefu_code,
            username:item.username,
            type:item.type
            };
        }else {
          return {username:item.username};
        }
      });
      this.stopSpeak(arr);
    },
    //禁言
    stopSpeak(arr){
      this.$socket.emit("message",{
        cmd:'forbid',
        seller_code:this.$store.state.Login.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        username:arr,
        from_name:this.$store.state.Login.userInfo.kefu_name
      });
      this.handleGroupUser = [];
      this.checkedList = [];
     
      // prohibitSay({
      //   group_id: this.activityGroup.activityId,
      //   users: data,
      // }).then((result) => {
      //   this.checkedList = [];
      //   this.handleGroupUser = [];
      //   this.$message.success(result.msg);
      // });
    },
    // 解禁
    removeforbid(){
        if (this.handleGroupUser.length <= 0) {
        this.$message.error("请选择操作的群成员！");
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
         if(item.type == 1){ 
          return {
            kefu_code:item.kefu_code,
            username:item.username,
            type:item.type
          };
        }else {
          return {username:item.username};
        }
      });
      this.sendForbidMessage(arr)
        this.handleGroupUser = [];
        this.checkedList = [];
        
    },
    sendForbidMessage(arr){
       this.$socket.emit("message",{
          cmd:'removeforbid',
          seller_code:this.$store.state.Login.userInfo.seller_code,
          users:arr, 
          from_name:this.$store.state.Login.userInfo.kefu_name,
           group_id: this.activityGroup.activityId,
        });
    },
    // 加入黑名单
    addBlacks(){
      if (this.handleGroupUser.length <= 0) {
        this.$message.error("请选择操作的群成员！");
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
          if(item.type == 1){
          return {
            ip:item.login_ip,
            kefu_code:item.kefu_code,
            username:item.username,
            type:item.type,
            };
        }else {
          return {ip:item.login_ip,username:item.username};
        }
      });
      this.addBlacklist(arr);
    },   
    addBlacklist(data) {
      let params ={
        cmd:'black',
        oper_kefu_id:this.$store.state.Login.userInfo.kefu_id,
        seller_code:this.$store.state.Login.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        users:data,
        from_name:this.$store.state.Login.userInfo.kefu_name
      }
      this.$socket.emit("message",params );
      this.handleGroupUser = [];
      this.checkedList = [];
      
    },
    // 解除黑名单
    removeblack(){
       if (this.handleGroupUser.length <= 0) {
        this.$message.error("请选择操作的群成员！");
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
         if(item.type == 1){ 
          return {
            ip:item.login_ip,
            kefu_code:item.kefu_code,
            username:item.username,
            type:item.type,
          };
        }else {
          return {ip:item.login_ip,username:item.username};
        }
        
      });
      this.sendBlackMessage(arr)
        this.handleGroupUser = [];
        this.checkedList = [];
    },
    sendBlackMessage(arr){
       this.$socket.emit("message",{
          cmd:'removeblack',
          seller_code:this.$store.state.Login.userInfo.seller_code,
          users:arr,
          from_name:this.$store.state.Login.userInfo.kefu_name,
           group_id: this.activityGroup.activityId,
        });
    },
    executionKickOut(data) {
      kickUsersGroup({
        group_id: this.activityGroup.activityId,
        users: data,
      }).then((result) => {
        this.$message.success(result.msg);
        this.handleGroupUser = [];
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code:this.$store.state.Login.userInfo.seller_code
        });
      });
    },
    getNotGroupUsersList() {
      this.isNotGroupList = true;
      getNotGroupUsersList({
        seller_code: this.$store.state.Login.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        keywords: "",
      })
        .then((result) => {
          this.isNotGroupList = false;
          if (result.code == 0) {
            let arr = result.data.map((item) => {
              item.value = item.uid;
              return item;
            });
            this.notGroupList = [...arr];
          }
        })
        .catch((err) => {
          this.isNotGroupList = false;
        });
    },
    addGroup() {
      this.isAddGroup = true;
      this.getNotGroupUsersList();
    },
    // 确定拉入群聊
    handleAddGroup(data) {
      if (this.addGroupListUser.length <= 0) {
        this.$message.error("请选择添加成员！");
        return;
      }
      let arr = this.addGroupListUser.map((item) => {
        let { uid, username, headimg } = item;
        return { uid, username, headimg };
      });
      pullUsersGroup({
        group_id: this.activityGroup.activityId,
        kefu_id: this.$store.state.Login.userInfo.kefu_id,
        seller_code: this.$store.state.Login.userInfo.seller_code,
        users: arr,
      }).then((result) => {
        this.isAddGroup = false;
        this.$message.success(result.msg);
        this.addGroupListUser = [];
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
           seller_code:this.$store.state.Login.userInfo.seller_code
        });
      });
    },
    onChangeAddGroupUser(vals) {
      this.addGroupListUser = this.notGroupList.filter((item) => {
        return vals.includes(item.uid);
      });
    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr));
      let list = con_arr.map((item) => {
        item.group_id == value && (item.noReadNum = bool ? item.noReadNum+1 :0);
        return item;
      });
      return list;
    },
    onChangeCheckbox(vals) {
      let arr=[]
      vals.forEach(item=>{
      arr.push(this.groupList[item])
      })
       this.handleGroupUser = arr
    },
    onChangeAddList(vals) {
      this.selectList = this.addGroupList.filter((item) => {
        return vals.includes(item.uid);
      });
    },
    updataBlack(){
      
    }
  },
  created() {},
  mounted() {
    this.logLoading = true;
    this.getGroupList({
      kefu_id:this.$store.state.Login.userInfo.kefu_id
    }).then((result) => {
      if (this.$store.state.Socket.chatList.length) {
        if(!this.activityGroup.activityId){
            this.SET_ACTIVITY_GROUP({
            activityId: this.$store.state.Socket.chatList[0].group_id,
            activityTitle: this.$store.state.Socket.chatList[0].group_name,
            is_invite:this.$store.state.Socket.chatList[0].is_invite
          });
          let arr = JSON.parse(JSON.stringify(this.$store.state.Socket.chatList));
          arr[0].noReadNum = 0;
          this.SET_CHAT_LIST(arr);
          this.chatLogList = [];
          this.getGroupChatLog({
            group_id: this.$store.state.Socket.chatList[0].group_id,
            kefu_id:this.$store.state.Login.userInfo.kefu_id,
            kefu_code:this.$store.state.Login.userInfo.kefu_code
          });
        }else {
          let arr = JSON.parse(JSON.stringify(this.$store.state.Socket.chatList));
         let list = arr.map(item =>{
            item.group_id === this.activityGroup.activityId && (item.noReadNum = 0)
            return item
          })
          this.SET_CHAT_LIST(list);
          this.chatLogList = [];
          this.getGroupChatLog({
            group_id: this.activityGroup.activityId,
            kefu_id:this.$store.state.Login.userInfo.kefu_id,
            kefu_code:this.$store.state.Login.userInfo.kefu_code
          });
        }
    }
    }).catch((err) => {
    });
   
  },
};
</script>

<style lang="less" scoped>
.groupChat {
  background-color: #fff;
  height: 100%;
}

.list_loading {
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 30px 50px;
  margin: 20px 0;
}

.activt_item {
  background-color: #ccc;
}

.hover_item {
  &:hover {
    background-color: #ccc;
  }
}

.chat_content {
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat_left {
  padding: 10px;
  height: 100%;
  background-color: #eee;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}

.more {
  font-size: 25px;
  margin-right: 10px;
  color: #848484;
  &:hover {
    color: #444444;
  }
}

.member_item {
  background-color: #ccc;
}
/deep/ .ant-checkbox-group-item {
  display: flex;
  align-items: center;
  padding: 5px;
}

.group_list {
  min-height: 40vh;
  max-height: 45vh;
  overflow: auto;
  // padding: 0 10px;
  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}
.checkboxLabel {
  display: flex;
  align-items: center;
  .group_list_item {
    display: flex;
    .headimg {
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }
  }
  .group_list_item_username {
    padding-left: 10px;
  }
}
.info {
  .title {
    padding: 0 10px;
    height: 35px;
    background-color: #eee;
    line-height: 35px;
  }

  .subTitle {
    padding: 0 10px;
    height: 35px;
    line-height: 35px;

    span {
      margin-left: 20px;
    }
  }
}

.remark_content {
  border: 1px solid #eee;
  border-radius: 10px;
  margin: 10px;
}
.is_stop_speak{
  margin-left:20px;
  color:#ccc
  
}
.other{
      overflow: auto;
    max-height: 150px;
  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}
</style>
