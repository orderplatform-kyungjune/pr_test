<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { AxiosResponse } from 'axios';
import { contentType } from '@interface/promotion';
import { Download } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';

import { EVENT_STATISTICS, STATISTICAL_ADMIN } from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import { endpoints, promotion } from '@apis';

const { requestEventStatisticsData } = promotion;

const { downloadExcel } = useExcelDownload();

/** 엑셀 다운로드 */
const excelFileHref = ref(
  `${GATE_WAY_API_URL}${endpoints.promotion.forAgency}?excelDownload=true&size=20000`,
);

/** 이벤트 통계 데이터 조회 */
const trimPercentage = (percent: string) => {
  const stringifiedPercent = Number(percent.toString());

  return stringifiedPercent;
};

const convertPercentage = (numerator: number, denominator: number) => {
  if (numerator && denominator) {
    const percent = trimPercentage(
      ((numerator / denominator) * 100).toFixed(5),
    );

    return `${percent}%`;
  }
  return '';
};

const eventStatisticsData = reactive({
  content: [] as contentType[],
  currentPage: 0,
  firstPage: false,
  lastPage: false,
  pageSize: 0,
  totalPages: 0,
});

const getEventStatisticsData = async () => {
  try {
    const res = (await requestEventStatisticsData()) as AxiosResponse;
    const resContent = res.data.content;

    eventStatisticsData.content = resContent.map((data: contentType) => ({
      /** 일자 */
      saveDate: data.saveDate,
      /** 이벤트 적용 매장 수 */
      eventStoreCnt: data.eventStoreCnt?.toLocaleString(),
      /** 이벤트상품 주문 매장 수 */
      orderStoreCnt: data.orderStoreCnt?.toLocaleString(),
      /** 주문 횟수 */
      orderSum: data.orderSum?.toLocaleString(),
      /** 주문 수량  */
      orderGoodsQtySum: data.orderGoodsQtySum?.toLocaleString(),
      /** 이벤트 응모 수 */
      joinSum: data.joinSum?.toLocaleString(),
      /** 이벤트 응모율(이벤트 응모 수 / 주문 수량) */
      orderApplicationPercentage1: convertPercentage(
        data.joinSum,
        data.orderGoodsQtySum,
      ),
      /** 이벤트 응모율2(이벤트 응모 수 / 주문 횟수) */
      orderApplicationPercentage2: convertPercentage(
        data.joinSum,
        data.orderSum,
      ),
      /** 미당첨자 수 */
      loserSum: data.loserSum?.toLocaleString(),
      /** 당첨자 수 */
      winnerSum: data.winnerSum?.toLocaleString(),
      /** 당첨율(당첨자 수 / 이벤트 응모 수) */
      winnerPercentage1: convertPercentage(data.winnerSum, data.joinSum),
      /** 당첨율2(개인 정보 입력자 수 / 이벤트 응모 수) */
      winnerPercentage2: convertPercentage(data.phoneInputedSum, data.joinSum),
      /** 개인 정보 미입력자 수 */
      phoneNotInputedSum: data.phoneNotInputedSum?.toLocaleString(),
      /** 개인 정보 입력자 수 */
      phoneInputedSum: data.phoneInputedSum?.toLocaleString(),
    }));
  } catch (error) {
    console.log(error);
  }
};

getEventStatisticsData();

const agencyStatisticsHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: EVENT_STATISTICS },
]);
</script>

<template>
  <BreadcrumbHeader :propsHeader="agencyStatisticsHeader" />
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <span class="agency-statistics-table-title">이벤트 통계</span>
    <el-button
      :icon="Download"
      type="success"
      @click="downloadExcel('이벤트 통계', excelFileHref)"
    >
      엑셀 다운로드
    </el-button>
  </el-row>
  <el-table
    :data="eventStatisticsData.content"
    height="720"
    highlight-current-row
    stripe
    style="width: 100%"
  >
    <el-table-column
      align="center"
      label="일자"
      prop="saveDate"
      width="120"
    />
    <el-table-column
      align="center"
      label="이벤트 적용 매장 수"
      prop="eventStoreCnt"
      width="90"
    />
    <el-table-column
      align="center"
      label="진로 주문 매장 수"
      prop="orderStoreCnt"
      width="80"
    />
    <el-table-column
      align="center"
      label="주문 횟수"
      prop="orderSum"
      width="80"
    />
    <el-table-column
      align="center"
      label="주문 수량"
      prop="orderGoodsQtySum"
      width="80"
    />
    <el-table-column
      align="center"
      label="이벤트 응모 수"
      prop="joinSum"
      width="110"
    />
    <el-table-column
      align="center"
      label="이벤트 응모율(이벤트 응모 수 / 주문 수량)"
      min-width="180"
      prop="orderApplicationPercentage1"
    />
    <el-table-column
      align="center"
      class-name="essential-star"
      label="이벤트 응모율2(이벤트 응모 수 / 주문 횟수)"
      min-width="180"
      prop="orderApplicationPercentage2"
    />
    <el-table-column
      align="center"
      label="미당첨자 수"
      prop="loserSum"
      width="90"
    />
    <el-table-column
      align="center"
      label="당첨자 수"
      prop="winnerSum"
      width="80"
    />
    <el-table-column
      align="center"
      class-name="essential-star"
      label="당첨율(당첨자 수 / 이벤트 응모 수)"
      min-width="180"
      prop="winnerPercentage1"
    />
    <el-table-column
      align="center"
      label="당첨율2(개인 정보 입력자 수 / 이벤트 응모 수)"
      min-width="180"
      prop="winnerPercentage2"
    />
    <el-table-column
      align="center"
      label="개인 정보 미입력자 수"
      prop="phoneNotInputedSum"
      width="90"
    />
    <el-table-column
      align="center"
      label="개인 정보 입력자 수"
      prop="phoneInputedSum"
      width="90"
    />
  </el-table>
</template>

<style lang="scss" scoped>
.agency-statistics-table-title {
  height: 40px;
  font-size: 30px;
  font-weight: 500;
  line-height: 40px;
}
</style>
