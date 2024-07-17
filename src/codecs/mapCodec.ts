import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const storeMapListData = excess(
  t.type({
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    addr_x: t.number,
    addr_y: t.number,
  }),
);

const storeMapListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeMapListData),
    loc_cnt: t.number,
    total_cnt: t.number,
  }),
);

export default { storeMapListCodec };
