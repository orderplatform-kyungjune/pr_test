<script lang="ts" setup>
import { ref, Ref, reactive, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, dateFormatterUtil, runtimeCheckHelper } from '@utils';
import {
  responseJackpotLogDataType,
  responseDetailJackpotHistoryType,
} from '@interface/extraService';
import { Picture } from '@element-plus/icons-vue';
import { excelDownload } from '@composables';
import { BreadcrumbHeader } from '@components';
import {
  EXTRA_SERVICE_LOG_MANAGE,
  EXTRA_SERVICE_JACKPOT_LOG,
} from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService, endpoints } from '@apis';

const {
  refinedToday,
  refinedThreeDay,
  refinedWeek,
  refinedMonth,
  refinedThreeMonth,
  refinedSixMonth,
} = dateFormatterUtil;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { getDownloadExcelWithToken } = excelDownload();
const { requestJackpotLogData, requestJackpotLogDetailData } = extraService;
const { responseJackpotLogDataCodec, responseDetailJackpotHistoryCodec } =
  extraServiceCodec;

const extraServiceJackpotLogHeader = reactive([
  { name: EXTRA_SERVICE_LOG_MANAGE },
  { name: EXTRA_SERVICE_JACKPOT_LOG },
]);

const searchJackpotLogData = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
  results: ['DONE', 'CANCEL'],
  date: [refinedToday(), refinedToday()],
  query: '',
});

const jackpotStateArray = [
  {
    value: 'DONE',
    label: '당첨',
  },
  {
    value: 'CANCEL',
    label: '미당첨',
  },
];

const pagePerCount = [
  {
    label: '10개씩 보기',
    value: 10,
  },
  {
    label: '20개씩 보기',
    value: 20,
  },
  {
    label: '30개씩 보기',
    value: 30,
  },
  {
    label: '40개씩 보기',
    value: 40,
  },
  {
    label: '50개씩 보기',
    value: 50,
  },
  {
    label: '100개씩 보기',
    value: 100,
  },
];

const excelDownloadState = ref(false);

const detailJackpotHistoryModal: Ref<boolean> = ref(false);

/** 경매 로그 데이터 불러오기 */
const jackpotLogDataList: Ref<responseJackpotLogDataType[]> = ref([]);
const getJackpotLogDataList = async () => {
  const requestData = {
    page: searchJackpotLogData.page,
    size: searchJackpotLogData.size,
    results: searchJackpotLogData.results?.join(','),
    from: searchJackpotLogData.date[0],
    to: searchJackpotLogData.date[1],
    query: searchJackpotLogData.query,
  };

  try {
    const res = (await requestJackpotLogData(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(responseJackpotLogDataCodec, res.data.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.resultCode === 200) {
      if (!typeError) {
        searchJackpotLogData.page = res.data.data.pageNo;
        searchJackpotLogData.size = res.data.data.pageSize;
        searchJackpotLogData.total = res.data.data.totalElementCount;
        searchJackpotLogData.to = res.data.data.to;
        searchJackpotLogData.from = res.data.data.from;
        jackpotLogDataList.value = res.data.data.historyList;
      }
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 잭팟 내역 상세 정보 */
const detailJackpotHistoryData: Ref<responseDetailJackpotHistoryType> = ref(
  {} as responseDetailJackpotHistoryType,
);
const getDetailJackpotHistoryData = async (id: number) => {
  try {
    const res = (await requestJackpotLogDetailData(id)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseDetailJackpotHistoryCodec,
      res.data.data,
    );

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.resultCode === 200) {
      if (!typeError) {
        detailJackpotHistoryData.value = res.data.data;
      }
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 엑셀 다운로드 */
const getExcelDownLoadData = async () => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.entertainmentAdmin.jackpot.histories}/excels?from=${searchJackpotLogData.date[0]}&to=${searchJackpotLogData.date[1]}&results=${searchJackpotLogData.results?.join(',')}&query=${searchJackpotLogData.query}`;
  const title = `잭팟 로그_${refinedToday()}`;

  excelDownloadState.value = true;
  await getDownloadExcelWithToken(title, url);
  excelDownloadState.value = false;
};

// 결과 상태 전체 선택
const jackpotStateAllCheckbox = ref(true);
const isIndeterminateResultState = ref(false);
const productStateAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  jackpotStateArray.forEach((result) => allCheckArray.push(result.value));
  searchJackpotLogData.results = val ? allCheckArray : [];
  isIndeterminateResultState.value = false;
};
const checkedResultStateChange = (value: string[]) => {
  const checkedCount = value.length;
  jackpotStateAllCheckbox.value = checkedCount === jackpotStateArray.length;
  isIndeterminateResultState.value =
    checkedCount > 0 && checkedCount < jackpotStateArray.length;
};

const setDateTodayShortCut = (range: string) => {
  switch (range) {
    case 'today':
      searchJackpotLogData.date = [refinedToday(), refinedToday()];
      break;

    case 'threeDay':
      searchJackpotLogData.date = [refinedThreeDay(), refinedToday()];
      break;

    case 'weekDay':
      searchJackpotLogData.date = [refinedWeek(), refinedToday()];
      break;

    case 'monthDay':
      searchJackpotLogData.date = [refinedMonth(), refinedToday()];
      break;

    case 'threeMonthDay':
      searchJackpotLogData.date = [refinedThreeMonth(), refinedToday()];
      break;

    case 'sixMonthDay':
      searchJackpotLogData.date = [refinedSixMonth(), refinedToday()];
      break;

    default:
      break;
  }
};

/** 날짜 선택 숏컷 */
const dateButtonRef = computed(() => {
  if (searchJackpotLogData.date.length !== 0) {
    const [startDay] = searchJackpotLogData.date;

    if (startDay === refinedToday()) return '오늘';
    if (startDay === refinedThreeDay()) return '3일';
    if (startDay === refinedWeek()) return '7일';
    if (startDay === refinedMonth()) return '1개월';
    if (startDay === refinedThreeMonth()) return '3개월';
    if (startDay === refinedSixMonth()) return '6개월';
  }
  return '';
});

// 페이지당 갯수 선택
const changePageSize = (value: number) => {
  searchJackpotLogData.size = value;
  getJackpotLogDataList();
};

// 페이지네이션
const handleJackpotLogPage = (val: number) => {
  searchJackpotLogData.page = val - 1;
  getJackpotLogDataList();
};

/** 검색하기 */
const getSearchData = async () => {
  searchJackpotLogData.page = 0;
  await getJackpotLogDataList();
};

// 검색 초기화
const resetSearchData = () => {
  searchJackpotLogData.page = 0;
  searchJackpotLogData.size = 10;
  searchJackpotLogData.results = ['DONE', 'CANCEL'];
  searchJackpotLogData.date = [refinedToday(), refinedToday()];
  searchJackpotLogData.query = '';
  jackpotStateAllCheckbox.value = true;
  isIndeterminateResultState.value = false;

  getJackpotLogDataList();
};

/** 상세 조회 모달창 열기 */
const openDetailModal = async (id: number) => {
  await getDetailJackpotHistoryData(id);
  detailJackpotHistoryModal.value = true;
};

const splitTimeData = (data: string) => data?.split(' ');
const getJackpotType = (type: string) =>
  type === 'JACKPOT' ? '잭팟' : '파도타기';

getJackpotLogDataList();
</script>

<template>
  <el-dialog
    v-model="detailJackpotHistoryModal"
    title="잭팟 상세 조회"
    width="70%"
  >
    <div class="jackpot-log-modal">
      <div class="jackpot-log-modal-card">
        <p class="ml-10">잭팟 정보</p>
        <el-card
          class="jackpot-log-modal-card-box"
          shadow="hover"
        >
          <div class="jackpot-log-modal-card-gird">
            <p class="jackpot-log-modal-card-title">이벤트 시작</p>
            <p class="jackpot-log-modal-card-content">
              {{ detailJackpotHistoryData.startDateTime }}
            </p>
            <p class="jackpot-log-modal-card-title">이벤트 시간</p>
            <p class="jackpot-log-modal-card-content">
              {{ detailJackpotHistoryData.runningTime }}
            </p>
            <p class="jackpot-log-modal-card-title">이벤트 구분</p>
            <p class="jackpot-log-modal-card-content">
              {{ getJackpotType(detailJackpotHistoryData.eventType) }}
            </p>
          </div>
        </el-card>
      </div>
      <div class="jackpot-log-modal-card">
        <p class="ml-10">잭팟 상품</p>
        <el-card
          class="jackpot-log-modal-card-box"
          shadow="hover"
        >
          <div class="jackpot-log-modal-card-gird">
            <div class="jackpot-log-modal-card-image-gird">
              <el-image
                :src="detailJackpotHistoryData.goodsUrl"
                class="jackpot-log-modal-card-image"
                fit="contain"
              >
                <template #error>
                  <div class="jackpot-error-image">
                    <el-icon :size="20">
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <p class="jackpot-log-modal-card-goodName">
                {{ detailJackpotHistoryData.goodsName }}
              </p>
            </div>
          </div>
        </el-card>
      </div>
      <div class="jackpot-log-modal-card">
        <p class="ml-10">잭팟 참여 정보</p>
        <el-card
          class="jackpot-log-modal-card-box"
          shadow="hover"
        >
          <div class="jackpot-log-modal-card-gird">
            <p class="jackpot-log-modal-card-title">당첨</p>
            <p
              v-if="detailJackpotHistoryData.winTableName"
              class="jackpot-log-modal-card-content"
            >
              {{ detailJackpotHistoryData.winTableName }}번 테이블
            </p>
            <p
              v-else
              class="jackpot-log-modal-card-content"
            >
              당첨된 테이블이 없습니다.
            </p>
            <p class="jackpot-log-modal-card-title">참여 테이블 수</p>
            <p class="jackpot-log-modal-card-content">
              {{ detailJackpotHistoryData.joinTabletCount }}개 테이블
            </p>
          </div>
        </el-card>
      </div>
    </div>
  </el-dialog>
  <BreadcrumbHeader :propsHeader="extraServiceJackpotLogHeader" />
  <el-descriptions
    :column="1"
    border
    class="mt-20 mb-20"
  >
    <el-descriptions-item
      label="결과"
      label-align="center"
    >
      <el-row>
        <el-checkbox
          v-model="jackpotStateAllCheckbox"
          :indeterminate="isIndeterminateResultState"
          @change="productStateAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="searchJackpotLogData.results"
          class="ml-30"
          @change="checkedResultStateChange"
        >
          <el-checkbox
            v-for="state in jackpotStateArray"
            :key="state.value"
            :label="state.value"
          >
            {{ state.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label="조회 기간"
      label-align="center"
    >
      <div class="date-picker-wrapper">
        <div>
          <el-date-picker
            v-model="searchJackpotLogData.date"
            end-placeholder="종료일"
            format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="시작일"
            type="daterange"
            value-format="YYYY-MM-DD"
          />
        </div>
        <el-radio-group v-model="dateButtonRef">
          <el-radio-button
            label="오늘"
            @click="setDateTodayShortCut('today')"
          />
          <el-radio-button
            label="3일"
            @click="setDateTodayShortCut('threeDay')"
          />
          <el-radio-button
            label="7일"
            @click="setDateTodayShortCut('weekDay')"
          />
          <el-radio-button
            label="1개월"
            @click="setDateTodayShortCut('monthDay')"
          />
          <el-radio-button
            label="3개월"
            @click="setDateTodayShortCut('threeMonthDay')"
          />
          <el-radio-button
            label="6개월"
            @click="setDateTodayShortCut('sixMonthDay')"
          />
        </el-radio-group>
      </div>
    </el-descriptions-item>
    <el-descriptions-item
      label="매장명"
      label-align="center"
    >
      <el-input
        v-model="searchJackpotLogData.query"
        clearable
        @keyup.enter="getSearchData"
      />
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    class="mb-20"
    justify="center"
  >
    <el-button
      class="search-button-style"
      type="warning"
      @click="resetSearchData"
    >
      초기화
    </el-button>
    <el-button
      class="search-button-style"
      type="primary"
      @click="getSearchData"
    >
      검색
    </el-button>
  </el-row>
  <p class="extra-service-search-list">검색목록</p>
  <el-divider class="extra-service-divider" />
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <p class="total-data-count-info">
      총 <span>{{ searchJackpotLogData.total }}</span>
      개의 검색결과가 있습니다.
    </p>
    <div>
      <el-button
        v-if="!excelDownloadState"
        class="excel-download-button"
        type="success"
        @click="getExcelDownLoadData"
      >
        엑셀 다운
      </el-button>
      <el-button
        v-else
        class="excel-download-button"
        loading
        type="success"
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="searchJackpotLogData.size"
        class="per-page-select"
        @change="changePageSize"
      >
        <el-option
          v-for="count in pagePerCount"
          :key="count.value"
          :label="count.label"
          :value="count.value"
        />
      </el-select>
    </div>
  </el-row>
  <el-table
    :data="jackpotLogDataList"
    border
    height="420"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="순번"
      width="100"
    >
      <template #default="{ $index }">
        <p>{{ searchJackpotLogData.from - $index }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="진행일시"
      prop="startDateTime"
      width="150"
    >
      <template #default="{ row }">
        <div>
          <p>{{ splitTimeData(row.startDateTime)[0] }}</p>
          <p>{{ splitTimeData(row.startDateTime)[1] }}</p>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      prop="storeName"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="상품"
      prop="goodsName"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="구분"
      width="150"
    >
      <template #default="{ row }">
        {{ getJackpotType(row.eventType) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="룰렛 시간(초)"
      prop="runningTime"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="당첨 테이블"
      prop="winTableCode"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="참여 테이블 수"
      prop="joinTabletCount"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="결과"
      prop="statusName"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="비고"
      width="100"
    >
      <template #default="{ row }">
        <el-button
          type="info"
          @click="openDetailModal(row.historyId)"
        >
          상세
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    align="middle"
    class="mt-10"
    justify="center"
  >
    <el-pagination
      :current-page="searchJackpotLogData.page + 1"
      :page-size="searchJackpotLogData.size"
      :total="searchJackpotLogData.total"
      background
      layout="prev, pager, next"
      @current-change="handleJackpotLogPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 20%;
  vertical-align: middle;
}

.search-button-style {
  width: 150px;
}

.excel-download-button {
  width: 120px;
}

.per-page-select {
  margin-left: 12px;
}

.date-picker-wrapper {
  display: flex;
  gap: 10px;
}

.total-data-count-info {
  font-size: 15px;

  span {
    font-size: 17px;
    color: red;
  }
}

.extra-service-search-list {
  font-size: 20px;
}

.extra-service-divider {
  margin: 10px 0;
}

.jackpot-log-modal {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;

  .jackpot-log-modal-card {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .jackpot-log-modal-card-box {
      height: 100%;
      border-radius: 10px;

      .jackpot-log-modal-card-gird {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .jackpot-log-modal-card-title {
          font-size: 19px;
          font-weight: bold;
        }

        .jackpot-log-modal-card-content {
          margin-left: 10px;
          font-size: 16px;
        }

        .jackpot-log-modal-card-image-gird {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;

          .jackpot-log-modal-card-image {
            width: 100%;
            height: 230px;

            .jackpot-error-image {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background-color: #f4f4f5;
            }
          }
        }

        .jackpot-log-modal-card-goodName {
          font-size: 22px;
        }
      }
    }
  }
}
</style>
