import { ElMessageBox } from 'element-plus';
import {
  editPromotionEventType,
  forceWinnerQueryType,
  requestCreatePromotionType,
  requestEnrollStoreGoodsType,
  requestEventAllStoreListType,
  requestEventStockStateType,
  requestStatsDataType,
} from '@interface/promotion';
import endpoints from '@apis/endpoints';
import gatewayApi from '@apis/axios/gatewayApi';

// 매장별 통계 데이터 불러오기
export const requestStoreStatsList = (data: requestStatsDataType) => {
  const url = `${endpoints.promotion.date}?storeCode=${data.storeCode}&storeName=${data.storeName}&page=${data.currentPage}&orderStartDate=${data.today}&orderEndDate=${data.nextDay}`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 이벤트 경품 재고 현황
export const requestEventStockState = (data: requestEventStockStateType) => {
  const url = `${endpoints.promotion.phone_list}?page=${data.page}&size=${data.size}`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 경품 수량 재고(실시간) 조회
export const requestGiftStockList = () => {
  const url = endpoints.promotion.sum_list;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 이벤트 통계 리스트 조회
export const requestEventStatisticsData = () => {
  const url = `${endpoints.promotion.forAgency}?excelDownload=false`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 이벤트 참여자 정보
export const requestEventParticipantsInfoData = (
  page: number,
  query: string,
) => {
  const url = `${endpoints.promotion.join_list}?page=${page}${query}`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 핸드폰번호 수동 입력
export const requestEventManualPhoneNumSave = (
  orderKey: string,
  userPhone: string,
) => {
  const url = `${endpoints.promotion.forceUpdateUserPhone}?orderViewKey=${orderKey}&userPhone=${userPhone}`;
  return gatewayApi.put(url).catch((error) => error.response);
};

// 모든 매장 주류 통계 조회
export const requestAllStoreAlcohol = (page: number) => {
  const url = `${endpoints.promotion.forAllStore}?page=${page}`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 이벤트 참여매장 주류 통계 조회
export const requestEventStoreAlcohol = (page: number) => {
  const url = `${endpoints.promotion.forEventStore}?page=${page}`;
  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 이벤트 경품 리스트 조회
export const requestPrizeList = () => {
  const url = `${endpoints.promotion.prize_list}`;

  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 기프티콘 쿠폰 발송
export const requestSendCoupon = (
  orderViewKey: string,
  winGoodsId: number | null,
) => {
  const url = `${endpoints.promotion.sendCoupon}?orderViewKey=${orderViewKey}&winGoodsId=${winGoodsId}`;
  return gatewayApi.post(url);
};

// 기프티콘 쿠폰 재발송
export const requestResendCoupon = (winGoodsId: number | null) => {
  const url = `${endpoints.promotion.resendCoupon}?winGoodsId=${winGoodsId}`;
  return gatewayApi.post(url);
};

// 강제 당첨 처리
export const requestForceUpdateWinner = (query: forceWinnerQueryType) => {
  const url = `${endpoints.promotion.forceUpdateWinner}?orderViewKey=${query.orderViewKey}&userPhone=${query.userPhone}&prizeRank=${query.prizeRank}`;

  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// <--------------------------프로모션 이벤트-------------------------->

// 프로모션 이벤트 리스트 조회
export const requestPromotionEventList = () => {
  const url = endpoints.promotion.list;

  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 상세 조회
export const requestGetPromotionEvent = (eventNum: number) => {
  const url = `${endpoints.promotion.event}?eventNum=${eventNum}`;

  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 매장 조회
export const requestPromotionEventStoreList = (
  pageInfo: requestEventStockStateType,
  searchInfo: requestEventAllStoreListType,
) => {
  const url = `${endpoints.promotion.search_event}/${searchInfo.eventNum}?storeCode=${searchInfo.storeCode}&storeName=${searchInfo.storeName}&size=${pageInfo.size}&page=${pageInfo.page}`;

  return gatewayApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이미지 등록
export const requestUploadImage = (file: File) => {
  const url = endpoints.promotion.file;
  const fd = new FormData();
  fd.append('file', file);

  return gatewayApi
    .post(url, fd, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 추가
export const requestCreatePromotionEvent = (
  eventInfo: requestCreatePromotionType,
) => {
  const url = endpoints.promotion.event;

  return gatewayApi
    .post(url, eventInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.errorData.errorCode, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 수정하기
export const requestEditPromotionEvent = (
  eventNum: number,
  editData: editPromotionEventType,
) => {
  const url = `${endpoints.promotion.event}?eventNum=${eventNum}`;
  return gatewayApi
    .put(url, editData, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 매장 상품 이벤트 등록
export const requestEnrollStoreGoods = (
  storeInfo: requestEnrollStoreGoodsType,
  eventNum: number,
) => {
  const url = `${endpoints.promotion.register_event}/${eventNum}`;
  return gatewayApi
    .put(url, storeInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 프로모션 이벤트 매장 상품 이벤트 해제
export const requestRemoveStoreGoods = (
  storeInfo: requestEnrollStoreGoodsType,
  eventNum: number,
) => {
  const url = `${endpoints.promotion.remove_event}/${eventNum}`;
  return gatewayApi.delete(url, { data: storeInfo }).catch((error) => {
    if (error.response.status === 400 || error.response.status === 500) {
      ElMessageBox.alert(error.response.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

// 프로모션 이벤트 모든 매장 리스트
export const requestPromotionEventAllStore = (
  pageInfo: requestEventStockStateType,
  searchInfo: requestEventAllStoreListType,
) => {
  const url = `${endpoints.promotion.event_store}?page=${pageInfo.page}&size=${pageInfo.size}`;
  return gatewayApi
    .post(url, searchInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestStoreStatsList,
  requestEventStockState,
  requestGiftStockList,
  requestEventStatisticsData,
  requestEventParticipantsInfoData,
  requestEventManualPhoneNumSave,
  requestAllStoreAlcohol,
  requestPrizeList,
  requestEventStoreAlcohol,
  requestSendCoupon,
  requestForceUpdateWinner,
  requestPromotionEventList,
  requestGetPromotionEvent,
  requestCreatePromotionEvent,
  requestPromotionEventStoreList,
  requestEditPromotionEvent,
  requestEnrollStoreGoods,
  requestRemoveStoreGoods,
  requestPromotionEventAllStore,
  requestUploadImage,
  requestResendCoupon,
};
