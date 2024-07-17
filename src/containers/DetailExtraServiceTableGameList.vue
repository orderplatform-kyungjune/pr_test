<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestTableGameStatusType,
  responseExtraServiceTableGameListType,
} from '@interface/extraService';
import { InquiryDetailTableGameModal } from '@containers';
import { INQUIRY_DETAIL_TABLE_GAME } from '@common/string';
import { extraServiceCodec } from '@codecs';
import gatewayTokenApi from '@apis/axios/gatewayTokenApi';
import { endpoints, extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestExtraServiceTableGameList,
  requestExtraServiceTableGameStatList,
} = extraService;
const {
  responseExtraServiceTableGameCodec,
  responseExtraServiceTableGameRoomStatCodec,
} = extraServiceCodec;
const { openModalWithData, flag } = useModalStore();

const { refinedToday, refinedYesterday, refinedWeek, refinedMonth } =
  dateFormatterUtil;

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

/** 테이블 게임 페이지네이션 */
const paginationInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  from: 0,
  to: 0,
});

/** 게임 검색 리스트 */
const gameTypeListData: Ref<string[]> = ref([
  'CROCODILE_GAME',
  'RSP_GAME',
  'ARCHERY_GAME',
]);

/** 게임 상태 리스트 */
const gameStateListData: Ref<string[]> = ref([
  'PRE_GAME,APP_LOADING_GAME',
  'PRE_GAME_EXPIRE,LOADING_GAME_EXPIRE',
  'ON_GAME',
  'ON_GAME_EXPIRE',
  'END_GAME',
  'ERROR',
]);

// 기간 선택
const selectedDate: Ref<string[]> = ref([refinedToday(), refinedToday()]);

const excelDownloadState = ref(false);

/** 테이블 게임 내역 불러오기 */
const tableGameList: Ref<responseExtraServiceTableGameListType[]> = ref([]);
const getTableGameList = async () => {
  const requestData = {
    storeCode,
    page: paginationInfo.page,
    size: paginationInfo.size,
    from: selectedDate.value[0],
    to: selectedDate.value[1],
    gameList: gameTypeListData.value.join(),
    gameRoomStatusList: gameStateListData.value.join(),
  };

  try {
    const res = (await requestExtraServiceTableGameList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceTableGameCodec,
      res.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        paginationInfo.page = res.data.data.pageNo;
        paginationInfo.size = res.data.data.pageSize;
        paginationInfo.total = res.data.data.totalElementCount;
        paginationInfo.from = res.data.data.from;
        paginationInfo.to = res.data.data.to;

        tableGameList.value = res.data.data.storeGameHistoryList;
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

/** 테이블 게임 내역 통계 불러오기 */
const tableGameStats: Ref<requestTableGameStatusType> = ref(
  {} as requestTableGameStatusType,
);
const getTableGameStatList = async () => {
  const requestData = {
    storeCode,
    page: paginationInfo.page,
    size: paginationInfo.size,
    from: selectedDate.value[0],
    to: selectedDate.value[1],
    gameList: gameTypeListData.value.join(),
    gameRoomStatusList: gameStateListData.value.join(),
  };

  try {
    const res = (await requestExtraServiceTableGameStatList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceTableGameRoomStatCodec,
      res.data.data,
    );

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

/** 매장리스트 엑셀 다운로드 */
const downloadExcel = () => {
  let searchUrl = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/histories/to-excel?from=${selectedDate.value[0]}&to=${selectedDate.value[1]}`;

  try {
    excelDownloadState.value = true;

    if (gameTypeListData.value.length !== 0) {
      searchUrl = searchUrl.concat(
        `&gameList=${gameTypeListData.value.join()}`,
      );
    }

    if (gameStateListData.value.length !== 0) {
      searchUrl = searchUrl.concat(
        `&gameRoomStatusList=${gameStateListData.value.join()}`,
      );
    }

    gatewayTokenApi({
      url: searchUrl,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      link.download = `테이블 게임 내역_${refinedToday()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      excelDownloadState.value = false;
    });
  } catch (error) {
    console.log(error);
    excelDownloadState.value = false;
  }
};

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
  const [
    startDay,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    endDay,
  ] = selectedDate.value;
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

// 게임 구분 검색 체크박스 전체 선택
const gameTypeAllCheckbox = ref(true);
const isIndeterminateGameType = ref(false);
const gameTypeCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  gameTypeList.forEach((game) => allCheckArray.push(game.value));
  gameTypeListData.value = val ? allCheckArray : [];
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
  gameStateListData.value = val ? allCheckArray : [];
  isIndeterminateGameState.value = false;
};
const checkedGameStateChange = (value: string[]) => {
  const checkedCount = value.length;
  gameStateAllCheckbox.value = checkedCount === gameStateList.length;
  isIndeterminateGameState.value =
    checkedCount > 0 && checkedCount < gameStateList.length;
};

/** 검색하기 */
const getSearchData = async () => {
  if (gameTypeListData.value.length === 0) {
    ElMessage({
      type: 'error',
      message: '게임 구분을 선택해주세요.',
    });
    return;
  }

  if (gameStateListData.value.length === 0) {
    ElMessage({
      type: 'error',
      message: '상태를 선택해주세요.',
    });
    return;
  }

  paginationInfo.page = 0;
  await getTableGameStatList();
  await getTableGameList();
};

// 검색 초기화
const resetSearchData = async () => {
  paginationInfo.page = 0;
  paginationInfo.size = 10;
  gameTypeListData.value = ['CROCODILE_GAME', 'RSP_GAME', 'ARCHERY_GAME'];
  gameStateListData.value = [
    'PRE_GAME,APP_LOADING_GAME',
    'PRE_GAME_EXPIRE,LOADING_GAME_EXPIRE',
    'ON_GAME',
    'ON_GAME_EXPIRE',
    'END_GAME',
    'ERROR',
  ];
  selectedDate.value[0] = refinedToday();
  selectedDate.value[1] = refinedToday();

  gameTypeAllCheckbox.value = true;
  isIndeterminateGameType.value = false;
  gameStateAllCheckbox.value = true;
  isIndeterminateGameState.value = false;
  await getTableGameStatList();
  await getTableGameList();
};

// 페이지네이션
const handleTableGamePage = async (val: number) => {
  paginationInfo.page = val - 1;
  await getTableGameList();
};
const changePageSize = async (value: number) => {
  paginationInfo.size = value;
  await getTableGameList();
};

const splitTimeData = (date: string) => {
  if (date) {
    return date.split(' ');
  }
  return '';
};

const getTableGameStatsName = (stat: string) => {
  if (stat === 'ON_GAME') return '진행 중';
  if (stat === 'ON_GAME_EXPIRE') return '진행 중 이탈';
  if (stat === 'END_GAME') return '완료';
  if (stat === 'PRE_GAME' || stat === 'APP_LOADING_GAME') return '대기';
  if (stat === 'PRE_GAME_EXPIRE' || stat === 'LOADING_GAME_EXPIRE') {
    return '대기 이탈';
  }
  if (stat === 'ERROR') return '에러 발생';
  return '';
};

const getTableGameBetName = (bet: string) => {
  if (bet === 'CUSTOM') return '자유 내기';
  if (bet === 'GOODS') return '상품 내기';
  if (bet === 'BILL') return '계산하기 내기';

  return '';
};

const getStatusTagColor = (stat: string) => {
  if (stat === 'ON_GAME') return '#C8F07E';
  if (stat === 'END_GAME') return '#000000';
  if (stat === 'PRE_GAME' || stat === 'APP_LOADING_GAME') return '#FDFF9D';
  if (
    stat === 'PRE_GAME_EXPIRE' ||
    stat === 'LOADING_GAME_EXPIRE' ||
    stat === 'ON_GAME_EXPIRE'
  ) {
    return '#AAAAAA';
  }
  if (stat === 'ERROR') return '#FACD91';
  return '';
};

const getStatusFontColor = (stat: string) => {
  if (stat === 'END_GAME') return 'stat-white-font-color';
  return 'stat-black-font-color';
};

getTableGameList();
getTableGameStatList();
</script>

<template>
  <InquiryDetailTableGameModal v-if="flag.inquiryDetailTableGame" />
  <div class="detail-service-title mb-20">
    <span> 테이블 게임 내역 </span>
  </div>
  <el-descriptions
    :column="1"
    border
    class="mb-20"
  >
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
    <el-descriptions-item
      label="게임 구분"
      label-align="center"
      label-class-name="extra-service-label"
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
          v-model="gameTypeListData"
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
          v-model="gameStateListData"
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
      class="detail-service-button"
      type="warning"
      @click="resetSearchData"
    >
      초기화
    </el-button>
    <el-button
      class="detail-service-button"
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
    <p class="extra-service-count-info">
      총
      <span>{{ paginationInfo.total }}</span>
      개의 검색결과가 있습니다.
    </p>
    <div>
      <el-button
        v-if="!excelDownloadState"
        class="detail-service-button mr-10"
        type="success"
        @click="downloadExcel"
      >
        엑셀 다운
      </el-button>
      <el-button
        v-else
        class="detail-service-button mr-10"
        loading
        type="success"
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="paginationInfo.size"
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
    v-if="tableGameList.length !== 0"
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
        <p>{{ paginationInfo.from - $index }}</p>
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
        <el-tag
          :class="getStatusFontColor(row.status)"
          :color="getStatusTagColor(row.status)"
          effect="dark"
        >
          {{ getTableGameStatsName(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
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
  <el-card
    v-else
    class="empty-table-data"
    shadow="never"
  >
    검색 조건에 일치하는 항목이 없습니다.
  </el-card>
  <el-row
    v-if="tableGameList.length !== 0"
    align="middle"
    class="mt-10"
    justify="center"
  >
    <el-pagination
      :current-page="paginationInfo.page + 1"
      :page-size="paginationInfo.size"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleTableGamePage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.detail-service-button {
  width: 100px;
}

.detail-service-table-game-time-picker {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 60%;
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

.extra-service-search-list {
  font-size: 20px;
}

.extra-service-divider {
  margin: 10px 0px;
}

.extra-service-count-info {
  font-size: 15px;

  span {
    font-size: 17px;
    color: red;
  }
}

.empty-table-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  font-size: 28px;
  font-weight: 500;
}

.el-table {
  &:deep(.error-row) {
    --el-table-tr-bg-color: #facd91;
  }

  &:deep(.waiting-row) {
    --el-table-tr-bg-color: #fdff9d;
  }

  &:deep(.waiting-expire-row) {
    --el-table-tr-bg-color: #aaaaaa;
  }

  &:deep(.on-game-row) {
    --el-table-tr-bg-color: #c8f07e;
  }

  &:deep(.on-game-expire-row) {
    --el-tag-border-color: #aaaaaa;
  }

  &:deep(.end-game-row) {
    --el-table-tr-bg-color: #000000;
  }
}

:deep(.el-tag--dark) {
  --el-tag-border-color: #ffffff;
}

.stat-white-font-color {
  color: #ffffff;
}

.stat-black-font-color {
  color: #000000;
}
</style>
