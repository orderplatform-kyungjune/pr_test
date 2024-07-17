<script lang="ts" setup>
import { computed, reactive, ref, Ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, dateFormatterUtil, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestTableGameStatusType,
  responseExtraServiceTableGameListType,
} from '@interface/extraService';
import { InquiryDetailTableGameModal } from '@containers';
import { excelDownload } from '@composables';
import { BreadcrumbHeader } from '@components';
import {
  EXTRA_SERVICE_LOG_MANAGE,
  EXTRA_SERVICE_TABLE_GAME_LOG,
  INQUIRY_DETAIL_TABLE_GAME,
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
const { openModalWithData, flag } = useModalStore();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { getDownloadExcelWithToken } = excelDownload();
const { requestTableGameLogDataList, requestTableGameLogDataStatList } =
  extraService;
const {
  responseExtraServiceTableGameCodec,
  responseExtraServiceTableGameRoomStatCodec,
} = extraServiceCodec;

const extraServiceTableGameLogHeader = reactive([
  { name: EXTRA_SERVICE_LOG_MANAGE },
  { name: EXTRA_SERVICE_TABLE_GAME_LOG },
]);

const gameTypeList = [
  {
    value: 'CROCODILE_GAME',
    label: '악어룰렛',
  },
  {
    value: 'RSP_GAME',
    label: '가위바위보',
  },
  {
    value: 'ARCHERY_GAME',
    label: '양궁',
  },
];

const gameStateList = [
  {
    value: 'PRE_GAME,APP_LOADING_GAME',
    label: '대기',
  },
  {
    value: 'PRE_GAME_EXPIRE,LOADING_GAME_EXPIRE',
    label: '대기 이탈',
  },
  {
    value: 'ON_GAME',
    label: '진행중',
  },
  {
    value: 'ON_GAME_EXPIRE',
    label: '진행 중 이탈',
  },
  {
    value: 'END_GAME',
    label: '완료',
  },
  {
    value: 'ERROR',
    label: '에러',
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

const searchTableGameLogData = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
  gameList: ['RSP_GAME', 'ARCHERY_GAME', 'CROCODILE_GAME'],
  date: [refinedToday(), refinedToday()],
  storeName: '',
  gameRoomStatusList: [
    'PRE_GAME,APP_LOADING_GAME',
    'PRE_GAME_EXPIRE,LOADING_GAME_EXPIRE',
    'ON_GAME',
    'ON_GAME_EXPIRE',
    'END_GAME',
    'ERROR',
  ],
});

const excelDownloadState = ref(false);

/** 테이블 게임 내역 불러오기 */
const tableGameList: Ref<responseExtraServiceTableGameListType[]> = ref([]);
const getTableGameList = async () => {
  const requestData = {
    page: searchTableGameLogData.page,
    size: searchTableGameLogData.size,
    from: searchTableGameLogData.date[0],
    to: searchTableGameLogData.date[1],
    storeName: searchTableGameLogData.storeName,
    gameList: searchTableGameLogData.gameList.join(),
    gameRoomStatusList: searchTableGameLogData.gameRoomStatusList.join(),
  };

  try {
    const res = (await requestTableGameLogDataList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceTableGameCodec,
      res.data,
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
        searchTableGameLogData.page = res.data.data.pageNo;
        searchTableGameLogData.size = res.data.data.pageSize;
        searchTableGameLogData.total = res.data.data.totalElementCount;
        searchTableGameLogData.from = res.data.data.from;
        searchTableGameLogData.to = res.data.data.to;

        tableGameList.value = res.data.data.gameCountHistoriesSearchList;
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

/** 테이블 게임 통계 내역 리스트 */
const tableGameStats: Ref<requestTableGameStatusType> = ref(
  {} as requestTableGameStatusType,
);
const getTableGameStatList = async () => {
  const requestData = {
    page: searchTableGameLogData.page,
    size: searchTableGameLogData.size,
    from: searchTableGameLogData.date[0],
    to: searchTableGameLogData.date[1],
    storeName: searchTableGameLogData.storeName,
    gameList: searchTableGameLogData.gameList.join(),
    gameRoomStatusList: searchTableGameLogData.gameRoomStatusList.join(),
  };

  try {
    const res = (await requestTableGameLogDataStatList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceTableGameRoomStatCodec,
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
        tableGameStats.value = res.data.data;
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
  const url = `${endpoints.entertainmentAdmin.games.toExcel}?from=${searchTableGameLogData.date[0]}&to=${searchTableGameLogData.date[1]}&storeName=${searchTableGameLogData.storeName}&gameList=${searchTableGameLogData.gameList?.join(',')}&gameRoomStatusList=${searchTableGameLogData.gameRoomStatusList.join()}`;
  const title = `테이블 게임 로그_${refinedToday()}`;

  excelDownloadState.value = true;
  await getDownloadExcelWithToken(title, url);
  excelDownloadState.value = false;
};

// 게임 구분 검색 체크박스 전체 선택
const gameTypeAllCheckbox = ref(true);
const isIndeterminateGameType = ref(false);
const gameTypeCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  gameTypeList.forEach((game) => allCheckArray.push(game.value));
  searchTableGameLogData.gameList = val ? allCheckArray : [];
  isIndeterminateGameType.value = false;
};
const checkedGameTypeChange = (value: string[]) => {
  const checkedCount = value.length;
  gameTypeAllCheckbox.value = checkedCount === gameTypeList.length;
  isIndeterminateGameType.value =
    checkedCount > 0 && checkedCount < gameTypeList.length;
};

// 게임 상태 검색 체크박스 전체 선택
const gameStateAllCheckbox = ref(true);
const isIndeterminateGameState = ref(false);
const gameStateCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  gameStateList.forEach((game) => allCheckArray.push(game.value));
  searchTableGameLogData.gameRoomStatusList = val ? allCheckArray : [];
  isIndeterminateGameState.value = false;
};
const checkedGameStateChange = (value: string[]) => {
  const checkedCount = value.length;
  gameStateAllCheckbox.value = checkedCount === gameStateList.length;
  isIndeterminateGameState.value =
    checkedCount > 0 && checkedCount < gameStateList.length;
};

const setDateTodayShortCut = (range: string) => {
  if (range === 'today') {
    searchTableGameLogData.date = [refinedToday(), refinedToday()];
  }
  if (range === 'threeDay') {
    searchTableGameLogData.date = [refinedThreeDay(), refinedToday()];
  }
  if (range === 'weekDay') {
    searchTableGameLogData.date = [refinedWeek(), refinedToday()];
  }
  if (range === 'monthDay') {
    searchTableGameLogData.date = [refinedMonth(), refinedToday()];
  }
  if (range === 'threeMonthDay') {
    searchTableGameLogData.date = [refinedThreeMonth(), refinedToday()];
  }
  if (range === 'sixMonthDay') {
    searchTableGameLogData.date = [refinedSixMonth(), refinedToday()];
  }
};

/** 날짜 선택 숏컷 */
const dateButtonRef = computed(() => {
  if (searchTableGameLogData.date.length !== 0) {
    const [startDay] = searchTableGameLogData.date;
    const isDateSetToday = startDay === refinedToday();
    const isDateSetThreeDay = startDay === refinedThreeDay();
    const isDateSetWeek = startDay === refinedWeek();
    const isDateSetMonth = startDay === refinedMonth();
    const isDateSetThreeMonth = startDay === refinedThreeMonth();
    const isDateSetSixMonth = startDay === refinedSixMonth();
    if (isDateSetToday) {
      return '오늘';
    }
    if (isDateSetThreeDay) {
      return '3일';
    }
    if (isDateSetWeek) {
      return '7일';
    }
    if (isDateSetMonth) {
      return '1개월';
    }
    if (isDateSetThreeMonth) {
      return '3개월';
    }
    if (isDateSetSixMonth) {
      return '6개월';
    }
  }
  return '';
});

// 페이지당 갯수 선택
const changePageSize = async (value: number) => {
  searchTableGameLogData.size = value;
  await getTableGameList();
};

// 페이지네이션
const handleJackpotLogPage = async (val: number) => {
  searchTableGameLogData.page = val - 1;
  await getTableGameList();
};

/** 검색하기 */
const getSearchData = async () => {
  searchTableGameLogData.page = 0;
  await getTableGameStatList();
  await getTableGameList();
};

// 검색 초기화
const resetSearchData = async () => {
  searchTableGameLogData.page = 0;
  searchTableGameLogData.size = 10;
  searchTableGameLogData.gameList = [
    'RSP_GAME',
    'ARCHERY_GAME',
    'CROCODILE_GAME',
  ];
  searchTableGameLogData.date = [refinedToday(), refinedToday()];
  searchTableGameLogData.storeName = '';
  searchTableGameLogData.gameRoomStatusList = [
    'PRE_GAME,APP_LOADING_GAME',
    'PRE_GAME_EXPIRE,LOADING_GAME_EXPIRE',
    'ON_GAME',
    'ON_GAME_EXPIRE',
    'END_GAME',
    'ERROR',
  ];
  gameTypeAllCheckbox.value = true;
  isIndeterminateGameType.value = false;
  gameStateAllCheckbox.value = true;
  isIndeterminateGameState.value = false;

  await getTableGameStatList();
  await getTableGameList();
};

const splitTimeData = (date: string) => date?.split(' ') ?? '';

const getTableGameStatsName = (stat: string) => {
  if (stat === 'PRE_GAME') return '대기';
  if (stat === 'APP_LOADING_GAME') return '대기';
  if (stat === 'ON_GAME') return '진행 중';
  if (stat === 'END_GAME') return '완료';
  if (stat === 'PRE_GAME_EXPIRE') return '대기 이탈';
  if (stat === 'LOADING_GAME_EXPIRE') return '대기 이탈';
  if (stat === 'ON_GAME_EXPIRE') return '진행 중 이탈';
  if (stat === 'ERROR') return '에러';
  return '';
};

const getTableGameBetName = (bet: string) => {
  if (bet === 'GOODS') return '상품 내기';
  if (bet === 'CUSTOM') return '자유 내기';
  if (bet === 'BILL') return '계산하기 내기';

  return '';
};

getTableGameStatList();
getTableGameList();
</script>

<template>
  <InquiryDetailTableGameModal v-if="flag.inquiryDetailTableGame" />
  <BreadcrumbHeader :propsHeader="extraServiceTableGameLogHeader" />
  <el-descriptions
    :column="1"
    border
    class="mt-20 mb-20"
  >
    <el-descriptions-item
      label="조회 기간"
      label-align="center"
    >
      <div class="date-picker-wrapper">
        <div>
          <el-date-picker
            v-model="searchTableGameLogData.date"
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
        v-model="searchTableGameLogData.storeName"
        clearable
        @keyup.enter="getSearchData"
      />
    </el-descriptions-item>
    <el-descriptions-item
      label="게임 구분"
      label-align="center"
    >
      <el-row>
        <el-checkbox
          v-model="gameTypeAllCheckbox"
          :indeterminate="isIndeterminateGameType"
          @change="gameTypeCheckAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="searchTableGameLogData.gameList"
          class="ml-30"
          @change="checkedGameTypeChange"
        >
          <el-checkbox
            v-for="game in gameTypeList"
            :key="game.value"
            :label="game.value"
          >
            {{ game.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label="상태"
      label-align="center"
    >
      <el-row>
        <el-checkbox
          v-model="gameStateAllCheckbox"
          :indeterminate="isIndeterminateGameState"
          @change="gameStateCheckAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="searchTableGameLogData.gameRoomStatusList"
          class="ml-30"
          @change="checkedGameStateChange"
        >
          <el-checkbox
            v-for="game in gameStateList"
            :key="game.value"
            :label="game.value"
          >
            {{ game.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-row>
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
  <el-card class="table-game-detail-info-card mb-20">
    <el-descriptions
      :column="3"
      border
      class="table-game-detail-info-description"
    >
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="게임 생성 수"
        label-align="center"
        label-class-name="extra-service-label"
      >
        {{ tableGameStats.allGameCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="게임 완료 수"
        label-align="center"
        label-class-name="extra-service-label"
      >
        {{ tableGameStats.completedGameCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="게임 이탈률"
        label-align="center"
        label-class-name="extra-service-label"
      >
        {{ tableGameStats.abandonedGamePercentage }} %
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="게임 대기 수"
        label-align="center"
        label-class-name="extra-service-label"
      >
        {{ tableGameStats.generatedGameCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="게임 진행 수"
        label-align="center"
        label-class-name="extra-service-label"
      >
        {{ tableGameStats.onGoingGameCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="-"
        label-align="center"
        label-class-name="extra-service-label"
      >
        -
      </el-descriptions-item>
    </el-descriptions>
    <el-divider class="table-game-detail-info-divider" />
    <el-table
      :data="tableGameStats.gameStatList"
      border
      class="table-game-detail-info-table"
    >
      <el-table-column
        align="center"
        label="게임 종류"
        label-align="center"
        prop="gameName"
      />
      <el-table-column
        align="center"
        label="생성 수"
        label-align="center"
      >
        <template #default="{ row }"> {{ row.allGameCount }} 회</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="완료 수"
        label-align="center"
        prop="completedGameCount"
      >
        <template #default="{ row }">
          {{ row.completedGameCount }} 회
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="이탈률"
        label-align="center"
      >
        <template #default="{ row }">
          {{ row.abandonedGamePercentage }} %
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="대기 수"
        label-align="center"
      >
        <template #default="{ row }">
          {{ row.generatedGameCount }} 회
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="진행 수"
        label-align="center"
      >
        <template #default="{ row }"> {{ row.onGoingGameCount }} 회</template>
      </el-table-column>
    </el-table>
    <el-divider class="table-game-detail-info-divider" />
    <el-descriptions
      :column="3"
      border
      class="table-game-detail-info-description"
    >
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="상품 내기"
        label-align="center"
        label-class-name="extra-service-small-label"
      >
        {{ tableGameStats.goodsCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="자유 내기"
        label-align="center"
        label-class-name="extra-service-small-label"
      >
        {{ tableGameStats.customCount }} 회
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        class-name="extra-service-contents"
        label="계산하기 내기"
        label-align="center"
        label-class-name="extra-service-small-label"
      >
        {{ tableGameStats.billCount }} 회
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <p class="extra-service-search-list">검색목록</p>
  <el-divider class="extra-service-divider" />
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <p class="total-data-count-info">
      총 <span>{{ searchTableGameLogData.total }}</span>
      개의 검색결과가 있습니다.
    </p>
    <div>
      <el-button
        v-if="!excelDownloadState"
        class="excel-download-button mr-10"
        type="success"
        @click="getExcelDownLoadData"
      >
        엑셀 다운
      </el-button>
      <el-button
        v-else
        class="excel-download-button mr-10"
        loading
        type="success"
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="searchTableGameLogData.size"
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
    :data="tableGameList"
    border
    height="400"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="순번"
      width="100"
    >
      <template #default="{ $index }">
        <p>{{ searchTableGameLogData.from - $index }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="게임 진행 일시"
    >
      <template #default="{ row }">
        <p>{{ splitTimeData(row.gameStartDateTime)[0] }}</p>
        <p>{{ splitTimeData(row.gameStartDateTime)[1] }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="게임 종료 일시"
    >
      <template #default="{ row }">
        <p>{{ splitTimeData(row.endDateTime)[0] }}</p>
        <p>{{ splitTimeData(row.endDateTime)[1] }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="상태"
    >
      <template #default="{ row }">
        {{ getTableGameStatsName(row.status) }}
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
      label="실행 게임"
    >
      <template #default="{ row }">
        {{ row.gameName }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="내기 종류"
    >
      <template #default="{ row }">
        {{ getTableGameBetName(row.betType) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="내기 상세"
      prop="betDetail"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="게임방 코드"
      prop="roomKey"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="게임 생성 테이블"
      prop="gameGeneratedTable"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="승리 테이블"
    >
      <template #default="{ row }">
        {{ row.victoryTableList?.join() }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="패배 테이블"
    >
      <template #default="{ row }">
        {{ row.defeatTableList?.join() }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="비고"
    >
      <template #default="{ row }">
        <el-button
          plain
          type="info"
          @click="openModalWithData(INQUIRY_DETAIL_TABLE_GAME, row.roomId)"
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
      :current-page="searchTableGameLogData.page + 1"
      :page-size="searchTableGameLogData.size"
      :total="searchTableGameLogData.total"
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

.date-picker-wrapper {
  display: flex;
  gap: 10px;
}

.table-game-detail-info-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 15px;
  border-radius: 15px;

  .table-game-detail-info-description {
    font-size: 30px;

    :deep(.extra-service-label) {
      width: 15%;
      font-size: 18px;
      font-weight: bold;
      line-height: 37px;
      vertical-align: middle;
    }

    :deep(.extra-service-small-label) {
      width: 15%;
      font-size: 17px;
      vertical-align: middle;
    }

    :deep(.extra-service-contents) {
      width: 15%;
      font-size: 17px;
      vertical-align: middle;
    }
  }

  .table-game-detail-info-divider {
    margin: 15px 0;
  }

  .table-game-detail-info-table {
    font-size: 17px;
  }
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
</style>
