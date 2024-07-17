import { ElMessageBox } from 'element-plus';
import {
  fcmDeviceHistoryPayloadType,
  fcmDeviceListInfoPayloadType,
  pendingPayListPayloadType,
  sendFCMLogPayloadType,
} from '@interface/credit';
import endpoints from '@apis/endpoints';
import paymentApi from '@apis/axios/paymentApi';

const requestTabletStatus = (storeCode: string) => {
  const url = `${endpoints.credit.tablet.status}?storeCode=${encodeURIComponent(storeCode)}`;
  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.get(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

const requestPendingList = (data: pendingPayListPayloadType) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.credit.pends}?storeCode=${encodeURIComponent(data.storeCode)}&tabletNumber=${data.tabletNumber}&startDatetime=${data.startDatetime}&endDatetime=${data.endDatetime}&page=${data.page}&size=${data.size}`;
  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.get(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

const requestFCMSendLog = (payload: sendFCMLogPayloadType) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.credit.fcm.send.log}?size=${payload.size}&page=${payload.page}&storeCode=${encodeURIComponent(payload.storeCode)}&tabletCode=${payload.tabletCode}&ssaid=${payload.ssaid}&sendErrorCode=${payload.sendErrorCode}&sendSuccess=${payload.sendSuccess}&receiveSuccess=${payload.receiveSuccess}&sendDate=${payload.sendDate}&orderKey=${payload.orderKey}`;
  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.get(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

const requestFCMDeviceListInfo = (payload: fcmDeviceListInfoPayloadType) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.credit.fcm.devices}?page=${payload.page}&size=${payload.size}&storeCode=${encodeURIComponent(payload.storeCode)}&tabletCode=${payload.tabletCode}&ssaid=${payload.ssaid}&ipAddr=${payload.ipAddr}&fcmToken=${payload.fcmToken}`;
  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.get(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

const requestFCMDeviceChangeHistory = (
  payload: fcmDeviceHistoryPayloadType,
) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.credit.fcm.device.logs}?page=${payload.page}&size=${payload.size}&storeCode=${encodeURIComponent(payload.storeCode)}&tabletCode=${payload.tabletCode}&ssaid=${payload.ssaid}&ipAddr=${payload.ipAddr}`;
  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.get(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

const requestDeleteDevice = (ssaid: string) => {
  const url = `${endpoints.credit.fcm.device.device}/${ssaid}`;

  const auth = {
    auth: {
      username: 'torder-credit-api',
      password: 'xldhejtjsrufwp123!',
    },
  };

  return paymentApi.delete(url, auth).catch((error) => {
    if (
      error.response.data.resultCode === 400 ||
      error.response.data.resultCode === 500
    ) {
      ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};
export default {
  requestTabletStatus,
  requestPendingList,
  requestFCMSendLog,
  requestFCMDeviceListInfo,
  requestFCMDeviceChangeHistory,
  requestDeleteDevice,
};
