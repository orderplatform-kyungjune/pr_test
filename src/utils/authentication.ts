import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { cookieUtils, routeHelper } from '@utils';
import useTagsStore from '@store/storeTags';
import useAuthStore from '@store/storeAuth';
import { login } from '@router/routePaths';
import {
  ACCESS_TOKEN,
  LOGIN_ID,
  MASTER,
  STORE_INFO,
  USER_AUTHORITY,
  USER_AUTHORITY_UPLUS,
} from '@common/string';
import { BUSINESS_NAME, SERVICE_TARGET } from '@common/envVariables';
import { etc } from '@apis';

const { requestHealthCheck } = etc;

const { pushPage } = routeHelper;

/** 로컬스토리지 및 쿠키 제거 함수 */
export const clearApplication = () => {
  const { resetAuthData } = useAuthStore();

  cookieUtils.delCookie(ACCESS_TOKEN);
  cookieUtils.delCookie(USER_AUTHORITY);
  cookieUtils.delCookie(USER_AUTHORITY_UPLUS);
  localStorage.removeItem(MASTER);
  localStorage.removeItem(STORE_INFO);
  localStorage.removeItem(LOGIN_ID);
  resetAuthData();
};

export const failAuthenticationAlert = (optionalPushLogin?: boolean) => {
  const { resetCacheData } = useTagsStore();

  ElMessageBox.alert('로그인을 해주세요.', '인증 오류', {
    confirmButtonText: '확인',
    type: 'warning',
    callback: () => {
      // flag가 넘어오면 clearApplication만 실행
      clearApplication();
      resetCacheData();
      // 매개변수가 없으면 로그인 페이지로 이동
      if (!optionalPushLogin) {
        pushPage(login);
      }
    },
  });
};

// 쿠키 인증 확인
export const cookieCheck = async () => {
  const accessToken = cookieUtils.getCookie(ACCESS_TOKEN);

  if (accessToken === '') {
    failAuthenticationAlert();
  }
};

/** 페이지 이동 시 토큰 및 상태 검사 API */
export const postHealthCheck: () => Promise<boolean> = async () => {
  const authInfo = {
    type: 'jwt',
    value: cookieUtils.getCookie(ACCESS_TOKEN),
  };
  const res = (await requestHealthCheck(authInfo)) as AxiosResponse;
  return res?.data.result;
};

// 유저 권한 확인
export const authorityCheck = () => cookieUtils.getCookie(USER_AUTHORITY);

// 권한 확인
const master = ['10', '1004'];
// const torder = ['9'];
// const business = ['8'];
// const uplus = ['2100', '2900'];
// const brand1 = ['3100', '3900'];

export const isMasterCheck = () => master.includes(authorityCheck());

/** 기능별 권한 확인 */
const checkAuthFunction = (id: string) => {
  const { accessAuthFunctionData } = useAuthStore();
  return accessAuthFunctionData?.includes(id);
};

/** env flag */
export const isUS_EastAdmin = () => SERVICE_TARGET === 'us_east';
export const isSgAdmin = () => SERVICE_TARGET === 'sg';
export const isSydneyAdmin = () => SERVICE_TARGET === 'sydney';
export const isGlobalAdmin = () =>
  isUS_EastAdmin() || isSgAdmin() || isSydneyAdmin();
export const isOriginAdmin = () => SERVICE_TARGET === 'origin';
export const isUPLUSAdmin = () => SERVICE_TARGET === 'uplus';
export const isBrand1Admin = () => SERVICE_TARGET === 'brand1';
export const isPartnersAdmin = () => SERVICE_TARGET === 'partners';

export const getAdminBusinessInfo = (): { code: string, name: string } => {
  if (isOriginAdmin() || isGlobalAdmin()) return { code: 'torder', name: BUSINESS_NAME };
  return { code: SERVICE_TARGET, name: BUSINESS_NAME };
};

export default {
  cookieCheck,
  failAuthenticationAlert,
  authorityCheck,
  isMasterCheck,
  postHealthCheck,
  clearApplication,
  checkAuthFunction,
  isGlobalAdmin,
  isUS_EastAdmin,
  isSgAdmin,
  isSydneyAdmin,
  isUPLUSAdmin,
  isOriginAdmin,
  isBrand1Admin,
  isPartnersAdmin,
  getAdminBusinessInfo,
};
