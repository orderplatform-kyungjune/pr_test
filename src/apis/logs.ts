import { ElMessageBox } from 'element-plus';
import { requestTabletLogListParamType } from '@interface/logs';
import endpoints from '@apis/endpoints';
import restApi from '@apis/axios/restApi';
import adminTokenApi from '@apis/axios/adminTokenApi';

export const requestTabletLogList = (data: requestTabletLogListParamType) => {
  const url = endpoints.logs.tablet_pos_log;

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

export const requestRedisOrderViewLogList = (
  data: requestTabletLogListParamType,
) => {
  const url = endpoints.logs.orderview_redis_log;

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

export const requestTodayRedisOrderViewLogList = (
  data: requestTabletLogListParamType,
) => {
  const url = endpoints.logs.orderview_today_redis_log;

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

export const requestOrderCartTestLogList = (
  data: requestTabletLogListParamType,
) => {
  const url = endpoints.logs.order_cart_test;

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

export const requestTabletOrderLogList = (
  data: requestTabletLogListParamType,
) => {
  const url = endpoints.logs.tablet_get_order_log;

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

// 선결제 테이블 정보 조회 api
const requestGetTabletListPaymentInfo = (storeCode: string) => {
  const url = `${endpoints.logs.getTabletList}?storeCode=${encodeURIComponent(storeCode)}`;

  return restApi
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

// 선결제 리메이크 앱 로그 조회
const requestTransactionAndroidLog = (data: requestTabletLogListParamType) => {
  const url = endpoints.logs.transaction_app_log;

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

// 선결제 리메이크 웹 로그 조회
const requestTransactionWebLog = (data: requestTabletLogListParamType) => {
  const url = endpoints.logs.transaction_web_log;

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

export default {
  requestTabletLogList,
  requestRedisOrderViewLogList,
  requestTodayRedisOrderViewLogList,
  requestOrderCartTestLogList,
  requestTabletOrderLogList,
  requestGetTabletListPaymentInfo,
  requestTransactionAndroidLog,
  requestTransactionWebLog,
};
