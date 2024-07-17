<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { TabsPaneContext } from 'element-plus';
import { authentication } from '@utils';
import {
  SetStoreBasedMasterUrlManage,
  SetUrlBasedMasterUrlManage,
} from '@containers';
import { BreadcrumbHeader } from '@components';
import { MASTER_URL_MANAGE } from '@common/string';

const { isMasterCheck } = authentication;

const activeTabName = ref('store');
const masterUrlManageHeader = reactive([{ name: MASTER_URL_MANAGE }]);

const handleClickTab = (tab: TabsPaneContext) => {
  activeTabName.value = tab.props.name as string;
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="masterUrlManageHeader" />
  <el-tabs
    v-model="activeTabName"
    class="master-url-tabs"
    type="border-card"
    @tab-click="handleClickTab"
  >
    <el-tab-pane
      label="매장 기준 마스터 WEB URL 설정"
      name="store"
    >
      <SetStoreBasedMasterUrlManage
        v-if="activeTabName === 'store'"
        :activeTabName="activeTabName"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="isMasterCheck()"
      label="URL 기준 마스터 WEB URL 설정"
      name="url"
    >
      <SetUrlBasedMasterUrlManage
        v-if="activeTabName === 'url'"
        :activeTabName="activeTabName"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.master-url-tabs {
  &:deep(.el-divider--horizontal) {
    margin: 15px 0;
  }
}
</style>
