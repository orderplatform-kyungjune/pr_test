import { ElMessageBox } from 'element-plus';
import { setAxiosApi } from '@utils/apiUtil';
import {
  getTableInfoParamType,
  tableCreateParamsType,
  tableCreateAllParamsType,
  paymentInfoType,
  postApkUpdateParamsType,
  tabletRefreshParamsType,
  PostAppForceUpdateType,
} from '@interface/table';
import endpoints from '@apis/endpoints';
import restApi from '@apis/axios/restApi';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 테이블 리스트 조회 */
export const requestTabletList = (storeCode: string) => {
  const url = `${endpoints.tablet.list}?storeCode=${encodeURIComponent(storeCode)}`;

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

/** apk 리스트 조회 */
export const requestApkList = () => {
  const url = endpoints.tablet.apk_list;

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

/** 태블릿에 테이블 등록(노출) */
export const requestTabletCreate = (data: tableCreateParamsType) => {
  const url = endpoints.tablet.create;

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

/** 태블릿에 테이블 일괄 등록(노출) */
export const requestTabletCreateAll = (data: tableCreateAllParamsType) => {
  const url = endpoints.tablet.create_all;

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

/** 태블릿에 테이블 등록해제(미노출) */
export const requestTabletDelete = (data: getTableInfoParamType) => {
  const url = endpoints.tablet.delete;

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

/** 단일 테이블 결제 설정 정보 불러오기 */
export const requestLoadSingleTableInfo = (data: getTableInfoParamType) => {
  const url = `${endpoints.tablet.payment_info}?storeCode=${encodeURIComponent(data.storeCode)}&Ta_Id=${data.Ta_Id}`;

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

/** 단일 테이블 결제 설정 업데이트 */
export const requestUpdateSingleTableInfo = (
  data: paymentInfoType & getTableInfoParamType,
) => {
  const url = endpoints.tablet.payment_update;

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

/** 다중 테이블 결제 설정 업데이트 */
export const requestUpdateMultiTableInfo = (
  data: paymentInfoType & getTableInfoParamType,
) => {
  const url = endpoints.tablet.payment_update_all;

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

/** 테이블 결제 설정 -> 벤사 리스트 조회 */
export const requestLoadVanTypeList = () => {
  const url = endpoints.tablet.van_type;

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

/** apk 업데이트 요청 */
export const requestApkUpdate = (data: postApkUpdateParamsType) => {
  const url = endpoints.tablet.apk_update;

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

/**
 * 티오더 태블릿 app 원격 자동 업데이트 요청 (apk.1.8.0 버전부터 가능)
 * @param data api 요청 body
 */
export const requestPostAppForceUpdate = (data: PostAppForceUpdateType) =>
  setAxiosApi<{ result: boolean; code: number }>({
    instance: adminTokenApi,
    config: {
      method: 'POST',
      url: endpoints.tablet.force_update,
      data,
    },
  });

/** 선택 매장 전체 태블릿 새로고침 */
export const requestTabletRefresh = (data: tabletRefreshParamsType) => {
  const url = endpoints.tablet.full_refresh;

  return adminTokenApi.post(url, data, {
    validateStatus: (status) => status < 500,
    onDownloadProgress: (progressEvent) => {
      const estimateTimeMessageTag = document.querySelector('.estimate-time');
      const tabletResetCountMessageTag =
        document.querySelector('.tablet-count');
      const messageBox = document.querySelector('.progress-text-wrapper');
      const message = progressEvent.event.target.responseText.split('|');

      if (messageBox && tabletResetCountMessageTag) {
        messageBox.textContent = '';
      }

      message.forEach((item: string) => {
        const isTableCountInfo = () => item === message[0];
        const isEstimateInfo = () =>
          item.includes('태블릿 초기화 예상 완료 시간');
        const isFinishInfo = () => item.includes('태블릿 초기화 끝');

        if (tabletResetCountMessageTag && isTableCountInfo()) {
          tabletResetCountMessageTag.textContent = '';
          tabletResetCountMessageTag.textContent = item;
          return;
        }

        if (estimateTimeMessageTag && isEstimateInfo()) {
          estimateTimeMessageTag.textContent = '';
          estimateTimeMessageTag.textContent = item;
          return;
        }

        if (
          messageBox &&
          !isTableCountInfo() &&
          !isEstimateInfo() &&
          !isFinishInfo()
        ) {
          const progressResetRefresh = item.includes(' ');

          if (!item) return;

          if (!progressResetRefresh) return;

          const tableNumberStartIndex = item.indexOf('-') + 1;
          const resetTimeStartIndex = item.lastIndexOf('-');
          const tableNumber = item.substring(
            tableNumberStartIndex,
            resetTimeStartIndex,
          );
          const progressTextIndex = item.lastIndexOf('태블릿에');
          const resetTime = item.substring(
            resetTimeStartIndex + 1,
            progressTextIndex,
          );
          const liTag = document.createElement('li');

          messageBox.appendChild(liTag);
          liTag.textContent = `${tableNumber} 테이블 | 태블릿 초기화 시간 ${resetTime}`;

          const scrollbarWrapper = document.querySelector(
            '.refresh-tablet-information .el-scrollbar__wrap',
          );

          if (scrollbarWrapper) {
            scrollbarWrapper.scrollTop = scrollbarWrapper.scrollHeight;
          }
        }
      });
    },
  });
};

/** 태블릿 정보 조회 */
const requestTabletInfoList = (storeCode: string) => {
  const url = `${endpoints.tablet_api.device_usage}?storeCode=${encodeURIComponent(storeCode)}`;

  return restApi.get(url).catch((error) => {
    if (error.response.status === 400 || error.response.status === 500) {
      ElMessageBox.alert(error.response.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

export default {
  requestTabletList,
  requestTabletCreate,
  requestTabletCreateAll,
  requestTabletDelete,
  requestLoadSingleTableInfo,
  requestUpdateSingleTableInfo,
  requestUpdateMultiTableInfo,
  requestLoadVanTypeList,
  requestApkList,
  requestApkUpdate,
  requestTabletRefresh,
  requestTabletInfoList,
};
