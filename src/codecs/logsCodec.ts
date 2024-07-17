import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const logPageInfoCodec = excess(
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

// Tablet Pos Log
const tabletPosLogOrderInfoDataCodec = excess(
  t.type({
    goods_code: t.string,
    qty: t.string,
  }),
);

const tabletPosLogDataCodec = excess(
  t.type({
    id: t.number,
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    orderKey: t.string,
    T_order_tablet_id: t.string,
    T_order_tablet_name: t.string,
    T_order_store_ip: t.string,
    T_order_agent_info: t.string,
    T_order_order_info: t.array(tabletPosLogOrderInfoDataCodec),
    OrderDate: t.string,
    data_time: t.string,
  }),
);

const tabletPosLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: t.array(tabletPosLogDataCodec),
    page_info: logPageInfoCodec,
  }),
);

// Tablet Get Order Log
const tabletGetOrderLogDataCodec = excess(
  t.type({
    id: t.number,
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    T_order_order_message: t.string,
    T_order_tablet_id: t.string,
    T_order_tablet_name: t.string,
    T_order_store_ip: t.string,
    T_order_tablet_result_time: t.string,
    orderDate: t.string,
    data_time: t.string,
  }),
);

const tabletGetOrderLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: t.array(tabletGetOrderLogDataCodec),
    page_info: logPageInfoCodec,
  }),
);

// OrderView Redis Log
const orderViewRedisLogDataCodec = excess(
  t.type({
    id: t.number,
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    data_type: t.string,
    T_order_tablet_id: t.string,
    T_order_tablet_name: t.string,
    order_key: t.string,
    errorMsg: t.string,
    requestIP: t.string,
    data_date: t.string,
    data_time: t.string,
  }),
);

const orderViewRedisLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: t.array(orderViewRedisLogDataCodec),
    page_info: logPageInfoCodec,
  }),
);

// Order Cart Log
const orderCartLogDataCodec = excess(
  t.type({
    T_order_idx: t.number,
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    T_order_cart_id: t.string,
    T_order_tablet_id: t.string,
    T_order_tablet_name: t.string,
    T_order_store_good_code: t.string,
    T_order_store_good_name: t.string,
    T_order_store_good_qty: t.string,
    T_order_store_cart_memo: t.string,
    T_order_store_order_device: t.string,
    T_order_store_cart_stat: t.string,
    T_order_store_cart_price: t.string,
    T_order_store_cart_point_use: t.string,
    T_order_store_coupon_price: t.string,
    T_order_store_cart_date: t.string,
    T_order_store_cart_time: t.string,
  }),
);

const orderCartLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: t.array(orderCartLogDataCodec),
    page_info: logPageInfoCodec,
  }),
);

const transactionAndroidLogDataCodec = excess(
  t.type({
    transaction_log_id: t.number,
    store_code: t.string,
    store_name: t.string,
    order_key: t.string,
    payment_request_key: t.string,
    acquirer: t.string,
    acquirer_code: t.string,
    amount: t.number,
    approval_datetime: t.string,
    approval_month: t.string,
    approval_number: t.string,
    approval_type: t.string,
    business_no: t.string,
    card_number: t.string,
    created_datetime: t.string,
    device_id: t.string,
    error_message: t.string,
    formatted_approval_datetime: t.string,
    ip_address: t.string,
    is_success: t.string,
    issuer: t.string,
    issuer_code: t.string,
    message: t.string,
    modified_datetime: t.string,
    payment_id: t.string,
    payment_method: t.string,
    payment_raw_data: t.string,
    receipt_data: t.string,
    response_code: t.string,
    status: t.string,
    receipt_type: t.string,
    svc: t.string,
    tablet_code: t.string,
    tax_free: t.string,
    terminal_id: t.string,
    van_type: t.string,
    vat: t.number,
  }),
);

const transactionAndroidLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    page_info: excess(
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
    ),
    data: t.array(transactionAndroidLogDataCodec),
  }),
);

const transactionWebLogDataCodec = excess(
  t.type({
    transaction_web_id: t.number,
    store_name: t.string,
    store_code: t.string,
    order_key: t.string,
    status: t.string,
    ip_address: t.string,
    tablet_code: t.string,
    error_code: t.string,
    created_datetime: t.string,
    modified_datetime: t.string,
  }),
);

const transactionWebLogCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    page_info: excess(
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
    ),
    data: t.array(transactionWebLogDataCodec),
  }),
);

export default {
  tabletPosLogCodec,
  tabletGetOrderLogCodec,
  orderViewRedisLogCodec,
  orderCartLogCodec,
  transactionAndroidLogCodec,
  transactionWebLogCodec,
};
