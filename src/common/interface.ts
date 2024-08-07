export type apiResponseYesNoType = 'Y' | 'N';

export type storeCodeType = string;

export interface queryStorePosInfoType {
  code: string;
  posGoodCode: string;
}

export interface storePosInfoType {
  storeCode: storeCodeType;
  posGoodCode: string;
}
