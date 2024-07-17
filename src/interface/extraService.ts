export interface requestExtraServiceStoreListType {
  page: number;
  size: number;
  storeName: string;
  chattingInUse?: boolean | string;
  auctionInUse?: boolean | string;
  jackpotInUse?: boolean | string;
  tableGameInUse?: boolean | string;
  zepInUse?: boolean | string;
  chattingInDisplay?: boolean | string;
  tableGameInDisplay?: boolean | string;
  zepInDisplay?: boolean | string;
}

export interface responseExtraServiceStoreListType {
  storeId: number;
  storeCode: string;
  storeName: string;
  auction: {
    isUsed: boolean | null;
  };
  chatting: {
    isUsed: boolean | null;
    isIconDisplay: boolean | null;
  };
  tableGame: {
    isUsed: boolean | null;
    isIconDisplay: boolean | null;
  };
  zep: {
    isUsed: boolean | null;
    isIconDisplay: boolean | null;
  };
  jackpot: {
    isUsed: boolean | null;
  };
}

export interface responseExtraServiceStoreListDataType {
  totalElementCount: number;
  totalPageCount: number;
  pageSize: number;
  pageNo: number;
  numberOfElement: number;
  storeList: responseExtraServiceStoreListType[];
}

export interface requestBulkUpdateExtraServiceType {
  entertainmentCode: string;
  isUsed: boolean;
  isIconDisplay: boolean;
  storeCodeList: string[];
}

export interface requestExtraServiceTableGameListType {
  storeCode: string;
  page: number;
  size: number;
  from: string;
  to: string;
  gameList: string;
  gameRoomStatusList: string;
}

export interface responseExtraServiceTableGameListType {
  no: number;
  gameStartDateTime: Date;
  endDateTime: Date;
  roomKey: string;
  gameName: string;
  betType: string;
  betDetail: string;
  victoryTableList: string[];
  defeatTableList: string[];
  roomId: number;
  status: string;
  gameGeneratedTable: string;
}

export interface requestExtraServiceAuctionScheduleListType {
  storeCode: string;
  page: number;
  size: number;
  days: string;
  dayCondition: string;
  status: string;
}

export interface responseExtraServiceAuctionScheduleListType {
  no: number;
  scheduleId: number;
  goodsCode: string;
  goodsName: string;
  goodsPrice: number;
  startPrice: number;
  isRepeat: boolean;
  repeatDayList: boolean[];
  startDateTime: string;
  runningTime: number;
  waitTime: number;
  repeatCount: number;
  status: boolean;
}

export interface responseExtraServiceStoreInfoListType {
  entertainmentCode: string;
  isUsed: boolean;
  isIconDisplay: boolean;
}

export interface responseExtraServiceStoreVersionType {
  torderWebVersion: string;
  masterWebVersion: string;
  torderAppVersion: string;
}

export interface responseExtraServiceStoreInfoType {
  storeCode: string;
  storeName: string;
  version: responseExtraServiceStoreVersionType;
  chatting: responseExtraServiceStoreInfoListType;
  auction: responseExtraServiceStoreInfoListType;
  jackpot: responseExtraServiceStoreInfoListType;
  tableGame: responseExtraServiceStoreInfoListType;
  zep: responseExtraServiceStoreInfoListType;
}

export interface requestTableGameSettingListBetType {
  gameBetType: string;
  isEnabled: boolean;
  isMasterEnabled: boolean;
  maxPlayerCount: number;
}

export interface requestTableGameSettingListDtoType {
  gameStoreOrder: number;
  gameCode: string;
  gameImgUrl: string;
  gameName: string;
  isEnabled: boolean;
  isMasterEnabled: boolean;
  gameBetList: requestTableGameSettingListBetType[];
}

export interface requestTableGameSettingListType {
  storeCode: string;
  storeId: number;
  gameList: requestTableGameSettingListDtoType[];
}

export interface requestTableGameGiftSettingListType {
  goodsOrder: number;
  gameGoodsUrl: string;
  goodsName: string;
  goodsCode: string;
  price: number;
  winGoodsCode: string;
  loseGoodsCode: string;
  winGoodsName: string;
  loseGoodsName: string;
  isShow: boolean;
  createdDateTime: string;
  modifiedDateTime: string;
  isGoodsRegistrable: boolean;
  isLoseGoodsRegistrable: boolean;
  isWinGoodsRegistrable: boolean;
}

export interface requestUpdateStoreInfoType {
  entertainmentList: {
    entertainmentCode: string;
    isUsed: boolean;
    isIconDisplay?: boolean;
  }[];
}

export interface requestTableGameDetailRoomInfoType {
  no: number;
  eventDateTime: string;
  todTaId: string;
  eventCode: number;
  eventDescription: string;
}

export interface requestTableGameDetailInfoType {
  roomId: number;
  storeName: string;
  gameName: string;
  betType: string;
  betDetail: string;
  gameRoomCode: string;
  victoryTableList: string[];
  defeatTableList: string[];
  status: string;
  roomEventList: requestTableGameDetailRoomInfoType[];
}

export interface requestTableGameStatusGameType {
  gameCode: string;
  gameName: string;
  allGameCount: number;
  generatedGameCount: number;
  completedGameCount: number;
  onGoingGameCount: number;
  abandonedGameCount: number;
  abandonedGamePercentage: number;
}

export interface requestTableGameStatusType {
  allGameCount: number;
  generatedGameCount: number;
  completedGameCount: number;
  onGoingGameCount: number;
  abandonedGameCount: number;
  abandonedGamePercentage: number;
  goodsCount: number;
  customCount: number;
  billCount: number;
  gameStatList: requestTableGameStatusGameType;
}

export interface requestOptionItemType {
  optionGoodsCode: string;
  qty: number;
  optionGoodsImgUrl: string;
  optionGoodsDisName: string;
}

export interface responseHistoryTableType {
  tableCode: string;
  tableName: string;
}

export interface requestAuctionScheduleType {
  isRepeat: boolean;
  repeatDayList?: boolean[];
  isSetDateTime?: boolean;
  startDate?: string;
  startTime?: string;
  isCustom: boolean;
  goodsCode: string;
  goodsUrl: string;
  goodsName: string;
  goodsPrice: number;
  optionGoodsJsonList: requestOptionItemType[];
  isExceedMaxPrice: boolean;
  startPrice: number;
  quickPrice: string;
  waitTime: number;
  runningTime: number;
  themeCode: string;
  isAgree: boolean;
  customItemId: number | undefined;
}

export interface requestJackpotScheduleType {
  eventType: string;
  isRepeat: boolean;
  repeatDayList?: boolean[];
  isSetDateTime?: boolean;
  startDate?: string;
  startTime?: string;
  isCustom: boolean;
  goodsCode: string;
  goodsUrl: string;
  goodsName: string;
  goodsPrice: number;
  optionGoodsJsonList: requestOptionItemType[];
  isAgree: boolean;
  isMinimumParticipation: boolean;
  minimumParticipation: number;
  storeTableJsonList: responseHistoryTableType[];
  waitTime: number;
}

export interface updateAuctionScheduleType {
  scheduleId: number;
  storeCode: string;
  status: boolean;
  isDeleted: boolean;
  eventType: string;
  isRepeat: boolean;
  isSetDateTime: boolean;
  startDateTime: string;
  repeatDayList: boolean[];
  repeatTime: string;
  repeatCount: number;
  isCustom: boolean;
  goodsCode: string;
  goodsName: string;
  goodsPrice: number;
  goodsUrl: string;
  optionGoodsJsonList: requestOptionItemType[];
  isExceedMaxPrice: boolean;
  startPrice: number;
  quickPrice: string;
  joinType: string;
  runningTime: number;
  waitTime: number;
  themeCode: string;
  isAgree: boolean;
  customItemId: number;
}

export interface updateJackpotScheduleType {
  scheduleId: number;
  storeCode: string;
  status: boolean;
  isDeleted: boolean;
  eventType: string;
  isRepeat: boolean;
  isSetDateTime: boolean;
  startDateTime: string;
  repeatDayList: boolean[];
  repeatTime: string;
  repeatCount: number;
  isCustom: boolean;
  goodsCode: string;
  goodsName: string;
  goodsPrice: number;
  goodsUrl: string;
  optionGoodsJsonList: requestOptionItemType[];
  joinType: string;
  isAgree: boolean;
  isMinimumParticipation: boolean;
  minimumParticipation: number;
  joinTableList: responseHistoryTableType[];
  waitTime: number;
  customItemId: number;
}

export interface searchProductListType {
  category1: string;
  category2: string;
  goodsStatus: string;
  isDeletedInPos: boolean;
  goodsSearchType: string;
  goodsName: string;
}

export interface productDataListChildGoodsOptionItemType {
  code: string;
  name: string;
  displayname: string;
  price: number;
  limit_qty: number;
  img: string;
  isSale: number;
  sort_number: number;
}
export interface productDataListChildGoodsOptionType {
  name: string;
  require: number;
  limit_select: number;
  require_flag: number;
  sort_number: number;
  option_items: productDataListChildGoodsOptionItemType[];
}

export interface productDataListChildGoodsType {
  goodsCode: string;
  goodsPosCode: string;
  goodsName: string;
  goodsDisplayName: string;
  goodsPrice: number;
  goodsUrl: string;
  isSale: boolean;
  isUsed: boolean;
  isPosDeleted: boolean;
  hasOption: boolean;
}

export interface productDataListChildType {
  categoryName: string;
  categoryCode: string;
  isUsed: boolean;
  goodsCount: number;
  goodsList: productDataListChildGoodsType[];
}

export interface productDataListType {
  categoryName: string;
  categoryCode: string;
  isUsed: boolean;
  childCategoryList: productDataListChildType[];
}

export interface productItemOptionItemType {
  code: string;
  name: string;
  displayname: string;
  price: number;
  limit_qty: number;
  img: string;
  isSale: number;
  sort_number: number;
}

export interface productItemOptionType {
  name: string;
  require: number;
  limit_select: number;
  require_flag: number;
  sort_number: number;
  option_items: productItemOptionItemType[];
}

export interface productItemDataType {
  goodName: string;
  price: number;
  image: string;
  goodDpName: string;
  goodUse: number;
  goodSale: number;
  posDelete: number;
  goodCode: string;
  posGoodCode: string;
  option: productItemOptionType[];
}

export interface requestTableGameBetListType {
  gameBetType: string;
  isEnabled: boolean;
  maxPlayerCount: number;
}

export interface requestTableGameListType {
  gameCode: string;
  isEnabled: boolean;
  gameBetList: requestTableGameBetListType[];
}

export interface tableGameGoodsListType {
  goodsName: string;
  goodsType: string;
  fromStatus: boolean;
  toStatus: boolean;
  isRegistrable: boolean;
}

export interface scheduleHistoryListType {
  auctionScheduleId?: number;
  jackpotScheduleId?: number;
  type: string;
  modifiedName: string;
  modifiedDateTime: string;
}

export interface requestAuctionHistoryType {
  page: number;
  size: number;
  from: string;
  to: string;
  results: string;
}

export interface responseAuctionHistoryType {
  historyId: number;
  startDateTime: string;
  storeCode: string;
  storeName: string;
  eventType: string;
  goodsName: string;
  winTableCode: string;
  runningTime: number;
  status: string;
  goodsPrice: number;
  bidPrice: number;
  startPrice: number;
  statusName: string;
}

export interface responseHistoryOptionType {
  optionGoodsCode: string;
  qty: number;
  optionGoodsImgUrl: string;
  optionGoodsDisName: string;
}

export interface responseDetailAuctionHistoryType {
  historyId: number;
  storeCode: string;
  eventType: string;
  status: string;
  statusName: string;
  startDateTime: string;
  runningTime: number;
  goodsCode: string;
  goodsUrl: string;
  goodsName: string;
  goodsPrice: number;
  optionGoodsJsonList: responseHistoryOptionType[];
  startPrice: number;
  totalBidCount: number;
  bidPrice: number;
  bidList: {
    tableCode: string;
    bidPrice: number;
  }[];
}

export interface jackpotScheduleListType {
  no: number;
  scheduleId: number;
  eventType: string;
  goodsName: string;
  goodsPrice: number;
  isRepeat: boolean;
  repeatDayList: boolean[];
  startTime: string;
  waitTime: number;
  repeatCount: number;
  startDateTime: Date;
  status: boolean;
}

export interface jackpotScheduleType {
  totalElementCount: number;
  totalPageCount: number;
  pageSize: number;
  pageNo: number;
  numberOfElement: number;
  jackpotScheduleList: jackpotScheduleListType[];
}

export interface responseDetailJackpotHistoryType {
  historyId: number;
  storeCode: string;
  startDateTime: string;
  runningTime: number;
  eventType: string;
  goodsUrl: string;
  goodsName: string;
  winTableName: string;
  joinTabletCount: number;
  status: string;
}

export interface responseSeatingPlanType {
  tableLayoutId: number;
  tableLayoutPosition: number;
  tableLayoutUrl: string;
  tableLayoutName: string;
  createdName: string;
  createdDateTime: string;
}

export interface requestUpdateSeatingPlanType {
  tableLayoutId: number;
  tableLayoutName: string;
  file?: File;
}

export interface requestFirstCategoryListType {
  categoryCode: string;
  categoryName: string;
}

export interface itemOptionListDataItemType {
  optionSortNumber: number;
  optionCode: string;
  optionGoodsName: string;
  optionGoodsDisName: string;
  optionPrice: number;
  limitQty: number;
  isSale: boolean;
  optionGoodsImgUrl: string;
}

export interface itemOptionListDataType {
  optionSortNumber: number;
  optionName: string;
  isRequired: boolean;
  limitSelectedCount: number;
  optionItemList: itemOptionListDataItemType[];
}
export interface itemOptionListType {
  storeCode: string;
  goodsCode: string;
  optionList: itemOptionListDataType[];
}

export interface storeTableListType {
  tableName: string;
  taId: string;
  isOrdered: boolean;
}

export interface defaultPageNationInfoType {
  page: number;
  size: number;
}

export interface createCustomItemType {
  customItemPosName: string;
  customItemPrice: number;
  customItemName: string;
  customItemImageUrl: string;
  customItemCode: string;
}

export interface optionItemListType {
  optionSortNumber: number;
  optionCode: string;
  optionGoodsName: string;
  optionGoodsDisName: string;
  optionPrice: number;
  limitQty: number;
  isSale: boolean;
  isUsed: boolean;
  optionGoodsImgUrl: string;
  qty?: number;
}

export interface productOptionListType {
  optionSortNumber: number;
  optionName: string;
  isRequired: boolean;
  limitSelectedCount: number;
  optionItemList: optionItemListType[];
}

export interface requestAuctionLogDataType {
  page: number;
  size: number;
  results: string;
  from: string;
  to: string;
  query: string;
}

export interface responseAuctionLogHistoryDataType {
  historyId: number;
  startDateTime: string;
  storeCode: string;
  storeName: string;
  eventType: string;
  goodsName: string;
  winTableCode: string;
  runningTime: number;
  status: string;
  goodsPrice: number;
  bidPrice: number;
  startPrice: number;
  statusName: string;
}

export interface responseAuctionLogDataType {
  totalElementCount: number;
  totalPageCount: number;
  pageSize: number;
  pageNo: number;
  numberOfElement: number;
  from: number;
  to: number;
  historyList: responseAuctionLogHistoryDataType[];
}

export interface responseJackpotLogDataType {
  historyId: number;
  startDateTime: string;
  storeCode: string;
  storeName: string;
  eventType: string;
  goodsName: string;
  winTableCode: string;
  runningTime: number;
  status: string;
  joinTabletCount: number;
  statusName: string;
}

export interface requestTableGameLogDataType {
  storeName: string;
  gameList: string;
  from: string;
  to: string;
  page: number;
  size: number;
  gameRoomStatusList: string;
}

export interface responseGameGoodsAvailabilityDtoType {
  countProductRegistrable: number;
  countProductUnregistrable: number;
  countProductOnShow: number;
}

export interface serviceSettingHistoryListType {
  entertainmentType: string;
  isUsed: boolean;
  isIconDisplay: boolean;
  modifiedName: string;
  modifiedDateTime: string;
}

export interface serviceSettingHistoryType {
  totalElementCount: number;
  totalPageCount: number;
  pageSize: number;
  pageNo: number;
  numberOfElement: number;
  from: number;
  to: number;
  changeHistoryList: serviceSettingHistoryListType[];
}

export interface requestTableGameGoodsErrorStatusType {
  goodsType: string;
  goodsStatus: string;
}

export interface requestTableGamePrizeGoodsType {
  goodsCode: string;
  goodsName: string;
  goodsUrl: string;
  goodsPrice: number;
  goodsErrorStatus: requestTableGameGoodsErrorStatusType;
}

export interface requestTableGameTorderGoodsListType {
  goodsCode: string;
  goodsName: string;
  goodsUrl: string;
  goodsPrice: number;
  winGoodsCode: string;
  loseGoodsCode: string;
  originalGoodsStatus: string;
  winGoodsStatus: string;
  loseGoodsStatus: string;
  goodsStatusValid: boolean;
}

// 게임 설정
export interface gameSettingBetType {
  gameBetType: string;
  maxPlayerCount: number;
  isEnabled: boolean;
}

export interface gameSettingType {
  gameBetList: gameSettingBetType[];
  gameCode: string;
  gameImgUrl: string;
  gameName: string;
  gameId: number;
  isEnabled: boolean;
}

export interface requestUpdateGameDetailType {
  gameImgUrl: string;
  isEnabled: boolean;
  gameBetList: gameSettingBetType[];
}
