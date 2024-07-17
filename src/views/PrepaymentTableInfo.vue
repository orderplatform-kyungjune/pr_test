<script lang="ts" setup>
import { reactive, Ref, ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, dateFormatterUtil, authentication } from '@utils';
import { selectOptionType } from '@interface/inquiry';
import { tableStatusListType } from '@interface/credit';

import { BreadcrumbHeader } from '@components';
import { PREPAYMENT_TABLE_INFO } from '@common/string';
import { inquiryCodec, creditCodec } from '@codecs';
import { store, credit } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;

const { storeListCodec } = inquiryCodec;
const { tabletStatusCodec, pendingListCodec } = creditCodec;
const { failAuthenticationAlert } = authentication;
const { refinedToday } = dateFormatterUtil;

const { requestSearchStoreNameResults } = store;
const { requestTabletStatus, requestPendingList } = credit;

// 페이지명
const prepaymentTableInfoHeader = reactive([{ name: PREPAYMENT_TABLE_INFO }]);

/** 매장명 검색  */
let selectedStore = reactive<selectOptionType>({
  label: '',
  value: '',
});

const searchedStoreList: Ref<selectOptionType[]> = ref([]);
const postSearchStoreName = async (searchTxt: string) => {
  try {
    const payload = { searchTxt };
    const res = (await requestSearchStoreNameResults(payload)) as AxiosResponse;
    const typeError = runtimeCheck(storeListCodec, res.data);

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
        searchedStoreList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const activePane = ref('table');

/** 선택 매장의 테이블 정보 조회하기 */
const tableStatusList: Ref<tableStatusListType[]> = ref([]);
const isNoneTableStatusList = computed(() => tableStatusList.value.length < 1);

const getTableStatusList = async () => {
  try {
    const res = (await requestTabletStatus(
      selectedStore.value,
    )) as AxiosResponse;
    const typeError = runtimeCheck(tabletStatusCodec, res.data);

    if (!typeError) {
      if (res.data.resultCode === 200) {
        tableStatusList.value = res.data.resultData.tabletStatusList;
      }
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 선택 매장의 보류 리스트 조회 */
const searchData = reactive({
  selectDate: [`${refinedToday()} 00:00:00`, `${refinedToday()} 23:59:00`],
  tabletNumber: '',
});
const pendingPayList = ref([]);
const pendingDataPagination = reactive({
  currentPageNo: 0, // 현재 페이지
  totalPageCount: 0, // 총 페이지 갯수
  totalElementCount: 0, // 총 데이터 갯수
  elementSizePerPage: 100, // 회당 요청 조회갯수
});
const getPayDetails = async (page: number) => {
  try {
    const data = {
      page: page - 1, // 0부터
      size: pendingDataPagination.elementSizePerPage ?? 100,
      storeCode: selectedStore.value,
      tabletNumber: searchData.tabletNumber,
      startDatetime: searchData.selectDate[0],
      endDatetime: searchData.selectDate[1],
    };
    const res = (await requestPendingList(data)) as AxiosResponse;
    const typeError = runtimeCheck(pendingListCodec, res.data);

    if (!typeError) {
      if (res.data.resultCode === 200) {
        pendingPayList.value = res.data.resultData.content;
        pendingDataPagination.currentPageNo =
          res.data.resultData.currentPageNo + 1;
        pendingDataPagination.totalPageCount =
          res.data.resultData.totalPageCount;
        pendingDataPagination.totalElementCount =
          res.data.resultData.totalElementCount;
        pendingDataPagination.elementSizePerPage =
          res.data.resultData.elementSizePerPage;
      }
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleCurrentPage = async (val: number) => {
  pendingDataPagination.currentPageNo = val;
  getPayDetails(val);
};

const clickResetPendingList = () => {
  pendingDataPagination.currentPageNo = 0;
  pendingDataPagination.totalPageCount = 0;
  pendingDataPagination.totalElementCount = 0;
  pendingDataPagination.elementSizePerPage = 100;
  searchData.tabletNumber = '';
  searchData.selectDate = ['', ''];
};

// v-for key 유효성
const getTableDataKey = (code: string, index: number) => {
  if (code) {
    return `table-data-code-${code}-${index}`;
  }
  return `table-data-code-${index}`;
};

const getTableBoxStyle = (status: string | null) => ({
  'table-box': true,
  'status-before': status === 'BEFORE_PAYMENT',
  'status-fail': status === 'FAIL',
  'status-paying': status === 'PAYING',
  'status-paid': status === 'PAID',
});

const getTableStatusKorean = (status: string | null) => {
  if (status === 'BEFORE_PAYMENT') {
    return '결제 대기';
  }
  if (status === 'FAIL') {
    return '포스 접수 실패';
  }
  if (status === 'PAYING') {
    return '결제 진행 중';
  }
  if (status === 'PAID') {
    return '주문 확인 중';
  }
  if (!status) {
    return '주문 가능';
  }
  return '';
};

/**
 * 매장명 인풋 타이핑시 호출
 * @param (queryString) - 인풋 검색어
 * @param (changeSelectBox) - 검색목록 초기화 함수
 */
const onChangeStoreName = (
  queryString: string,
  changeSelectBox: (arg: any) => void,
) => {
  postSearchStoreName(queryString).then(() => {
    changeSelectBox(searchedStoreList.value);
  });
};

/**
 * 검색목록중 항목 선택시 호출
 * @param (data) - storeList의 항목
 */
const onSelectStoreCode = async (data: selectOptionType) => {
  selectedStore = data;
  await getTableStatusList();
  await getPayDetails(1);
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="prepaymentTableInfoHeader" />
  <el-descriptions
    :column="1"
    border
  >
    <el-descriptions-item>
      <template #label>
        <div>매장 선택</div>
      </template>
      <el-autocomplete
        v-model="selectedStore.label"
        :fetch-suggestions="onChangeStoreName"
        :trigger-on-focus="false"
        clearable
        placeholder="매장명을 검색해주세요."
        style="width: 40%"
        value-key="label"
        @select="onSelectStoreCode"
      />
    </el-descriptions-item>
  </el-descriptions>
  <el-tabs
    v-model="activePane"
    class="mt-10"
    type="card"
  >
    <el-tab-pane
      label="테이블 상태"
      name="table"
    >
      <el-row
        v-if="isNoneTableStatusList"
        align="middle"
        justify="center"
      >
        매장을 선택해 주세요.
      </el-row>
      <div
        v-else
        class="table-card-wrap"
      >
        <div
          v-for="(table, index) in tableStatusList"
          :key="getTableDataKey(table.tabletCode, index)"
          :class="getTableBoxStyle(table.status)"
          shadow="never"
        >
          <p class="mb-5">
            {{ table.tabletNumber }}
          </p>
          <p>[{{ getTableStatusKorean(table.status) }}]</p>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane
      label="보류 리스트"
      name="list"
    >
      <el-row
        v-if="isNoneTableStatusList"
        align="middle"
        justify="center"
      >
        매장을 선택해 주세요.
      </el-row>
      <div v-else>
        <el-card shadow="never">
          <el-row align="bottom">
            <div>
              <p class="font-small mb-5">기간</p>
              <el-date-picker
                v-model="searchData.selectDate"
                end-placeholder="조회종료일"
                format="YYYY/MM/DD HH:mm:ss"
                range-separator="~"
                start-placeholder="조회시작일"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </div>

            <div class="ml-10">
              <p class="font-small mb-5">테이블 번호</p>
              <el-select
                v-model="searchData.tabletNumber"
                clearable
              >
                <el-option
                  v-for="(table, index) in tableStatusList"
                  :key="getTableDataKey(table.tabletCode, index)"
                  :label="table.tabletNumber"
                  :value="table.tabletNumber"
                />
              </el-select>
            </div>
            <el-button
              class="ml-10"
              color="#000"
              @click="getPayDetails(1)"
            >
              조회
            </el-button>
            <el-button
              class="ml-10"
              @click="clickResetPendingList"
            >
              초기화
            </el-button>
          </el-row>
        </el-card>
        <el-table
          :data="pendingPayList"
          border
          class="mt-10"
          height="520"
        >
          <el-table-column
            align="center"
            header-align="center"
            label="No"
            prop="no"
            width="75"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="테이블 번호"
            prop="tabletNumber"
            width="125"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="주문 요약"
            min-width="225"
          >
            <template #default="{ row }">
              <div v-if="row.otherProductSize > 0">
                {{ row.startProductName }} 외 {{ row.otherProductSize }} 개
              </div>
              <div v-else>
                {{ row.startProductName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="주문금액"
            width="130"
          >
            <template #default="{ row }">
              {{ row.totalAmount?.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="결제 진행"
            width="130"
          >
            <template #default="{ row }">
              {{ row.completeAmount?.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="미수금"
            width="130"
          >
            <template #default="{ row }">
              {{ row.balance?.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="결제 방식"
            prop="paymentType"
            width="140"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="주문일시"
            prop="createdDatetime"
            width="220"
          />
        </el-table>

        <el-row
          class="mt-20"
          justify="center"
        >
          <el-pagination
            :current-page="pendingDataPagination.currentPageNo"
            :page-size="pendingDataPagination.elementSizePerPage"
            :total="pendingDataPagination.totalElementCount"
            background
            layout="prev, pager, next"
            @current-change="handleCurrentPage"
          />
        </el-row>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 150px;
  vertical-align: middle;
}

.table-card-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, auto));
  gap: 10px;

  .table-box {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 58px;
    color: #666;
    background-color: #e5e5e5;
    border-radius: 4px;
  }

  .status-before {
    color: #fff;
    background-color: #6cc7ff;
  }

  .status-fail {
    color: #fff;
    background-color: #e75f5f;
  }

  .status-paying {
    color: #fff;
    background-color: #f7ac1e;
  }

  .status-paid {
    color: #fff;
    background-color: #a382ff;
  }
}
</style>
