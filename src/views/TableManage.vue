<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { TableControl, TabletInfo, PlatformTableControl } from '@views';
import { isUPLUSAdmin } from '@utils/authentication';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import {
  STORE_LIST,
  TABLE_MANAGE,
  TAB_CODE_TABLE_CONTROL,
  TAB_CODE_TABLET_INFO,
} from '@common/string';

const route = useRoute();
const activeTab = route.query.tab;

const activeTabCode = ref(
  activeTab === TAB_CODE_TABLET_INFO
    ? TAB_CODE_TABLET_INFO
    : TAB_CODE_TABLE_CONTROL,
);

// header props
const tableManageHeader = computed(() => [
  { name: STORE_LIST },
  { name: TABLE_MANAGE },
  {
    name:
      activeTabCode.value === TAB_CODE_TABLET_INFO
        ? '태블릿 정보'
        : '테이블 설정',
  },
]);

const addTabInQuery = () => {
  /**
   * router를 이용하면 el-tabs의 클릭 동작과, 페이지 로드 둘 다 작동하여 화면이 깜빡이고 api를 두 번 호출하게 됨
   * 주소창의 url만 수정하고 실제 페이지 로드는 진행하지 않도록 수정
   */
  const queryString = `#/tableManage?code=${route.query?.code}&name=${route.query?.name}&tab=${activeTabCode.value}`;
  // eslint-disable-next-line no-restricted-globals
  history.replaceState(null, '', queryString);
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="tableManageHeader" />
  <StoreNameBox />
  <el-tabs
    v-model="activeTabCode"
    type="card"
    class="mt-10"
    @tab-change="addTabInQuery"
  >
    <el-tab-pane
      label="테이블 설정"
      :name="TAB_CODE_TABLE_CONTROL"
    >
      <PlatformTableControl v-if="isUPLUSAdmin()" />
      <TableControl
        v-if="!isUPLUSAdmin() && activeTabCode === TAB_CODE_TABLE_CONTROL"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="!isUPLUSAdmin()"
      label="태블릿 정보"
      :name="TAB_CODE_TABLET_INFO"
    >
      <TabletInfo v-if="activeTabCode === TAB_CODE_TABLET_INFO" />
    </el-tab-pane>
  </el-tabs>
</template>
