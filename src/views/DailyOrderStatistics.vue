<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, routeHelper } from '@utils';
import { dailyOrderStatistics } from '@router/routePaths';
import { dailyOrderListType, tableTotalPropType } from '@interface/stats';
import { BreadcrumbHeader } from '@components';
import { DAILY_ORDER_STATISTICS } from '@common/string';
import { statsCodec } from '@codecs';
import { stats } from '@apis';

const route = useRoute();
const { runtimeCheck } = runtimeCheckHelper;
const { pushPageWithQuery } = routeHelper;
const { requestDailyOrderStatsList } = stats;
const { dailyOrderStatsCodec } = statsCodec;

/** breadCrumb Header */
const dailyOrderStatisticsHeader = reactive([{ name: DAILY_ORDER_STATISTICS }]);

/** 날짜 검색 정보 */
const searchInfo = ref([
  route.query.startDate as string,
  route.query.endDate as string,
]);

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  currentPage: Number(route.query.page),
  pageSize: Number(route.query.pageSize),
  totalPages: 1,
});

/** 페이지 당 매장 개수 */
const pageSizeOptions = [
  {
    value: 10,
    label: '10개씩 보기',
  },
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 30,
    label: '30개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
  {
    value: 200,
    label: '200개씩 보기',
  },
];

/** 일별 주문량 통계 데이터 */
const dailyOrderList = ref<dailyOrderListType[]>([]);

/** 일별 주문량 통계 데이터 불러오기 */
const getDailyOrderListData = async () => {
  const requestData = {
    page: paginationInfo.currentPage,
    size: paginationInfo.pageSize,
    startDate: searchInfo.value[0],
    endDate: searchInfo.value[1],
  };
  try {
    const res = (await requestDailyOrderStatsList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(dailyOrderStatsCodec, res.data);
    if (!typeError) {
      dailyOrderList.value = res.data.content;
      paginationInfo.currentPage = res.data.currentPage + 1;
      paginationInfo.totalPages = res.data.totalPages + 1;
      paginationInfo.pageSize = res.data.pageSize;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 페이지 이동, 검색 */
const setQueryData = async () => {
  const searchData = {
    page: paginationInfo.currentPage,
    size: paginationInfo.pageSize,
    startDate: searchInfo.value[0],
    endDate: searchInfo.value[1],
  };
  pushPageWithQuery(dailyOrderStatistics, searchData);
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.currentPage = 0;
  setQueryData();
};

/** 페이지네이션 페이지 변경 */
const handleCurrentPage = async (val: number) => {
  if (paginationInfo.totalPages === -1) return;
  paginationInfo.currentPage = val - 1;
  setQueryData();
};

/** 데이터 포멧 변경 */
const storeRegiCntFormatter = (row: dailyOrderListType) =>
  row.storeRegiCnt?.toLocaleString() ?? '데이터 오류';
const tabletRegiCntFormatter = (row: dailyOrderListType) =>
  row.tabletRegiCnt?.toLocaleString() ?? '데이터 오류';
const orderCntFormatter = (row: dailyOrderListType) =>
  row.orderCnt?.toLocaleString() ?? '데이터 오류';
const cartCountOrderIdFormatter = (row: dailyOrderListType) =>
  row.cartCountOrderId?.toLocaleString() ?? '데이터 오류';
const cartPriceSumFormatter = (row: dailyOrderListType) =>
  row.cartPriceSum?.toLocaleString() ?? '데이터 오류';
const userCntFormatter = (row: dailyOrderListType) =>
  row.userCnt?.toLocaleString() ?? '데이터 오류';

/** 데이터 합계 형식 변환 */
const getSummaries = (param: tableTotalPropType) => {
  const { columns, data } = param;
  const sums: string[] = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '합계';
      return;
    }
    const values = data.map((item: dailyOrderListType) =>
      Number(item[column.property]),
    );
    if (!values.every((value) => Number.isNaN(value))) {
      const result = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!Number.isNaN(value)) {
          return prev + curr;
        }
        return prev;
      }, 0);
      sums[index] = result.toLocaleString();
    }
  });

  return sums;
};

getDailyOrderListData();
</script>

<template>
  <BreadcrumbHeader :propsHeader="dailyOrderStatisticsHeader" />
  <p class="daily-order-header mb-20">일별 주문건수 통계</p>
  <el-card
    class="mb-20"
    shadow="never"
  >
    <el-row
      align="middle"
      justify="space-between"
    >
      <el-row class="mb-10">
        <div>
          <p class="font-small mb-5">날짜</p>
          <el-date-picker
            v-model="searchInfo"
            class="mr-20"
            end-placeholder="종료 날짜"
            format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="시작 날짜"
            type="daterange"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div>
          <p class="font-small mb-5">페이지당 개수</p>
          <el-select
            v-model="paginationInfo.pageSize"
            class="mr-10"
            placeholder="개수를 선택해주세요."
          >
            <el-option
              v-for="count in pageSizeOptions"
              :key="count.value"
              :label="count.label"
              :value="count.value"
            />
          </el-select>
        </div>
      </el-row>
      <el-button
        type="primary"
        @click="getSearchData"
      >
        검색하기
      </el-button>
    </el-row>
  </el-card>
  <el-table
    :data="dailyOrderList"
    :summary-method="getSummaries"
    border
    class="mb-20"
    show-summary
  >
    <el-table-column
      align="center"
      header-align="center"
      label="날짜"
      prop="date"
      sortable
    />
    <el-table-column
      :formatter="storeRegiCntFormatter"
      align="center"
      header-align="center"
      label="매장 수"
      prop="storeRegiCnt"
      sortable
    />
    <el-table-column
      :formatter="tabletRegiCntFormatter"
      align="center"
      header-align="center"
      label="태블릿 수"
      prop="tabletRegiCnt"
      sortable
    />
    <el-table-column
      :formatter="orderCntFormatter"
      align="center"
      header-align="center"
      label="주문 건수"
      prop="orderCnt"
      sortable
    />
    <el-table-column
      :formatter="cartCountOrderIdFormatter"
      align="center"
      header-align="center"
      label="결제 건수"
      prop="cartCountOrderId"
      sortable
    />
    <el-table-column
      :formatter="cartPriceSumFormatter"
      align="center"
      header-align="center"
      label="주문 금액"
      prop="cartPriceSum"
      sortable
    />
    <el-table-column
      :formatter="userCntFormatter"
      align="center"
      header-align="center"
      label="가입자 수"
      prop="userCnt"
      sortable
    />
  </el-table>
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
.daily-order-header {
  font-size: 30px;
}
</style>
