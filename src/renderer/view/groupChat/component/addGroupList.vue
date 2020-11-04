<template>
  <div class="add_group_list">
    <div v-if="isNotGroupList" style="textalign: center">
      <a-spin tip />
    </div>
    <a-checkbox-group
      v-else
      v-model="addlist"
      :options="addGroupList"
      @change="onChangeCheckbox"
      style="display: flex; flex-wrap: wrap"
    >
      <div slot="label" slot-scope="scope" class="add_group_label">
        <div class="add_group_list_item">
          <img class="add_group_headimg" v-lazy="scope.headimg" alt />
          <a-badge
            :status="scope.online_status ? 'success' : 'default'"
            :offset="[4, 12]"
            :title="scope.online_status ? $t('online') : $t('offline')"
          >
            <a-icon
              v-if="scope.status"
              slot="count"
              type="clock-circle"
              style="color: #f5222d"
            />
          </a-badge>
        </div>
        <p class="add_group_list_item_username">
          {{ scope.username }}
        </p>
      </div>
    </a-checkbox-group>
  </div>
</template>

<script>
export default {
  name: "",
  components: {},
  props: {
    selectAddlist: {
      type: Array,
      default() {
        return [];
      },
    },
    addGroupList: {
      type: Array,
      default() {
        return [];
      },
    },
    isNotGroupList: Boolean,
    isAddGroup: Boolean,
  },
  data() {
    return {
      addlist: [],
    };
  },
  computed: {},
  watch: {
    isAddGroup(newVal) {
      if (!newVal) {
        this.addlist = [];
      }
    },
  },
  methods: {
    onChangeAddList(vals) {
      this.$emit("onChangeAddList", vals);
    },
    onChangeCheckbox(vals) {
      this.$emit("onChangeCheckbox", vals);
    },
  },
  created() {},
  mounted() {},
};
</script>
<style lang='less' scoped>
.add_group_list {
  max-height: 250px;
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
.add_group_label {
  .add_group_list_item {
    .add_group_headimg {
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }
  }
}
</style>