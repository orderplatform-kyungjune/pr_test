<script lang="ts" setup>
import { reactive, ref, Ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, formattingUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  authNumberListDataType,
  selectBoxType,
  totalMemberDataPlatformType,
} from '@interface/member';
import { ADD_MEMBER_SHIP } from '@common/string';
import { memberCodec } from '@codecs';
import { helper, member } from '@apis';

const props = defineProps<{
  postMemberList?: () => void;
}>();

const {
  requestDepartmentList,
  requestAuthList,
  requestTorderMemberCreateInPlatform,
} = member;
const { requestCheckDuplicateAdminIdInPlatform } = helper;
const { selectBoxListCodec } = memberCodec;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, getAdminBusinessInfo } = authentication;
const { formatPhoneNumber, parseOnlyNumber } = formattingUtils;
const { flag, closeModal } = useModalStore();

const totalMemberData = ref<totalMemberDataPlatformType>({
  platform_member_corporation: getAdminBusinessInfo().code,
  platform_member_corporation_name: getAdminBusinessInfo().name,
  platform_member_Department: '',
  platform_member_name: '',
  platform_id: '',
  platform_auth: '',
  platform_member_hp: '',
  pw: '',
  pw_re: '',
});

/** 부서명 리스트 */
const departmentListData: Ref<selectBoxType[]> = ref([]);
const getDepartmentListData = async () => {
  try {
    const res = (await requestDepartmentList()) as AxiosResponse;
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
        departmentListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 권한명 리스트 */
const authListData: Ref<authNumberListDataType> = ref(
  {} as authNumberListDataType,
);
const getAuthListData = async () => {
  try {
    const res = (await requestAuthList()) as AxiosResponse;

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
      authListData.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

// 아이디 중복 검사
const postCheckDuplicateId = async () => {
  try {
    const adminId = { platform_id: totalMemberData.value.platform_id };
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

// 아이디 등록
const postTorderMemberCreate = async () => {
  try {
    const requestData = totalMemberData.value;

    const res = (await requestTorderMemberCreateInPlatform(
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
        message: '회원이 정상적으로 등록되었습니다.',
      });
      closeModal(ADD_MEMBER_SHIP);
      if (props.postMemberList) {
        props.postMemberList();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmChange = () => {
  try {
    ElMessageBox.confirm('신규 회원을 등록하시겠습니까?', '경고', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    }).then(() => {
      postTorderMemberCreate();
    });
  } catch (error) {
    console.log(error);
  }
};

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      confirmChange();
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
  if (value === '') {
    callback(new Error('변경할 패스워드를 입력해주세요.'));
  } else if (value !== totalMemberData.value.pw) {
    callback(new Error('비밀번호가 일치하지 않습니다.'));
  } else {
    callback();
  }
};

const validatePass = (
  _: object,
  value: string,
  callback: (error?: Error) => string,
) => {
  if (value.length < 4 || value.length > 16) {
    callback(new Error('4자리 이상 16자 이하로 작성해주세요.'));
  }
  if (value === '') {
    callback(new Error('초기 비밀번호를 입력해주세요.'));
  } else {
    if (totalMemberData.value.pw !== '') {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField('pw', () => null);
    }
    callback();
  }
};

// form rule
const formRules = reactive({
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
  pw: [
    {
      validator: validatePass,
      trigger: 'blur',
    },
  ],
  pw_re: [
    {
      validator: validateRePass,
      trigger: 'change',
    },
  ],
});

// 법인 구분별 권한 번호
const filteredAuthNumber: Ref<selectBoxType[]> = ref([]);

watchEffect(() => {
  filteredAuthNumber.value =
    authListData.value[totalMemberData.value.platform_member_corporation];
});

// 방어 코드
const getDefenseCodeKey = (data: selectBoxType, index: number) => {
  if (!data) return `DefenseCode-${index}`;
  return data.code;
};

getDepartmentListData();
getAuthListData();
</script>

<template>
  <el-dialog
    v-model="flag.addMemberShip"
    :close-on-click-modal="false"
    align-center
    title="어드민 ID 등록"
    width="40%"
  >
    <el-form
      ref="ruleFormRef"
      :model="totalMemberData"
      :rules="formRules"
    >
      <el-descriptions
        :column="1"
        border
        class="member-ship-desc"
      >
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              부서
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_member_Department">
            <el-select
              v-model="totalMemberData.platform_member_Department"
              allow-create
              class="width-100"
              clearable
              default-first-option
              filterable
              placeholder="부서명을 선택하거나 입력을 통해서 추가할 수 있습니다."
            >
              <el-option
                v-for="(department, index) in departmentListData"
                :key="getDefenseCodeKey(department, index)"
                :label="department.name"
                :value="department.code"
              />
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              계정 이름
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_member_name">
            <el-input
              v-model="totalMemberData.platform_member_name"
              clearable
              maxlength="10"
              placeholder="최대 입력 글자수 10자"
              show-word-limit
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              계정 ID
              <span class="essential-star"> * </span>
            </p>
          </template>
          <div class="member-ship-ID">
            <div class="width-100">
              <el-form-item prop="platform_id">
                <el-input
                  v-model="totalMemberData.platform_id"
                  clearable
                  input-width="100%"
                  maxlength="20"
                  placeholder="최대 입력 글자수 20자"
                  show-word-limit
                />
              </el-form-item>
            </div>
            <div>
              <el-button
                type="primary"
                @click="postCheckDuplicateId"
              >
                ID 중복 검사
              </el-button>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              권한
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="platform_auth">
            <el-select
              v-model="totalMemberData.platform_auth"
              class="width-100"
              clearable
              placeholder="아이디의 권한을 선택해주세요."
            >
              <el-option
                v-for="(auth, index) in filteredAuthNumber"
                :key="getDefenseCodeKey(auth, index)"
                :label="auth.name"
                :value="auth.code"
              />
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label="연락처"
          label-align="center"
        >
          <el-form-item prop="platform_member_hp">
            <el-input
              v-model="totalMemberData.platform_member_hp"
              :formatter="formatPhoneNumber"
              :parser="parseOnlyNumber"
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              초기 비밀번호
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="pw">
            <el-input
              v-model="totalMemberData.pw"
              autocomplete="new-password"
              clearable
              show-password
              type="password"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label-align="center">
          <template #label>
            <p>
              비밀번호 확인
              <span class="essential-star"> * </span>
            </p>
          </template>
          <el-form-item prop="pw_re">
            <el-input
              v-model="totalMemberData.pw_re"
              autocomplete="new-password"
              clearable
              show-password
              type="password"
            />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ADD_MEMBER_SHIP)"
      >
        취소
      </el-button>
      <el-button
        type="primary"
        @click="submitForm(ruleFormRef)"
      >
        등록
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.member-ship-desc {
  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 27%;
    vertical-align: middle;
  }

  .member-ship-ID {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    justify-content: space-between;
  }
}
</style>
