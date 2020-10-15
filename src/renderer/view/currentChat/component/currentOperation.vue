<template>
  <div class="current_operation">
    <div class="info">
      <p class="title">访问信息</p>
      <p class="subTitle">
        IP:
        <span>{{ currentUser.login_ip}}</span>
      </p>
      <p class="subTitle">
        地区：
        <span>{{ currentUser.area}}</span>
      </p>
    </div>
    <div class="remark info">
      <p class="title">其他操作</p>
      <a-button @click="multitapConversation">
        <customIcon type="icon-zhuanjie" style="fontSize:16px"></customIcon>转接当前会话
      </a-button>
      <a-button @click="closeChat">
        <a-icon type="close-circle"  />关闭当前会话
      </a-button>
    </div>
  </div>
</template>

<script>
import { reLink } from "@/api/current.js";

export default {
  name: "CurrentOperation",
  props: {
    groupTitle: {
      type: String,
    },
  },
  components: {},
  data() {
    return {
      IP: "",
      adress: "",
    };
  },
  computed: {
      currentUser() {
      return this.$store.state.Socket.currentUser;
    },
  },
  watch: {},
  methods: {
    multitapConversation() {
      this.$emit("multitapConversation",'col');
    },
    closeChat(){
       this.$emit("closeChat",'col');
    }
  },
  created() {},
  mounted() {
    
  },
};
</script>

<style lang="less" scoped>
.current_operation {
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
}
</style>
