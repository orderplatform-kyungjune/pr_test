/* eslint-disable @typescript-eslint/no-explicit-any */
export interface totalMemberDataType {
  T_order_member_corporation: string;
  T_order_member_corporation_name: string;
  T_order_member_Department: string;
  T_order_member_name: string;
  T_order_id: string;
  T_order_auth: number | string;
  T_order_member_hp: string;
  pw: string;
  pw_re: string;
  T_order_store_code?: string;
}

export interface totalMemberDataPlatformType {
  platform_member_corporation: string;
  platform_member_corporation_name: string;
  platform_member_Department: string;
  platform_member_name: string;
  platform_id: string;
  platform_auth: number | string;
  platform_member_hp: string;
  pw: string;
  pw_re: string;
  platform_store_code?: string;
}

export interface selectBoxType {
  code: string;
  name: string;
}

export interface torderAuthListType {
  T_order_MGroup_no: number;
  T_order_MGroup_code: string;
  T_order_MGroup_name: string;
}
export interface pageRouterQueryType {
  code: string;
  name: string;
  path?: string;
  query?: any;
  icon?: any;
  index?: string;
  flag?: boolean;
  child?: pageRouterQueryType[];
}

export interface authPageTreeType {
  code: string;
  name: string;
  flag: boolean;
  child: authPageTreeType[];
}

export interface elementBasicType {
  value: string;
  label: string;
}

export interface authPageUpdateType {
  T_order_MGroup_code: string;
  auth_type: string;
  T_order_MGroup_page_auth?: elementBasicType[];
  T_order_MGroup_lnb_auth?: authPageTreeType[];
  T_order_MGroup_function_auth?: elementBasicType[];
}

export interface requestTorderMemberListType {
  page: number;
  perPage: number;
  searchStartDate?: string;
  searchEndDate?: string;
  searchCorporation?: string;
  searchDepartment?: string;
  searchAuth?: string;
  searchState?: string;
  searchTxt: string;
}

export interface torderMemberListDataType {
  no: number;
  T_order_member_corporation_name: string;
  T_order_member_Department: string;
  T_order_id: string;
  T_order_member_name: string;
  T_order_auth: string;
  T_order_member_state: string;
  T_order_member_register_datetime: string;
}

export interface torderMemberListDataPlatformType {
  no: number;
  platform_member_corporation_name: string;
  platform_member_Department: string;
  platform_id: string;
  platform_member_name: string;
  platform_auth: string;
  platform_member_state: string;
  platform_member_register_datetime: string;
}

export interface requestStoreMemberListType {
  page: number;
  perPage: number;
  searchState: string;
  searchTxt: string;
  searchStartDate: string;
  searchEndDate: string;
}

export interface storeMemberListDataType {
  no: number;
  T_order_store_name: string;
  T_order_store_code: string;
  T_order_id: string;
  T_order_auth: string;
  T_order_member_state: string;
  T_order_member_register_datetime: string;
}

export interface departmentListDataType {
  code: string;
  name: string;
}

export interface totalMemberDetailInfoType {
  no: number;
  T_order_member_state: string;
  T_order_auth: string;
  T_order_member_corporation: string;
  T_order_member_corporation_name: string;
  T_order_member_Department: string;
  T_order_member_name: string;
  T_order_member_hp: string;
  T_order_id: string;
  T_order_member_register_datetime: string;
  T_order_member_register_id: string;
  T_order_member_store_data?: string[];
}

export interface totalMemberDetailInfoPlatformType {
  no: number;
  platform_member_state: string;
  platform_auth: string;
  platform_member_corporation: string;
  platform_member_corporation_name: string;
  platform_member_Department: string;
  platform_member_name: string;
  platform_member_hp: string;
  platform_id: string;
  platform_member_register_datetime: string;
  platform_member_register_id: string;
  platform_member_store_data?: string[];
}

export interface termAgreeListItemType {
  id: number;
  term_type: string;
  term_title: string;
}

export interface businessMemberDetailInfoType {
  no: number;
  T_order_member_state: string;
  T_order_auth: string;
  T_order_origin_store_name: string;
  T_order_store_name: string;
  T_order_member_name: string; // 대표자명
  T_order_member_hp: string;
  T_order_id: string;
  T_order_member_code: string;
  T_order_member_login_datetime: string;
  T_order_member_register_datetime: string;
  first_login: string;
  test_store_use: string;
  term_agree: string;
  term_agree_list: termAgreeListItemType[];
  approveState: '' | '0' | '1';
}

export interface totalMemberUpdatePasswordType {
  T_order_id: string;
  type: string;
  before_pw?: string;
  pw?: string;
  pw_re?: string;
}

export interface totalMemberUpdatePasswordPlatformType {
  platform_id: string;
  type: string;
  before_pw?: string;
  pw?: string;
  pw_re?: string;
}

export interface totalMemberUpdateInfoType {
  T_order_id?: string;
  T_order_member_state?: string;
  T_order_auth?: string;
  T_order_member_Department?: string;
  T_order_member_hp?: string;
  T_order_store_code?: string[];
  checkedNum?: number[];
}

export interface totalMemberUpdateInfoPlatformType {
  platform_id?: string;
  platform_member_state?: string;
  platform_auth?: string;
  platform_member_Department?: string;
  platform_member_hp?: string;
  platform_store_code?: string[];
  checkedNum?: number[];
}

export interface businessMemberUpdateInfoType {
  no?: number;
  checkedNum?: number[];
  T_order_id?: string;
  T_order_member_state?: string;
  T_order_member_hp?: string;
  T_order_member_name?: string;
}

export interface authNumberListDataType {
  [key: string]: {
    code: string;
    name: string;
  }[];
}
