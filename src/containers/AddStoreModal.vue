<script lang="ts" setup>
import {reactive, Ref, ref, watch} from 'vue';
import {ElMessage, ElMessageBox, FormInstance, FormRules} from 'element-plus';
import {AxiosResponse} from 'axios';
import {authentication, runtimeCheckHelper} from '@utils';
import useModalStore from '@store/storeModal';
import {selectBoxType} from '@interface/member';
import {ADD_STORE} from '@common/string';
import {memberCodec} from '@codecs';
import {helper, member, store} from '@apis';

const {failAuthenticationAlert, isBrand1Admin, getAdminBusinessInfo} =
  authentication;
const {
  requestCheckDuplicateStoreCode,
  requestCheckDuplicateTabletId,
  requestCheckDuplicateSerialNumber,
} = helper;
const {selectBoxListCodec} = memberCodec;
const {requestNewStoreCreate, requestPosInformationList} = store;
const {requestCorporationList} = member;

const {runtimeCheck} = runtimeCheckHelper;

const {flag, closeModal} = useModalStore();

const props = defineProps<{
  getStoreList: () => void;
}>();

const isCombinedTradeNameAndBranchName = ref(true);
const posInformationList: Ref<string[]> = ref([]);

const addStoreData = reactive({
  test_store_use: 'N', // 테스트 매장 유무,
  businessType: getAdminBusinessInfo().code,
  serialNumber2: '', // 접수 번호
  T_order_store_pos_info: '',
  T_order_store_code: '',
  T_order_origin_store_name: '', // 매장명
  T_order_area_name: '', // 지점명
  T_order_store_name: '', // 태블릿 노출 매장 이름
  T_order_store_id: '', // 태블릿 로그인 아이디
  pw: '',
  pw_re: '',
  memo: '',
  T_order_store_has_middleware: 'Y', // 미들웨어 연동 여부
  T_order_store_has_pos: 'Y', // 포스 유무
});

const isDuplicateChecked = reactive({
  serialNumber2: false,
  storeCode: false,
  tabletId: false,
});

/** 태블릿 노출 매장명: '태블릿에 지점을 포함하여 매장명 노출' 체크된 경우 태블릿 노출 매장명 자동변경 */
const changeTabletStoreName = () => {
  if (isCombinedTradeNameAndBranchName.value) {
    addStoreData.T_order_store_name = `${addStoreData.T_order_origin_store_name}(${addStoreData.T_order_area_name})`;
  }
};

watch(
  () => [
    addStoreData.T_order_origin_store_name,
    addStoreData.T_order_area_name,
  ],
  () => {
    changeTabletStoreName();
  },
);

// 포스 정보에서 벗어날 떄 유효성 검사
const validatePosInfo = (
  _: object,
  __: string,
  callback: (error?: Error) => void,
) => {
  const isValidPosInfo =
    posInformationList.value.findIndex(
      (posInfo: string) => addStoreData.T_order_store_pos_info === posInfo,
    ) > -1;
  if (!isValidPosInfo) {
    callback(new Error('포스 정보를 확인해주세요.'));
    document.getElementById('store-manage-contents-pos-info')?.focus();
    return;
  }
  callback();
};

/** 신규 등록하기 api 호출 */
const postAddNewStore = async () => {
  try {
    const config = {
      test_store_use: addStoreData.test_store_use,
      serial_number2: addStoreData.serialNumber2,
      T_order_store_pos_info: addStoreData.T_order_store_pos_info,
      T_order_store_code: addStoreData.T_order_store_code,
      T_order_origin_store_name: addStoreData.T_order_origin_store_name,
      T_order_area_name: addStoreData.T_order_area_name,
      T_order_store_name: addStoreData.T_order_store_name,
      T_order_store_id: addStoreData.T_order_store_id,
      pw: addStoreData.pw,
      pw_re: addStoreData.pw_re,
      memo: addStoreData.memo,
      T_order_store_has_middleware: addStoreData.T_order_store_has_middleware, // 미들웨어 연동 여부
      T_order_store_has_pos: addStoreData.T_order_store_has_pos, // 포스 유무
      business_type: addStoreData.businessType,
    };
    const res = (await requestNewStoreCreate(config)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      closeModal(ADD_STORE);
      props.getStoreList();
      ElMessage({
        type: 'success',
        message: '성공적으로 등록되었습니다.',
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/** 신규등록 전 테스트 매장 유무에 따라 confirm */
const confirmTestYnAndCreateStore = async () => {
  if (addStoreData.test_store_use === 'Y') {
    await ElMessageBox.confirm('테스트 매장으로 생성됩니다.', '경고', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    })
      .then(() => {
        postAddNewStore();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '취소되었습니다.',
        });
      });
    return;
  }

  await postAddNewStore();
};

/** 미들웨어 N, 포스 N인 경우: 노포스로 고정 */
const isOnlyNoPos = ref(false);

// 미들웨어 Y인 경우: 포스 항상 O
watch(
  () => addStoreData.T_order_store_has_middleware,
  () => {
    if (addStoreData.T_order_store_has_middleware === 'Y') {
      addStoreData.T_order_store_has_pos = 'Y';
    }
  },
);

watch(
  () => addStoreData.T_order_store_has_pos,
  (newValue, oldValue) => {
    if (
      addStoreData.T_order_store_has_middleware === 'N' &&
      addStoreData.T_order_store_has_pos === 'N'
    ) {
      addStoreData.T_order_store_pos_info = '노포스(자체포스)';
      isOnlyNoPos.value = true;
      return;
    }
    if (newValue === 'Y' && oldValue === 'N') {
      addStoreData.T_order_store_pos_info = '';
      isOnlyNoPos.value = false;
      return;
    }

    isOnlyNoPos.value = false;
  },
);

/** 매장 코드 중복 검사 api 호출 */
const postCheckDuplicateStoreCode = async () => {
  try {
    const adminId = {storeCode: addStoreData.T_order_store_code};

    if (adminId.storeCode === '') {
      ElMessage({
        type: 'error',
        message: '매장 코드를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateStoreCode(
      adminId,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      if (!res.data.result) {
        ElMessage({
          type: 'success',
          message: '사용 가능한 매장 코드 입니다.',
        });
        isDuplicateChecked.storeCode = true;
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 사용중인 매장 코드 입니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 태블릿 아이디 중복 검사 api 호출 */
const postCheckDuplicateTabletId = async () => {
  try {
    const adminId = {T_order_id: addStoreData.T_order_store_id};

    if (adminId.T_order_id === '') {
      ElMessage({
        type: 'error',
        message: '태블릿 로그인 아이디를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateTabletId(adminId)) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      if (!res.data.result) {
        ElMessage({
          type: 'success',
          message: '사용 가능한 태블릿 로그인 아이디입니다.',
        });
        isDuplicateChecked.tabletId = true;
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 사용중인 태블릿 로그인 아이디입니다.',
      });
      isDuplicateChecked.tabletId = false;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 입력 값 validation check: el-form
 * @param {FormInstance | undefined} formEl el-form 의 Form 객체
 * */
const checkValidation = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (!valid) return false;

    if (addStoreData.serialNumber2 && !isDuplicateChecked.serialNumber2) {
      ElMessage({
        type: 'error',
        message: '접수 번호 중복 검사를 진행해주세요.',
      });
      return false;
    }

    if (!isDuplicateChecked.storeCode) {
      ElMessage({
        type: 'error',
        message: '매장 코드 중복 검사를 진행해주세요.',
      });
      return false;
    }
    if (!isDuplicateChecked.tabletId) {
      ElMessage({
        type: 'error',
        message: '태블릿 로그인 아이디 중복 검사를 진행해주세요.',
      });
      return false;
    }

    confirmTestYnAndCreateStore();
    return true;
  });
};

const ruleFormRef = ref<FormInstance>();

/** input 변경 시 중복 검사 재진행 필요: 매장 코드 */
const changeInputStoreCode = () => {
  isDuplicateChecked.storeCode = false;
};

/** input 변경 시 중복 검사 재진행 필요: 접수 번호 */
const changeInputSerialNumber = () => {
  isDuplicateChecked.serialNumber2 = false;
};

/** input 변경 시 중복 검사 재진행 필요: 태블릿 로그인 아이디 */
const changeInputTabletId = () => {
  isDuplicateChecked.tabletId = false;
};

/** 사업체 리스트 */
const isLoadingCorporations = ref(true);
const corporationListData: Ref<selectBoxType[]> = ref([]);
const getCorporationListData = async () => {
  try {
    const res = (await requestCorporationList()) as AxiosResponse;
    const typeError = runtimeCheck(selectBoxListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        corporationListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingCorporations.value = false;
  }
};

/**
 * 비밀번호 확인 유효성 검사: el-form validator
 * @param {object} _ 미사용.
 * @param {string} value 입력값
 * @param callback 유효성 검사 미통과 시 error 표기 callback
 * */
const validateRePass = (
  _: object,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value !== addStoreData.pw) {
    callback(new Error('비밀번호가 일치하지 않습니다.'));
    return;
  }

  callback();
};

// form rule
const formRules = reactive<FormRules>({
  test_store_use: [
    {
      required: true,
      message: '테스트 매장을 선택해주세요.',
      trigger: 'change',
    },
  ],
  T_order_store_pos_info: [
    {
      required: true,
      message: '포스 정보를 선택해주세요.',
      trigger: 'blur',
    },
    {
      trigger: 'blur',
      validator: validatePosInfo,
    },
  ],
  T_order_store_code: [
    {
      required: true,
      message: '매장 코드를 입력해주세요.',
      trigger: 'blur',
    },
  ],
  T_order_origin_store_name: [
    {
      required: true,
      message: '매장명을 입력해주세요.',
      trigger: 'blur',
    },
  ],
  T_order_area_name: [
    {
      required: true,
      message: '지점명을 입력해주세요.',
      trigger: 'blur',
    },
  ],
  T_order_store_name: [
    {
      required: true,
      message: '태블릿 노출 매장명을 입력해주세요.',
      trigger: 'change',
    },
  ],
  T_order_store_id: [
    {
      required: true,
      message: '태블릿 로그인 아이디를 입력해주세요.',
      trigger: 'blur',
    },
  ],
  pw: [
    {
      required: true,
      message: '태블릿 로그인 비밀번호를 입력해주세요.',
      trigger: 'blur',
    },
  ],
  pw_re: [
    {
      required: true,
      message: '태블릿 로그인 비밀번호 확인을 입력해주세요.',
      trigger: 'blur',
    },
    {
      validator: validateRePass,
      trigger: 'blur',
    },
  ],
});

/** 접수 번호 중복 검사 api 호출 */
const postCheckDuplicateSerialNumber = async () => {
  try {
    const serial = {serial_number2: addStoreData.serialNumber2};

    if (serial.serial_number2 === '') {
      ElMessage({
        type: 'error',
        message: '접수 번호를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateSerialNumber(
      serial,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      if (!res.data.result) {
        ElMessage({
          type: 'success',
          message: '사용 가능한 접수 번호 입니다.',
        });
        isDuplicateChecked.serialNumber2 = true;
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 등록된 접수 번호 입니다.',
      });
      isDuplicateChecked.serialNumber2 = false;
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * 키워드 검색으로 포스 값 검색: el-autocomplete callback
 * @param {string} queryString 포스 검색 키워드
 * @param {any} cb el-autocomplete 제공하는 callback 함수
 * */
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? posInformationList.value.filter(
      (posInfo) =>
        posInfo.toLowerCase().indexOf(queryString.toLowerCase()) === 0,
    )
    : posInformationList.value;

  cb(results);
};

/** 포스 정보 select 시 값 추가 */
const handleSelectPosInformation = (posInformation: string) => {
  addStoreData.T_order_store_pos_info = posInformation;
};

/** 포스 리스트 api 호출 */
const getPosInformationList = async () => {
  try {
    const res = (await requestPosInformationList()) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      posInformationList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 태블릿 노출 매장명: '태블릿에 지점을 포함하여 매장명 노출' 체크된 경우  */
const combineTradeNameAndBranchName = () => {
  if (isCombinedTradeNameAndBranchName.value) {
    addStoreData.T_order_store_name = `${addStoreData.T_order_origin_store_name}(${addStoreData.T_order_area_name})`;
    return;
  }

  addStoreData.T_order_store_name = '';
};

// v-for 방어 코드
const getCorporationKey = (corporation: selectBoxType, index: number) =>
  corporation ? corporation.code : `corporation-${index}`;

getCorporationListData();
getPosInformationList();
</script>

<template>
  <el-dialog
    v-model="flag.addStore"
    :align-center="true"
    title="신규 매장 등록"
    width="50%"
  >
    <el-scrollbar height="700px">
      <el-row
        v-if="isLoadingCorporations"
        v-loading="isLoadingCorporations"
        class="loading-container"
      >
      </el-row>
      <el-form
        v-else
        ref="ruleFormRef"
        :inline-message="true"
        :model="addStoreData"
        :rules="formRules"
      >
        <el-descriptions
          :column="1"
          border
          class="add-store-form"
        >
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                테스트 매장
                <span class="essential-star"> * </span>
              </p>
            </template>
            <el-radio-group
              v-model="addStoreData.test_store_use"
              class="add-store-form-input width-100"
            >
              <el-radio label="N"> 운영</el-radio>
              <el-radio label="Y"> 테스트</el-radio>
            </el-radio-group>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="corporationListData?.length > 0"
            label-align="center"
          >
            <template #label>
              <p>
                사업체 구분
                <span class="essential-star"> * </span>
              </p>
            </template>
            <el-radio-group
              v-model="addStoreData.businessType"
              class="add-store-form-input flex corporation-wrapper width-100"
            >
              <div
                v-for="(corporation, index) in corporationListData"
                :key="getCorporationKey(corporation, index)"
              >
                <el-radio :label="corporation.code">
                  {{ corporation.name }}
                </el-radio>
              </div>
            </el-radio-group>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="!isBrand1Admin()"
            label="접수 번호"
            label-align="center"
          >
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-input
                  v-model="addStoreData.serialNumber2"
                  :formatter="(value: string) => value.trim()"
                  clearable
                  @change="changeInputSerialNumber"
                />
              </div>
              <div>
                <el-button
                  type="primary"
                  @click="postCheckDuplicateSerialNumber"
                >
                  중복 검사
                </el-button>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                미들웨어 연동 여부
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <el-radio-group id="middle" v-model="addStoreData.T_order_store_has_middleware">
                <el-radio
                  border
                  label="Y"
                >
                  미들웨어 연동
                </el-radio>
                <el-radio
                  border
                  label="N"
                >
                  미들웨어 미연동
                </el-radio>
              </el-radio-group>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                포스 유무
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <el-radio-group v-model="addStoreData.T_order_store_has_pos">
                <el-radio
                  border
                  label="Y"
                >
                  포스 유(有)
                </el-radio>
                <el-radio
                  :disabled="addStoreData.T_order_store_has_middleware === 'Y'"
                  border
                  class="ml-10"
                  label="N"
                >
                  포스 무(無)
                </el-radio>
              </el-radio-group>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                포스 정보
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-form-item prop="T_order_store_pos_info">
                  <el-autocomplete
                    id="store-manage-contents-pos-info"
                    v-model="addStoreData.T_order_store_pos_info"
                    :disabled="isOnlyNoPos"
                    :fetch-suggestions="querySearch"
                    class="width-100"
                    clearable
                    placeholder="포스 정보를 선택해주세요."
                    @select="handleSelectPosInformation"
                  >
                    <template #default="{ item }">
                      {{ item }}
                    </template>
                  </el-autocomplete>
                </el-form-item>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                매장 코드
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-form-item prop="T_order_store_code">
                  <el-input
                    v-model="addStoreData.T_order_store_code"
                    clearable
                    input-width="100%"
                    @change="changeInputStoreCode"
                  />
                </el-form-item>
              </div>
              <div>
                <el-button
                  type="primary"
                  @click="postCheckDuplicateStoreCode"
                >
                  중복 검사
                </el-button>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                매장명
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-form-item prop="T_order_origin_store_name">
                  <el-input
                    v-model="addStoreData.T_order_origin_store_name"
                    clearable
                    input-width="100%"
                  />
                </el-form-item>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                지점
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-form-item prop="T_order_area_name">
                  <el-input
                    v-model="addStoreData.T_order_area_name"
                    clearable
                    input-width="100%"
                  />
                  <el-checkbox
                    v-model="isCombinedTradeNameAndBranchName"
                    @change="combineTradeNameAndBranchName"
                  >
                    태블릿에 지점을 포함하여 매장명 노출
                  </el-checkbox>
                </el-form-item>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                태블릿 노출 매장명
                <span class="essential-star"> * </span>
              </p>
            </template>
            <el-form-item prop="T_order_store_name">
              <el-input
                v-model="addStoreData.T_order_store_name"
                :disabled="isCombinedTradeNameAndBranchName"
                clearable
                @change="changeTabletStoreName"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                태블릿 로그인 아이디
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <div class="add-store-form-input width-100">
                <el-form-item prop="T_order_store_id">
                  <el-input
                    v-model="addStoreData.T_order_store_id"
                    clearable
                    input-width="100%"
                    @change="changeInputTabletId"
                  />
                </el-form-item>
              </div>
              <div>
                <el-button
                  type="primary"
                  @click="postCheckDuplicateTabletId"
                >
                  중복 검사
                </el-button>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                태블릿 로그인 비밀번호
                <span class="essential-star"> * </span>
              </p>
            </template>
            <el-form-item prop="pw">
              <el-input
                v-model="addStoreData.pw"
                clearable
                show-password
                type="password"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                태블릿 로그인 비밀번호 확인
                <span class="essential-star"> * </span>
              </p>
            </template>
            <el-form-item prop="pw_re">
              <el-input
                v-model="addStoreData.pw_re"
                clearable
                show-password
                type="password"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item
            label="특이사항"
            label-align="center"
          >
            <el-input
              v-model="addStoreData.memo"
              :autosize="{ minRows: 5, maxRows: 10 }"
              type="textarea"
            />
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-row
        align="middle"
        justify="end"
      >
        <el-button
          type="danger"
          @click="closeModal(ADD_STORE)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="checkValidation(ruleFormRef)"
        >
          신규 등록
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.add-store-form {
  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 220px;
    vertical-align: middle;
  }

  .add-store-form-title {
    width: 100px;
    margin: 0;
  }

  .add-store-form-id {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .add-store-form-input {
    vertical-align: middle;
  }

  .corporation-wrapper {
    gap: 30px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 5px;
}

.loading-container {
  height: 700px;
}
</style>
