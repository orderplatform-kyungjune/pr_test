<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { pushPageWithQuery } from '@utils/route.helper';
import {
  authentication,
  dateFormatterUtil,
  listTotalCountUtil,
  runtimeCheckHelper,
} from '@utils';
import { logTabletPos } from '@router/routePaths';
import {
  requestTabletLogListParamType,
  tabletPosLogDataType,
} from '@interface/logs';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { LOG_TABLET_POS } from '@common/string';
import { logsCodec } from '@codecs';
import { endpoints, logs } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { requestTabletLogList } = logs;
const { refinedToday, refinedYesterday } = dateFormatterUtil;
const { isCountableList, getListTotalCount } = listTotalCountUtil;
const { tabletPosLogCodec } = logsCodec;

const { downloadExcelPostWithToken } = useExcelDownload();

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

// BreadcrumbHeader 프롭
const logTabletPosHeaderProp = reactive([{ name: LOG_TABLET_POS }]);

// 상품 변경 로그 데이터 [서버 대기중]
const tabletPosLogData: Ref<tabletPosLogDataType[]> = ref(
  [] as tabletPosLogDataType[],
);

const route = useRoute();

const paginationInfo = reactive({
  page: Number(route.query.page) ?? 1,
  perPage: Number(route.query.perPage) ?? 10,
  from: 1,
  to: 10,
  total: 0,
});

const searchWord = reactive<requestTabletLogListParamType>({
  searchStoreCodeOrName: route.query.searchStoreCodeOrName as string,
  searchStartDate: route.query.searchStartDate as string,
  searchEndDate: route.query.searchEndDate as string,
  searchIP: route.query.searchIP as string,
  page: paginationInfo.page,
  perPage: paginationInfo.perPage,
});

/** 검색 관련 로직 */
// 기간 참조값
const selectedDate = ref<string[]>([
  searchWord.searchStartDate,
  searchWord.searchEndDate,
]);

const setDateToday = () => {
  selectedDate.value = [refinedToday(), refinedToday()];
};

const setDateYesterday = () => {
  selectedDate.value = [refinedYesterday(), refinedYesterday()];
};

const dateButtonRef = computed(() => {
  const today = refinedToday();
  if (selectedDate.value.length !== 0) {
    const isDateSetToday =
      selectedDate.value.filter((day) => day === today).length === 2;
    if (isDateSetToday) {
      return '오늘';
    }
    return '어제';
  }
  return '오늘';
});

const getTabletPosLogList = async (page?: number) => {
  loading.value = true;

  try {
    if (page) {
      searchWord.page = page;
    }

    const [start, end] = selectedDate.value;
    searchWord.searchStartDate = start;
    searchWord.searchEndDate = end;

    const res = (await requestTabletLogList(searchWord)) as AxiosResponse;
    const typeError = runtimeCheck(tabletPosLogCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.status === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.status === 200) {
        tabletPosLogData.value = res.data.data;
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

const setQueryData = async () => {
  const searchData = {
    searchStoreCodeOrName: searchWord.searchStoreCodeOrName,
    searchStartDate: selectedDate.value[0],
    searchEndDate: selectedDate.value[1],
    searchIP: searchWord.searchIP,
    page: paginationInfo.page,
    perPage: paginationInfo.perPage,
  };
  pushPageWithQuery(logTabletPos, searchData);
};

/** 페이지네이션 */
const handleCurrentPage = async (val: number) => {
  paginationInfo.page = val;
  await setQueryData();
};

/** 초기화 */
const resetSearchData = () => {
  paginationInfo.page = 1;
  searchWord.searchStoreCodeOrName = '';
  searchWord.searchIP = '';
  setQueryData();
};

/** 검색하기 */
const getSearchData = () => {
  paginationInfo.page = 1;
  setQueryData();
};

const getTime = (time: string) => {
  const separatedTime = time.split(' ');
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    day,
    date,
  ] = separatedTime;

  if (date) {
    return date;
  }
  return '일시 없음';
};

const cellStyle = {
  padding: '0px',
  fontSize: '10px',
};

const excelFileHref: Ref<string> = ref(
  endpoints.excel.logs_tablet_pos_download,
);

const getExcelTitle = () => {
  const todayDate = refinedToday().replaceAll('-', '').slice(2);
  return `tablet_log_${todayDate}`;
};

const getRequestData = () => ({
  searchStoreCodeOrName: searchWord.searchStoreCodeOrName,
  searchStartDate: searchWord.searchStartDate,
  searchEndDate: searchWord.searchEndDate,
  searchIP: searchWord.searchIP,
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

getTabletPosLogList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="logTabletPosHeaderProp" />
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
              @keyup.enter="getSearchData"
            />
          </div>
        </el-form-item>
        <el-form-item label="IP">
          <div class="input-wrapper">
            <el-input
              v-model="searchWord.searchIP"
              clearable
              placeholder="IP를 입력해주세요."
              @keyup.enter="getSearchData"
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
                v-model="selectedDate"
                :clearable="false"
                end-placeholder="종료일"
                range-separator="~"
                readonly
                start-placeholder="시작일"
                type="daterange"
                unlink-panels
                value-format="YYYY-MM-DD"
              />
            </div>
          </div>
          <el-radio-group v-model="dateButtonRef">
            <el-radio-button
              label="오늘"
              @click="setDateToday"
              @keyup.enter="getSearchData"
            />
            <el-radio-button
              label="어제"
              @click="setDateYesterday"
              @keyup.enter="getSearchData"
            />
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <el-divider content-position="center">
      <el-button
        type="warning"
        @click="resetSearchData"
      >
        초기화
      </el-button>
      <el-button
        type="primary"
        @click="getSearchData"
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
  <div>
    <el-table
      v-loading="loading"
      :data="tabletPosLogData"
      :element-loading-spinner="svg"
      border
      class="tablet-pos-log-table-wrapper"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-text="로그 정보를 불러오는 중입니다..."
      flexible
      height="520"
    >
      <el-table-column
        align="center"
        label="로그 ID"
        prop="id"
        width="90px"
      />
      <el-table-column
        align="center"
        label="매장코드"
        prop="T_order_store_code"
        width="140px"
      />
      <el-table-column
        align="center"
        label="매장명"
        prop="T_order_store_name"
        width="150px"
      />
      <el-table-column
        align="center"
        label="주문 오더키"
        width="100px"
      >
        <template #default="{ row }">
          <el-tooltip
            :content="row.orderKey"
            :show-after="300"
            effect="dark"
            placement="top"
          >
            <span class="ellipsis-text-2">
              {{ row.orderKey }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="태블릿 코드"
        prop="T_order_tablet_id"
        width="100px"
      />
      <el-table-column
        align="center"
        label="태블릿 출력 이름"
        prop="T_order_tablet_name"
        width="130px"
      />
      <el-table-column
        align="center"
        label="매장 IP"
        prop="T_order_store_ip"
        width="110px"
      />
      <el-table-column
        align="center"
        label="Agent 정보"
      >
        <template #default="{ row }">
          <el-tooltip
            :content="row.T_order_agent_info"
            :show-after="300"
            effect="dark"
            placement="top"
          >
            <span class="ellipsis-text-2">
              {{ row.T_order_agent_info }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="주문 정보"
        width="250px"
      >
        <template #default="{ row }">
          <el-table
            :cell-style="cellStyle"
            :data="row.T_order_order_info"
            :header-cell-style="cellStyle"
            border
            flexible
            height="70"
          >
            <el-table-column
              align="center"
              label="상품코드"
              prop="goods_code"
            />
            <el-table-column
              align="center"
              label="수량"
              prop="qty"
            />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="주문 일자"
        prop="OrderDate"
        width="100px"
      />
      <el-table-column
        align="center"
        label="주문 일시"
        prop="data_time"
        width="100px"
      >
        <template #default="{ row }">
          <span>
            {{ getTime(row.data_time) }}
          </span>
        </template>
      </el-table-column>
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
  </div>
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
