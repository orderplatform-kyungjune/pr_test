<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, dateFormatterUtil, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  allStoreListType,
  convertedStoreUrlInfoType,
  masterSearchInfoType,
  pageInfoType,
  storeAllListType,
  storeUrlInfoType,
} from '@interface/store';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { UpdateUrlBatchModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { UPDATE_URL_SETTING } from '@common/string';
import { storeCodec } from '@codecs';
import { endpoints, store } from '@apis';

const {
  updateFullStoreInfo,
  requestStoreUrlList,
  requestAllUrlList,
  requestSearchStoreNameResults,
} = store;
const { refinedToday } = dateFormatterUtil;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, isMasterCheck } = authentication;

defineProps<{
  activeTabName: string;
}>();

const {
  storeUpdatedUrlCodec,
  storeInfoUrlListCodec,
  allUrlListCodec,
  allStoreListCodec,
} = storeCodec;
const { downloadExcelPostWithToken } = useExcelDownload();
const { openModal, flag } = useModalStore();

const paginationInfo = reactive<pageInfoType>({
  page: 1,
  perPage: 20,
  from: 1,
  to: 10,
  total: 0,
});
const searchInputInfo = reactive<masterSearchInfoType>({
  searchTxt: '',
  searchMasterUrlText: '',
  searchMasterUrl: [],
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
const queUseList = [
  {
    value: 'Y',
    label: 'Y (사용)',
  },
  {
    value: 'N',
    label: 'N (미사용)',
  },
];
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

const handleClickCurrentUrl = (url: string) => {
  window.open(url);
};

const isDisabledBatchModifyButton = () => {
  if (selectedStoreList.value.length >= 1) return false;
  return true;
};

const getTotalNumberOfStore = () => paginationInfo.total;

const onClickBatchModifyButton = () => {
  if (isDisabledBatchModifyButton()) {
    ElMessageBox.alert('일괄 수정하실 매장을 선택해주세요.', '알림', {
      confirmButtonText: '닫기',
    });
    return;
  }

  openModal(UPDATE_URL_SETTING);
};

const getStringFunction = (search: string[]) => search.join(';');

const handleSelectionChange = (
  selectedStoreUrlList: convertedStoreUrlInfoType[],
) => {
  const filteredSelectedStoreList = selectedStoreUrlList.map(
    (selectedStoreInformation: storeUrlInfoType) => ({
      value: selectedStoreInformation.T_order_store_code,
      label: selectedStoreInformation.T_order_store_name,
      storeNum: selectedStoreInformation.T_order_store_num,
    }),
  );

  selectedStoreList.value = filteredSelectedStoreList;
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
      target: 'master',
      checkedNum: filterSelectedStoreCodeList(),
    };
  }

  const hasSearchNotUrlSet = storeList.value.every(
    (storeInfo) => !storeInfo.T_order_store_orderView_version,
  );

  if (notSettingUrlSearch.value && hasSearchNotUrlSet) {
    return {
      type: 'excel',
      target: 'master',
      searchTxt: searchInputInfo.searchTxt,
      searchUrlNone: 'Y',
    };
  }

  if (
    searchInputInfo.searchTxt ||
    searchInputInfo.searchMasterUrlText ||
    searchInputInfo.searchMasterUrl.length
  ) {
    return {
      type: 'excel',
      target: 'master',
      searchTxt: searchInputInfo.searchTxt,
      searchMasterUrlText: searchInputInfo.searchMasterUrlText,
      searchMasterUrl: getStringFunction(searchInputInfo.searchMasterUrl),
    };
  }

  return {
    type: 'excel',
    target: 'master',
    searchTxt: '',
  };
};

const getSearchDataStoreItemKey = (code: string, index: number) => {
  if (code) {
    return `search-store-code-${code}-${index}`;
  }

  return `search-store-${index}`;
};

const getExcelTitle = () => {
  const todayDate = refinedToday().replaceAll('-', '').slice(2);
  return `마스터 url 정보_${todayDate}`;
};

/** 마운트 시 스토어 리스트 요청하기 */
const getStoreUrlList = async () => {
  try {
    const requestData = {
      type: 'list',
      target: 'master',
      page: paginationInfo.page,
      perPage: paginationInfo.perPage,
      searchTxt: searchInputInfo.searchTxt,
      searchMasterUrl: getStringFunction(searchInputInfo.searchMasterUrl),
      searchMasterUrlText: searchInputInfo.searchMasterUrlText,
    };

    if (notSettingUrlSearch.value) {
      Object.assign(requestData, { searchUrlNone: 'Y' });
    }

    const res = (await requestStoreUrlList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeInfoUrlListCodec, res.data.data);

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
      const storeInformationList = res.data.data;
      const convertedStoreMasterUrlList = storeInformationList.map(
        (storeInfo: storeUrlInfoType) => {
          const convertedStoreInformation = Object.assign(storeInfo, {
            updateUrlAddress: '',
          });
          return convertedStoreInformation;
        },
      );
      storeList.value = convertedStoreMasterUrlList;
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
    searchInputInfo.searchMasterUrlText = '';
    searchInputInfo.searchMasterUrl = [];
  }

  reloadStoreList();
};

const onClickResetButton = () => {
  notSettingUrlSearch.value = false;
  searchInputInfo.searchTxt = '';
  searchInputInfo.searchMasterUrlText = '';
  searchInputInfo.searchMasterUrl = [];

  getStoreUrlList();
};

const handleClickModifyButton = async (
  valueToBeModified: convertedStoreUrlInfoType,
) => {
  try {
    const { T_order_store_code, T_order_sqsUse, updateUrlAddress } =
      valueToBeModified;

    const isTorderUrl = valueToBeModified.updateUrlAddress.includes(
      'tablet.order.orderhae.com',
    );
    const isIncludesProtocol = updateUrlAddress.includes('http');
    const isIncludesSlash = updateUrlAddress.includes('://');

    if (isTorderUrl || !isIncludesProtocol || !isIncludesSlash) {
      ElMessage({
        type: 'error',
        message: '잘못된 URL 형식입니다.',
      });
      return;
    }

    const requestData = {
      type: 'master',
      storeArray: [T_order_store_code],
      update_version: updateUrlAddress,
      T_order_sqsUse,
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
        message: 'URL 주소가 변경 완료되었습니다.',
        title: '알림',
        confirmButtonText: '확인',
      }).then(() => getStoreUrlList());
    }
  } catch (error) {
    console.log(error);
  }
};

/** 전체 태블릿 유알엘 리스트 불러오기 */
const getAllOrderViewUrlList = async () => {
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
      allUrlList.value = res.data.data.master;
    }
  } catch (error) {
    console.log(error);
  }
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
getAllOrderViewUrlList();
getAllStoreListBasedStore();
</script>

<template>
  <UpdateUrlBatchModal
    v-if="flag.updateUrlSetting"
    :allUrlList="allUrlList"
    :reloadStoreList="reloadStoreList"
    :requestApi="getStoreUrlList"
    :selectedStoreList="selectedStoreList"
    based="store"
    modalTitle="마스터 WEB URL 일괄 변경"
    type="master"
  />
  <el-descriptions
    :column="1"
    border
    class="master-url-description mb-10"
  >
    <el-descriptions-item
      label="URL로 검색"
      label-align="center"
    >
      <el-row justify="space-between">
        <el-input
          v-model="searchInputInfo.searchMasterUrlText"
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
          v-model="searchInputInfo.searchMasterUrl"
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
            v-for="(orderViewUrl, orderViewIndex) in allUrlList"
            :key="getSearchDataStoreItemKey(orderViewUrl, orderViewIndex)"
            :label="orderViewUrl"
            :value="orderViewUrl"
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
          pla
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
        <el-button
          v-if="isMasterCheck()"
          type="success"
          @click="onClickBatchModifyButton"
        >
          일괄수정
        </el-button>
      </el-row>
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
  <el-divider />
  <el-table
    ref="multipleTableRef"
    :data="storeList"
    :element-loading-svg="loadingSvg"
    border
    class="width-100"
    element-loading-background="rgba(122, 122, 122, 0.8)"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-text="매장 정보를 불러오는 중입니다..."
    height="500"
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
      width="70"
    />
    <el-table-column
      align="center"
      label="매장명"
      width="200"
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
      width="150"
    />
    <el-table-column
      align="center"
      label="태블릿 아이디"
      prop="T_order_store_Id"
      width="150"
    />
    <el-table-column
      align="center"
      label="현재 URL"
      prop="T_order_store_orderView_version"
      width="310"
    >
      <template #default="{ row }">
        <el-link
          v-if="row.T_order_store_orderView_version"
          :underline="true"
          @click="handleClickCurrentUrl(row.T_order_store_orderView_version)"
        >
          {{ row.T_order_store_orderView_version }}
        </el-link>
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
      label="변경 URL"
      width="340"
    >
      <template #default="{ row }">
        <el-input
          v-model="row.updateUrlAddress"
          placeholder="변경하실 URL을 입력해주세요."
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="Que Use"
      width="150"
    >
      <template #default="{ row }">
        <el-select v-model="row.T_order_sqsUse">
          <el-option
            v-for="(queUseData, queUseIndex) in queUseList"
            :key="getSearchDataStoreItemKey(queUseData.label, queUseIndex)"
            :label="queUseData.label"
            :value="queUseData.value"
          />
        </el-select>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="관리"
      width="180"
    >
      <template #default="{ row }">
        <el-col>
          <el-button
            class="action-button"
            color="#000"
            @click="handleClickModifyButton(row)"
          >
            마스터 태블릿 수정
          </el-button>
        </el-col>
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
</template>

<style lang="scss" scoped>
.action-button {
  width: 140px;
}

.search-input {
  width: 550px;
}

.master-url-description {
  &:deep(.is-bordered-label) {
    width: 20%;
  }

  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 27%;
    vertical-align: middle;
  }
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
