export interface torderMapListType {
  T_order_store_code: string;
  T_order_store_name: string;
  addr_x: number;
  addr_y: number;
}

export interface selectedStoreInfoType {
  name: string;
  code: string;
  address: string;
  selected?: boolean;
  total_cnt?: number;
  loc_cnt?: number;
}

export interface selectedMarkerType {
  value: any;
}
