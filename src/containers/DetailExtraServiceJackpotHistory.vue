<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref, Ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, runtimeCheckHelper } from '@utils';
import {
  responseAuctionHistoryType,
  responseDetailJackpotHistoryType,
} from '@interface/extraService';
import { extraServiceCodec } from '@codecs';
import gatewayTokenApi from '@apis/axios/gatewayTokenApi';
import { endpoints, extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { refinedToday, refinedYesterday, refinedWeek, refinedMonth } =
  dateFormatterUtil;
const { requestJackpotHistory, requestDetailJackpotHistory } = extraService;
const { responseJackpotHistoryCodec, responseDetailJackpotHistoryCodec } =
  extraServiceCodec;
const { runtimeCheck } = runtimeCheckHelper;

const searchDataInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
  results: '',
});

const excelDownloadState = ref(false);

const detailJackpotHistoryModal: Ref<boolean> = ref(false);

const selectedDate: Ref<string[]> = ref([refinedToday(), refinedToday()]);

const resultsType = [
  {
    value: '',
    label: '전체',
  },
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

const setDateToday = () => {
  selectedDate.value = [refinedToday(), refinedToday()];
};
const setDateYesterday = () => {
  selectedDate.value = [refinedYesterday(), refinedYesterday()];
};
const setDateWeek = () => {
  selectedDate.value = [refinedWeek(), refinedToday()];
};
const setDateMonth = () => {
  selectedDate.value = [refinedMonth(), refinedToday()];
};

/** 날짜 shortCut */
const dateButtonRef = computed(() => {
  const [startDay] = selectedDate.value;
  const isDateSetToday = startDay === refinedToday();
  const isDateSetYesterday = startDay === refinedYesterday();
  const isDateSetWeek = startDay === refinedWeek();
  const isDateSetMonth = startDay === refinedMonth();
  if (isDateSetToday) {
    return '오늘';
  }
  if (isDateSetYesterday) {
    return '어제';
  }
  if (isDateSetWeek) {
    return '7일';
  }
  if (isDateSetMonth) {
    return '1개월';
  }
  return '';
});

/** 잭팟 내역 리스트 */
const jackpotHistoryData: Ref<responseAuctionHistoryType[]> = ref([]);
const getJackpotHistoryData = async () => {
  const requestData = {
    page: searchDataInfo.page,
    size: searchDataInfo.size,
    from: selectedDate.value[0],
    to: selectedDate.value[1],
    results: searchDataInfo.results,
  };
  try {
    const res = (await requestJackpotHistory(
      storeCode,
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(responseJackpotHistoryCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        jackpotHistoryData.value = res.data.data.historyList;
        searchDataInfo.page = res.data.data.pageNo;
        searchDataInfo.size = res.data.data.pageSize;
        searchDataInfo.total = res.data.data.totalElementCount;
        searchDataInfo.to = res.data.data.to;
        searchDataInfo.from = res.data.data.from;
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
    const res = (await requestDetailJackpotHistory(
      storeCode,
      id,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseDetailJackpotHistoryCodec,
      res.data.data,
    );

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

/** 잭팟 내역 엑셀 다운로드 */
const downloadExcel = () => {
  const searchUrl = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/histories/excels?from=${selectedDate.value[0]}&to=${selectedDate.value[1]}`;

  try {
    excelDownloadState.value = true;

    gatewayTokenApi({
      url: searchUrl,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      link.download = `잭팟 내역_${refinedToday()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      excelDownloadState.value = false;
    });
  } catch (error) {
    console.log(error);
    excelDownloadState.value = false;
  }
};

// 검색 초기화
const resetSearchData = () => {
  searchDataInfo.page = 0;
  searchDataInfo.size = 10;
  searchDataInfo.total = 0;
  searchDataInfo.results = '';
  selectedDate.value[0] = refinedToday();
  selectedDate.value[1] = refinedToday();
  getJackpotHistoryData();
};

const handleTableGamePage = (val: number) => {
  searchDataInfo.page = val - 1;
  getJackpotHistoryData();
};

const changePageSize = (value: number) => {
  searchDataInfo.size = value;
  getJackpotHistoryData();
};

const openDetailModal = (id: number) => {
  detailJackpotHistoryModal.value = true;
  getDetailJackpotHistoryData(id);
};

const getJackpotType = (type: string) =>
  type === 'JACKPOT' ? '잭팟' : '파도타기';

const getWinTablesName = (win: string) => {
  if (win !== undefined && win !== null) return `${win}번 테이블`;
  return '-';
};

const getJoinTablesCount = (join: number) => {
  if (join !== undefined && join !== null) return `${join}개 테이블`;
  return '-';
};

getJackpotHistoryData();
</script>

<template>
  <el-dialog
    v-model="detailJackpotHistoryModal"
    title="잭팟 상세 조회"
    width="70%"
  >
    <div class="detail-jackpot-history-modal">
      <div class="detail-jackpot-history-modal-card">
        <p class="ml-10">잭팟 정보</p>
        <el-card
          class="detail-jackpot-history-modal-card-box"
          shadow="hover"
        >
          <div class="detail-jackpot-history-modal-card">
            <p class="detail-jackpot-history-modal-card-title">이벤트 시작</p>
            <p class="detail-jackpot-history-modal-card-content">
              {{ detailJackpotHistoryData.startDateTime }}
            </p>
            <p class="detail-jackpot-history-modal-card-title">이벤트 시간</p>
            <p class="detail-jackpot-history-modal-card-content">
              {{ detailJackpotHistoryData.runningTime }}
            </p>
            <p class="detail-jackpot-history-modal-card-title">이벤트 구분</p>
            <p class="detail-jackpot-history-modal-card-content">
              {{ getJackpotType(detailJackpotHistoryData.eventType) }}
            </p>
          </div>
        </el-card>
      </div>
      <div class="detail-jackpot-history-modal-card">
        <p class="ml-10">잭팟 상품</p>
        <el-card
          class="detail-jackpot-history-modal-card-box"
          shadow="hover"
        >
          <div class="detail-jackpot-history-modal-card">
            <div class="detail-jackpot-history-modal-card-image-container">
              <el-image
                :src="detailJackpotHistoryData.goodsUrl"
                class="detail-jackpot-history-modal-card-image"
                fit="contain"
              />
              <p class="detail-jackpot-history-modal-card-goodName">
                {{ detailJackpotHistoryData.goodsName }}
              </p>
            </div>
          </div>
        </el-card>
      </div>
      <div class="detail-jackpot-history-modal-card">
        <p class="ml-10">잭팟 참여 정보</p>
        <el-card
          class="detail-jackpot-history-modal-card-box"
          shadow="hover"
        >
          <div class="detail-jackpot-history-modal-card">
            <p class="detail-jackpot-history-modal-card-title">당첨</p>
            <p class="detail-jackpot-history-modal-card-content">
              {{ getWinTablesName(detailJackpotHistoryData.winTableName) }}
            </p>
            <p class="detail-jackpot-history-modal-card-title">
              참여 테이블 수
            </p>
            <p class="detail-jackpot-history-modal-card-content">
              {{ getJoinTablesCount(detailJackpotHistoryData.joinTabletCount) }}
            </p>
          </div>
        </el-card>
      </div>
    </div>
  </el-dialog>
  <div class="detail-service-title mb-10">
    <span> 잭팟 내역 </span>
  </div>
  <el-descriptions
    :column="1"
    border
    class="mb-20"
  >
    <el-descriptions-item
      label="결과"
      label-align="center"
    >
      <el-row align="middle">
        <el-radio-group v-model="searchDataInfo.results">
          <el-radio
            v-for="result in resultsType"
            :key="result.value"
            :label="result.value"
          >
            {{ result.label }}
          </el-radio>
        </el-radio-group>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label="조회 기간"
      label-align="center"
    >
      <div class="detail-service-table-game-time-picker">
        <el-date-picker
          v-model="selectedDate"
          end-placeholder="조회종료일"
          format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="조회시작일"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
        <el-radio-group v-model="dateButtonRef">
          <el-radio-button
            label="오늘"
            @click="setDateToday"
          />
          <el-radio-button
            label="어제"
            @click="setDateYesterday"
          />
          <el-radio-button
            label="7일"
            @click="setDateWeek"
          />
          <el-radio-button
            label="1개월"
            @click="setDateMonth"
          />
        </el-radio-group>
      </div>
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    class="mb-20"
    justify="center"
  >
    <el-button
      class="extra-service-button"
      type="warning"
      @click="resetSearchData"
    >
      초기화
    </el-button>
    <el-button
      class="extra-service-button"
      type="primary"
      @click="getJackpotHistoryData"
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
    <p class="extra-service-count-info">
      총
      <span>{{ searchDataInfo.total }}</span>
      개의 검색결과가 있습니다.
    </p>
    <div>
      <el-button
        v-if="!excelDownloadState"
        class="extra-service-button"
        type="success"
        @click="downloadExcel"
      >
        엑셀 다운
      </el-button>
      <el-button
        v-else
        class="extra-service-button"
        loading
        type="success"
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="searchDataInfo.size"
        class="extra-service-page-select"
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
    v-if="jackpotHistoryData.length !== 0"
    :data="jackpotHistoryData"
    :height="530"
    border
    class="mb-20"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="순번"
      width="80"
    >
      <template #default="{ $index }">
        <p>{{ searchDataInfo.from - $index }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="진행일시"
      prop="startDateTime"
      width="180"
    />
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
      prop="eventType"
    >
      <template #default="{ row }">
        {{ getJackpotType(row.eventType) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="잭팟 시간(초)"
      prop="runningTime"
      width="120"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="당첨 테이블"
      prop="winTableCode"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="참여 테이블 수"
      prop="joinTabletCount"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="결과"
      prop="statusName"
      width="100"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="비고"
      width="120"
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
  <el-card
    v-else
    class="empty-table-data"
    shadow="never"
  >
    검색 조건에 일치하는 항목이 없습니다.
  </el-card>
  <el-row
    v-if="jackpotHistoryData.length !== 0"
    align="middle"
    class="mt-10"
    justify="center"
  >
    <el-pagination
      :current-page="searchDataInfo.page + 1"
      :page-size="searchDataInfo.size"
      :total="searchDataInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleTableGamePage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.detail-jackpot-history-modal {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;

  .detail-jackpot-history-modal-card {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .detail-jackpot-history-modal-card-box {
      height: 100%;
      border-radius: 10px;

      .detail-jackpot-history-modal-card {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .detail-jackpot-history-modal-card-title {
          font-size: 19px;
          font-weight: bold;
        }

        .detail-jackpot-history-modal-card-content {
          margin-left: 10px;
          font-size: 16px;
        }

        .detail-jackpot-history-modal-card-image-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;

          .detail-jackpot-history-modal-card-image {
            width: 100%;
            height: 200px;
          }
        }

        .detail-jackpot-history-modal-card-goodName {
          font-size: 22px;
        }
      }
    }
  }
}

.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.detail-service-table-game-time-picker {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 60%;
}

.extra-service-search-list {
  font-size: 20px;
}

.extra-service-divider {
  margin: 10px 0;
}

.extra-service-count-info {
  font-size: 15px;

  span {
    font-size: 17px;
    color: red;
  }
}

.extra-service-button {
  width: 120px;
  margin-right: 10px;
}

.empty-table-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  font-size: 28px;
  font-weight: 500;
}
</style>
