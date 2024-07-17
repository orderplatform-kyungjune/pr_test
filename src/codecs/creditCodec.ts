import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const allowedPaymentTypeCodec = excess(
  t.type({
    card: t.boolean,
    cash: t.boolean,
    byPrice: t.boolean,
    byMenu: t.boolean,
  }),
);

const tabletStatusResultDataCodec = excess(
  t.type({
    tabletStatusList: t.array(
      excess(
        t.type({
          tabletNumber: t.string,
          tabletCode: t.string,
          posTableCode: t.string,
          status: t.union([t.string, t.null]),
          isCreditUse: t.number,
          serialNumber: t.union([t.string, t.null]),
          vanType: t.union([t.string, t.null]),
          allowedPaymentType: t.union([allowedPaymentTypeCodec, t.null]),
        }),
      ),
    ),
  }),
);

const tabletStatusCodec = excess(
  t.type({
    resultCode: t.number,
    resultMessage: t.string,
    resultData: tabletStatusResultDataCodec,
  }),
);

const contentCodec = excess(
  t.type({
    id: t.number,
    no: t.number,
    tabletCode: t.string,
    storeCode: t.string,
    tabletNumber: t.string,
    totalAmount: t.number,
    completeAmount: t.number,
    balance: t.number,
    createdDatetime: t.string,
    paymentType: t.string,
    startProductName: t.string,
    otherProductSize: t.number,
  }),
);

const pendingListResultDataCodec = excess(
  t.type({
    totalElementCount: t.number,
    elementSizePerPage: t.number,
    totalPageCount: t.number,
    currentPageNo: t.number,
    numberOfElement: t.number,
    content: t.array(contentCodec),
  }),
);

const pendingListCodec = excess(
  t.type({
    resultCode: t.number,
    resultMessage: t.string,
    resultData: pendingListResultDataCodec,
  }),
);

const sendFCMLogContentCodec = excess(
  t.type({
    id: t.number,
    sender: t.union([t.string, t.null]),
    notiTitle: t.union([t.string, t.null]),
    notiBody: t.union([t.string, t.null]),
    sendMessage: excess(
      t.type({
        message: t.string,
        messageCode: t.string,
        messageData: excess(t.type({ orderKey: t.string })),
      }),
    ),
    messageId: t.union([t.string, t.null]),
    isSendSuccess: t.boolean,
    sendErrorCode: t.union([t.string, t.null]),
    sendErrorMessage: t.union([t.string, t.null]),
    isReceiveSuccess: t.boolean,
    forceReceiveSuccess: t.boolean,
    receiveDueDateTime: t.union([t.string, t.null]),
    receiveStatus: t.string,
    storeCode: t.string,
    tabletCode: t.string,
    ssaid: t.union([t.string, t.null]),
    sendDateTime: t.string,
  }),
);

const sendFCMLogResultDataCodec = excess(
  t.type({
    content: t.array(sendFCMLogContentCodec),
    currentPageNo: t.number,
    elementSizePerPage: t.number,
    numberOfElement: t.number,
    totalElementCount: t.number,
    totalPageCount: t.number,
  }),
);

const sendFCMLogCodec = excess(
  t.type({
    resultCode: t.number,
    resultData: sendFCMLogResultDataCodec,
    resultMessage: t.string,
  }),
);

const fcmDeviceListInfoContentCodec = excess(
  t.type({
    _comment: t.union([t.string, t.null]),
    id: t.number,
    storeCode: t.union([t.string, t.null]),
    storeName: t.union([t.string, t.null]),
    tabletCode: t.union([t.string, t.null]),
    tabletName: t.union([t.string, t.null]),
    fcmToken: t.union([t.string, t.null]),
    ssaid: t.string,
    ipAddr: t.string,
    createdDateTime: t.union([t.string, t.null]),
    modifiedDateTime: t.union([t.string, t.null]),
  }),
);

const fcmDeviceListInfoResultDataCodec = excess(
  t.type({
    content: t.array(fcmDeviceListInfoContentCodec),
    currentPageNo: t.number,
    elementSizePerPage: t.number,
    numberOfElement: t.number,
    totalElementCount: t.number,
    totalPageCount: t.number,
  }),
);

const fcmDeviceListInfoCodec = excess(
  t.type({
    resultCode: t.number,
    resultData: fcmDeviceListInfoResultDataCodec,
    resultMessage: t.string,
  }),
);

const fcmDeviceChangeHistoryContentCodec = excess(
  t.type({
    rev: t.number,
    revisionType: t.string,
    changePropertyName: t.array(t.string),
    deviceId: t.number,
    fcmtoken: t.union([t.string, t.null]),
    storeCode: t.union([t.string, t.null]),
    storeName: t.union([t.string, t.null]),
    tabletCode: t.union([t.string, t.null]),
    tabletName: t.union([t.string, t.null]),
    ssaid: t.string,
    ipAddr: t.string,
    changeDateTime: t.string,
  }),
);

const fcmDeviceChangeHistoryResultDataCodec = excess(
  t.type({
    content: t.array(fcmDeviceChangeHistoryContentCodec),
    currentPageNo: t.number,
    elementSizePerPage: t.number,
    numberOfElement: t.number,
    totalElementCount: t.number,
    totalPageCount: t.number,
  }),
);

const fcmDeviceChangeHistoryCodec = excess(
  t.type({
    resultCode: t.number,
    resultData: fcmDeviceChangeHistoryResultDataCodec,
    resultMessage: t.string,
  }),
);

export default {
  tabletStatusCodec,
  pendingListCodec,
  sendFCMLogCodec,
  fcmDeviceListInfoCodec,
  fcmDeviceChangeHistoryCodec,
};
