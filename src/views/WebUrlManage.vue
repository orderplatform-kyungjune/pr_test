<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { TabsPaneContext } from 'element-plus';
import { authentication } from '@utils';
import {
  SetStoreBasedWebUrlManage,
  SetUrlBasedWebUrlManage,
  SetTabletTheme,
} from '@containers';
import { BreadcrumbHeader } from '@components';
import { WEB_URL_VERSION_SETTING_HEADER } from '@common/string';

const { checkAuthFunction } = authentication;

const webUrlVersionSettingHeader = reactive([
  { name: WEB_URL_VERSION_SETTING_HEADER },
]);
const activeTabName = ref('store');
const handleClickTab = (tab: TabsPaneContext) => {
  activeTabName.value = tab.props.name as string;
};
</script>

<template>
  <el-row justify="space-between">
    <BreadcrumbHeader :propsHeader="webUrlVersionSettingHeader" />
  </el-row>
  <el-tabs
    v-model="activeTabName"
    class="torder-web-url-tabs"
    type="border-card"
    @tab-click="handleClickTab"
  >
    <el-tab-pane
      label="매장 기준 티오더 WEB URL 설정"
      name="store"
    >
      <SetStoreBasedWebUrlManage
        v-if="activeTabName === 'store'"
        :activeTabName="activeTabName"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="checkAuthFunction('F8001')"
      label="URL 기준 티오더 WEB URL 설정"
      name="url"
    >
      <SetUrlBasedWebUrlManage
        v-if="activeTabName === 'url'"
        :activeTabName="activeTabName"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="checkAuthFunction('F8002')"
      label="티오더 태블릿 테마 적용 현황"
      name="theme"
    >
      <SetTabletTheme
        v-if="activeTabName === 'theme'"
        :activeTabName="activeTabName"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.torder-web-url-tabs {
  &:deep(.el-divider--horizontal) {
    margin: 15px 0;
  }
}

.notion-button {
  color: white;
  background-color: black;
}
</style>
