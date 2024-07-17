import * as t from 'io-ts';
import storeCodec from '@codecs/storeCodec';
import { excess } from '@codecs/excess';

const { paginationInfoCodec } = storeCodec;

// 상품별 분류 설정하기 분류 목록
const goodsCategoryInfoCodec = excess(
  t.type({
    firstCategoryCode: t.string,
    firstCategoryName: t.string,
    categoryCode: t.string,
    sort: t.number,
    categoryName: t.string,
  }),
);

const storeGoodsCodec = t.array(
  excess(
    t.type({
      categoryInfo: t.array(goodsCategoryInfoCodec),
      code: t.string,
      deleted: t.number,
      detailOpen: t.number,
      dpName: t.string,
      goodCode: t.string,
      goodName: t.string,
      goodUse: t.number,
      html: t.number,
      image: t.string,
      noSale: t.number,
      posCode: t.string,
      price: t.number,
      storeCode: t.string,
    }),
  ),
);

// 태블릿 미등록 상품
const languageCodec = excess(
  t.type({
    en: t.union([t.string, t.null]),
    jp: t.union([t.string, t.null]),
    ko: t.union([t.string, t.null]),
    zh_hans: t.union([t.string, t.null]),
    zh_hant: t.union([t.string, t.null]),
  }),
);

const productDetailInfoGoodHtmlArrayCodec = excess(
  t.type({
    lang_trans_type: t.string,
    origin_name: t.string,
    trans_name: t.string,
  }),
);

const productDateCodec = excess(
  t.type({
    goodCode: t.union([t.string, t.undefined]),
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: t.union([languageCodec, t.null]),
    goodUse: t.string,
    goodSale: t.string,
    goodKitchen: t.string,
    nonShowCart: t.string,
    goodCategory: t.string,
    goodPrice: t.number,
    goodImage: t.string,
    goodImg_404: t.string,
    goodTypeBest: t.union([t.string, t.undefined]),
    goodTypeHit: t.union([t.string, t.undefined]),
    goodTypeMd: t.union([t.string, t.undefined]),
    goodTypeSale: t.union([t.string, t.undefined]),
    goodTypeSpicy: t.union([t.string, t.undefined]),
    goodTypeVegan: t.union([t.string, t.undefined]),
    goodTypeNew: t.union([t.string, t.undefined]),
    goodTypeSignature: t.union([t.string, t.undefined]),
    goodsOptionUse: t.union([t.string, t.undefined]),
    goodDetailOpen: t.union([t.string, t.undefined]),
    goodHtml: t.union([t.string, t.undefined]),
    goodHtml_array: t.array(productDetailInfoGoodHtmlArrayCodec),
    goodReviewCnt: t.union([t.number, t.undefined]),
    goodsMaxOrderQty: t.union([t.number, t.undefined]),
    goodsMinOrderQty: t.union([t.number, t.undefined]),
    goodPosStopUse: t.union([t.string, t.undefined]),
    goodCategoryName: t.union([t.array(t.string), t.undefined]),
  }),
);

const listProductCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: t.type({
      goodCode: t.string,
      posGoodCode: t.string,
      goodDpName: t.string,
      goodName: t.string,
      goodNameArray: t.union([languageCodec, t.null]),
      goodUse: t.string,
      goodSale: t.string,
      goodKitchen: t.string,
      nonShowCart: t.string,
      goodCategory: t.string,
      goodPrice: t.string,
      goodImage: t.string,
      goodImg_404: t.string,
      goodTypeBest: t.string,
      goodTypeHit: t.string,
      goodTypeMd: t.string,
      goodTypeSale: t.string,
      goodTypeSpicy: t.string,
      goodTypeVegan: t.string,
      goodTypeNew: t.string,
      goodTypeSignature: t.string,
      goodsOptionUse: t.string,
      goodDetailOpen: t.string,
      goodHtml: t.string,
      goodHtml_array: t.string,
      goodReviewCnt: t.string,
      goodsMaxOrderQty: t.string,
      goodsMinOrderQty: t.string,
    }),
    data: t.array(productDateCodec),
  }),
);

const languageProductListDataCodec = excess(
  t.type({
    goods_code: t.string,
    pos_name: t.string,
    display_name: t.string,
    detail_open: t.string,
    lang: languageCodec,
  }),
);

const languageProductListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: paginationInfoCodec,
    data: t.array(languageProductListDataCodec),
    api_type: t.string,
  }),
);

const languageCategoryListDataCodec = excess(
  t.type({
    category_code: t.string,
    category_name: t.string,
    lang: languageCodec,
  }),
);

const languageCategoryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: paginationInfoCodec,
    data: t.array(languageCategoryListDataCodec),
  }),
);

const languageSingleTranslateCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.type({
      ko: t.string,
      en: t.string,
      jp: t.string,
      zh_hans: t.string,
      zh_hant: t.string,
    }),
  }),
);

// 상품 상세 정보
const productDetailInfoResponseOptionMenuCodec = excess(
  t.type({
    T_order_good_option_no: t.string,
    T_order_store_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_option_group: t.string,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    T_order_store_good_option_price: t.string,
    T_order_store_good_option_select_cnt: t.string,
    T_order_store_good_option_sort: t.string,
    T_order_store_good_option_use: t.string,
    T_order_store_good_option_isSale: t.string,
    T_order_store_good_option_img: t.string,
    T_order_store_good_option_type: t.string,
  }),
);

const productDetailInfoDataOptionMenuCodec = excess(
  t.type({
    T_order_good_option_no: t.number,
    T_order_store_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_option_group: t.number,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    T_order_store_good_option_price: t.number,
    T_order_store_good_option_select_cnt: t.number,
    T_order_store_good_option_sort: t.number,
    T_order_store_good_option_use: t.string,
    T_order_store_good_option_isSale: t.string,
    T_order_store_good_option_img: t.string,
    T_order_store_good_option_type: t.string,
  }),
);

const productDetailInfoDataOptionCodec = excess(
  t.type({
    name: t.string,
    require: t.string,
    limit: t.number,
    group_num: t.number,
    option_item: t.array(productDetailInfoDataOptionMenuCodec),
  }),
);

const customProductCodeCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: t.array(
      t.type({
        code: t.string,
        text: t.string,
      }),
    ),
    data: t.array(
      t.type({
        code: t.string,
        text: t.string,
      }),
    ),
  }),
);

// 상품 이미지 변경하기 페이지 상품 리스트 코덱
const productImageListDataCodec = excess(
  t.type({
    T_order_store_name: t.string,
    T_order_store_Theme: t.string,
    T_order_store_code: t.string,
    T_order_store_pos_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_image_html: t.string,
    T_order_store_good_image: t.string,
    T_order_store_good_name: t.string,
    T_order_store_good_display_name: t.string,
    T_order_store_good_defualt_price: t.number,
    T_order_store_good_horiz_img: t.string,
    T_order_store_good_image_hash: t.string,
    T_order_store_good_use: t.string,
    T_order_store_good_posYN: t.string,
  }),
);

const productImageListPageInfoCodec = excess(
  t.type({
    total: t.number,
    per_page: t.number,
    current_page: t.number,
    last_page: t.number,
    first_page_url: t.string,
    last_page_url: t.string,
    prev_page_url: t.string,
    next_page_url: t.string,
    path: t.string,
    from: t.number,
    to: t.number,
  }),
);

const productImageListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: productImageListPageInfoCodec,
    data: t.array(productImageListDataCodec),
  }),
);

const storeCategoryArrayResponseCodec = excess(
  t.type({
    T_order_store_menu_code_big: t.string,
    T_order_store_menu_name_big: t.string,
    T_order_store_menu_name_array_big: languageCodec,
    T_order_store_menu_code: t.string,
    T_order_store_menu_name: t.string,
    T_order_store_menu_name_array: languageCodec,
    T_order_store_menu_num: t.string,
  }),
);

const productWithCategoryListResponseCodec = excess(
  t.type({
    T_order_store_code: t.string,
    T_order_store_good_image: t.string,
    T_order_store_pos_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_defualt_price: t.string,
    T_order_store_good_name: t.string,
    T_order_store_good_display_name: t.string,
    T_order_store_good_name_array: languageCodec,
    T_order_store_good_posYN: t.string,
    T_order_store_good_use: t.string,
    T_order_store_good_sale: t.string,
    T_order_store_good_detail_open: t.string,
    T_order_store_good_html: t.string,
    category: t.array(storeCategoryArrayResponseCodec),
  }),
);

const storeCategoryArrayDataCodec = excess(
  t.type({
    T_order_store_menu_code_big: t.string,
    T_order_store_menu_name_big: t.string,
    T_order_store_menu_name_array_big: languageCodec,
    T_order_store_menu_code: t.string,
    T_order_store_menu_name: t.string,
    T_order_store_menu_name_array: languageCodec,
    T_order_store_menu_num: t.number,
  }),
);

const productWithCategoryListDataCodec = excess(
  t.type({
    T_order_store_code: t.string,
    T_order_store_good_image: t.union([t.string, t.null]),
    T_order_store_pos_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_defualt_price: t.number,
    T_order_store_good_type_best: t.union([t.string, t.null]),
    T_order_store_good_type_hit: t.union([t.string, t.null]),
    T_order_store_good_type_md: t.union([t.string, t.null]),
    T_order_store_good_type_sale: t.union([t.string, t.null]),
    T_order_store_good_type_new: t.union([t.string, t.null]),
    T_order_store_good_type_vegan: t.union([t.string, t.null]),
    T_order_store_good_type_spicy: t.union([t.string, t.null]),
    T_order_store_good_type_signature: t.union([t.string, t.null]),
    T_order_store_good_adble_adv_goods: t.union([t.string, t.null]),
    T_order_store_goods_type: t.union([t.array(t.string), t.null]),
    T_order_store_good_name: t.string,
    T_order_store_good_display_name: t.union([t.string, t.null]),
    T_order_store_good_name_array: languageCodec,
    T_order_store_good_posYN: t.string,
    T_order_store_good_use: t.string,
    T_order_store_good_sale: t.string,
    T_order_store_good_kitchen: t.string,
    T_order_store_non_show_cart: t.string,
    T_order_store_is_order: t.string,
    T_order_store_good_detail_open: t.string,
    T_order_store_good_html: t.string,
    category: t.array(storeCategoryArrayDataCodec),
  }),
);

const productWithCategoryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: productImageListPageInfoCodec,
    response: productWithCategoryListResponseCodec,
    data: t.array(productWithCategoryListDataCodec),
  }),
);

// v2 분류 설정 상품
const goodsPriceOptionCodec = excess(
  t.type({
    option_1: t.union([t.string, t.null]),
    option_2: t.union([t.string, t.null]),
  }),
);

const goodsPriceOptionByLanguageCodec = excess(
  t.type({
    ko: goodsPriceOptionCodec,
    en: goodsPriceOptionCodec,
    jp: goodsPriceOptionCodec,
    zh_hans: goodsPriceOptionCodec,
    zh_hant: goodsPriceOptionCodec,
  }),
);

const responseGoodsUpdateInCategorizeCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
  }),
);

// 개선 api

const productDetailOptionResponseCodec = excess(
  t.type({
    name: t.string,
    require: t.string,
    limit: t.string,
    group_num: t.string,
    option_item: productDetailInfoResponseOptionMenuCodec,
  }),
);
const productDetailInfoResponseCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: t.union([languageCodec, t.null]),
    goodUse: t.string,
    goodPosStopUse: t.string,
    goodSale: t.string,
    goodKitchen: t.string,
    nonShowCart: t.string,
    goodCategory: t.string,
    goodPrice: t.string,
    goodImage: t.string,
    goodImg_404: t.string,
    goodTypeBest: t.string,
    goodTypeHit: t.string,
    goodTypeMd: t.string,
    goodTypeSale: t.string,
    goodTypeNew: t.string,
    goodTypeVegan: t.string,
    goodTypeSpicy: t.string,
    goodTypeSignature: t.string,
    goodsOptionUse: t.string,
    goodDetailOpen: t.string,
    goodHtml: t.string,
    goodHtml_array: t.string,
    goodReviewCnt: t.string,
    goodsMaxOrderQty: t.string,
    goodsMinOrderQty: t.string,
    option: productDetailOptionResponseCodec,
    storeApiType: t.string,
    goodPriceString: t.string,
    goodPriceOptionNameArrayYN: t.string,
    goodPriceOptionNameArray: goodsPriceOptionByLanguageCodec,
  }),
);

const productDetailInfoGoodCategoryListCodec = excess(
  t.type({
    categoryCode: t.number,
    categoryName: t.string,
    childCategoryCode: t.number,
    childCategoryName: t.string,
    goods_count: t.union([t.number, t.null]),
    sort_number: t.union([t.number, t.null]),
    top: t.union([t.number, t.string]),
  }),
);

const productDetailInfoDataCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: t.union([languageCodec, t.null]),
    goodUse: t.string,
    goodPosStopUse: t.union([t.string, t.null]),
    goodSale: t.string,
    goodKitchen: t.string,
    nonShowCart: t.string,
    goodAdv: t.string,
    goodCategoryNameBig: t.array(t.string),
    goodCategoryBig: t.string,
    goodCategory: t.string,
    goodTypeName: t.array(t.string),
    goodPrice: t.number,
    goodPriceString: t.string,
    goodRetailPrice: t.number,
    goodRetailPriceUse: t.string,
    goodImage: t.string,
    goodImg_404: t.string,
    goodTypeBest: t.string,
    goodTypeHit: t.string,
    goodTypeMd: t.string,
    goodTypeSale: t.string,
    goodTypeNew: t.string,
    goodTypeVegan: t.string,
    goodTypeSpicy: t.string,
    goodTypeSignature: t.string,
    goodsOptionUse: t.string,
    goodDetailOpen: t.string,
    goodHtml: t.union([t.string, t.undefined]),
    goodHtml_array: t.union([
      t.array(productDetailInfoGoodHtmlArrayCodec),
      t.undefined,
    ]),
    goodCategoryName: t.array(t.string),
    goodReviewCnt: t.union([t.number, t.undefined]),
    goodsMaxOrderQty: t.number,
    goodsMinOrderQty: t.number,
    T_order_store_is_set: t.string,
    T_order_store_is_order: t.string,
    T_order_store_Theme: t.union([t.string, t.undefined]),
    option_group_select_auto: t.string,
    goodCategoryList: t.array(productDetailInfoGoodCategoryListCodec),
    option: t.union([t.undefined, t.array(productDetailInfoDataOptionCodec)]),
    country_of_origin: t.union([t.string, t.undefined]),
    storeApiType: t.union([t.string, t.undefined]),
    goodPriceOptionNameArray: goodsPriceOptionByLanguageCodec,
    goodPriceOptionNameArrayYN: t.string,
    spicy_rate: t.number,
    useLock: t.string,
    saleLock: t.string,
    imageLock: t.string,
    top: t.union([t.string, t.undefined]),
  }),
);

const responsePageInfoInGoodsListCodec = excess(
  t.type({
    total: t.number,
    per_page: t.number,
    current_page: t.number,
    last_page: t.number,
    first_page_url: t.string,
    last_page_url: t.string,
    prev_page_url: t.string,
    next_page_url: t.string,
    path: t.string,
    from: t.number,
    to: t.number,
  }),
);

const responseGoodsListInCategorizeCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    api_type: t.string,
    store_theme: t.string,
    data: t.array(productDetailInfoDataCodec),
    page_info: t.union([responsePageInfoInGoodsListCodec, t.undefined]),
  }),
);

const productDetailInfoCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: productDetailInfoResponseCodec,
    data: productDetailInfoDataCodec,
  }),
);

export default {
  languageCodec,
  storeGoodsCodec,
  listProductCodec,
  languageProductListCodec,
  languageCategoryListCodec,
  languageSingleTranslateCodec,
  productDetailInfoCodec,
  productDetailInfoResponseCodec,
  productDetailInfoDataCodec,
  customProductCodeCodec,
  productImageListCodec,
  productDetailInfoGoodHtmlArrayCodec,
  productWithCategoryListCodec,
  responseGoodsListInCategorizeCodec,
  responseGoodsUpdateInCategorizeCodec,
};
