<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import {
  eventStockStateContentType,
  prizeListType,
} from '@interface/promotion';
import { Download } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { EVENT_STOCK_CONDITION, STATISTICAL_ADMIN } from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import { promotionCodec } from '@codecs';
import { endpoints, promotion } from '@apis';

// header props
const storeStatisticsHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: EVENT_STOCK_CONDITION },
]);

const { runtimeCheck } = runtimeCheckHelper;
const { requestEventStockState, requestPrizeList } = promotion;
const { eventStockStateCodec, prizeListCodec } = promotionCodec;
const { isLoading, downloadExcel } = useExcelDownload();

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  currentPage: 1,
  pageSize: 30,
  totalPages: 1,
});

/** 이벤트 경품 재고 데이터 */
const stockData: Ref<eventStockStateContentType[]> = ref([]);

/** 이벤트 경품 재고 현황 리스트 불러오기 */
const getStoreStatsList = async (page: number) => {
  const data = {
    page,
    size: paginationInfo.pageSize,
  };
  try {
    const res = (await requestEventStockState(data)) as AxiosResponse;
    const typeError = runtimeCheck(eventStockStateCodec, res.data);

    if (!typeError) {
      stockData.value = res.data.content;
      paginationInfo.currentPage = res.data.currentPage;
      paginationInfo.pageSize = res.data.pageSize;
      paginationInfo.totalPages = res.data.totalPages;
    }
  } catch (error) {
    console.log(error);
  }
};

const setDownloadURL = () =>
  `${GATE_WAY_API_URL}${endpoints.promotion.phone_list}?size=20000&excelDownload=true`;

getStoreStatsList(1);

// 경품 리스트 조회
// const prizeData = reactive({
//   list: [{
//     name: '',
//     stock: 0,
//   }] as prizeListType[],
// });
const prizeData = ref([] as prizeListType[]);
const getPrizeList = async () => {
  try {
    const res = (await requestPrizeList()) as AxiosResponse;
    const typeError = runtimeCheck(prizeListCodec, res.data);

    if (!typeError) {
      prizeData.value = res.data;
    }
  } catch (error) {
    console.log(error);
  }
};

getPrizeList();

const filterPrizeName = (index: number) =>
  `${prizeData.value[index]?.name?.toLocaleString()} (총 재고 : ${prizeData.value[index]?.stock?.toLocaleString()}개)`;
</script>

<template>
  <BreadcrumbHeader :propsHeader="storeStatisticsHeader" />
  <el-row
    class="mb-10"
    justify="space-between"
  >
    <p class="event-stock-title">이벤트 경품 재고 현황</p>
    <el-button
      v-loading.fullscreen.lock="isLoading"
      :disabled="isLoading"
      :icon="Download"
      type="success"
      @click="downloadExcel('이벤트 경품 재고 현황', setDownloadURL())"
    >
      엑셀 다운로드
    </el-button>
  </el-row>
  <el-table
    :data="stockData"
    style="width: 100%"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="일자"
      min-width="110"
      prop="date"
    />
    <el-table-column header-align="center">
      <template #header>
        {{ filterPrizeName(0) }}
      </template>
      <el-table-column
        align="center"
        header-align="center"
        label="당첨자"
        prop="prize1Sum"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="휴대폰 미입력"
        prop="prize1PhoneNotInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="경품 발송 진행 합계"
        prop="prize1PhoneInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="남은 재고"
        prop="prize1LeftStock"
      />
    </el-table-column>
    <el-table-column header-align="center">
      <template #header>
        {{ filterPrizeName(1) }}
      </template>

      <el-table-column
        align="center"
        header-align="center"
        label="당첨자"
        prop="prize2Sum"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="휴대폰 미입력"
        prop="prize2PhoneNotInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="경품 발송 진행 합계"
        prop="prize2PhoneInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="남은 재고"
        prop="prize2LeftStock"
      />
    </el-table-column>
    <el-table-column header-align="center">
      <template #header>
        {{ filterPrizeName(2) }}
      </template>
      <el-table-column
        align="center"
        header-align="center"
        label="당첨자"
        prop="prize3Sum"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="휴대폰 미입력"
        prop="prize3PhoneNotInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="경품 발송 진행 합계"
        prop="prize3PhoneInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="남은 재고"
        prop="prize3LeftStock"
      />
    </el-table-column>
    <el-table-column header-align="center">
      <template #header>
        {{ filterPrizeName(3) }}
      </template>
      <el-table-column
        align="center"
        header-align="center"
        label="당첨자"
        prop="prize4Sum"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="휴대폰 미입력"
        prop="prize4PhoneNotInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="경품 발송 진행 합계"
        prop="prize4PhoneInputed"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="남은 재고"
        prop="prize4LeftStock"
      />
    </el-table-column>
  </el-table>
</template>

<style lang="scss" scoped>
.event-stock-title {
  height: 40px;
  font-size: 30px;
  font-weight: 500;
  line-height: 40px;
}
</style>
