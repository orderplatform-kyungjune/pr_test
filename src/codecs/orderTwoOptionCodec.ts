import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const orderTwoOptionGroupListDataCodec = excess(
  t.type({
    option_group_no: t.string,
    parents_option_group_no: t.string,
    option_group_name: t.string,
    option_sort_number: t.number,
    image: t.string,
    is_type: t.string,
    option_require: t.string,
    min_limit_select: t.number,
    max_limit_select: t.number,
    min_limit_qty: t.number,
    max_limit_qty: t.number,
  }),
);

const orderTwoOptionGroupListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(orderTwoOptionGroupListDataCodec),
  }),
);

const orderTwoOptionPosInitListDataCodec = excess(
  t.type({
    O_id: t.string,
    O_name: t.string,
    O_price: t.union([t.string, t.number]),
  }),
);

const orderTwoOptionPosInitListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    response: t.array(orderTwoOptionPosInitListDataCodec),
    data: t.array(orderTwoOptionPosInitListDataCodec),
  }),
);

const orderTwoOptionMenuCodec = excess(
  t.type({
    T_order_good_option_no: t.number,
    T_order_good_option_groups_no: t.string,
    T_order_store_code: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_option_code: t.string,
    T_order_store_good_option_name: t.string,
    T_order_store_good_option_group: t.string,
    T_order_store_good_option_price: t.number,
    T_order_store_good_option_use: t.string,
    T_order_store_good_option_img: t.string,
    T_order_store_good_option_select_cnt: t.number,
    T_order_store_good_option_sort: t.number,
    T_order_store_good_option_isSale: t.string,
    preset_yn: t.string,
  }),
);

const orderTwoOptionGroupDataCodec = excess(
  t.type({
    option_group_no: t.string,
    option_group_name: t.string,
    option_sort_number: t.number,
    image: t.string,
    is_set: t.string,
    is_type: t.string,
    parents_option_group_no: t.string,
    option_require: t.string,
    min_limit_select: t.number,
    max_limit_select: t.number,
    min_limit_qty: t.number,
    max_limit_qty: t.number,
    item: t.array(orderTwoOptionMenuCodec),
  }),
);

const orderTwoOptionMenuListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: orderTwoOptionGroupDataCodec,
  }),
);

export default {
  orderTwoOptionGroupListCodec,
  orderTwoOptionPosInitListCodec,
  orderTwoOptionMenuListCodec,
};
