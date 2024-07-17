import * as t from 'io-ts';
import { excess } from '@codecs/excess';

// 문의 게시판 문의 내역 리스트 코덱
const cSInquiryBoardListPageInfoCodec = excess(
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

const storeInquiryListResponseCommentCodec = excess(
  t.type({
    no: t.string,
    num: t.string,
    context: t.string,
    checker: t.string,
    checker_id: t.string,
    bbsRegisterDate: t.string,
  }),
);

const storeInquiryListDataCommentCodec = excess(
  t.type({
    no: t.number,
    num: t.number,
    context: t.union([t.string, t.null]),
    bbsRegisterDate: t.union([t.string, t.null]),
    bbsDate: t.union([t.string, t.null]),
    checker: t.union([t.string, t.null]),
    checker_id: t.union([t.string, t.null]),
  }),
);

const cSInquiryBoardListResponseCodec = excess(
  t.type({
    num: t.string,
    storeCode: t.string,
    storeName: t.string,
    category1: t.string,
    category2: t.string,
    keyword: t.string,
    stat: t.string,
    stat_name: t.string,
    enquirer: t.string,
    enquirerHp: t.string,
    checker: t.string,
    checker_id: t.string,
    title: t.string,
    context: t.string,
    context2: t.union([t.string, t.null]),
    cs_incoming: t.string,
    cs_incoming_name: t.string,
    complain: t.string,
    complain_name: t.string,
    customerCompensate: t.string,
    customerType: t.string,
    bbsRegisterDate: t.string,
    comment: storeInquiryListResponseCommentCodec,
  }),
);

const cSInquiryBoardListDataCodec = excess(
  t.type({
    num: t.number,
    storeCode: t.union([t.string, t.null]),
    storeName: t.union([t.string, t.null]),
    category1: t.union([t.string, t.null]),
    category2: t.union([t.string, t.null]),
    keyword: t.union([t.string, t.null]),
    stat: t.union([t.string, t.null]),
    enquirer: t.union([t.string, t.null]),
    enquirerHp: t.union([t.string, t.null]),
    checker: t.union([t.string, t.null]),
    title: t.union([t.string, t.null]),
    context: t.union([t.string, t.null]),
    context2: t.union([t.string, t.null]),
    bbsRegisterDate: t.union([t.string, t.null]),
    checker_id: t.union([t.string, t.null]),
    stat_name: t.union([t.string, t.null]),
    customerCompensate: t.union([t.string, t.null]),
    customerType: t.union([t.string, t.null]),
    cs_incoming: t.union([t.string, t.null]),
    cs_incoming_name: t.union([t.string, t.null]),
    complain: t.union([t.string, t.null]),
    complain_name: t.union([t.string, t.null]),
    comment: t.array(storeInquiryListDataCommentCodec),
  }),
);

const csInquiryBoardListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: cSInquiryBoardListPageInfoCodec,
    response: cSInquiryBoardListResponseCodec,
    data: t.array(cSInquiryBoardListDataCodec),
  }),
);

// 셀렉트 옵션 - 분류 유형
const categoryDefaultTypeCodec = excess(
  t.type({
    name: t.string,
    code: t.string,
    for_create: t.string,
  }),
);

const categoryBigTypeCodec = excess(
  t.type({
    name: t.string,
    code: t.string,
    for_create: t.string,
    child: t.array(categoryDefaultTypeCodec),
  }),
);

// 셀렉트 옵션값
const selectOptionCodec = excess(
  t.type({
    code: t.union([t.string, t.number]),
    name: t.string,
  }),
);

// 셀렉트 옵션 응답값
const selectOptionListCodec = excess(
  t.type({
    category_list: t.array(categoryBigTypeCodec),
    stat_list: t.array(selectOptionCodec),
    incoming_list: t.array(selectOptionCodec),
    complain_name_list: t.array(selectOptionCodec),
  }),
);

const requestSelectOptionListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: selectOptionListCodec,
  }),
);

// 매장 리스트
export const storeListDataCodec = excess(
  t.type({
    value: t.string,
    label: t.string,
    match_res: t.union([t.string, t.undefined]),
    api_type: t.union([t.string, t.undefined]),
  }),
);

const storeAllListDataCodec = excess(
  t.type({
    T_order_store_code: t.string,
    T_order_store_name: t.string,
  }),
);

const storeAllListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeAllListDataCodec),
  }),
);

const storeListCodec = excess(
  t.type({
    data: t.array(storeListDataCodec),
    code: t.number,
    result: t.boolean,
  }),
);

// 해당 매장 이전 문의 내역 리스트
const storeInquiryListResponseCodec = excess(
  t.type({
    num: t.string,
    storeCode: t.string,
    storeName: t.string,
    category1: t.string,
    category2: t.string,
    keyword: t.string,
    stat: t.string,
    stat_name: t.string,
    enquirer: t.string,
    enquirerHp: t.string,
    checker: t.string,
    checker_id: t.string,
    title: t.string,
    context: t.union([t.string, t.null]),
    context2: t.union([t.string, t.undefined]),
    cs_incoming: t.string,
    cs_incoming_name: t.string,
    complain: t.string,
    complain_name: t.union([t.string, t.null]),
    bbsRegisterDate: t.string,
    customerCompensate: t.string,
    customerType: t.string,
    comment: storeInquiryListResponseCommentCodec,
  }),
);

const storeInquiryListDataCodec = excess(
  t.type({
    num: t.number,
    storeCode: t.union([t.string, t.null]),
    storeName: t.union([t.string, t.null]),
    category1: t.union([t.string, t.null]),
    category2: t.union([t.string, t.null]),
    keyword: t.union([t.string, t.null]),
    stat: t.union([t.string, t.null]),
    stat_name: t.union([t.string, t.null]),
    enquirer: t.union([t.string, t.null]),
    enquirerHp: t.union([t.string, t.null]),
    checker: t.union([t.string, t.null]),
    checker_id: t.union([t.string, t.null]),
    title: t.union([t.string, t.null]),
    context: t.union([t.string, t.null, t.undefined]),
    context2: t.union([t.string, t.null, t.undefined]),
    bbsRegisterDate: t.union([t.string, t.null]),
    cs_incoming: t.union([t.string, t.null]),
    cs_incoming_name: t.union([t.string, t.null]),
    complain: t.union([t.string, t.null]),
    complain_name: t.union([t.string, t.null]),
    customerCompensate: t.union([t.string, t.null]),
    customerType: t.union([t.string, t.null]),
    comment: t.union([
      t.array(storeInquiryListDataCommentCodec),
      t.null,
      t.undefined,
    ]),
  }),
);

const storeInquiryListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: storeInquiryListResponseCodec,
    data: t.array(storeInquiryListDataCodec),
  }),
);

// 문의 내용 상세 정보
const inquiryDetailInfoDataCodec = excess(
  t.type({
    num: t.number,
    storeCode: t.string,
    storeName: t.string,
    category1: t.string,
    category2: t.string,
    keyword: t.union([t.string, t.null]),
    stat: t.string,
    stat_name: t.string,
    enquirer: t.string,
    enquirerHp: t.string,
    checker: t.string,
    checker_id: t.string,
    title: t.union([t.string, t.null]),
    context: t.string,
    context2: t.union([t.string, t.null]),
    bbsRegisterDate: t.string,
    cs_incoming: t.union([t.string, t.null]),
    cs_incoming_name: t.union([t.string, t.null]),
    complain: t.union([t.string, t.null]),
    complain_name: t.union([t.string, t.null]),
    customerCompensate: t.union([t.string, t.null]),
    customerType: t.union([t.string, t.null]),
    comment: t.array(storeInquiryListDataCommentCodec),
  }),
);

const inquiryDetailInfoResponseCodec = excess(
  t.type({
    num: t.string,
    storeCode: t.string,
    storeName: t.string,
    category1: t.string,
    category2: t.string,
    keyword: t.string,
    stat: t.string,
    stat_name: t.string,
    enquirer: t.string,
    enquirerHp: t.string,
    checker: t.string,
    checker_id: t.string,
    title: t.string,
    context: t.string,
    context2: t.union([t.string, t.null, t.undefined]),
    bbsRegisterDate: t.string,
    cs_incoming: t.string,
    cs_incoming_name: t.string,
    complain: t.string,
    complain_name: t.string,
    customerCompensate: t.string,
    customerType: t.string,
    comment: storeInquiryListResponseCommentCodec,
  }),
);

const inquiryDetailInfoCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: inquiryDetailInfoResponseCodec,
    data: inquiryDetailInfoDataCodec,
  }),
);

// 코멘트 상담 상태값
const inquiryIncomingStatDataList = excess(
  t.type({
    code: t.number,
    name: t.string,
  }),
);

const inquiryIncomingStatList = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(inquiryIncomingStatDataList),
  }),
);

export default {
  csInquiryBoardListCodec,
  storeListCodec,
  requestSelectOptionListCodec,
  storeInquiryListCodec,
  inquiryDetailInfoCodec,
  inquiryIncomingStatList,
  storeAllListCodec,
};
