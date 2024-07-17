<script lang="ts" setup>
import { computed, reactive, Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, dateFormatterUtil, runtimeCheckHelper } from '@utils';
import {
  responseAuctionLogDataType,
  responseDetailAuctionHistoryType,
} from '@interface/extraService';
import { Picture } from '@element-plus/icons-vue';
import { excelDownload } from '@composables';
import { BreadcrumbHeader } from '@components';
import {
  EXTRA_SERVICE_AUCTION_LOG,
  EXTRA_SERVICE_LOG_MANAGE,
} from '@common/string';
import { extraServiceCodec } from '@codecs';
import { endpoints, extraService } from '@apis';

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
const { requestAuctionLogData, requestAuctionLogDetailData } = extraService;
const { responseAuctionLogDataCodec, responseDetailAuctionHistoryCodec } =
  extraServiceCodec;

const extraServiceAuctionLogHeader = reactive([
  { name: EXTRA_SERVICE_LOG_MANAGE },
  { name: EXTRA_SERVICE_AUCTION_LOG },
]);

const searchAuctionLogData = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
  results: ['SUCCESS', 'FAIL'],
  date: [refinedToday(), refinedToday()],
  query: '',
});

const auctionStateArray = [
  {
    value: 'SUCCESS',
    label: '낙찰',
  },
  {
    value: 'FAIL',
    label: '유찰',
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

const detailAuctionHistoryModal: Ref<boolean> = ref(false);

/** 경매 로그 데이터 불러오기 */
const auctionLogDataList: Ref<responseAuctionLogDataType[]> = ref([]);
const getAuctionLogDataList = async () => {
  const requestData = {
    page: searchAuctionLogData.page,
    size: searchAuctionLogData.size,
    results: searchAuctionLogData.results?.join(','),
    from: searchAuctionLogData.date[0],
    to: searchAuctionLogData.date[1],
    query: searchAuctionLogData.query,
  };

  try {
    const res = (await requestAuctionLogData(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(responseAuctionLogDataCodec, res.data.data);

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
        searchAuctionLogData.page = res.data.data.pageNo;
        searchAuctionLogData.size = res.data.data.pageSize;
        searchAuctionLogData.total = res.data.data.totalElementCount;
        searchAuctionLogData.to = res.data.data.to;
        searchAuctionLogData.from = res.data.data.from;
        auctionLogDataList.value = res.data.data.historyList;
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

/** 경매 내역 상세 정보 */
const detailAuctionHistoryData: Ref<responseDetailAuctionHistoryType> = ref(
  {} as responseDetailAuctionHistoryType,
);
const getDetailAuctionHistoryData = async (id: number) => {
  try {
    const res = (await requestAuctionLogDetailData(id)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseDetailAuctionHistoryCodec,
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
        detailAuctionHistoryData.value = res.data.data;
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
  const url = `${endpoints.entertainmentAdmin.auction.histories}/excels?from=${searchAuctionLogData.date[0]}&to=${searchAuctionLogData.date[1]}&results=${searchAuctionLogData.results?.join(',')}&query=${searchAuctionLogData.query}`;
  const title = `경매 로그_${refinedToday()}`;

  excelDownloadState.value = true;
  await getDownloadExcelWithToken(title, url);
  excelDownloadState.value = false;
};

// 상품 상태 전체 선택
const auctionStateAllCheckbox = ref(true);
const isIndeterminateProductState = ref(false);
const productStateAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  auctionStateArray.forEach((game) => allCheckArray.push(game.value));
  searchAuctionLogData.results = val ? allCheckArray : [];
  isIndeterminateProductState.value = false;
};
const checkedProductStateChange = (value: string[]) => {
  const checkedCount = value.length;
  auctionStateAllCheckbox.value = checkedCount === auctionStateArray.length;
  isIndeterminateProductState.value =
    checkedCount > 0 && checkedCount < auctionStateArray.length;
};

const setDateTodayShortCut = (range: string) => {
  switch (range) {
    case 'today':
      searchAuctionLogData.date = [refinedToday(), refinedToday()];
      break;

    case 'threeDay':
      searchAuctionLogData.date = [refinedThreeDay(), refinedToday()];
      break;

    case 'weekDay':
      searchAuctionLogData.date = [refinedWeek(), refinedToday()];
      break;

    case 'monthDay':
      searchAuctionLogData.date = [refinedMonth(), refinedToday()];
      break;

    case 'threeMonthDay':
      searchAuctionLogData.date = [refinedThreeMonth(), refinedToday()];
      break;

    case 'sixMonthDay':
      searchAuctionLogData.date = [refinedSixMonth(), refinedToday()];
      break;

    default:
      break;
  }
};

/** 날짜 선택 숏컷 */
const dateButtonRef = computed(() => {
  if (searchAuctionLogData.date.length !== 0) {
    const [startDay] = searchAuctionLogData.date;

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
  searchAuctionLogData.size = value;
  getAuctionLogDataList();
};

// 페이지네이션
const handleAuctionLogPage = (val: number) => {
  searchAuctionLogData.page = val - 1;
  getAuctionLogDataList();
};

/** 검색하기 */
const getSearchData = async () => {
  searchAuctionLogData.page = 0;
  await getAuctionLogDataList();
};

// 검색 초기화
const resetSearchData = () => {
  searchAuctionLogData.page = 0;
  searchAuctionLogData.size = 10;
  searchAuctionLogData.results = ['SUCCESS', 'FAIL'];
  searchAuctionLogData.date = [refinedToday(), refinedToday()];
  searchAuctionLogData.query = '';
  auctionStateAllCheckbox.value = true;
  isIndeterminateProductState.value = false;

  getAuctionLogDataList();
};

/** 상세 조회 모달창 열기 */
const openDetailModal = async (id: number) => {
  await getDetailAuctionHistoryData(id);
  detailAuctionHistoryModal.value = true;
};

const getNumberLocale = (price: number) =>
  Math.floor(price)?.toLocaleString() ?? '0';
const splitTimeData = (data: string) => data?.split(' ');
const getBidResult = (bid: string) => (bid === 'BID' ? '낙찰' : '유찰');

getAuctionLogDataList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="extraServiceAuctionLogHeader" />
  <el-dialog
    v-model="detailAuctionHistoryModal"
    title="경매 상세 조회"
    width="70%"
  >
    <div class="auction-log-modal">
      <div class="auction-log-modal-card">
        <p class="ml-10">경매 정보</p>
        <el-card
          class="auction-log-modal-card-box"
          shadow="hover"
        >
          <div class="auction-log-modal-card-gird">
            <p class="auction-log-modal-card-title">경매 상태</p>
            <p class="auction-log-modal-card-content">
              {{ detailAuctionHistoryData.status }}
            </p>
            <p class="auction-log-modal-card-title">경매 시작</p>
            <p class="auction-log-modal-card-content">
              {{ detailAuctionHistoryData.startDateTime }}
            </p>
            <p class="auction-log-modal-card-title">경매 시간</p>
            <p class="auction-log-modal-card-content">
              {{ detailAuctionHistoryData.runningTime }}
            </p>
          </div>
        </el-card>
      </div>
      <div class="auction-log-modal-card">
        <p class="ml-10">경매 상품</p>
        <el-card
          class="auction-log-modal-card-box"
          shadow="hover"
        >
          <div class="auction-log-modal-card-gird">
            <div class="auction-log-modal-card-image-gird">
              <el-image
                :src="detailAuctionHistoryData.goodsUrl"
                class="auction-log-modal-card-image"
                fit="contain"
              >
                <template #error>
                  <div class="auction-error-image">
                    <el-icon :size="20">
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <div class="auction-log-modal-card-option-gird">
                <p class="ellipsis-text-1 mb-20">
                  {{ detailAuctionHistoryData.goodsName }}
                </p>
                <div
                  v-for="option in detailAuctionHistoryData.optionGoodsJsonList"
                  :key="option.optionGoodsCode"
                >
                  <p>- {{ option.optionGoodsDisName }}</p>
                </div>
              </div>
              <div class="auction-log-modal-card-option-gird-price">
                <p class="auction-log-modal-card-option-gird-title">정상가</p>
                <span>
                  {{ getNumberLocale(detailAuctionHistoryData.goodsPrice) }}원
                </span>
              </div>
              <div class="auction-log-modal-card-option-gird-price">
                <p class="auction-log-modal-card-option-gird-title">시작가</p>
                <span>
                  {{ getNumberLocale(detailAuctionHistoryData.startPrice) }}원
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="auction-log-modal-card">
        <p class="ml-10">입찰 통계</p>
        <el-card
          class="auction-log-modal-card-box"
          shadow="hover"
        >
          <div class="auction-log-modal-card-gird">
            <p class="auction-log-modal-card-title">총 입찰 수</p>
            <p class="auction-log-modal-card-content">
              {{ detailAuctionHistoryData.totalBidCount }}회
            </p>
          </div>
        </el-card>
      </div>
      <div class="auction-log-modal-card">
        <p class="ml-10">입찰 현황</p>
        <el-card
          class="auction-log-modal-card-box"
          shadow="hover"
        >
          <div v-if="detailAuctionHistoryData?.bidList.length !== 0">
            <div class="auction-log-modal-card-gird">
              <p
                v-if="detailAuctionHistoryData?.bidList[0]"
                class="auction-log-modal-card-title"
              >
                1등
              </p>
              <p
                v-if="detailAuctionHistoryData?.bidList[0]"
                class="auction-log-modal-card-content"
              >
                {{ detailAuctionHistoryData?.bidList[0].tableCode }}
                {{
                  getNumberLocale(
                    detailAuctionHistoryData?.bidList[0].bidPrice,
                  )
                }}원
              </p>
              <p
                v-if="detailAuctionHistoryData?.bidList[1]"
                class="auction-log-modal-card-title"
              >
                2등
              </p>
              <p
                v-if="detailAuctionHistoryData?.bidList[1]"
                class="auction-log-modal-card-content"
              >
                {{ detailAuctionHistoryData.bidList[1].tableCode }}
                {{
                  getNumberLocale(detailAuctionHistoryData.bidList[1].bidPrice)
                }}원
              </p>
              <p
                v-if="detailAuctionHistoryData?.bidList[2]"
                class="auction-log-modal-card-title"
              >
                3등
              </p>
              <p
                v-if="detailAuctionHistoryData?.bidList[2]"
                class="auction-log-modal-card-content"
              >
                {{ detailAuctionHistoryData?.bidList[2].tableCode }}
                {{
                  getNumberLocale(
                    detailAuctionHistoryData?.bidList[2].bidPrice,
                  )
                }}원
              </p>
            </div>
          </div>
          <div v-else>
            <p>입찰 내역이 없습니다.</p>
          </div>
        </el-card>
      </div>
    </div>
  </el-dialog>
  <el-descriptions
    :column="1"
    border
    class="mt-20 mb-20"
  >
    <el-descriptions-item
      label="상태"
      label-align="center"
    >
      <el-row>
        <el-checkbox
          v-model="auctionStateAllCheckbox"
          :indeterminate="isIndeterminateProductState"
          @change="productStateAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="searchAuctionLogData.results"
          class="ml-30"
          @change="checkedProductStateChange"
        >
          <el-checkbox
            v-for="state in auctionStateArray"
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
            v-model="searchAuctionLogData.date"
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
        v-model="searchAuctionLogData.query"
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
      총 <span>{{ searchAuctionLogData.total }}</span>
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
        v-model="searchAuctionLogData.size"
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
    :data="auctionLogDataList"
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
        <p>{{ searchAuctionLogData.from - $index }}</p>
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
      label="정상가"
      width="150"
    >
      <template #default="{ row }">
        {{ getNumberLocale(row.goodsPrice) }} 원
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="시작가"
      width="150"
    >
      <template #default="{ row }">
        {{ getNumberLocale(row.startPrice) }} 원
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="낙찰가"
      width="150"
    >
      <template #default="{ row }">
        {{ getNumberLocale(row.bidPrice) }} 원
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="경매 시간(초)"
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
      label="결과"
      width="150"
    >
      <template #default="{ row }">
        {{ getBidResult(row.status) }}
      </template>
    </el-table-column>
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
      :current-page="searchAuctionLogData.page + 1"
      :page-size="searchAuctionLogData.size"
      :total="searchAuctionLogData.total"
      background
      layout="prev, pager, next"
      @current-change="handleAuctionLogPage"
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

.auction-log-modal {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr;
  gap: 10px;

  .auction-log-modal-card {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .auction-log-modal-card-box {
      height: 100%;
      border-radius: 10px;

      .auction-log-modal-card-gird {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .auction-log-modal-card-title {
          font-size: 19px;
          font-weight: bold;
        }

        .auction-log-modal-card-content {
          margin-left: 10px;
          font-size: 16px;
        }

        .auction-log-modal-card-image-gird {
          display: grid;
          grid-template-rows: 2fr 1fr;
          grid-template-columns: 1fr 1fr;
          gap: 10px;

          .auction-log-modal-card-image {
            width: 100%;
            height: 130px;

            .auction-error-image {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background-color: #f4f4f5;
            }
          }

          .auction-log-modal-card-option-gird {
            display: flex;
            flex-direction: column;

            p {
              font-size: 16px;
            }
          }

          .auction-log-modal-card-option-gird-price {
            display: flex;
            flex-direction: column;
            gap: 20px;

            .auction-log-modal-card-option-gird-title {
              font-size: 20px;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
}
</style>
