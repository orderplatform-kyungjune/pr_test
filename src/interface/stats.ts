import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';

export interface requestDailyOrderStatsType {
  page: number;
  size: number;
  startDate: string;
  endDate: string;
}

export interface dailyOrderListType {
  [key: string]: string | number;
  no: number;
  date: string;
  cartPriceSum: number;
  cartCountOrderId: number;
  orderCnt: number;
  posSyncCnt: number;
  tabletRegiCnt: number;
  storeRegiCnt: number;
  userCnt: number;
}

export interface tableTotalPropType {
  columns: TableColumnCtx<dailyOrderListType>[];
  data: dailyOrderListType[];
}
