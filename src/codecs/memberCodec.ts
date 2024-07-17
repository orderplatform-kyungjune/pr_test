import * as t from 'io-ts';
import { excess } from '@codecs/excess';

// 셀렉트 박스 리스트 코덱
const selectBoxListDataCodec = excess(
  t.type({
    code: t.union([t.string, t.number]),
    name: t.string,
  }),
);

const selectBoxListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(selectBoxListDataCodec),
  }),
);

// 권한 리스트 코덱
const torderAuthListDataCodec = excess(
  t.type({
    T_order_MGroup_no: t.number,
    T_order_MGroup_code: t.string,
    T_order_MGroup_name: t.string,
  }),
);

const torderAuthListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(torderAuthListDataCodec),
  }),
);

// 내부 회원 리스트
const torderMemberListDataCodec = t.type({
  no: t.number,
  T_order_member_corporation: t.string,
  T_order_member_Department: t.string,
  T_order_id: t.string,
  T_order_member_name: t.string,
  T_order_auth: t.string,
  T_order_member_state: t.string,
  T_order_member_register_datetime: t.string,
});

const torderMemberListPageInfoCodec = t.type({
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
});

const torderMemberListCodec = t.type({
  result: t.boolean,
  code: t.number,
  page_info: torderMemberListPageInfoCodec,
  data: t.array(torderMemberListDataCodec),
});

const totalMemberDetailInfoDataCodec = t.type({
  no: t.number,
  T_order_member_state: t.string,
  T_order_auth: t.string,
  T_order_member_corporation: t.string,
  T_order_member_corporation_name: t.string,
  T_order_member_Department: t.string,
  T_order_member_name: t.string,
  T_order_member_hp: t.string,
  T_order_id: t.string,
  T_order_member_register_datetime: t.string,
  T_order_member_register_id: t.string,
});

const totalMemberDetailInfoCodec = t.type({
  result: t.boolean,
  code: t.number,
  data: totalMemberDetailInfoDataCodec,
});

const businessMemberDetailInfoDataCodec = t.type({
  no: t.number,
  T_order_member_state: t.string,
  T_order_auth: t.string,
  T_order_member_name: t.string,
  T_order_member_hp: t.string,
  T_order_member_code: t.string,
  T_order_id: t.string,
  T_order_member_register_datetime: t.string,
});

const businessMemberDetailInfoCodec = t.type({
  result: t.boolean,
  code: t.number,
  data: businessMemberDetailInfoDataCodec,
});

// 점주 회원 리스트
const storeMemberListDataCodec = t.type({
  no: t.number,
  member_type: t.string,
  T_order_store_name: t.string,
  T_order_store_code: t.string,
  T_order_id: t.string,
  T_order_member_name: t.string,
  T_order_auth: t.string,
  T_order_member_state: t.string,
  T_order_member_register_datetime: t.string,
});

const storeMemberListCodec = t.type({
  result: t.boolean,
  code: t.number,
  page_info: torderMemberListPageInfoCodec,
  data: t.array(storeMemberListDataCodec),
});

const departmentListDataCodec = t.type({
  code: t.union([t.string, t.number]),
  name: t.string,
});

const departmentListCodec = t.type({
  result: t.boolean,
  code: t.number,
  data: t.array(departmentListDataCodec),
});

export default {
  selectBoxListCodec,
  torderAuthListCodec,
  torderMemberListCodec,
  businessMemberDetailInfoCodec,
  storeMemberListCodec,
  departmentListCodec,
  totalMemberDetailInfoCodec,
};
