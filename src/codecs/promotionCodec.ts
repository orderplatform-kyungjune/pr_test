import * as t from 'io-ts';
import { excess } from '@codecs/excess';

// 매장별 통계 데이터
export const storeStatsListDateResListCodec = excess(
  t.type({
    id: t.number,
    saveDate: t.string,
    storeName: t.string,
    storeCode: t.string,
    tabletCnt: t.union([t.number, t.null]),
    orderCnt: t.number,
    orderGoodsQty: t.number,
    joinCnt: t.number,
    winnerCnt: t.number,
    loserCnt: t.number,
    firstPrizeCnt: t.number,
    secondPrizeCnt: t.number,
    thirdPrizeCnt: t.number,
    fourthPrizeCnt: t.number,
    phoneInputedCnt: t.number,
    phoneNotInputedCnt: t.number,
  }),
);

export const storeStatsListCodec = excess(
  t.type({
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
    dateResList: t.array(storeStatsListDateResListCodec),
  }),
);

export const eventStockStateContentCodec = excess(
  t.type({
    createdDateTime: t.string,
    modifiedDateTime: t.string,
    id: t.number,
    date: t.string,
    prize1Sum: t.number,
    prize1PhoneInputed: t.number,
    prize1PhoneNotInputed: t.number,
    prize1LeftStock: t.number,
    prize2Sum: t.number,
    prize2PhoneInputed: t.number,
    prize2PhoneNotInputed: t.number,
    prize2LeftStock: t.number,
    prize3Sum: t.number,
    prize3PhoneInputed: t.number,
    prize3PhoneNotInputed: t.number,
    prize3LeftStock: t.number,
    prize4Sum: t.number,
    prize4PhoneInputed: t.number,
    prize4PhoneNotInputed: t.number,
    prize4LeftStock: t.number,
    phoneInputedSum: t.number,
    totalLeftStock: t.number,
  }),
);

export const eventStockStateCodec = excess(
  t.type({
    content: t.array(eventStockStateContentCodec),
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
  }),
);

export const giftQuantityStockCodec = t.array(
  excess(
    t.type({
      prizeRank: t.number,
      prizeStock: t.number,
      prizeName: t.string,
      exhaustedCount: t.number,
      leftoverCount: t.number,
    }),
  ),
);

const contentCodec = excess(
  t.type({
    eventStoreCnt: t.number,
    id: t.number,
    joinSum: t.number,
    loserSum: t.number,
    orderGoodsQtySum: t.number,
    orderStoreCnt: t.number,
    orderSum: t.number,
    phoneInputedSum: t.number,
    phoneNotInputedSum: t.number,
    saveDate: t.string,
    winnerSum: t.number,
  }),
);

const eventStatisticsDataCodec = excess(
  t.type({
    content: t.array(contentCodec),
    currentPage: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
    pageSize: t.number,
    totalPages: t.number,
  }),
);

const prizeListCodec = t.array(
  excess(
    t.type({
      createdDateTime: t.string,
      id: t.number,
      imageUrl: t.string,
      modifiedDateTime: t.string,
      name: t.string,
      prizeRate: t.number,
      ranks: t.number,
      stock: t.number,
    }),
  ),
);

const alcoholContentCodec = excess(
  t.type({
    cassOrderCnt: t.number,
    cassOrderQty: t.number,
    chamisulOrderCnt: t.number,
    chamisulOrderQty: t.number,
    chumchurumOrderCnt: t.number,
    chumchurumOrderQty: t.number,
    createdDateTime: t.union([t.string, t.null]),
    date: t.string,
    id: t.number,
    jinroOrderCnt: t.number,
    jinroOrderQty: t.number,
    kloudOrderCnt: t.number,
    kloudOrderQty: t.number,
    saeroOrderCnt: t.union([t.number, t.null]),
    saeroOrderQty: t.union([t.number, t.null]),
    teraOrderCnt: t.number,
    teraOrderQty: t.number,
    eventStoreCnt: t.union([t.number, t.undefined]),
  }),
);

const alcoholContentResCodec = excess(
  t.type({
    content: t.array(alcoholContentCodec),
    currentPage: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
    pageSize: t.number,
    totalPages: t.number,
  }),
);

// 프로모션 이벤트 조회
const promotionEventListContentCodec = excess(
  t.type({
    num: t.number,
    eventName: t.string,
    eventNaming: t.string,
    startDate: t.string,
    endDate: t.string,
    eventButtonType: t.union([t.string, t.null]),
    eventButtonUrl: t.string,
    eventPath: t.union([t.string, t.null]),
    eventBannerUrl: t.string,
    eventPageUrl: t.string,
    eventType: t.string,
    eventQty: t.number,
    eventGoodsImageUrl: t.union([t.string, t.null]),
    eventGoodsName: t.union([t.string, t.null]),
  }),
);

const promotionEventListCodec = excess(
  t.type({
    content: t.array(promotionEventListContentCodec),
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
  }),
);

// 이벤트 매장 리스트
const promotionEventStoreListGoodsListCodec = excess(
  t.type({
    storeCode: t.string,
    posCode: t.string,
    posName: t.string,
    goodsCode: t.string,
    goodsName: t.string,
    isEventGoods: t.union([t.boolean, t.null]),
    goodsImage: t.string,
  }),
);

const promotionEventStoreListContentCodec = excess(
  t.type({
    storeCode: t.string,
    storeName: t.string,
    eventCode: t.union([t.string, t.null]),
    isEventStore: t.union([t.boolean, t.null]),
    goodsList: t.array(promotionEventStoreListGoodsListCodec),
  }),
);

const promotionEventStoreListCodec = excess(
  t.type({
    content: t.array(promotionEventStoreListContentCodec),
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
  }),
);

const promotionEventAllStoreContentCodec = excess(
  t.type({
    storeCode: t.string,
    storeName: t.union([t.string, t.null]),
    eventUse: t.number,
    addedDate: t.union([t.string, t.null]),
    deletedDate: t.union([t.string, t.null]),
  }),
);

const promotionEventAllStoreCodec = excess(
  t.type({
    content: t.array(promotionEventAllStoreContentCodec),
    currentPage: t.number,
    totalPages: t.number,
    pageSize: t.number,
    firstPage: t.boolean,
    lastPage: t.boolean,
  }),
);

export default {
  storeStatsListCodec,
  eventStockStateCodec,
  giftQuantityStockCodec,
  eventStatisticsDataCodec,
  prizeListCodec,
  alcoholContentResCodec,
  promotionEventListCodec,
  promotionEventListContentCodec,
  promotionEventStoreListCodec,
  promotionEventAllStoreCodec,
};
