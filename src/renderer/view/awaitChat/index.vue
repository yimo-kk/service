<template>
  <div class="await_list">
    <a-divider orientation="left">待接待用户列表</a-divider>
    <div class="handle">
      <div class="search">
        <a-input-search placeholder="请输入用户名" allowClear enter-button @search="onSearch" />
      </div>
    </div>
    <div class="tabl_list">
      <a-table
        :rowKey="(row)=>{return row.customer_id}"
        :columns="columns"
        :data-source="awaitList"
        :pagination="pagination"
        size="small"
        :loading="loading"
        @change="handleTableChange"
        :scroll="{ y: 320 }"
      >
        <p slot="customer_avatar" slot-scope="scope">
          <a-avatar :src="scope" />
        </p>
        <p slot="is_tourist" slot-scope="num">{{num == 0 ? '游客访问':'用户'}}</p>
        <div slot="uid" slot-scope="customer_id,data">
          <a-button type="primary" size="small" @click="reception(data)">接待</a-button>
        </div>
      </a-table>
    </div>
  </div>
</template>

<script>
import { getCustomerQueue, reception } from "@/api/await.js";
import { mapMutations, mapActions } from "vuex";
const columns = [
  {
    title: "访客头像",
    dataIndex: "customer_avatar",
    scopedSlots: {
      customRender: "customer_avatar",
    },
    align: "center",
  },
  {
    title: "访客名称",
    dataIndex: "customer_name",
    ellipsis: true,
    align: "center",
  },
  {
    title: "访客ip",
    dataIndex: "customer_ip",
    ellipsis: true,
    align: "center",
  },
  {
    title: "访问时间",
    dataIndex: "create_time",
    ellipsis: true,
    align: "center",
  },
  {
    title: "访客类型",
    dataIndex: "is_tourist",
    ellipsis: true,
    scopedSlots: {
      customRender: "is_tourist",
    },
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "customer",
    scopedSlots: {
      customRender: "uid",
    },
    align: "center",
  },
];
export default {
  name: "AwaitChat",
  components: {},
  data() {
    return {
      pagination: {},
      loading: false,
      columns,
    };
  },
  computed: {
      awaitList() {
      return this.$store.state.Socket.awaitList;
    },
  },
  watch: {},
  sockets: {},
  methods: {
    ...mapActions(["getAwaitList",'getCurrentListData']),
    ...mapMutations(['SET_AWAIT_LIST']),
    deleteDataItem(customer_id){
      let arr = []
     this.awaitList.forEach((item,index) => {
       if(item.customer_id != customer_id){
        arr.push(item)
       }
     });
    this.SET_AWAIT_LIST(arr)
    },
    reception(data) {
      let that = this;
      this.$confirm({
        content: `确定接待${data.customer_name}吗？`,
        okText: "确认",
        cancelText: "取消",
        onOk() {
          let params = {
            kefu_code: that.$store.state.Login.userInfo.kefu_code,
            kefu_name: that.$store.state.Login.userInfo.kefu_name,
            seller_code: that.$store.state.Login.userInfo.seller_code,
            uid: data.customer_id,
          };
          reception(params).then((result) => {
            let socketMessage = {
              username: data.customer_name,
              kefu_code: that.$store.state.Login.userInfo.kefu_code,
              uid:data.customer_id,
              seller_code:that.$store.state.Login.userInfo.seller_code,
              kefu_name: that.$store.state.Login.userInfo.kefu_name,
              cmd: "service-prompt",
            };
            that.$socket.emit("message", socketMessage);
            that.$store.commit("SET_CURRENT_USER", {
              activtyUid: data.customer_id,
              activtyeUsername: data.customer_name,
              login_ip:data.customer_ip, 
              area:data.customer_area
            });
            that.$emit("selectMenu", { key: "CurrentChat" });
            // that.deleteDataItem(data.customer_id);
            that.getCurrentListData()
          });
        },
      });
    },
    onSearch(val) { 
      this.getAwaitList({
        seller_code: this.$store.state.Login.userInfo.seller_code,
        username: val,
      });
    },

    // getAwaitListData(data) {
    //   this.loading = true;
    //   this.getAwaitList(data)
    //     .then((result) => {
    //       this.loading = false;
    //       const pagination = {
    //         ...this.pagination, 
    //       };
    //       pagination.total = result.data.length;
    //       this.pagination = pagination;
    //     })
    //     .catch((err) => {
    //       this.loading = false;
    //     });
    // },
    // 分页
    handleTableChange(pagination) {
      const pager = {
        ...this.pagination,
      };
      pager.current = pagination.current;
      this.pagination = pager;
      // this.getAwaitList({
      //   seller_code: this.$store.state.Login.userInfo.seller_code,
      //   username: "",
      // });
    },
  },
  mounted() {
    // this.getAwaitList({
    //   seller_code: this.$store.state.Login.userInfo.seller_code,
    //   username: "",
    // });
  },
};
</script>

<style lang="less" scoped>
.await_list {
  overflow: auto;

  // background-color: #fff;
  .handle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 50px;
  }

  .search {
    width: 300px;
  }

  .tabl_list {
    padding: 0 50px;
  }

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

.refresh_btn {
  text-align: right;
  margin-right: 20px;
  margin-bottom: 8px;
}
</style>
