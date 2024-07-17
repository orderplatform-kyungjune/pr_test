<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, routeHelper, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { singleStoreSetting } from '@router/routePaths';
import { storeDataType, storeStateListDataType } from '@interface/store';
import { selectBoxType } from '@interface/member';
import { CaretBottom, CaretTop, RefreshRight, Search } from '@element-plus/icons-vue';
import { AddMemberShipModal, AddStoreModal, StoreManageModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { ADD_MEMBER_SHIP, ADD_STORE, STORE_LIST, STORE_MANAGE_MODAL } from '@common/string';
import { memberCodec, storeCodec } from '@codecs';
import { endpoints, member, store, tablet } from '@apis';

const {
  requestTorderTotalStoreList,
  requestStoreStateListData,
  requestApkVersionList,
  requestPosInformationList,
} = store;
const { requestCorporationList } = member;
const { requestLoadVanTypeList } = tablet;
const {
  storeTotalListCodec,
  storeStateListCodec,
  vanListCodec,
  apkVersionListCodec,
  posInformationListCodec,
} = storeCodec;
const { selectBoxListCodec } = memberCodec;
const { runtimeCheck } = runtimeCheckHelper;
const {
  failAuthenticationAlert,
  checkAuthFunction,
  isBrand1Admin,
  getAdminBusinessInfo,
} = authentication;
const { downloadExcelPostWithToken } = useExcelDownload();
const { openModal, openModalWithData, flag } = useModalStore();
const { pushPageWithQuery } = routeHelper;
const route = useRoute();

const searchTypes = [
  {
    value: '',
    label: '전체',
  },
  {
    value: 'storeName',
    label: '태블릿 노출 매장명',
  },
  {
    value: 'storeOriginName',
    label: '매장명',
  },
  {
    value: 'storeArea',
    label: '지점명',
  },
  {
    value: 'tablet_login_id',
    label: '태블릿 ID',
  },
  {
    value: 'storeCode',
    label: '매장 코드',
  },
];
const torderVersionTypes = [
  {
    value: '0',
    label: '티오더 1',
  },
  {
    value: '1',
    label: '티오더 2',
  },
];

// header props
const singleStoreSettingHeader = reactive([{ name: STORE_LIST }]);

const isSearchOpen: Ref<boolean> = ref(false);
const excelDownloadState: Ref<boolean> = ref(false);

const openSearch = () => {
  isSearchOpen.value = true;
};

const closeSearch = () => {
  isSearchOpen.value = false;
};

const contractStat = (route.query.searchStatArray as string) ?? '';
const apiVersionType = (route.query.searchApiVersionArray as string) ?? '';
const posInfo = (route.query.searchPosInfoArray as string) ?? '';
const vanInfo = (route.query.searchVanInfoArray as string) ?? '';
const apkVersion = (route.query.searchApkVersionArray as string) ?? '';
const defaultBusinessType = isBrand1Admin() ? '' : 'torder';

// 매장 검색
const searchWord = reactive({
  searchType: (route.query.searchType as string) ?? '', // 검색타입
  searchTxt: (route.query.searchTxt as string) ?? '', // 검색어
  searchStatArray: contractStat.split(';').filter((stat) => stat !== ''), // 매장 계약 상태
  searchApiVersionArray: apiVersionType
    .split(';')
    .filter((stat) => stat !== ''), // 티오더 버전
  searchPaymentType: (route.query.searchPaymentType as string) ?? '', // 결제 유형
  searchPosInfoArray: posInfo.split(';').filter((stat) => stat !== ''), // pos 정보
  searchVanInfoArray: vanInfo.split(';').filter((stat) => stat !== ''), // van사 정보
  searchApkVersionArray: apkVersion.split(';').filter((stat) => stat !== ''), // 앱버전
  searchTestStoreYN: (route.query.searchTestStoreYN as string) ?? '', // 테스트 매장
  searchBusinessType:
    (route.query.searchBusinessType as string) || getAdminBusinessInfo().code, // 사업체 구분: 기본값 '티오더'
  searchDate: [
    (route.query.searchStartDate as string) ?? '',
    (route.query.searchEndDate as string) ?? '',
  ], // 등록일자
});

// 페이지네이션 정보
const paginationInfo = reactive({
  page: Number(route.query.page),
  pageSize: Number(route.query.pageSize),
  from: 1,
  to: 20,
  total: 0,
});

const excelDownloadData = ref<number[]>([]);

/** 페이지당 개수 */
const pagePerCount = [
  {
    label: '20개씩 보기',
    value: 20,
  },
  {
    label: '30개씩 보기',
    value: 30,
  },
  {
    label: '40개씩 보기',
    value: 40,
  },
  {
    label: '50개씩 보기',
    value: 50,
  },
  {
    label: '100개씩 보기',
    value: 100,
  },
];

/** 사업체 리스트 */
const corporationListData: Ref<selectBoxType[]> = ref([]);
const getCorporationListData = async () => {
  try {
    const res = (await requestCorporationList()) as AxiosResponse;
    const typeError = runtimeCheck(selectBoxListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        corporationListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 리스트 */
const storeList: Ref<storeDataType[]> = ref([]);
/** 매장 리스트 정보 불러오기 */
const getStoreTotalList = async () => {
  try {
    const data = {
      page: paginationInfo.page,
      perPage: paginationInfo.pageSize,
      searchType: searchWord.searchType,
      searchTxt: searchWord.searchTxt,
      searchStatArray: searchWord.searchStatArray.length
        ? searchWord.searchStatArray?.join(';')
        : '',
      searchApiVersionArray: searchWord.searchApiVersionArray.length
        ? searchWord.searchApiVersionArray?.join(';')
        : '',
      searchPaymentType: searchWord.searchPaymentType,
      searchPosInfoArray: searchWord.searchPosInfoArray.length
        ? searchWord.searchPosInfoArray?.join(';')
        : '',
      searchVanInfoArray: searchWord.searchVanInfoArray.length
        ? searchWord.searchVanInfoArray?.join(';')
        : '',
      searchApkVersionArray: searchWord.searchApkVersionArray.length
        ? searchWord.searchApkVersionArray?.join(';')
        : '',
      searchTestStoreYN: searchWord.searchTestStoreYN,
      searchStartDate: searchWord.searchDate[0],
      searchEndDate: searchWord.searchDate[1],
      searchBusinessType:
        searchWord.searchBusinessType === 'all'
          ? ''
          : searchWord.searchBusinessType,
    };
    const res = (await requestTorderTotalStoreList(data)) as AxiosResponse;
    const typeError = runtimeCheck(storeTotalListCodec, res.data);
    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        storeList.value = res.data.data;
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.pageSize = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 계약 상태 리스트 */
const storeStateList = ref<storeStateListDataType[]>([]);
/** 매장 계약 상태 리스트 불러오기 */
const getStoreStateListInfo = async () => {
  try {
    const res = (await requestStoreStateListData()) as AxiosResponse;
    const typeError = runtimeCheck(storeStateListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        storeStateList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 엑셀 다운로드 */
const postExcelDownload = async () => {
  try {
    if (excelDownloadData.value.length > 13000) {
      ElMessage({
        type: 'error',
        message:
          '다운로드 최대 건수를 초과하였습니다. 기간을 다시 설정해 주세요.(최대 건수: 1만3천 건)',
      });
      return;
    }

    excelDownloadState.value = true;

    const requestData = {
      checkedNum: excelDownloadData.value,
      searchType: searchWord.searchType,
      searchTxt: searchWord.searchTxt,
      searchStatArray: searchWord.searchStatArray.length
        ? searchWord.searchStatArray?.join(';')
        : '',
      searchApiVersionArray: searchWord.searchApiVersionArray.length
        ? searchWord.searchApiVersionArray?.join(';')
        : '',
      searchPaymentType: searchWord.searchPaymentType,
      searchPosInfoArray: searchWord.searchPosInfoArray.length
        ? searchWord.searchPosInfoArray?.join(';')
        : '',
      searchVanInfoArray: searchWord.searchVanInfoArray.length
        ? searchWord.searchVanInfoArray?.join(';')
        : '',
      searchApkVersionArray: searchWord.searchApkVersionArray.length
        ? searchWord.searchApkVersionArray?.join(';')
        : '',
      searchTestStoreYN: searchWord.searchTestStoreYN,
      searchStartDate: searchWord.searchDate[0],
      searchEndDate: searchWord.searchDate[1],
      searchBusinessType: searchWord.searchBusinessType,
    };
    const date = new Date();
    const year = date.getFullYear();
    const month = `0${1 + date.getMonth()}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);

    await downloadExcelPostWithToken(
      `Store_${year}${month}${day}`,
      endpoints.excel.download_store_list,
      requestData,
    );
    excelDownloadState.value = false;
  } catch (error) {
    console.log(error);
  }
};

/** 페이지 이동, 검색 */
const setQueryData = () => {
  const searchData = {
    page: paginationInfo.page,
    pageSize: paginationInfo.pageSize,
    searchType: searchWord.searchType,
    searchTxt: searchWord.searchTxt,
    searchStatArray: searchWord.searchStatArray.length
      ? searchWord.searchStatArray.join(';')
      : '',
    searchApiVersionArray: searchWord.searchApiVersionArray.length
      ? searchWord.searchApiVersionArray.join(';')
      : '',
    searchPaymentType: searchWord.searchPaymentType,
    searchPosInfoArray: searchWord.searchPosInfoArray.length
      ? searchWord.searchPosInfoArray.join(';')
      : '',
    searchVanInfoArray: searchWord.searchVanInfoArray.length
      ? searchWord.searchVanInfoArray.join(';')
      : '',
    searchApkVersionArray: searchWord.searchApkVersionArray.length
      ? searchWord.searchApkVersionArray.join(';')
      : '',
    searchTestStoreYN: searchWord.searchTestStoreYN,
    searchStartDate: searchWord.searchDate ? searchWord.searchDate[0] : '',
    searchEndDate: searchWord.searchDate ? searchWord.searchDate[1] : '',
    searchBusinessType: searchWord.searchBusinessType,
  };

  pushPageWithQuery(singleStoreSetting, searchData);
};

const resetQueryDataAndSearchData = () => {
  searchWord.searchType = '';
  searchWord.searchTxt = '';
  searchWord.searchStatArray = [];
  searchWord.searchApiVersionArray = [];
  searchWord.searchPaymentType = '';
  searchWord.searchPosInfoArray = [];
  searchWord.searchVanInfoArray = [];
  searchWord.searchApkVersionArray = [];
  searchWord.searchTestStoreYN = '';
  searchWord.searchDate = [];
  searchWord.searchBusinessType = '';

  paginationInfo.page = 1;
  paginationInfo.pageSize = 20;

  setQueryData();
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 1;
  setQueryData();
};

/** 페이지네이션 */
const handleCurrentPage = async (val: number) => {
  paginationInfo.page = val;
  setQueryData();
};

/** 목록표 높이 */
const getTableHeight = () => {
  const parentsContainer = document.querySelector(
    '.default_layout_contents',
  ) as HTMLElement;

  let tableHeight = isSearchOpen.value ? 420 : 220;

  if (parentsContainer) {
    const rect = parentsContainer.getBoundingClientRect().height;

    if (storeList.value.length < 10) {
      tableHeight = (rect / 100) * 50.5;
    } else if (storeList.value.length >= 10 && storeList.value.length < 15) {
      tableHeight = (rect / 100) * 90;
    } else {
      tableHeight = (rect / 100) * 131;
    }
  }

  return tableHeight;
};

// 테이블 데이터 선택
const handleSelectionChange = (val: storeDataType[]) => {
  const target: number[] = [];
  val.forEach((storeInfo: storeDataType) => {
    target.push(storeInfo.num);
  });
  excelDownloadData.value = target;
};

const convertApkName = (apkName: string) => {
  const matchResult = apkName.match(/\d+(\.\d+)+/);
  return matchResult ? matchResult[0] : '';
};

const isFullSelectOfVanInfo: Ref<boolean> = ref(
  !searchWord.searchVanInfoArray.length,
);
const vanInfoList: Ref<string[]> = ref([]);

/** Van사 정보 리스트 */
const getVanTypeList = async () => {
  try {
    const res = (await requestLoadVanTypeList()) as AxiosResponse;
    const typeError = runtimeCheck(vanListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        vanInfoList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const isFullSelectOfApkVersion: Ref<boolean> = ref(
  !searchWord.searchApkVersionArray.length,
);
const apkVersionList: Ref<string[]> = ref([]);
/**  apk 버전 리스트 */
const getApkVersionList = async () => {
  try {
    const res = (await requestApkVersionList()) as AxiosResponse;
    const typeError = runtimeCheck(apkVersionListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        apkVersionList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const isFullSelectOfPosInfo: Ref<boolean> = ref(
  !searchWord.searchPosInfoArray.length,
);
const posInfoList: Ref<string[]> = ref([]);
/**  pos사 정보 리스트 */
const getPosInfoList = async () => {
  try {
    const res = (await requestPosInformationList()) as AxiosResponse;
    const typeError = runtimeCheck(posInformationListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        posInfoList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const checkPosInfoSelect = (value: string[]) => {
  if (posInfoList.value.length === value.length || value.length === 0) {
    isFullSelectOfPosInfo.value = true;
    return;
  }

  isFullSelectOfPosInfo.value = false;
};

const checkVanInfoSelect = (value: string[]) => {
  if (vanInfoList.value.length === value.length || value.length === 0) {
    isFullSelectOfVanInfo.value = true;
    return;
  }

  isFullSelectOfVanInfo.value = false;
};

const checkApkVersionSelect = (value: string[]) => {
  if (apkVersionList.value.length === value.length || value.length === 0) {
    isFullSelectOfApkVersion.value = true;
    return;
  }

  isFullSelectOfApkVersion.value = false;
};

const handleChangeFullSelectOfPosInfo = () => {
  if (searchWord.searchPosInfoArray.length === 0) {
    isFullSelectOfPosInfo.value = true;
    return;
  }

  isFullSelectOfPosInfo.value = false;
};

const handleChangeFullSelectOfVanInfo = () => {
  if (searchWord.searchVanInfoArray.length === 0) {
    isFullSelectOfVanInfo.value = true;
    return;
  }

  isFullSelectOfVanInfo.value = false;
};

const handleChangeFullSelectOfApkVersion = () => {
  if (searchWord.searchApkVersionArray.length === 0) {
    isFullSelectOfApkVersion.value = true;
    return;
  }

  isFullSelectOfApkVersion.value = false;
};

// v-for key 방어코드
const getCorporationKey = (corporation: selectBoxType, index: number) =>
  corporation ? corporation.code : `corporation-${index}`;

const getStatKey = (code: string, index: number) => {
  if (!code) {
    return `code-${index}`;
  }
  return code;
};

const getInstalledDay = (dateTime: string) => {
  const [date] = dateTime?.split(' ') ?? [''];
  return date;
};

const changePageSize = (value: number) => {
  paginationInfo.pageSize = value;
  getStoreTotalList();
};

/* 계약상태에 따라 row 하이라이트 */
const getTableRowClassName = ({ row }: { row: storeDataType }) => {
  const dangerState = row.storestat === '삭제 요청' || row.storestat === '폐업';
  const warningState = row.storestat === '요금 미납';
  const grayState = row.storestat === '해지';
  const blueState = row.storestat === '양도 양수';

  return {
    'row-contract-state-danger': dangerState,
    'row-contract-state-warning': warningState,
    'row-contract-state-gray': grayState,
    'row-contract-state-blue': blueState,
  };
};

getStoreTotalList();
getStoreStateListInfo();
getVanTypeList();
getApkVersionList();
getPosInfoList();
getCorporationListData();
</script>

<template>
  <AddStoreModal
    v-if="flag.addStore"
    :getStoreList="() => getStoreTotalList()"
  />
  <StoreManageModal v-if="flag.storeManage" />
  <AddMemberShipModal v-if="flag.addMemberShip" />
  <BreadcrumbHeader :propsHeader="singleStoreSettingHeader" />
  <el-row
    class="mb-10"
    justify="end"
  >
    <el-row>
      <div class="empty-height"></div>
      <el-button
        v-if="checkAuthFunction('F1001')"
        id="F1001"
        color="#000"
        @click="openModal(ADD_STORE)"
      >
        신규 매장 등록
      </el-button>
      <el-button
        v-if="checkAuthFunction('F1002')"
        id="F1002"
        color="#000"
        @click="openModal(ADD_MEMBER_SHIP)"
      >
        어드민 ID 등록
      </el-button>
    </el-row>
  </el-row>
  <el-card
    class="mb-10"
    shadow="never"
  >
    <el-row
      align="middle"
      class="mb-20"
      justify="space-between"
    >
      <el-row>
        <div class="mr-60">
          <p class="font-small mb-5">검색</p>
          <el-input
            v-model="searchWord.searchTxt"
            autofocus
            class="store-list-search-input"
            placeholder="검색어를 입력해주세요."
            style="width: 450px"
            @keyup.enter="getSearchData"
          >
            <template #prepend>
              <el-select
                v-model="searchWord.searchType"
                style="width: 150px"
              >
                <el-option
                  v-for="searchType in searchTypes"
                  :key="searchType.value"
                  :label="searchType.label"
                  :value="searchType.value"
                />
              </el-select>
            </template>
          </el-input>
        </div>
        <div>
          <p class="font-small mb-5">매장 계약 상태</p>
          <el-checkbox-group v-model="searchWord.searchStatArray">
            <el-checkbox
              v-for="(stat, index) in storeStateList"
              :key="getStatKey(stat.code, index)"
              :label="stat.code"
            >
              {{ stat.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-row>
      <el-row>
        <el-button
          :icon="Search"
          round
          type="primary"
          @click="getSearchData"
        >
          검색
        </el-button>
        <el-button
          :icon="RefreshRight"
          round
          @click="resetQueryDataAndSearchData"
        >
          초기화
        </el-button>
      </el-row>
    </el-row>
    <el-row
      align="middle"
      class="mb-20 select-box-row"
    >
      <div class="mr-100">
        <p class="font-small mb-5">티오더 버전</p>
        <el-checkbox-group v-model="searchWord.searchApiVersionArray">
          <el-checkbox
            v-for="torderVersion in torderVersionTypes"
            :key="torderVersion.value"
            :label="torderVersion.value"
          >
            {{ torderVersion.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="mr-100">
        <p class="font-small mb-5">결제 유형</p>
        <el-radio-group v-model="searchWord.searchPaymentType">
          <el-radio label=""> 전체</el-radio>
          <el-radio label="0"> 후불형</el-radio>
          <el-radio label="1"> 선불형</el-radio>
        </el-radio-group>
      </div>
      <div class="mr-100">
        <p class="font-small mb-5">포스사 정보</p>
        <el-checkbox
          v-model="isFullSelectOfPosInfo"
          @change="handleChangeFullSelectOfPosInfo"
        >
          전체
        </el-checkbox>
        <el-select
          v-model="searchWord.searchPosInfoArray"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="POS사 정보를 선택해주세요."
          style="width: 240px"
          @change="checkPosInfoSelect"
        >
          <el-option
            v-for="posInformation in posInfoList"
            :key="posInformation"
            :label="posInformation"
            :value="posInformation"
          />
        </el-select>
      </div>
      <div class="mr-100">
        <p class="font-small mb-5 mt-10">VAN사 정보</p>
        <el-checkbox
          v-model="isFullSelectOfVanInfo"
          @change="handleChangeFullSelectOfVanInfo"
        >
          전체
        </el-checkbox>
        <el-select
          v-model="searchWord.searchVanInfoArray"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="VAN사 정보를 선택해주세요."
          style="width: 240px"
          @change="checkVanInfoSelect"
        >
          <el-option
            v-for="vanInformation in vanInfoList"
            :key="vanInformation"
            :label="vanInformation"
            :value="vanInformation"
          />
        </el-select>
      </div>
    </el-row>
    <el-row
      v-if="isSearchOpen"
      align="middle"
    >
      <div class="mr-100 select-box-row">
        <p class="font-small mb-5">앱버전</p>
        <el-checkbox
          v-model="isFullSelectOfApkVersion"
          @change="handleChangeFullSelectOfApkVersion"
        >
          전체
        </el-checkbox>
        <el-select
          v-model="searchWord.searchApkVersionArray"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="앱버전을 선택해주세요."
          style="width: 240px"
          @change="checkApkVersionSelect"
        >
          <el-option
            v-for="apkVersionType in apkVersionList"
            :key="apkVersionType"
            :label="apkVersionType"
            :value="apkVersionType"
          />
        </el-select>
      </div>
      <div class="mr-100">
        <p class="font-small mb-5">테스트 매장</p>
        <el-radio-group v-model="searchWord.searchTestStoreYN">
          <el-radio :label="''"> 전체</el-radio>
          <el-radio :label="'N'"> N(운영)</el-radio>
          <el-radio :label="'Y'"> Y(테스트)</el-radio>
        </el-radio-group>
      </div>
      <div class="mr-100">
        <p class="font-small mb-5">등록일자</p>
        <el-date-picker
          v-model="searchWord.searchDate"
          end-placeholder="조회종료일"
          format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="조회시작일"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
      </div>
      <div
        v-if="corporationListData?.length > 0"
        class="mr-100 mt-10"
      >
        <p class="font-small mb-5">사업체 구분</p>
        <el-radio-group v-model="searchWord.searchBusinessType">
          <el-radio label="all">전체</el-radio>
          <template
            v-for="(corporation, index) in corporationListData"
            :key="getCorporationKey(corporation, index)"
          >
            <el-radio :label="corporation.code">
              {{ corporation.name }}
            </el-radio>
          </template>
        </el-radio-group>
      </div>
    </el-row>
    <el-row justify="end">
      <el-button
        v-if="!isSearchOpen"
        size="small"
        @click="openSearch()"
      >
        상세 검색 열기
        <el-icon>
          <CaretBottom />
        </el-icon>
      </el-button>
      <el-button
        v-else
        size="small"
        @click="closeSearch()"
      >
        상세 검색 닫기
        <el-icon>
          <CaretTop />
        </el-icon>
      </el-button>
    </el-row>
  </el-card>
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <div class="store-setting-total">
      <span>
        총
        <span class="store-setting-total-count">
          {{ paginationInfo.total }}
        </span>
        개의 매장이 있습니다.
      </span>
    </div>
    <el-row>
      <div v-if="checkAuthFunction('F1013')">
        <el-button
          v-if="!excelDownloadState"
          id="F1013"
          class="mr-10"
          type="success"
          @click="postExcelDownload"
        >
          엑셀 다운로드
        </el-button>
        <el-button
          v-else
          id="F1013"
          class="mr-10"
          loading
          type="success"
        >
          다운로드중..
        </el-button>
      </div>
      <el-select
        v-model="paginationInfo.pageSize"
        placeholder="페이지당 개수를 선택해 주세요."
        @change="changePageSize"
      >
        <el-option
          v-for="count in pagePerCount"
          :key="count.value"
          :label="count.label"
          :value="count.value"
        />
      </el-select>
    </el-row>
  </el-row>
  <el-table
    :data="storeList"
    :height="getTableHeight()"
    :row-class-name="getTableRowClassName"
    border
    class="mb-10"
    flexible
    @selection-change="handleSelectionChange"
  >
    <el-table-column
      align="center"
      header-align="center"
      type="selection"
      width="50"
    />
    <el-table-column
      align="center"
      fixed
      label="관리"
      width="95"
    >
      <template #default="{ row }">
        <el-button
          color="#000"
          @click="
            openModalWithData(STORE_MANAGE_MODAL, {
              storeCode: row.storeCode,
              storeName: row.storeName,
            })
          "
        >
          관리
        </el-button>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="사업체 구분"
      prop="business_type"
      width="75"
    />
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="등록일"
      min-width="140"
    >
      <template #default="{ row }">
        <div class="flex-nowrap">
          <div class="font-small-size mr-5">
            {{ getInstalledDay(row.T_order_store_register_date) }}
          </div>
          <el-tag
            v-if="row.newStore === 'Y'"
            class="ml-5"
            effect="dark"
            round
            size="small"
            type="success"
          >
            new
          </el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="매장 코드"
      min-width="135"
    >
      <template #default="{ row }">
        {{ row.storeCode }}
      </template>
    </el-table-column>
    <el-table-column
      fixed
      header-align="center"
      label="태블릿 노출 매장 이름"
      min-width="200"
    >
      <template #default="{ row }">
        <div class="flex-nowrap">
          <div>
            {{ row.storeName }}
          </div>
          <el-tag
            v-if="row.test_store_use === 'Y'"
            class="ml-5"
            effect="dark"
            round
            size="small"
            type="danger"
          >
            test
          </el-tag>
          <el-tag
            v-if="row.cautionStore === 'Y'"
            class="ml-5"
            effect="dark"
            round
            size="small"
            type="warning"
          >
            유의매장
          </el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="매장명"
      min-width="135"
      prop="storeOriginName"
    />
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="지점"
      min-width="135"
      prop="storeArea"
    />
    <el-table-column
      align="center"
      fixed
      header-align="center"
      label="태블릿 ID"
      min-width="100"
      prop="tablet_login_id"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장 계약 상태"
      prop="storestat"
      width="82"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="결제 유형"
      prop="payment_type"
      width="80"
    />
    <el-table-column
      align="center"
      header-align="center"
      prop="T_order_store_pos_info"
      width="80"
    >
      <template #header>
        <div>포스사</div>
        <div>정보</div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      prop="T_order_store_apiType"
      width="80"
    >
      <template #header>
        <div>티오더</div>
        <div>버전</div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="미들웨어 코드"
      width="80"
    >
      <template #default="{ row }">
        <el-popover
          :content="row.posMiddleWareCode"
          placement="left"
          popper-style="text-align: center"
          trigger="hover"
        >
          <template #reference>
            <span class="store-setting-middle-ware-code">
              {{ row.posMiddleWareCode }}
            </span>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      prop="T_order_store_van_info"
      width="80"
    >
      <template #header>
        <div>VAN사</div>
        <div>정보</div>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="앱버전"
      width="80"
    >
      <template #default="{ row }">
        <el-popover
          :content="row.T_order_store_apk_name"
          placement="top"
          trigger="hover"
        >
          <span>{{ row.T_order_store_apk_name }}</span>
          <template #reference>
            <span>{{ convertApkName(row.T_order_store_apk_name) }}</span>
          </template>
        </el-popover>
      </template>
    </el-table-column>
  </el-table>
  <el-row justify="center">
    <el-pagination
      :current-page="paginationInfo.page"
      :page-size="paginationInfo.pageSize"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
:deep(.el-input-group__prepend) {
  background-color: #fff;
}

.manage-modal-contents {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-height {
  height: 32px;
}

.store-list-search-input {
  width: 400px;
}

.store-setting-total {
  display: flex;
  align-items: center;
  font-size: 15px;

  .store-setting-total-count {
    font-weight: bold;
    color: #fc0000;
  }
}

.store-setting-middle-ware-code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-setting-button {
  display: flex;
  justify-content: center;

  .category-setting-detail-button {
    width: 130px;
  }
}

.flex-nowrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-small-size {
  font-size: 12px;
}

:deep(.el-date-editor.el-input__wrapper) {
  width: 270px;
}

.el-table {
  &:deep(.row-contract-state-danger) {
    td {
      background-color: var(--el-color-danger-light-7);
    }
  }

  &:deep(.row-contract-state-warning) {
    td {
      background-color: var(--el-color-warning-light-7);
    }
  }

  &:deep(.row-contract-state-gray) {
    td {
      background-color: var(--el-color-info-light-7);
    }
  }

  &:deep(.row-contract-state-blue) {
    td {
      background-color: var(--el-color-primary-light-7);
    }
  }
}

.select-box-row {
  &:deep(.el-checkbox:last-of-type) {
    margin-right: 15px;
  }
}
</style>
