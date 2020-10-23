<template>
  <div class="multitap">
    <div>
      <a-spin v-if="multitapLoading" />
     <div v-else>
          <a-tabs
        v-if="technologyList.length "
        :default-active-key="technologyList[0].group_id.toString()"
        @change="callback"
      >
        <a-tab-pane
          :tab="item.group_name"
          v-for="(item) in technologyList"
          :key="item.group_id.toString()"
        >
          <div v-if="item.kefu.length">
            <a-table
              size="small"
              :columns="columns"
              :rowKey="(row,index)=>{return index}"
              :data-source="item.kefu"
            >
              <div slot="kefu_avatar" slot-scope="kefu_avatar,data">
                 <a-badge
                  :status=" data.online_status == 1 ? 'success':data.online_status == 2 ? 'warning':'default'"
                  :offset="[0,25]"
                  :title="data.online_status == 1 ?'在线':data.online_status == 2 ? '离开':'离线'"
                >
                  <img v-lazy="kefu_avatar" alt style="width:30px;height:30px" />
                </a-badge>
                
              </div> 
              <div
                slot="max_service_num"
                slot-scope="max_service_num,data"
                class="flex_up_down_center"
              >
                <a-icon type="user" />
                <p>{{`${data. now_service_num}/${data.max_service_num}`}}</p>
              </div>
              <div slot="operation" slot-scope="operation,data">
                 <a-button type="link" @click="relink(data)">转接</a-button>
              </div>
            </a-table>
          </div>
          <div v-else>
            <a-empty />
          </div>
        </a-tab-pane>
      </a-tabs>
      <div v-else>
        <a-empty />
      </div>
     </div>
    </div>
  </div>
</template>

<script>
const columns = [
  {
    title: "头像",
    dataIndex: "kefu_avatar",
    scopedSlots: {
      customRender: "kefu_avatar",
    },
  },
  {
    title: "昵称",
    dataIndex: "kefu_name",
  },
  {
    title: "接待人数",
    dataIndex: "max_service_num",
    scopedSlots: {
      customRender: "max_service_num",
    },
  },
  {
    title: "操作",
    dataIndex: "operation",
    scopedSlots: {
      customRender: "operation",
    },
  },
];
export default {
  name: "Multitap",
  components: {},
  props: {
    technologyList: {
      type: Array,
      default() {
        return [];
      },
    },
    multitapLoading: {
      type: Boolean,
      default: false,
    },
    groupTitle: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      columns,
    };
  },
  computed: {},
  watch: {},
  methods: {
    // confirm(val) {
    //   this.$emit("confirm", val);
    //   this.isMultitap = false;
    // },
    callback(){},
    relink(data){
      let that = this
        this.$confirm({
        title: "转接",
        content: `${data.online_status == 2 ?'当前客服处于离开状态，':''}您确定将${this.groupTitle}转接给${data.kefu_name}吗？`,
        okText: "确认",
        cancelText: "取消",
        onOk() {
          that.$emit("confirm", data);
          that.isMultitap = false;
          }
        })
    }
  },
  created() {},
  mounted() {},
};
</script>
<style lang='less' scoped>
.multitap {
    text-align: center;
}
/deep/ .ant-badge-dot{
  width: 10px;
  height: 10px;
}
</style>