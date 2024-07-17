import axios from 'axios';
import { cookieUtils } from '@utils/index';
import { ACCESS_TOKEN } from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';

const gatewayTokenApi = axios.create({
  baseURL: GATE_WAY_API_URL,
  withCredentials: true,
});

gatewayTokenApi.interceptors.request.use((config) => {
  const accessToken = cookieUtils.getCookie(ACCESS_TOKEN);

  if (!!accessToken && config.headers) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  return config;
});

export default gatewayTokenApi;
