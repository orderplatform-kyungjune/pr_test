// 분류 정보 조회
import { goodsInCategorizeType, productDetailInfoDataGoodHtmlArray } from '@interface/goods';

export interface optionMenuType {
  code: string;
  displayname: string;
  img: string | null;
  isSale: number;
  limit_qty: number;
  name: string;
  price: number;
  sort_number: number;
}

export interface listOptionType {
  limit_select: number;
  name: string;
  option_items: optionMenuType[];
  require: number;
  require_flag: number;
  sort_number: number;
}

export interface childCategoryGoodListType {
  goodCode: string;
  goodDpName: string;
  goodName: string;
  goodSale: number;
  goodUse: number;
  image: string | null;
  option: undefined | listOptionType[];
  posDelete: number;
  posGoodCode: string;
  price: number;
}

export interface totalCategoryListType {
  categoryName: string;
  categoryCode: string;
  categoryClose: number;
  categorySort?: number;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  scheduleWeekArray: Array<undefined>;
  scheduleIsHide: number;
  scheduleOn: number;
  child: boolean;
  childCategorySort?: number;
  childCategoryGoodCount?: number;
  childCategoryGoodList?: childCategoryGoodListType[];
}

export interface childCategoryListType {
  childCategoryClose: number;
  childCategoryCode: string;
  childCategoryGoodCount: number;
  childCategoryGoodList: childCategoryGoodListType[];
  childCategoryName: string;
  childCategorySort: number;
  scheduleIsHide: number;
  scheduleOn: number;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  scheduleWeekArray: string[] | null;
}

export interface categoryDataType {
  categoryClose: number;
  categoryCode: string;
  categoryName: string;
  categorySort: number;
  childCategoryList: childCategoryListType[];
  scheduleIsHide: number;
  scheduleOn: number;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  scheduleWeekArray: string[] | null;
}

export interface unRegisteredGoodsType {
  Name: string;
  code: string;
}

export interface categoryType {
  data: categoryDataType[];
  unRegisteredGoods: unRegisteredGoodsType[];
}

// 분류 리스트
export interface childCategoryGoodListResponseType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: {
    en: string;
    jp: string;
    ko: string;
    zh_hans: string;
    zh_hant: string;
  };
  goodUse: string;
  goodPosStopUse: string;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodCategory: string;
  goodPrice: string;
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
  goodHtml_array: string;
  goodReviewCnt: string;
  goodsMaxOrderQty: string;
  goodsMinOrderQty: string;
}

export interface childCategoryListResponseType {
  childCategoryCode: string;
  childCategoryName: string;
  childCategoryUse: string;
  childCategorySort: string;
  childCategoryType: string;
  childCategoryGoodCount: string;
  childCategoryStartTime: string;
  childCategoryEndTime: string;
  childCategoryWeekDayArr: string;
  childCategoryGoodList: childCategoryGoodListResponseType[];
}

export interface categoryListResponseType {
  categoryCode: string;
  categoryName: string;
  categoryUse: string;
  categorySort: string;
  categoryType: string;
  categoryStartTime: string;
  categoryEndTime: string;
  categoryWeekDayArr: string;
  childCategoryList: childCategoryListResponseType[];
}

export interface categoryListChildGoodListType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: {
    en: string;
    jp: string;
    ko: string;
    zh_hans: string;
    zh_hant: string;
  };
  goodUse: string;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodAdv: string;
  goodCategory: number;
  goodPrice: number;
  goodImage: string;
  goodImg_404: string;
  goodTypeBest?: string;
  goodTypeHit?: string;
  goodTypeMd?: string;
  goodTypeSale?: string;
  goodTypeSpicy?: string;
  goodTypeVegan?: string;
  goodTypeNew?: string;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml?: string;
  goodHtml_array?: productDetailInfoDataGoodHtmlArray;
  goodReviewCnt?: number;
  goodsMaxOrderQty?: number;
  goodsMinOrderQty?: number;
  goodPosStopUse: string;
  goodCategoryName: string;
  T_order_store_is_set: string;
  T_order_store_is_order: string;
  goodTypeName: string[];
}

export interface categoryListChildType {
  childCategoryCode: string;
  childCategoryName: string;
  childCategoryUse: string;
  childCategorySort: number;
  childCategoryType: string;
  childCategoryGoodCount: number;
  childScheduleOn: string;
  childCategoryStartTime: string;
  childCategoryEndTime: string;
  childCategoryWeekDayArr: string[];
  childCategoryGoodList: goodsInCategorizeType[];
}

export interface categoryListDataType {
  categoryCode: string;
  categoryName: string;
  categoryUse: string;
  categorySort: number;
  categoryType: string;
  categoryScheduleOn: string;
  categoryStartTime: string;
  categoryEndTime: string;
  categoryWeekDayArr: string[];
  childCategoryList: categoryListChildType[];
}

export interface categoryListType {
  result: boolean;
  code: number;
  response: categoryListResponseType;
  data: categoryListDataType;
}

// 분류 설정
export interface settingCategoryType {
  editType: string;
  storeCode: string;
  categoryCode?: string | number;
  updateCategoryCode?: string[];
  updateCategoryName?: string[] | number[];
  updateCategoryUse?: string[];
  updateCategoryStartTime?: string[];
  updateCategoryEndTime?: string[];
  updateCategoryType?: string[];
  updateCategoryScheduleOn?: string[];
  updateCategoryWeekDays?: string[][];
}

export interface settingCategoryPropsType {
  editType: string;
  storeCode: string;
  categoryCode: string | number;
  updateCategoryCode: string[];
  updateCategoryName: string[] | number[];
  updateCategoryType: string[];
  updateCategoryUse: string[];
}

// 분류 추가
export interface createCategoryType {
  storeCode: string;
  type: string;
  categoryName: string;
  categoryType: string;
  categoryCode?: string;
}

// 분류 순서 설정
export interface arrangeCategoryType {
  editType: string;
  storeCode: string;
  categoryCode?: string;
  updateCategoryCode: string[];
}

// 중분류 리스트
export interface childCategoryType {
  bigCode: number;
  bigName: string;
  childCode: number;
  childName: string;
  top: string;
}

export interface selectBoxType {
  category: string;
  childData: childCategoryType[];
}

export interface requestDeleteParameterType {
  storeCode: string;
  categoryCode: string | number; // api v2 대응 임시 코드 todo fix
}

export interface changedChildCategoryDataType {
  id: string;
  parentCategoryCode: string;
  categoryCode: string;
  categoryName: string;
  categoryUse: string;
  parentCategoryUse: string;
  categoryScheduleOn: string;
  categoryStartTime: string;
  categoryEndTime: string;
  categoryWeekDayArr: string[];
  startHour: string;
  startMin: string;
  endHour: string;
  endMin: string;
}

export interface changedCategoryDataType {
  id: string;
  categoryCode: string;
  categoryName: string;
  categoryUse: string;
  categoryScheduleOn: string;
  categoryStartTime: string;
  categoryEndTime: string;
  categoryWeekDayArr: string[];
  children: changedChildCategoryDataType[];
  startHour: string;
  startMin: string;
  endHour: string;
  endMin: string;
}

// 분류 내 상품 넣기 모달 내 Element UI - Transfer interface
export interface optionType {
  key: string;
  label: string;
  price?: number;
  disabled?: boolean;
  isSale?: string;
  isUse?: string;
  isPosStop?: string;
  posGoodName?: string;
  isSaleLock?: string;
}

// 분류 내 상품 넣기 모달 내 Element UI - Transfer interface
export interface treeType {
  id: string;
  label: string;
}

// v2 분류 설정 리스트
export interface categoryInCategorizeType {
  categoryCode: number;
  categoryName: string;
  categoryUse: string;
  categorySort: number;
  categoryType: string;
  categoryScheduleOn: string;
  categoryStartTime: string;
  categoryEndTime: string;
  categoryWeekDayArr: string[];
  childCategoryList: categoryListChildType[];
  categoryDepth: string[];
  categoryChildCount: number;
  categoryGoodCount: number;
  child?: categoryInCategorizeType[];
}

export interface requestUpdateCategoryType {
  storeCode: string;
  type: string;
  categoryCode?: number; // 대분류 코드(type이 child인 경우만 필수),
  updateCategoryCode: number[];
  updateCategoryName?: string[];
  updateCategoryUse?: string[];
  updateCategoryType?: string[];
}

export interface requestCategoryListType {
  storeCode: string;
  searchType: string;
  categoryCode?: number;
}

export interface SelectBoxType {
  label: string;
  value: string | number;
}

export interface SelectGroupType {
  label: string;
  options: SelectBoxType[];
}
