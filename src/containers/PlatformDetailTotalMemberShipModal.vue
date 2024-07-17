<script setup lang="ts">
import { ref, h, Ref, reactive } from 'vue';
import { ElMessageBox, ElMessage, FormInstance, FormRules } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication, formattingUtils } from '@utils';
import useModalStore from '@store/storeModal';
import {
  selectBoxType,
  departmentListDataType,
  totalMemberDetailInfoPlatformType,
} from '@interface/member';
import { PlatformUpdatePasswordModal } from '@containers';
import { DETAIL_TOTAL_MEMBERSHIP, UPDATE_PASSWORD } from '@common/string';
import { memberCodec } from '@codecs';
import { member, helper } from '@apis';

const props = defineProps<{
  requestTorderMemberListData: () => void;
}>();
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestTotalMemberUpdateInfoInPlatform,
  requestDepartmentList,
  requestAuthTotalList,
  requestStateList,
  requestTotalMemberUpdatePasswordInPlatform,
  requestTotalMemberDetailInfoInPlatform,
} = member;
const { requestCheckDuplicateAdminIdInPlatform } = helper;
const { flag, modalData, closeModal, openModal } = useModalStore();
const { failAuthenticationAlert } = authentication;
const { departmentListCodec, selectBoxListCodec, totalMemberDetailInfoCodec } =
  memberCodec;
const { formatPhoneNumber, parseOnlyNumber } = formattingUtils;

const ruleFormRef = ref<FormInstance>();

// form rule
const formRules = reactive<FormRules>({
  platform_member_name: [
    {
      required: true,
      message: '이름을 입력해주세요.',
      trigger: 'blur',
    },
    {
      min: 2,
      max: 10,
      message: '최소 2글자 이상이어야 합니다.',
      trigger: 'blur',
    },
  ],
  platform_member_Department: [
    {
      required: true,
      message: '부서를 선택해주세요.',
      trigger: 'change',
    },
  ],
  platform_id: [
    {
      required: true,
      message: '계정 ID를 입력해주세요.',
      trigger: 'blur',
    },
    {
      min: 2,
      max: 20,
      message: '최소 2글자 이상이어야 합니다.',
      trigger: 'blur',
    },
  ],
  platform_auth: [
    {
      required: true,
      message: '계정 권한을 선택해주세요.',
      trigger: 'change',
    },
  ],
});

// 기존 계정 ID (중복 체크)
const savedMemberId = ref('');

/** 어드민 회원 계정 상세 정보 데이터 */
const memberDetailInfo: Ref<totalMemberDetailInfoPlatformType> = ref(
  {} as totalMemberDetailInfoPlatformType,
);

/** 어드민 회원 계정 상세 정보 데이터 불러오기 */
const postMemberDetailInfo = async () => {
  const platform_id = modalData.detailTotalMemberShip;
  try {
    const res = (await requestTotalMemberDetailInfoInPlatform({
      platform_id,
    })) as AxiosResponse;
    const typeError = runtimeCheck(totalMemberDetailInfoCodec, res.data);

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
        memberDetailInfo.value = res.data.data;
        savedMemberId.value = JSON.parse(
          JSON.stringify(res.data.data.platform_id),
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 권한명 리스트 데이터 */
const authListData = ref<selectBoxType[]>([]);
/** 권한명 리스트 데이터 불러오기 */
const getAuthListData = async () => {
  try {
    const res = (await requestAuthTotalList()) as AxiosResponse;
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
        authListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 부서명 리스트 데이터 */
const departmentListData = ref<departmentListDataType[]>([]);
/** 부서명 리스트 데이터 불러오기 */
const getDepartmentListData = async () => {
  try {
    const res = (await requestDepartmentList()) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

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
        departmentListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 계정 상태 데이터 */
const stateListData = ref<selectBoxType[]>([]);
/** 계정 상태 데이터 불러오기 */
const getStateListData = async () => {
  try {
    const res = (await requestStateList()) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

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
        stateListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 어드민 회원 정보 변경 */
const postUpdateMemberShipInfo = async () => {
  const {
    no,
    platform_id,
    platform_member_state,
    platform_auth,
    platform_member_Department,
    platform_member_hp,
    platform_member_store_data,
    platform_member_name,
  } = memberDetailInfo.value;

  const requestData = {
    no,
    platform_id,
    platform_member_state,
    platform_auth,
    platform_member_Department,
    platform_member_hp,
    platform_store_code: platform_member_store_data,
    platform_member_name,
  };

  try {
    const res = (await requestTotalMemberUpdateInfoInPlatform(
      requestData,
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
      ElMessage({
        type: 'success',
        message: '정보가 수정되었습니다.',
      });
      props.requestTorderMemberListData();
      closeModal(DETAIL_TOTAL_MEMBERSHIP);
    }
  } catch (error) {
    console.log(error);
  }
};

/** 회원 정보 변경 벨리데이션 채크 로직 */
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      postUpdateMemberShipInfo();
      return true;
    }
    return false;
  });
};

// 아이디 중복 검사
const postCheckDuplicateId = async () => {
  try {
    const adminId = { platform_id: memberDetailInfo.value.platform_id };
    if (adminId.platform_id === '') {
      ElMessage({
        type: 'error',
        message: '아이디를 입력해주세요.',
      });
      return;
    }
    const res = (await requestCheckDuplicateAdminIdInPlatform(
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
          message: '사용 가능한 아이디 입니다.',
        });
      } else {
        ElMessage({
          type: 'error',
          message: '사용할 수 없는 아이디 입니다. 다시 시도해 주세요.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비밀번호 초기화하기 */
const postResetPassword = async () => {
  const requestData = {
    platform_id: modalData.detailTotalMemberShip,
    type: 'reset',
  };

  try {
    const res = (await requestTotalMemberUpdatePasswordInPlatform(
      requestData,
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
      ElMessage({
        type: 'success',
        message: '비밀번호가 초기화 되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비밀번호 초기화 */
const resetPassword = () => {
  const resetInfoText = `비밀번호 초기화로 선택하면,
  비밀번호가 자동으로 [1234]으로 변경됩니다.
  초기화하시겠습니까?`;

  ElMessageBox.confirm('확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    message: h(
      'p',
      { style: 'white-space: break-spaces; text-align: center;' },
      resetInfoText,
    ),
    type: 'warning',
  })
    .then(() => {
      closeModal(DETAIL_TOTAL_MEMBERSHIP);
      postResetPassword();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소 되었습니다.',
      });
    });
};

// v-for 방어 코드
const getAuthDataKey = (auth: selectBoxType, index: number) => {
  if (!auth) return `auth${index}`;
  return auth.code;
};
const getDepartmentDataKey = (
  department: departmentListDataType,
  index: number,
) => {
  if (!department) return `department-${index}`;
  return department.code;
};
const getStateDataKey = (state: selectBoxType, index: number) => {
  if (!state) return `state-${index}`;
  return state.code;
};

postMemberDetailInfo();
getAuthListData();
getDepartmentListData();
getStateListData();
</script>

<template>
  <el-dialog
    v-model="flag.detailTotalMemberShip"
    width="70%"
    title="계정 정보"
  >
    <PlatformUpdatePasswordModal
      v-if="flag.updatePassword"
      :id="modalData.detailTotalMemberShip"
    />
    <el-form
      ref="ruleFormRef"
      :model="memberDetailInfo"
      :rules="formRules"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <template #label>
            <p>
              계정 상태
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-radio-group v-model="memberDetailInfo.platform_member_state">
            <el-radio
              v-for="(state, index) in stateListData"
              :key="getStateDataKey(state, index)"
              :label="state.code"
            >
              {{ state.name }}
            </el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <template #label>
            <p>
              권한
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_auth">
            <el-select
              v-model="memberDetailInfo.platform_auth"
              clearable
              placeholder="권한을 선택해주세요."
              class="width-100"
            >
              <el-option
                v-for="(auth, index) in authListData"
                :key="getAuthDataKey(auth, index)"
                :label="auth.name"
                :value="auth.code"
              />
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label="부서명"
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <template #label>
            <p>
              부서명
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_member_Department">
            <el-select
              v-model="memberDetailInfo.platform_member_Department"
              clearable
              filterable
              allow-create
              default-first-option
              placeholder="부서명을 선택하거나 입력을 통해서 추가할 수 있습니다."
              class="width-100"
            >
              <el-option
                v-for="(department, index) in departmentListData"
                :key="getDepartmentDataKey(department, index)"
                :label="department.name"
                :value="department.code"
              />
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <template #label>
            <p>
              계정 이름
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_member_name">
            <el-input
              v-model="memberDetailInfo.platform_member_name"
              placeholder="최대 입력 글자수 10자"
              maxlength="10"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label="연락처"
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <el-input
            v-model="memberDetailInfo.platform_member_hp"
            :formatter="formatPhoneNumber"
            :parser="parseOnlyNumber"
          />
        </el-descriptions-item>
        <el-descriptions-item
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <template #label>
            <p>
              계정 ID
              <span class="essential-star"> * </span>
            </p>
          </template>
          <div class="member-ship-password">
            <el-form-item
              prop="platform_id"
              class="width-100"
            >
              <el-input
                v-model="memberDetailInfo.platform_id"
                placeholder="최대 입력 글자수 20자"
                clearable
                maxlength="20"
                show-word-limit
                class="mr-10"
              />
            </el-form-item>
            <el-button
              type="primary"
              color="#000"
              :disabled="savedMemberId === memberDetailInfo.platform_id"
              @click="postCheckDuplicateId"
            >
              ID 중복 검사
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="PW"
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          <div class="member-ship-password">
            <el-button
              color="#000"
              class="width-100"
              @click="openModal(UPDATE_PASSWORD)"
            >
              비밀번호 변경
            </el-button>
            <el-button
              color="#000"
              class="width-100"
              @click="resetPassword"
            >
              비밀번호 초기화
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="계정 발급 일시"
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          {{ memberDetailInfo.platform_member_register_datetime }}
        </el-descriptions-item>
        <el-descriptions-item
          label="계정 발급자 ID"
          label-align="center"
          label-class-name="member-ship-label"
          class-name="member-ship-content"
        >
          {{ memberDetailInfo.platform_member_register_id }}
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <template #footer>
      <span>
        <el-button
          type="danger"
          @click="closeModal(DETAIL_TOTAL_MEMBERSHIP)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="submitForm(ruleFormRef)"
        >
          변경 사항 저장
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.member-ship-label) {
  width: 13%;
}

:deep(.member-ship-content) {
  width: 30%;
  vertical-align: middle;
}
.member-ship-password {
  display: flex;
}

:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 14%;
  vertical-align: middle;
}

.member-corporation-input {
  width: 33%;

  &:deep(.el-input__inner) {
    text-align: center;
  }
}
</style>
