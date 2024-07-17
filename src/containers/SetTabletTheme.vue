<script lang="ts" setup>
import { h, ref, Ref, reactive } from 'vue';
import { ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication, dateFormatterUtil } from '@utils';
import useModalStore from '@store/storeModal';
import { themeInfoType, requestStoreThemeListType } from '@interface/store';
import { Search, RefreshRight } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { UPDATE_URL_SETTING } from '@common/string';
import { storeCodec } from '@codecs';
import { endpoints, store } from '@apis';
import UpdateUrlBatchModal from './UpdateUrlBatchModal.vue';

defineProps<{
  activeTabName: string;
}>();

const { themeDataCodec, allThemeListCodec, allUrlListCodec } = storeCodec;
const {
  requestThemeList,
  requestStoreThemeList,
  requestAllUrlList,
  requestUrlVersionList,
} = store;
const { refinedToday } = dateFormatterUtil;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { openModal, flag } = useModalStore();
const { downloadExcelPostWithToken } = useExcelDownload();

const paginationInfo = reactive({
  page: 1,
  perPage: 10,
  from: 1,
  to: 10,
  total: 0,
});
const searchInputInfo = reactive({
  searchThemeCode: [],
  searchApiVersion: '전체',
  searchTxt: '',
});
const selectedThemeType = reactive({
  apiVersion: '',
  themeCode: '',
});

const multipleTableRef = ref<InstanceType<typeof ElTable>>();
/** 엑셀 다운로드 */
const excelFileHref: Ref<string> = ref(
  `${endpoints.excel.download_theme_list}?excelDownload=true&size=20000`,
);
const clickedSearch: Ref<boolean> = ref(false);

const themeList: Ref<themeInfoType[]> = ref([]);
const allThemeList: Ref<requestStoreThemeListType[]> = ref([]);
const allUrlList: Ref<string[]> = ref([]);
const selectedThemeCodeList: Ref<string[]> = ref([]);

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
    value: 10,
    label: '10개씩 보기',
  },
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

const isDisabledBatchModifyButton = () => {
  if (selectedThemeType.apiVersion && selectedThemeType.themeCode) return false;
  return true;
};

const totalNumberOfThemeList = () => paginationInfo.total;

const convertLocaleStringStoreCount = (storeCount: number) =>
  storeCount?.toLocaleString();

const getSearchDataStoreItemKey = (code: string, index: number) => {
  if (code) {
    return `search-store-code-${code}-${index}`;
  }

  return `search-store-${index}`;
};

const onClickModifyButton = () => {
  const infoText = `매장 테마 일괄 수정 진행하시려면
  1개만 선택할 수 있습니다.
  확인 부탁드리겠습니다.`;

  if (isDisabledBatchModifyButton()) {
    ElMessageBox.alert(infoText, '알림', {
      message: h(
        'p',
        { style: 'white-space: break-spaces; text-align: center;' },
        infoText,
      ),
      confirmButtonText: '확인',
    });
    return;
  }

  openModal(UPDATE_URL_SETTING);
};

const handleSelectionChange = (rows: themeInfoType[]) => {
  if (rows.length === 0) {
    selectedThemeType.apiVersion = '';
    selectedThemeType.themeCode = '';
    return;
  }

  const currentRow = rows.slice(-1)[0];

  if (rows) {
    rows.forEach((row, rowIndex) => {
      if (rows.length === 1) return;

      if (rows.length - 1 !== rowIndex) {
        multipleTableRef.value!.toggleRowSelection(row, false);
      }
    });

    selectedThemeType.apiVersion = currentRow.api_version;
    selectedThemeType.themeCode = currentRow.themeNo;
  }
};

const getStringFunction = (search: string[]) => search.join(';');

const getExcelTitle = () => {
  const todayDate = refinedToday().replaceAll('-', '').slice(2);

  return `티오더 테마 정보_${todayDate}`;
};

const excelDownloadRequestData = () => {
  const haveSelectionTheme =
    selectedThemeType.apiVersion && selectedThemeType.themeCode;
  const isNoSearchValue =
    searchInputInfo.searchApiVersion === '전체' &&
    searchInputInfo.searchThemeCode.length === 0 &&
    searchInputInfo.searchTxt === '';
  const convertApiVersionValue =
    searchInputInfo.searchApiVersion === '전체'
      ? ''
      : searchInputInfo.searchApiVersion;

  if (haveSelectionTheme) {
    return {
      searchApiVersion: convertApiVersionValue,
      searchThemeCode: selectedThemeType.themeCode,
      searchTxt: searchInputInfo.searchTxt,
    };
  }

  if (isNoSearchValue) {
    return {
      searchThemeCode: '',
      searchTxt: '',
    };
  }

  return {
    searchApiVersion: convertApiVersionValue,
    searchThemeCode: selectedThemeType.themeCode,
    searchTxt: searchInputInfo.searchTxt,
    checkedNum: selectedThemeCodeList.value,
  };
};

const getRequestData = () => {
  if (clickedSearch.value === false) {
    return {
      page: paginationInfo.page,
      perPage: paginationInfo.perPage,
      searchApiVersion: '',
      searchThemeCode: '',
      searchTxt: '',
    };
  }

  if (
    searchInputInfo.searchApiVersion !== '전체' &&
    clickedSearch.value === true
  ) {
    return {
      page: paginationInfo.page,
      perPage: paginationInfo.perPage,
      searchApiVersion: searchInputInfo.searchApiVersion,
      searchThemeCode: getStringFunction(searchInputInfo.searchThemeCode),
      searchTxt: searchInputInfo.searchTxt,
    };
  }

  return {
    page: paginationInfo.page,
    perPage: paginationInfo.perPage,
    searchThemeCode: getStringFunction(searchInputInfo.searchThemeCode),
    searchTxt: searchInputInfo.searchTxt,
  };
};

/** 선택된 값에 따라 테마 리스트 불러오기 */
const getThemeList = async () => {
  try {
    const requestData = getRequestData();
    const res = (await requestThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(themeDataCodec, res.data.data);

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
      themeList.value = res.data.data;
      paginationInfo.total = res.data.page_info.total;
      paginationInfo.page = res.data.page_info.current_page;
      paginationInfo.perPage = res.data.page_info.per_page;
      paginationInfo.from = res.data.page_info.from;
      selectedThemeCodeList.value = themeList.value.map(
        (themeInfo) => `${themeInfo.api_version}_${themeInfo.themeNo}`,
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const onClickResetButton = () => {
  searchInputInfo.searchApiVersion = '전체';
  searchInputInfo.searchTxt = '';
  searchInputInfo.searchThemeCode = [];
  getThemeList();
};

const reloadStoreList = () => {
  paginationInfo.page = 1;
  clickedSearch.value = true;
  getThemeList();
};

const handleChangeStoreListPage = (val: number) => {
  paginationInfo.page = val;
  getThemeList();
};

const searchTheme = () => {
  reloadStoreList();
  clickedSearch.value = true;
};

/** API 버전 선택된 값에 따라 일치하는 버전의 테마 리스트 불러오는 함수 */
const getAllThemeList = async () => {
  try {
    let requestData;

    if (searchInputInfo.searchApiVersion === '전체') {
      requestData = { api: '' };
    } else {
      requestData = { api: searchInputInfo.searchApiVersion };
    }

    const res = (await requestStoreThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(allThemeListCodec, res.data);

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
      allThemeList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const changeApiVersion = () => {
  getAllThemeList();
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

/** API 버전에 따라 변경 URL 정보 가져오기 */
const postUrlVersionList = async (apiVersion: string) => {
  try {
    const requestData = {
      type: 'torder',
      api: apiVersion,
    };

    const res = (await requestUrlVersionList(requestData)) as AxiosResponse;
    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      allUrlList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

getThemeList();
getAllThemeList();
getAllTabletUrlList();
</script>

<template>
  <UpdateUrlBatchModal
    v-if="flag.updateUrlSetting"
    based="theme"
    modalTitle="티오더 WEB URL 일괄 변경"
    :selectedThemeType="selectedThemeType"
    :reloadStoreList="reloadStoreList"
    :requestApi="getThemeList"
    :allUrlList="allUrlList"
    :postUrlVersionList="postUrlVersionList"
  />
  <el-descriptions
    :column="1"
    border
    class="torder-web-url-description mb-10"
  >
    <el-descriptions-item
      label-align="center"
      align="center"
      label="API 버전"
    >
      <el-row>
        <el-radio-group
          v-model="searchInputInfo.searchApiVersion"
          @change="changeApiVersion"
        >
          <el-radio label="전체"> 전체 </el-radio>
          <el-radio label="1.0"> 1.0 </el-radio>
          <el-radio label="2.0"> 2.0 </el-radio>
        </el-radio-group>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label-align="center"
      align="center"
      label="테마별 조회"
    >
      <el-row>
        <el-select
          v-model="searchInputInfo.searchThemeCode"
          filterable
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          class="search-input"
          placeholder="검색하실 테마를 선택해주세요."
        >
          <el-option
            v-for="(themeType, themeTypeIndex) in allThemeList"
            :key="
              getSearchDataStoreItemKey(themeType.theme_name, themeTypeIndex)
            "
            :label="themeType.theme_name"
            :value="themeType.no"
          />
        </el-select>
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      label-align="center"
      align="center"
      justify="space-between"
      label="테마명 검색"
    >
      <el-row justify="space-between">
        <el-input
          v-model="searchInputInfo.searchTxt"
          class="search-input"
          placeholder="검색하실 테마를 입력해주세요."
          @keyup.enter="reloadStoreList"
        />
        <div>
          <el-button
            type="primary"
            round
            :icon="Search"
            @click="searchTheme"
          >
            검색
          </el-button>
          <el-button
            round
            :icon="RefreshRight"
            @click="onClickResetButton"
          >
            초기화
          </el-button>
        </div>
      </el-row>
    </el-descriptions-item>
  </el-descriptions>
  <el-divider />
  <el-row
    class="mb-10 mt-10"
    justify="space-between"
    align="middle"
  >
    <el-row align="middle">
      총 &nbsp;
      <div class="essential-star">
        {{ totalNumberOfThemeList() }}
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
                excelDownloadRequestData(),
              )
            "
          >
            엑셀 다운로드
          </el-button>
        </el-tooltip>
        <el-button
          type="success"
          @click="onClickModifyButton"
        >
          매장 테마 일괄수정
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
  <div>
    <el-table
      ref="multipleTableRef"
      element-loading-text="매장 정보를 불러오는 중입니다..."
      :element-loading-spinner="loadingSvg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      :data="themeList"
      border
      height="470"
      highlight-current-row
      scrollbar-always-on
      stripe
      class="table-wrap"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      />
      <el-table-column
        :index="paginationInfo.from"
        type="index"
        label="NO"
        header-align="center"
        align="center"
      />
      <el-table-column
        prop="api_version"
        label="API 버전"
        header-align="center"
        align="center"
        width="80"
      />
      <el-table-column
        prop="themeName"
        label="적용 테마"
        header-align="center"
        align="center"
        width="500"
      />
      <el-table-column
        prop="themeName"
        label="테마 권장 여부"
        header-align="center"
        align="center"
        width="450"
      >
        <template #default="{ row }">
          <span
            v-if="row.use_yn === 'N'"
            class="essential-star"
          >
            테마 미권장
          </span>
          <span v-else> 테마 권장 </span>
        </template>
      </el-table-column>
      <el-table-column
        label="매장 갯수"
        header-align="center"
        align="center"
        width="440"
      >
        <template #default="{ row }">
          {{ convertLocaleStringStoreCount(row.cnt) }}
        </template>
      </el-table-column>
    </el-table>
    <el-row
      align="middle"
      class="pagination-wrapper"
      justify="center"
    >
      <el-pagination
        class="mt-10"
        :page-size="paginationInfo.perPage"
        :total="paginationInfo.total"
        :current-page="paginationInfo.page"
        background
        layout="prev, pager, next"
        @current-change="handleChangeStoreListPage"
      />
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.table-wrap {
  &:deep(.el-table__header) {
    .el-table-column--selection {
      .cell {
        display: none;
      }
    }
  }
}

.torder-web-url-description {
  &:deep(.is-bordered-label) {
    width: 20%;
  }
}

.search-input {
  width: 550px;
}
</style>
