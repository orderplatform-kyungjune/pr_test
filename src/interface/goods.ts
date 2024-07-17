import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';
import { requestOrderOneOptionMenuPlatformType } from '@interface/option';
import { requestOptionPriceTranslateOptionType } from '@interface/language';

export interface productListCategoryInfoType {
  firstCategoryCode: string;
  firstCategoryName: string;
  categoryCode: string;
  sort: string;
  categoryName: string;
}

export interface productListType {
  storeCode: string;
  posCode: string;
  goodCode: string;
  code: string;
  price: number;
  goodName: string;
  dpName: string;
  image: string;
  html: number;
  detailOpen: number;
  goodUse: string;
  deleted: number;
  noSale: number;
  categoryInfo: productListCategoryInfoType[];
}

export interface updateProductType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  goodDpName?: string;
  goodUse?: string;
  goodSale?: string;
  goodKitchen?: string;
  nonShowCart?: string;
  goodReviewCnt?: number;
  goodsMaxOrderQty?: number;
  goodsMinOrderQty?: number;
  goodTypeBest?: string;
  goodTypeHit?: string;
  goodTypeMd?: string;
  goodTypeSale?: string;
  goodTypeSpicy?: string;
  goodTypeVegan?: string;
  goodTypeSignature?: string;
  goodTypeNew?: string;
  goodsOptionUse?: string;
  goodDetailOpen?: string;
  goodHtml?: string;
  goodAdv?: string;
  goodsType?: string;
  childCategoryCode?: string[];
  T_order_store_good_image?: string;
  T_order_store_good_horiz_img?: string;
  option_group_select_auto?: string;
  imageLock?: string;
  saleLock?: string;
  useLock?: string;
}

export interface updateAllProductType {
  storeCode: string;
  categoryEditYn: string;
  updateGoodCode: string[];
  categoryCode?: string | number;
  posNameUseYn?: string;
  goodUseYn?: string;
  goodSale?: string;
  goodKitchenYn?: string;
  nonShowCartYn?: string;
  goodIfFirstYn?: string;
}

export interface categoryInGoodsListType {
  storeCode: string;
  searchType: string;
  searchPosStopUse?: string;
  categoryCode?: string | number;
  searchTxt?: string | number;
}

export interface arrangeProductNameType {
  firstCategoryName: string;
  secondCategoryName: string;
}

export interface arrangeProductType {
  storeCode: string;
  childCategoryCode: string | number;
  goodCode: string[];
}

export interface requestChangeProductImageType {
  storeCode: string;
  goodCode: string;
  posGoodCode: string;
  goodImage: string;
}

export interface requestLanguageListType {
  storeCode: string;
  page: number;
  perPage: number;
  searchTxt?: string;
}

export interface languageType {
  en?: string;
  jp?: string;
  ko?: string;
  zh_hans?: string;
  zh_hant?: string;
}

export interface languageProductListType {
  goods_code: string;
  pos_name: string;
  display_name: string;
  detail_open: string;
  lang: languageType;
}

export interface languageCategoryListType {
  category_code: string;
  category_name: string;
  lang: languageType;
}

export interface requestUpdateTranslateProductType {
  type: string;
  storeCode: string;
  code: string;
  T_order_good_option_no?: string;
  ko: string | requestOptionPriceTranslateOptionType;
  en: string | requestOptionPriceTranslateOptionType;
  jp: string | requestOptionPriceTranslateOptionType;
  zh_hans: string | requestOptionPriceTranslateOptionType;
  zh_hant: string | requestOptionPriceTranslateOptionType;
}

export interface requestProductDetailInfoType {
  posGoodCode: string;
  storeCode: string;
}

export interface productDetailInfoResponseOptionMenuType {
  T_order_good_option_no: string;
  T_order_store_code: string;
  T_order_store_good_code: string;
  T_order_store_good_option_group: string;
  T_order_store_good_option_code: string;
  T_order_store_good_option_name: string;
  T_order_store_good_option_price: string;
  T_order_store_good_option_select_cnt: string;
  T_order_store_good_option_sort: string;
  T_order_store_good_option_use: string;
  T_order_store_good_option_isSale: string;
  T_order_store_good_option_img: string;
  T_order_store_good_option_type: string;
}

export interface productDetailInfoResponseOptionType {
  name: string;
  require: string;
  limit: string;
  group_num: string;
  option_item: productDetailInfoResponseOptionMenuType;
}

export interface productDetailInfoResponseType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: languageType;
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
  goodReviewCnt: string;
  goodsMaxOrderQty: string;
  goodsMinOrderQty: string;
  option: productDetailInfoResponseOptionType;
}

export interface productDetailInfoDataOptionMenuType {
  T_order_good_option_no: number;
  T_order_store_code: string;
  T_order_store_good_code: string;
  T_order_store_good_option_group: number;
  T_order_store_good_option_code: string;
  T_order_store_good_option_name: string;
  T_order_store_good_option_price: number;
  T_order_store_good_option_select_cnt: number;
  T_order_store_good_option_sort: number;
  T_order_store_good_option_use: string;
  T_order_store_good_option_isSale: string;
  T_order_store_good_option_img: string;
  T_order_store_good_option_type: string;
}

export interface productDetailInfoDataOptionType {
  name: string;
  require: string;
  limit: number;
  group_num: number;
  option_item: productDetailInfoDataOptionMenuType[];
  index?: number;
}

export interface productDetailInfoDataOptionPlatformType {
  name: string;
  require: string;
  limit: number;
  group_num: number;
  option_item: requestOrderOneOptionMenuPlatformType[];
  index?: number;
}

export interface productDetailInfoDataGoodCategoryListType {
  categoryCode: string;
  categoryName: string;
  childCategoryCode: string;
  childCategoryName: string;
  goods_count: number;
  sort_number: number;
  top: string;
}

export interface productDetailInfoDataGoodHtmlArray {
  lang_trans_type: string;
  origin_name: string;
  trans_name: string;
}

export interface productDetailInfoDataGoodPriceStringType {
  en: {
    option_1: string;
    option_2: string;
  };
  jp: {
    option_1: string;
    option_2: string;
  };
  ko: {
    option_1: string;
    option_2: string;
  };
  zh_hans: {
    option_1: string;
    option_2: string;
  };
  zh_hant: {
    option_1: string;
    option_2: string;
  };
}

export interface allergyListType {
  id: number;
  allergy_name: string;
  allergy_content: string;
  allergy_image_url: string;
  allergy_view_type: string;
  allergy_sort_number: number;
  set_yn: string;
}

export interface productDetailInfoDataType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: languageType;
  goodShortName: string;
  goodShortNameArray: languageType;
  goodUse: string;
  goodPosStopUse: string;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodAdv: string;
  goodCategory: string;
  goodPrice: number;
  goodRetailPrice: number;
  goodRetailPriceUse: string;
  goodImage: string;
  goodImg_404: string;
  goodTypeBest: string;
  goodTypeHit: string;
  goodTypeMd: string;
  goodTypeSale: string;
  goodTypeSignature: string;
  goodTypeNew: string;
  goodTypeVegan: string;
  goodTypeSpicy: string;
  goodTypeSpicyRate: number;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml: string;
  goodHtml_array: productDetailInfoDataGoodHtmlArray[];
  goodReviewCnt: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  T_order_store_is_set: string;
  T_order_store_is_order: string;
  T_order_store_Theme: string;
  option_group_select_auto: string;
  goodCategoryList: productDetailInfoDataGoodCategoryListType[];
  option: productDetailInfoDataOptionType[];
  goodPriceOptionNameArray: productDetailInfoDataGoodPriceStringType;
  goodPriceOptionNameArrayYN: string;
  country_of_origin: string;
  storeApiType: string;
  imageLock: string;
  saleLock: string;
  useLock: string;
  allergy_list: allergyListType[];
  T_order_store_good_allergy_use: string;
}

export interface productDetailInfoDataPlatformType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: languageType;
  goodShortName: string;
  goodShortNameArray: languageType;
  goodUse: string;
  goodPosStopUse: string;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodAdv: string;
  goodCategory: string;
  goodPrice: number;
  goodRetailPrice: number;
  goodRetailPriceUse: string;
  goodImage: string;
  goodImg_404: string;
  goodTypeBest: string;
  goodTypeHit: string;
  goodTypeMd: string;
  goodTypeSale: string;
  goodTypeSignature: string;
  goodTypeNew: string;
  goodTypeVegan: string;
  goodTypeSpicy: string;
  goodTypeSpicyRate: number;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml: string;
  goodHtml_array: productDetailInfoDataGoodHtmlArray[];
  goodReviewCnt: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  platform_store_is_set: string;
  platform_store_is_order: string;
  platform_store_Theme: string;
  option_group_select_auto: string;
  goodCategoryList: productDetailInfoDataGoodCategoryListType[];
  option: productDetailInfoDataOptionType[];
  goodPriceOptionNameArray: productDetailInfoDataGoodPriceStringType;
  goodPriceOptionNameArrayYN: string;
  country_of_origin: string;
  storeApiType: string;
  imageLock: string;
  saleLock: string;
  useLock: string;
  allergy_list: allergyListType[];
  platform_store_good_allergy_use: string;
}

export interface productDetailInfoType {
  result: boolean;
  code: number;
  response: productDetailInfoResponseType;
  data: productDetailInfoDataType;
}

// 상품 이미지 변경하기 페이지 상품 리스트 요청
export interface requestProductImageListType {
  page: number;
  perPage: number;
  searchTxt: string;
  searchType: string;
  storeName: string;
}

export interface productImageListDataType {
  T_order_store_name: string;
  T_order_store_Theme: string;
  T_order_store_code: string;
  T_order_store_pos_code: string;
  T_order_store_good_code: string;
  T_order_store_good_image: string;
  T_order_store_good_name: string;
  T_order_store_good_display_name: string;
  T_order_store_good_defualt_price: number;
  T_order_store_good_horiz_img: string;
  T_order_store_good_image_hash: string;
  T_order_store_good_use: string;
  T_order_store_good_posYN: string;
  T_order_store_short_name: string;
}

// 상품 이미지 변경하기 페이지 테이블 정보
export interface tableSpanMethodPropsType {
  row: productImageListDataType;
  column: TableColumnCtx<productImageListDataType>;
  rowIndex: number;
  columnIndex: number;
}

// 상품 상세설명 번역 요청값
export interface requestTranslateProductDetailType {
  item_type: string;
  storeCode: string;
  T_order_store_good_code: string;
  lang_trans_type: string;
  origin_name: string;
  trans_name: string;
  savedOriginName: string;
}

export interface requestTranslateProductDetailPlatformType {
  item_type: string;
  storeCode: string;
  platform_store_good_code: string;
  lang_trans_type: string;
  origin_name: string;
  trans_name: string;
  savedOriginName: string;
}

export interface productListInfoType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray: languageType;
  goodUse: string;
  goodPosStopUse: string;
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
  goodHtml_array: productDetailInfoDataGoodHtmlArray[];
  goodReviewCnt: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  saleLock: string;
  useLock: string;
  imageLock: string;
  top: string;
}

export interface requestFullGoodsListParamType {
  storeCode: string;
  page: number;
  perPage?: number;
  T_order_store_pos_code?: string;
  T_order_store_good_code?: string;
  T_order_store_good_name?: string;
  T_order_store_good_posYN?: string;
  T_order_store_good_use?: string;
  T_order_store_good_sale?: string;
  T_order_store_good_detail_open?: string;
}

export interface categoryType {
  T_order_store_menu_code_big: string;
  T_order_store_menu_name_big: string;
  T_order_store_menu_name_array_big: languageType;
  T_order_store_menu_code: string;
  T_order_store_menu_name: string;
  T_order_store_menu_name_array: languageType;
  T_order_store_menu_num: number;
}

export interface productListWithCategoryType {
  T_order_store_code: string;
  T_order_store_good_image?: string;
  T_order_store_pos_code: string;
  T_order_store_good_code: string;
  T_order_store_good_defualt_price: number;
  T_order_store_good_name: string;
  T_order_store_good_type_best: string;
  T_order_store_good_type_hit: string;
  T_order_store_good_type_md: string;
  T_order_store_good_type_sale: string;
  T_order_store_good_type_new: string;
  T_order_store_good_type_vegan: string;
  T_order_store_good_type_spicy: string;
  T_order_store_good_type_signature: string;
  T_order_store_goods_type: string;
  T_order_store_good_display_name: string;
  T_order_store_good_name_array: languageType;
  T_order_store_good_posYN: string;
  T_order_store_good_use: string;
  T_order_store_good_sale: string;
  T_order_store_good_kitchen: string;
  T_order_store_non_show_cart: string;
  T_order_store_is_order: string;
  T_order_store_good_detail_open: string;
  T_order_store_good_html: string;
  category: categoryType[];

  [key: string]: string | number | languageType | undefined | categoryType[];
}

export interface productInfoType {
  productName: string;
  categoryName: string;
  subCategoryName: string;
}

export interface categoryProductParamType {
  storeCode: string;
  childCategoryCode: string;
  goodCode: string[];
  topGoodCode: string[];
}

export interface elSelectType {
  label: string;
  value: string;
}

export interface requestUpdateAllGoodsSettingType {
  storeCode: string;
  column: string;
  useYN: string;
  goodsCodeArr: string[];
}

// v2 분류 설정 상품
export interface requestGoodsSearchListType {
  storeCode: string;
  categoryType: string;
  categoryCode?: number;
  goodOptionUse?: string;
  goodImage?: string;
  goodType?: string;
  searchTxt?: string;
  goodUse?: string;
  goodSale?: string;
  goodKitchen?: string;
  nonShowCart?: string;
  goodPosDelete?: string;
}

export interface productPriceOptionDetailType {
  option_1: string;
  option_2: string;
}

export interface productPriceOptionNameByLanguageType {
  // 가격 옵션 번역
  ko: productPriceOptionDetailType;
  en: productPriceOptionDetailType;
  jp: productPriceOptionDetailType;
  zh_hans: productPriceOptionDetailType;
  zh_hant: productPriceOptionDetailType;
}

export interface productHtmlByLanguageDetailType {
  // 상세설명 번역
  lang_trans_type: string;
  origin_name: string;
  trans_name: string;
}

export interface goodsInCategorizeType {
  goodCode: string;
  posGoodCode: string;
  goodDpName: string;
  goodName: string;
  goodNameArray?: languageType;
  goodShortName: string;
  goodShortNameArray?: languageType;
  goodUse: string;
  goodPosStopUse?: string;
  goodSale: string;
  goodKitchen: string;
  nonShowCart: string;
  goodAdv: string;
  goodCategoryList: productDetailInfoDataGoodCategoryListType[];
  goodCategoryNameBig: string[];
  goodCategoryBig: string;
  goodCategoryName: string[];
  goodCategory: string;
  goodPrice: number;
  goodPriceOptionNameArrayYN: string;
  goodPriceOptionNameArray: productPriceOptionNameByLanguageType;
  goodImage: string;
  goodImg_404: string;
  goodTypeName: string[]; // goodType(스티커) 목록 배열로
  goodTypeBest: string;
  goodTypeHit: string;
  goodTypeMd: string;
  goodTypeSale: string;
  goodTypeNew: string;
  goodTypeVegan: string;
  goodTypeSpicy: string;
  goodTypeSignature: string;
  goodsOptionUse: string;
  goodDetailOpen: string;
  goodHtml: string;
  goodHtml_array: productHtmlByLanguageDetailType[];
  goodReviewCnt?: number;
  goodsMaxOrderQty: number;
  goodsMinOrderQty: number;
  T_order_store_is_set: string;
  T_order_store_is_order: string;
  option_group_select_auto: string;
  spicy_rate: number;
  imageLock: string;
  saleLock: string;
  useLock: string;
  top: string;
}

export interface requestGoodsUpdateInCategorizeType {
  storeCode: string;
  goodTypeBest?: string;
  goodTypeHit?: string;
  goodTypeMd?: string;
  goodTypeSale?: string;
  goodTypeNew?: string;
  goodSaleState?: string; // 판매중-use, 판매중지-stop, 품절-soldout, 주방마감-kitchen
  goodsCodeArr: string[];
}
