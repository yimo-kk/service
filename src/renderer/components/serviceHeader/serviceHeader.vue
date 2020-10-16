<template>
  <div class="serviceHeader">
    <div v-if="Object.keys(this.$store.state.Login.userInfo).length>0" class="flex_up_down_center">
      <div>
        <a-badge
          :status=" kefuStatus == 1 ? 'success':kefuStatus == 2 ? 'warning':'default'"
          style="display: flex;"
          :offset="[0,25]"
          :title="kefuStatus == 1 ?'在线':kefuStatus == 2 ? '离开':'离线'"
        >
          <a-avatar :src="$store.state.Login.userInfo.kefu_avatar"   :title="kefuStatus == 1 ?'在线':kefuStatus == 2 ? '离开':'离线'" />
        </a-badge>
      </div>
      <div class="flex_up_down_center login_state">
        <a-dropdown placement="bottomLeft">
          <a-button type="link">
            {{ this.$store.state.Login.userInfo.kefu_name }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item>
              <p @click="setStatus(1)">在线</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="setStatus(2)">离开</p>
            </a-menu-item>
             <a-menu-item>
              <p @click="setStatus(0)">离线</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="refresh">刷新</p>
            </a-menu-item>
            <a-menu-item>
              <p  @click="confirm">退出</p>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <!-- <div v-else>
      <a-avatar>
        <a-icon slot="icon" type="user" />
      </a-avatar>
      <router-link :to="{name:'Login'}">
        <a-button type="link">未登录...</a-button>
      </router-link>
    </div>-->
  </div>
</template>

<script>
import { mapMutations} from "vuex";
export default {
  name: "ServiceHeader",
  components: {},
  inject: ['reload'],
  data() {
    return {
    };
  },
  computed: {
     kefuStatus() {
      return this.$store.state.Socket.kefuStatus.online_status
    }
  },
  watch: {
     kefuStatus: {
      handler(newVal) {
        // this.$message.success(`${newVal == 1 ?'修改为在线状态':newVal == 2 ? '修改为离开状态':'修改为离线状态'}`)
      }
     }
  },
  methods: {
    ...mapMutations(['RESETVUEX']),
    confirm() {
      let that = this
      this.$confirm({
        title: "提示",
        content: "确定要退出登录吗？",
        okText: "确认",
        cancelText: "取消",
        onOk() {
          that.$store.dispatch("outLogin");
          that.$router.push({
            name: "Login",
          });
          that.RESETVUEX()
        },
        onCancel() {},
      });
    },
    refresh(){
      // location. reload()
      this.reload()
    },
    setStatus(index){
      let that = this
       this.$confirm({
        title: '提示',
        content: `确认修改为${index == 1 ?'在线':index == 2 ? '离开':'离线'}状态？`,
        okText: '确认',
        cancelText: '取消',
         onOk() {
           that.$emit('setStatus',index)
         } 
      });
    }
  },

  created() {},
  mounted() {},
};
</script>

<style lang="less" scoped>
.serviceHeader {
  color: #fff;
  margin-right: -30px;
  padding-top: 15px;

  .login_state {
    padding-top: 10px;
  }

  .notLogin {
    padding-top: 10px;
  }
}
</style>
