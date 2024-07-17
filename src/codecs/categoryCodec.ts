import * as t from 'io-ts';
import goodsCodec from '@codecs/goodsCodec';
import { excess } from '@codecs/excess';

const { languageCodec } = goodsCodec;

const categoryListChildGoodListGoodHtmlCodec = excess(
  t.type({
    lang_trans_type: t.string,
    origin_name: t.string,
    trans_name: t.string,
  }),
);

// 분류 리스트
const categoryListChildGoodListCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: t.union([languageCodec, t.null]),
    goodUse: t.string,
    goodSale: t.string,
    goodKitchen: t.string,
    nonShowCart: t.string,
    goodAdv: t.string,
    goodCategory: t.string,
    goodPrice: t.union([t.number, t.string]),
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
    goodHtml_array: t.array(categoryListChildGoodListGoodHtmlCodec),
    goodReviewCnt: t.union([t.string, t.number, t.undefined]),
    goodsMaxOrderQty: t.union([t.string, t.number, t.undefined]),
    goodsMinOrderQty: t.union([t.string, t.number, t.undefined]),
    goodPosStopUse: t.string,
    goodCategoryName: t.union([t.array(t.string), t.undefined]),
    T_order_store_is_set: t.string,
    T_order_store_is_order: t.string,
  }),
);

const categoryListChildGoodListResponseCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodNameArray: languageCodec,
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
    goodPosStopUse: t.string,
  }),
);

const childCategoryListCodec = excess(
  t.type({
    childCategoryCode: t.string,
    childCategoryDepth: t.array(t.string),
    childCategoryName: t.string,
    childCategoryUse: t.string,
    childCategorySort: t.string,
    childCategoryType: t.string,
    childCategoryGoodCount: t.string,
    childCategoryGoodList: t.array(categoryListChildGoodListCodec),
  }),
);

const childCategoryListResponseCodec = excess(
  t.type({
    childCategoryCode: t.string,
    childCategoryDepth: t.string,
    childCategoryName: t.string,
    childCategoryUse: t.string,
    childCategorySort: t.string,
    childCategoryType: t.string,
    childCategoryGoodCount: t.string,
    childCategoryStartTime: t.string,
    childCategoryEndTime: t.string,
    childCategoryWeekDayArr: t.string,
    childCategoryGoodList: t.array(categoryListChildGoodListResponseCodec),
  }),
);

const categoryListResponseCodec = excess(
  t.type({
    categoryCode: t.string,
    childCategoryDepth: t.string,
    categoryName: t.string,
    categoryUse: t.string,
    categorySort: t.string,
    categoryType: t.string,
    categoryStartTime: t.string,
    categoryEndTime: t.string,
    categoryWeekDayArr: t.string,
    childCategoryList: t.array(childCategoryListResponseCodec),
  }),
);

const categoryListChildCodec = excess(
  t.type({
    childCategoryCode: t.number,
    childCategoryDepth: t.array(t.string),
    childCategoryName: t.string,
    childCategoryUse: t.string,
    childCategorySort: t.number,
    childCategoryType: t.string,
    childCategoryGoodCount: t.number,
    childScheduleOn: t.string,
    childCategoryStartTime: t.string,
    childCategoryEndTime: t.string,
    childCategoryWeekDayArr: t.array(t.string),
    childCategoryGoodList: t.array(categoryListChildGoodListCodec),
  }),
);

const categoryListDataCodec = excess(
  t.type({
    categoryCode: t.number,
    categoryDepth: t.array(t.string),
    categoryName: t.string,
    categoryUse: t.string,
    categorySort: t.number,
    categoryType: t.string,
    categoryScheduleOn: t.string,
    categoryStartTime: t.string,
    categoryEndTime: t.string,
    categoryWeekDayArr: t.array(t.string),
    childCategoryList: t.array(categoryListChildCodec),
  }),
);

// 분류 정보 불러오기
const requestCategoryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: categoryListResponseCodec,
    data: t.array(categoryListDataCodec),
  }),
);

// 분류 수정, 삭제
const settingCategoryDataCodec = excess(
  t.type({
    editType: t.string,
    storeCode: t.string,
    categoryCode: t.union([t.number, t.string]),
    updateCategoryCode: t.array(t.number),
    updateCategoryName: t.array(t.union([t.string, t.number])),
    updateCategoryUse: t.array(t.string),
    updateCategoryType: t.array(t.string),
  }),
);

const settingCategoryResponseCodec = excess(
  t.type({
    editType: t.string,
    storeCode: t.string,
    categoryCode: t.string,
    updateCategoryCode: t.string,
    updateCategoryName: t.string,
    updateCategoryUse: t.string,
    updateCategoryType: t.string,
  }),
);

const settingCategoryCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: settingCategoryResponseCodec,
    data: settingCategoryDataCodec,
  }),
);

// 일괄 수정 분류리스트 (셀렉트박스)
const childCategoryInfoCodec = excess(
  t.type({
    categoryCode: t.union([t.string, t.number]),
    categoryName: t.string,
    childCategoryCode: t.union([t.string, t.number]),
    childCategoryName: t.string,
  }),
);

const totalChildCategoryCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: childCategoryInfoCodec,
    data: t.array(childCategoryInfoCodec),
  }),
);

// v2 분류 설정
const storeMenuSortJsonCodec = excess(
  t.type({
    top: t.string,
    code: t.string,
    name: t.string,
    sort: t.number,
    price: t.number,
  }),
);

const categoryTypeCodec = excess(
  t.type({
    categoryCode: t.number,
    categoryName: t.string,
    categoryDepth: t.array(t.string),
    categoryType: t.string,
    categorySort: t.number,
    categoryUse: t.string,
    categoryScheduleOn: t.string,
    categoryStartTime: t.string,
    categoryEndTime: t.string,
    categoryWeekDayArr: t.array(t.string),
    categoryChildCount: t.number,
    categoryGoodCount: t.number,
    T_order_store_menu_sort_json: t.union([
      t.undefined,
      t.array(storeMenuSortJsonCodec),
    ]),
  }),
);

const categoryListDataTypeCodec = excess(
  t.type({
    categoryCode: t.number,
    categoryName: t.string,
    categoryDepth: t.union([t.array(t.string), t.undefined]),
    categoryType: t.string,
    categorySort: t.union([t.number, t.undefined]),
    categoryUse: t.string,
    categoryScheduleOn: t.string,
    categoryStartTime: t.union([t.string, t.undefined]),
    categoryEndTime: t.union([t.string, t.undefined]),
    categoryWeekDayArr: t.union([t.array(t.string), t.undefined]),
    categoryChildCount: t.union([t.number, t.undefined]),
    categoryGoodCount: t.number,
    T_order_store_menu_sort_json: t.union([
      t.undefined,
      t.array(storeMenuSortJsonCodec),
    ]),
    child: t.union([categoryTypeCodec, t.undefined]),
  }),
);

const responseCategoryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(categoryListDataTypeCodec),
    pos_init_date: t.string,
  }),
);

const eachBigChildCategoryCodec = excess(
  t.type({
    bigCode: t.number,
    bigName: t.string,
    childCode: t.number,
    childName: t.string,
    top: t.string,
  }),
);

const responseEachBigChildCategoryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(eachBigChildCategoryCodec),
    pos_init_date: t.string,
  }),
);

const responseUpdateCategoryCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
  }),
);

export default {
  childCategoryListCodec,
  requestCategoryListCodec,
  settingCategoryCodec,
  totalChildCategoryCodec,
  categoryTypeCodec,
  responseCategoryListCodec,
  responseUpdateCategoryCodec,
  responseEachBigChildCategoryListCodec,
};
