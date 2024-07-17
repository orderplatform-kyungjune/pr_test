export interface requestCsInquiryDataType {
  page: number;
  perPage: number;
  searchCategory1: string;
  searchCategory2: string;
  searchKeyword: string;
  searchStat: string;
  searchChecker: string;
  searchEnquirer: string;
  searchEnquirerHp: string;
  searchComment: string;
  searchStoreCode: string;
  searchStoreName: string;
  searchIncoming: string;
}

export interface requestCsInquiryCommonParamType {
  for_create?: string;
}

export interface inquiryCommentDataType {
  no: number;
  num: number;
  cs_incoming: string;
  cs_incoming_name: string;
  cs_incoming_stat: string;
  cs_incoming_stat_name: string;
  context: string;
  bbsDate: string;
  bbsRegisterDate: string;
  checker: string;
  checker_id: string;
}

export interface csInquiryBoardListDataType {
  num: number;
  storeCode: string;
  category1: string;
  category2: string;
  keyword: string;
  stat: string;
  stat_name: string;
  enquirer: string;
  enquirerHp: string;
  checker: string;
  title: string;
  context: string;
  contexorderTwo?: string;
  bbsRegisterDate: string;
  complain: string;
  complain_name: string;
  comment?: inquiryCommentDataType[];
}

export interface statListDataType {
  code: number;
  name: string;
}

export interface storeInfoType {
  code: string;
  value: string;
}

export interface categoryDefaultType {
  name: string;
  code: string;
  for_create: string;
}

export interface categoryFirstType {
  name: string;
  code: string;
  for_create: string;
  child: categoryDefaultType[];
}

export interface selectOptionDataType {
  code: number;
  name: string;
}

export interface selectOptionType {
  value: string;
  label: string;
}

export interface storeListType {
  T_order_store_code: string;
  T_order_store_name: string;
}

export interface storeInquiryListType {
  num: number;
  storeCode: string;
  category1: string;
  category2: string;
  keyword: string;
  stat: string;
  stat_name: string;
  enquirer: string;
  enquirerHp: string;
  checker: string;
  checker_id: string;
  title: string;
  context: string;
  contexorderTwo?: string;
  bbsRegisterDate: string;
  complain: string;
  complain_name: string;
}

export interface requestCreateInquiryType {
  storeCode: string;
  category1: string;
  category2: string;
  keyword: string;
  stat: string | number;
  enquirer: string;
  enquirerHp: string;
  title: string;
  context: string;
  contexorderTwo?: string;
}

export interface requestUpdateInquiryType {
  num: number;
  storeCode: string;
  category1: string;
  category2?: string;
  keyword: string;
  stat: string | number;
  enquirer: string;
  enquirerHp: string;
  title: string;
  context: string;
  contexorderTwo?: string;
}

export interface inquiryDetailInfoType {
  num: number;
  storeCode: string;
  category1: string;
  category2: string;
  keyword: string;
  stat: string;
  enquirer: string;
  enquirerHp: string;
  checker: string;
  title: string;
  context: string;
  contexorderTwo?: string;
  bbsRegisterDate: string;
}

export interface requestWeekChartDataType {
  type: string;
  year: number;
  weekDay: number;
  categoryType?: string;
}
export interface responseWeekChartDateSetsType {
  label: string;
  fill: boolean;
  data: number[];
}
export interface responseWeekChartDataType {
  labels: string[];
  datasets: responseWeekChartDateSetsType[];
}

export interface requestWeekCommentListType {
  year: number;
  weekDay: number;
  context?: string;
}
