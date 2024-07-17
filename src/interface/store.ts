/* eslint-disable camelcase */
declare global {
  export interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daum: any;
  }
}

export interface storeInfoDataSortType {
  order: string;
  column: string;
}

export interface storeInfoDataBannerType {
  T_order_store_code: string;
  T_order_store_banner_name: string;
  T_order_store_banner_url: string;
  T_order_store_link_menu: string;
  T_order_store_banner_use: string;
  T_order_store_MSG_Number: number;
  T_order_store_banner_type: string;
  T_order_store_banner_sort: number;
}

export interface storeInfoDataInitType {
  id: number;
  T_order_store_code: string;
  T_order_store_recevice_cnt: number;
  T_order_store_good_cnt: number;
  date_time: string;
}

export interface storeInfoDataCategoryType {
  T_order_store_menu_name: string;
  T_order_store_menu_name_array: string;
  T_order_store_menu_use: string;
  T_order_store_menu_weekDayArr: string;
  T_order_store_menu_depth: string;
  T_order_store_menu_sort_number: number;
  T_order_store_menu_register_date: string;
  T_order_store_menu_updateTime: string;
  T_order_store_menu_sort_type: string;
  T_order_store_menu_sort: string;
  T_order_store_menu_sort_json: {
    code: string;
    name: string;
    sort: string;
    price: string;
  };
  T_order_store_menu_type: string;
  scheduleOn: number;
  isHide: number;
}

export interface storeInfoDataTabletType {
  Tablet_no: string;
  Ta_Id: string;
  Table_update_date: string;
  Tablet_credit_functionArray: string;
  Tablet_credit_serialnumber: string;
  Tablet_credit_use: string;
  Tablet_creditVanType: string;
  Tablet_name: string;
  Tablet_number: string;
  Tablet_order_cnt: number;
  Tablet_order_date: number;
  Tablet_order_time: string;
  Tablet_pos_table_code: string;
  Tablet_random_id: string;
}

export interface storeTabletSortType {
  order: string;
  column: string;
}

export interface storeInfoDataCustomStyleButtonType {
  fontColor: string;
  backgroundColor: string;
}

export interface storeInfoDataCustomStyleCategoryDataType {
  fontColor: string;
  activeFontColor: string;
  backgroundColor?: string; // 티오더2 1/0/5부터 미사용
  backgroundActiveColor?: string; // 티오더2 1/0/5부터 미사용
}

export interface storeInfoDataCustomStyleCategoryType {
  subCategory: storeInfoDataCustomStyleCategoryDataType;
  mainCategory: storeInfoDataCustomStyleCategoryDataType;
  backgroundImg: string; // lnb 배경이미지
  backgroundColor: string; // lnb 배경색
}

export interface storeInfoDataCustomStyleFontType {
  color: string;
  activeColor: string;
}

export interface storeInfoDataCustomStyleType {
  code?: string;
  name?: string;
  useYn: string;
  category: storeInfoDataCustomStyleCategoryType;
  tableNum: storeInfoDataCustomStyleButtonType;
  staffCallButton: storeInfoDataCustomStyleButtonType; // 티오더2 1/0/4부터 미사용
  font?: storeInfoDataCustomStyleFontType; // 티오더2 1/0/5부터 미사용
  button: storeInfoDataCustomStyleButtonType;
  background: { backgroundColor: string };
  bottomNavbar?: { backgroundColor: string };
  primaryColor?: string; // 이전부터 있었으나 사용되지 않는 값
  mode?: string; // 티오더2 1/0/5 부터 지정. 이전에 커스텀 스타일을 적용한 매장은 'light'
  mainColor?: string[]; // 티오더2 1/0/5 부터 추가. 기본, 레스토랑 템플릿처럼 대분류 배경색과 버튼색이 다른 경우
}

export interface customStyleDataType {
  storeCode: string;
  T_order_store_tablet_custom_style: storeInfoDataCustomStyleType;
}

export interface customStyleDataPlatformType {
  storeCode: string;
  platform_store_tablet_custom_style: storeInfoDataCustomStyleType;
}

export interface storeInfoDataStoreLanguageListType {
  label: string;
  value: string;
  img_url: string;
}

export interface storeInfoCreditPaymentMethodType {
  card: boolean;
  cash: boolean;
}

export interface storeInfoCreditPaymentType {
  byMenu: boolean;
  single: boolean;
  byPrice: boolean;
}

export interface storeInfoDataStoreType {
  T_order_store_num: number;
  T_order_store_code: string;
  posMiddleWareCode: string;
  T_order_store_fran_code: string;
  T_order_store_ipv4: string;
  T_order_store_AreaCode: string;
  T_order_store_Saup_number: string;
  T_order_store_Id: string;
  T_order_store_password: string;
  T_order_store_staff_password: string;
  T_order_store_Login_date: string;
  T_order_store_zipcode: string;
  T_order_store_address: string;
  T_order_store_address2: string;
  addr_x: string;
  addr_y: string;
  T_order_store_tel: string;
  T_order_store_cp_name: string;
  T_order_store_mg_name: string;
  T_order_store_cp_hp: string;
  T_order_store_mg_hp: string;
  T_order_store_contract_startDate: string;
  T_order_store_contract_endDate: string;
  T_order_store_bank_num: string;
  T_order_store_open_date: string;
  T_order_store_set_use: string;
  T_order_store_set_confim: string;
  T_order_store_logo?: string;
  T_order_store_logoUse?: string;
  T_order_store_close: number;
  T_order_store_close_order: string;
  T_order_store_Theme: string;
  T_order_recent_order_hide: string;
  T_order_store_Tablet_defalut_menu: string;
  T_order_store_banner_text: string;
  T_order_store_Popup_time: string;
  T_order_store_service_use: number;
  T_order_store_Main_rows: number;
  T_order_store_Tables: number;
  T_order_store_Empolyee: number;
  T_order_store_cart_point_type: number;
  T_order_store_cart_point: string | number;
  T_order_store_login_point: number;
  T_order_store_register_point: number;
  T_order_store_language_use: string;
  T_order_store_orderView_version: string;
  T_order_store_tablet_version: string;
  T_order_store_display_version: string;
  T_order_store_point_use: string;
  T_order_stote_register_use: string;
  T_order_store_Tablet_sort?: {
    order: string;
    column: string;
  };
  T_order_store_guide_use: string;
  T_order_store_language: string;
  T_order_min_order_price: number;
  T_order_max_order_qty: number;
  T_order_store_update_date: string;
  T_order_store_refresh_time: number;
  T_order_store_cart_refresh_time: number;
  T_order_store_direct_table: string;
  T_order_store_middleWare: string;
  T_order_store_register_date: string;
  T_order_store_last_updateTime: number;
  T_order_store_order_confirm: string;
  T_order_store_banner_control: string;
  T_order_store_credit_able: number;
  preCreditTableUse: number;
  T_order_store_categoryListUp: number;
  categoryIsBrand: number;
  T_order_store_visitBook: string;
  visitOrderAble: string;
  visitGroupUse: string;
  visitGroups: string;
  visitInfoSendPos: string;
  visitInfoSendFirstorder: number;
  visitSendFirstOrderMerge: number;
  visitInfoPosPrintPeopleIsQty: number;
  visitGroupsOrderAble: string;
  T_order_auctionAble: string;
  paymentMethod: number;
  T_order_cartPage_override: number;
  T_order_simpleView: string;
  T_order_QRPass_use: string;
  T_order_QRPass_Id: string;
  T_order_QRPass_password: string;
  tabletBillsOnOff: string;
  optionLayout: string;
  storeSerialNumber: string;
  storeVanTid: string;
  T_order_store_apk_name: string;
  T_order_store_new_version: string;
  categoryRows: number;
  T_order_chatingAble: string;
  T_order_store_pwd: string;
  T_order_store_pwd_re: string;
  T_order_gameAble: string;
  T_order_store_standardPriceUnit: string;
  T_order_store_tablet_installer: string;
  T_order_store_tablet_brand: string[];
  T_order_store_viewtablet_cnt: number;
  T_order_store_ordertablet_cnt: number;
  T_order_store_extratablet_cnt: number;
  T_order_store_apiType: string;
  sendOrderRevers: number;
  T_order_store_upjong: string;
  T_order_store_upte: string;
  T_order_store_contractNumber: string;
  T_order_store_stat: string;
  sendOrderViewPosErr: string;
  serviceGoods_sendPaidOrder: number;
  open_hour: string;
  close_hour: string;
  T_order_store_Ad_use: string;
  T_order_store_Ad_banner_list: number[];
  T_order_store_background?: string;
  T_order_store_backgroundUse: string;
  T_order_store_tablet_logo_img: string;
  T_order_store_tablet_custom_style?: storeInfoDataCustomStyleType;
  option_receipt_sort: number;
  T_order_store_checkout_Ad_use: string;
  T_order_store_master_language: string;
  T_order_store_use_language_list: string[];
  test_store_use: string;
  T_order_store_drive_call_hide: string;
  serial_number2: string;
  memo: string;
  T_order_store_setting_code: string;
  T_order_store_empCall_code: string;
  T_order_store_adop_Ad_use: string; // 2404~ 미사용
  T_order_store_banner_Ad_use: string;
  T_order_store_restroom_use: string;
  T_order_store_restroom_img?: string;
  T_order_store_banner_time: number;
  T_order_store_van_info: string;
  TabletMinBrightness: number;
  TabletMaxBrightness: number;
  TabletWaitBrightness: number;
  cart_open_use: string;
  T_order_store_pos_info: string;
  T_order_origin_store_name: string;
  T_order_store_name: string;
  T_order_area_name: string;
  credit_payment_method: storeInfoCreditPaymentMethodType;
  credit_payment_type: storeInfoCreditPaymentType;
  T_order_store_has_middleware: string;
  T_order_store_has_pos: string;
  visitGroupOpenType: string;
  option_migration_yn: string;
  business_type: string;
  no_goods_notify_use: 'Y' | 'N' | undefined; // 매장설정 => 해당필드 숨기기를 의도할경우 undefined
  store_survey_use: 'Y' | 'N' | undefined;
}

export interface storeInfoDataStorePlatformType {
  platform_store_num: number;
  platform_store_code: string;
  posMiddleWareCode: string;
  platform_store_fran_code: string;
  platform_store_ipv4: string;
  platform_store_AreaCode: string;
  platform_store_Saup_number: string;
  platform_store_Id: string;
  platform_store_password: string;
  platform_store_staff_password: string;
  platform_store_Login_date: string;
  platform_store_zipcode: string;
  platform_store_address: string;
  platform_store_address2: string;
  addr_x: string;
  addr_y: string;
  platform_store_tel: string;
  platform_store_cp_name: string;
  platform_store_mg_name: string;
  platform_store_cp_hp: string;
  platform_store_mg_hp: string;
  platform_store_contract_startDate: string;
  platform_store_contract_endDate: string;
  platform_store_bank_num: string;
  platform_store_open_date: string;
  platform_store_set_use: string;
  platform_store_set_confim: string;
  platform_store_logo: string;
  platform_store_logoUse: string;
  platform_store_close: number;
  platform_store_close_order: string;
  platform_store_Theme: string;
  platform_recent_order_hide: string;
  platform_store_Tablet_defalut_menu: string;
  platform_store_banner_text: string;
  platform_store_Popup_time: string;
  platform_store_service_use: number;
  platform_store_Main_rows: number;
  platform_store_Tables: number;
  platform_store_Empolyee: number;
  platform_store_cart_point_type: number;
  platform_store_cart_point: string | number;
  platform_store_login_point: number;
  platform_store_register_point: number;
  platform_store_language_use: string;
  platform_store_orderView_version: string;
  platform_store_tablet_version: string;
  platform_store_display_version: string;
  platform_store_point_use: string;
  platform_stote_register_use: string;
  platform_store_Tablet_sort: {
    order: string;
    column: string;
  };
  platform_store_guide_use: string;
  platform_store_language: string;
  platform_min_order_price: number;
  platform_max_order_qty: number;
  platform_store_update_date: string;
  platform_store_refresh_time: number;
  platform_store_cart_refresh_time: number;
  platform_store_direct_table: string;
  platform_store_middleWare: string;
  platform_store_register_date: string;
  platform_store_last_updateTime: number;
  platform_store_order_confirm: string;
  platform_store_banner_control: string;
  platform_store_credit_able: number;
  preCreditTableUse: number;
  platform_store_categoryListUp: number;
  categoryIsBrand: number;
  platform_store_visitBook: string;
  visitOrderAble: string;
  visitGroupUse: string;
  visitGroups: string;
  visitInfoSendPos: string;
  visitInfoSendFirstorder: number;
  visitSendFirstOrderMerge: number;
  visitInfoPosPrintPeopleIsQty: number;
  visitGroupsOrderAble: string;
  platform_auctionAble: string;
  paymentMethod: number;
  platform_cartPage_override: number;
  platform_simpleView: string;
  platform_QRPass_use: string;
  platform_QRPass_Id: string;
  platform_QRPass_password: string;
  tabletBillsOnOff: string;
  optionLayout: string;
  storeSerialNumber: string;
  storeVanTid: string;
  platform_store_apk_name: string;
  platform_store_new_version: string;
  categoryRows: number;
  platform_chatingAble: string;
  platform_store_pwd: string;
  platform_store_pwd_re: string;
  platform_gameAble: string;
  platform_store_standardPriceUnit: string;
  platform_store_tablet_installer: string;
  platform_store_tablet_brand: string[];
  platform_store_viewtablet_cnt: number;
  platform_store_ordertablet_cnt: number;
  platform_store_extratablet_cnt: number;
  platform_store_apiType: string;
  sendOrderRevers: number;
  platform_store_upjong: string;
  platform_store_upte: string;
  platform_store_contractNumber: string;
  platform_store_stat: string;
  sendOrderViewPosErr: string;
  serviceGoods_sendPaidOrder: number;
  open_hour: string;
  close_hour: string;
  platform_store_Ad_use: string;
  platform_store_Ad_banner_list: number[];
  platform_store_background: string;
  platform_store_backgroundUse: string;
  platform_store_tablet_logo_img: string;
  platform_store_tablet_custom_style: storeInfoDataCustomStyleType;
  option_receipt_sort: number;
  platform_store_checkout_Ad_use: string;
  platform_store_master_language: string;
  platform_store_use_language_list: string[];
  test_store_use: string;
  platform_store_drive_call_hide: string;
  serial_number: string;
  memo: string;
  platform_store_setting_code: string;
  platform_store_empCall_code: string;
  platform_store_adop_Ad_use: string; // 2404~ 미사용
  platform_store_banner_Ad_use: string;
  platform_store_restroom_use: string;
  platform_store_restroom_img: string;
  platform_store_banner_time: number;
  platform_store_van_info: string;
  TabletMinBrightness: number;
  TabletMaxBrightness: number;
  TabletWaitBrightness: number;
  cart_open_use: string;
  platform_store_pos_info: string;
  platform_origin_store_name: string;
  platform_store_name: string;
  platform_area_name: string;
  credit_payment_method: storeInfoCreditPaymentMethodType;
  credit_payment_type: storeInfoCreditPaymentType;
  platform_store_has_middleware: string;
  platform_store_has_pos: string;
  visitGroupOpenType: string;
  option_migration_yn: string;
  business_type: string;
  no_goods_notify_use: 'Y' | 'N' | undefined; // 매장설정 => 해당필드 숨기기를 의도할경우 undefined
}

export interface requestStoreInfoDataStoreType {
  T_order_store_num?: number;
  T_order_store_code?: string;
  posMiddleWareCode?: string;
  T_order_store_fran_code?: string;
  T_order_store_ipv4?: string;
  T_order_store_AreaCode?: string;
  T_order_store_name?: string;
  T_order_store_Saup_number?: string;
  T_order_store_Id?: string;
  T_order_store_password?: string;
  T_order_store_staff_password?: string;
  T_order_store_Login_date?: string;
  T_order_store_zipcode?: string;
  T_order_store_address?: string;
  T_order_store_address2?: string;
  addr_x?: string;
  addr_y?: string;
  T_order_store_tel?: string;
  T_order_store_cp_name?: string;
  T_order_store_mg_name?: string;
  T_order_store_cp_hp?: string;
  T_order_store_mg_hp?: string;
  T_order_store_contract_startDate?: string;
  T_order_store_contract_endDate?: string;
  T_order_store_bank_num?: string;
  T_order_store_open_date?: string;
  T_order_store_set_use?: string;
  T_order_store_set_confim?: string;
  T_order_store_logo?: string;
  T_order_store_logoUse?: string;
  T_order_store_close?: number;
  T_order_store_close_order?: string;
  T_order_store_Theme?: string;
  T_order_recent_order_hide?: string;
  T_order_store_Tablet_defalut_menu?: string;
  T_order_store_banner_text?: string;
  T_order_store_Popup_time?: string;
  T_order_store_service_use?: number;
  T_order_store_Main_rows?: number;
  T_order_store_Tables?: number;
  T_order_store_Empolyee?: number;
  T_order_store_cart_point_type?: number;
  T_order_store_cart_point?: string | number;
  T_order_store_login_point?: number;
  T_order_store_register_point?: number;
  T_order_store_language_use?: string;
  T_order_store_orderView_version?: string;
  T_order_store_tablet_version?: string;
  T_order_store_display_version?: string;
  T_order_store_point_use?: string;
  T_order_stote_register_use?: string;
  T_order_store_orderBy?: string;
  T_order_store_Tablet_sort?: string;
  T_order_store_guide_use?: string;
  T_order_store_language?: string;
  T_order_min_order_price?: number;
  T_order_max_order_qty?: number;
  T_order_store_update_date?: string;
  T_order_store_refresh_time?: number;
  T_order_store_cart_refresh_time?: number;
  T_order_store_direct_table?: string;
  T_order_store_middleWare?: string;
  T_order_store_register_date?: string;
  T_order_store_last_updateTime?: number;
  T_order_store_order_confirm?: string;
  T_order_store_banner_control?: string;
  T_order_store_credit_able?: number;
  preCreditTableUse?: number;
  T_order_store_categoryListUp?: number;
  categoryIsBrand?: number;
  T_order_store_visitBook?: string;
  visitOrderAble?: string;
  visitGroupUse?: string;
  visitGroups?: string;
  visitInfoSendPos?: string;
  visitInfoSendFirstorder?: number;
  visitSendFirstOrderMerge?: number;
  visitInfoPosPrintPeopleIsQty?: number;
  visitGroupsOrderAble?: string;
  T_order_auctionAble?: string;
  paymentMethod?: number;
  T_order_cartPage_override?: number;
  T_order_simpleView?: string;
  T_order_QRPass_use?: string;
  T_order_QRPass_Id?: string;
  T_order_QRPass_password?: string;
  tabletBillsOnOff?: string;
  optionLayout?: string;
  storeSerialNumber?: string;
  storeVanTid?: string;
  T_order_store_apk_name?: string;
  T_order_store_new_version?: string;
  categoryRows?: number;
  T_order_chatingAble?: string;
  T_order_store_pwd?: string;
  T_order_store_pwd_re?: string;
  T_order_store_tablet_installer?: string;
  T_order_store_tablet_brand?: string[];
  T_order_store_viewtablet_cnt?: number;
  T_order_store_ordertablet_cnt?: number;
  T_order_store_extratablet_cnt?: number;
  T_order_store_apiType?: string;
  sendOrderRevers?: string;
  T_order_store_upjong?: string;
  T_order_store_upte?: string;
  T_order_store_contractNumber?: string;
  T_order_store_stat?: string;
  sendOrderViewPosErr?: string;
  serviceGoods_sendPaidOrder?: number;
  open_hour?: string;
  close_hour?: string;
  T_order_store_Ad_use?: string;
  T_order_store_Ad_banner_list?: number[];
  T_order_store_background?: string;
  T_order_store_backgroundUse?: string;
  T_order_store_tablet_logo_img?: string;
  T_order_store_tablet_custom_style?: storeInfoDataCustomStyleType;
  option_receipt_sort?: number;
  T_order_store_checkout_Ad_use?: string;
  T_order_store_master_language?: string;
  T_order_store_use_language_list?: storeInfoDataStoreLanguageListType[];
  test_store_use?: string;
  T_order_store_drive_call_hide?: string;
  TabletMinBrightness?: number;
  TabletMaxBrightness?: number;
  TabletWaitBrightness?: number;
  storeCode: string;
  no_goods_notify_use: 'Y' | 'N';
}

export interface requestStoreInfoDataStorePlatformType {
  platform_store_num?: number;
  platform_store_code?: string;
  posMiddleWareCode?: string;
  platform_store_fran_code?: string;
  platform_store_ipv4?: string;
  platform_store_AreaCode?: string;
  platform_store_name?: string;
  platform_store_Saup_number?: string;
  platform_store_Id?: string;
  platform_store_password?: string;
  platform_store_staff_password?: string;
  platform_store_Login_date?: string;
  platform_store_zipcode?: string;
  platform_store_address?: string;
  platform_store_address2?: string;
  addr_x?: string;
  addr_y?: string;
  platform_store_tel?: string;
  platform_store_cp_name?: string;
  platform_store_mg_name?: string;
  platform_store_cp_hp?: string;
  platform_store_mg_hp?: string;
  platform_store_contract_startDate?: string;
  platform_store_contract_endDate?: string;
  platform_store_bank_num?: string;
  platform_store_open_date?: string;
  platform_store_set_use?: string;
  platform_store_set_confim?: string;
  platform_store_logo?: string;
  platform_store_logoUse?: string;
  platform_store_close?: number;
  platform_store_close_order?: string;
  platform_store_Theme?: string;
  platform_recent_order_hide?: string;
  platform_store_Tablet_defalut_menu?: string;
  platform_store_banner_text?: string;
  platform_store_Popup_time?: string;
  platform_store_service_use?: number;
  platform_store_Main_rows?: number;
  platform_store_Tables?: number;
  platform_store_Empolyee?: number;
  platform_store_cart_point_type?: number;
  platform_store_cart_point?: string | number;
  platform_store_login_point?: number;
  platform_store_register_point?: number;
  platform_store_language_use?: string;
  platform_store_orderView_version?: string;
  platform_store_tablet_version?: string;
  platform_store_display_version?: string;
  platform_store_point_use?: string;
  platform_stote_register_use?: string;
  platform_store_orderBy?: string;
  platform_store_Tablet_sort?: string;
  platform_store_guide_use?: string;
  platform_store_language?: string;
  platform_min_order_price?: number;
  platform_max_order_qty?: number;
  platform_store_update_date?: string;
  platform_store_refresh_time?: number;
  platform_store_cart_refresh_time?: number;
  platform_store_direct_table?: string;
  platform_store_middleWare?: string;
  platform_store_register_date?: string;
  platform_store_last_updateTime?: number;
  platform_store_order_confirm?: string;
  platform_store_banner_control?: string;
  platform_store_credit_able?: number;
  preCreditTableUse?: number;
  platform_store_categoryListUp?: number;
  categoryIsBrand?: number;
  platform_store_visitBook?: string;
  visitOrderAble?: string;
  visitGroupUse?: string;
  visitGroups?: string;
  visitInfoSendPos?: string;
  visitInfoSendFirstorder?: number;
  visitSendFirstOrderMerge?: number;
  visitInfoPosPrintPeopleIsQty?: number;
  visitGroupsOrderAble?: string;
  platform_auctionAble?: string;
  paymentMethod?: number;
  platform_cartPage_override?: number;
  platform_simpleView?: string;
  platform_QRPass_use?: string;
  platform_QRPass_Id?: string;
  platform_QRPass_password?: string;
  tabletBillsOnOff?: string;
  optionLayout?: string;
  storeSerialNumber?: string;
  storeVanTid?: string;
  platform_store_apk_name?: string;
  platform_store_new_version?: string;
  categoryRows?: number;
  platform_chatingAble?: string;
  platform_store_pwd?: string;
  platform_store_pwd_re?: string;
  platform_store_tablet_installer?: string;
  platform_store_tablet_brand?: string[];
  platform_store_viewtablet_cnt?: number;
  platform_store_ordertablet_cnt?: number;
  platform_store_extratablet_cnt?: number;
  platform_store_apiType?: string;
  sendOrderRevers?: string;
  platform_store_upjong?: string;
  platform_store_upte?: string;
  platform_store_contractNumber?: string;
  platform_store_stat?: string;
  sendOrderViewPosErr?: string;
  serviceGoods_sendPaidOrder?: number;
  open_hour?: string;
  close_hour?: string;
  platform_store_Ad_use?: string;
  platform_store_Ad_banner_list?: number[];
  platform_store_background?: string;
  platform_store_backgroundUse?: string;
  platform_store_tablet_logo_img?: string;
  platform_store_tablet_custom_style?: storeInfoDataCustomStyleType;
  option_receipt_sort?: number;
  platform_store_checkout_Ad_use?: string;
  platform_store_master_language?: string;
  platform_store_use_language_list?: storeInfoDataStoreLanguageListType[];
  test_store_use?: string;
  platform_store_drive_call_hide?: string;
  TabletMinBrightness?: number;
  TabletMaxBrightness?: number;
  TabletWaitBrightness?: number;
  storeCode: string;
}

export interface requestUpdateStoreTabletVersionType {
  storeCode: string;
  T_order_store_apiType: string;
  T_order_store_tablet_version: string;
  T_order_store_Theme: string;
  optionLayout: string;
  option_migration_yn: string;
  T_order_store_tablet_custom_style?: storeInfoDataCustomStyleType;
  option_migration_type?: string; // default 'add'
}

export interface requestUpdateStoreTabletVersionPlatformType {
  storeCode: string;
  platform_store_apiType: string;
  platform_store_tablet_version: string;
  platform_store_Theme: string;
  optionLayout: string;
  option_migration_yn: string;
  platform_store_tablet_custom_style?: storeInfoDataCustomStyleType;
  option_migration_type?: string; // default 'add'
}

export interface storeBannerInfoType {
  id: string;
  T_order_store_code: string;
  T_order_store_banner_name: string;
  T_order_store_banner_url: string;
  T_order_store_link_menu: string;
  T_order_store_banner_use: string;
  T_order_store_MSG_Number: number;
  T_order_store_banner_type: string;
  T_order_store_banner_sort: number;
}

export interface storeBannerInfoPlatformType {
  id: string;
  T_order_store_code: string;
  T_order_store_banner_name: string;
  T_order_store_banner_url: string;
  T_order_store_link_menu: string;
  T_order_store_banner_use: string;
  T_order_store_MSG_Number: number;
  T_order_store_banner_type: string;
  T_order_store_banner_sort: number;
}

export interface storeInfoDataType {
  goods_count: number;
  tablet_count: number;
  store: storeInfoDataStoreType;
  banner: storeBannerInfoType;
}

export interface storeInfoType {
  result: boolean;
  code: number;
  data: storeInfoDataType;
}

export interface storeDataType {
  num: number;
  storeCode: string;
  storeName: string;
  storestat: string;
  tablet_login_id: string;
  payment_type: string;
  test_store_use: string;
  T_order_store_register_date: string;
  T_order_store_contract_endDate?: string;
  T_order_store_contract_startDate?: string;
  posMiddleWareCode: string;
  business_type: string;
  newStore: 'Y' | 'N';
  cautionStore: 'Y' | 'N';
}

export interface storeDataPlatformType {
  num: number;
  storeCode: string;
  storeName: string;
  storestat: string;
  tablet_login_id: string;
  payment_type: string;
  test_store_use: string;
  platform_store_register_date: string;
  platform_store_contract_endDate?: string;
  platform_store_contract_startDate?: string;
  posMiddleWareCode: string;
  business_type: string;
  newStore: 'Y' | 'N';
  cautionStore: 'Y' | 'N';
}

export interface storeInfoFromCDPType {
  id: string;
  master_key: string;
  reception_no: string;
  business_name: string;
  area_name: string;
  address: string;
  contract_start_date: string;
  contract_end_date: string;
  final_tablet_count: string;
  final_master_count: string;
  pos: string;
  van: string;
  saup_number: string;
  installation_company: string;
  business_classification: string;
  business_sector_1: string;
  business_sector_2: string;
  request_notes: string;
  creator: string;
  created_datetime: string;
  modifier: string;
  modifiedDatetime: string;
}

export interface addNewStoreType {
  test_store_use: string;
  T_order_store_code: string;
  T_order_store_name: string;
  T_order_store_id: string;
  pw: string;
  pw_re: string;
  serial_number2: string;
  T_order_store_pos_info: string;
  T_order_origin_store_name: string;
  T_order_area_name: string;
  memo: string;
  T_order_store_has_middleware: string;
  T_order_store_has_pos: string;
  business_type: string;
}

export interface addNewStorePlatformType {
  test_store_use: string;
  platform_store_code: string;
  platform_store_name: string;
  platform_store_id: string;
  pw: string;
  pw_re: string;
  serial_number: string;
  platform_store_pos_info: string;
  platform_origin_store_name: string;
  platform_area_name: string;
  memo: string;
  platform_store_has_middleware: string;
  platform_store_has_pos: string;
  business_type: string;
}

export interface pageInfoDataType {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  prev_page_url: string;
  next_page_url: string;
  path: string;
  from: number;
  to: number;
}

export interface requestStoreListParameterType {
  page: number;
  perPage: number;
  searchStoreCode?: string;
  searchStoreName?: string;
  searchTabletLoginId?: string;
  searchStat?: string;
  searchStartDate?: string;
  searchEndDate?: string;
}

export interface requestAllStoreListParameterType {
  type: string;
  target: string;
  page: number;
  perPage: number;
  searchTxt?: string;
  searchMasterUrlText?: string;
  searchMasterUrl?: string;
  searchTorderUrl?: string;
  searchTorderUrlText?: string;
  searchUrlNone?: string;
}

export interface torderSearchInfoType {
  searchTxt: string;
  searchTorderUrlText: string;
  searchTorderUrl: string[];
}

export interface masterSearchInfoType {
  searchTxt: string;
  searchMasterUrlText: string;
  searchMasterUrl: string[];
}

export interface basedUrlStoreInfoType {
  version: string;
  cnt: number;
}

export interface themeInfoType {
  themeNo: string;
  api_version: string;
  themeName: string;
  cnt: number;
}

export interface selectedThemeType {
  apiVersion: string;
  themeCode: string;
}

export interface selectedUrlInfoType {
  url: string;
  count: number;
}

export interface pageInfoType {
  page: number;
  perPage: number;
  from: number;
  to: number;
  total: number;
}

export interface requestBasedUrlStoreListParameterType {
  type: string;
  page: number;
  perPage: number;
  searchTxt: string;
  searchTabletUrl: string;
  searchUrlNone?: string;
}

export interface requestThemeListParameterType {
  page: number;
  perPage?: number;
  searchTxt?: string;
  searchApiVersion?: string;
  searchThemeCode?: string;
}

export interface requestMatchedThemeListType {
  searchTxt: string;
  theme: string;
}

export interface requestUpdatedThemeType {
  storeArray: string[];
  api_version: string;
  update_theme: string;
  update_url_version: string;
}

export interface requestLogoImgParameterType {
  storeCode: string;
  T_order_logo_img: string;
}

export interface requestLogoImgParameterPlatformType {
  storeCode: string;
  platform_logo_img: string;
}

export interface storeDefaultLanguageType {
  KR: string;
  EN: string;
  JP: string;
  'CN-S': string;
  CN: string;
}

export interface storeUrlInfoType {
  T_order_store_num: number;
  T_order_store_code: string;
  T_order_store_name: string;
  T_order_store_tablet_version: string;
  T_order_store_middleWare: string;
  T_order_store_refresh_time: number;
  T_order_store_cart_refresh_time: number;
  T_order_store_Id: string;
  T_order_store_update_date: string;
  T_order_store_orderView_version: string;
  T_order_sqsUse: string;
  test_store_use: string;
}

export interface convertedStoreUrlInfoType extends storeUrlInfoType {
  updateUrlAddress: string;
}

export interface fullStoreUpdateParamType {
  type: string;
  storeArray: string[];
  update_version: string;
  T_order_store_refresh_time?: string;
  T_order_store_cart_refresh_time?: string;
  T_order_sqsUse?: string;
}

export interface selectedInfo {
  storeCodeArray: string[];
  storeBriefInfo: storeUrlInfoType[];
}

export interface storeAllListDataType {
  T_order_store_code: string;
  T_order_store_name: string;
}

export interface storeAllListDataPlatformType {
  platform_store_code: string;
  platform_store_name: string;
}

export interface storeInfoOfStoreManage {
  storeCodeArray: string[];
  storeBriefInfo: storeAllListDataType[];
}

export interface storeInfoOfStoreManagePlatformType {
  storeCodeArray: string[];
  storeBriefInfo: storeAllListDataPlatformType[];
}

export interface storeAllListType {
  value: string;
  label: string;
  storeNum: number;
}

export interface selectedStoreInfoType {
  storeName: string;
  storeCode: string;
}

export interface tabletListDataType {
  TECLAST: string;
  GALAXYTAB: string;
  IMUZ: string;
}

export interface storeStateListDataType {
  code: string;
  name: string;
  valid: boolean;
}

export interface storeAdBannerListType {
  id: number;
  adv_company_code: string;
  T_order_store_banner_name: string;
  T_order_store_banner_url: string;
}

export interface storeAdBannerListPlatformType {
  id: number;
  adv_company_code: string;
  platform_store_banner_name: string;
  platform_store_banner_url: string;
}

export interface allStoreListType {
  value: string;
  label: string;
  match_res?: string;
}

export interface requestUpdateStoreBackgroundImageType {
  storeCode: string;
  T_order_store_background: string;
}

export interface requestUpdateStoreBackgroundImagePlatformType {
  storeCode: string;
  platform_store_background: string;
}

export interface requestUpdateCategoryBackgroundImageType {
  storeCode: string;
  T_order_store_category_background: string;
}

export interface requestUpdateCategoryBackgroundImagePlatformType {
  storeCode: string;
  platform_store_category_background: string;
}

export interface requestUpdateTableLogoImageType {
  storeCode: string;
  T_order_store_tablet_logo_img: string;
}

export interface requestUpdateRestroomImageType {
  storeCode: string;
  T_order_store_restroom_img: string;
}

export interface requestUpdateRestroomImagePlatformType {
  storeCode: string;
  platform_store_restroom_img: string;
}

export interface requestStoreThemeListType {
  no: string;
  theme_name: string;
  theme_img_url: string;
}

export interface requestUrlVersionListType {
  type: string;
  api?: string;
}

export interface requestMatchedStoreListType {
  searchTxt: string;
  url: string;
  type: string;
}

export interface localStorageStoreInfoType {
  code: string;
  name: string;
}

export interface requestSearchStoreNameType {
  searchTxt: string;
}
