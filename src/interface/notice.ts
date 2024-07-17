export interface useNoticeListType {
  noticeId: number;
  noticeCategory: string;
  noticeStatus: number;
  noticeTitle: string;
  noticeFileStatus: number;
  noticePopupStatus: number;
  author: string;
  noticePostingStartDate: string | null;
  noticePostingEndDate: string | null;
  createDate: string;
  newStatus: number;
  topFix: number;
  noticeViews: number;
}

export interface useNoticeInfoType {
  totalContentCount: number;
  pageSize: number;
  currentPage: number;
  maxPageNo: number;
  noticeAdminList: useNoticeListType[] | [];
  noticeSearchType?: 'TITLE' | 'DESC';
  noticeSearchQuery?: string;
  createdDate?: string;
  endDate?: string;
}

export interface noticeStoreListType {
  storeCode: string;
  storeName: string;
}

export interface noticeFileListType {
  fileName: string;
  filePath: string;
  fileSize: number;
}

export interface useNoticeDetailInfoType {
  noticeId: number | null;
  author: string;
  createDate?: string;
  noticeCategory: string;
  noticeDesc: string;
  noticeFileList: noticeFileListType[];
  noticeFileStatus?: number;
  noticeStoreList: noticeStoreListType[];
  noticePopupEndDate: null | string;
  noticePopupEndTime: null | number | string;
  noticePopupEndMinute: null | number | string;
  noticePopupStartDate: null | string;
  noticePopupStartTime: null | number | string;
  noticePopupStartMinute: null | number | string;
  noticePopupStatus: number;
  noticePostingEndDate: null | string;
  noticePostingEndTime: null | number | string;
  noticePostingEndMinute: null | number | string;
  noticePostingStartDate: null | string;
  noticePostingStartTime: null | number | string;
  noticePostingStartMinute: null | number | string;
  noticePostingStatus: number;
  noticePopupPostingStatus: number;
  noticeStatus: number;
  noticeTitle: string;
  noticeTopFix: number;
  noticeUrgent: number;
}

export interface useStoreListType {
  storeCode: string;
  storeName: string;
  noticeViews: number;
  lastViewDate: string;
}

export interface useNoticeViewsListDataType {
  totalContentCount: number;
  pageSize: number;
  currentPage: number;
  maxPageNo: number;
  noticeViewsList: useStoreListType[];
}

export interface categoriesType {
  [key: string]: string;
}

export interface getStoreListParamType {
  searchQuery: string;
  searchType: 'STORE_NAME' | 'STORE_CODE';
  noticeId: string;
}

export interface searchStoreListType {
  storeCode: string;
  storeName: string;
}

export interface storeListType {
  searchStoreList: searchStoreListType[];
  selectStoreList: searchStoreListType[];
}

export interface detailViewCountInfoType {
  noticeId: string;
  noticeTitle: string;
}

export interface searchNoticeDetailViewParamsType {
  searchTxt: string;
  searchType: string[];
  noticeId: string;
}

export interface sortResType {
  column: string;
  prop: string;
  order: string;
}
