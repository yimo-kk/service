<template>
  <div class="current_chat">
    <div v-if="loading" style="paddingTop:50px; text-align: center;">
      <a-spin></a-spin>
    </div>
    <div v-if="currentChatList.length && !loading" style="height:100%">
      <a-row style="height:100%">
        <a-col :span="5" class="chat_left">
          <div
            v-for="(item,index) in currentChatList"
            :key="item.uid"
            :class="[item.uid==currentUser.activtyUid ?'activt_item':'','current_list']"
            style="padding:5px 10px 5px 10px"
            @contextmenu.prevent="currentChatListItem"
          >
            <div>
              <ListItem
              :data-index="index"
              :index="index"
              :groupData="item" 
               :isHeadImg="false"
              @selectGroup="selectGroup"
              @handleRight="handleRight"
            ></ListItem>
            </div>
          </div>
        </a-col>
        <a-col :span="centerNum" style="height:100%">
          <div class="chat_content">
            <a-page-header
              style="background:#f5f5f5;border-bottom: .5px solid #efefef"
              :title="currentUser.activtyeUsername"
            >
              <template slot="extra">
                <p key="1" class="more" @click="clickMore" :title="rightNum?$t('putAway'):$t('unfold')">
                  <a-icon type="ellipsis" />
                </p>
              </template>
            </a-page-header>
            <ChatBox
              ref="chatBox"
              :isName="false"
              :chatLogList="currentChatLogList"
              @sendMessage="sendMessage"
              :logLoading='logLoading'
              @uploadImage="uploadImage"
              @uploadFile="uploadFile"
            ></ChatBox> 
          </div>
        </a-col>
        <a-col :span="rightNum">
          <transition name="bounce">
            <div v-show="rightNum" >
              <a-tabs type="card" @change="changeTabs" v-model="activityId">
                <a-tab-pane key="1" :tab="$t('currentInfo.userInfo')">
                  <CurrentOperation @multitapConversation='multitapConversation' @closeChat='closeConversation' ></CurrentOperation>
                </a-tab-pane>
                <a-tab-pane key="2" :tab="$t('currentInfo.quickReply')">
                  <div class="search" style="position:relative;">
                    <a-input-search  v-model="searchKeyword" :placeholder="$t('currentInfo.pleaseEnterKeyword')" :loading='isSearch'   enter-button @search="onSearch"  />
                     <a-icon type="close" v-if="isSearchList" style="position: absolute;bottom: -22px;right: 10px;" @click="isSearchList=false"/>
                  </div>
                  <div v-if="isSearchList" class="question_list" >
                      <div v-if="searchList.length" style="padding:10px">
                         <div v-for="val in searchList" :key="val.word_id" style="padding:0 10px">
                            <a-tooltip placement="bottom" :mouseEnterDelay='1'>
                              <template slot="title">
                                {{val.word}}
                              </template>
                            <p class="question dwote" @click.stop="speedySennd(val.word)" >{{val.word}}</p>
                            </a-tooltip>
                          </div>
                      </div>
                      <div v-else class="not_available">
                        {{$t('currentInfo.noRelatedQuestions')}}
                      </div>
                  </div>
                  <div v-else  class="question_list">
                    <a-collapse accordion>
                      <a-collapse-panel
                        v-for=" item in replyList"
                        :header="item.cate_name"
                        :key="item.cate_id.toString()"
                      >
                        <div> 
                          <div v-for="val in item.word" :key="val.word_id">
                            <a-tooltip placement="bottom" :mouseEnterDelay='1'>
                              <template slot="title">
                                {{val.word}}
                              </template>
                            <p class="question dwote" @click="sendMessage(val.word,0)" >{{val.word}}</p>
                            </a-tooltip>
                          </div>
                        </div>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                  
                </a-tab-pane>
              </a-tabs>
            </div>
          </transition>
        </a-col>
      </a-row>
    </div>
    <!-- 无会话展示 -->
    <div v-else-if="!loading" style="paddingTop:35px">
      <a-empty :image-style="{
      height: '100%',
    }">
        <span slot="description">{{$t('noCurrent')}}</span>

        <a-button type="primary" @click="goAwaitChat">{{$t('receive')}}</a-button>
      </a-empty>
    </div>
    <div id="close" v-show="close" class="menu_close" :style="{left:left+'px',top:top+'px'}">
      <p @click.stop="closeConversation">
         <a-icon type="close-circle" style="color:#ccc" />  {{$t('currentInfo.closeSession')}}
      </p>
      <p @click.stop="multitapConversation">
        <customIcon type="icon-zhuanjie" style="fontSize:12px;color:#ccc"></customIcon>  {{$t('currentInfo.transferSession')}}
      </p>
    </div>
    <!-- 转接 -->
    <a-modal v-model="isMultitap" :footer="null" width="50%">
      <Multitap :technologyList="technologyList" :multitapLoading="multitapLoading" :groupTitle='groupTitle' @confirm='confirm'></Multitap>
    </a-modal>
  </div>
</template>


<script>
import ListItem from "@/components/chatBox/listItem";
import ChatBox from "@/components/chatBox/chatBox";
import CurrentOperation from "./component/currentOperation";
import Multitap from "./component/multitap";
import common from "@/mixins/common";
import {
  getUserChatLog,
  closeChat,
  getSellerWordList,
  reLink,
  searchSellerWord
} from "@/api/current.js";
import { mapMutations, mapActions } from "vuex";
import {
  conversionFace,
  compressImage,
  isImage,
  conversion,
} from "@/utils/libs.js";
export default {
  name: "CurrentChat",
  mixins: [common()],
  components: {
    ListItem,
    ChatBox,
    CurrentOperation,
    Multitap,
  },
  props: {},
  data() {
    return {
      logLoading:false,
      isSearch:false, 
      loading: false,
      centerNum: 13,
      rightNum: 6,
      currentChatLogList: [],
      replyList: [],
      close: false,
      left: 0,
      top: 0,
      currentId: null,
      isMultitap: false,
      multitapLoading: false,
      technologyList: [],
      activityId:'1',
      login_ip:'',
      area:'',
      searchList:[],
      isSearchList:false,
      searchKeyword:'',
      groupTitle:''
    };
  },
  computed: {
    userMessage() {
      return this.$store.state.Socket.userMessage;
    },
    refuseMessage() {
      return this.$store.state.Socket.refuseMessage;
    },
    currentUser() {
      return this.$store.state.Socket.currentUser;
    },
    currentChatList() {
      return this.$store.state.Socket.currentChatList;
    },
     userInfo(){
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[this.$route.query.kefu_code]
    }
  },
  watch: {
    // 收到用户发来消息
    userMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        if (data.from_name == this.currentUser.activtyeUsername) {
          data.type === 3 && (data.message.play = false);
          data.type === 0 &&
            (data.message = conversionFace(data.content || data.message));
          this.currentChatLogList.push(data);
        }
      },
      deep: true,
    },
    //转接接受或拒绝
    refuseMessage: {
      handler(newVal) {
        if (newVal.type) {
          if (newVal.kefu_code === this.userInfo.kefu_code) {
            this.SET_CURRENT_USER({
              activtyUid: null,
              activtyeUsername: "",
              login_ip:'', 
              area:''
            });
            this.$message.success(newVal.message);
          }
          let list=[]
          JSON.parse(JSON.stringify(this.currentChatList)).forEach(item=>{
            if(item.username != newVal.username){
              list.push(item)
            }
          })
            this.SET_CURRENT_CHAT_LIST(list)
        } else {
          this.$message.error(newVal.message);
        }
       let arr = JSON.parse(JSON.stringify(this.currentChatList)).map(item=>{
          if(item.username == newVal.username){
             item.isMultitap = false
          }
          return item
        })
        this.SET_CURRENT_CHAT_LIST(arr)
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(['getCurrentListData']),
    ...mapMutations(["SET_CURRENT_USER",'SET_CURRENT_CHAT_LIST']),
    goAwaitChat() {
      this.$emit("goAwaitChat", { key: "AwaitChat" });
    },
    changeTabs(val) {
      if(val=='2'){
        this.getSellerWordList();
      }
    },
    clickMore() {
      if (!this.rightNum) {
        this.rightNum = 6;
        this.centerNum = 13;
       
      } else {
        this.rightNum = 0;
        this.centerNum = 19;
      }
    },
    selectGroup(data) {
      if (this.currentUser.activtyUid == data.uid) return;
      this.SET_CURRENT_USER({
        activtyUid: data.uid,
        activtyeUsername: data.username,
        login_ip:data.login_ip, 
        area:data.area
      });
      this.getUserChatLog({
        username: data.username,
        kefu_code: this.userInfo.kefu_code,
        kefu_id: this.userInfo.kefu_id,
      });
    },
    getCurrentList(username) {
      this.loading = true;
      this.getCurrentListData().then((result) => {
        if (this.currentChatList.length) {
          if(username){ 
            this.currentChatList.forEach(item=>{
              if(item.username == username){
                this.SET_CURRENT_USER({
                  activtyUid: item.uid,
                  activtyeUsername: item.username,
                  login_ip:item.login_ip, 
                  area:item.area
                });
              }
            })
          }
          if (
            this.currentUser.activtyUid &&
            this.currentUser.activtyeUsername
          ) { 
            this.currentChatLogList = [];
          } else { 
            this.SET_CURRENT_USER({
              activtyUid: this.currentChatList[0].uid,
              activtyeUsername: this.currentChatList[0].username,
              login_ip:this.currentChatList[0].login_ip, 
              area:this.currentChatList[0].area
            });
          }
           this.getUserChatLog({
              username: this.currentUser.activtyeUsername,
              kefu_code: this.userInfo.kefu_code,
              kefu_id: this.userInfo.kefu_id,
            });
        } else {
          this.loading = false;
        }
      });
    },
    getUserChatLog(params) {
      this.logLoading = true
      this.currentChatLogList = [];
      getUserChatLog(params).then((result) => {
        this.logLoading =false
        this.currentChatLogList = result.data.map((item) => {
          if (item.type == 0) {
            item.content
              ? (item.content = conversionFace(item.content))
              : (item.message = conversionFace(item.message));
          } else if (item.type == 3) {
            item.play = false;
          }
          return item;
        })
        this.loading = false;
        this.SET_CURRENT_CHAT_LIST(this.arrayExists(
          this.currentChatList,
              params.username,
              false
        ))    
      })
      .catch(()=>{
          this.logLoading =false
        })
    },
    closeConversation(val) {
        let that = this
        let id = null
        let userNmae=''
        if(val == 'col'){
        id = that.currentUser.activtyUid
          userNmae = that.currentUser.activtyeUsername
        }else {
          id= that.currentChatList[that.currentId].uid
          userNmae = that.currentChatList[that.currentId].username
          }
        this.$confirm({    
           title: this.$t('prompt'),
          content: `${this.$t('confirmCancel') }${userNmae} ${this.$t('conversation')}`,
          okText: this.$t('determine'),
          cancelText: this.$t('cancel'),
          onOk() {
            closeChat({
                uid:id,
                kefu_code: that.userInfo.kefu_code,
              }).then((result) => {
              if (result.code == 0) {
                let params = {
                  from_avatar: that.userInfo.kefu_avatar,
                  from_name: that.userInfo.kefu_name,
                  kefu_code: that.userInfo.kefu_code,
                  username: userNmae,
                  cmd: "service-score",
                };
                that.$socket.emit("message", params);
                that.$message.success("删除成功！");
                that.close = false
                that.SET_CURRENT_USER({ activtyUid: null, activtyeUsername: "",login_ip:'', area:'' });
                that.getCurrentList();
              }
            });
          }
        })
     
    },
    getSellerWordList() {
      getSellerWordList({
        seller_id: this.userInfo.seller_id,
        seller_code: this.userInfo.seller_code,
      }).then((result) => {
        this.replyList = result.data;
      });
    },
    sendMessage(content, type) {
      if (type === 0 && !content.length) return;
      let my_send = {
        cmd: "service-msg",
        from_id: this.userInfo.kefu_id,
        from_name: this.userInfo.kefu_name,
        from_avatar: this.userInfo.kefu_avatar,
        kefu_code: this.userInfo.kefu_code,
        seller_code: this.userInfo.seller_code,
        to_name: this.currentUser.activtyeUsername,
        to_id: this.currentUser.activtyUid,
        message: content,
        type: type,
      };
      let sendMessage = JSON.parse(JSON.stringify(my_send));
      type === 3 && (my_send.message.play = false);
      type === 0 && (sendMessage.message = conversion(my_send.message));
      this.currentChatLogList.push(my_send);
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
    uploadFile(data, type) {
      this.sendMessage(data, type);
    },
    confirm(val) {
      let id = null
      let userNmae=''
       if(this.currentId){
        id= this.currentChatList[this.currentId].uid
        userNmae = this.currentChatList[this.currentId].username
      }else {
        id = this.currentUser.activtyUid
        userNmae = this.currentUser.activtyeUsername
      }
      this.$socket.emit("message", {
        user_id: id,
        user_name: userNmae,
        from_kefu_id: this.userInfo.kefu_id,
        from_kefu_name: this.userInfo.kefu_name,
        from_kefu_code: this.userInfo.kefu_code,
        to_kefu_code: val.kefu_code,
        to_kefu_name: val.kefu_name,
        seller_code: this.userInfo.seller_code,
        cmd: "service-relink",
      });
      this.currentId=null 
      this.groupTitle =''
      this.isMultitap= false
      this.$message.success(`等待${ val.kefu_name}接受转接!`)
      let arr = JSON.parse(JSON.stringify(this.currentChatList))
      let list = arr.map((item) => {
          item.username == userNmae && (item.isMultitap=true )
          return item;
      });
      this.SET_CURRENT_CHAT_LIST(list)

    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr));
      let list = con_arr.map((item) => {
        item.username == value && (item.noReadNum = bool?item.noReadNum + 1 :0);
        return item;
      });
      return list;
    },
    currentChatListItem(e) {
      this.currentId = e.target.dataset.index;
    },
    handleRight(e) {
      this.close = true;
      this.left = e.pageX;
      this.top = e.pageY;
    },
    multitapConversation() {
      this.close= false
      this.multitapLoading = true;
      reLink({
        seller_id: this.userInfo.seller_id,
        kefu_code: this.userInfo.kefu_code,
      })
        .then((result) => {
          this.multitapLoading = false;
          if (result.code === 0) {
            this.technologyList = result.data;
             if(this.currentId){
                this.groupTitle = this.currentChatList[this.currentId].username
             }else {
                  this.groupTitle  = this.currentUser.activtyeUsername
             } 
          }
        })
        .catch((err) => {
          this.multitapLoading = false;
        });
      this.isMultitap = true;
    },
    onSearch(val){
      this.isSearch = true
      if(!val){
         this.searchList=[]
         this.isSearch = false
         this.isSearchList=true
         return
      }
      searchSellerWord({
        seller_code:this.userInfo.seller_code,
        keywords:val
      })
      .then((result) => {
        this.searchList = result.data
        this.isSearchList=true
        this.isSearch = false
      })
    },
    speedySennd(val){
      this.searchKeyword=''
      this.isSearchList=false,
      this.sendMessage(val,0) 
    }
  },
  created() {},
  mounted() {
    let oldArr = JSON.parse(JSON.stringify(this.currentChatList))
    this.getCurrentList()
    let _this = this;
    document.addEventListener("click", function (e) {
      // 下面这句代码是获取 点击的区域是否包含你的菜单，如果包含，说明点击的是菜单以外，不包含则为菜单以内
      let flag = e.target.contains(
        document.getElementsByClassName("menu_close")[0]
      );
      if (flag) return;
      _this.close = false;
    });
  },
};
</script>

<style lang="less" scoped>
.current_chat {
  height: 100%;

  background-color: #fff;
}

.groupChat {
  background-color: #fff;
  height: 100%;
}

.activt_item {
  background-color: #ccc;
}

.chat_content {
  // border-left: 1px solid #eee;
  // border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat_left {
  height: 100%;
  overflow: auto;
  background-color: #eee;

  &::-webkit-scrollbar {
    width: 4px;
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
.question_list{
  height: calc(100vh - 170px);
  overflow: auto;
  &::-webkit-scrollbar {
      width: 4px;
      /*高宽分别对应横竖滚动条的尺寸*/
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: #d8d8d8;
    }
}
.question {
  line-height: 20px;
  border-radius: 3px;
  padding: 5px;
  max-width: 100%;

  cursor: pointer;
  &:hover{
    color: #fff;
    background-color: #1890ff;
  }
}

.send_question {
  width: 40px;
  height: 25px;
  text-align: center;
  line-height: 25px;
  border-radius: 3px;
  background-color: #eee;
  border-left: 1px solid #eee;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    color: #fff;
    background-color: #1890ff;
  }
}
.menu_close {
  position: fixed;
  background-color: #fff;
  box-shadow: 0px 0px 4px 1px #ccc;
  color: #000;
  font-size: 12px;
  // text-align: center;
  z-index: 11;

  cursor: pointer;
  p {
     padding: 5px 10px;
    border-bottom: 1px solid #ccc;
    &:hover {
      background-color: #eee;
      color: #1890ff;
    }
  }
}
.search{
  margin-bottom: 5px;
  border: 1px solid #eee;
}
.not_available{
    font-size: 12px;
    text-align: center;
    margin-top: 10px;
}
.current_list{
  &:hover{
    background-color: #ccc;
  }
}
</style>
