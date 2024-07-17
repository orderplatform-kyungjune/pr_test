import { UploadRawFile } from 'element-plus';

export interface postExcelUploadData {
  storeCode: string;
  langTransFile: UploadRawFile;
}

export interface requestCategoryListExcelDownloadType {
  storeCode: string;
  type: string;
  page: number;
  perPage: number;
  searchTxt: string;
}

export interface orderTwoOptionGroupListType {
  T_order_good_option_group_no: string;
  T_order_store_good_code: string;
  option_group_name: string;
  lang: {
    ko: string;
    en: string;
    zh_hans: string;
    zh_hant: string;
    jp: string;
  };
}

export interface orderTwoOptionGroupListPlatformType {
  platform_good_option_group_no: string;
  platform_store_good_code: string;
  option_group_name: string;
  lang: {
    ko: string;
    en: string;
    zh_hans: string;
    zh_hant: string;
    jp: string;
  };
}

export interface orderTwoOptionMenuListType {
  T_order_good_option_no: string;
  T_order_store_good_option_code: string;
  T_order_store_good_option_name: string;
  lang: {
    ko: string;
    en: string;
    zh_hans: string;
    zh_hant: string;
    jp: string;
  };
}

export interface orderTwoOptionMenuListPlatformType {
  platform_good_option_no: string;
  platform_store_good_option_code: string;
  platform_store_good_option_name: string;
  lang: {
    ko: string;
    en: string;
    zh_hans: string;
    zh_hant: string;
    jp: string;
  };
}
