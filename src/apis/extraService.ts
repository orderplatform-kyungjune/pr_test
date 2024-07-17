import type { UploadRawFile } from 'element-plus';
import { ElMessageBox } from 'element-plus';
import {
  createCustomItemType,
  defaultPageNationInfoType,
  requestAuctionHistoryType,
  requestAuctionLogDataType,
  requestAuctionScheduleType,
  requestBulkUpdateExtraServiceType,
  requestExtraServiceAuctionScheduleListType,
  requestExtraServiceStoreListType,
  requestExtraServiceTableGameListType,
  requestJackpotScheduleType,
  requestTableGameListType,
  requestTableGameLogDataType,
  requestUpdateGameDetailType,
  requestUpdateSeatingPlanType,
  requestUpdateStoreInfoType,
  searchProductListType,
} from '@interface/extraService';
import endpoints from '@apis/endpoints';
import gatewayTokenApi from '@apis/axios/gatewayTokenApi';

// 매장 관리 - 매장 리스트
const requestExtraServiceStoreList = (
  data: requestExtraServiceStoreListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.search}?page=${data.page}&size=${data.size}`;

  if (data.storeName.length !== 0) {
    url = url.concat(`&storeName=${encodeURIComponent(data.storeName)}`);
  }
  if (data.chattingInUse !== 'all') {
    url = url.concat(`&chattingInUse=${data.chattingInUse}`);
  }
  if (data.chattingInDisplay !== 'all') {
    url = url.concat(`&chattingInDisplay=${data.chattingInDisplay}`);
  }
  if (data.auctionInUse !== 'all') {
    url = url.concat(`&auctionInUse=${data.auctionInUse}`);
  }
  if (data.jackpotInUse !== 'all') {
    url = url.concat(`&jackpotInUse=${data.jackpotInUse}`);
  }
  if (data.tableGameInUse !== 'all') {
    url = url.concat(`&tableGameInUse=${data.tableGameInUse}`);
  }
  if (data.tableGameInDisplay !== 'all') {
    url = url.concat(`&tableGameInDisplay=${data.tableGameInDisplay}`);
  }
  if (data.zepInUse !== 'all') {
    url = url.concat(`&zepInUse=${data.zepInUse}`);
  }
  if (data.zepInDisplay !== 'all') {
    url = url.concat(`&zepInDisplay=${data.zepInDisplay}`);
  }

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 속성 일괄 수정 */
const requestBulkUpdateExtraService = (
  data: requestBulkUpdateExtraServiceType,
) => {
  const url = endpoints.entertainmentAdmin.stores.search;

  return gatewayTokenApi
    .patch(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 정보 */
const requestDetailStoreInfo = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 채팅 안내 문구 리스트 */
const requestDetailChattingInfoList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/chatting/guide-messages`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 채팅 안내 문구 저장 */
const requestSaveDetailChattingInfo = (
  storeCode: string,
  message: { guideMessageList: string[] },
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/chatting/guide-messages`;

  return gatewayTokenApi
    .post(url, message, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 채팅 퀵메시지 리스트 */
const requestDetailChattingQuickMessageList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/chatting/quick-messages`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 채팅 퀵메시지 저장 */
const requestSaveDetailChattingQuickMessage = (
  storeCode: string,
  message: { quickMessageList: string[] },
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/chatting/quick-messages`;

  return gatewayTokenApi
    .post(url, message, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 테이블 게임 내역 리스트
const requestExtraServiceTableGameList = (
  data: requestExtraServiceTableGameListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.basic}/${data.storeCode}/table-game/histories`;
  url = url.concat(
    `?page=${data.page}&size=${data.size}&from=${data.from}&to=${data.to}&gameList=${data.gameList}&gameRoomStatusList=${data.gameRoomStatusList}`,
  );

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 테이블 게임 상태 리스트
const requestExtraServiceTableGameStatList = (
  data: requestExtraServiceTableGameListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.basic}/${data.storeCode}/table-game/histories/stat`;
  url = url.concat(
    `?page=${data.page}&size=${data.size}&from=${data.from}&to=${data.to}&gameList=${data.gameList}&gameRoomStatusList=${data.gameRoomStatusList}`,
  );

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 경매 스케줄 관리 내역
const requestExtraServiceAuctionScheduleList = (
  data: requestExtraServiceAuctionScheduleListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.basic}/${data.storeCode}/auction/schedules`;
  url = url.concat(
    `?page=${data.page}&size=${data.size}&days=${data.days}&dayCondition=${data.dayCondition}&status=${data.status}`,
  );

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 설정 - 게임설정 리스트 */
const requestTableGameSettingList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/game-setting`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 설정 - 개별 테이블 게임 상세 */
const requestTableGameDetail = (storeCode: string, gameId: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/game-setting/${gameId}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 설정 - 게임설정 변경 */
const requestUpdateTableGameSetting = (
  storeCode: string,
  gameList: { gameCodeList: string[] },
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/game-setting`;

  return gatewayTokenApi
    .put(url, gameList, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 설정 - 게임 상품 설정 리스트 */
const requestTableGameGiftSettingList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods-setting`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 매장 상세 정보 수정 */
const requestUpdateStoreInfo = (
  storeCode: string,
  storeInfo: requestUpdateStoreInfoType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/entertainment`;

  return gatewayTokenApi
    .put(url, storeInfo, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 내역 상세 정보 */
const requestTableGameDetailInfo = (num: number) => {
  const url = `${endpoints.entertainmentAdmin.games.histories}/${num}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 경매 스캐줄 등록 */
const requestCreateAuctionSchedule = (
  storeCode: string,
  data: requestAuctionScheduleType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules`;

  return gatewayTokenApi
    .post(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 경매 스케줄 상품 검색
const requestProductListData = (
  storeCode: string,
  data: searchProductListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/event-goods?`;
  url = url.concat(
    `category1=${data.category1}&category2=${data.category2}&goodsStatus=${data.goodsStatus}`,
  );
  url = url.concat(
    `&isDeletedInPos=${data.isDeletedInPos}&goodsSearchType=${data.goodsSearchType}&goodsName=${data.goodsName}`,
  );

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 - 게임 설정 수정 */
const requestUpdateTableGame = (
  storeCode: string,
  data: requestTableGameListType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/game-setting/management/update`;

  return gatewayTokenApi
    .put(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 테이블 게임 - 게임 상품 설정 - 상품 리스트 */
const requestTableGameGoodsList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods-setting/from/pos`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestAuctionScheduleHistory = (
  storeCode: string,
  pageInfo: defaultPageNationInfoType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules/change-histories?page=${pageInfo.page}&size=${pageInfo.size}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestAuctionHistory = (
  storeCode: string,
  data: requestAuctionHistoryType,
) => {
  const { page, size, to, from, results } = data;
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/histories?page=${page}&size=${size}&to=${to}&from=${from}&results=${results}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDetailAuctionHistory = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/histories/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestAuctionLogDetailData = (id: number) => {
  const url = `${endpoints.entertainmentAdmin.auction.histories}/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestExtraServiceJackpotScheduleList = (
  data: requestExtraServiceAuctionScheduleListType,
) => {
  let url = `${endpoints.entertainmentAdmin.stores.basic}/${data.storeCode}/jackpot/schedules`;
  url = url.concat(
    `?page=${data.page}&size=${data.size}&days=${data.days}&dayCondition=${data.dayCondition}&status=${data.status}`,
  );

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestCreateTableGameSetting = (
  storeCode: string,
  goodsName: string,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods?request=${goodsName}`;

  return gatewayTokenApi
    .post(url, {}, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDeleteTableGameSetting = (
  storeCode: string,
  goodsName: string,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods?request=${goodsName}`;

  return gatewayTokenApi
    .delete(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestJackpotHistory = (
  storeCode: string,
  data: requestAuctionHistoryType,
) => {
  const { page, size, to, from, results } = data;
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/histories?page=${page}&size=${size}&to=${to}&from=${from}&results=${results}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDetailJackpotHistory = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/histories/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestSeatingPlanData = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-layouts`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestCreateSeatingPlan = (
  storeCode: string,
  imageFile: File,
  name: string,
) => {
  const requestData = { tableLayoutName: name };
  const fd = new FormData();
  fd.append('file', imageFile);
  fd.append(
    'request',
    new Blob([JSON.stringify(requestData)], { type: 'application/json' }),
  );

  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-layouts`;

  return gatewayTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDeleteSeatingPlan = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-layouts/${id}`;

  return gatewayTokenApi
    .delete(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateSeatingPlan = (
  storeCode: string,
  data: requestUpdateSeatingPlanType,
) => {
  const { tableLayoutId, tableLayoutName, file } = data;
  const requestData = { tableLayoutName };
  const fd = new FormData();
  if (file) {
    fd.append('file', file);
  }
  fd.append(
    'request',
    new Blob([JSON.stringify(requestData)], { type: 'application/json' }),
  );
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-layouts/${tableLayoutId}`;

  return gatewayTokenApi
    .put(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestJackpotScheduleHistory = (
  storeCode: string,
  pageInfo: defaultPageNationInfoType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules/change-histories?page=${pageInfo.page}&size=${pageInfo.size}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDeleteAuctionSchedule = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules/${id}`;

  return gatewayTokenApi
    .delete(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDeleteJackpotSchedule = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules/${id}`;

  return gatewayTokenApi
    .delete(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestFirstCategoryList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/categories`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestSecondCategoryList = (storeCode: string, code: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/categories/${code}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestProductOptionItemList = (storeCode: string, code: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/event-goods/${code}/options`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDetailAuctionScheduleData = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateAuctionSchedule = (
  storeCode: string,
  data: requestAuctionScheduleType,
  id: number,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules/${id}`;

  return gatewayTokenApi
    .put(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestStoreTableData = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/tablets`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestCreateJackpotSchedule = (
  storeCode: string,
  data: requestJackpotScheduleType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules`;

  return gatewayTokenApi
    .post(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateJackpotSchedule = (
  storeCode: string,
  data: requestJackpotScheduleType,
  id: number,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules/${id}`;

  return gatewayTokenApi
    .put(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestDetailJackpotScheduleData = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateJackpotUse = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/jackpot/schedules/${id}/status`;

  return gatewayTokenApi
    .put(url, {}, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateAuctionUse = (storeCode: string, id: number) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/auction/schedules/${id}/status`;

  return gatewayTokenApi
    .put(url, {}, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestCheckCustomItem = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/custom-item`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUploadCustomItem = (storeCode: string, imageFile: File) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/custom-item/image`;
  const fd = new FormData();
  fd.append('file', imageFile);

  return gatewayTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestCreateCustomItem = (
  storeCode: string,
  data: createCustomItemType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/custom-item`;

  return gatewayTokenApi
    .post(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestProductOptionData = (storeCode: string, code: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/event-goods/${code}/options`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestAuctionLogData = (data: requestAuctionLogDataType) => {
  const url = `${endpoints.entertainmentAdmin.auction.histories}?page=${data.page}&size=${data.size}&results=${data.results}&from=${data.from}&to=${data.to}&query=${data.query}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestJackpotLogData = (data: requestAuctionLogDataType) => {
  const url = `${endpoints.entertainmentAdmin.jackpot.histories}?page=${data.page}&size=${data.size}&results=${data.results}&from=${data.from}&to=${data.to}&query=${data.query}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestJackpotLogDetailData = (id: number) => {
  const url = `${endpoints.entertainmentAdmin.jackpot.histories}/${id}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTableGameLogDataList = (data: requestTableGameLogDataType) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.entertainmentAdmin.games.search}?page=${data.page}&size=${data.size}&storeName=${data.storeName}&from=${data.from}&to=${data.to}&gameList=${data.gameList}&gameRoomStatusList=${data.gameRoomStatusList}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTableGameLogDataStatList = (data: requestTableGameLogDataType) => {
  // eslint-disable-next-line vue/max-len
  const url = `${endpoints.entertainmentAdmin.games.stat}?page=${data.page}&size=${data.size}&query=${data.storeName}&from=${data.from}&to=${data.to}&gameList=${data.gameList}&gameRoomStatusList=${data.gameRoomStatusList}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestServiceSettingHistory = (
  storeCode: string,
  pagination: defaultPageNationInfoType,
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/entertainment/changes?page=${pagination.page}&size=${pagination.size}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTableGameTorderGoodsList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/torder-goods`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTableGamePrizeGoodsList = (storeCode: string) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestUpdateTableGameGoodsList = (
  storeCode: string,
  goodsList: { goodsCodeList: string[] },
) => {
  const url = `${endpoints.entertainmentAdmin.stores.basic}/${storeCode}/table-game/goods`;

  return gatewayTokenApi
    .post(url, goodsList, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 부가서비스 설정 > 게임설정 : 게임 리스트 요청
const requestGameSettingList = () => {
  const url = endpoints.entertainmentAdmin.games.settings;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 부가서비스 설정 > 게임설정 : 개별 게임 상세 요청
const requestGameDetail = (gameId: string) => {
  const url = `${endpoints.entertainmentAdmin.games.settings}/${gameId}`;

  return gatewayTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 부가서비스 설정 > 게임설정 : 게임 상세 - 게임 이미지 변경
const requestUploadGameImage = (gameId: number, image: UploadRawFile) => {
  const url = `${endpoints.entertainmentAdmin.games.settings}/${gameId}/image`;

  const fd = new FormData();
  fd.append('image', image);

  return gatewayTokenApi
    .put(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 부가서비스 설정 > 게임설정 : 게임 상세 - 게임 상세 변경
const requestUpdateGameInfo = (
  gameId: number,
  data: requestUpdateGameDetailType,
) => {
  const url = `${endpoints.entertainmentAdmin.games.settings}/${gameId}`;

  return gatewayTokenApi
    .put(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestExtraServiceStoreList,
  requestBulkUpdateExtraService,
  requestDetailStoreInfo,
  requestDetailChattingInfoList,
  requestSaveDetailChattingInfo,
  requestDetailChattingQuickMessageList,
  requestSaveDetailChattingQuickMessage,
  requestExtraServiceTableGameList,
  requestExtraServiceAuctionScheduleList,
  requestTableGameSettingList,
  requestTableGameDetail,
  requestTableGameGiftSettingList,
  requestUpdateStoreInfo,
  requestTableGameDetailInfo,
  requestCreateAuctionSchedule,
  requestProductListData,
  requestUpdateTableGame,
  requestTableGameGoodsList,
  requestAuctionScheduleHistory,
  requestAuctionHistory,
  requestDetailAuctionHistory,
  requestExtraServiceJackpotScheduleList,
  requestCreateTableGameSetting,
  requestJackpotHistory,
  requestDetailJackpotHistory,
  requestSeatingPlanData,
  requestCreateSeatingPlan,
  requestDeleteSeatingPlan,
  requestUpdateSeatingPlan,
  requestJackpotScheduleHistory,
  requestDeleteAuctionSchedule,
  requestDeleteJackpotSchedule,
  requestFirstCategoryList,
  requestSecondCategoryList,
  requestProductOptionItemList,
  requestDetailAuctionScheduleData,
  requestUpdateAuctionSchedule,
  requestStoreTableData,
  requestCreateJackpotSchedule,
  requestUpdateJackpotSchedule,
  requestDetailJackpotScheduleData,
  requestUpdateJackpotUse,
  requestUpdateAuctionUse,
  requestCheckCustomItem,
  requestUploadCustomItem,
  requestCreateCustomItem,
  requestProductOptionData,
  requestAuctionLogData,
  requestJackpotLogData,
  requestTableGameLogDataList,
  requestServiceSettingHistory,
  requestJackpotLogDetailData,
  requestAuctionLogDetailData,
  requestDeleteTableGameSetting,
  requestTableGameTorderGoodsList,
  requestTableGamePrizeGoodsList,
  requestUpdateTableGameGoodsList,
  requestExtraServiceTableGameStatList,
  requestTableGameLogDataStatList,
  requestGameSettingList,
  requestGameDetail,
  requestUploadGameImage,
  requestUpdateGameInfo,
  requestUpdateTableGameSetting,
};
