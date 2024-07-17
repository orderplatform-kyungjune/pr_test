<script setup lang="ts">
import { ref, Ref, reactive, computed } from 'vue';
import { ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, dateFormatterUtil } from '@utils';
import useTagsStore from '@store/storeTags';
import useModalStore from '@store/storeModal';
import { detailExtraServiceManage } from '@router/routePaths';
import { responseExtraServiceStoreListType } from '@interface/extraService';
import { ExtraServiceBulkChangeModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  SHOP_MANAGE,
  EXTRA_SERVICE_MANAGE,
  EXTRA_SERVICE_BULK_CHANGE,
} from '@common/string';
import { extraServiceCodec } from '@codecs';
import gatewayTokenApi from '@apis/axios/gatewayTokenApi';
import { endpoints, extraService } from '@apis';

const tagStore = useTagsStore();
const { flag, openModal } = useModalStore();
const { addTagsData } = tagStore;
const { runtimeCheck } = runtimeCheckHelper;
const { requestExtraServiceStoreList } = extraService;
const { refinedToday } = dateFormatterUtil;
const { responseExtraServiceStoreListDataCodec } = extraServiceCodec;

const extraServiceManageHeader = reactive([
  { name: SHOP_MANAGE },
  { name: EXTRA_SERVICE_MANAGE },
]);

const paginationInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
});

const searchData = reactive({
  storeName: '',
  chattingInUse: 'all' as string | boolean,
  auctionInUse: 'all' as string | boolean,
  jackpotInUse: 'all' as string | boolean,
  tableGameInUse: 'all' as string | boolean,
  zepInUse: 'all' as string | boolean,
  chattingInDisplay: 'all' as string | boolean,
  tableGameInDisplay: 'all' as string | boolean,
  zepInDisplay: 'all' as string | boolean,
});

const excelDownloadState = ref(false);

const useStateSelect = [
  {
    value: 'all',
    label: '전체',
  },
  {
    value: true,
    label: '사용',
  },
  {
    value: false,
    label: '미사용',
  },
];

const useExposureSelect = [
  {
    value: 'all',
    label: '전체',
  },
  {
    value: true,
    label: '노출',
  },
  {
    value: false,
    label: '미노출',
  },
];

const pagePerCount = [
  {
    label: '10개씩 보기',
    value: 10,
  },
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

/** 매장 관리 - 매장 리스트 불러오기 */
const extraServiceStoreList: Ref<responseExtraServiceStoreListType[]> = ref([]);
const getExtraServiceStoreList = async () => {
  const requestData = {
    page: paginationInfo.page,
    size: paginationInfo.size,
    storeName: searchData.storeName,
    chattingInUse: searchData.chattingInUse,
    chattingInDisplay: searchData.chattingInDisplay,
    auctionInUse: searchData.auctionInUse,
    jackpotInUse: searchData.jackpotInUse,
    tableGameInUse: searchData.tableGameInUse,
    tableGameInDisplay: searchData.tableGameInDisplay,
    zepInUse: searchData.zepInUse,
    zepInDisplay: searchData.zepInDisplay,
  };

  try {
    const res = (await requestExtraServiceStoreList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceStoreListDataCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        paginationInfo.page = res.data.data.pageNo;
        paginationInfo.size = res.data.data.pageSize;
        paginationInfo.total = res.data.data.totalElementCount;
        paginationInfo.to = res.data.data.to;
        paginationInfo.from = res.data.data.from;
        extraServiceStoreList.value = res.data.data.storeList;
      }
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장리스트 엑셀 다운로드 */
const downloadExcel = () => {
  let searchUrl = endpoints.entertainmentAdmin.stores.toExcel;

  try {
    excelDownloadState.value = true;

    const {
      storeName,
      chattingInUse,
      chattingInDisplay,
      auctionInUse,
      jackpotInUse,
      tableGameInUse,
      tableGameInDisplay,
      zepInUse,
      zepInDisplay,
    } = searchData;

    if (storeName.length !== 0) {
      searchUrl = searchUrl.concat(`&storeName=${storeName}`);
    }
    if (chattingInUse !== 'all') {
      searchUrl = searchUrl.concat(`&chattingInUse=${chattingInUse}`);
    }
    if (chattingInDisplay !== 'all') {
      searchUrl = searchUrl.concat(`&chattingInDisplay=${chattingInDisplay}`);
    }
    if (auctionInUse !== 'all') {
      searchUrl = searchUrl.concat(`&auctionInUse=${auctionInUse}`);
    }
    if (jackpotInUse !== 'all') {
      searchUrl = searchUrl.concat(`&jackpotInUse=${jackpotInUse}`);
    }
    if (tableGameInUse !== 'all') {
      searchUrl = searchUrl.concat(`&tableGameInUse=${tableGameInUse}`);
    }
    if (tableGameInDisplay !== 'all') {
      searchUrl = searchUrl.concat(`&tableGameInDisplay=${tableGameInDisplay}`);
    }
    if (zepInUse !== 'all') {
      searchUrl = searchUrl.concat(`&zepInUse=${zepInUse}`);
    }
    if (zepInDisplay !== 'all') {
      searchUrl = searchUrl.concat(`&zepInDisplay=${zepInDisplay}`);
    }

    const replaceAt = (target: string, index: number, replacement: string) => {
      if (index >= target.length || index < 0) {
        return target;
      }

      return (
        target.substring(0, index) + replacement + target.substring(index + 1)
      );
    };

    gatewayTokenApi({
      url: replaceAt(searchUrl, searchUrl.indexOf('&'), '?'),
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      link.download = `부가서비스 관리_${refinedToday()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      excelDownloadState.value = false;
    });
  } catch (error) {
    console.log(error);
    excelDownloadState.value = false;
  }
};

// 테이블 체크 박스
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const extraServiceCheckboxData: Ref<responseExtraServiceStoreListType[]> = ref(
  [],
);
const handleTorderSelect = (val: responseExtraServiceStoreListType[]) => {
  extraServiceCheckboxData.value = val;
};

// 검색 초기화
const resetSearchData = () => {
  searchData.storeName = '';
  searchData.chattingInUse = 'all';
  searchData.auctionInUse = 'all';
  searchData.jackpotInUse = 'all';
  searchData.tableGameInUse = 'all';
  searchData.zepInUse = 'all';
  searchData.chattingInDisplay = 'all';
  searchData.tableGameInDisplay = 'all';
  searchData.zepInDisplay = 'all';

  getExtraServiceStoreList();
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 0;
  await getExtraServiceStoreList();
};

/** 페이지네이션 */
const torderHandlePage = (val: number) => {
  paginationInfo.page = val - 1;
  getExtraServiceStoreList();
};
const changePageSize = (value: number) => {
  paginationInfo.size = value;
  getExtraServiceStoreList();
};

const getTruthyUse = (val: boolean) => (val ? '사용' : '미사용');
const getTruthyDisplay = (val: boolean) => (val ? '노출' : '미노출');
const isEmptySelectData = computed(() => {
  if (extraServiceCheckboxData.value.length === 0) return true;
  return false;
});

getExtraServiceStoreList();
</script>

<template>
  <ExtraServiceBulkChangeModal
    v-if="flag.extraServiceBulkChange"
    :storeList="extraServiceCheckboxData"
    :getStoreList="() => getExtraServiceStoreList()"
  />
  <BreadcrumbHeader :propsHeader="extraServiceManageHeader" />
  <el-descriptions
    class="extra-service-search-box mb-20"
    :column="1"
    border
  >
    <el-descriptions-item
      label="사용 여부"
      label-align="center"
      align="center"
      class-name="extra-service-use"
    >
      <el-descriptions
        :column="5"
        direction="vertical"
        border
      >
        <el-descriptions-item
          label="채팅"
          label-align="center"
          align="center"
          label-class-name="extra-service-label"
          class-name="extra-service-contents"
        >
          <el-select
            v-model="searchData.chattingInUse"
            class="width-100"
          >
            <el-option
              v-for="use in useStateSelect"
              :key="use.value"
              :label="use.label"
              :value="use.value"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="경매"
          label-align="center"
          align="center"
          label-class-name="extra-service-label"
          class-name="extra-service-contents"
        >
          <el-select
            v-model="searchData.auctionInUse"
            class="width-100"
          >
            <el-option
              v-for="use in useStateSelect"
              :key="use.value"
              :label="use.label"
              :value="use.value"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="잭팟"
          label-align="center"
          align="center"
          label-class-name="extra-service-label"
          class-name="extra-service-contents"
        >
          <el-select
            v-model="searchData.jackpotInUse"
            class="width-100"
          >
            <el-option
              v-for="use in useStateSelect"
              :key="use.value"
              :label="use.label"
              :value="use.value"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="테이블게임"
          label-align="center"
          align="center"
          label-class-name="extra-service-label"
          class-name="extra-service-contents"
        >
          <el-select
            v-model="searchData.tableGameInUse"
            class="width-100"
          >
            <el-option
              v-for="use in useStateSelect"
              :key="use.value"
              :label="use.label"
              :value="use.value"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="ZEP(영상대화)"
          label-align="center"
          align="center"
          label-class-name="extra-service-label-last"
          class-name="extra-service-contents-last"
        >
          <el-select
            v-model="searchData.zepInUse"
            class="width-100"
          >
            <el-option
              v-for="use in useStateSelect"
              :key="use.value"
              :label="use.label"
              :value="use.value"
            />
          </el-select>
        </el-descriptions-item>
      </el-descriptions>
    </el-descriptions-item>
    <el-descriptions-item
      label="노출 여부"
      label-align="center"
      align="center"
      class-name="extra-service-exposure-grid"
    >
      <div class="extra-service-exposure">
        <el-select
          v-model="searchData.chattingInDisplay"
          class="width-100 extra-service-exposure-contents"
          :class="'first'"
        >
          <el-option
            v-for="use in useExposureSelect"
            :key="use.value"
            :label="use.label"
            :value="use.value"
          />
        </el-select>
        <span class="extra-service-exposure-contents"> - </span>
        <span class="extra-service-exposure-contents"> - </span>
        <el-select
          v-model="searchData.tableGameInDisplay"
          class="width-100 extra-service-exposure-contents"
        >
          <el-option
            v-for="use in useExposureSelect"
            :key="use.value"
            :label="use.label"
            :value="use.value"
          />
        </el-select>
        <el-select
          v-model="searchData.zepInDisplay"
          class="width-100 extra-service-exposure-contents-last"
        >
          <el-option
            v-for="use in useExposureSelect"
            :key="use.value"
            :label="use.label"
            :value="use.value"
          />
        </el-select>
      </div>
    </el-descriptions-item>
    <el-descriptions-item
      label="매장명"
      label-align="center"
      align="center"
    >
      <el-input
        v-model="searchData.storeName"
        @keyup.enter="getSearchData"
      />
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    justify="center"
    class="mb-10"
  >
    <el-button
      class="extra-service-button"
      type="warning"
      @click="resetSearchData"
    >
      초기화
    </el-button>
    <el-button
      class="extra-service-button"
      type="primary"
      @click="getSearchData"
    >
      검색
    </el-button>
  </el-row>
  <p class="extra-service-search-list">검색목록</p>
  <el-divider class="extra-service-divider" />
  <el-row
    justify="space-between"
    align="middle"
    class="mb-10"
  >
    <p class="extra-service-count-info">
      총 <span>{{ paginationInfo.total }}</span>
      개의 검색결과가 있습니다.
    </p>
    <div>
      <el-button
        class="extra-service-button"
        type="primary"
        :disabled="isEmptySelectData"
        @click="openModal(EXTRA_SERVICE_BULK_CHANGE)"
      >
        일괄 변경
      </el-button>
      <el-button
        v-if="!excelDownloadState"
        class="extra-service-button"
        type="success"
        @click="downloadExcel"
      >
        엑셀 다운
      </el-button>
      <el-button
        v-else
        class="extra-service-button"
        type="success"
        loading
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="paginationInfo.size"
        class="extra-service-page-select"
        @change="changePageSize"
      >
        <el-option
          v-for="count in pagePerCount"
          :key="count.value"
          :label="count.label"
          :value="count.value"
        />
      </el-select>
    </div>
  </el-row>
  <el-table
    ref="multipleTableRef"
    :data="extraServiceStoreList"
    border
    height="400"
    @selection-change="handleTorderSelect"
  >
    <el-table-column
      align="center"
      header-align="center"
      type="selection"
    />
    <el-table-column
      align="center"
      header-align="center"
      type="index"
      label="NO"
      width="80"
    >
      <template #default="{ $index }">
        <p>{{ paginationInfo.from - $index }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      prop="storeCode"
      label="매장코드"
    />
    <el-table-column
      align="center"
      header-align="center"
      prop="storeName"
      label="매장명"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="채팅"
      width="150"
    >
      <template #default="{ row }">
        {{ getTruthyUse(row.chatting.isUsed) }} /
        {{ getTruthyDisplay(row.chatting.isIconDisplay) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="경매"
      width="150"
    >
      <template #default="{ row }">
        {{ getTruthyUse(row.auction.isUsed) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="잭팟"
      width="150"
    >
      <template #default="{ row }">
        {{ getTruthyUse(row.jackpot.isUsed) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="테이블게임"
      width="150"
    >
      <template #default="{ row }">
        {{ getTruthyUse(row.tableGame.isUsed) }} /
        {{ getTruthyDisplay(row.tableGame.isIconDisplay) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="ZEP"
      width="150"
    >
      <template #default="{ row }">
        {{ getTruthyUse(row.zep.isUsed) }} /
        {{ getTruthyDisplay(row.zep.isIconDisplay) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="상세"
      width="100"
    >
      <template #default="{ row }">
        <router-link
          :to="{
            path: detailExtraServiceManage,
            query: {
              code: row.storeCode,
              name: row.storeName,
            },
          }"
        >
          <el-button
            @click="
              addTagsData({
                name: '부가서비스 매장 상세',
                path: detailExtraServiceManage,
                query: {
                  code: row.storeCode,
                  name: row.storeName,
                },
              })
            "
          >
            상세
          </el-button>
        </router-link>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    class="mt-10"
    align="middle"
    justify="center"
  >
    <el-pagination
      background
      layout="prev, pager, next"
      :total="paginationInfo.total"
      :page-size="paginationInfo.size"
      :current-page="paginationInfo.page + 1"
      @current-change="torderHandlePage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.extra-service-search-box {
  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 15%;
    vertical-align: middle;
  }
  :deep(.extra-service-use) {
    padding: 0px !important;
    border: none;
  }
  :deep(.extra-service-label) {
    border-top: none !important;
    border-left: none !important;
  }
  :deep(.extra-service-contents) {
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
  }
  :deep(.extra-service-label-last) {
    border-top: none !important;
    border-right: none !important;
    border-left: none !important;
  }
  :deep(.extra-service-contents-last) {
    border: none !important;
  }
  :deep(.extra-service-exposure-grid) {
    padding: 0px !important;
  }
  .extra-service-exposure {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    .extra-service-exposure-contents {
      box-sizing: border-box;
      padding: 8px 13px;
      margin-left: 1px;
      border-right: 1px solid #ebeef5;
      &.first {
        margin-left: 0px;
      }
    }
    .extra-service-exposure-contents-last {
      box-sizing: border-box;
      padding: 8px 11px;
    }
  }
}
.extra-service-search-list {
  font-size: 20px;
}
.extra-service-divider {
  margin: 10px 0;
}
.extra-service-count-info {
  font-size: 15px;
  span {
    font-size: 17px;
    color: red;
  }
}
.extra-service-page-select {
  margin-left: 12px;
}
.extra-service-button {
  width: 120px;
}
</style>
