import { ElMessageBox } from 'element-plus';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 권한 리스트 가져오기
export const requestTorderAuthList = () => {
  const url = endpoints.auth.torder_auth_list;
  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 권한 설정 상세 정보
export const requestTorderAuthInfo = (code: string) => {
  const url = endpoints.auth.torder_auth_info;
  const requestData = { T_order_MGroup_code: code };
  return adminTokenApi
    .post(url, requestData, { validateStatus: (status) => status < 500 })
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
  requestTorderAuthList,
  requestTorderAuthInfo,
};
