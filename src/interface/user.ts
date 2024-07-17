export interface requestUserInfoParameterType {
  id: string;
}

export interface userInfoType {
  T_order_id: string;
  T_order_no: number;
  T_order_pwd: string;
  T_order_re_pwd: string;
  T_order_member_code: string;
  T_order_member_name: string;
  T_order_member_Department: string;
  T_order_auth: string;
  T_order_member_hp: string;
  T_order_member_hp1: string;
  T_order_member_hp2: string;
}

export interface userInfoPlatformType {
  platform_id: string;
  platform_no: number;
  platform_pwd: string;
  platform_re_pwd: string;
  platform_member_code: string;
  platform_member_name: string;
  platform_member_Department: string;
  platform_auth: string;
  platform_member_hp: string;
  platform_member_hp1: string;
  platform_member_hp2: string;
}

export interface businessUserInfo {
  T_order_store_name: string;
  T_order_store_code: string;
  T_order_id: string;
}
