import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const apkDataCodec = excess(
  t.type({
    apk: t.string,
    version: t.string,
  }),
);

const apkCodec = excess(
  t.type({
    data: t.array(apkDataCodec),
    code: t.number,
    result: t.boolean,
  }),
);

const tableCodec = excess(
  t.type({
    chat_reset: t.string,
    init_id: t.string,
    init_name: t.string,
    state: t.string,
    ta_id: t.string,
    tablet_info_id: t.string,
    tablet_info_name: t.string,
    tablet_screen_view: t.string,
    van_type: t.string,
  }),
);

const storeCodec = excess(
  t.type({
    T_order_store_apk_name: t.string,
    T_order_store_name: t.string,
  }),
);

const tabletCountCodec = excess(
  t.type({
    tablet_installer: t.string,
    tablet_brand: t.array(t.string),
    viewtablet_cnt: t.number,
    ordertablet_cnt: t.number,
    extratablet_cnt: t.number,
    reg_tablet_cnt: t.number,
    reg_prepay_tablet_cnt: t.number,
    unreg_tablet_cnt: t.number,
    for_delete_tablet_cnt: t.number,
  }),
);

const tableListCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    store: storeCodec,
    table_count: tabletCountCodec,
    table: t.array(tableCodec),
  }),
);

const tabletCreditFunctionArrayCodec = excess(
  t.type({
    card: t.boolean,
    cash: t.boolean,
    compound: t.boolean,
    multiple: t.boolean,
  }),
);

const singleTableInfoDataCodec = excess(
  t.type({
    Tablet_creditVanType: t.string,
    Tablet_credit_functionArray: tabletCreditFunctionArrayCodec,
    Tablet_credit_serialnumber: t.string,
    Tablet_credit_use: t.string,
  }),
);

const singleTableInfoCodec = excess(
  t.type({
    code: t.number,
    result: t.boolean,
    data: t.union([singleTableInfoDataCodec, t.undefined]),
    msg: t.union([t.string, t.undefined]),
  }),
);

const vanTypeListCodec = excess(
  t.type({
    '': t.string,
    KICC: t.string,
    KISVAN: t.string,
    KOCES: t.string,
    KSNET: t.string,
    NHNKCP: t.string,
    NICE: t.string,
    SMARTRO: t.string,
    JTNET: t.string,
    KOVAN: t.string,
    DAOUDATA: t.string,
    FINPAY: t.string,
    SECTANINE: t.string,
  }),
);

export default {
  tableListCodec,
  singleTableInfoCodec,
  vanTypeListCodec,
  apkCodec,
};
