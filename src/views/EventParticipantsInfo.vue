<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { failAuthenticationAlert } from '@utils/authentication';
import useModalStore from '@store/storeModal';
import { joinResListType } from '@interface/promotion';
import { Download } from '@element-plus/icons-vue';
import { EventForceWinModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import {
  EVENT_FORCE_WIN,
  EVENT_PARTICIPANTS_INFO,
  STATISTICAL_ADMIN,
} from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import { endpoints, promotion } from '@apis';

const { flag, openModalWithData } = useModalStore();

const {
  requestEventParticipantsInfoData,
  requestEventManualPhoneNumSave,
  requestSendCoupon,
  requestResendCoupon,
} = promotion;

const { downloadExcel } = useExcelDownload();

const eventParticipantsInfoHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: EVENT_PARTICIPANTS_INFO },
]);

// 참여자 정보 데이터 조회
const changeFifthItem = (rank: number | null, status: boolean) => {
  if (rank === null && status) {
    return '5(꽝)';
  }

  return rank;
};

const convertStatus = (bool: boolean) => {
  if (bool) return '참여';
  return '미참여';
};

const convertIsForcedInput = (bool: boolean) => {
  if (bool) return 'Y';
  return 'N';
};

/** 참여자 정보 */
const participantsInfo = reactive({
  currentPage: 0,
  firstPage: false,
  joinResList: [] as joinResListType[],
  lastPage: false,
  pageSize: 0,
  totalPages: 0,
  userPhone: '',
});
/** 엑셀 다운로드 링크 */
const excelFileHref = ref('');

const searchInfo = reactive({
  storeName: '',
  storeCode: '',
  tableNum: '',
  todayDate: '',
  phone: '',
});

const getParticipantsInfo = async (page: number, query: string) => {
  try {
    if (query.length === 0) {
      const res = (await requestEventParticipantsInfoData(
        page,
        '',
      )) as AxiosResponse;
      excelFileHref.value = `${GATE_WAY_API_URL}${endpoints.promotion.join_list}?size=20000&excelDownload=true`;
      participantsInfo.currentPage = res.data.currentPage;
      participantsInfo.firstPage = res.data.firstPage;
      participantsInfo.lastPage = res.data.lastPage;
      participantsInfo.pageSize = res.data.pageSize;
      participantsInfo.totalPages = res.data.totalPages;
      participantsInfo.joinResList = res.data.joinResList.map(
        (data: joinResListType) => ({
          /** 당첨매장 */
          storeName: data.storeName,
          /** 테이블명 */
          tableNum: data.tableNum,
          /** 주문내역 */
          posData: data.posData,
          /** 주문시간 */
          orderDate: data.orderDate,
          /** 이벤트 참여 여부 */
          joinStatus: convertStatus(data.joinStatus),
          /** 당첨 등수 */
          winningNumber: changeFifthItem(data.prizeRank, data.joinStatus),
          /** 핸드폰 번호 */
          joinUserPhone: data.joinUserPhone,
          /** 수동 입력 여부 */
          forceInputStatus: convertIsForcedInput(data.forceInputStatus),
          /** 주문키 */
          orderViewKey: data.orderViewKey,
          /** 기프티콘 발송 상태 */
          giftShowSendRes: data.giftShowSendRes,
          /** winGoodsId 대체 */
          resultId: data.resultId,
        }),
      );
      return;
    }

    if (query.length !== 0) {
      const res = (await requestEventParticipantsInfoData(
        page,
        query,
      )) as AxiosResponse;
      excelFileHref.value = `https://apigw.torder.co.kr/promotion/HITE_JINRO/stats/v2/join/list?${query}&size=20000&excelDownload=true`;
      participantsInfo.currentPage = res.data.currentPage;
      participantsInfo.firstPage = res.data.firstPage;
      participantsInfo.lastPage = res.data.lastPage;
      participantsInfo.pageSize = res.data.pageSize;
      participantsInfo.totalPages = res.data.totalPages;
      participantsInfo.joinResList = res.data.joinResList.map(
        (data: joinResListType) => ({
          /** 당첨매장 */
          storeName: data.storeName,
          /** 테이블명 */
          tableNum: data.tableNum,
          /** 주문내역 */
          posData: data.posData,
          /** 주문시간 */
          orderDate: data.orderDate,
          /** 이벤트 참여 여부 */
          joinStatus: convertStatus(data.joinStatus),
          /** 당첨 등수 */
          winningNumber: changeFifthItem(data.prizeRank, data.joinStatus),
          /** 핸드폰 번호 */
          joinUserPhone: data.joinUserPhone,
          /** 수동 입력 여부 */
          forceInputStatus: convertIsForcedInput(data.forceInputStatus),
          /** 주문키 */
          orderViewKey: data.orderViewKey,
          /** 기프티콘 발송 상태 */
          giftShowSendRes: data.giftShowSendRes,
          /** winGoodsId 대체 */
          resultId: data.resultId,
        }),
      );
    }
  } catch (error) {
    console.log(error);
  }
};

/** 전체 검색 */
getParticipantsInfo(1, '');

/** 주문내역 string 변환 */
const textNewLineChange = (text: string) => {
  const splitString = text.split('\n');
  splitString.pop();
  return splitString;
};

/** key 유효성 */
const getTextNewLineChange = (text: string, index: number) => {
  if (!text) {
    return index;
  }
  return `${text}-${index}`;
};

/** 검색 종류별 검색 */
const searchType = ref('all');
const query = ref('');
const typeFilterGetParticipantsInfo = () => {
  if (searchType.value === 'all') {
    query.value = '';
  }

  if (searchType.value === 'joinStatusTrue') {
    query.value = '&joinStatus=true';
  }

  if (searchType.value === 'prizeRankList') {
    query.value = '&prizeRankList=1,2,3,4';
  }

  if (searchType.value === 'joinStatusFalse') {
    query.value = '&joinStatus=false';
  }

  if (searchType.value === 'forcePhoneInputStatus') {
    query.value = '&forceInputStatus=true';
  }

  if (searchType.value === 'phoneInputStatus') {
    query.value = '&prizeRankList=1,2,3,4&phoneInputStatus=false';
  }

  if (searchType.value === 'giftShowStatus') {
    query.value = '&giftShowStatus=false';
  }

  if (searchInfo.storeCode) {
    query.value += `&storeCode=${searchInfo.storeCode}`;
  }
  if (searchInfo.storeName) {
    query.value += `&storeName=${searchInfo.storeName}`;
  }
  if (searchInfo.tableNum) {
    query.value += `&tableNum=${searchInfo.tableNum}`;
  }
  if (searchInfo.phone) {
    query.value += `&phone=${searchInfo.phone}`;
  }
  if (searchInfo.todayDate) {
    query.value += `&orderStartDate=${searchInfo.todayDate}&orderEndDate=${searchInfo.todayDate}`;
  }
  getParticipantsInfo(1, query.value);
};

/** 페이지네이션 페이지 클릭 */
const handleCurrentChange = (page: number) => {
  if (searchType.value === 'all') {
    query.value = '';
  }

  if (searchType.value === 'joinStatusTrue') {
    query.value = '&joinStatus=true';
  }

  if (searchType.value === 'prizeRankList') {
    query.value = '&prizeRankList=1,2,3,4';
  }

  if (searchType.value === 'joinStatusFalse') {
    query.value = '&joinStatus=false';
  }

  if (searchType.value === 'forcePhoneInputStatus') {
    query.value = '&forceInputStatus=true';
  }

  if (searchType.value === 'phoneInputStatus') {
    query.value = '&prizeRankList=1,2,3,4&phoneInputStatus=false';
  }

  if (searchType.value === 'giftShowStatus') {
    query.value = '&giftShowStatus=false';
  }

  if (searchInfo.storeCode) {
    query.value += `&storeCode=${searchInfo.storeCode}`;
  }
  if (searchInfo.storeName) {
    query.value += `&storeName=${searchInfo.storeName}`;
  }
  if (searchInfo.tableNum) {
    query.value += `&tableNum=${searchInfo.tableNum}`;
  }
  if (searchInfo.phone) {
    query.value += `&phone=${searchInfo.phone}`;
  }
  if (searchInfo.todayDate) {
    query.value += `&orderStartDate=${searchInfo.todayDate}&orderEndDate=${searchInfo.todayDate}`;
  }

  getParticipantsInfo(page, query.value);
};

const putEventManualPhoneNumSave = async (
  orderKey: string,
  userPhone: string,
) => {
  try {
    const res = await requestEventManualPhoneNumSave(orderKey, userPhone);
    if (res.status === 400) {
      ElMessage({
        type: 'error',
        message: `${res.data.message}`,
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.status === 200) {
      ElMessage({
        type: 'success',
        message: `${userPhone}로 저장되었습니다.`,
      });
      searchType.value = 'all';
      await getParticipantsInfo(1, '');
    }
  } catch (error) {
    console.log(error);
  }
};

const onManualPhoneInput = (row: joinResListType) => {
  ElMessageBox.prompt('핸드폰 번호를 입력해주세요.', '수동 입력', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    inputPattern: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/,
    inputErrorMessage: '번호 형식을 확인해주세요. 01x-xxxx-xxxx',
  })
    .then(({ value }) => {
      participantsInfo.userPhone = value;
      putEventManualPhoneNumSave(row.orderViewKey, participantsInfo.userPhone);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const showOrderKey = ref(false);
const onShowOrderKey = () => {
  showOrderKey.value = !showOrderKey.value;
};

const orderKeyButtonText = () => {
  if (showOrderKey.value) {
    return 'orderViewKey 숨기기';
  }
  return 'orderViewKey 보기';
};

/** 수동입력 및 쿠폰발송 테이블컬럼 활성 조건 */
const manualPhoneInputLabel = () => {
  if (searchType.value === 'joinStatusFalse') {
    return '강제당첨처리';
  }
  return '수동입력&쿠폰발송';
};

// 수동입력 버튼 조건
const activeManualSelection = (row: joinResListType) =>
  !row.joinUserPhone &&
  row.winningNumber !== '5(꽝)' &&
  row.winningNumber !== null;

/** 쿠폰발송 버튼 활성 조건 */
const activeCouponSend = (row: joinResListType) => {
  // 휴대폰번호가 있으면서 기프티콘 발송상태가 없는 경우
  if (row.joinUserPhone && !row.giftShowSendRes) {
    // 그 중 3, 4등
    return row.winningNumber === 3 || row.winningNumber === 4;
  }
  return false;
};

/** 쿠폰재발송 버튼 활성 조건 */
const activeCouponReSend = (row: joinResListType) => {
  // 휴대폰번호가 있으면서 기프티콘 발송상태가 있는 경우(기프티콘 실패자 제외)
  if (
    row.joinUserPhone &&
    row.giftShowSendRes &&
    searchType.value !== 'giftShowStatus'
  ) {
    // 그 중 3, 4등
    if (row.winningNumber === 3 || row.winningNumber === 4) {
      return true;
    }
    return false;
  }
  return false;
};

/** 쿠폰 발송 API */
const postSendCoupon = async (
  orderViewKey: string,
  winGoodsId: number | null,
) => {
  try {
    if (winGoodsId) {
      const res = await requestSendCoupon(orderViewKey, winGoodsId);
      if (res.status === 200) {
        ElMessage({
          type: 'success',
          message: '쿠폰 발송 성공했습니다.',
        });
        searchType.value = 'all';
        await getParticipantsInfo(1, '');
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 쿠폰 재발송 API */
const postResendCoupon = async (winGoodsId: number | null) => {
  try {
    if (winGoodsId) {
      const res = await requestResendCoupon(winGoodsId);
      if (res.status === 200) {
        ElMessage({
          type: 'success',
          message: '쿠폰 재발송 성공했습니다.',
        });
        searchType.value = 'all';
        await getParticipantsInfo(1, '');
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const onSendCoupon = (row: joinResListType) => {
  ElMessageBox.confirm(
    '해당 주문 건에 대한 쿠폰 발송을 하시겠습니까?',
    '쿠폰 발송',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      postSendCoupon(row.orderViewKey, row.resultId);
    })
    .catch(() => {
      console.log('취소');
    });
};

const onResendCoupon = (row: joinResListType) => {
  ElMessageBox.confirm(
    '해당 주문 건에 대한 쿠폰 재발송을 하시겠습니까?',
    '쿠폰 재발송',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      postResendCoupon(row.resultId);
    })
    .catch(() => {
      console.log('취소');
    });
};
</script>

<template>
  <EventForceWinModal
    v-if="flag.eventForceWin"
    :getParticipantsInfo="getParticipantsInfo"
  />
  <BreadcrumbHeader :propsHeader="eventParticipantsInfoHeader" />
  <span class="event-participants-info-title">이벤트 참여자 정보</span>

  <el-row justify="end">
    <el-button
      :icon="Download"
      type="success"
      @click="downloadExcel('이벤트 참여자 정보', excelFileHref)"
    >
      엑셀 다운로드
    </el-button>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-descriptions
        :column="1"
        border
        class="mt-10 mb-10"
      >
        <el-descriptions-item>
          <template #label>
            <div>검색 종류</div>
          </template>
          <el-radio-group
            v-model="searchType"
            @change="typeFilterGetParticipantsInfo"
          >
            <el-radio label="all"> 모든 주문</el-radio>
            <el-radio label="joinStatusTrue"> 참여자</el-radio>
            <el-radio label="prizeRankList"> 당첨자</el-radio>
            <el-radio label="joinStatusFalse"> 미참여자</el-radio>
            <el-radio label="forcePhoneInputStatus">
              강제 휴대폰번호 입력자
            </el-radio>
            <el-radio label="phoneInputStatus">
              당첨자 중 휴대폰번호 미입력자
            </el-radio>
            <el-radio label="giftShowStatus"> 기프티콘 실패자</el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div>검색 입력</div>
          </template>
          <el-row align="bottom">
            <el-col
              :span="4"
              class="mr-10"
            >
              <span>매장명</span>
              <el-input
                v-model="searchInfo.storeName"
                placeholder="매장명을 입력해주세요."
              />
            </el-col>
            <el-col
              :span="4"
              class="mr-10"
            >
              <span>매장 코드</span>
              <el-input
                v-model="searchInfo.storeCode"
                placeholder="매장코드를 입력해주세요."
              />
            </el-col>
            <el-col
              :span="4"
              class="mr-10"
            >
              <span>테이블 번호</span>
              <el-input
                v-model="searchInfo.tableNum"
                placeholder="테이블번호를 입력해주세요."
              />
            </el-col>
            <el-col
              :span="4"
              class="mr-10"
            >
              <span>핸드폰 번호</span>
              <el-input
                v-model="searchInfo.phone"
                :formatter="
                  (value: string) =>
                    `${value}`
                      .replace(/[^0-9]/g, '')
                      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
                      .replace(/\-{1,2}$/g, '')
                "
                placeholder="핸드폰 번호를 입력해주세요."
              />
            </el-col>
            <el-col :span="6">
              <p>일일 선택</p>
              <el-row align="middle">
                <el-date-picker
                  v-model="searchInfo.todayDate"
                  placeholder="날짜를 선택해주세요."
                  type="date"
                  value-format="YYYY-MM-DD"
                />
                <el-button
                  class="ml-10"
                  type="primary"
                  @click="typeFilterGetParticipantsInfo"
                >
                  검색
                </el-button>
              </el-row>
            </el-col>
          </el-row>
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>

  <el-row>
    <el-button @click="onShowOrderKey">
      {{ orderKeyButtonText() }}
    </el-button>
  </el-row>

  <el-table
    :data="participantsInfo.joinResList"
    highlight-current-row
    stripe
    style="width: 100%"
  >
    <el-table-column
      align="center"
      label="당첨 매장"
      prop="storeName"
      width="205"
    />
    <el-table-column
      align="center"
      label="테이블명"
      prop="tableNum"
      width="90"
    />
    <el-table-column
      label="주문 내역"
      min-width="150"
    >
      <template #default="scope">
        <p
          v-for="(order, index) in textNewLineChange(scope.row.posData)"
          :key="getTextNewLineChange(order, index)"
        >
          {{ order }}
        </p>
      </template>
    </el-table-column>

    <el-table-column
      align="center"
      label="주문 시간"
      prop="orderDate"
      width="175"
    />
    <el-table-column
      align="center"
      label="이벤트 참여 여부"
      prop="joinStatus"
      width="100"
    />
    <el-table-column
      align="center"
      label="당첨 등수"
      prop="winningNumber"
      width="83"
    />
    <el-table-column
      align="center"
      label="핸드폰번호"
      prop="joinUserPhone"
    />
    <el-table-column
      :label="manualPhoneInputLabel()"
      align="center"
      width="120"
    >
      <template #default="scope">
        <el-button
          v-if="activeManualSelection(scope.row)"
          @click="onManualPhoneInput(scope.row)"
        >
          수동입력
        </el-button>
        <el-button
          v-if="activeCouponSend(scope.row)"
          type="primary"
          @click="onSendCoupon(scope.row)"
        >
          쿠폰 발송
        </el-button>
        <el-button
          v-else-if="activeCouponReSend(scope.row)"
          type="primary"
          @click="onResendCoupon(scope.row)"
        >
          쿠폰 재발송
        </el-button>
        <el-button
          v-if="searchType === 'joinStatusFalse'"
          type="primary"
          @click="
            openModalWithData(EVENT_FORCE_WIN, {
              orderViewKey: scope.row.orderViewKey,
            })
          "
        >
          강제 당첨
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="수동 입력 여부"
      prop="forceInputStatus"
      width="90"
    />
    <el-table-column
      align="center"
      label="기프티콘 발송 상태"
      prop="giftShowSendRes"
      width="185"
    />
    <el-table-column
      v-if="showOrderKey"
      align="center"
      label="orderViewKey"
      prop="orderViewKey"
    />
  </el-table>
  <el-row
    class="mt-20"
    justify="center"
  >
    <el-pagination
      :current-page="participantsInfo.currentPage"
      :page-count="participantsInfo.totalPages"
      :page-size="participantsInfo.pageSize"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.event-participants-info-title {
  height: 40px;
  font-size: 30px;
  font-weight: 500;
  line-height: 40px;
}

:deep(.el-button + .el-button) {
  margin-top: 5px;
  margin-left: 0;
}
</style>
