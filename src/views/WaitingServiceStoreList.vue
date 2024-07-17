<script lang="ts" setup>
import { Ref, reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, routeHelper, dateFormatterUtil } from '@utils';
import useTagsStore from '@store/storeTags';
import { waitingServiceStoreEnroll } from '@router/routePaths';
import { waitingStoreListDataType } from '@interface/waitingService';
import { BreadcrumbHeader } from '@components';
import { WAITING_SERVICE_STORE_LIST } from '@common/string';
import { waitingCodec } from '@codecs';
import { waitingService } from '@apis';

const { requestWaitingStoreList } = waitingService;
const { responseWaitingListCodec } = waitingCodec;
const { runtimeCheck } = runtimeCheckHelper;
const { pushPageWithQuery, pushPage } = routeHelper;
const { convertServerTimeToKorea } = dateFormatterUtil;

const tagStore = useTagsStore();
const { addTagsData } = tagStore;

const waitingServiceStoreListHeader = reactive([
  { name: WAITING_SERVICE_STORE_LIST },
]);

const waitingStoreFullList: Ref<waitingStoreListDataType[]> = ref([]);
const waitingStoreDisplayList: Ref<waitingStoreListDataType[]> = ref([]);

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

/** 검색 */
const searchTypes = [
  {
    value: 'storeName',
    label: '매장명',
  },
  {
    value: 'loginId',
    label: '로그인 ID',
  },
  {
    value: 'phone',
    label: '매장 전화번호',
  },
];
const searchInfo = reactive({
  type: 'storeName',
  keyword: '',
});

/** 페이지네이션, 검색어 필터링 */
const filterBySearchType = (
  list: waitingStoreListDataType[],
): waitingStoreListDataType[] => {
  if (!searchInfo.keyword) return list;

  const keyword = searchInfo.keyword.toLowerCase();

  return list.filter((store: waitingStoreListDataType) => {
    switch (searchInfo.type) {
      case 'storeName':
        return store.name.toLowerCase().includes(keyword);
      case 'loginId':
        return store.loginId.toLowerCase().includes(keyword);
      case 'phone':
        return store.phone.includes(keyword);
      default:
        return true;
    }
  });
};

const filterStoreList = (pageNumber: number) => {
  paginationInfo.page = pageNumber;

  const targetList: waitingStoreListDataType[] = filterBySearchType(
    waitingStoreFullList.value,
  );

  const startIndex = (pageNumber - 1) * paginationInfo.pageSize;
  const endIndex = pageNumber * paginationInfo.pageSize;

  waitingStoreDisplayList.value = targetList.slice(startIndex, endIndex);
  paginationInfo.total = targetList.length;
};

const resetFullStoreList = () => {
  searchInfo.keyword = '';
  searchInfo.type = 'storeName';
  filterStoreList(1);
};

/** 매장 리스트 호출 */
const getWaitingStoreList = async () => {
  try {
    const res = (await requestWaitingStoreList()) as AxiosResponse;
    const typeError = runtimeCheck(responseWaitingListCodec, res.data);

    if (res.data.resultCode !== 200) {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (!typeError) {
      if (res.data.resultCode === 200) {
        waitingStoreFullList.value = res.data.resultData.stores;
        filterStoreList(1);
        paginationInfo.total = waitingStoreFullList.value.length;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 상세 이동 */
const pushWaitingStoreEditPage = (
  storeId: number,
  storeName: string,
  mode: string,
) => {
  pushPageWithQuery(waitingServiceStoreEnroll, {
    storeId,
    mode,
  });
  addTagsData({
    name: `대기표 매장 수정(${storeName})`,
    path: waitingServiceStoreEnroll,
    query: {
      storeId,
      mode,
    },
  });
};

/** 매장 등록 이동 */
const pushWaitingStoreEnrollPage = () => {
  pushPage(waitingServiceStoreEnroll);
};

getWaitingStoreList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="waitingServiceStoreListHeader" />
  <el-row justify="space-between">
    <div class="mt-10 mb-10">
      <el-input
        v-model="searchInfo.keyword"
        class="waiting-store-list-search-input"
        maxlength="30"
        placeholder="검색어를 입력해주세요."
        @keyup.enter="filterStoreList(1)"
      >
        <template #prepend>
          <el-select
            v-model="searchInfo.type"
            class="waiting-store-list-search-select"
          >
            <el-option
              v-for="searchType in searchTypes"
              :key="searchType.value"
              :label="searchType.label"
              :value="searchType.value"
            />
          </el-select>
        </template>
      </el-input>
      <el-button
        class="ml-10"
        type="primary"
        @click="filterStoreList(1)"
      >
        검색
      </el-button>
      <el-button @click="resetFullStoreList"> 초기화</el-button>
    </div>
    <el-button
      color="#000"
      @click="pushWaitingStoreEnrollPage"
    >
      대기표 매장 등록
    </el-button>
  </el-row>
  <el-table
    :data="waitingStoreDisplayList"
    border
    class="width-100"
    height="680px"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="매장 DB ID"
      width="90"
    >
      <template #default="{ row }">
        {{ row.id }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      width="260"
    >
      <template #default="{ row }">
        <el-link
          @click="
            pushWaitingStoreEditPage(row.config?.storeId, row.name, 'edit')
          "
        >
          <span class="ellipsis-text-1">{{ row.name }}</span>
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="로그인 ID"
    >
      <template #default="{ row }">
        {{ row.loginId }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="로그인 비밀번호"
    >
      <template #default="{ row }">
        {{ row.loginPwd }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="계약 시작일"
    >
      <template #default="{ row }">
        {{ row.contractStartDate }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="계약 종료일"
    >
      <template #default="{ row }">
        {{ row.contractEndDate }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장 전화번호"
    >
      <template #default="{ row }">
        {{ row.phone }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="유저 앱 버전"
    >
      <template #default="{ row }">
        {{ row.userAppVersion }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="마스터 앱 버전"
    >
      <template #default="{ row }">
        {{ row.masterAppVersion }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장 등록일시"
      width="160"
    >
      <template #default="{ row }">
        {{ convertServerTimeToKorea(row.config?.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="수정"
      width="100"
    >
      <template #default="{ row }">
        <el-button
          type="warning"
          @click="
            pushWaitingStoreEditPage(row.config?.storeId, row.name, 'edit')
          "
        >
          수정
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    class="mt-20"
    justify="center"
  >
    <el-pagination
      :current-page="paginationInfo.page"
      :page-size="paginationInfo.pageSize"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="filterStoreList"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.waiting-store-list-search-input {
  width: 420px;
}

.waiting-store-list-search-select {
  width: 150px;
}
</style>
