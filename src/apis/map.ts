import { ElMessageBox } from 'element-plus';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 티오더 설치 매장 간이 정보 및 지도 좌표
export const requestTorderMapList = () => {
  const url = endpoints.map.xy_list;

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

export default { requestTorderMapList };
