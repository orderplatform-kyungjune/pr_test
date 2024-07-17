import { ElMessageBox } from 'element-plus';
import {
  requestWaitingStoreEditType,
  requestWaitingStoreEnrollType,
} from '@interface/waitingService';
import endpoints from '@apis/endpoints';
import waitingApi from '@apis/axios/waitingApi';

// 대기표 매장 리스트
export const requestWaitingStoreList = () => {
  const url = endpoints.waiting.store;
  return waitingApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 대기표 매장 등록
export const requestWaitingStoreEnroll = (
  storeInfo: requestWaitingStoreEnrollType,
) => {
  const url = endpoints.waiting.auth.signUp;
  return waitingApi
    .post(url, storeInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 대기표 매장 상세 정보
export const requestWaitingStoreConfig = (storeId: string) => {
  const url = `${endpoints.waiting.config.admin}/${storeId}`;
  return waitingApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 대기표 매장 상세 정보 수정
export const requestWaitingStoreConfigEdit = (
  storeInfo: requestWaitingStoreEditType,
) => {
  const url = endpoints.waiting.config.admin;
  return waitingApi
    .patch(url, storeInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestWaitingStoreList,
  requestWaitingStoreEnroll,
  requestWaitingStoreConfig,
  requestWaitingStoreConfigEdit,
};
