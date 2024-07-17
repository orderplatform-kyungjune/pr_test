import { ElMessageBox } from 'element-plus';
import {
  userInfoType,
  businessUserInfo,
  userInfoPlatformType,
  requestUserInfoParameterType,
} from '@interface/user';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 현재 로그인 계정의 정보 불러오기
export const requestUserInfo = (data: requestUserInfoParameterType) => {
  const url = endpoints.users.info;
  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 회원 정보 수정
export const updateUserInfo = (userInfo: userInfoType) => {
  const url = endpoints.users.update;
  return adminTokenApi
    .post(url, userInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const updateUserInfoInPlatform = (userInfo: userInfoPlatformType) => {
  const url = endpoints.users.update;
  return adminTokenApi
    .post(url, userInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestLoginBusinessMember = (userInfo: businessUserInfo) => {
  const url = endpoints.users.manager_login;
  return adminTokenApi
    .post(url, userInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestUserInfo,
  updateUserInfo,
  requestLoginBusinessMember,
  updateUserInfoInPlatform,
};
