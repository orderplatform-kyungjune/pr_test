export interface requestStatsDataType {
  currentPage?: number;
  today: string;
  nextDay: string;
  storeCode?: string;
  storeName?: string;
  excelDownload?: boolean;
}

export interface storeStatsListDateResListType {
  id: number;
  saveDate: string;
  storeName: string;
  storeCode: string;
  tabletCnt: number;
  orderCnt: number;
  orderGoodsQty: number;
  joinCnt: number;
  winnerCnt: number;
  loserCnt: number;
  firstPrizeCnt: number;
  secondPrizeCnt: number;
  thirdPrizeCnt: number;
  fourthPrizeCnt: number;
  phoneInputedCnt: number;
  phoneNotInputedCnt: number;
}

export interface storeStatsListType {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  firstPage: boolean;
  lastPage: boolean;
  dateResList: storeStatsListDateResListType[];
}

export interface requestEventStockStateType {
  page: number;
  size: number;
}

export interface eventStockStateContentType {
  createdDateTime: string;
  modifiedDateTime: string;
  id: number;
  date: string;
  prize1Sum: number;
  prize1PhoneInputed: number;
  prize1PhoneNotInputed: number;
  prize1LeftStock: number;
  prize2Sum: number;
  prize2PhoneInputed: number;
  prize2PhoneNotInputed: number;
  prize2LeftStock: number;
  prize3Sum: number;
  prize3PhoneInputed: number;
  prize3PhoneNotInputed: number;
  prize3LeftStock: number;
  prize4Sum: number;
  prize4PhoneInputed: number;
  prize4PhoneNotInputed: number;
  prize4LeftStock: number;
  phoneInputedSum: number;
  totalLeftStock: number;
}

export interface giftQuantityStockType {
  prizeRank: number;
  prizeStock: number;
  prizeName: string;
  exhaustedCount: number;
  leftoverCount: number;
}
export interface contentType {
  eventStoreCnt: number;
  id: number;
  joinSum: number;
  loserSum: number;
  orderGoodsQtySum: number;
  orderStoreCnt: number;
  orderSum: number;
  phoneInputedSum: number;
  phoneNotInputedSum: number;
  saveDate: string;
  winnerSum: number;
  orderApplicationPercentage1?: string;
  orderApplicationPercentage2?: string;
  winnerPercentage1?: string;
  winnerPercentage2?: string;
}

export interface eventStatisticsDataType {
  content: contentType[];
  currentPage: number;
  firstPage: boolean;
  lastPage: boolean;
  pageSize: number;
  totalPages: number;
}

export interface joinResListType {
  forceInputStatus: boolean;
  giftShowSendRes: string;
  joinAge: string;
  joinAgree: boolean;
  joinDate: string;
  joinGender: string;
  joinStatus: boolean;
  joinUserPhone: string;
  orderDate: string;
  orderId: number;
  orderViewKey: string;
  posData: string;
  prizeName: string;
  prizeRank: number;
  resultId: number;
  storeCode: string;
  storeName: string;
  tableNum: string;
  winningNumber?: number | string;
}

export interface storeAlcoholContentType {
  cassOrderCnt: number;
  cassOrderQty: number;
  chamisulOrderCnt: number;
  chamisulOrderQty: number;
  chumchurumOrderCnt: number;
  chumchurumOrderQty: number;
  createdDateTime: string;
  date: string;
  id: number;
  jinroOrderCnt: number;
  jinroOrderQty: number;
  kloudOrderCnt: number;
  kloudOrderQty: number;
  saeroOrderCnt: number;
  saeroOrderQty: number;
  teraOrderCnt: number;
  teraOrderQty: number;
  eventStoreCnt?: number;
  kellyOrderCnt: number;
  kellyOrderQty: number;
}

export interface prizeListType {
  createdDateTime: string;
  id: number;
  imageUrl: string;
  modifiedDateTime: string;
  name: string;
  prizeRate: number;
  ranks: number;
  stock: number;
}

export interface forceWinnerQueryType {
  orderViewKey: string;
  userPhone: string;
  prizeRank: string;
}

export interface requestCreatePromotionType {
  eventEngName: string;
  eventKorName: string;
  eventGoodsName: string;
  eventStartDate: string;
  eventEndDate: string;
  eventButtonUrl: string;
  eventBannerUrl: string;
  eventPageUrl: string;
  eventGoodsImageUrl: string;
}

export interface promotionEventListType {
  num: number;
  eventName: string;
  eventNaming: string;
  startDate: string;
  endDate: string;
  eventButtonType: string;
  eventButtonUrl: string;
  eventPath: string;
  eventBannerUrl: string;
  eventPageUrl: string;
  eventType: string;
  eventQty: number;
  eventGoodsImageUrl: string;
  eventGoodsName: string;
  eventDate?: string[];
  bannerImage?: string;
  buttonImage?: string;
  pageImage?: string;
  goodsImage?: string;
}

export interface eventStoreListGoodsListType {
  goodsCategoryNames: string[];
  goodsCode: string;
  goodsImageUrl: string;
  goodsName: string;
  goodsPrice: number;
  isEventGoods: boolean | null;
  posGoodsCode: string;
  posGoodsName: string;
}

export interface eventStoreListType {
  storeCode: string;
  storeName: string;
  eventCode: string;
  isEventStore: boolean | null;
  goodsList: eventStoreListGoodsListType[];
  goodsImage: string;
}

export interface editPromotionEventType {
  eventStartDate: string;
  eventEndDate: string;
  eventButtonUrl: string;
  eventBannerUrl: string;
  eventPageUrl: string;
  eventGoodsImageUrl: string;
}

export interface requestEnrollStoreGoodsType {
  storeCode: string;
  goodsCode?: string;
}

export interface requestPromotionEventStoreListType {
  eventNum: number;
  storeCode?: string;
  storeCodeList?: string[];
  storeName?: string;
  goodsCnt?: number;
  isEventStore?: boolean;
}

export interface requestEventAllStoreListType {
  eventNum: number;
  storeCode: string;
  storeName: string;
}

export interface eventAllStoreListType {
  storeCode: string;
  storeName: string;
  eventUse: number;
  addedDate: string;
  deletedDate: string;
}
