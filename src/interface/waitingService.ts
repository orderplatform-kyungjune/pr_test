export interface waitingStoreConfigType {
  id?: number;
  storeId?: number;
  alimtalkEnabled: boolean;
  waitingNumberResetTime: string;
  waitingNumberResetTimeEnabled: boolean;
  expectedWaitingMinutes: number;
  isWaitingClosed: boolean;
  entranceLimitTimeEnabled: boolean;
  entranceLimitMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface waitingStoreListDataType {
  id: number;
  loginId: string;
  loginPwd: string;
  tStoreCode: string | null;
  contractStartDate: string;
  contractEndDate: string;
  enStoreName?: string;
  name: string;
  phone: string;
  config?: waitingStoreConfigType;
  contractStartDateValue?: Date | undefined;
  contractEndDateValue?: Date | undefined;
  masterAppVersion: string | null;
  userAppVersion: string | null;
}

export interface waitingStoreInfoType {
  tStoreCode: string; // 티오더 매장연동용 매장코드
  contractStartDate: string;
  contractEndDate: string;
  name: string;
  phone: string;
  masterAppVersion: string | null;
  userAppVersion: string | null;
  config?: waitingStoreConfigType;
}

export interface requestWaitingStoreEnrollType {
  storeCode?: string | null;
  enStoreName: string;
  storeName: string;
  storePhone: string;
  contractStartDate: string;
  contractEndDate: string;
  config?: waitingStoreConfigType;
}

// 매장 등록, 수정 시 payload용 config type
export interface requestWaitingStoreConfigType {
  alimtalkEnabled: boolean;
  waitingNumberResetTimeEnabled: boolean;
  waitingNumberResetTime: string;
  expectedWaitingMinutes: number;
  isWaitingClosed: boolean;
  entranceLimitMinutes: number;
  entranceLimitTimeEnabled: boolean;
}

export interface requestWaitingStoreEditType {
  id: number; // 매장 고유번호
  name: string;
  phone: string;
  contractStartDate: string;
  contractEndDate: string;
  tStoreCode: string;
  loginId: string;
  config: requestWaitingStoreConfigType;
}
