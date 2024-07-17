/**
 * 통합인증 승인 상태
 * 0:신청, 1:승인, 2:거절, 3:재신청, 4:승인대기(보류), 5 매칭취소
 */
export type approveStateType = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 통합인증 거절 사유
 * 0:매장정보 불일치, 1:티오더 미이용 매장, 2:이미 연동된 매장, 3:기타, 4:가입보류, 5:매칭취소
 */
export type disapproveReasonType = 0 | 1 | 2 | 3 | 4 | 5;

export interface memberRegisterDefaultStoreInfoType {
  id: number;
  uuid: string;
  storeName: string;
  storeAreaName: string;
  userName: string;
  userTel: string;
  taxFileUrl: string;
  torderId: string;
  taxId: string;
  storeCode: string;
  approveState: approveStateType;
  approveStateName: string;
  approveStateDate: string;
  approveMemo: string;
  managerId: string;
  managerName: string;
  created_at: string;
  updated_at: string;
  displayTaxId: string; // for ui, not api
  displayUserTel: string; // for ui, not api
}

export interface memberRegisterSearchStoreInfoType {
  info: {
    [key: string]: string | boolean | undefined;
    taxId: string;
    userTel: string;
    torderId: string;
    userName: string;
    storeName: string;
    storeAreaName: string;
  };
  checker: {
    [key: string]: string;
    taxId: string;
    userTel: string;
    torderId: string;
    userName: string;
    storeName: string;
    storeAreaName: string;
  };
  storeCode?: string; // for ui, not api
  storeMatched: 'Y' | 'N';
}

export interface memberRegisterSearchStoreInfoItemType {
  [key: string]: memberRegisterSearchStoreInfoType[],
}

export interface memberRegisterListItemType extends memberRegisterDefaultStoreInfoType {
  isCellSelectedTaxId: boolean, // for ui, not api
  isCellSelectedUserTel: boolean, // for ui, not api
}

export interface requestMemberRegisterDetailType {
  id: number, // 승인 요청 id
  withinSearchTxt?: string // 결과 내 검색 키워드
}

export interface memberRegisterDetailType extends memberRegisterDefaultStoreInfoType {
  matchingStoreInfo: {
    storeName: string,
    storeAreaName: string,
    userName: string,
    userTel: string,
    torderId: string,
    taxId: string,
    storeCode: string,
    displayTaxId: string, // for ui, not api
    displayUserTel: string, // for ui, not api
  }[],
  searchStoreInfo: memberRegisterSearchStoreInfoItemType[]
}

export interface memberRegisterHistoryType {
  registerId: number;
  approveState: approveStateType;
  historyType: string;
  description: string;
  managerId: string;
  managerName: string;
  confirmDateTime: string;
  registerDateTime: string;
}

export interface memberRegisterHistoryItemType
  extends memberRegisterDefaultStoreInfoType {
  history: memberRegisterHistoryType[];
}

export interface requestForcedStoreListType {
  id: number, // 승인 요청 id
  searchTxt: string // 강제 매칭 매장 keyword
  withinSearchTxt?: string // 강제 매칭 매장 결과 내 검색
}

export interface requestMemberRegisterStoreType {
  page: number;
  perPage: number;
  searchState: string;
  searchManager: string;
  searchKey: string;
  searchTxt: string;
  searchDateKey: string;
  searchStartDate: string;
  searchEndDate: string;

  [key: string]: any;
}

export interface requestUpdateRegisterInfoType {
  id: number;
  storeCode: string;
  torderId: string;
  storeAreaName?: string;
  userName?: string;
  userTel?: string;
  taxId?: string;
}

export interface requestUpdateRegisterStateType {
  id: number;
  storeCode?: string; // 승인: 필수 / 매장정보 불일치로 거절할 때 필요 (어떤 정보 불일치인지 기록용)
  torderId?: string; // 매장 ID: 승인일 때에만 필수
  approveState?: 0 | 1 | 2; // 1 승인, 2 거절
  approveType?: disapproveReasonType;
  approveMemo?: string;
}

export interface storeDataForUpdateType {
  storeCode: string;
  torderId: string;
  // 이하 수정 가능
  areaName: string;
  userName: string;
  phoneNumber: string;
  taxId: string;
  displayTaxId?: string; // for ui, not api
  // 거절사유
  approveType?: disapproveReasonType;
  approveMemo?: string;
}

export interface memberRegisterSearchDataType {
  // 통합 인증 상태: (0:신청, 1:승인, 2:반려, 3:재신청, 4:승인대기(보류))
  state: '' | '0,3' | '1' | '2' | '4'; // 각각 전체, 승인 요청, 승인 완료, 승인 거절, 승인 보류
  manager: string;
  txtKey: 'storeName' | 'userName' | 'userTel' | 'torderId' | 'taxId';
  txt: string;
  dateKey: 'approve' | 'register';
  dateRange: string[];
  checkedToday: boolean;
  excludingTestStores?: 'Y' | 'N' | '';
}

export interface memberRegisterApproveModalDataType {
  isOpen: boolean,
  fromTotal: boolean,
  approveState: approveStateType | undefined,
  approveType: disapproveReasonType | undefined,
  disapproveReasonList: { label: string, type: number }[]
  message: {
    title: string,
    titleElType: 'danger' | 'primary', // element-plus type: 색상지정을 위함
    msgArr: string[],
    memo: string,
    memoPlaceholder: string,
    memoBytes: number,
  },
  onDismiss: () => void
  onSubmit: () => void
}

// 모달에서 단일 정보 업데이트 가능한 데이터
export type singleDataUpdateKeyType =
  | 'storeName'
  | 'storeAreaName'
  | 'userName'
  | 'userTel'
  | 'taxId';
