<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, Ref, ref } from 'vue';
import { TabsPaneContext } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, routeHelper } from '@utils';
import { storeStatistics } from '@router/routePaths';
import { storeStatsListDateResListType } from '@interface/promotion';
import { Download } from '@element-plus/icons-vue';
import { StoreStatisticsTable } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { STORE_STATISTICS, STATISTICAL_ADMIN } from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import { promotionCodec } from '@codecs';
import { promotion, endpoints } from '@apis';

const { requestStoreStatsList } = promotion;
const { storeStatsListCodec } = promotionCodec;
const { isLoading, downloadExcel } = useExcelDownload();
const route = useRoute();
const { runtimeCheck } = runtimeCheckHelper;
const { pushPageWithQuery } = routeHelper;

// header props
const storeStatisticsHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: STORE_STATISTICS },
]);

/** 선택한 텝 상태 */
const activeTab = ref('day');

/** 데이터 응답 정보 */
const storeStatsData: Ref<storeStatsListDateResListType[]> = ref(
  [] as storeStatsListDateResListType[],
);

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  currentPage: Number(route.query.page),
  pageSize: 10,
  totalPages: 0,
});

/** input 데이터 */
const inputData = reactive({
  storeName: route.query.storeName as string,
  storeCode: route.query.storeCode as string,
});

/** 현재 시간 날짜 생성 */
const createTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = `0${today.getMonth() + 1}`.slice(-2);
  const day = `0${today.getDate()}`.slice(-2);

  const dateString = `${year}-${month}-${day}`;

  return dateString;
};

const createYesterdayDate = () => {
  const today = new Date();

  const afterWeek = new Date(today.setDate(today.getDate() - 1));
  const year = afterWeek.getFullYear();
  const month = `0${afterWeek.getMonth() + 1}`.slice(-2);
  const day = `0${afterWeek.getDate()}`.slice(-2);

  const dateString = `${year}-${month}-${day}`;

  return dateString;
};

const createWeekDate = () => {
  const today = new Date();

  const afterWeek = new Date(today.setDate(today.getDate() - 7));
  const year = afterWeek.getFullYear();
  const month = `0${afterWeek.getMonth() + 1}`.slice(-2);
  const day = `0${afterWeek.getDate()}`.slice(-2);

  const dateString = `${year}-${month}-${day}`;

  return dateString;
};

const createMonthDate = () => {
  const today = new Date();

  const afterMonth = new Date(today.setMonth(today.getMonth() - 1));
  const year = afterMonth.getFullYear();
  const month = `0${afterMonth.getMonth() + 1}`.slice(-2);
  const day = `0${afterMonth.getDate()}`.slice(-2);

  const dateString = `${year}-${month}-${day}`;

  return dateString;
};

/** 데이터 요청 정보 */
const requestPageInfo = reactive({
  page: 1,
  orderStartDate: createYesterdayDate(),
  orderEndDate: createTodayDate(),
});

/** 매장별 통계 리스트 불러오기 */
const getStoreStatsList = async () => {
  const data = {
    storeName: inputData.storeName,
    storeCode: inputData.storeCode,
    currentPage: paginationInfo.currentPage,
    today: requestPageInfo.orderStartDate,
    nextDay: requestPageInfo.orderEndDate,
  };
  try {
    const res = (await requestStoreStatsList(data)) as AxiosResponse;
    const typeError = runtimeCheck(storeStatsListCodec, res.data);

    if (!typeError) {
      paginationInfo.currentPage = res.data.currentPage;
      paginationInfo.totalPages = res.data.totalPages;
      paginationInfo.pageSize = res.data.pageSize;
      storeStatsData.value = res.data.dateResList;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 요청 페이지 날짜 변경 */
const setPageInfo = () => {
  if (activeTab.value === 'day') {
    requestPageInfo.orderStartDate = createYesterdayDate();
    requestPageInfo.orderEndDate = createTodayDate();
  }
  if (activeTab.value === 'week') {
    requestPageInfo.orderStartDate = createWeekDate();
    requestPageInfo.orderEndDate = createTodayDate();
  }
  if (activeTab.value === 'month') {
    requestPageInfo.orderStartDate = createMonthDate();
    requestPageInfo.orderEndDate = createTodayDate();
  }
};

/** 텝 변경 */
const setChangeTab = (tab: TabsPaneContext) => {
  activeTab.value = tab.props.name as string;
  paginationInfo.currentPage = 1;
  setPageInfo();
  getStoreStatsList();
};

/** 페이지 이동, 검색 */
const setQueryData = async () => {
  const searchData = {
    page: paginationInfo.currentPage,
    storeCode: inputData.storeCode,
    storeName: inputData.storeName,
  };
  pushPageWithQuery(storeStatistics, searchData);
};

/** 검색하기 */
const searchProductList = () => {
  paginationInfo.currentPage = 1;
  setQueryData();
};

/** 페이지네이션 페이지 변경 */
const handleCurrentPage = (val: number) => {
  paginationInfo.currentPage = val;
  setQueryData();
};

const setDownloadURL = () => `
${GATE_WAY_API_URL}${endpoints.promotion.date}
?storeCode=${inputData.storeCode}
&storeName=${inputData.storeName}
&orderStartDate=${requestPageInfo.orderStartDate}
&orderEndDate=${requestPageInfo.orderEndDate}
&size=20000&excelDownload=true
`;

getStoreStatsList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="storeStatisticsHeader" />
  <p class="store-statistics-title">매장별 통계</p>
  <el-row
    align="middle"
    class="mb-20"
    justify="space-between"
  >
    <div>
      <el-input
        v-model="inputData.storeName"
        class="store-statistics-search-input"
        placeholder="매장 명"
        @keyup.enter="searchProductList"
      />
      <el-input
        v-model="inputData.storeCode"
        class="store-statistics-search-input"
        placeholder="매장 코드"
        @keyup.enter="searchProductList"
      />
      <el-button
        type="primary"
        @click="searchProductList"
      >
        검색
      </el-button>
    </div>
    <div>
      <el-button
        v-loading.fullscreen.lock="isLoading"
        :disabled="isLoading"
        :icon="Download"
        type="success"
        @click="downloadExcel('매장별 통계', setDownloadURL())"
      >
        엑셀 다운로드
      </el-button>
    </div>
  </el-row>
  <el-tabs
    v-model="activeTab"
    class="mb-20"
    @tab-click="setChangeTab"
  >
    <el-tab-pane
      label="일 단위 (오늘 기준)"
      name="day"
    >
      <StoreStatisticsTable :tableData="storeStatsData" />
    </el-tab-pane>
    <el-tab-pane
      label="주 단위 (오늘 ~ 7일)"
      name="week"
    >
      <StoreStatisticsTable :tableData="storeStatsData" />
    </el-tab-pane>
    <el-tab-pane
      label="월 단위"
      name="month"
    >
      <StoreStatisticsTable :tableData="storeStatsData" />
    </el-tab-pane>
  </el-tabs>
  <el-row justify="center">
    <el-pagination
      :current-page="paginationInfo.currentPage"
      :page-count="paginationInfo.totalPages"
      :page-size="paginationInfo.pageSize"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.store-statistics-title {
  margin-bottom: 30px;
  font-size: 30px;
  font-weight: 500;
}

.store-statistics-search-input {
  width: 250px;
  margin-right: 5px;
}
</style>
