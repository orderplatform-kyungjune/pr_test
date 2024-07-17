export interface requestTabletLogListParamType {
  page: number;
  perPage: number;
  searchStoreCodeOrName: string;
  searchStartDate: string;
  searchEndDate: string;
  searchIP?: string;
  searchOrderKey?: string;
}

export interface remakePaymentLogListType {
  searchStoreCodeOrName: string;
  page: number;
  perPage: number;
  searchDate: [string, string];
  searchIP: string;
  searchOrderKey: string;
}

export interface logOrderInfoType {
  goods_code: string;
  qty: string;
}

export interface tabletPosLogDataType {
  id: number;
  T_order_store_code: string;
  T_order_store_name: string;
  orderKey: string;
  T_order_tablet_id: string;
  T_order_tablet_name: string;
  T_order_store_ip: string;
  T_order_agent_info: string;
  T_order_order_info: logOrderInfoType[];
  OrderDate: string;
  data_time: string;
}

export interface tabletGetOrderLogDataType {
  id: number;
  T_order_store_code: string;
  T_order_store_name: string;
  T_order_order_message: string;
  T_order_tablet_id: string;
  T_order_tablet_name: string;
  T_order_store_ip: string;
  T_order_tablet_result_time: string;
  orderDate: string;
  data_time: string;
}

export interface orderViewRedisLogDataType {
  id: number;
  T_order_store_code: string;
  T_order_store_name: string;
  data_type: string;
  T_order_tablet_id: string;
  T_order_tablet_name: string;
  order_key: string;
  errorMsg: string;
  requestIP: string;
  data_date: string;
  data_time: string;
}

export interface tabletCartLogDataType {
  T_order_idx: number;
  T_order_store_code: string;
  T_order_store_name: string;
  T_order_cart_id: string;
  T_order_tablet_id: string;
  T_order_tablet_name: string;
  T_order_store_good_code: string;
  T_order_store_good_name: string;
  T_order_store_good_qty: string;
  T_order_store_cart_memo: string;
  T_order_store_order_device: string;
  T_order_store_cart_stat: string;
  T_order_store_cart_price: string;
  T_order_store_cart_point_use: string;
  T_order_store_coupon_price: string;
  T_order_store_cart_date: string;
  T_order_store_cart_time: string;
}

export interface productsDbInfoType {
  cartShow: number;
  category: string[];
  code: string;
  disPlayname: string;
  eventProduct: number;
  img: string;
  name: string;
  posCode: string;
  price: number;
  sale: string;
  use: string;
}

export interface productsPosInfoType {
  id: string;
  name: string;
  price: number;
}

export interface productInfoType {
  ProductsDbInfo: productsDbInfoType;
  ProductsPosInfo: productsPosInfoType;
}

export interface orderInfoType {
  amount: number;
  code: string;
  message: string;
  optionPrice: number;
  productInfo: productInfoType;
  productPrice: number;
  qty: number;
  salePrice: number;
  status: number;
}

export interface tableListInfoDataType {
  TabletCreditJson?: [];
  TabletCreditPrice?: number;
  TabletMisu?: number;
  TabletOrderPrice?: number;
  TabletOrderType?: string;
  creditWay: string[];
  orderInfo?: orderInfoType[];
  tabletId: string;
  tabletName: string;
  vanType: string;
}

export interface tableListInfoType {
  data: tableListInfoDataType[];
}

export interface paymentAndroidLogListType {
  transaction_log_id: number;
  store_code: string;
  store_name: string;
  order_key: string;
  payment_request_key: string;
  acquirer: string;
  acquirer_code: string;
  amount: number;
  approval_datetime: string;
  approval_month: string;
  approval_number: string;
  approval_type: string;
  business_no: string;
  card_number: string;
  created_datetime: string;
  device_id: string;
  error_message: string;
  formatted_approval_datetime: string;
  ip_address: string;
  is_success: string;
  issuer: string;
  issuer_code: string;
  message: string;
  modified_datetime: string;
  payment_id: string;
  payment_method: string;
  payment_raw_data: string;
  receipt_data: string;
  response_code: string;
  status: string;
  receipt_type: string;
  svc: string;
  tablet_code: string;
  tax_free: string;
  terminal_id: string;
  van_type: string;
  vat: number;
}

export interface paymentWebLogListType {
  transaction_web_log_id: number;
  store_name: string;
  store_code: string;
  order_key: string;
  status: string;
  ip_address: string;
  tablet_code: string;
  error_code: string;
  created_datetime: string;
  modified_datetime: string;
}
