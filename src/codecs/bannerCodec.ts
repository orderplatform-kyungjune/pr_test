import * as t from 'io-ts';
import { excess } from '@codecs/excess';
import { storeCodec } from '@codecs';

const { paginationInfoCodec } = storeCodec;

// 매장 배너 리스트 조회
const storeBannerDataCodec = excess(
  t.type({
    T_order_store_code: t.string,
    T_order_store_banner_name: t.string,
    T_order_store_banner_url: t.string,
    T_order_store_link_menu: t.string,
    T_order_store_banner_use: t.string,
    T_order_store_MSG_Number: t.number,
    T_order_store_banner_type: t.string,
    T_order_store_banner_sort: t.number,
    T_order_store_banner_time: t.number,
    id: t.number,
  }),
);

const storeBannerListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    page_info: paginationInfoCodec,
    data: t.array(storeBannerDataCodec),
  }),
);

export default {
  storeBannerListCodec,
  storeBannerDataCodec,
};
