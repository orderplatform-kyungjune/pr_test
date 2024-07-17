export interface requestOptionPosInitType {
  storeCode: string;
  posGoodCode: string;
  type: string;
}

export interface responseSetGroupListType {
  T_order_store_set_group_no: number;
  T_order_store_code: string;
  T_order_store_set_group_name: string;
  group_sort: number;
  image: string;
  is_type: string;
  set_require: string;
  set_limit_select: number;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  index?: number;
}

export interface requestOrderTwoOptionGroupListType {
  storeCode: string;
  goodsCode: string;
}

export interface responseOptionGroupListType {
  option_group_no: string;
  parents_option_group_no: string;
  option_group_name: string;
  option_sort_number: number;
  image: string;
  is_type: string;
  option_require: string;
  option_limit_select: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  index?: number;
}

export interface requestDeleteOrderTwoOptionGroupType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  option_group_no?: string;
}

export interface requestOrderTwoOptionMenuListType {
  storeCode: string;
  goodsCode: string;
  option_group_no: number | string;
}

export interface requestCreateOptionGroupType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  parents_option_group_no: string;
  option_display_name: string;
  option_require: string;
  option_id: string[];
  option_qty: number[];
  image: string;
  is_type: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
}

export interface orderTwoOptionMenuDataType {
  T_order_good_option_no: number;
  T_order_good_option_groups_no: string;
  T_order_store_code: string;
  T_order_store_good_code: string;
  T_order_store_good_option_code: string;
  T_order_store_good_option_name: string;
  T_order_store_good_option_group: string;
  T_order_store_good_option_price: number;
  T_order_store_good_option_use: string;
  T_order_store_good_option_img: string;
  T_order_store_good_option_select_cnt: number;
  T_order_store_good_option_sort: number;
  T_order_store_good_option_isSale: string;
  preset_yn: string;
}

export interface orderTwoOptionMenuDataPlatformType {
  platform_good_option_no: number;
  platform_good_option_groups_no: string;
  platform_store_code: string;
  platform_store_good_code: string;
  platform_store_good_option_code: string;
  platform_store_good_option_name: string;
  platform_store_good_option_group: string;
  platform_store_good_option_price: number;
  platform_store_good_option_use: string;
  platform_store_good_option_img: string;
  platform_store_good_option_select_cnt: number;
  platform_store_good_option_sort: number;
  platform_store_good_option_isSale: string;
  preset_yn: string;
}

export interface orderTwoOptionGroupDataType {
  option_group_no: string;
  option_group_name: string;
  option_sort_number: number;
  image: string;
  is_set: string;
  is_type: string;
  parents_option_group_no: string;
  option_require: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  item: orderTwoOptionMenuDataType[];
}

export interface orderTwoOptionGroupDataPlatformType {
  option_group_no: string;
  option_group_name: string;
  option_sort_number: number;
  image: string;
  is_set: string;
  is_type: string;
  parents_option_group_no: string;
  option_require: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  item: orderTwoOptionMenuDataPlatformType[];
}

export interface requestUpdateOrderTwoOptionMenuType {
  storeCode: string;
  option_no: string;
  option_qty: string;
  option_use: string;
  option_is_sale: string;
  option_img?: string;
}

export interface requestArrangeOrderTwoOptionMenuType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  option_group_no: string;
  option_no: number[];
}

export interface orderTwoOptionGroupDataBySortType {
  T_order_good_option_group_no: string;
  option_group_name: string;
  child: orderTwoOptionGroupDataBySortType[];
}

export interface requestSortorder2OptionGroupListPlatformType {
  platform_good_option_group_no: string;
  option_group_name: string;
  child: requestSortorder2OptionGroupListPlatformType[];
}

export interface requestArrangeOrderTwoOptionGroupType {
  storeCode: string;
  goodsCode: string;
  option_group_no_array: [string, string][];
}

export interface requestUpdateOrderTwoOptionGroupType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  option_group_no: string;
  parents_option_group_no: string;
  option_display_name: string;
  option_require: string;
  option_id: string[];
  option_qty: number[];
  image: string;
  is_type: string;
  preset_yn: string[];
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
}

export interface requestOverwriteOrImportOrderTwoOptionGroupType {
  storeCode: string;
  goodCode: string;
  copyGoodCode: string;
  editType: string;
}
