<script lang="ts" setup>
import { h, ref, Ref, reactive } from 'vue';
import { ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { basedUrlStoreInfoType, pageInfoType } from '@interface/store';
import { Search, RefreshRight } from '@element-plus/icons-vue';
import { UPDATE_URL_SETTING } from '@common/string';
import { storeCodec } from '@codecs';
import { store } from '@apis';
import UpdateUrlBatchModal from './UpdateUrlBatchModal.vue';

defineProps<{
  activeTabName: string;
}>();

const { basedUrlStoreInfoCodec, allUrlListCodec } = storeCodec;
const { requestUrlBasedStoreList, requestAllUrlList } = store;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { openModal, flag } = useModalStore();

const paginationInfo = reactive<pageInfoType>({
  page: 1,
  perPage: 20,
  from: 1,
  to: 10,
  total: 0,
});
const searchInputInfo = reactive({
  searchTxt: '',
  searchTabletUrl: [],
});
const selectedUrl = reactive({
  url: '',
  count: 0,
});

const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const notSettingUrlSearch: Ref<boolean> = ref(false);
const storeList: Ref<basedUrlStoreInfoType[]> = ref([]);
const allUrlList: Ref<string[]> = ref([]);

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

const totalNumberOfUrlListsBasedUrl = () => paginationInfo.total;

const getSearchDataStoreItemKey = (code: string, index: number) => {
  if (code) {
    return `search-store-code-${code}-${index}`;
  }

  return `search-store-${index}`;
};

const onClickModifyButton = () => {
  const infoText = `URL 기준으로 수정을 진행하시려면
  1개만 선택할 수 있습니다.
  확인 부탁드리겠습니다.`;

  if (selectedUrl.url === '' && selectedUrl.count === 0) {
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

const convertLocaleStringStoreCount = (storeCount: number) =>
  storeCount?.toLocaleString();

const handleSelectionChange = (rows: basedUrlStoreInfoType[]) => {
  if (rows.length === 0) {
    selectedUrl.count = 0;
    selectedUrl.url = '';
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

    selectedUrl.count = currentRow.cnt;
    selectedUrl.url = currentRow.version;
  }
};

const getStringFunction = (search: string[]) => search.join(';');

/** URL 기준 매장 정보 불러오기 */
const getUrlBasedStoreList = async () => {
  try {
    let requestData;

    if (notSettingUrlSearch.value) {
      requestData = {
        type: 'master',
        page: paginationInfo.page,
        perPage: paginationInfo.perPage,
        searchTxt: '',
        searchTabletUrl: '',
        searchUrlNone: 'Y',
      };
    } else {
      requestData = {
        type: 'master',
        page: paginationInfo.page,
        perPage: paginationInfo.perPage,
        searchTxt: searchInputInfo.searchTxt,
        searchTabletUrl: getStringFunction(searchInputInfo.searchTabletUrl),
      };
    }

    const res = (await requestUrlBasedStoreList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(basedUrlStoreInfoCodec, res.data.data);

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
      storeList.value = res.data.data;
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

const reloadStoreList = () => {
  paginationInfo.page = 1;
  getUrlBasedStoreList();
};

const handleChangeStoreListPage = (val: number) => {
  paginationInfo.page = val;
  getUrlBasedStoreList();
};

const onClickResetButton = () => {
  searchInputInfo.searchTxt = '';
  searchInputInfo.searchTabletUrl = [];
  notSettingUrlSearch.value = false;
  getUrlBasedStoreList();
};

/** 전체 태블릿 유알엘 리스트 불러오기 */
const getAllUrlList = async () => {
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

getUrlBasedStoreList();
getAllUrlList();
</script>

<template>
  <UpdateUrlBatchModal
    v-if="flag.updateUrlSetting"
    :allUrlList="allUrlList"
    :reloadStoreList="reloadStoreList"
    :requestApi="getUrlBasedStoreList"
    :selectedUrl="selectedUrl"
    based="url"
    modalTitle="마스터 WEB URL 일괄 변경"
    type="master"
  />
  <el-descriptions
    :column="1"
    border
    class="master-url-description mb-10"
  >
    <el-descriptions-item
      align="center"
      label="URL로 검색"
      label-align="center"
    >
      <el-row justify="space-between">
        <el-input
          v-model="searchInputInfo.searchTxt"
          :disabled="notSettingUrlSearch"
          class="search-input"
          placeholder="검색하실 URL을 입력해주세요."
          @keyup.enter="reloadStoreList"
        />
        <el-select
          v-model="searchInputInfo.searchTabletUrl"
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
            v-for="(masterUrl, masterUrlIndex) in allUrlList"
            :key="getSearchDataStoreItemKey(masterUrl, masterUrlIndex)"
            :label="masterUrl"
            :value="masterUrl"
          />
        </el-select>
      </el-row>
      <el-row
        class="mt-10"
        justify="space-between"
      >
        <div>
          <el-checkbox
            v-model="notSettingUrlSearch"
            label="URL 미설정 항목만 검색"
          />
        </div>
        <div>
          <el-button
            :icon="Search"
            round
            type="primary"
            @click="reloadStoreList"
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
        </div>
      </el-row>
    </el-descriptions-item>
  </el-descriptions>
  <el-divider />
  <el-row
    align="middle"
    class="mb-10 mt-10"
    justify="space-between"
  >
    <el-row align="middle">
      총 &nbsp;
      <div class="essential-star">
        {{ totalNumberOfUrlListsBasedUrl() }}
      </div>
      &nbsp; 개
    </el-row>
    <el-row>
      <el-row class="mr-10">
        <el-button
          type="success"
          @click="onClickModifyButton"
        >
          수정
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
      :data="storeList"
      :element-loading-spinner="loadingSvg"
      border
      class="table-wrap"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-text="매장 정보를 불러오는 중입니다..."
      height="550"
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
        :index="paginationInfo.from"
        align="center"
        header-align="center"
        label="NO"
        type="index"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="현재 URL 주소"
        width="1000"
      >
        <template #default="{ row }">
          <span
            v-if="row.version === ''"
            class="essential-star"
          >
            미설정
          </span>
          <span v-else>{{ row.version }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="매장 갯수"
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
.table-wrap {
  &:deep(.el-table__header) {
    .el-table-column--selection {
      .cell {
        display: none;
      }
    }
  }
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
</style>
