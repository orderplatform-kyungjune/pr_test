<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable, UploadFile } from 'element-plus';
import { AxiosResponse } from 'axios';
import {
  authentication,
  dateFormatterUtil,
  etcUtils,
  runtimeCheckHelper,
} from '@utils';
import useModalStore from '@store/storeModal';
import {
  allStoreListType,
  convertedStoreUrlInfoType,
  pageInfoType,
  storeAllListType,
  storeInfoOfStoreManage,
  storeUrlInfoType,
  torderSearchInfoType,
} from '@interface/store';
import {
  PostExcelFileUploadResponseType,
  PostExcelFileUploadType,
} from '@interface/etc';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { RefreshTabletModal, UpdateUrlBatchModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { REFRESH_TABLET } from '@common/string';
import { storeCodec } from '@codecs';
import { endpoints, excel, store } from '@apis';

defineProps<{
  activeTabName: string;
}>();

const {
  storeUpdatedUrlCodec,
  storeInfoUrlListCodec,
  allUrlListCodec,
  allStoreListCodec,
} = storeCodec;
const {
  requestAllUrlList,
  requestStoreUrlList,
  requestSearchStoreNameResults,
  updateFullStoreInfo,
} = store;
const { refinedToday } = dateFormatterUtil;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, checkAuthFunction } = authentication;
const { downloadExcelPostWithToken } = useExcelDownload();
const { flag, openModal } = useModalStore();

const selectedStoreInfo = reactive<storeInfoOfStoreManage>({
  storeCodeArray: [],
  storeBriefInfo: [],
});
const paginationInfo = reactive<pageInfoType>({
  page: 1,
  perPage: 20,
  from: 1,
  to: 10,
  total: 0,
});
const searchInputInfo = reactive<torderSearchInfoType>({
  searchTxt: '',
  searchTorderUrlText: '',
  searchTorderUrl: [],
});

const multipleTableRef = ref<InstanceType<typeof ElTable>>();
/** 엑셀 다운로드 */
const excelFileHref: Ref<string> = ref(
  `${endpoints.store.full_store_list}?excelDownload=true&size=20000`,
);
const notSettingUrlSearch: Ref<boolean> = ref(false);

// 선택한 매장 리스트
const selectedStoreList: Ref<storeAllListType[]> = ref([]);
// 페이지별 요청 매장 리스트
const storeList: Ref<storeUrlInfoType[]> = ref([]);
// 모든 유알엘 리스트
const allUrlList: Ref<string[]> = ref([]);
// 전매장 리스트
const allStoreList: Ref<allStoreListType[]> = ref([]);

const loadingSvg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  "style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;
const pageSizeOptions = [
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
  {
    value: 150,
    label: '150개씩 보기',
  },
];

const getTotalNumberOfStore = () => paginationInfo.total;

const goToUrlNewTab = (val: convertedStoreUrlInfoType) => {
  const currentUrl = val.T_order_store_tablet_version;
  const storeCode = val.T_order_store_code;

  window.open(
    `${currentUrl}?storeCode=${encodeURIComponent(storeCode)}&tableName=TEST&redirect=0#/`,
  );
};

const getStringFunction = (searchList: string[]) => {
  if (searchList.length) return searchList?.join(';');
  return '';
};

const filterSelectedStoreCodeList = () => {
  const storeNumList = selectedStoreList.value.map(
    (storeInfo) => storeInfo.storeNum,
  );
  return storeNumList;
};

const getRequestData = () => {
  if (selectedStoreList.value.length > 0) {
    return {
      type: 'excel',
      target: 'torder',
      checkedNum: filterSelectedStoreCodeList(),
    };
  }

  const hasSearchNotUrlSet = storeList.value.every(
    (storeInfo) => !storeInfo.T_order_store_tablet_version,
  );

  if (notSettingUrlSearch.value && hasSearchNotUrlSet) {
    return {
      type: 'excel',
      target: 'torder',
      searchTxt: searchInputInfo.searchTxt,
      searchUrlNone: 'Y',
    };
  }

  if (
    searchInputInfo.searchTxt ||
    searchInputInfo.searchTorderUrlText ||
    searchInputInfo.searchTorderUrl.length
  ) {
    return {
      type: 'excel',
      target: 'torder',
      searchTxt: searchInputInfo.searchTxt,
      searchTorderUrlText: searchInputInfo.searchTorderUrlText,
      searchTorderUrl: getStringFunction(searchInputInfo.searchTorderUrl),
    };
  }

  return {
    type: 'excel',
    target: 'torder',
    searchTxt: '',
  };
};

const handleSelectionChange = (
  selectedStoreUrlList: convertedStoreUrlInfoType[],
) => {
  const filteredSelectedStoreList = selectedStoreUrlList.map(
    (selectedStoreInformation: convertedStoreUrlInfoType) => ({
      value: selectedStoreInformation.T_order_store_code,
      label: selectedStoreInformation.T_order_store_name,
      storeNum: selectedStoreInformation.T_order_store_num,
    }),
  );

  selectedStoreList.value = filteredSelectedStoreList;
};

const getSearchDataStoreItemKey = (code: string, index: number) => {
  if (code) {
    return `search-store-code-${code}-${index}`;
  }

  return `search-store-${index}`;
};

const getExcelTitle = () => {
  const todayDate = refinedToday().replaceAll('-', '').slice(2);

  return `티오더 매장 url 정보_${todayDate}`;
};

const openRefreshTabletModal = (val: storeUrlInfoType) => {
  const { T_order_store_name, T_order_store_code } = val;

  selectedStoreInfo.storeCodeArray = [val.T_order_store_code];
  selectedStoreInfo.storeBriefInfo = [
    {
      T_order_store_name,
      T_order_store_code,
    },
  ];

  openModal(REFRESH_TABLET);
};

/** 매장 기준 매장 정보 불러오기 */
const getStoreUrlList = async () => {
  try {
    const requestData = {
      type: 'list',
      target: 'torder',
      page: paginationInfo.page,
      perPage: paginationInfo.perPage,
      searchTxt: searchInputInfo.searchTxt,
      searchTorderUrl: getStringFunction(searchInputInfo.searchTorderUrl),
      searchTorderUrlText: searchInputInfo.searchTorderUrlText,
    };

    if (notSettingUrlSearch.value) {
      Object.assign(requestData, { searchUrlNone: 'Y' });
    }

    const res = (await requestStoreUrlList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeInfoUrlListCodec, res.data.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '업로드 실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      return;
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
      return;
    }

    if (typeError) return;

    if (res.data.code === 200) {
      const storeInformationList = res.data.data;
      const convertedStoreWebUrlList = storeInformationList.map(
        (storeInfo: storeUrlInfoType) => {
          const convertedStoreInformation = Object.assign(storeInfo, {
            updateUrlAddress: '',
          });
          return convertedStoreInformation;
        },
      );

      storeList.value = convertedStoreWebUrlList;
      paginationInfo.total = res.data.page_info.total;
      paginationInfo.page = res.data.page_info.current_page;
      paginationInfo.perPage = res.data.page_info.per_page;
      paginationInfo.from = res.data.page_info.from;
      paginationInfo.to = res.data.page_info.to;
    }
  } catch (error) {
    console.log(error);
  }
};

const isExcelUploadLoading = ref(false);

/**
 * 엑셀파일 업로드 api 요청 및 success/fail 처리
 * @param file - File
 * @param onSuccess - api 요청 성공시 callback
 * @param onError - api 요청 실패시 callback
 */
const postExcelFileUpload = async ({
  file,
  onSuccess,
  onError,
}: PostExcelFileUploadType) => {
  try {
    const { postTorderTabletExcelFile } = excel;
    const response = (await postTorderTabletExcelFile({
      file,
    })) as AxiosResponse;
    const data = response.data as PostExcelFileUploadResponseType;

    if (data.code === 200) {
      onSuccess(data);
      return;
    }

    onError({
      status: data.code,
      message: data.msg,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * 엑셀 파일 업로드("변경 URL 주소" 일괄 업데이트)
 * @param file - element plus 파일 타입 (UploadFile)
 */
const onUploadExcelFile = async (file: UploadFile) => {
  if (!file.raw) {
    return;
  }

  // 엑셀파일이 아닐경우 error alert 적용
  if (
    etcUtils.fileExtensionCheck({
      currentExtension: file.raw.type,
      allowExtensions: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    })
  ) {
    ElMessageBox.alert('업로드파일 형식이 .xlsx 와(과) 다른 형식입니다.', '', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  const setIsLoading = (loading: boolean) => {
    isExcelUploadLoading.value = loading;
  };

  setIsLoading(true);

  await postExcelFileUpload({
    file: file.raw,
    onSuccess: (response) => {
      setIsLoading(false);
      getStoreUrlList();
      ElMessageBox.alert(
        `총 ${response.upload_cnt}개 매장이 업데이트 되었습니다.`,
        '업로드 성공.',
        { confirmButtonText: '확인' },
      );
    },
    onError: ({ status, message }) => {
      setIsLoading(false);

      if (status === 401) {
        failAuthenticationAlert();
        return;
      }

      if (status === 400 || status === 500) {
        ElMessageBox.alert(message, '업로드 실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    },
  });
};

const handleChangeStoreListPage = (val: number) => {
  paginationInfo.page = val;
  getStoreUrlList();
};

const reloadStoreList = () => {
  paginationInfo.page = 1;
  getStoreUrlList();
};

const handleClickSearchButton = () => {
  if (notSettingUrlSearch.value) {
    searchInputInfo.searchTorderUrlText = '';
    searchInputInfo.searchTorderUrl = [];
  }

  reloadStoreList();
};

const onClickResetButton = () => {
  notSettingUrlSearch.value = false;
  searchInputInfo.searchTxt = '';
  searchInputInfo.searchTorderUrlText = '';
  searchInputInfo.searchTorderUrl = [];

  getStoreUrlList();
};

const updateFullStoreInformation = async (
  valueToBeModified: convertedStoreUrlInfoType,
) => {
  try {
    const {
      T_order_store_code,
      updateUrlAddress,
      T_order_store_refresh_time,
      T_order_store_cart_refresh_time,
    } = valueToBeModified;

    const isMasterUrl = updateUrlAddress.includes('orderview.torder.co.kr');
    const isIncludesProtocol = updateUrlAddress.includes('http');
    const isIncludesSlash = updateUrlAddress.includes('://');

    if (isMasterUrl || !isIncludesProtocol || !isIncludesSlash) {
      ElMessage({
        type: 'error',
        message: '잘못된 URL 형식입니다.',
      });
      return;
    }

    const requestData = {
      type: 'torder',
      storeArray: [T_order_store_code],
      update_version: updateUrlAddress,
      T_order_store_refresh_time: String(T_order_store_refresh_time),
      T_order_store_cart_refresh_time: String(T_order_store_cart_refresh_time),
    };

    const res = (await updateFullStoreInfo(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeUpdatedUrlCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      return;
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
      return;
    }

    if (typeError) return;

    if (res.data.code === 200) {
      ElMessageBox({
        message: '변경이 완료되었습니다.',
        title: '알림',
        confirmButtonText: '확인',
      }).then(() => getStoreUrlList());
    }
  } catch (error) {
    console.log(error);
  }
};

/** 셀렉트 옵션에서 필요한 전체 태블릿 유알엘 리스트 불러오기 */
const getAllTabletUrlList = async () => {
  try {
    const res = (await requestAllUrlList()) as AxiosResponse;
    const typeError = runtimeCheck(allUrlListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      return;
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
      return;
    }

    if (typeError) return;

    if (res.data.code === 200) {
      allUrlList.value = res.data.data.torder;
    }
  } catch (error) {
    console.log(error);
  }
};

const handleClickModifyButton = (val: convertedStoreUrlInfoType) => {
  const { T_order_store_name, T_order_store_code } = val;

  selectedStoreInfo.storeCodeArray = [val.T_order_store_code];
  selectedStoreInfo.storeBriefInfo = [
    {
      T_order_store_name,
      T_order_store_code,
    },
  ];

  updateFullStoreInformation(val);
};

/** 셀렉트 옵션의 전체 매장 리스트를 보여주기 위한 함수 */
const getAllStoreListBasedStore = async () => {
  try {
    const payload = { searchTxt: '' };
    const res = (await requestSearchStoreNameResults(payload)) as AxiosResponse;
    const typeError = runtimeCheck(allStoreListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      return;
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
      return;
    }

    if (typeError) return;

    if (res.data.code === 200) {
      allStoreList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

getStoreUrlList();
getAllTabletUrlList();
getAllStoreListBasedStore();
</script>

<template>
  <RefreshTabletModal
    v-if="flag.refreshTablet"
    :selectedStoreInfo="selectedStoreInfo"
    :storeCode="selectedStoreInfo.storeBriefInfo[0]?.T_order_store_code"
    :storeName="selectedStoreInfo.storeBriefInfo[0]?.T_order_store_name"
  />
  <UpdateUrlBatchModal
    v-if="flag.updateUrlSetting"
    :allUrlList="allUrlList"
    :reloadStoreList="reloadStoreList"
    :requestApi="getStoreUrlList"
    :selectedStoreList="selectedStoreList"
    based="store"
    modalTitle="티오더 WEB URL 일괄 변경"
    type="torder"
  />
  <el-descriptions
    :column="1"
    border
    class="torder-web-url-description mb-10"
  >
    <el-descriptions-item
      label="URL로 검색"
      label-align="center"
    >
      <el-row justify="space-between">
        <el-input
          v-model="searchInputInfo.searchTorderUrlText"
          :disabled="notSettingUrlSearch"
          class="search-input"
          placeholder="검색하실 URL을 입력해주세요."
          @keyup.enter="reloadStoreList"
        />
        <el-row
          align="middle"
          justify="center"
        >
          <el-button
            :icon="Search"
            round
            type="primary"
            @click="handleClickSearchButton"
          >
            검색
          </el-button>
          <el-button
            :icon="RefreshRight"
            round
            @click="onClickResetButton"
          >
            초기화
          </el-button>
        </el-row>
      </el-row>
      <el-row class="mt-5">
        <el-select
          v-model="searchInputInfo.searchTorderUrl"
          :disabled="notSettingUrlSearch"
          class="search-input"
          clearable
          collapse-tags
          collapse-tags-tooltip
          filterable
          multiple
          placeholder="검색하실 URL을 선택해주세요."
        >
          <el-option
            v-for="(tabletUrl, tabletUrlIndex) in allUrlList"
            :key="getSearchDataStoreItemKey(tabletUrl, tabletUrlIndex)"
            :label="tabletUrl"
            :value="tabletUrl"
          />
        </el-select>
        <el-row class="ml-10">
          <el-checkbox
            v-model="notSettingUrlSearch"
            label="URL 미설정 항목만 검색"
          />
        </el-row>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label="매장명ㆍ매장 코드ㆍ태블릿 ID 검색"
      label-align="center"
    >
      <el-row justify="space-between">
        <el-input
          v-model="searchInputInfo.searchTxt"
          class="search-input"
          clearable
          placeholder="매장명 및 매장 코드 또는 태블릿 ID를 입력해주세요."
          @keyup.enter="reloadStoreList"
        />
      </el-row>
    </el-descriptions-item>
  </el-descriptions>
  <el-divider />
  <el-row
    class="mb-10 mt-10"
    justify="space-between"
  >
    <el-row align="middle">
      총 &nbsp;
      <div class="essential-star">
        {{ getTotalNumberOfStore() }}
      </div>
      &nbsp; 개
    </el-row>
    <el-row>
      <el-row class="mr-10">
        <el-tooltip
          content="검색 리스트 또는 선택된 필드만 엑셀 다운로드 시트에 반영됩니다."
        >
          <el-button
            @click="
              downloadExcelPostWithToken(
                getExcelTitle(),
                excelFileHref,
                getRequestData(),
              )
            "
          >
            엑셀 다운로드
          </el-button>
        </el-tooltip>
      </el-row>
      <el-row
        v-if="checkAuthFunction('F8003')"
        class="mr-10"
      >
        <el-tooltip
          content="검색 리스트 또는 선택된 필드만 엑셀 다운로드 시트에 반영됩니다."
        >
          <el-upload
            :accept="'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'"
            :auto-upload="false"
            :disabled="isExcelUploadLoading"
            :on-change="onUploadExcelFile"
            :show-file-list="false"
          >
            <el-button :loading="isExcelUploadLoading"> 엑셀 업로드</el-button>
          </el-upload>
        </el-tooltip>
      </el-row>
      <el-row>
        <el-select
          v-model="paginationInfo.perPage"
          class="mr-5"
          @change="reloadStoreList"
        >
          <el-option
            v-for="(pageSize, pageSizeIndex) in pageSizeOptions"
            :key="getSearchDataStoreItemKey(pageSize.label, pageSizeIndex)"
            :label="pageSize.label"
            :value="pageSize.value"
          />
        </el-select>
      </el-row>
    </el-row>
  </el-row>
  <el-divider />
  <div>
    <el-table
      ref="multipleTableRef"
      :data="storeList"
      :element-loading-spinner="loadingSvg"
      border
      element-loading-background="rgba(122, 122, 122, 0.8)"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-text="매장 정보를 불러오는 중입니다..."
      height="480"
      highlight-current-row
      scrollbar-always-on
      stripe
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
        header-align="center"
        label="NO"
        prop="T_order_store_num"
        width="65"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="매장명"
        width="125"
      >
        <template #default="{ row }">
          <div class="flex-nowrap">
            <div>
              {{ row.T_order_store_name }}
            </div>
            <div
              v-if="row.test_store_use === 'Y'"
              class="test-badge"
            >
              test
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="매장코드"
        prop="T_order_store_code"
        width="130"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="현재 URL 주소"
        width="280"
      >
        <template #default="{ row }">
          <span v-if="row.T_order_store_tablet_version">
            {{ row.T_order_store_tablet_version }}
          </span>
          <span
            v-else
            class="essential-star"
          >
            미설정
          </span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="변경 URL 주소"
        min-width="540"
      >
        <template #default="{ row }">
          <el-row>
            <el-col :span="18">
              <el-input
                v-model="row.updateUrlAddress"
                placeholder="변경하실 URL을 입력해주세요."
              />
            </el-col>
            <el-col :span="6">
              <el-button
                class="action-button"
                plain
                type="warning"
                @click="handleClickModifyButton(row)"
              >
                오더 태블릿 수정
              </el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="화면 초기화 (sec)"
        width="90"
      >
        <template #default="{ row }">
          <el-input v-model.number="row.T_order_store_refresh_time" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="Cart 초기화 (sec)"
        width="100"
      >
        <template #default="{ row }">
          <el-input v-model.number="row.T_order_store_cart_refresh_time" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="태블릿 아이디"
        prop="T_order_store_Id"
        width="110"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="마지막 매장 수정 일자"
        prop="T_order_store_update_date"
        width="100"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="URL 진입"
        width="110"
      >
        <template #default="{ row }">
          <el-button
            :disabled="row.T_order_store_tablet_version.length === 0"
            @click="goToUrlNewTab(row)"
          >
            미리보기
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="관리"
        width="140"
      >
        <template #default="{ row }">
          <div>
            <el-button
              class="action-button"
              plain
              type="danger"
              @click="openRefreshTabletModal(row)"
            >
              태블릿 새로고침
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-row
      align="middle"
      class="mt-5"
      justify="center"
    >
      <el-pagination
        :current-page="paginationInfo.page"
        :page-size="paginationInfo.perPage"
        :total="paginationInfo.total"
        background
        class="mt-10"
        layout="prev, pager, next"
        @current-change="handleChangeStoreListPage"
      />
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.torder-web-url-description {
  &:deep(.is-bordered-label) {
    width: 20%;
  }

  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 27%;
    vertical-align: middle;
  }
}

.action-button {
  width: 120px;
}

.search-input {
  width: 550px;
}

.test-badge {
  box-sizing: border-box;
  min-width: 36px;
  height: 18px;
  padding: 0 6px;
  margin-bottom: 20px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  background-color: #f56c6c;
  border-radius: 10px;
}

.flex-nowrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
