/* 쿠키를 설정 합니다.
 document.cookie = `accessToken=${response.data.token.accessToken}`;
 */
import { isUPLUSAdmin } from '@utils/authentication';

export const setCookie = (name: string, value: string, days: number): void => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 1000 * 60);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
};

// 쿠키를 불러 옵니다.
export const getCookie = (name: string): string => {
  const value = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return value ? value[2] : '';
};

// 쿠키를 제거 합니다.
export const delCookie = (name: string): void => {
  const date = new Date();
  date.setDate(date.getDate() - 10000);

  let cookie = '';

  const isOldOriginOrBrand1 = document.location.href?.includes('torder.co.kr');
  if (isOldOriginOrBrand1) {
    cookie = `${name}=;expires=${date.toUTCString()};domain=torder.co.kr;path=/;`;
  } else if (isUPLUSAdmin()) {
    cookie = `${name}=;expires=${date.toUTCString()};domain=uplusorder.com;path=/;`;
  } else {
    cookie = `${name}=;expires=${date.toUTCString()};domain=torder.com;path=/;`;
  }
  document.cookie = cookie;
};

export default {
  setCookie,
  getCookie,
  delCookie,
};
