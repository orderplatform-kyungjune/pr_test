import { ElMessageBox } from 'element-plus';
import {
  duplicateIdCheckPlatformType,
  duplicateIdCheckType,
  duplicateMiddleWareCodeCheckType,
  duplicateSerialNumberCheckType,
  duplicateStoreCodeCheckType,
} from '@interface/helper';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 어드민 ID 중복 검사
const requestCheckDuplicateAdminId = (requestData: duplicateIdCheckType) => {
  const url = endpoints.helper.get_member_id_exists;

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

const requestCheckDuplicateAdminIdInPlatform = (
  requestData: duplicateIdCheckPlatformType,
) => {
  const url = endpoints.helper.get_member_id_exists;

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

// 태블릿(티오더)ID 로그인 아이디 중복 검사
const requestCheckDuplicateTabletId = (requestData: duplicateIdCheckType) => {
  const url = endpoints.helper.get_tablet_id_exists;

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

const requestCheckDuplicateTabletIdInPlatform = (
  requestData: duplicateIdCheckPlatformType,
) => {
  const url = endpoints.helper.get_tablet_id_exists;

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

// 매장 코드 중복 검사
const requestCheckDuplicateStoreCode = (
  requestData: duplicateStoreCodeCheckType,
) => {
  const url = endpoints.helper.get_store_code_exists;

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

// 일련번호 중복 검사
const requestCheckDuplicateSerialNumber = (
  serial: duplicateSerialNumberCheckType,
) => {
  const url = endpoints.helper.get_store_serial_number_exists;

  return adminTokenApi
    .post(url, serial, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 포스 미들웨어 코드 중복 검사
const requestCheckDuplicateMiddleWareCode = (
  serial: duplicateMiddleWareCodeCheckType,
) => {
  const url = endpoints.helper.get_posMiddleWareCode_exists;

  return adminTokenApi
    .post(url, serial, { validateStatus: (status) => status < 500 })
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
  requestCheckDuplicateAdminId,
  requestCheckDuplicateTabletId,
  requestCheckDuplicateStoreCode,
  requestCheckDuplicateSerialNumber,
  requestCheckDuplicateMiddleWareCode,
  requestCheckDuplicateTabletIdInPlatform,
  requestCheckDuplicateAdminIdInPlatform,
};
