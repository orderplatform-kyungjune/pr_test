<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { responseExtraServiceAuctionScheduleListType } from '@interface/extraService';
import { AuctionScheduleModal, ScheduleChangeHistoryModal } from '@containers';
import { AUCTION_SCHEDULE, SCHEDULE_CHANGE_HISTORY } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestExtraServiceAuctionScheduleList,
  requestDeleteAuctionSchedule,
  requestDetailAuctionScheduleData,
  requestUpdateAuctionUse,
} = extraService;
const { responseExtraServiceAuctionScheduleListCodec } = extraServiceCodec;
const { flag, openModal, openModalWithData, closeModal } = useModalStore();

const paginationInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
});

const auctionScheduleData = reactive({
  dayCondition: '',
  days: [] as number[],
  status: ['RUN', 'STOP'],
});

const auctionScheduleHistoryModal = ref(false);
const openAuctionScheduleHistoryModal = () => {
  auctionScheduleHistoryModal.value = true;
  openModal(SCHEDULE_CHANGE_HISTORY);
};
const closeAuctionScheduleHistoryModal = () => {
  auctionScheduleHistoryModal.value = false;
  closeModal(SCHEDULE_CHANGE_HISTORY);
};
/** 등록 / 수정 타입 */
const createEditType: Ref<'create' | 'edit'> = ref('create');
const openEnrollAuctionModal = () => {
  createEditType.value = 'create';
  openModal(AUCTION_SCHEDULE);
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

/** 경매 스케줄 리스트 */
const scheduleList: Ref<responseExtraServiceAuctionScheduleListType[]> = ref(
  [],
);
const getAuctionScheduleData = async () => {
  const requestData = {
    storeCode,
    page: paginationInfo.page,
    size: paginationInfo.size,
    dayCondition: auctionScheduleData.dayCondition,
    days: auctionScheduleData.days.join(),
    status: auctionScheduleData.status.join(),
  };
  try {
    const res = (await requestExtraServiceAuctionScheduleList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceAuctionScheduleListCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        scheduleList.value = res.data.data.auctionScheduleList;
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

/** 경매 스케줄 사용 변경 */
const putUpdateAuctionUse = async (id: number) => {
  try {
    const res = (await requestUpdateAuctionUse(storeCode, id)) as AxiosResponse;

    if (res.data.resultCode === 200) {
      await getAuctionScheduleData();
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
    ElMessageBox.alert('오류가 발생했습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    console.log(error);
  }
};

/** 경매 스캐줄 삭제 */
const deleteAuctionScheduleData = (id: number) => {
  ElMessageBox.confirm('해당 항목을 삭제하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestDeleteAuctionSchedule(
          storeCode,
          id,
        )) as AxiosResponse;

        if (res.data.resultCode === 204) {
          await getAuctionScheduleData();
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
const updateAuctionScheduleModal = async (id: number) => {
  createEditType.value = 'edit';
  const res = await requestDetailAuctionScheduleData(storeCode, id);
  if (res) {
    openModalWithData(AUCTION_SCHEDULE, res.data.data);
  }
};

// 요일 체크박스 전체 선택
const implementDayAllCheckbox = ref(false);
const isIndeterminateDayImplement = ref(false);
const dayCheckAllChange = (val: boolean) => {
  const allCheckArray: number[] = [];
  weekDayList.forEach((day) => allCheckArray.push(day.value));
  auctionScheduleData.days = val ? allCheckArray : [];
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
  auctionScheduleData.status = val ? allCheckArray : [];
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
  getAuctionScheduleData();
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 0;
  await getAuctionScheduleData();
};

// 검색 초기화
const resetSearchData = () => {
  auctionScheduleData.dayCondition = '';
  auctionScheduleData.days = [];
  auctionScheduleData.status = ['RUN', 'STOP'];
  implementDayAllCheckbox.value = false;
  isIndeterminateDayImplement.value = false;
  implementAllCheckbox.value = true;
  isIndeterminateImplement.value = false;
  getAuctionScheduleData();
};

// 반복주기 요일 가져오기
const setWeekDayString = (days: boolean[]) => {
  if (!days) return '';
  const weeks = ['월', '화', '수', '목', '금', '토', '일'];
  const targetDays = days.map((day, index) => {
    if (day) return weeks[index];
    return null;
  });
  const result = targetDays.filter((day) => day !== null).join(', ');

  return result;
};

// 정상가, 시작가 콤마 추가
const getNumberLocale = (price: number) => Math.floor(price).toLocaleString();

// 날짜 시간 분리
const splitTimeData = (date: string) => {
  if (date) {
    return date.split(' ');
  }
  return '';
};

getAuctionScheduleData();
</script>

<template>
  <AuctionScheduleModal
    v-if="flag.auctionSchedule"
    :createEditType="createEditType"
    :getAuctionScheduleData="() => getAuctionScheduleData()"
  />
  <ScheduleChangeHistoryModal
    v-if="auctionScheduleHistoryModal"
    :closeAuctionScheduleHistoryModal="closeAuctionScheduleHistoryModal"
    type="auction"
  />
  <div class="detail-service-title mb-20">
    <span> 경매 스케줄 관리 </span>
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
          v-model="auctionScheduleData.dayCondition"
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
          v-model="auctionScheduleData.days"
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
          v-model="auctionScheduleData.status"
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
        @click="openAuctionScheduleHistoryModal"
      >
        변경 이력
      </el-button>
      <el-button
        type="primary"
        @click="openEnrollAuctionModal"
      >
        경매 등록
      </el-button>
    </div>
  </el-row>
  <el-table
    v-if="scheduleList.length !== 0"
    :data="scheduleList"
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
      label="상품"
      prop="goodsName"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="정상가"
    >
      <template #default="{ row }">
        {{ getNumberLocale(row.goodsPrice) }} 원
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="시작가"
    >
      <template #default="{ row }">
        {{ getNumberLocale(row.startPrice) }} 원
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
        {{ row.startTime }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="실행 시간"
    >
      <template #default="{ row }"> {{ row.runningTime }}초</template>
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
        <div>
          <p>{{ splitTimeData(row.startDateTime)[0] }}</p>
          <p>{{ splitTimeData(row.startDateTime)[1] }}</p>
        </div>
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
          @change="putUpdateAuctionUse(row.scheduleId)"
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
              @click="updateAuctionScheduleModal(row.scheduleId)"
            >
              수정
            </el-button>
          </div>
          <div>
            <el-button
              plain
              type="danger"
              @click="deleteAuctionScheduleData(row.scheduleId)"
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
    v-if="scheduleList.length !== 0"
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
