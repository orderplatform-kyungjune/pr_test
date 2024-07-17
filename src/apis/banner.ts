import { ElMessageBox } from 'element-plus';
import {
  requestBannerListParameterType,
  requestCreateBannerType,
  requestDeleteBannerType,
  requestUpdateBannerPlatformType,
  requestUpdateBannerType,
} from '@interface/banner';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 배너 리스트 */
export const requestBannerList = (data: requestBannerListParameterType) => {
  const url = endpoints.banner.list;

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

/** 배너 등록 */
export const requestCreateBanner = (data: requestCreateBannerType) => {
  const url = endpoints.banner.create;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_store_banner_name', data.bannerTitle);
  fd.append('banner_file', data.bannerFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestCreateBannerInPlatform = (
  data: requestCreateBannerType,
) => {
  const url = endpoints.banner.create;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('platform_store_banner_name', data.bannerTitle);
  fd.append('banner_file', data.bannerFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 배너 수정 */
export const requestUpdateBanner = (data: requestUpdateBannerType) => {
  const url = endpoints.banner.update;

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

export const requestUpdateBannerInPlatform = (
  data: requestUpdateBannerPlatformType,
) => {
  const url = endpoints.banner.update;

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

/** 배너 삭제 */
export const requestDeleteBanner = (data: requestDeleteBannerType) => {
  const url = endpoints.banner.delete;

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
  requestBannerList,
  requestCreateBanner,
  requestUpdateBanner,
  requestDeleteBanner,
  requestUpdateBannerInPlatform,
  requestCreateBannerInPlatform,
};
