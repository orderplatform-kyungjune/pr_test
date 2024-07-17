<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessageBox, ElMessage, FormInstance, FormRules } from 'element-plus';
import { AxiosResponse } from 'axios';
import {
  routeHelper,
  runtimeCheckHelper,
  etcUtils,
  formattingUtils,
} from '@utils';
import useTagsStore from '@store/storeTags';
import { waitingServiceStoreList } from '@router/routePaths';
import { BreadcrumbHeader } from '@components';
import {
  WAITING_SERVICE_STORE_ENROLL,
  WAITING_SERVICE_STORE_EDIT,
} from '@common/string';
import { waitingCodec } from '@codecs';
import { waitingService } from '@apis';

const tagStore = useTagsStore();
const { runtimeCheck } = runtimeCheckHelper;
const { replaceEmptyString } = etcUtils;
const { formatPhoneNumber } = formattingUtils;
const { responseWaitingConfigCodec } = waitingCodec;
const { addTagsData } = tagStore;
const {
  requestWaitingStoreEnroll,
  requestWaitingStoreConfigEdit,
  requestWaitingStoreConfig,
} = waitingService;
const { pushPage } = routeHelper;
const route = useRoute();
const { storeId, mode } = route.query;

const waitingServiceStoreEnrollHeader = reactive([
  {
    name:
      mode === 'edit'
        ? WAITING_SERVICE_STORE_EDIT
        : WAITING_SERVICE_STORE_ENROLL,
  },
]);

const storeInfo = reactive({
  id: 0,
  loginId: '',
  loginPwd: '',
  tStoreCode: '' || null,
  enStoreName: '',
  name: '',
  phone: '',
  contractDateRange: [
    '', // 계약 시작일
    '', // 계약 종료일
  ],
  masterAppVersion: '',
  userAppVersion: '',
  config: {
    alimtalkEnabled: '사용',
    isWaitingClosed: '접수 가능',
    waitingNumberResetTimeEnabled: '사용',
    waitingNumberResetTime: '00:00',
    useEntranceLimit: '미사용',
    expectedWaitingMinutes: 15,
    entranceLimitTimeEnabled: '사용',
    entranceLimitMinutes: 5,
  },
});

const formatContact = () => {
  storeInfo.phone = formatPhoneNumber(storeInfo.phone);
};

const checkEnStoreName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error());
    return;
  }
  const isMatch = /^[a-z]{3,5}$/.test(value);
  setTimeout(() => {
    if (!isMatch) {
      callback(new Error());
    } else {
      callback();
    }
  }, 200);
};

const checkInputBlank = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error());
    return;
  }
  setTimeout(() => {
    if (!value.trim()) {
      callback(new Error());
    } else {
      callback();
    }
  }, 200);
};

const checkContractRange = (rule: any, value: string, callback: any) => {
  if (!value[0] || !value[1]) {
    callback(new Error());
    return;
  }
  // 시작-종료일 다르게
  if (storeInfo.contractDateRange[0] === storeInfo.contractDateRange[1]) {
    callback(new Error());
    return;
  }
  setTimeout(() => {
    callback();
  }, 200);
};

// Form Validation
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  tStoreCode: [
    {
      required: false,
      message: '매장코드를 입력해주세요',
      trigger: 'change',
    },
  ],
  enStoreName: [
    {
      required: true,
      message: '영소문자 3~5자의 매장명을 입력해주세요.',
      trigger: 'change',
      validator: checkEnStoreName,
    },
  ],
  name: [
    {
      required: true,
      message: '매장명을 입력해주세요.',
      trigger: 'change',
      validator: checkInputBlank,
    },
  ],
  contractDateRange: [
    {
      required: true,
      message: '계약 기간을 확인해주세요.',
      trigger: 'blur',
      validator: checkContractRange,
    },
  ],
});

/** 매장 관리(리스트)로 이동 */
const pushWaitingList = () => {
  pushPage(waitingServiceStoreList);
  addTagsData({
    name: '대기표 매장 관리',
    path: waitingServiceStoreList,
  });
};

/** 매장 정보 요청 */
const changeEnabledToString = (enabledValue: boolean) =>
  enabledValue ? '사용' : '미사용';
const changeStringToEnabled = (value: string) => value === '사용';

const getWaitingStoreConfig = async () => {
  try {
    if (!storeId) return;
    const res = (await requestWaitingStoreConfig(
      storeId as string,
    )) as AxiosResponse;
    const typeError = runtimeCheck(responseWaitingConfigCodec, res.data);

    if (res.data.resultCode !== 200) {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (!typeError && res.data.resultCode === 200) {
      const { resultData } = res.data;
      storeInfo.id = resultData.id;
      storeInfo.loginId = resultData.loginId;
      storeInfo.loginPwd = resultData.loginPwd;
      storeInfo.tStoreCode = resultData.tStoreCode;
      storeInfo.enStoreName = resultData.enStoreName;
      storeInfo.name = resultData.name;
      storeInfo.phone = resultData.phone;
      storeInfo.contractDateRange[0] = resultData.contractStartDate;
      storeInfo.contractDateRange[1] = resultData.contractEndDate;
      storeInfo.masterAppVersion = resultData.masterAppVersion;
      storeInfo.userAppVersion = resultData.userAppVersion;

      const { config } = resultData;
      storeInfo.config.alimtalkEnabled = changeEnabledToString(
        config.alimtalkEnabled,
      );
      storeInfo.config.isWaitingClosed = config.isWaitingClosed
        ? '접수 마감'
        : '접수 가능';
      storeInfo.config.waitingNumberResetTimeEnabled = changeEnabledToString(
        config.waitingNumberResetTimeEnabled,
      );
      storeInfo.config.waitingNumberResetTime = config.waitingNumberResetTime
        ? config.waitingNumberResetTime
        : '00:00';
      storeInfo.config.useEntranceLimit = changeEnabledToString(
        config.entranceLimitTimeEnabled,
      );
      storeInfo.config.entranceLimitTimeEnabled = changeEnabledToString(
        config.entranceLimitTimeEnabled,
      );
      storeInfo.config.expectedWaitingMinutes = config.expectedWaitingMinutes;
      storeInfo.config.entranceLimitMinutes = config.entranceLimitMinutes;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 정보 수정 */
const patchWaitingStoreEdit = async () => {
  try {
    const requestData = {
      id: storeInfo.id,
      name: storeInfo.name,
      phone: replaceEmptyString(storeInfo.phone),
      contractStartDate: storeInfo.contractDateRange[0],
      contractEndDate: storeInfo.contractDateRange[1],
      tStoreCode: storeInfo.tStoreCode,
      loginId: storeInfo.loginId,
      config: {
        alimtalkEnabled: changeStringToEnabled(
          storeInfo.config.alimtalkEnabled,
        ),
        waitingNumberResetTimeEnabled: changeStringToEnabled(
          storeInfo.config.waitingNumberResetTimeEnabled,
        ),
        waitingNumberResetTime: storeInfo.config.waitingNumberResetTime,
        expectedWaitingMinutes: storeInfo.config.expectedWaitingMinutes,
        isWaitingClosed: storeInfo.config.isWaitingClosed === '접수 마감',
        entranceLimitMinutes: storeInfo.config.entranceLimitMinutes,
        entranceLimitTimeEnabled: changeStringToEnabled(
          storeInfo.config.entranceLimitTimeEnabled,
        ),
      },
    };
    const res = (await requestWaitingStoreConfigEdit(
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode !== 200) {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '저장되었습니다.',
      });
      await getWaitingStoreConfig();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 등록하기 */
const postSignUpWaitingStore = async () => {
  const requestData = {
    storeCode: storeInfo.tStoreCode,
    enStoreName: storeInfo.enStoreName,
    storeName: storeInfo.name,
    storePhone: replaceEmptyString(storeInfo.phone),
    contractStartDate: storeInfo.contractDateRange[0],
    contractEndDate: storeInfo.contractDateRange[1],
    config: {
      alimtalkEnabled: changeStringToEnabled(storeInfo.config.alimtalkEnabled),
      waitingNumberResetTimeEnabled: changeStringToEnabled(
        storeInfo.config.waitingNumberResetTimeEnabled,
      ),
      waitingNumberResetTime: storeInfo.config.waitingNumberResetTime,
      expectedWaitingMinutes: storeInfo.config.expectedWaitingMinutes,
      isWaitingClosed: storeInfo.config.isWaitingClosed === '접수 마감',
      entranceLimitMinutes: storeInfo.config.entranceLimitMinutes,
      entranceLimitTimeEnabled: changeStringToEnabled(
        storeInfo.config.entranceLimitTimeEnabled,
      ),
    },
  };

  try {
    const res = (await requestWaitingStoreEnroll(requestData)) as AxiosResponse;

    if (res.data.resultCode !== 200) {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.resultCode === 200) {
      pushWaitingList();
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmStoreEnroll = () => {
  ElMessageBox.confirm('등록하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      postSignUpWaitingStore();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const confirmStoreConfigEdit = () => {
  ElMessageBox.confirm('수정하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      patchWaitingStoreEdit();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const checkValidation = async () => {
  if (!ruleFormRef.value) return;

  ruleFormRef.value.validate((valid) => {
    // 계약기간 유효성 검사
    if (valid) {
      if (mode === 'edit') {
        confirmStoreConfigEdit();
      } else {
        confirmStoreEnroll();
      }
    }
  });
};

const setStoreInfo = () => {
  if (mode !== 'edit') return;
  getWaitingStoreConfig();
};

setStoreInfo();
</script>

<template>
  <BreadcrumbHeader :propsHeader="waitingServiceStoreEnrollHeader" />
  <div class="waiting-store-info-wrapper">
    <el-form
      ref="ruleFormRef"
      :model="storeInfo"
      :rules="rules"
      label-position="top"
    >
      <el-card
        class="mt-10"
        shadow="never"
      >
        <el-row
          v-if="mode === 'edit'"
          :gutter="10"
        >
          <el-col :span="12">
            <el-form-item
              label="로그인 ID"
              prop="loginId"
            >
              <el-input v-model="storeInfo.loginId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="비밀번호"
              prop="loginPwd"
            >
              <el-input
                v-model="storeInfo.loginPwd"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="mode === 'edit'"
          :gutter="10"
        >
          <el-col :span="12">
            <el-form-item
              label="매장코드"
              prop="tStoreCode"
            >
              <el-input
                v-model="storeInfo.tStoreCode"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="매장명"
              prop="name"
            >
              <el-input
                v-model="storeInfo.name"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="mode !== 'edit'"
          :gutter="10"
        >
          <el-col :span="8">
            <el-form-item
              label="매장 코드"
              prop="storeCode"
            >
              <el-input
                v-model="storeInfo.tStoreCode"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="영문 매장명"
              prop="enStoreName"
            >
              <el-input
                v-model="storeInfo.enStoreName"
                maxlength="5"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="매장명"
              prop="name"
            >
              <el-input
                v-model="storeInfo.name"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item
              label="매장 전화번호"
              prop="phone"
            >
              <el-input
                v-model="storeInfo.phone"
                maxlength="13"
                @input="formatContact"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              class="waiting-store-date-picker"
              label="계약 기간"
              prop="contractDateRange"
            >
              <el-date-picker
                v-model="storeInfo.contractDateRange"
                end-placeholder="계약 종료일을 선택해주세요."
                format="YYYY-MM-DD"
                start-placeholder="계약 시작일을 선택해주세요."
                type="daterange"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="mode === 'edit'"
          :gutter="10"
        >
          <el-col :span="12">
            <el-form-item
              label="유저 앱 버전"
              prop="userAppVersion"
            >
              <el-input
                v-model="storeInfo.userAppVersion"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="마스터 앱 버전"
              prop="masterAppVersion"
            >
              <el-input
                v-model="storeInfo.masterAppVersion"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <el-card
        class="mt-10"
        shadow="never"
      >
        <el-row>
          <el-form-item label="알림톡 사용 여부">
            <el-radio-group v-model="storeInfo.config.alimtalkEnabled">
              <el-radio label="사용" />
              <el-radio label="미사용" />
            </el-radio-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="초기화 사용 여부">
              <el-radio-group
                v-model="storeInfo.config.waitingNumberResetTimeEnabled"
              >
                <el-radio label="사용" />
                <el-radio label="미사용" />
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="초기화 시간">
              <el-time-picker
                v-model="storeInfo.config.waitingNumberResetTime"
                :disabled="
                  storeInfo.config.waitingNumberResetTimeEnabled !== '사용'
                "
                format="HH:mm"
                placeholder="00:00"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="호출 이후 자동 취소">
              <el-radio-group
                v-model="storeInfo.config.entranceLimitTimeEnabled"
              >
                <el-radio label="사용" />
                <el-radio label="미사용" />
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="자동 취소 시간 (분)">
              <el-input-number
                v-model="storeInfo.config.entranceLimitMinutes"
                :disabled="storeInfo.config.entranceLimitTimeEnabled !== '사용'"
                :max="60"
                :min="1"
                :step="1"
                :step-strictly="true"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="대기 접수 상태">
              <el-radio-group v-model="storeInfo.config.isWaitingClosed">
                <el-radio label="접수 가능" />
                <el-radio label="접수 마감" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="평균 대기 시간 (분)">
              <el-input-number
                v-model="storeInfo.config.expectedWaitingMinutes"
                :max="60"
                :min="1"
                :step="1"
                :step-strictly="true"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          class="mt-20"
          justify="center"
        >
          <el-button
            type="danger"
            @click="pushWaitingList"
          >
            취소
          </el-button>
          <el-button
            v-if="mode === 'edit'"
            type="primary"
            @click="checkValidation"
          >
            수정하기
          </el-button>
          <el-button
            v-else
            type="primary"
            @click="checkValidation"
          >
            등록하기
          </el-button>
        </el-row>
      </el-card>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.waiting-store-info-wrapper {
  max-width: 1100px;
}

.waiting-store-date-picker {
  &:deep(.el-input) {
    width: 100%;
  }
}
</style>
