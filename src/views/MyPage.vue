<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import { userInfoType } from '@interface/user';
import { DevelopLaboratory } from '@containers';
import { LOGIN_ID } from '@common/string';
import { usersCodec } from '@codecs';
import logo from '@assets/torder_logo_color.svg';
import { user } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;

const { failAuthenticationAlert, authorityCheck, checkAuthFunction } =
  authentication;

const { requestUserInfo, updateUserInfo } = user;

const { userInfoCodec } = usersCodec;

const authority = ref<string>('');
const userInfo = reactive<userInfoType>({} as userInfoType);
const ruleFormRef = ref<FormInstance>();

const resetForm = () => {
  userInfo.T_order_pwd = '';
  userInfo.T_order_re_pwd = '';
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
    callback(new Error('변경할 패스워드를 입력해주세요.'));
  } else {
    if (userInfo.T_order_pwd !== '') {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField('T_order_re_pwd', () => null);
    }
    callback();
  }
};

const validateRePass = (
  _: object,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value === '') {
    callback(new Error('변경할 패스워드를 입력해주세요.'));
  } else if (value !== userInfo.T_order_pwd) {
    callback(new Error('비밀번호가 일치하지 않습니다.'));
  } else {
    callback();
  }
};

const rules = reactive({
  T_order_pwd: [
    {
      validator: validatePass,
      trigger: 'blur',
    },
  ],
  T_order_re_pwd: [
    {
      validator: validateRePass,
      trigger: 'blur',
    },
  ],
});

const getUserInfo = async () => {
  try {
    const id = localStorage.getItem(LOGIN_ID) ?? 'none';
    const userId = { id };
    const res = (await requestUserInfo(userId)) as AxiosResponse;
    const typeError = runtimeCheck(userInfoCodec, res.data);

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
        if (authorityCheck() === '10') {
          authority.value = '최고 관리자';
        }
        if (authorityCheck() === '9') {
          authority.value = '티오더 관리자';
        }
        if (authorityCheck() === '8') {
          authority.value = 'cs팀';
        }
        userInfo.T_order_id = res.data.data.T_order_id;
        userInfo.T_order_no = res.data.data.T_order_no;
        userInfo.T_order_member_code = res.data.data.T_order_member_code;
        userInfo.T_order_member_name = res.data.data.T_order_member_name;
        userInfo.T_order_member_Department =
          res.data.data.T_order_member_Department;
        userInfo.T_order_auth = res.data.data.T_order_auth;
        userInfo.T_order_member_hp = res.data.data.T_order_member_hp;
        userInfo.T_order_member_hp1 = res.data.data.T_order_member_hp1;
        userInfo.T_order_member_hp2 = res.data.data.T_order_member_hp2;
        userInfo.T_order_pwd = '';
        userInfo.T_order_re_pwd = '';
      }
    }
  } catch (error) {
    console.log(error);
  }
};
getUserInfo();

const updateUserInfos = async () => {
  try {
    const res = (await updateUserInfo(userInfo)) as AxiosResponse;

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
        message: '정상적으로 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmChange = () => {
  try {
    ElMessageBox.confirm('회원 정보를 수정하시겠습니까?', '경고', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    }).then(() => {
      updateUserInfos();
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
</script>

<template>
  <el-row class="my-page-wrapper">
    <div class="my-page-container">
      <div class="admin-info">
        <div class="admin-avatar">
          <el-image
            :src="logo"
            fit="contain"
            class="avatar"
          />
        </div>
        <div class="admin-info-base">
          <div class="admin-nick-name">
            {{ userInfo.T_order_member_name }}
          </div>
          <div class="admin-other">
            <div>
              {{ authority }}
            </div>
          </div>
        </div>
        <div class="admin-info-form">
          <el-form
            ref="ruleFormRef"
            :model="userInfo"
            :rules="rules"
            label-position="top"
            status-icon
          >
            <el-form-item label="아이디">
              <el-input
                :placeholder="
                  userInfo.T_order_id ?? '회원 정보를 불러오지 못하였습니다.'
                "
                disabled
              />
            </el-form-item>
            <el-form-item label="휴대번호">
              <el-input
                :placeholder="
                  userInfo.T_order_member_hp ??
                  '회원 정보를 불러오지 못하였습니다.'
                "
                disabled
              />
            </el-form-item>
            <el-form-item
              label="비밀번호"
              prop="T_order_pwd"
            >
              <el-input
                v-model="userInfo.T_order_pwd"
                type="password"
              />
            </el-form-item>
            <el-form-item
              label="비밀번호 확인"
              prop="T_order_re_pwd"
            >
              <el-input
                v-model="userInfo.T_order_re_pwd"
                type="password"
              />
            </el-form-item>
            <el-form-item>
              <div class="info-button-wrapper">
                <el-button
                  type="danger"
                  @click="resetForm"
                >
                  취소
                </el-button>
                <el-button
                  type="primary"
                  @click="submitForm(ruleFormRef)"
                >
                  변경하기
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <DevelopLaboratory
      v-if="checkAuthFunction('F6001')"
      class="flex-1"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.my-page-wrapper {
  display: flex;
  flex-wrap: nowrap;
  gap: 30px;
  justify-content: center;
  padding: 10px;

  .my-page-container {
    width: 42%;
    .admin-info {
      border-top: 3px solid #409eff;
      border-radius: 4px;

      .admin-avatar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 110px;
        height: 110px;
        margin: 60px auto 10px;
        overflow: hidden;
        pointer-events: none;
        cursor: pointer;
        border: 1px solid #dcdfe6;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);

        .avatar {
          display: block;
          width: 110px;
          height: 110px;
        }
      }

      .admin-info-base {
        .admin-nick-name {
          padding: 8px 0;
          font-size: 22px;
          color: black;
          text-align: center;
        }

        .admin-other {
          font-size: 14px;
          line-height: 20px;
          color: black;
          text-align: center;
        }
      }

      .admin-info-form {
        padding: 30px;

        .info-button-wrapper {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }
      }
    }
  }
}
</style>
