import * as t from 'io-ts';
import { excess } from '@codecs/excess';

// 티오더 매장 리스트 조회
const dailyOrderStatsContentCodec = excess(
  t.type({
    no: t.number,
    date: t.string,
    cartPriceSum: t.number,
    cartCountOrderId: t.number,
    orderCnt: t.number,
    posSyncCnt: t.number,
    tabletRegiCnt: t.number,
    storeRegiCnt: t.number,
    userCnt: t.number,
  }),
);

const dailyOrderStatsCodec = excess(
  t.type({
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
    content: t.array(dailyOrderStatsContentCodec),
  }),
);

export default { dailyOrderStatsCodec };
