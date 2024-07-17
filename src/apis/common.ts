import { ElMessageBox } from 'element-plus';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

const requestPosInitDate = (storeCode: string) => {
  const url = `${endpoints.common.pos_init_date}?storeCode=${encodeURIComponent(storeCode)}`;

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

export default requestPosInitDate;
