<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, Ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { jackpotScheduleListType } from '@interface/extraService';
import { JackpotScheduleModal, ScheduleChangeHistoryModal } from '@containers';
import { JACKPOT_SCHEDULE, SCHEDULE_CHANGE_HISTORY } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { flag, openModal, openModalWithData, closeModal } = useModalStore();
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestExtraServiceJackpotScheduleList,
  requestDeleteJackpotSchedule,
  requestDetailJackpotScheduleData,
  requestUpdateJackpotUse,
} = extraService;
const { responseJackpotScheduleCodec } = extraServiceCodec;

const paginationInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
});

const jackpotScheduleData = reactive({
  dayCondition: '',
  days: [] as number[],
  status: ['RUN', 'STOP'],
});

/** 변경 이력 모달창 열기 */
const jackpotScheduleHistoryModal = ref(false);
const openJackpotScheduleHistoryModal = () => {
  jackpotScheduleHistoryModal.value = true;
  openModal(SCHEDULE_CHANGE_HISTORY);
};
const closeJackpotScheduleHistoryModal = () => {
  jackpotScheduleHistoryModal.value = false;
  closeModal(SCHEDULE_CHANGE_HISTORY);
};
/** 등록 / 수정 타입 */
const createEditType: Ref<'create' | 'edit'> = ref('create');
const openEnrollJackpotModal = () => {
  createEditType.value = 'create';
  openModal(JACKPOT_SCHEDULE);
};

const weekDayList = [
  {
    value: 1,
    label: '월',
  },
  {
    value: 2,
    label: '화',
  },
  {
    value: 3,
    label: '수',
  },
  {
    value: 4,
    label: '목',
  },
  {
    value: 5,
    label: '금',
  },
  {
    value: 6,
    label: '토',
  },
  {
    value: 7,
    label: '일',
  },
];

const implementList = [
  {
    value: 'RUN',
    label: '실행',
  },
  {
    value: 'STOP',
    label: '정지',
  },
];

/** 잭팟 스케줄 리스트 */
const jackpotScheduleList: Ref<jackpotScheduleListType[]> = ref([]);
const getJackpotScheduleData = async () => {
  const requestData = {
    storeCode,
    page: paginationInfo.page,
    size: paginationInfo.size,
    dayCondition: jackpotScheduleData.dayCondition,
    days: jackpotScheduleData.days.join(),
    status: jackpotScheduleData.status.join(),
  };

  try {
    const res = (await requestExtraServiceJackpotScheduleList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(responseJackpotScheduleCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        jackpotScheduleList.value = res.data.data.jackpotScheduleList;
        paginationInfo.page = res.data.data.pageNo;
        paginationInfo.size = res.data.data.pageSize;
        paginationInfo.to = res.data.data.to;
        paginationInfo.from = res.data.data.from;
        paginationInfo.total = res.data.data.totalElementCount;
      }
    } else {
      await ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 잭팟 스케줄 사용 변경 */
const putUpdateJackpotUse = async (id: number) => {
  try {
    const res = (await requestUpdateJackpotUse(storeCode, id)) as AxiosResponse;

    if (res.data.resultCode === 200) {
      await getJackpotScheduleData();
      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
    } else {
      await ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 잭팟 스캐줄 삭제 */
const deleteJackpotScheduleData = (id: number) => {
  ElMessageBox.confirm('해당 항목을 삭제하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestDeleteJackpotSchedule(
          storeCode,
          id,
        )) as AxiosResponse;

        if (res.data.resultCode === 204) {
          await getJackpotScheduleData();
          ElMessage({
            type: 'success',
            message: '정상적으로 삭제되었습니다.',
          });
        } else {
          await ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 스캐줄 수정 */
const updateJackpotScheduleModal = async (id: number) => {
  createEditType.value = 'edit';
  const res = await requestDetailJackpotScheduleData(storeCode, id);
  if (res) {
    openModalWithData(JACKPOT_SCHEDULE, res.data.data);
  }
};

// 요일 체크박스 전체 선택
const implementDayAllCheckbox = ref(false);
const isIndeterminateDayImplement = ref(false);
const dayCheckAllChange = (val: boolean) => {
  const allCheckArray: number[] = [];
  weekDayList.forEach((day) => allCheckArray.push(day.value));
  jackpotScheduleData.days = val ? allCheckArray : [];
  isIndeterminateDayImplement.value = false;
};
const checkedDayImplementChange = (value: string[]) => {
  const checkedCount = value.length;
  implementDayAllCheckbox.value = checkedCount === weekDayList.length;
  isIndeterminateDayImplement.value =
    checkedCount > 0 && checkedCount < weekDayList.length;
};

// 검색 체크박스 전체 선택
const implementAllCheckbox = ref(true);
const isIndeterminateImplement = ref(false);
const gameTypeCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  implementList.forEach((game) => allCheckArray.push(game.value));
  jackpotScheduleData.status = val ? allCheckArray : [];
  isIndeterminateImplement.value = false;
};
const checkedImplementChange = (value: string[]) => {
  const checkedCount = value.length;
  implementAllCheckbox.value = checkedCount === implementList.length;
  isIndeterminateImplement.value =
    checkedCount > 0 && checkedCount < implementList.length;
};

// 페이지네이션
const handleSchedulePage = (val: number) => {
  paginationInfo.page = val - 1;
  getJackpotScheduleData();
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 0;
  await getJackpotScheduleData();
};

// 검색 초기화
const resetSearchData = () => {
  jackpotScheduleData.dayCondition = '';
  jackpotScheduleData.days = [];
  jackpotScheduleData.status = ['RUN', 'STOP'];
  implementDayAllCheckbox.value = false;
  isIndeterminateDayImplement.value = false;
  implementAllCheckbox.value = true;
  isIndeterminateImplement.value = false;
  getJackpotScheduleData();
};

// 반복주기 요일 가져오기
const setWeekDayString = (days: boolean[]) => {
  if (!days) return '';
  const weeks = ['일', '월', '화', '수', '목', '금', '토'];
  const targetDays = days.map((day, index) => {
    if (day) return weeks[index];
    return null;
  });
  const result = targetDays.filter((day) => day !== null).join(', ');

  return result;
};

// 정상가, 시작가 콤마 추가
const setNumberLocale = (price: number) => Math.floor(price).toLocaleString();

// 날짜 시간 분리
const splitTimeData = (date: string) => {
  if (date) {
    return date.split('T');
  }
  return '';
};

/** DP 화면 열기 */
const openDpPage = () => {
  window.open(
    `https://roulette-display.torder.co.kr?storeCode=${encodeURIComponent(storeCode)}`,
    '_blank',
  );
};

const getJackpotTypeName = (code: string) => {
  if (code === 'JACKPOT') return '원형';
  if (code === 'JACKPOT_WAVE') return '파도타기';
  return '';
};

getJackpotScheduleData();
</script>

<template>
  <JackpotScheduleModal
    v-if="flag.jackpotSchedule"
    :createEditType="createEditType"
    :getJackpotScheduleData="() => getJackpotScheduleData()"
  />
  <ScheduleChangeHistoryModal
    v-if="jackpotScheduleHistoryModal"
    :closeJackpotScheduleHistoryModal="closeJackpotScheduleHistoryModal"
    type="jackpot"
  />
  <div class="detail-service-title mb-20">
    <span> 잭팟 스케줄 관리 </span>
  </div>
  <el-descriptions
    :column="1"
    border
    class="mb-20"
  >
    <el-descriptions-item
      label="실행 요일"
      label-align="center"
    >
      <el-row>
        <el-select
          v-model="jackpotScheduleData.dayCondition"
          class="mr-20"
          clearable
          placeholder="조건 선택"
        >
          <el-option
            label="선택 요일 모두 포함 (and)"
            value="AND"
          />
          <el-option
            label="선택 포함 (or)"
            value="OR"
          />
        </el-select>
        <el-checkbox
          v-model="implementDayAllCheckbox"
          :indeterminate="isIndeterminateDayImplement"
          @change="dayCheckAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="jackpotScheduleData.days"
          class="ml-30"
          @change="checkedDayImplementChange"
        >
          <el-checkbox
            v-for="day in weekDayList"
            :key="day.value"
            :label="day.value"
          >
            {{ day.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label="실행 여부"
      label-align="center"
    >
      <el-row>
        <el-checkbox
          v-model="implementAllCheckbox"
          :indeterminate="isIndeterminateImplement"
          @change="gameTypeCheckAllChange"
        >
          전체
        </el-checkbox>
        <el-checkbox-group
          v-model="jackpotScheduleData.status"
          class="ml-30"
          @change="checkedImplementChange"
        >
          <el-checkbox
            v-for="implement in implementList"
            :key="implement.value"
            :label="implement.value"
          >
            {{ implement.label }}
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
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <div class="detail-service-title">
      <span> 스케줄 목록 </span>
    </div>
    <div>
      <el-button
        plain
        type="info"
        @click="openDpPage"
      >
        DP 화면
      </el-button>
      <el-button
        plain
        type="info"
        @click="openJackpotScheduleHistoryModal"
      >
        변경 이력
      </el-button>
      <el-button
        type="primary"
        @click="openEnrollJackpotModal"
      >
        잭팟 등록
      </el-button>
    </div>
  </el-row>
  <el-table
    v-if="jackpotScheduleList.length !== 0"
    :data="jackpotScheduleList"
    :height="530"
    border
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
      label="게시물 번호"
      prop="scheduleId"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="구분"
    >
      <template #default="{ row }">
        {{ getJackpotTypeName(row.eventType) }}
      </template>
    </el-table-column>
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
    >
      <template #default="{ row }">
        {{ setNumberLocale(row.goodsPrice) }} 원
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="반복주기"
    >
      <template #default="{ row }">
        {{ setWeekDayString(row.repeatDayList) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="시작 시간"
    >
      <template #default="{ row }">
        {{ splitTimeData(row.startDateTime)[1] }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="사전안내"
    >
      <template #default="{ row }"> {{ row.waitTime }}초</template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="다음 실행 시간"
    >
      <template #default="{ row }">
        <p>{{ splitTimeData(row.startDateTime)[0] }}</p>
        <p>{{ splitTimeData(row.startDateTime)[1] }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="실행 횟수"
      prop="repeatCount"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="실행 여부"
    >
      <template #default="{ row }">
        <el-switch
          v-model="row.status"
          @change="putUpdateJackpotUse(row.scheduleId)"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="비고"
      width="150"
    >
      <template #default="{ row }">
        <el-row
          align="middle"
          justify="space-evenly"
        >
          <div>
            <el-button
              plain
              type="success"
              @click="updateJackpotScheduleModal(row.scheduleId)"
            >
              수정
            </el-button>
          </div>
          <div>
            <el-button
              plain
              type="danger"
              @click="deleteJackpotScheduleData(row.scheduleId)"
            >
              삭제
            </el-button>
          </div>
        </el-row>
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
    v-if="jackpotScheduleList.length !== 0"
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
      @current-change="handleSchedulePage"
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
  width: 110px;
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
