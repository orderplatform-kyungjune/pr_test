<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, onActivated, reactive, Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { endpoints, goods } from '@src/apis';
import { goodsInCategorizeType } from '@interface/goods';
import {
  QuestionFilled,
  RefreshRight,
  Search,
  WarningFilled,
} from '@element-plus/icons-vue';
import {
  CategorizeBottomFloatingBar,
  CategorizeGoodsCard,
  EditAllProductModal,
} from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { goodsCodec } from '@codecs';

const { failAuthenticationAlert } = authentication;
const { runtimeCheck } = runtimeCheckHelper;
const { requestGoodsSearchList } = goods;
const { responseGoodsListInCategorizeCodec } = goodsCodec;
const { downloadExcelPostWithToken } = useExcelDownload();
const { flag } = useModalStore();
const route = useRoute();

const storeCode = route.query.code as string;

/** 상품 조회하기 */
const searchInput: Ref<string> = ref('');
const recentSearchInput: Ref<string> = ref('');
const isAfterSearched: Ref<boolean> = ref(false);

const goodsList: Ref<goodsInCategorizeType[]> = ref([]);

const searchDataInfo = reactive({
  page: 1,
  per_page: 30,
  from: 1,
  to: 0,
  total: 0,
});

/** 검색 로딩 상태값 */
const loading = ref(false);
const pageSizeOptions = [
  {
    value: 30,
    label: '30개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
];
const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

/** 전체 상품 엑셀 다운로드 */
const isExcelDownloading: Ref<boolean> = ref(false);
const convertStoreCodeName = (storeName: string) =>
  storeName.replaceAll('.', '_');
const getExcelDownload = async () => {
  try {
    isExcelDownloading.value = true;
    const excelTitle = convertStoreCodeName(
      `[${route.query.name ? route.query.name : storeCode}]_태블릿 미등록 상품_목록`,
    );
    const param = {
      storeCode,
      selectType: 'out',
    };
    await downloadExcelPostWithToken(
      excelTitle,
      endpoints.category.v2.excel.goods_list,
      param,
    );
  } catch (error) {
    console.log(error);
  } finally {
    isExcelDownloading.value = false;
  }
};

/** 선택한 상품 리스트 */
const checkedGoodsList: Ref<goodsInCategorizeType[]> = ref([]);

/** 체크박스 전체 선택 */
const isAllChecked = ref(false);

const isDisableAllCheckbox = computed(() => goodsList.value?.length === 0);

const isIndeterminateAll = computed(
  () =>
    checkedGoodsList.value?.length > 0 &&
    goodsList.value?.length > checkedGoodsList.value?.length,
);

const changeSelectedList = () => {
  checkedGoodsList.value.splice(0, checkedGoodsList.value?.length);
  if (isAllChecked.value) {
    goodsList.value.forEach((goodsInfo) => {
      checkedGoodsList.value.push(goodsInfo);
    });
  }
};

const changeAllCheck = (value: boolean) => {
  isAllChecked.value = value;
  changeSelectedList();
};

const isContainsGoodsItem = (goodsCode: string) =>
  checkedGoodsList.value.findIndex(
    (goodsCodeInList) => goodsCodeInList.goodCode === goodsCode,
  ) > -1;

const checkGoodsItem = (good: goodsInCategorizeType) => {
  const existedValue = checkedGoodsList.value.find(
    (alreadyCheckedCode) => alreadyCheckedCode.goodCode === good.goodCode,
  );

  if (existedValue) {
    checkedGoodsList.value = checkedGoodsList.value.filter(
      (item) => item.goodCode !== existedValue.goodCode,
    );
  } else {
    checkedGoodsList.value.push(good);
  }

  if (checkedGoodsList.value?.length === 0) {
    isAllChecked.value = false;
    return;
  }

  if (
    checkedGoodsList.value?.length > 0 &&
    checkedGoodsList.value?.length === goodsList.value?.length
  ) {
    isAllChecked.value = true;
  }
};

/** 상품 조회하기 */
const getGoodsListInCategorize = async (searchTxt?: string) => {
  try {
    changeAllCheck(false);
    loading.value = true;

    const param = {
      page: searchDataInfo.page,
      perPage: searchDataInfo.per_page,
      storeCode,
      categoryType: 'not',
      searchTxt: searchTxt ?? '',
    };
    const res = (await requestGoodsSearchList(param)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseGoodsListInCategorizeCodec,
      res.data,
    );

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        goodsList.value = res.data.data;
        searchDataInfo.page = res.data.page_info.current_page;
        searchDataInfo.per_page = res.data.page_info.per_page;
        searchDataInfo.total = res.data.page_info.total;
        searchDataInfo.to = res.data.page_info.to;
        searchDataInfo.from = res.data.page_info.from;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const selectPageOption = () => {
  searchDataInfo.page = 1;
  getGoodsListInCategorize();
};

const getSearchValueByExceptInput = (exceptInput?: boolean) =>
  exceptInput ? '' : searchInput.value;

/** 상품 순서 변경, 상품 상세 변경 이후 리스트 재호출 */
const reloadGoodsList = async (exceptInput?: boolean) => {
  const searchTxt =
    recentSearchInput.value !== ''
      ? recentSearchInput.value
      : getSearchValueByExceptInput(exceptInput);
  await getGoodsListInCategorize(searchTxt);

  // checkedGoodsList 데이터 업데이트
  const checkedCodes = checkedGoodsList.value.map((good) => good.goodCode);
  checkedGoodsList.value = goodsList.value.filter((good) =>
    checkedCodes.includes(good.goodCode),
  );
};

const resetProductList = () => {
  searchInput.value = '';
  goodsList.value = [];
  getGoodsListInCategorize();
};

const scrollToTop = () => {
  document.getElementById('scrollTop')?.scrollIntoView({ behavior: 'smooth' });
};

const onClickPagination = (val: number) => {
  searchDataInfo.page = val;
  getGoodsListInCategorize();
  scrollToTop();
};

/** v-for key 방어 코드 */
const getGoodsKey = (categoryName: string, index: number) =>
  categoryName ? `goods-${categoryName}-${index}` : `goods-${index}`;
const getPageSizeOptionKey = (label: string, index: number) =>
  label
    ? `search-goods-option-${label}-${index}`
    : `search-goods-option-${index}`;

const searchByKeyword = () => {
  changeAllCheck(false);

  isAfterSearched.value = true;
  recentSearchInput.value = searchInput.value;
  getGoodsListInCategorize(searchInput.value);
};

/** 상품 상세 -> 뒤로가기 keepAlive 상태에서 데이터 최신화 */
onActivated(() => {
  getGoodsListInCategorize();
});

getGoodsListInCategorize();
</script>

<template>
  <EditAllProductModal
    v-if="flag.editAllProduct"
    :checkGoodsItem="checkGoodsItem"
    :checkedItem="checkedGoodsList"
    :reloadGoodsList="reloadGoodsList"
  />
  <div>
    <el-row class="width-100">
      <!-- 상품 검색 영역 -->
      <el-card
        class="mb-10 mr-10 search-container"
        shadow="hover"
      >
        <el-row>
          <span>상품 검색</span>
        </el-row>
        <el-row class="mt-20">
          <el-input
            v-model="searchInput"
            class="search-input"
            placeholder="상품 이름 검색"
            @keyup.enter="searchByKeyword"
          />
          <el-button
            :disabled="!searchInput?.length"
            :icon="Search"
            class="ml-10"
            round
            type="primary"
            @click="searchByKeyword"
          >
            검색
          </el-button>
          <el-button
            :icon="RefreshRight"
            round
            @click="resetProductList"
          >
            초기화
          </el-button>
        </el-row>
      </el-card>

      <!-- 정보 내려받기 -->
      <el-card
        class="mb-10 flex-1"
        shadow="hover"
      >
        <el-row align="middle">
          <span> 정보 내려받기 </span>
          <el-tooltip
            content="태블릿 미등록 상품 목록을 다운로드 합니다."
            placement="right"
          >
            <el-icon class="ml-5">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-row>
        <el-row
          class="mt-20"
          justify="space-between"
        >
          <el-button
            :disabled="goodsList?.length === 0"
            :loading="isExcelDownloading"
            type="success"
            @click="getExcelDownload()"
          >
            태블릿 미등록 상품 전체 다운로드
          </el-button>
        </el-row>
      </el-card>
    </el-row>
    <!-- 상품 영역 -->
    <el-card
      v-loading="loading"
      :element-loading-spinner="svg"
      class="mb-20"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      element-loading-svg-view-box="-10, -10, 50, 50"
      shadow="hover"
    >
      <el-row
        v-if="goodsList?.length"
        align="middle"
        class="mb-3"
        justify="space-between"
      >
        <span>
          <span class="xl:text-sm lg:text-sm"> 태블릿 미등록 상품 </span>
          <span v-if="searchDataInfo.total">
            ({{ searchDataInfo.total }})
          </span>
        </span>
        <el-select
          v-model="searchDataInfo.per_page"
          @change="selectPageOption"
        >
          <el-option
            v-for="(pageSize, pageSizeIndex) in pageSizeOptions"
            :key="getPageSizeOptionKey(pageSize.label, pageSizeIndex)"
            :label="pageSize.label"
            :value="pageSize.value"
          />
        </el-select>
      </el-row>
      <el-row
        class="mt-20"
        justify="space-between"
      >
        <el-checkbox
          v-model="isAllChecked"
          :disabled="goodsList?.length === 0"
          :indeterminate="isIndeterminateAll"
          label="전체 선택"
          @change="changeAllCheck"
        />
      </el-row>
      <div
        v-if="goodsList?.length > 0"
        class="categorize-goods-list mt-20"
      >
        <CategorizeGoodsCard
          v-for="(goodsItem, index) in goodsList"
          :key="getGoodsKey(goodsItem.goodCategory, index)"
          :checkGoodsItem="checkGoodsItem"
          :checked="isContainsGoodsItem(goodsItem.goodCode)"
          :itemInfo="goodsItem"
          :reloadGoodsList="reloadGoodsList"
          tabName="unregistered'"
        />
      </div>
      <div v-else>
        <el-row
          v-if="searchInput"
          class="goods-empty mt-20 mb-20"
          justify="center"
        >
          <el-icon
            :size="30"
            class="mb-10"
          >
            <WarningFilled color="#73767a" />
          </el-icon>
          <el-text type="info"> 검색 상품이 없습니다.</el-text>
        </el-row>
        <el-row
          v-else
          class="goods-empty mt-20 mb-20"
          justify="center"
        >
          <el-icon
            :size="30"
            class="mb-10"
          >
            <WarningFilled color="#73767a" />
          </el-icon>
          <el-text type="info"> 상품이 없습니다.</el-text>
        </el-row>
      </div>
      <el-row
        v-if="goodsList?.length"
        align="middle"
        class="mt-10"
        justify="center"
      >
        <el-pagination
          :current-page="searchDataInfo.page"
          :page-size="searchDataInfo.per_page"
          :total="searchDataInfo.total"
          background
          layout="prev, pager, next"
          @current-change="onClickPagination"
        />
      </el-row>
    </el-card>

    <!-- 하단 플로팅 영역 -->
    <CategorizeBottomFloatingBar
      :changeAllCheck="changeAllCheck"
      :checkedGoodsList="checkedGoodsList"
      :isAllChecked="isAllChecked"
      :isDisableAllCheckbox="isDisableAllCheckbox"
      :isIndeterminateAll="isIndeterminateAll"
      :reloadGoodsList="reloadGoodsList"
      tabName="unregistered"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-container {
  flex: 2;

  .search-input {
    max-width: 720px;
  }
}

.categorize-goods-list {
  display: grid;
  grid-template-columns: repeat(4, 382px);
  gap: 20px;
  margin-bottom: 70px;
  overflow-x: auto;
}

.categorize-goods-card {
  width: 380px;
  height: 806px;
}

.goods-empty {
  flex-direction: column;
  align-items: center;
  min-height: 100px;
}
</style>
