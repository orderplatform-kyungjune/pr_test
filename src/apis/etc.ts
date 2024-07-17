import { ElMessageBox } from 'element-plus';
import { authInfoType } from '@interface/etc';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 페이지 이동 시 토큰 및 상태 검사 API */
const requestHealthCheck = (authInfo: authInfoType) => {
  const url = endpoints.etc.health_check;
  return adminTokenApi
    .post(url, authInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 실험실 리스트 */
const requestLaboratoryList = () => {
  const url = endpoints.etc.laboratory.list;

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

export default {
  requestHealthCheck,
  requestLaboratoryList,
};
