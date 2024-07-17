import * as t from 'io-ts';

const userInfoDataCodec = t.type({
  T_order_id: t.string,
  T_order_no: t.number,
  T_order_member_code: t.string,
  T_order_member_name: t.string,
  T_order_member_Department: t.string,
  T_order_auth: t.string,
  T_order_member_hp: t.string,
  T_order_member_hp1: t.string,
  T_order_member_hp2: t.string,
});

const userInfoResCodec = t.type({
  T_order_id: t.string,
  T_order_no: t.string,
  T_order_member_code: t.string,
  T_order_member_name: t.string,
  T_order_member_Department: t.string,
  T_order_auth: t.string,
  T_order_member_hp: t.string,
  T_order_member_hp1: t.string,
  T_order_member_hp2: t.string,
});

const userInfoCodec = t.type({
  result: t.boolean,
  code: t.number,
  response: userInfoResCodec,
  data: userInfoDataCodec,
});

export default { userInfoCodec };
