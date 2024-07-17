/** 매장명, 지점명: 한글/영문/특문/숫자 */
export const PATTERN_STORE_NAME =
  '[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9`~!@#$%^&*()_+[\\]{};:\'"|,.<>/?]';
export const PATTERN_STORE_NAME_WITH_LENGTH = `${PATTERN_STORE_NAME}{0,20}`;

/** 대표자명: 한글/영문 */
export const PATTERN_USER_NAME = '[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z]';
export const PATTERN_USER_NAME_WITH_LENGTH = `${PATTERN_USER_NAME}{2,20}`;

/** 매장ID: 영문/숫자 */
export const PATTERN_TORDER_ID = '[a-zA-Z0-9]';
export const PATTERN_TORDER_ID_WITH_LENGTH = `${PATTERN_TORDER_ID}{3,20}`;

/** 사업자등록번호 규칙 */
export const PATTERN_TAX_ID = '\\d{3}-\\d{2}-\\d{5}';

export const PATTERN_ONLY_NUMBER = '[0-9]';
