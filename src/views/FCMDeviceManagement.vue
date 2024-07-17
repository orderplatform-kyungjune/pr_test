<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import { BreadcrumbHeader } from '@components';
import { FCM_DEVICE_MANAGEMENT } from '@common/string';
import { creditCodec } from '@codecs';
import { credit } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;

const {
  requestFCMDeviceListInfo,
  requestFCMDeviceChangeHistory,
  requestDeleteDevice,
} = credit;

const { fcmDeviceListInfoCodec, fcmDeviceChangeHistoryCodec } = creditCodec;

const { failAuthenticationAlert } = authentication;

const fcmDeviceHeader = reactive([{ name: FCM_DEVICE_MANAGEMENT }]);
const activePane = ref('list');

const fcmDeviceListInfoSearchData = reactive({
  storeCode: '',
  tabletCode: '',
  ssaid: '',
  ipAddr: '',
  fcmToken: '',
});

const pagination = reactive({
  currentPageNo: 0, // 현재 페이지
  totalPageCount: 0, // 총 페이지 갯수
  totalElementCount: 0, // 총 데이터 갯수
  elementSizePerPage: 100, // 회당 요청 조회갯수
});

// 기기조회
const fcmDeviceListInfo = ref([]);
const getFCMDeviceListInfo = async () => {
  try {
    const payload = {
      size: 20,
      page:
        pagination.currentPageNo === 0
          ? pagination.currentPageNo
          : pagination.currentPageNo - 1,
      storeCode: fcmDeviceListInfoSearchData.storeCode,
      tabletCode: fcmDeviceListInfoSearchData.tabletCode,
      ssaid: fcmDeviceListInfoSearchData.ssaid,
      ipAddr: fcmDeviceListInfoSearchData.ipAddr,
      fcmToken: fcmDeviceListInfoSearchData.fcmToken,
    };
    const res = (await requestFCMDeviceListInfo(payload)) as AxiosResponse;
    const typeError = runtimeCheck(fcmDeviceListInfoCodec, res.data);
    if (res.data.resultCode === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.resultCode === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.resultCode === 200) {
        fcmDeviceListInfo.value = res.data.resultData.content;
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
getFCMDeviceListInfo();

const handleCurrentPage = async (val: number) => {
  pagination.currentPageNo = val;
  await getFCMDeviceListInfo();
};

const resetFCMDeviceSearchData = () => {
  pagination.currentPageNo = 0;
  fcmDeviceListInfoSearchData.storeCode = '';
  fcmDeviceListInfoSearchData.tabletCode = '';
  fcmDeviceListInfoSearchData.ssaid = '';
  fcmDeviceListInfoSearchData.ipAddr = '';
  fcmDeviceListInfoSearchData.fcmToken = '';
};

const deviceHistorySearchData = reactive({
  storeCode: '',
  tabletCode: '',
  ssaid: '',
  ipAddr: '',
});

const historyPagination = reactive({
  currentPageNo: 0, // 현재 페이지
  totalPageCount: 0, // 총 페이지 갯수
  totalElementCount: 0, // 총 데이터 갯수
  elementSizePerPage: 100, // 회당 요청 조회갯수
});

// 기기정보 변경이력
const deviceHistoryList = ref([]);
const getFCMDeviceChangeHistory = async () => {
  try {
    const payload = {
      size: 20,
      page:
        historyPagination.currentPageNo === 0
          ? historyPagination.currentPageNo
          : historyPagination.currentPageNo - 1,
      storeCode: deviceHistorySearchData.storeCode,
      tabletCode: deviceHistorySearchData.tabletCode,
      ssaid: deviceHistorySearchData.ssaid,
      ipAddr: deviceHistorySearchData.ipAddr,
    };
    const res = (await requestFCMDeviceChangeHistory(payload)) as AxiosResponse;
    const typeError = runtimeCheck(fcmDeviceChangeHistoryCodec, res.data);

    if (res.data.resultCode === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.resultCode === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.resultCode === 200) {
        deviceHistoryList.value = res.data.resultData.content;
        historyPagination.currentPageNo = res.data.resultData.currentPageNo + 1;
        historyPagination.totalPageCount = res.data.resultData.totalPageCount;
        historyPagination.totalElementCount =
          res.data.resultData.totalElementCount;
        historyPagination.elementSizePerPage =
          res.data.resultData.elementSizePerPage;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

getFCMDeviceChangeHistory();

const historyHandleCurrentPage = async (val: number) => {
  historyPagination.currentPageNo = val;
  await getFCMDeviceChangeHistory();
};

const resetDeviceHistorySearchData = () => {
  historyPagination.currentPageNo = 0;
  deviceHistorySearchData.storeCode = '';
  deviceHistorySearchData.tabletCode = '';
  deviceHistorySearchData.ssaid = '';
  deviceHistorySearchData.ipAddr = '';
};

const formatRevisionTypeText = (text: string) => {
  if (text === 'ADD') {
    return '추가';
  }
  if (text === 'MOD') {
    return '수정';
  }
  if (text === 'DEL') {
    return '삭제';
  }
  return '';
};

const getRevisionTypeStyle = (text: string) => ({
  'add-text': text === 'ADD',
  'mod-text': text === 'MOD',
});

const deleteDevice = async (ssaid: string) => {
  try {
    const res = (await requestDeleteDevice(ssaid)) as AxiosResponse;

    if (res.data.resultCode === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.resultCode === 401) {
      failAuthenticationAlert();
    }

    if (res.data.resultCode === 200) {
      ElMessage({
        message: '삭제되었습니다.',
        type: 'success',
      });
      await getFCMDeviceListInfo();
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteConfirm = async (ssaid: string) => {
  ElMessageBox.confirm(
    `SSAID [ ${ssaid} ]의 기기를 삭제하시겠습니까?`,
    '기기삭제',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(() => {
    deleteDevice(ssaid);
  });
};
</script>

<template>
  <BreadcrumbHeader :propsHeader="fcmDeviceHeader" />
  <el-tabs
    v-model="activePane"
    type="card"
    class="mt-10"
  >
    <el-tab-pane
      label="기기조회"
      name="list"
    >
      <el-card
        shadow="never"
        class="mb-10"
      >
        <el-row align="bottom">
          <el-col
            :span="3"
            class="mr-10"
          >
            <p class="font-small mb-5">매장코드</p>
            <el-input
              v-model="fcmDeviceListInfoSearchData.storeCode"
              placeholder="매장 코드를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="3"
            class="mr-10"
          >
            <p class="font-small mb-5">태블릿 ID</p>
            <el-input
              v-model="fcmDeviceListInfoSearchData.tabletCode"
              placeholder="태블릿 ID를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="3"
            class="mr-10"
          >
            <p class="font-small mb-5">SSAID</p>
            <el-input
              v-model="fcmDeviceListInfoSearchData.ssaid"
              placeholder="SSAID를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="3"
            class="mr-10"
          >
            <p class="font-small mb-5">IP</p>
            <el-input
              v-model="fcmDeviceListInfoSearchData.ipAddr"
              placeholder="IP를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="4"
            class="mr-10"
          >
            <p class="font-small mb-5">FCM 토큰</p>
            <el-input
              v-model="fcmDeviceListInfoSearchData.fcmToken"
              placeholder="FCM 토큰을 입력해주세요."
            />
          </el-col>
          <el-col :span="6">
            <el-button
              type="primary"
              @click="getFCMDeviceListInfo"
            >
              검색
            </el-button>
            <el-button @click="resetFCMDeviceSearchData"> 초기화 </el-button>
          </el-col>
        </el-row>
      </el-card>
      <el-table
        :data="fcmDeviceListInfo"
        border
        flexible
        height="575px"
      >
        <el-table-column
          label="ID"
          prop="id"
          header-align="center"
          align="center"
          width="60"
        />
        <el-table-column
          label="매장코드"
          prop="storeCode"
          header-align="center"
          align="center"
          width="130"
        />
        <el-table-column
          label="매장명"
          prop="storeName"
          header-align="center"
          align="center"
          width="130"
        />
        <el-table-column
          label="태블릿 ID"
          prop="tabletCode"
          header-align="center"
          align="center"
          width="152"
        />
        <el-table-column
          label="테이블명"
          prop="tabletName"
          header-align="center"
          align="center"
          width="100"
        />
        <el-table-column
          label="SSAID"
          prop="ssaid"
          header-align="center"
          align="center"
          width="170"
        />
        <el-table-column
          label="IP"
          prop="ipAddr"
          header-align="center"
          align="center"
          width="135"
        />
        <el-table-column
          label="App Code/FCM Token"
          prop="fcmToken"
          header-align="center"
          align="center"
          min-width="230"
        />
        <el-table-column
          label="생성일시"
          prop="createdDateTime"
          header-align="center"
          align="center"
          width="100"
        />
        <el-table-column
          label="수정일시"
          prop="modifiedDateTime"
          header-align="center"
          align="center"
          width="100"
        />
        <el-table-column
          label="기기삭제"
          header-align="center"
          align="center"
          width="75"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              @click="deleteConfirm(row.ssaid)"
            >
              삭제
            </el-button>
          </template>
        </el-table-column>
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
    </el-tab-pane>
    <el-tab-pane
      label="기기정보 변경이력"
      name="history"
    >
      <el-card
        shadow="never"
        class="mb-10"
      >
        <el-row align="bottom">
          <el-col
            :span="4"
            class="mr-10"
          >
            <p class="font-small mb-5">매장코드</p>
            <el-input
              v-model="deviceHistorySearchData.storeCode"
              placeholder="매장 코드를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="4"
            class="mr-10"
          >
            <p class="font-small mb-5">태블릿 ID</p>
            <el-input
              v-model="deviceHistorySearchData.tabletCode"
              placeholder="태블릿 ID를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="4"
            class="mr-10"
          >
            <p class="font-small mb-5">SSAID</p>
            <el-input
              v-model="deviceHistorySearchData.ssaid"
              placeholder="SSAID를 입력해주세요."
            />
          </el-col>
          <el-col
            :span="4"
            class="mr-10"
          >
            <p class="font-small mb-5">IP</p>
            <el-input
              v-model="deviceHistorySearchData.ipAddr"
              placeholder="IP를 입력해주세요."
            />
          </el-col>
          <el-col :span="6">
            <el-button
              type="primary"
              @click="getFCMDeviceChangeHistory"
            >
              검색
            </el-button>
            <el-button @click="resetDeviceHistorySearchData">
              초기화
            </el-button>
          </el-col>
        </el-row>
      </el-card>
      <el-table
        :data="deviceHistoryList"
        border
        flexible
        height="520px"
      >
        <el-table-column
          label="ID"
          prop="rev"
          header-align="center"
          align="center"
          width="80"
        />
        <el-table-column
          label="변경유형"
          header-align="center"
          align="center"
          width="75"
        >
          <template #default="{ row }">
            <span :class="getRevisionTypeStyle(row.revisionType)">
              {{ formatRevisionTypeText(row.revisionType) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="수정 데이터"
          header-align="center"
          align="center"
          width="151"
        >
          <template #default="{ row }">
            <el-tag
              v-for="item in row.changePropertyName"
              :key="item"
              effect="plain"
              round
              type="info"
              class="mr-5 mt-5"
            >
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="기기 ID"
          prop="deviceId"
          header-align="center"
          align="center"
          width="75"
        />
        <el-table-column
          label="매장코드"
          prop="storeCode"
          header-align="center"
          align="center"
          width="130"
        />
        <el-table-column
          label="FCM token"
          prop="fcmtoken"
          header-align="center"
          align="center"
        />
        <el-table-column
          label="태블릿 ID"
          prop="tabletCode"
          header-align="center"
          align="center"
          width="152"
        />
        <el-table-column
          label="SSAID"
          prop="ssaid"
          header-align="center"
          align="center"
          width="170"
        />
        <el-table-column
          label="IP"
          prop="ipAddr"
          header-align="center"
          align="center"
          width="135"
        />
        <el-table-column
          label="수정일시"
          prop="changeDateTime"
          header-align="center"
          align="center"
          width="100"
        />
      </el-table>
      <el-row
        justify="center"
        class="mt-20"
      >
        <el-pagination
          :current-page="historyPagination.currentPageNo"
          :page-size="historyPagination.elementSizePerPage"
          :total="historyPagination.totalElementCount"
          background
          layout="prev, pager, next"
          @current-change="historyHandleCurrentPage"
        />
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.add-text {
  color: #409eff;
}

.mod-text {
  color: #e6a23c;
}
</style>
