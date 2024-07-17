import * as t from 'io-ts';
import { excess } from '@codecs/excess';
import { storeCodec } from '@codecs';

const { paginationInfoCodec } = storeCodec;

// 포스 제공 옵션 리스트 코덱
const optionPosInitDataCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: t.array(
      t.type({
        O_id: t.string,
        O_name: t.string,
        O_price: t.string,
      }),
    ),
    data: t.array(
      t.type({
        O_id: t.string,
        O_name: t.string,
        O_price: t.number,
      }),
    ),
  }),
);

// 참고옵션 가져오기 코덱
const requestReferenceOptionLanguageCodec = excess(
  t.type({
    ko: t.string,
    en: t.string,
    jp: t.string,
    zh_hans: t.string,
    zh_hant: t.string,
  }),
);

const requestReferenceOptionNameArray = excess(
  t.type({
    en: t.string,
    jp: t.string,
    zh_hans: t.string,
    zh_hant: t.string,
  }),
);

const requestReferenceOptionResponseOptionMenuCodec = excess(
  t.type({
    T_order_good_option_no: t.string,
    T_order_store_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_option_group: t.string,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    T_order_store_good_option_price: t.string,
    T_order_store_good_option_select_cnt: t.string,
    T_order_store_good_option_name_array: t.string,
    T_order_store_good_option_sort: t.string,
    T_order_store_good_option_use: t.string,
    T_order_store_good_option_isSale: t.string,
    T_order_store_good_option_img: t.string,
    T_order_store_good_option_type: t.string,
  }),
);

const requestReferenceOptionResponseOptionCodec = excess(
  t.type({
    name: t.string,
    require: t.string,
    limit: t.string,
    group_num: t.string,
    option_item: requestReferenceOptionResponseOptionMenuCodec,
  }),
);

const requestReferenceOptionResponseCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: requestReferenceOptionLanguageCodec,
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
    goodsOptionUse: t.string,
    goodDetailOpen: t.string,
    goodHtml: t.string,
    goodHtml_array: t.string,
    goodReviewCnt: t.string,
    goodsMaxOrderQty: t.string,
    goodsMinOrderQty: t.string,
    option: t.array(requestReferenceOptionResponseOptionCodec),
  }),
);

const requestReferenceOptionDataOptionMenuCodec = excess(
  t.type({
    T_order_good_option_no: t.number,
    T_order_store_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_option_group: t.number,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    T_order_store_good_option_name_array: requestReferenceOptionNameArray,
    T_order_store_good_option_price: t.number,
    T_order_store_good_option_select_cnt: t.number,
    T_order_store_good_option_sort: t.number,
    T_order_store_good_option_use: t.string,
    T_order_store_good_option_isSale: t.string,
    T_order_store_good_option_img: t.string,
    T_order_store_good_option_type: t.string,
  }),
);

const requestReferenceOptionDataOptionCodec = excess(
  t.type({
    name: t.string,
    require: t.string,
    limit: t.number,
    group_num: t.number,
    option_item: t.array(requestReferenceOptionDataOptionMenuCodec),
  }),
);

const requestReferenceOptionDataCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: t.union([requestReferenceOptionLanguageCodec, t.null]),
    goodUse: t.string,
    goodPosStopUse: t.union([t.string, t.null]),
    goodSale: t.string,
    goodKitchen: t.string,
    nonShowCart: t.string,
    goodCategory: t.string,
    goodPrice: t.number,
    goodImage: t.string,
    goodImg_404: t.string,
    goodTypeBest: t.string,
    goodTypeHit: t.string,
    goodTypeMd: t.string,
    goodTypeSale: t.string,
    goodTypeNew: t.string,
    goodTypeVegan: t.string,
    goodTypeSpicy: t.string,
    goodsOptionUse: t.string,
    goodDetailOpen: t.string,
    goodHtml: t.string,
    goodHtml_array: t.array(t.string),
    goodReviewCnt: t.union([t.number, t.undefined]),
    goodsMaxOrderQty: t.number,
    goodsMinOrderQty: t.number,
    option: t.array(requestReferenceOptionDataOptionCodec),
    goodCategoryName: t.union([t.array(t.string), t.undefined]),
  }),
);

const requestReferenceOptionCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: t.array(requestReferenceOptionResponseCodec),
    data: t.array(requestReferenceOptionDataCodec),
  }),
);

const languageOptionGroupListOptionCodec = excess(
  t.type({
    name: t.string,
    name_array: t.string,
    group_num: t.string,
    option_item: requestReferenceOptionResponseOptionMenuCodec,
  }),
);

const languageOptionGroupListResponseCodec = excess(
  t.type({
    T_order_store_good_code: t.string,
    T_order_store_pos_code: t.string,
    T_order_store_good_display_name: t.string,
    T_order_store_good_name: t.string,
    T_order_store_good_posYN: t.string,
    T_order_store_good_use: t.string,
    option_group: languageOptionGroupListOptionCodec,
  }),
);

const languageOptionGroupListGroupDataCodec = excess(
  t.type({
    name: t.string,
    name_array: requestReferenceOptionNameArray,
    group_num: t.number,
    option_item: t.array(requestReferenceOptionDataOptionMenuCodec),
    required: t.string,
  }),
);

const languageOptionGroupListDataCodec = excess(
  t.type({
    T_order_store_good_code: t.string,
    T_order_store_pos_code: t.string,
    T_order_store_good_display_name: t.string,
    T_order_store_good_name: t.string,
    T_order_store_good_posYN: t.string,
    T_order_store_good_use: t.string,
    option_group: t.array(languageOptionGroupListGroupDataCodec),
  }),
);

const languageOptionGroupListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: paginationInfoCodec,
    response: languageOptionGroupListResponseCodec,
    data: t.array(languageOptionGroupListDataCodec),
  }),
);

const translateOptionGroupNameResponseCodec = excess(
  t.type({
    type: t.string,
    storeCode: t.string,
    goodCode: t.string,
    T_order_good_option_no: t.string,
    ko: t.string,
    en: t.string,
    jp: t.string,
    zh_hans: t.string,
    zh_hant: t.string,
  }),
);

const translateOptionGroupNameCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: translateOptionGroupNameResponseCodec,
  }),
);

const translateAllOptionGroupDataOptionGroup = excess(
  t.type({
    code: t.string,
    name: t.string,
  }),
);

const translateAllOptionGroupDataCodec = excess(
  t.type({
    option_group: t.array(translateAllOptionGroupDataOptionGroup),
    option_item: t.array(translateAllOptionGroupDataOptionGroup),
  }),
);

const translateAllOptionGroupCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: translateAllOptionGroupDataCodec,
  }),
);

// 옵션그룹 순서 변경 코덱
const arrangeOptionGroupDataCodec = excess(
  t.type({
    id: t.number,
    name: t.string,
  }),
);
const arrangeOptionGroupCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(arrangeOptionGroupDataCodec),
  }),
);

export default {
  optionPosInitDataCodec,
  requestReferenceOptionCodec,
  languageOptionGroupListCodec,
  translateOptionGroupNameCodec,
  translateAllOptionGroupCodec,
  arrangeOptionGroupCodec,
};
