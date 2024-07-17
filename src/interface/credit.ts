export interface allowedPaymentType {
  card: boolean;
  cash: boolean;
  byPrice: boolean;
  byMenu: boolean;
}

export interface tableStatusListType {
  tabletNumber: string;
  tabletCode: string;
  posTableCode: string;
  status: string | null;
  isCreditUse: number;
  serialNumber: string;
  vanType: string;
  allowedPaymentType: allowedPaymentType;
}

export interface pendingPayListPayloadType {
  page: number;
  size: number;
  storeCode: string;
  tabletNumber: string;
  startDatetime: string;
  endDatetime: string;
}

export interface sendFCMLogPayloadType {
  size: number;
  page: number;
  storeCode: string;
  tabletCode: string;
  ssaid: string;
  sendErrorCode: string;
  sendSuccess: string;
  receiveSuccess: string;
  sendDate: string;
  orderKey: string;
}

export interface fcmDeviceListInfoPayloadType {
  size: number;
  page: number;
  storeCode: string;
  tabletCode: string;
  ssaid: string;
  ipAddr: string;
  fcmToken: string;
}

export interface fcmDeviceHistoryPayloadType {
  size: number;
  page: number;
  storeCode: string;
  tabletCode: string;
  ssaid: string;
  ipAddr: string;
}
