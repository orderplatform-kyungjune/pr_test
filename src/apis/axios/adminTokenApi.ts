import { ElMessageBox } from 'element-plus';
import axios from 'axios';
import { cookieUtils, routeHelper } from '@utils/index';
import { clearApplication } from '@utils/authentication';
import useTagsStore from '@store/storeTags';
import { login } from '@router/routePaths';
import { ACCESS_TOKEN } from '@common/string';
import { ADMIN_API_URL } from '@common/envVariables';

const adminTokenApi = axios.create({
  baseURL: ADMIN_API_URL,
  withCredentials: true,
});

adminTokenApi.interceptors.request.use((config) => {
  const accessToken = cookieUtils.getCookie(ACCESS_TOKEN);

  if (!!accessToken && config.headers) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  return config;
});

adminTokenApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // token 인증 오류(Unauthorized)로인한 로그아웃 처리
    if (error.response.status === 401) {
      clearApplication();
      useTagsStore().resetCacheData();

      ElMessageBox.alert('로그인을 해주세요.', '인증 오류', {
        type: 'warning',
        callback: () => {
          routeHelper.pushPage(login);
        },
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default adminTokenApi;
