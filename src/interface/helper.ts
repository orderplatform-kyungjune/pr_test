export interface duplicateIdCheckType {
  storeCode?: string;
  T_order_id: string;
}

export interface duplicateIdCheckPlatformType {
  storeCode?: string;
  platform_id: string;
}

export interface duplicateStoreCodeCheckType {
  storeCode: string;
}

export interface duplicateSerialNumberCheckType {
  storeCode?: string;
  serial_number?: string; // uplus만 필수
  serial_number2?: string; // 내사만 필수
}

export interface duplicateMiddleWareCodeCheckType {
  storeCode?: string;
  posMiddleWareCode: string;
}
