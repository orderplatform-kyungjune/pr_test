<script lang="ts" setup>
import { reactive, Ref, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { ADD_STORE } from '@common/string';
import { helper, store } from '@apis';

const { failAuthenticationAlert, getAdminBusinessInfo } = authentication;
const {
  requestCheckDuplicateStoreCode,
  requestCheckDuplicateTabletIdInPlatform,
} = helper;
const { requestNewStoreCreateInPlatform, requestPosInformationList } = store;

const { flag, closeModal } = useModalStore();

const props = defineProps<{
  getStoreList: () => void;
}>();

const isCombinedTradeNameAndBranchName = ref(false);
const posInformationList: Ref<string[]> = ref([]);

const addStoreData = reactive({
  test_store_use: 'N', // 테스트 매장 유무,
  businessType: getAdminBusinessInfo().code,
  serial_number: '', // 매장 일련번호
  platform_store_pos_info: '',
  platform_store_code: '',
  platform_origin_store_name: '', // 매장명
  platform_area_name: '', // 지점명
  platform_store_name: '', // 태블릿 노출 매장 이름
  platform_store_id: '', // 태블릿 로그인 아이디
  pw: '',
  pw_re: '',
  memo: '',
  platform_store_has_middleware: 'Y', // 미들웨어 연동 여부
  platform_store_has_pos: 'Y', // 포스 유무
});

// 반영되는 순간순간 적용하기
const changeTabletStoreName = () => {
  if (isCombinedTradeNameAndBranchName.value) {
    addStoreData.platform_store_name = `${addStoreData.platform_origin_store_name}(${addStoreData.platform_area_name})`;
  }
};

watch(
  () => [
    addStoreData.platform_origin_store_name,
    addStoreData.platform_area_name,
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
      (posInfo: string) => addStoreData.platform_store_pos_info === posInfo,
    ) > -1;
  if (!isValidPosInfo) {
    callback(new Error('포스 정보를 확인해주세요.'));
    document.getElementById('store-manage-contents-pos-info')?.focus();
    return;
  }
  callback();
};

/** 매장 추가하기 */
const postAddNewStore = async () => {
  try {
    const config = {
      test_store_use: addStoreData.test_store_use,
      serial_number: addStoreData.serial_number,
      platform_store_pos_info: addStoreData.platform_store_pos_info,
      platform_store_code: addStoreData.platform_store_code,
      platform_origin_store_name: addStoreData.platform_origin_store_name,
      platform_area_name: addStoreData.platform_area_name,
      platform_store_name: addStoreData.platform_store_name,
      platform_store_id: addStoreData.platform_store_id,
      pw: addStoreData.pw,
      pw_re: addStoreData.pw_re,
      memo: addStoreData.memo,
      platform_store_has_middleware: addStoreData.platform_store_has_middleware, // 미들웨어 연동 여부
      platform_store_has_pos: addStoreData.platform_store_has_pos, // 포스 유무
      business_type: addStoreData.businessType,
    };
    const res = (await requestNewStoreCreateInPlatform(
      config,
    )) as AxiosResponse;

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

/** 미들웨어 N, 포스 N인 경우: 노포스로 고정 */
const isOnlyNoPos = ref(false);

// 미들웨어 Y인 경우: 포스 항상 O
watch(
  () => addStoreData.platform_store_has_middleware,
  () => {
    if (addStoreData.platform_store_has_middleware === 'Y') {
      addStoreData.platform_store_has_pos = 'Y';
    }
  },
);

watch(
  () => addStoreData.platform_store_has_pos,
  (newValue, oldValue) => {
    if (
      addStoreData.platform_store_has_middleware === 'N' &&
      addStoreData.platform_store_has_pos === 'N'
    ) {
      addStoreData.platform_store_pos_info = '노포스(자체포스)';
      isOnlyNoPos.value = true;
      return;
    }
    if (newValue === 'Y' && oldValue === 'N') {
      addStoreData.platform_store_pos_info = '';
      isOnlyNoPos.value = false;
      return;
    }

    isOnlyNoPos.value = false;
  },
);

/** 매장 코드 중복 검사 */
const postCheckDuplicateStoreCode = async () => {
  try {
    const adminId = { storeCode: addStoreData.platform_store_code };

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
        return;
      }

      ElMessage({
        type: 'error',
        message: '사용할 수 없는 매장 코드 입니다. 다시 시도해 주세요.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 태블릿 아이디 중복 검사 */
const postCheckDuplicateTabletId = async () => {
  try {
    const adminId = { platform_id: addStoreData.platform_store_id };

    if (adminId.platform_id === '') {
      ElMessage({
        type: 'error',
        message: '태블릿 로그인 아이디를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateTabletIdInPlatform(
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
          message: '사용 가능한 태블릿 로그인 아이디입니다.',
        });
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 사용중인 태블릿 로그인 아이디입니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Form Validation
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.validate((valid) => {
    if (valid) {
      postAddNewStore();
      return true;
    }

    return false;
  });
};

const ruleFormRef = ref<FormInstance>();

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
  platform_store_pos_info: [
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
  platform_store_code: [
    {
      required: true,
      message: '매장 코드를 입력해주세요.',
      trigger: 'blur',
    },
  ],
  platform_origin_store_name: [
    {
      required: true,
      message: '매장명을 입력해주세요.',
      trigger: 'blur',
    },
  ],
  platform_area_name: [
    {
      required: true,
      message: '지점명을 입력해주세요.',
      trigger: 'blur',
    },
  ],
  platform_store_name: [
    {
      required: true,
      message: '태블릿 노출 매장 이름을 입력해주세요.',
      trigger: 'blur',
    },
  ],
  platform_store_id: [
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

const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? posInformationList.value.filter(
        (posInfo) =>
          posInfo.toLowerCase().indexOf(queryString.toLowerCase()) === 0,
      )
    : posInformationList.value;

  cb(results);
};

const handleSelectPosInformation = (posInformation: string) => {
  addStoreData.platform_store_pos_info = posInformation;
};

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

const combineTradeNameAndBranchName = () => {
  if (isCombinedTradeNameAndBranchName.value) {
    addStoreData.platform_store_name = `${addStoreData.platform_origin_store_name}(${addStoreData.platform_area_name})`;
    return;
  }

  addStoreData.platform_store_name = '';
};

// 모달 내용부 높이
const getModalContentsHeight = () => {
  if (document.querySelector('.default_layout_container')?.clientHeight) {
    return `${(document.querySelector('.default_layout_container')?.clientHeight as number) * 0.7}px`;
  }
  return '700px';
};

getPosInformationList();
</script>

<template>
  <el-dialog
    v-model="flag.addStore"
    :align-center="true"
    title="신규 매장 등록"
    width="50%"
  >
    <el-scrollbar :height="getModalContentsHeight()">
      <el-form
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
            <el-form-item prop="test_store_use">
              <el-radio-group
                v-model="addStoreData.test_store_use"
                class="add-store-form-input width-100"
              >
                <el-radio label="N"> 운영</el-radio>
                <el-radio label="Y"> 테스트</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label-align="center">
            <template #label>
              <p>
                미들웨어 연동 여부
                <span class="essential-star"> * </span>
              </p>
            </template>
            <div class="add-store-form-id">
              <el-form-item>
                <el-radio-group
                  v-model="addStoreData.platform_store_has_middleware"
                >
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
              </el-form-item>
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
              <el-form-item>
                <el-radio-group v-model="addStoreData.platform_store_has_pos">
                  <el-radio
                    border
                    label="Y"
                  >
                    포스 유(有)
                  </el-radio>
                  <el-radio
                    :disabled="
                      addStoreData.platform_store_has_middleware === 'Y'
                    "
                    border
                    class="ml-10"
                    label="N"
                  >
                    포스 무(無)
                  </el-radio>
                </el-radio-group>
              </el-form-item>
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
                <el-form-item prop="platform_store_pos_info">
                  <el-autocomplete
                    id="store-manage-contents-pos-info"
                    v-model="addStoreData.platform_store_pos_info"
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
                <el-form-item prop="platform_store_code">
                  <el-input
                    v-model="addStoreData.platform_store_code"
                    clearable
                    input-width="100%"
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
                <el-form-item prop="platform_origin_store_name">
                  <el-input
                    v-model="addStoreData.platform_origin_store_name"
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
                <el-form-item prop="platform_area_name">
                  <el-input
                    v-model="addStoreData.platform_area_name"
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
            <el-form-item prop="platform_store_name">
              <el-input
                v-model="addStoreData.platform_store_name"
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
                <el-form-item prop="platform_store_id">
                  <el-input
                    v-model="addStoreData.platform_store_id"
                    clearable
                    input-width="100%"
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
          @click="submitForm(ruleFormRef)"
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
}

:deep(.el-form-item) {
  margin-bottom: 5px;
}
</style>
