import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const languageCodec = excess(
  t.type({
    en: t.string,
    jp: t.string,
    ko: t.string,
    zh_hans: t.string,
    zh_hant: t.string,
  }),
);

const orderTwoOptionGroupListExcelDownloadDataCodec = excess(
  t.type({
    T_order_good_option_group_no: t.string,
    T_order_store_good_code: t.string,
    option_group_name: t.string,
    lang: languageCodec,
  }),
);

const orderTwoOptionGroupListExcelDownloadPageInfoCodec = excess(
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

const orderTwoOptionMenuListExcelDownloadDataCodec = excess(
  t.type({
    T_order_good_option_no: t.string,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    lang: languageCodec,
  }),
);

const orderTwoSetItemListExcelDownloadDataCodec = excess(
  t.type({
    T_order_store_set_group_no: t.string,
    T_order_store_good_code: t.string,
    T_order_store_set_group_name: t.string,
    lang: languageCodec,
  }),
);

const orderTwoOptionGroupListExcelDownloadCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: orderTwoOptionGroupListExcelDownloadPageInfoCodec,
    data: t.array(orderTwoOptionGroupListExcelDownloadDataCodec),
  }),
);

const orderTwoOptionMenuListExcelDownloadCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: orderTwoOptionGroupListExcelDownloadPageInfoCodec,
    data: t.array(orderTwoOptionMenuListExcelDownloadDataCodec),
  }),
);

const orderTwoSetItemListExcelDownloadCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: orderTwoOptionGroupListExcelDownloadPageInfoCodec,
    data: t.array(orderTwoSetItemListExcelDownloadDataCodec),
  }),
);

export default {
  orderTwoOptionGroupListExcelDownloadCodec,
  orderTwoOptionMenuListExcelDownloadCodec,
  orderTwoSetItemListExcelDownloadCodec,
};
