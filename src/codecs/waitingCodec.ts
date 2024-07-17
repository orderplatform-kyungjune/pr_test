import * as t from 'io-ts';

const waitingStoreConfigCodec = t.type({
  id: t.number,
  storeId: t.number,
  alimtalkEnabled: t.boolean,
  waitingNumberResetTime: t.string,
  waitingNumberResetTimeEnabled: t.boolean,
  expectedWaitingMinutes: t.number,
  isWaitingClosed: t.boolean,
  entranceLimitTimeEnabled: t.boolean,
  entranceLimitMinutes: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const waitingStoreItemCodec = t.type({
  tStoreCode: t.union([t.string, t.null]),
  name: t.string,
  phone: t.string,
  contractStartDate: t.string,
  contractEndDate: t.string,
  masterAppVersion: t.union([t.string, t.null]),
  userAppVersion: t.union([t.string, t.null]),
  loginId: t.string,
  loginPwd: t.string,
  config: t.union([waitingStoreConfigCodec, t.null]),
});

const waitingStoreListObjectCodec = t.type({
  stores: t.array(waitingStoreItemCodec),
});

const responseWaitingListCodec = t.type({
  resultCode: t.number,
  resultMessage: t.string,
  resultData: waitingStoreListObjectCodec,
});

const responseWaitingConfigCodec = t.type({
  resultCode: t.number,
  resultMessage: t.string,
  resultData: waitingStoreItemCodec,
});

export default {
  responseWaitingListCodec,
  responseWaitingConfigCodec,
};
