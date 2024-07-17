<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { storeAlcoholContentType } from '@interface/promotion';
import { Download } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import {
  EVENT_STORE_ALCOHOL_STORE_STATISTICS,
  STATISTICAL_ADMIN,
} from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import { promotionCodec } from '@codecs';
import { endpoints, promotion } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { alcoholContentResCodec } = promotionCodec;
const { downloadExcel } = useExcelDownload();
const { requestEventStoreAlcohol } = promotion;

const eventStoreAlcoholStatHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: EVENT_STORE_ALCOHOL_STORE_STATISTICS },
]);

/** 이벤트 매장 주류 통계 조회 */
const eventStoreData = reactive({
  content: [] as storeAlcoholContentType[],
  currentPage: 0,
  firstPage: true,
  lastPage: true,
  pageSize: 0,
  totalPages: 0,
});

const excelFileHref = ref(
  `${GATE_WAY_API_URL}${endpoints.stats.forEventStore}?size=20000&excelDownload=true`,
);

const getEventStoreAlcoholData = async (page: number) => {
  try {
    const res = (await requestEventStoreAlcohol(page)) as AxiosResponse;
    const typeError = runtimeCheck(alcoholContentResCodec, res.data);
    if (!typeError) {
      eventStoreData.content = res.data.content;
      eventStoreData.currentPage = res.data.currentPage + 1;
      eventStoreData.firstPage = res.data.firstPage;
      eventStoreData.lastPage = res.data.lastPage;
      eventStoreData.pageSize = res.data.pageSize;
      eventStoreData.totalPages = res.data.totalPages + 1;

      eventStoreData.content = res.data.content.map(
        (data: storeAlcoholContentType) => ({
          cassOrderCnt: data.cassOrderCnt?.toLocaleString(),
          cassOrderQty: data.cassOrderQty?.toLocaleString(),
          chamisulOrderCnt: data.chamisulOrderCnt?.toLocaleString(),
          chamisulOrderQty: data.chamisulOrderQty?.toLocaleString(),
          chumchurumOrderCnt: data.chumchurumOrderCnt?.toLocaleString(),
          chumchurumOrderQty: data.chumchurumOrderQty?.toLocaleString(),
          createdDateTime: data.createdDateTime?.replace('T', ' '),
          date: data.date,
          id: data.id,
          jinroOrderCnt: data.jinroOrderCnt?.toLocaleString(),
          jinroOrderQty: data.jinroOrderQty?.toLocaleString(),
          kloudOrderCnt: data.kloudOrderCnt?.toLocaleString(),
          kloudOrderQty: data.kloudOrderQty?.toLocaleString(),
          saeroOrderCnt: data.saeroOrderCnt?.toLocaleString(),
          saeroOrderQty: data.saeroOrderQty?.toLocaleString(),
          teraOrderCnt: data.teraOrderCnt?.toLocaleString(),
          teraOrderQty: data.teraOrderQty?.toLocaleString(),
          eventStoreCnt: data.eventStoreCnt?.toLocaleString(),
          kellyOrderCnt: data.kellyOrderCnt?.toLocaleString(),
          kellyOrderQty: data.kellyOrderQty?.toLocaleString(),
        }),
      );
    }
  } catch (error) {
    console.log(error);
  }
};

getEventStoreAlcoholData(0);

const handleCurrentChange = (page: number) => {
  getEventStoreAlcoholData(page - 1);
};

const setSplitDate = (date: string) => date?.split(' ');
</script>

<template>
  <BreadcrumbHeader :propsHeader="eventStoreAlcoholStatHeader" />

  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <div>
      <span class="event-participants-info-title">
        이벤트 참여매장 주류 통계
      </span>
      <el-tag
        class="ml-10"
        type="info"
      >
        * 포스데이터 포함된 데이터입니다.
      </el-tag>
    </div>

    <el-button
      :icon="Download"
      type="success"
      @click="downloadExcel('이벤트 매장 주류 통계', excelFileHref)"
    >
      엑셀 다운로드
    </el-button>
  </el-row>

  <el-table
    :data="eventStoreData.content"
    stripe
  >
    <el-table-column
      align="center"
      header-align="center"
      label="영업일"
      prop="date"
      width="110"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="이벤트 진행 매장 수"
      prop="eventStoreCnt"
      width="100"
    />
    <el-table-column
      header-align="center"
      label="카스"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="cassOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="cassOrderQty"
      />
    </el-table-column>

    <el-table-column
      header-align="center"
      label="테라"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="teraOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="teraOrderQty"
      />
    </el-table-column>
    <el-table-column
      header-align="center"
      label="클라우드"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="kloudOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="kloudOrderQty"
      />
    </el-table-column>
    <el-table-column
      header-align="center"
      label="참이슬"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="chamisulOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="chamisulOrderQty"
      />
    </el-table-column>

    <el-table-column
      header-align="center"
      label="진로"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="jinroOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="jinroOrderQty"
      />
    </el-table-column>

    <el-table-column
      header-align="center"
      label="처음처럼"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="chumchurumOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="chumchurumOrderQty"
      />
    </el-table-column>

    <el-table-column
      header-align="center"
      label="새로"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="saeroOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="saeroOrderQty"
      />
    </el-table-column>

    <el-table-column
      header-align="center"
      label="켈리"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="주문횟수"
        prop="kellyOrderCnt"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="주문수량"
        prop="kellyOrderQty"
      />
    </el-table-column>

    <el-table-column
      align="center"
      header-align="center"
      label="생성일시"
      width="110"
    >
      <template #default="{ row }">
        <div>
          {{ setSplitDate(row.createdDateTime)[0] }}
        </div>
        <div>
          {{ setSplitDate(row.createdDateTime)[1] }}
        </div>
      </template>
    </el-table-column>
  </el-table>

  <el-row
    class="mt-20"
    justify="center"
  >
    <el-pagination
      :current-page="eventStoreData.currentPage"
      :page-count="eventStoreData.totalPages"
      :page-size="eventStoreData.pageSize"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.event-participants-info-title {
  height: 40px;
  font-size: 30px;
  font-weight: 500;
  line-height: 40px;
}
</style>
