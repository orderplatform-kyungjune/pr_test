<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import { elSelectType, productImageListDataType } from '@interface/goods';
import { RefreshRight, Search, Top } from '@element-plus/icons-vue';
import { BreadcrumbHeader } from '@components';
import { PRODUCT_IMAGE_MANAGE } from '@common/string';
import { goodsCodec } from '@codecs';
import { goods } from '@apis';

const { failAuthenticationAlert } = authentication;

const {
  requestProductImageList,
  requestUpdateProduct,
  requestCustomProductCode,
} = goods;
const { runtimeCheck } = runtimeCheckHelper;
const { productImageListCodec, customProductCodeCodec } = goodsCodec;

// header props
const productImageManageHeader = reactive([{ name: PRODUCT_IMAGE_MANAGE }]);

/** 검색 타입 (포스 상품, 노출 상품) */

const searchTypeSelect = [
  {
    value: 'good_name',
    label: '포스 상품 이름',
  },
  {
    value: 'pos_good_code',
    label: '포스 상품 코드',
  },
  {
    value: 'display_good_name',
    label: '상품 표기 이름',
  },
];

/** 검색 데이터 페이지당 개수 */
const searchCount = [
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
];

/** 매장 리스트 */
const productImageList: Ref<productImageListDataType[]> = ref(
  [] as productImageListDataType[],
);

/** 검색 정보 */
const searchInfo = reactive({
  searchStore: '',
  searchProduct: '',
  searchType: 'good_name',
  goodImage: '',
});
const nowDataSet = reactive({
  searchStore: '',
  searchProduct: '',
  searchType: 'good_name',
  goodImage: '',
});

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  page: 1,
  pageSize: 10,
  from: 1,
  to: 10,
  total: 0,
});

/** 로딩 상태값 */
const searchLoading = ref(false);

/** 커스텀 코드 데이터 */
const customCodeData = ref([] as { code: string; text: string }[]);

/** 전체 상품 리스트 불러오기 */
const getProductImageList = async () => {
  searchLoading.value = true;
  try {
    const data = {
      page: paginationInfo.page,
      perPage: paginationInfo.pageSize,
      searchTxt: searchInfo.searchProduct,
      searchType: searchInfo.searchType,
      storeName: searchInfo.searchStore,
      goodImage: searchInfo.goodImage,
    };
    const res = (await requestProductImageList(data)) as AxiosResponse;
    const typeError = runtimeCheck(productImageListCodec, res.data);

    if (res.data.code === 400) {
      searchLoading.value = false;
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      searchLoading.value = false;
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        productImageList.value = res.data.data;
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.pageSize = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
        searchLoading.value = false;

        nowDataSet.searchProduct = searchInfo.searchProduct;
        nowDataSet.searchType = searchInfo.searchType;
        nowDataSet.searchStore = searchInfo.searchStore;
        nowDataSet.goodImage = searchInfo.goodImage;
      }
    }
    searchLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

/** 상품 커스텀 코드 불러오기 */
const getCustomProductCode = async () => {
  try {
    const res = (await requestCustomProductCode()) as AxiosResponse;
    const typeError = runtimeCheck(customProductCodeCodec, res.data);

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
        customCodeData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 커스텀 코드 배열 만들기 */
const getCustomCodeArray = (data: productImageListDataType) => {
  const newArray = JSON.parse(JSON.stringify(customCodeData.value));
  newArray.unshift({
    code: data.T_order_store_pos_code,
    text: data.T_order_store_pos_code,
  });

  return newArray;
};

/** 상품 정보 수정하기 */
const setChangeProduct = (target: productImageListDataType) => {
  const requestData = {
    storeCode: target.T_order_store_code,
    goodCode: target.T_order_store_good_code,
    posGoodCode: target.T_order_store_pos_code,
    goodDpName: target.T_order_store_good_display_name,
    T_order_store_good_image: target.T_order_store_good_image,
    T_order_store_good_horiz_img: target.T_order_store_good_horiz_img,
  };
  ElMessageBox.confirm('정말로 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestUpdateProduct(requestData)) as AxiosResponse;

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
          ElMessage({
            type: 'success',
            message: '정상적으로 변경되었습니다.',
          });
          await getProductImageList();
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 검색하기 */
const getSearchData = () => {
  paginationInfo.page = 1;
  getProductImageList();
};

/** 페이지네이션 */
const handleCurrentPage = async (val: number) => {
  paginationInfo.page = val;
  getProductImageList();
};

// n개씩 보기 선택
const changeSearchCount = () => {
  paginationInfo.page = 1;
  searchInfo.searchProduct = nowDataSet.searchProduct;
  searchInfo.searchType = nowDataSet.searchType;
  searchInfo.searchStore = nowDataSet.searchStore;
  searchInfo.goodImage = nowDataSet.goodImage;
  getProductImageList();
};

const isPosUse = (data: productImageListDataType) =>
  data.T_order_store_good_posYN === 'Y';
const isGoodsUse = (data: productImageListDataType) =>
  data.T_order_store_good_use === 'Y';
const getPriceForm = (data: productImageListDataType) =>
  data.T_order_store_good_defualt_price.toLocaleString();

const getSearchTypeKey = (target: elSelectType, index: number) => {
  if (target.value) return target.value + index;
  return `value${index}`;
};

const onClickResetButton = () => {
  paginationInfo.page = 1;
  paginationInfo.pageSize = 10;
  searchInfo.searchType = 'good_name';
  searchInfo.searchStore = '';
  searchInfo.searchProduct = '';
  searchInfo.goodImage = '';

  getProductImageList();
};

/** 스크롤 상단 이동 */
const scrollToTop = () => {
  document.getElementById('scrollTop')?.scrollIntoView({ behavior: 'smooth' });
};

getProductImageList();
getCustomProductCode();
</script>

<template>
  <div id="scrollTop"></div>
  <BreadcrumbHeader :propsHeader="productImageManageHeader" />
  <el-card class="mt-10 mb-30">
    <el-row>
      <el-col
        :span="7"
        class="mr-40"
      >
        <span class="font-small mr-10"> 매장명 </span>
        <el-input
          v-model="searchInfo.searchStore"
          autofocus
          class="product-image-search-input mr-20"
          placeholder="매장명"
          @keyup.enter="getSearchData"
        />
      </el-col>
      <el-col
        :span="15"
        class="mr-20"
      >
        <span class="font-small mr-10"> 상품 검색 </span>
        <el-select
          v-model="searchInfo.searchType"
          class="product-image-search-select mr-20"
        >
          <el-option
            v-for="(target, index) in searchTypeSelect"
            :key="getSearchTypeKey(target, index)"
            :label="target.label"
            :value="target.value"
          />
        </el-select>
        <el-input
          v-model="searchInfo.searchProduct"
          autofocus
          class="product-image-search-input"
          placeholder="상품명"
          @keyup.enter="getSearchData"
        />
      </el-col>
    </el-row>
    <el-row
      align="bottom"
      justify="space-between"
    >
      <el-col
        :span="8"
        class="mr-40 mt-20"
      >
        <span class="font-small mr-20"> 이미지 설정 여부 </span>
        <el-radio-group v-model="searchInfo.goodImage">
          <el-radio label=""> 전체</el-radio>
          <el-radio label="Y"> 이미지 설정</el-radio>
          <el-radio label="N"> 이미지 미설정</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="4">
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
          @click="onClickResetButton"
        >
          초기화
        </el-button>
      </el-col>
    </el-row>
  </el-card>
  <p class="product-image-search-list">검색목록</p>
  <el-divider class="product-image-divider mt-10 mt-10" />
  <el-row
    class="mb-10"
    justify="end"
  >
    <el-select
      v-model="paginationInfo.pageSize"
      class="product-image-search-select mr-20"
      @change="changeSearchCount"
    >
      <el-option
        v-for="count in searchCount"
        :key="count.value"
        :label="count.label"
        :value="count.value"
      />
    </el-select>
  </el-row>
  <el-table
    v-loading.lock="searchLoading"
    :data="productImageList"
    border
    class="mb-10"
    style="width: 100%"
  >
    <el-table-column
      :index="paginationInfo.from"
      align="center"
      type="index"
      width="60"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      min-width="150"
    >
      <template #default="{ row }">
        <el-row>
          <el-col :span="24">
            <el-tag
              v-if="isPosUse(row)"
              size="small"
            >
              포스 판매 중지
            </el-tag>
            <el-tag
              v-else-if="isGoodsUse(row)"
              size="small"
              type="danger"
            >
              판매 중지
            </el-tag>
          </el-col>
          <el-col :span="24">
            {{ row.T_order_store_name }}
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="이미지"
      prop="T_order_store_name"
      width="150"
    >
      <template #default="{ row }">
        <el-image
          v-if="row.T_order_store_good_image_html"
          :src="row.T_order_store_good_image_html"
          class="product-image"
        />
        <el-empty
          v-else
          :image-size="100"
          class="product-empty-image"
          description="이미지가 없습니다."
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="코드"
      width="200"
    >
      <template #default="{ row }">
        <el-row>
          <p class="product-data-title">포스 코드</p>
          <el-input
            v-model="row.T_order_store_pos_code"
            disabled
          />
        </el-row>
        <el-row>
          <p class="product-data-title">상품 코드</p>
          <el-select v-model="row.T_order_store_good_code">
            <el-option
              v-for="code in getCustomCodeArray(row)"
              :key="code.text"
              :label="code.text"
              :value="code.code"
            />
          </el-select>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="출력 이름"
      width="200"
    >
      <template #default="{ row }">
        <el-row>
          <p class="product-data-title">포스 상품 이름</p>
          <el-input
            v-model="row.T_order_store_good_name"
            disabled
          />
          <p class="product-data-title">상품 출력 이름</p>
          <el-input v-model="row.T_order_store_good_display_name" />
          <p class="product-data-title">단축 상품 이름</p>
          <el-input v-model="row.T_order_store_short_name" />
        </el-row>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="적용 테마"
      prop="T_order_store_Theme"
      width="150"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="가격"
      width="100"
    >
      <template #default="{ row }"> {{ getPriceForm(row) }} 원</template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="이미지"
      min-width="400"
    >
      <template #default="{ row }">
        <el-row>
          <p class="product-data-title">가로</p>
          <el-input v-model="row.T_order_store_good_image" />
        </el-row>
        <el-row>
          <p class="product-data-title">세로</p>
          <el-input v-model="row.T_order_store_good_horiz_img" />
        </el-row>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="수정"
      width="100"
    >
      <template #default="{ row }">
        <el-button
          type="danger"
          @click="setChangeProduct(row)"
        >
          수정
        </el-button>
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
  <div class="product-image-floating-button">
    <el-button
      :icon="Top"
      type="info"
      @click="scrollToTop"
    />
  </div>
</template>

<style lang="scss" scoped>
.product-image-search-input {
  width: 250px;
  min-width: 150px;
  text-align: center;
}

.product-image-search-select {
  width: 200px;
  min-width: 100px;
}

.product-image-search-list {
  font-size: 20px;
}

.product-image-divider {
  margin: 10px 0px; // 기본 margin 제거용
}

.product-data-title {
  font-size: 13px;
  color: #828282;
}

.product-image {
  width: 100px;
  height: 100px;
}

.product-empty-image {
  padding: 0px;
}

.product-image-floating-button {
  position: fixed;
  right: 120px;
  bottom: 50px;
  z-index: 10;
}
</style>
