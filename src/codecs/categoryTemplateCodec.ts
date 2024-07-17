import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const storeTemplateInfoCodec = excess(
  t.type({
    big_cnt: t.number,
    child_cnt: t.number,
    goods_cnt: t.number,
  }),
);

const storeTemplateChildCategoryGoodListCodec = excess(
  t.type({
    goodCode: t.string,
    goodDpName: t.string,
    goodImage: t.string,
    goodName: t.string,
    goodPrice: t.number,
    posGoodCode: t.string,
  }),
);

const storeTemplateChildCategoryListCodec = excess(
  t.type({
    childCategoryGoodCount: t.number,
    childCategoryGoodList: t.array(storeTemplateChildCategoryGoodListCodec),
    childCategoryName: t.string,
  }),
);

const storeTemplateListCodec = excess(
  t.type({
    categoryName: t.string,
    childCategoryList: t.array(storeTemplateChildCategoryListCodec),
  }),
);

const storeTemplateDataCodec = excess(
  t.type({
    info: storeTemplateInfoCodec,
    list: t.array(storeTemplateListCodec),
  }),
);

const storeTemplateResponseCodec = excess(
  t.type({
    code: t.number,
    msg: t.union([t.string, t.undefined]),
    data: t.union([storeTemplateDataCodec, t.undefined]),
    result: t.boolean,
  }),
);

const storeMappingInfoCodec = excess(
  t.type({
    goods_cnt: t.number,
    false_cnt: t.number,
    true_cnt: t.number,
  }),
);

const storeMappingListCodec = excess(
  t.type({
    goodCode: t.string,
    posGoodCode: t.string,
    goodDpName: t.string,
    goodName: t.string,
    goodPrice: t.number,
    goodsExists: t.string,
    goodsCount: t.number,
    categoryName: t.string,
    categoryExists: t.string,
    categoryCount: t.number,
    childCategoryName: t.string,
    childCategoryExists: t.string,
    childCategoryCount: t.number,
    exists: t.string,
  }),
);

const storeMappingDataCodec = excess(
  t.type({
    info: storeMappingInfoCodec,
    list: t.array(storeMappingListCodec),
  }),
);

const storeMappingResponseCodec = excess(
  t.type({
    code: t.number,
    msg: t.union([t.string, t.undefined]),
    data: t.union([storeMappingDataCodec, t.undefined]),
    result: t.boolean,
  }),
);

const restoreTemplateDataCodec = excess(
  t.type({
    storeCode: t.string,
    historyTime: t.array(t.string),
  }),
);

const restoreTemplateResponseCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: restoreTemplateDataCodec,
  }),
);
export default {
  storeTemplateResponseCodec,
  storeMappingResponseCodec,
  restoreTemplateResponseCodec,
};
