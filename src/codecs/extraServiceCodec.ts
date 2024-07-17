import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const responseExtraServiceUsed = excess(t.type({ isUsed: t.boolean }));

const responseExtraServiceDisplay = excess(
  t.type({
    isUsed: t.boolean,
    isIconDisplay: t.union([t.boolean, t.null]),
  }),
);

const responseExtraServiceStoreListCodec = excess(
  t.type({
    storeId: t.number,
    storeCode: t.string,
    storeName: t.string,
    auction: responseExtraServiceUsed,
    chatting: responseExtraServiceDisplay,
    tableGame: responseExtraServiceDisplay,
    zep: responseExtraServiceDisplay,
    jackpot: responseExtraServiceUsed,
  }),
);

const responseExtraServiceStoreListDataCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    storeList: t.array(responseExtraServiceStoreListCodec),
  }),
);

const requestChattingInfoListDataCodec = excess(
  t.type({
    storeCode: t.string,
    storeName: t.string,
    guideMessageList: t.array(t.string),
  }),
);

const requestChattingInfoListCodec = excess(
  t.type({
    resultCode: t.number,
    resultMessage: t.string,
    data: requestChattingInfoListDataCodec,
  }),
);

const requestChattingQuickListDataCodec = excess(
  t.type({
    storeCode: t.string,
    storeName: t.string,
    guideMessageList: t.array(t.string),
  }),
);

const requestChattingQuickListCodec = excess(
  t.type({
    resultCode: t.number,
    resultMessage: t.string,
    data: requestChattingQuickListDataCodec,
  }),
);

const responseExtraServiceTableGameListHistoryCodec = excess(
  t.type({
    gameStartDateTime: t.string,
    endDateTime: t.string,
    roomKey: t.string,
    gameName: t.string,
    betType: t.string,
    betDetail: t.string,
    gameGeneratedTable: t.string,
    victoryTableList: t.array(t.string),
    defeatTableList: t.array(t.string),
    roomId: t.number,
    status: t.string,
  }),
);

const gameStatList = t.type({
  gameCode: t.string,
  gameName: t.string,
  allGameCount: t.number,
  generatedGameCount: t.number,
  completedGameCount: t.number,
  onGoingGameCount: t.number,
  abandonedGameCount: t.number,
  abandonedGamePercentage: t.number,
});

const responseExtraServiceTableGameRoomStatCodec = t.type({
  allGameCount: t.number,
  generatedGameCount: t.number,
  completedGameCount: t.number,
  onGoingGameCount: t.number,
  abandonedGameCount: t.number,
  abandonedGamePercentage: t.number,
  gameStatList: t.array(gameStatList),
  goodsCount: t.number,
  customCount: t.number,
  billCount: t.number,
});

const responseExtraServiceTableGameListCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    from: t.number,
    to: t.number,
    gameCountHistoriesSearchList: t.array(
      responseExtraServiceTableGameListHistoryCodec,
    ),
  }),
);

const responseExtraServiceTableGameCodec = excess(
  t.type({
    resultCode: t.number,
    resultMessage: t.string,
    data: responseExtraServiceTableGameListCodec,
  }),
);

const responseExtraServiceAuctionScheduleListDataCodec = excess(
  t.type({
    no: t.number,
    scheduleId: t.number,
    goodsCode: t.string,
    goodsName: t.string,
    goodsPrice: t.number,
    startPrice: t.number,
    isRepeat: t.boolean,
    repeatDayList: t.array(t.boolean),
    startDateTime: t.string,
    runningTime: t.number,
    waitTime: t.number,
    repeatCount: t.number,
    status: t.boolean,
  }),
);

const responseExtraServiceAuctionScheduleListCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    from: t.number,
    to: t.number,
    storeGameHistoryList: t.array(
      responseExtraServiceAuctionScheduleListDataCodec,
    ),
  }),
);

const responseExtraServiceStoreInfoListCodec = excess(
  t.type({
    entertainmentCode: t.string,
    isUsed: t.boolean,
    isIconDisplay: t.boolean,
  }),
);

const responseExtraServiceStoreInfoCodec = excess(
  t.type({
    storeCode: t.string,
    storeName: t.string,
    version: t.type({
      torderWebVersion: t.string,
      masterWebVersion: t.string,
      torderAppVersion: t.string,
    }),
    chatting: responseExtraServiceStoreInfoListCodec,
    auction: responseExtraServiceStoreInfoListCodec,
    jackpot: responseExtraServiceStoreInfoListCodec,
    tableGame: responseExtraServiceStoreInfoListCodec,
    zep: responseExtraServiceStoreInfoListCodec,
  }),
);

const requestTableGameDetailInfoCodec = excess(
  t.type({
    no: t.number,
    eventDateTime: t.string,
    todTaId: t.string,
    eventCode: t.number,
    eventDescription: t.string,
  }),
);

const requestTableGameDetailRoomInfoCodec = excess(
  t.type({
    roomId: t.number,
    storeName: t.string,
    gameName: t.string,
    betType: t.string,
    betDetail: t.string,
    gameRoomCode: t.string,
    victoryTableList: t.array(t.string),
    defeatTableList: t.Array,
    status: t.string,
    roomEventList: t.array(requestTableGameDetailInfoCodec),
  }),
);

const responseExtraServiceGameGiftListCodec = excess(
  t.type({
    goodsOrder: t.number,
    gameGoodsUrl: t.string,
    goodsName: t.string,
    goodsCode: t.string,
    price: t.number,
    winGoodsCode: t.string,
    loseGoodsCode: t.string,
    winGoodsName: t.string,
    loseGoodsName: t.string,
    isShow: t.boolean,
    createdDateTime: t.string,
    modifiedDateTime: t.string,
    isGoodsRegistrable: t.boolean,
    isLoseGoodsRegistrable: t.boolean,
    isWinGoodsRegistrable: t.boolean,
  }),
);

const responseGameGoodsAvailabilityDtoCodec = excess(
  t.type({
    countProductRegistrable: t.number,
    countProductUnregistrable: t.number,
    countProductOnShow: t.number,
  }),
);

const responseExtraServiceGameGiftCodec = excess(
  t.type({
    gameGoodsList: t.array(responseExtraServiceGameGiftListCodec),
    gameGoodsAvailabilityDto: responseGameGoodsAvailabilityDtoCodec,
  }),
);

const responseTableGameSettingBetCodec = excess(
  t.type({
    betOrder: t.number,
    gameBetType: t.string,
    isEnabled: t.boolean,
    isMasterEnabled: t.boolean,
    maxPlayerCount: t.number,
  }),
);

const responseTableGameSettingDtoCodec = excess(
  t.type({
    gameStoreOrder: t.number,
    gameCode: t.string,
    gameId: t.number,
    gameImgUrl: t.string,
    gameName: t.string,
    isEnabled: t.boolean,
    isMasterEnabled: t.boolean,
    gameBetList: t.array(responseTableGameSettingBetCodec),
  }),
);

const responseTableGameSettingCodec = excess(
  t.type({
    storeCode: t.string,
    storeId: t.number,
    gameList: t.array(responseTableGameSettingDtoCodec),
  }),
);

const tableGameGoodsListCodec = t.array(
  t.type({
    goodsName: t.string,
    goodsType: t.string,
    fromStatus: t.boolean,
    toStatus: t.boolean,
    isRegistrable: t.boolean,
  }),
);

const responseScheduleChangeHistoryListCodec = excess(
  t.type({
    auctionScheduleId: t.union([t.number, t.undefined]),
    jackpotScheduleId: t.union([t.number, t.undefined]),
    type: t.string,
    modifiedName: t.string,
    modifiedDateTime: t.string,
  }),
);

const responseScheduleChangeHistoryCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    from: t.number,
    to: t.number,
    list: t.array(responseScheduleChangeHistoryListCodec),
  }),
);

const responseAuctionHistoryListCodec = excess(
  t.type({
    historyId: t.number,
    startDateTime: t.string,
    storeCode: t.string,
    storeName: t.string,
    eventType: t.string,
    goodsName: t.string,
    winTableCode: t.string,
    runningTime: t.number,
    status: t.string,
    goodsPrice: t.number,
    startPrice: t.number,
    bidPrice: t.number,
    statusName: t.string,
  }),
);
const responseAuctionHistoryCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    list: t.array(responseAuctionHistoryListCodec),
  }),
);

const responseDetailAuctionHistoryListCodec = excess(
  t.type({
    tableCode: t.string,
    bidPrice: t.number,
  }),
);

const responseDetailAuctionHistoryJsonCodec = excess(
  t.type({
    optionGoodsCode: t.string,
    qty: t.number,
    optionGoodsImgUrl: t.string,
    optionGoodsDisName: t.string,
  }),
);

const responseDetailAuctionHistoryCodec = excess(
  t.type({
    historyId: t.number,
    storeCode: t.string,
    eventType: t.string,
    status: t.string,
    startDateTime: t.string,
    runningTime: t.number,
    goodsCode: t.string,
    goodsUrl: t.string,
    goodsName: t.string,
    goodsPrice: t.number,
    optionGoodsJsonList: t.array(responseDetailAuctionHistoryJsonCodec),
    startPrice: t.number,
    totalBidCount: t.number,
    bidPrice: t.number,
    bidList: t.array(responseDetailAuctionHistoryListCodec),
  }),
);

const responseJackpotScheduleListCodec = excess(
  t.type({
    no: t.number,
    scheduleId: t.number,
    eventType: t.string,
    goodsName: t.string,
    goodsPrice: t.number,
    isRepeat: t.boolean,
    repeatDayList: t.array(t.boolean),
    startTime: t.string,
    waitTime: t.number,
    repeatCount: t.number,
    startDateTime: t.string,
    status: t.boolean,
  }),
);

const responseJackpotScheduleCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    jackpotScheduleList: t.array(responseJackpotScheduleListCodec),
  }),
);

const responseJackpotHistoryListCodec = excess(
  t.type({
    historyId: t.number,
    startDateTime: t.string,
    storeCode: t.string,
    storeName: t.string,
    eventType: t.string,
    goodsName: t.string,
    winTableCode: t.string,
    runningTime: t.number,
    status: t.string,
    joinTabletCount: t.number,
    statusName: t.string,
  }),
);

const responseJackpotHistoryCodec = excess(
  t.type({
    totalElementCount: t.number,
    totalPageCount: t.number,
    pageSize: t.number,
    pageNo: t.number,
    numberOfElement: t.number,
    historyList: t.array(responseJackpotHistoryListCodec),
  }),
);

const responseDetailJackpotHistoryCodec = excess(
  t.type({
    historyId: t.number,
    storeCode: t.string,
    startDateTime: t.string,
    runningTime: t.number,
    eventType: t.string,
    goodsUrl: t.string,
    goodsName: t.string,
    winTableName: t.string,
    joinTabletCount: t.number,
    status: t.string,
  }),
);

const responseSeatingPlanListCodec = excess(
  t.type({
    tableLayoutId: t.number,
    tableLayoutPosition: t.number,
    tableLayoutUrl: t.string,
    tableLayoutName: t.string,
    createdName: t.string,
    createdDateTime: t.string,
  }),
);

const responseSeatingPlanCodec = excess(
  t.type({ tableLayoutList: t.array(responseSeatingPlanListCodec) }),
);

const requestFirstCategoryListCodec = excess(
  t.type({
    storeCode: t.string,
    largeCategoryList: t.array(
      t.type({
        categoryCode: t.string,
        categoryName: t.string,
      }),
    ),
  }),
);

const requestSecondCategoryListCodec = excess(
  t.type({
    storeCode: t.string,
    largeCategoryCode: t.string,
    middleCategoryList: t.array(
      t.type({
        categoryCode: t.string,
        categoryName: t.string,
      }),
    ),
  }),
);

const requestProductListChildGoodsDataCodec = excess(
  t.type({
    goodsCode: t.string,
    goodsPosCode: t.string,
    goodsName: t.string,
    goodsDisplayName: t.string,
    goodsPrice: t.number,
    goodsUrl: t.string,
    isSale: t.boolean,
    isUsed: t.boolean,
    isPosDeleted: t.boolean,
    hasOption: t.boolean,
  }),
);

const requestProductListChildDataCodec = excess(
  t.type({
    categoryName: t.string,
    categoryCode: t.string,
    isUsed: t.boolean,
    goodsCount: t.number,
    goodsList: t.array(requestProductListChildGoodsDataCodec),
  }),
);

const requestProductListDataCodec = t.array(
  t.type({
    categoryName: t.string,
    categoryCode: t.string,
    isUsed: t.boolean,
    childCategoryList: t.array(requestProductListChildDataCodec),
  }),
);

const itemOptionListDataItemCodec = excess(
  t.type({
    optionSortNumber: t.number,
    optionCode: t.string,
    optionGoodsName: t.string,
    optionGoodsDisName: t.string,
    optionPrice: t.number,
    limitQty: t.number,
    isSale: t.boolean,
    optionGoodsImgUrl: t.string,
  }),
);

const itemOptionListDataCodec = excess(
  t.type({
    optionSortNumber: t.number,
    optionName: t.string,
    isRequired: t.boolean,
    limitSelectedCount: t.number,
    optionItemList: t.array(itemOptionListDataItemCodec),
  }),
);

const itemOptionListCodec = excess(
  t.type({
    storeCode: t.string,
    goodsCode: t.string,
    optionList: t.array(itemOptionListDataCodec),
  }),
);

const storeTableListCodec = t.array(
  t.type({
    tableName: t.string,
    taId: t.string,
    isOrdered: t.boolean,
  }),
);

const responseAuctionLogHistoryDataCodec = excess(
  t.type({
    historyId: t.number,
    startDateTime: t.string,
    storeCode: t.string,
    storeName: t.string,
    eventType: t.string,
    goodsName: t.string,
    winTableCode: t.string,
    runningTime: t.number,
    status: t.string,
    goodsPrice: t.number,
    bidPrice: t.string,
    startPrice: t.number,
    statusName: t.string,
  }),
);

const responseAuctionLogDataCodec = t.type({
  totalElementCount: t.number,
  totalPageCount: t.number,
  pageSize: t.number,
  pageNo: t.number,
  numberOfElement: t.number,
  from: t.number,
  to: t.number,
  historyList: t.array(responseAuctionLogHistoryDataCodec),
});

const responseJackpotLogHistoryDataCodec = excess(
  t.type({
    historyId: t.number,
    startDateTime: t.string,
    storeCode: t.string,
    storeName: t.string,
    eventType: t.string,
    goodsName: t.string,
    winTableCode: t.string,
    runningTime: t.number,
    status: t.string,
    joinTabletCount: t.number,
    statusName: t.string,
  }),
);

const responseJackpotLogDataCodec = t.type({
  totalElementCount: t.number,
  totalPageCount: t.number,
  pageSize: t.number,
  pageNo: t.number,
  numberOfElement: t.number,
  from: t.number,
  to: t.number,
  historyList: t.array(responseJackpotLogHistoryDataCodec),
});

const requestTableGameTorderGoodsListCodec = t.type({
  goodsCode: t.string,
  goodsName: t.string,
  goodsUrl: t.string,
  goodsPrice: t.number,
  winGoodsCode: t.string,
  loseGoodsCode: t.string,
  originalGoodsStatus: t.string,
  winGoodsStatus: t.string,
  loseGoodsStatus: t.string,
  goodsStatusValid: t.boolean,
});

const requestTableGameTorderGoodsCodec = t.type({
  gameGoodsList: t.array(requestTableGameTorderGoodsListCodec),
});

const requestTableGamePrizeGoodsListCodec = t.type({
  goodsCode: t.string,
  goodsName: t.string,
  goodsUrl: t.string,
  goodsPrice: t.number,
  goodsErrorStatus: t.type({
    goodsType: t.string,
    goodsStatus: t.string,
  }),
});
const requestTableGamePrizeGoodsCodec = t.type({
  gameGoodsList: t.array(requestTableGamePrizeGoodsListCodec),
});

// 게임 설정
const gameSettingBetCodec = excess(
  t.type({
    gameBetType: t.string,
    isEnabled: t.boolean,
    isMasterEnabled: t.boolean,
    maxPlayerCount: t.number,
    betOrder: t.number,
  }),
);

const gameSettingInfoCodec = excess(
  t.type({
    gameBetList: t.array(gameSettingBetCodec),
    gameCode: t.string,
    gameImgUrl: t.string,
    gameName: t.string,
    gameId: t.union([t.number, t.undefined]),
    isEnabled: t.boolean,
  }),
);

const responseGameSettingListCodec = excess(
  t.type({ gameSettingList: t.array(gameSettingInfoCodec) }),
);

export default {
  responseExtraServiceStoreListDataCodec,
  requestChattingInfoListCodec,
  requestChattingQuickListCodec,
  responseExtraServiceTableGameCodec,
  responseExtraServiceAuctionScheduleListCodec,
  responseExtraServiceStoreInfoCodec,
  requestTableGameDetailRoomInfoCodec,
  responseExtraServiceGameGiftCodec,
  responseTableGameSettingCodec,
  tableGameGoodsListCodec,
  responseScheduleChangeHistoryCodec,
  responseAuctionHistoryCodec,
  responseDetailAuctionHistoryCodec,
  responseJackpotScheduleCodec,
  responseJackpotHistoryCodec,
  responseDetailJackpotHistoryCodec,
  responseSeatingPlanCodec,
  requestFirstCategoryListCodec,
  requestSecondCategoryListCodec,
  requestProductListDataCodec,
  itemOptionListCodec,
  storeTableListCodec,
  responseAuctionLogDataCodec,
  responseJackpotLogDataCodec,
  requestTableGameTorderGoodsCodec,
  requestTableGamePrizeGoodsCodec,
  responseExtraServiceTableGameRoomStatCodec,
  responseGameSettingListCodec,
  gameSettingInfoCodec,
  responseTableGameSettingDtoCodec,
};
