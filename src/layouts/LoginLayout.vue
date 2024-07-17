<script lang="ts" setup>
import { h, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { isUPLUSAdmin } from '@utils/authentication';
import { authentication, routeHelper } from '@utils';
import useTagsStore from '@store/storeTags';
import useAuthStore from '@store/storeAuth';
import { singleStoreSetting } from '@router/routePaths';
import { LOGIN_ID, MASTER, SAVED_ID } from '@common/string';
import { SHOP_ADMIN_URL } from '@common/envVariables';
import { login } from '@apis';

const { pushPageWithQuery } = routeHelper;
const { requestAdminLogin } = login;
const { isUS_EastAdmin } = authentication;
const { addTagsData } = useTagsStore();
const {
  getOriginLnbData,
  setAuthLnbList,
  setAccessAuthPageList,
  setAccessFunctionList,
} = useAuthStore();

// 아이디 저장하기
const savedId = localStorage.getItem(SAVED_ID);
const isSaveId = ref(!!savedId);
const getSavedId = () => {
  if (savedId) {
    return savedId;
  }
  return '';
};

const id = ref(getSavedId());
const pw = ref('');

const deleteSaveId = (check: boolean) => {
  if (!check) {
    localStorage.removeItem(SAVED_ID);
  }
};

const getAdminLogin = async () => {
  try {
    const loginInfo = {
      id: id.value,
      password: pw.value,
    };

    const res = (await requestAdminLogin(loginInfo)) as AxiosResponse;
    if (res.data.code !== 200) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 200) {
      if (res.data.data.T_order_auth === '5') {
        const infoText = `점주 어드민 서비스가 오픈되었습니다.
        확인버튼을 누르시면 점주 어드민 페이지로 이동합니다.`;
        await ElMessageBox.alert('', '알림', {
          message: h(
            'p',
            { style: 'white-space: break-spaces; text-align: center;' },
            infoText,
          ),
          confirmButtonText: '확인',
          callback: () => {
            document.location.href = SHOP_ADMIN_URL;
          },
        });
        return;
      }

      if (isSaveId.value) {
        localStorage.setItem(SAVED_ID, id.value);
      }

      localStorage.setItem(LOGIN_ID, id.value);
      localStorage.setItem(
        MASTER,
        isUPLUSAdmin()
          ? res.data.data.platform_member_name
          : res.data.data.T_order_member_name,
      );

      setAuthLnbList(res.data.data.auth_lnb_menu);
      setAccessAuthPageList(res.data.data.auth_menu);
      setAccessFunctionList(res.data.data.auth_function);

      const queryData = {
        page: 1,
        pageSize: 20,
        searchType: '',
        searchTxt: '',
        searchStatArray: '',
        searchApiVersionArray: '',
        searchPaymentType: '',
        searchPosInfoArray: '',
        searchVanInfoArray: '',
        searchApkVersionArray: '',
        searchTestStoreYN: '',
        searchStartDate: '',
        searchEndDate: '',
        searchBusinessType: '',
      };
      pushPageWithQuery(singleStoreSetting, queryData);
      addTagsData(getOriginLnbData('S1001'));
    }
  } catch (error) {
    ElMessage.error('오류가 발생하였습니다.');
    console.log(error);
  }
};
</script>

<template>
  <div class="login-layout-container">
    <div class="login-logo-img-wrap">
      <img
        v-if="isUPLUSAdmin()"
        alt="Uplus 로고"
        class="login-logo-img"
        src="https://static.torder.co.kr/torder2/icon_lg_logo_color_admin.png"
      />
      <img
        v-else
        alt="티오더 로고"
        class="login-logo-img"
        src="@assets/torder_logo_color.svg"
      />
    </div>
    <span class="login-text">LOGIN</span>
    <el-input
      v-model="id"
      class="mb-10 login-input"
      placeholder="ID"
      size="large"
    />
    <form @submit.prevent="getAdminLogin">
      <el-input
        v-model="pw"
        class="login-input"
        placeholder="PW"
        size="large"
        type="password"
      />
    </form>
    <el-checkbox
      v-model="isSaveId"
      @change="deleteSaveId"
    >
      아이디 기억하기.
    </el-checkbox>
    <el-button
      class="login-bt mt-10"
      type="danger"
      @click="getAdminLogin"
    >
      로그인
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.login-layout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #fff;

  .login-layout-container-login-info {
    display: flex;
    flex-direction: column;
    width: 500px;
  }

  .login-input {
    width: 330px;
  }

  .login-logo-img-wrap {
    width: 250px;
    height: 150px;

    .login-logo-img {
      width: 100%;
      height: 100%;
    }
  }

  .login-text {
    margin-bottom: 40px;
    font-size: 30px;
    font-weight: bold;
    color: red;
  }

  .login-title {
    margin-bottom: 50px;
    font-size: 20px;
    font-weight: bold;
  }

  .login-bt {
    width: 330px;
    margin-bottom: 100px;
  }
}
</style>
