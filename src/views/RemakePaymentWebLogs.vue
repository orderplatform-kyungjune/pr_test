<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, Ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import {
  authentication,
  dateFormatterUtil,
  listTotalCountUtil,
  routeHelper,
  runtimeCheckHelper,
} from '@utils';
import { remakePaymentWebLogs } from '@router/routePaths';
import {
  remakePaymentLogListType,
  paymentWebLogListType,
} from '@interface/logs';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { REMAKE_PAYMENT_WEB_LOG } from '@common/string';
import { logsCodec } from '@codecs';
import { logs, endpoints } from '@apis';

const { transactionWebLogCodec } = logsCodec;
const { runtimeCheck } = runtimeCheckHelper;
const { requestTransactionWebLog } = logs;
const { failAuthenticationAlert } = authentication;
const { isCountableList, getListTotalCount } = listTotalCountUtil;
const { pushPageWithQuery } = routeHelper;
const { refinedToday } = dateFormatterUtil;

const route = useRoute();
const { downloadExcelPostWithToken } = useExcelDownload();

const remakePaymentWebLogsHeaderProp = reactive([
  { name: REMAKE_PAYMENT_WEB_LOG },
]);

const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;
const loading = ref(false);

const paginationInfo = reactive({
  page: Number(route.query.page),
  perPage: Number(route.query.perPage),
  from: 1,
  to: 10,
  total: 0,
});

// 검색조건
const searchWord = reactive<remakePaymentLogListType>({
  searchStoreCodeOrName: route.query.searchStoreCodeOrName as string,
  searchDate: [
    route.query.searchStartDate as string,
    route.query.searchEndDate as string,
  ],
  searchIP: route.query.searchIP as string,
  page: paginationInfo.page,
  perPage: paginationInfo.perPage,
  searchOrderKey: route.query.searchOrderKey as string,
});

const paymentWebLogList: Ref<paymentWebLogListType[]> = ref([]);
const postTransactionWebLog = async () => {
  loading.value = true;

  try {
    const data = {
      page: searchWord.page,
      perPage: searchWord.perPage,
      searchStoreCodeOrName: searchWord.searchStoreCodeOrName,
      searchIP: searchWord.searchIP,
      searchStartDate: searchWord.searchDate[0],
      searchEndDate: searchWord.searchDate[1],
      searchOrderKey: searchWord.searchOrderKey,
    };

    const res = (await requestTransactionWebLog(data)) as AxiosResponse;
    const typeError = runtimeCheck(transactionWebLogCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        paymentWebLogList.value = res.data.data;
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.perPage = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

postTransactionWebLog();

const setQueryData = () => {
  const searchData = {
    page: paginationInfo.page,
    perPage: paginationInfo.perPage,
    searchStoreCodeOrName: searchWord.searchStoreCodeOrName,
    searchIP: searchWord.searchIP,
    searchStartDate: searchWord.searchDate[0],
    searchEndDate: searchWord.searchDate[1],
    searchOrderKey: searchWord.searchOrderKey,
  };
  pushPageWithQuery(remakePaymentWebLogs, searchData);
};

const clickReset = () => {
  searchWord.page = 1;
  searchWord.perPage = 20;
  searchWord.searchDate = ['', ''];
  searchWord.searchIP = '';
  searchWord.searchOrderKey = '';
  searchWord.searchStoreCodeOrName = '';

  setQueryData();
};

const clickSearch = () => {
  paginationInfo.page = 1;
  setQueryData();
};

const handleCurrentPage = async (val: number) => {
  paginationInfo.page = val;
  setQueryData();
};

const getTableName = (row: paymentWebLogListType) =>
  row.tablet_code.replace(`${row.store_code}_`, '');

const excelFileHref: Ref<string> = ref(
  endpoints.excel.logs_transaction_web_download,
);

const getExcelTitle = () => {
  const todayDate = refinedToday().replaceAll('-', '').slice(2);
  return `payment_web_log_${todayDate}`;
};

const getRequestData = () => ({
  searchStoreCodeOrName: searchWord.searchStoreCodeOrName,
  searchStartDate: searchWord.searchDate[0],
  searchEndDate: searchWord.searchDate[1],
  searchIP: searchWord.searchIP,
  searchOrderKey: searchWord.searchOrderKey,
});

const excelDownloadState: Ref<boolean> = ref(false);
const excelDownloadData = async () => {
  try {
    if (paginationInfo.total > 13000) {
      ElMessage({
        type: 'error',
        message:
          '다운로드 최대 건수를 초과하였습니다. 기간을 다시 설정해 주세요.(최대 건수: 1만3천 건)',
      });
      return;
    }

    excelDownloadState.value = true;

    await downloadExcelPostWithToken(
      getExcelTitle(),
      excelFileHref.value,
      getRequestData(),
    );
  } catch (error) {
    console.log(error);
  } finally {
    excelDownloadState.value = false;
  }
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="remakePaymentWebLogsHeaderProp" />
  <el-card
    class="search-card"
    shadow="never"
  >
    <div class="search-container">
      <el-form
        inline
        label-position="top"
        label-width="80px"
      >
        <el-form-item label="매장명 또는 매장코드">
          <div class="input-wrapper">
            <el-input
              v-model="searchWord.searchStoreCodeOrName"
              clearable
              placeholder="매장명 또는 매장코드를 입력해주세요."
              @keyup.enter="clickSearch"
            />
          </div>
        </el-form-item>
        <el-form-item label="IP">
          <div class="input-wrapper">
            <el-input
              v-model="searchWord.searchIP"
              clearable
              placeholder="IP를 입력해주세요."
              @keyup.enter="clickSearch"
            />
          </div>
        </el-form-item>
        <el-form-item label="주문키">
          <div class="input-wrapper">
            <el-input
              v-model="searchWord.searchOrderKey"
              clearable
              placeholder="IP를 입력해주세요."
              @keyup.enter="clickSearch"
            />
          </div>
        </el-form-item>
        <el-form-item
          class="date-picker-container"
          label="기간"
        >
          <div class="date-picker-wrapper">
            <div class="date-picker">
              <el-date-picker
                v-model="searchWord.searchDate"
                :clearable="false"
                end-placeholder="종료일"
                range-separator="~"
                start-placeholder="시작일"
                type="daterange"
                value-format="YYYY-MM-DD"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <el-divider content-position="center">
      <el-button
        type="warning"
        @click="clickReset"
      >
        초기화
      </el-button>
      <el-button
        type="primary"
        @click="clickSearch"
      >
        검색
      </el-button>
    </el-divider>
  </el-card>

  <el-row
    v-if="isCountableList(paginationInfo.total)"
    align="middle"
    class="log-count-info"
    justify="space-between"
  >
    <div>
      <span>총 </span>
      <span class="log-count">
        {{ getListTotalCount(paginationInfo.total) }}
      </span>
      <span> 개의 검색 결과가 있습니다.</span>
    </div>
    <el-button
      v-if="!excelDownloadState"
      type="success"
      @click="excelDownloadData"
    >
      엑셀 다운로드
    </el-button>
    <el-button
      v-else
      loading
      type="primary"
    >
      다운로드중..
    </el-button>
  </el-row>

  <el-table
    v-loading="loading"
    :data="paymentWebLogList"
    :element-loading-spinner="svg"
    border
    element-loading-background="rgba(122, 122, 122, 0.8)"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-text="로그 정보를 불러오는 중입니다..."
    flexible
    height="530"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="주문키"
      prop="order_key"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장코드"
      prop="store_code"
      width="130"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      prop="store_name"
      width="130"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="테이블 번호"
      prop="tablet_code"
      width="60"
    >
      <template #default="{ row }">
        {{ getTableName(row) }}
      </template>
    </el-table-column>
    <el-table-column
      header-align="center"
      label="상태"
      prop="status"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="IP"
      prop="ip_address"
      width="130"
    />

    <el-table-column
      align="center"
      header-align="center"
      label="에러코드"
      prop="error_code"
      width="105"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="생성일"
      prop="created_datetime"
      width="105"
    />
  </el-table>
  <el-row
    align="middle"
    class="mt-10"
    justify="center"
  >
    <el-pagination
      :current-page="paginationInfo.page"
      :page-size="paginationInfo.perPage"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.search-card {
  height: auto;
  margin-bottom: 20px;

  &:deep(.el-card__body) {
    padding-bottom: 5px;
  }

  .search-container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .date-picker-wrapper {
      width: 250px;
      margin-right: 30px;

      .date-picker {
        &:deep(.el-date-editor) {
          width: 100%;
        }
      }
    }

    .input-wrapper {
      display: flex;
      gap: 20px;
      width: 250px;
    }
  }
}

.log-count-info {
  display: flex;
  align-items: center;
  margin: 0 0 15px 10px;

  .log-count {
    color: #fc0000;
  }
}
</style>
