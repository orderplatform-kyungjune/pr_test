<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { BreadcrumbHeader } from '@components';
import { SEND_FCM_LOG } from '@common/string';
import { creditCodec } from '@codecs';
import { credit } from '@apis';

const { requestFCMSendLog } = credit;
const { runtimeCheck } = runtimeCheckHelper;
const { sendFCMLogCodec } = creditCodec;

const sendFCMLogHeaderProp = reactive([{ name: SEND_FCM_LOG }]);

const searchData = reactive({
  storeCode: '',
  tabletCode: '',
  ssaid: '',
  sendErrorCode: '',
  sendSuccess: '',
  receiveSuccess: '',
  sendDate: '', // YYYY-MM-DD
  orderKey: '',
});

const pagination = reactive({
  currentPageNo: 0, // 현재 페이지
  totalPageCount: 0, // 총 페이지 갯수
  totalElementCount: 0, // 총 데이터 갯수
  elementSizePerPage: 100, // 회당 요청 조회갯수
});

const fcmLogList = ref([]);
const getFCMSendLog = async () => {
  try {
    const payload = {
      size: 20,
      page:
        pagination.currentPageNo === 0
          ? pagination.currentPageNo
          : pagination.currentPageNo - 1,
      storeCode: searchData.storeCode,
      tabletCode: searchData.tabletCode,
      ssaid: searchData.ssaid,
      sendErrorCode: searchData.sendErrorCode,
      sendSuccess: searchData.sendSuccess,
      receiveSuccess: searchData.receiveSuccess,
      sendDate: searchData.sendDate ?? '',
      orderKey: searchData.orderKey,
    };

    const res = (await requestFCMSendLog(payload)) as AxiosResponse;
    const typeError = runtimeCheck(sendFCMLogCodec, res.data);

    if (!typeError) {
      if (res.data.resultCode === 200) {
        fcmLogList.value = res.data.resultData.content;
        pagination.currentPageNo = res.data.resultData.currentPageNo + 1;
        pagination.totalPageCount = res.data.resultData.totalPageCount;
        pagination.totalElementCount = res.data.resultData.totalElementCount;
        pagination.elementSizePerPage = res.data.resultData.elementSizePerPage;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
getFCMSendLog();

const handleCurrentPage = async (val: number) => {
  pagination.currentPageNo = val;
  getFCMSendLog();
};

const formatSuccessOrFailText = (boolean: boolean) => {
  if (boolean) {
    return '성공';
  }
  return '실패';
};

const formatForceText = (boolean: boolean) => {
  if (boolean) {
    return '강제수신';
  }
  return '-';
};

const getSuccessOrFailStyle = (boolean: boolean) => ({
  'success-text': boolean,
  'fail-text': !boolean,
});

const resetSearchData = () => {
  pagination.currentPageNo = 0;
  searchData.storeCode = '';
  searchData.tabletCode = '';
  searchData.ssaid = '';
  searchData.sendErrorCode = '';
  searchData.sendSuccess = '';
  searchData.receiveSuccess = '';
  searchData.sendDate = '';
  searchData.orderKey = '';
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="sendFCMLogHeaderProp" />
  <el-card shadow="never">
    <el-row>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">매장코드</p>
        <el-input
          v-model="searchData.storeCode"
          placeholder="매장 코드를 입력해주세요."
          @keyup.enter="getFCMSendLog"
        />
      </el-col>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">태블릿 ID</p>
        <el-input
          v-model="searchData.tabletCode"
          placeholder="태블릿 ID를 입력해주세요."
          @keyup.enter="getFCMSendLog"
        />
      </el-col>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">SSAID</p>
        <el-input
          v-model="searchData.ssaid"
          placeholder="SSAID를 입력해주세요."
          @keyup.enter="getFCMSendLog"
        />
      </el-col>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">주문키</p>
        <el-input
          v-model="searchData.orderKey"
          placeholder="주문키를 입력해주세요."
          @keyup.enter="getFCMSendLog"
        />
      </el-col>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">서버 발송 에러코드</p>
        <el-input
          v-model="searchData.sendErrorCode"
          placeholder="sendErrorCode를 입력해주세요."
          @keyup.enter="getFCMSendLog"
        />
      </el-col>
    </el-row>

    <el-row
      class="mt-10"
      align="bottom"
    >
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">서버 발송 성공여부</p>
        <el-radio-group v-model="searchData.sendSuccess">
          <el-radio label="true"> 성공 </el-radio>
          <el-radio label="false"> 실패 </el-radio>
        </el-radio-group>
      </el-col>
      <el-col
        :span="4"
        class="mr-10"
      >
        <p class="font-small mb-5">안드로이드 수신 성공여부</p>
        <el-radio-group v-model="searchData.receiveSuccess">
          <el-radio label="true"> 성공 </el-radio>
          <el-radio label="false"> 실패 </el-radio>
        </el-radio-group>
      </el-col>

      <div class="mr-10">
        <p class="font-small mb-5">발송일자</p>
        <el-date-picker
          v-model="searchData.sendDate"
          type="date"
          placeholder="날짜를 선택해주세요."
          value-format="YYYY-MM-DD"
        />
      </div>
      <el-col :span="6">
        <el-button
          type="primary"
          @click="getFCMSendLog"
        >
          검색
        </el-button>
        <el-button @click="resetSearchData"> 초기화 </el-button>
      </el-col>
    </el-row>
  </el-card>

  <el-table
    border
    flexible
    class="mt-20"
    :data="fcmLogList"
    height="570px"
  >
    <el-table-column
      label="ID"
      prop="id"
      header-align="center"
      align="center"
      width="60"
      fixed
    />
    <el-table-column
      label="발송자"
      prop="sender"
      header-align="center"
      align="center"
      width="90"
      fixed
    />
    <el-table-column
      label="발송일자"
      prop="sendDateTime"
      header-align="center"
      align="center"
      width="100"
      fixed
    />
    <el-table-column
      label="매장코드"
      prop="storeCode"
      header-align="center"
      align="center"
      width="130"
      placeholder="매장 코드를 입력해주세요."
      fixed
    />
    <el-table-column
      label="태블릿ID"
      prop="tabletCode"
      header-align="center"
      align="center"
      width="152"
      fixed
    />
    <el-table-column
      label="주문키"
      prop="sendMessage.messageData.orderKey"
      header-align="center"
      align="center"
      width="100"
    />
    <el-table-column
      label="FCM 성공메세지 ID"
      header-align="center"
      align="center"
      width="135"
      prop="messageId"
    />
    <el-table-column
      label="발송 응답코드"
      header-align="center"
      align="center"
      width="115"
      prop="sendMessage.messageCode"
    />
    <el-table-column
      label="발송 메세지"
      header-align="center"
      align="center"
      width="118"
      prop="sendMessage.message"
    />
    <el-table-column
      label="서버/FCM 발송"
      header-align="center"
      align="center"
    >
      <el-table-column
        label="성공여부"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          <span :class="getSuccessOrFailStyle(row.isSendSuccess)">
            {{ formatSuccessOrFailText(row.isSendSuccess) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="에러코드"
        header-align="center"
        align="center"
        prop="sendErrorCode"
        width="105"
      />
      <el-table-column
        label="에러메세지"
        header-align="center"
        align="center"
        width="160"
        prop="sendErrorMessage"
      />
    </el-table-column>
    <el-table-column
      label="안드로이드/FCM 수신"
      header-align="center"
      align="center"
    >
      <el-table-column
        label="성공여부"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          <span :class="getSuccessOrFailStyle(row.isReceiveSuccess)">
            {{ formatSuccessOrFailText(row.isReceiveSuccess) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="유효일시"
        prop="receiveDueDateTime"
        header-align="center"
        align="center"
        width="100"
      />
      <el-table-column
        label="상태"
        prop="receiveStatus"
        header-align="center"
        align="center"
      />
    </el-table-column>
    <el-table-column
      label="강제 수신여부"
      header-align="center"
      align="center"
    >
      <template #default="{ row }">
        <span>
          {{ formatForceText(row.forceReceiveSuccess) }}
        </span>
      </template>
    </el-table-column>
    <!-- 기능 업데이트 예정 -->
    <!-- <el-table-column
        label="강제수신"
        header-align="center"
        align="center"
      /> -->
  </el-table>
  <el-row
    justify="center"
    class="mt-20"
  >
    <el-pagination
      :current-page="pagination.currentPageNo"
      :page-size="pagination.elementSizePerPage"
      :total="pagination.totalElementCount"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.success-text {
  color: #67c23a;
}

.fail-text {
  color: #f56c6c;
}
</style>
