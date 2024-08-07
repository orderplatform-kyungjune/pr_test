import { translateArrayType } from '@interface/language';
import { storePosInfoType, apiResponseYesNoType } from '@common/interface';

export interface requestPosInitDataType {
  O_id: string;
  O_name: string;
  O_price: number;
  option_qty: number;
  preset_yn: string;
}

export interface requestCreateOptionType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  option_display_name: string;
  option_require: string;
  option_limit_select: number;
  option_id: string[];
  option_qty: number[];
}

export interface requestDeleteOptionType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  groupId?: string | number;
  groupAll?: string;
}

export interface requestOrderOneOptionMenuType {
  T_order_good_option_no: number;
  T_order_store_code: string;
  T_order_store_good_code: string;
  T_order_store_good_option_group: number;
  T_order_store_good_option_code: string;
  T_order_store_good_option_name: string;
  T_order_store_good_option_name_array?: translateArrayType;
  T_order_store_good_option_price: number;
  T_order_store_good_option_select_cnt: number;
  T_order_store_good_option_sort: number;
  T_order_store_good_option_use: string;
  T_order_store_good_option_isSale: string;
  T_order_store_good_option_img: string;
  T_order_store_good_option_type: string;
}

export interface requestOrderOneOptionMenuPlatformType {
  platform_good_option_no: number;
  platform_store_code: string;
  platform_store_good_code: string;
  platform_store_good_option_group: number;
  platform_store_good_option_code: string;
  platform_store_good_option_name: string;
  platform_store_good_option_name_array?: translateArrayType;
  platform_store_good_option_price: number;
  platform_store_good_option_select_cnt: number;
  platform_store_good_option_sort: number;
  platform_store_good_option_use: string;
  platform_store_good_option_isSale: string;
  platform_store_good_option_img: string;
  platform_store_good_option_type: string;
}

export interface requestOrderTwoOptionMenuType {
  T_order_good_option_no: string;
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
  preset_yn: string; // 티오더2 잔존 기능 - 사용 x
}

export interface requestOrderTwoOptionMenuPlatformType {
  platform_good_option_no: string;
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
  preset_yn: string; // 티오더2 잔존 기능 - 사용 x
}

export interface requestOrderOneOptionDataType {
  name: string;
  require: string;
  limit: number;
  group_num: number;
  option_item: requestOrderOneOptionMenuType[];
}

export interface requestOrderOneOptionDataPlatformType {
  name: string;
  require: string;
  limit: number;
  group_num: number;
  option_item: requestOrderOneOptionMenuPlatformType[];
}

export interface requestOrderTwoOptionDataType {
  option_group_no: string;
  parents_option_group_no: string;
  option_group_name: string;
  option_sort_number: number;
  image: string;
  is_set: string;
  is_type: string;
  option_require: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  item: requestOrderTwoOptionMenuType[];
}

export interface requestOrderTwoOptionDataPlatformType {
  option_group_no: string;
  parents_option_group_no: string;
  option_group_name: string;
  option_sort_number: number;
  image: string;
  is_set: string;
  is_type: string;
  option_require: string;
  min_limit_select: number;
  max_limit_select: number;
  min_limit_qty: number;
  max_limit_qty: number;
  item: requestOrderTwoOptionMenuPlatformType[];
}

export interface requestReferenceOptionDataType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: translateArrayType;
  goodUse: string;
  goodPosStopUse: string | null;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodCategory: string;
  goodPrice: number;
  goodImage: string;
  goodImg_404: string;
  goodTypeBest: string;
  goodTypeHit: string;
  goodTypeMd: string;
  goodTypeSale: string;
  goodTypeSpicy?: string;
  goodTypeVegan?: string;
  goodTypeNew: string;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml: string;
  goodReviewCnt: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  option: requestOrderOneOptionDataType[] | requestOrderTwoOptionDataType[];
}

export interface requestReferenceOptionDataPlatformType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: translateArrayType;
  goodUse: string;
  goodPosStopUse: string | null;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodCategory: string;
  goodPrice: number;
  goodImage: string;
  goodImg_404: string;
  goodTypeBest: string;
  goodTypeHit: string;
  goodTypeMd: string;
  goodTypeSale: string;
  goodTypeSpicy?: string;
  goodTypeVegan?: string;
  goodTypeNew: string;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml: string;
  goodReviewCnt: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  option:
    | requestOrderOneOptionDataPlatformType[]
    | requestOrderTwoOptionDataPlatformType[];
}

export interface requestSaveReferenceOptionType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  copyGoodCode: string;
  copyPosGoodCode: string;
  editType: string;
}

export interface requestSortOptionDataType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  groupId: number;
  option_no: number[];
}

export interface requestUpdateOptionType {
  storeCode: string;
  groupId: number;
  goodCode: string;
  posGoodCode: string;
  option_display_name: string;
  option_require: string;
  option_limit_select: number;
  option_id: string[];
  option_qty: number[];
}

export interface requestUpdateDetailOptionType {
  storeCode: string;
  option_no: string;
  option_qty: string;
  option_use: string;
  option_is_sale: string;
  option_img?: string;
}

export interface requestOptionGroupListType {
  storeCode: string;
  page: number;
  perPage: number;
  searchTxt?: string;
}

export interface translateNameArrayType {
  name: string;
  ko: string;
  en: string;
  jp: string;
  zh_hans: string;
  zh_hant: string;
}

export interface optionGroupType {
  name: string;
  group_num: number;
  name_array: translateNameArrayType;
  option_item: requestOrderOneOptionMenuType[];
}

export interface optionGroupPlatformType {
  name: string;
  group_num: number;
  name_array: translateNameArrayType;
  option_item: requestOrderOneOptionMenuPlatformType[];
}

export interface optionGroupListType {
  T_order_store_good_code: string;
  T_order_store_pos_code: string;
  T_order_store_good_display_name: string;
  T_order_store_good_name: string;
  T_order_store_good_posYN: string;
  T_order_store_good_use: string;
  option_group: optionGroupType[];
}

export interface optionGroupListPlatformType {
  platform_store_good_code: string;
  platform_store_pos_code: string;
  platform_store_good_display_name: string;
  platform_store_good_name: string;
  platform_store_good_posYN: string;
  platform_store_good_use: string;
  option_group: optionGroupPlatformType[];
}

export interface requestAllTranslateOptionGroupType {
  storeCode: string;
  type: string;
  T_order_good_option_no?: number[];
}

export interface requestTranslateOptionGroupType {
  type: string;
  storeCode: string;
  goodCode: string;
  T_order_good_option_no?: number;
  T_order_good_option_group_no?: number | string;
  T_order_store_good_option_code?: string;
  T_order_store_good_option_name?: string;
  origin_name?: string;
  ko: string;
  en: string;
  jp: string;
  zh_hans: string;
  zh_hant: string;
}

export interface requestTranslateOptionGroupPlatformType {
  type: string;
  storeCode: string;
  goodCode: string;
  platform_good_option_no?: number;
  platform_good_option_group_no?: number | string;
  platform_store_good_option_code?: string;
  platform_store_good_option_name?: string;
  origin_name?: string;
  ko: string;
  en: string;
  jp: string;
  zh_hans: string;
  zh_hant: string;
}

export interface requestOrderOneOptionGroupListType {
  storeCode: string;
  goodsCode: string;
}

export interface requestArrangeOptionGroupType {
  storeCode: string;
  goodsCode: string;
  group_id_array: number[];
}

export interface arrangeOptionGroupListType {
  id: number;
  name: string;
}

export type OptionTypeType = 'option' | 'goods';

export interface unlimitedOptionType {
  option_item_no: number;
  option_name: string;
  option_type: OptionTypeType;
  option_sold_out: apiResponseYesNoType;
  option_use: apiResponseYesNoType;
  depth_code: string;
  preset_yn: apiResponseYesNoType;
}

export interface getUnlimitedOptionGroupDataType {
  option_require: apiResponseYesNoType;
  max_limit_qty: number;
  min_limit_qty: number;
  option_group_name: string;
  option_group_no: number;
  items: unlimitedOptionType[];
}

export interface requestUnlimitedDepthOptionGroupsRequestBodyType
  extends storePosInfoType {
  optionItemNo: number;
}

export interface parentOptionType {
  name: string;
  no: number | null;
  optionGroupNo: number | null;
  depthCode: string;
  items: getUnlimitedOptionGroupDataType[];
}

export interface getInitOptionDataType {
  O_id: string;
  O_name: string;
  O_price: string;
}

export interface initOptionRequestType extends getInitOptionDataType {
  option_qty: number;
  preset_yn: apiResponseYesNoType;
}

export interface optionUpdateListSettingType {
  storeCode: string;
  posGoodCode: string;
  option_display_name: string;
  option_require: apiResponseYesNoType;
  min_limit_qty: number;
  max_limit_qty: number;
}

export interface requestSelectedOptionInfoRequestParamsType {
  storeCode: string;
  posGoodCode: string;
  optionGroupNo: number | null;
}

export interface optionUpdateListOptionType {
  id: string;
  quantity: number;
  preset_yn: apiResponseYesNoType;
  depth: boolean;
  use: apiResponseYesNoType;
  soldOut: apiResponseYesNoType;
}

export interface optionUpdateListResponseDataType {
  setting: optionUpdateListSettingType;
  items: {
    goods: optionUpdateListOptionType[];
    options: optionUpdateListOptionType[];
  };
}

export interface optionCreateGoodsType {
  goods_id: string[];
  goods_qty: number[];
  preset_yn: apiResponseYesNoType[];
}

export interface optionCreateOptionType {
  option_id: string[];
  option_qty: number[];
  preset_yn: apiResponseYesNoType[];
}

export interface optionCreateSettingType extends optionUpdateListSettingType {
  optionGroupNo: number | null;
  depthCode: string;
}

export interface optionCreateRequestDataType {
  setting: optionCreateSettingType;
  items: {
    goods: string[];
    option: string[];
  };
}

export interface optionUpdateSettingType extends optionUpdateListSettingType {
  optionGroupNo: number | null;
}

export interface optionUpdateRequestDataType {
  setting: optionUpdateSettingType;
  items: {
    goods: string[];
    option: string[];
  };
}

export interface optionUpdateRequestBodyType {
  setting: optionUpdateSettingType;
  items: {
    goods: optionCreateGoodsType;
    option: optionCreateOptionType;
  };
}

export interface requestOptionGroupCreateRequestBodyType {
  setting: optionCreateSettingType;
  items: {
    goods: optionCreateGoodsType;
    option: optionCreateOptionType;
  };
}

export interface requestOptionGroupDeleteRequestBodyType {
  storeCode: string;
  posGoodCode: string;
  optionGroupNo: number;
}

export interface addNewOptionGroupListDataType {
  originOptions: initOptionRequestType[];
  originGoods: initOptionRequestType[];
}

export interface modifyOptionType extends initOptionRequestType {
  depth: boolean;
  use: apiResponseYesNoType;
  soldOut: apiResponseYesNoType;
}

export interface modifyOptionGroupsDataType {
  originOptions: modifyOptionType[];
  originGoods: modifyOptionType[];
}

export interface getOptionListAllItemType {
  optionCode: string;
  optionName: string;
  optionPrice: number;
  optionUse: apiResponseYesNoType;
  optionImg: string;
  optionSort: number;
  optionIsSale: apiResponseYesNoType;
  presetYN: apiResponseYesNoType;
}

export interface getOptionListAllOptionType {
  optionGroupNo: string;
  optionGroupName: string;
  optionSortNumber: number;
  image: string;
  isSet: string;
  item: getOptionListAllItemType[];
}

export interface getOptionListAllGoodsDataType {
  goodCode: string;
  goodDpName: string;
  goodName: string;
  option: getOptionListAllOptionType[];
}

export interface AddOldOptionGroupModalGoodsList
  extends getOptionListAllGoodsDataType {
  selectedOptionGroups: string[];
}

export interface requestOptionCreateGetRequestBodyType {
  storeCode: string; // 매장코드
  goodCode: string; // posGoodCode
  copyGoodCode: string; // 가져올 상품 코드
  itemNo?: number; // target 옵션 코드
  copyGroupNo?: string[]; // 추가할 옵션 그룹 목록 (undefined 일경우 모든 옵션 그룹)
  editType: 'add' | 'remove';
}

export interface requestOptionSoldOutParamsType extends storePosInfoType {
  optionItemNo: number;
  soldOut: apiResponseYesNoType;
}

export interface requestOptionUseParamsType extends storePosInfoType {
  optionItemNo: number;
  use: apiResponseYesNoType;
}
