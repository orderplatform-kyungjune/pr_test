<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { UPDATE_PASSWORD } from '@common/string';
import { member } from '@apis';

const { flag, closeModal } = useModalStore();
const { requestTotalMemberUpdatePassword } = member;
const { failAuthenticationAlert } = authentication;

const props = defineProps<{
  id: string;
}>();

const updatePasswordInfo = reactive({
  T_order_id: props.id,
  type: 'change',
  before_pw: '',
  pw: '',
  pw_re: '',
});

/** 계정 비밀번호 변경하기 */
const postUpdatePassword = async () => {
  if (updatePasswordInfo.pw !== updatePasswordInfo.pw_re) {
    ElMessage({
      type: 'error',
      message: '비밀번호가 일치하지 않습니다.',
    });
    return;
  }

  try {
    const res = (await requestTotalMemberUpdatePassword(
      updatePasswordInfo,
    )) as AxiosResponse;

    if (res.data.code === 4010) {
      await ElMessageBox.alert(
        '비밀번호 정책에 맞게 입력해주세요.\n영문(대, 소문자), 숫자, 특수문자의 조합으로 2개 이상 포함하여 최소 8자 이상 16자 이하로 사용해주세요.\n※ 사용할 수 있는 특수문자 :"#$%&\'()+,-.;<=>?@[]^_`{}~!',
        '실패',
        {
          confirmButtonText: '확인',
          type: 'error',
        },
      );
    }
    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 4010) {
      await ElMessageBox.alert(
        '비밀번호 정책에 맞게 입력해주세요.\n영문(대, 소문자), 숫자, 특수문자의 조합으로 2개 이상 포함하여 최소 8자 이상 16자 이하로 사용해주세요.\n※ 사용할 수 있는 특수문자 :"#$%&\'()+,-.;<=>?@[]^_`{}~!',
        '실패',
        {
          confirmButtonText: '확인',
          type: 'error',
        },
      );
    }
    if (res.data.code === 200) {
      ElMessage({
        type: 'success',
        message: '비밀번호가 정상적으로 변경되었습니다.',
      });
      closeModal(UPDATE_PASSWORD);
    }
  } catch (error) {
    console.log(error);
  }
};

const ruleFormRef = ref<FormInstance>();

const validateRePass = (
  _: object,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value === '') {
    callback(new Error('변경할 패스워드를 입력해주세요.'));
  } else if (value !== updatePasswordInfo.pw) {
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
    if (updatePasswordInfo.pw !== '') {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField('pw', () => null);
    }
    callback();
  }
};

// form rule
const formRules = reactive({
  before_pw: [
    {
      required: true,
      message: '현재 비밀번호를 입력해주세요.',
      trigger: 'blur',
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

/** 비밀번호 변경 벨리데이션 채크 로직 */
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      postUpdatePassword();
      return true;
    }
    return false;
  });
};
</script>

<template>
  <el-dialog
    v-model="flag.updatePassword"
    width="30%"
    title="알림"
  >
    <el-row
      justify="center"
      class="mb-30"
    >
      <span class="update-password-info"> 비밀번호를 변경해주세요. </span>
    </el-row>
    <el-form
      ref="ruleFormRef"
      :model="updatePasswordInfo"
      :rules="formRules"
    >
      <el-descriptions
        :column="1"
        border
      >
        <el-descriptions-item
          label-align="center"
          align="center"
          label-class-name="update-password-label"
        >
          <template #label>
            <span> 현재 비밀번호 </span>
            <span class="essential-star"> * </span>
          </template>
          <el-form-item prop="before_pw">
            <el-input
              v-model="updatePasswordInfo.before_pw"
              type="password"
              show-password
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label-align="center"
          align="center"
          label-class-name="update-password-label"
        >
          <template #label>
            <span> 새비밀번호 </span>
            <span class="essential-star"> * </span>
          </template>
          <el-form-item prop="pw">
            <el-input
              v-model="updatePasswordInfo.pw"
              type="password"
              show-password
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item
          label-align="center"
          align="center"
          label-class-name="update-password-label"
        >
          <template #label>
            <span> 새비밀번호 확인 </span>
            <span class="essential-star"> * </span>
          </template>
          <el-form-item prop="pw_re">
            <el-input
              v-model="updatePasswordInfo.pw_re"
              type="password"
              show-password
            />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <template #footer>
      <span>
        <el-button
          type="danger"
          @click="closeModal(UPDATE_PASSWORD)"
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
.update-password-info {
  font-size: 16px;
  font-weight: bold;
}

:deep(.update-password-label) {
  width: 35%;
}
</style>
