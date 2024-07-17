import { ElMessageBox } from 'element-plus';
import { requestLoginParameterType } from '@interface/login';
import endpoints from '@apis/endpoints';
import adminApi from '@apis/axios/adminApi';

// 티오더 매장 리스트
export const requestAdminLogin = (loginInfo: requestLoginParameterType) => {
  const url = endpoints.users.login;

  return adminApi
    .post(url, loginInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default { requestAdminLogin };
