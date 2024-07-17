/* eslint-disable camelcase */
export interface storeBannerListType {
  T_order_store_code: string;
  T_order_store_banner_name: string;
  T_order_store_banner_url: string;
  T_order_store_link_menu: string;
  T_order_store_banner_use: string;
  T_order_store_MSG_Number: number;
  T_order_store_banner_type: string;
  T_order_store_banner_sort: number;
  T_order_store_banner_time: number;
  id: number;
}

export interface storeBannerListPlatformType {
  platform_store_code: string;
  platform_store_banner_name: string;
  platform_store_banner_url: string;
  platform_store_link_menu: string;
  platform_store_banner_use: string;
  platform_store_MSG_Number: number;
  platform_store_banner_type: string;
  platform_store_banner_sort: number;
  platform_store_banner_time: number;
  id: number;
}

export interface requestBannerListParameterType {
  storeCode: string;
  page: number;
  perPage: number;
  searchTxt?: string;
}

export interface requestCreateBannerType {
  storeCode: string;
  bannerTitle: string;
  bannerFile: string;
  bannerImage: string;
}

export interface requestUpdateBannerType {
  storeCode: string;
  id: number;
  T_order_store_banner_use: string;
  T_order_store_banner_sort: number;
}

export interface requestUpdateBannerPlatformType {
  storeCode: string;
  id: number;
  platform_store_banner_use: string;
  platform_store_banner_sort: number;
}

export interface requestDeleteBannerType {
  storeCode: string;
  id: number;
}
