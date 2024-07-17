<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useAuthStore from '@store/storeAuth';
import { productListWithCategoryType } from '@interface/goods';
import { Picture } from '@element-plus/icons-vue';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import { PRODUCT_MANAGE, STORE_LIST } from '@common/string';
import { goodsCodec } from '@codecs';
import { goods } from '@apis';

const route = useRoute();

const promotionRegisterHeader = reactive([
  { name: STORE_LIST },
  { name: PRODUCT_MANAGE },
]);

const {
  requestFullGoodsList,
  requestUpdateProduct,
  requestUpdateMultipleGoodsSetting,
} = goods;
const { productWithCategoryListCodec } = goodsCodec;
const { runtimeCheck } = runtimeCheckHelper;
const { accessAuthFunctionData } = useAuthStore();
const { failAuthenticationAlert, checkAuthFunction } = authentication;

const searchData = reactive({
  searchTxt: '',
  searchSticker: [],
  searchGoodsType: [],
  searchSaleAdv: [],
});

const activeTabs = ref('sticker');

const headerCheckbox = reactive({
  md: false,
  hit: false,
  discount: false,
  best: false,
  new: false,
  vegan: false,
  spicy: false,
  signature: false,
  use: false,
  sale: false,
});

const resetHeaderCheckbox = () => {
  headerCheckbox.md = false;
  headerCheckbox.hit = false;
  headerCheckbox.discount = false;
  headerCheckbox.best = false;
  headerCheckbox.new = false;
  headerCheckbox.vegan = false;
  headerCheckbox.spicy = false;
  headerCheckbox.signature = false;
  headerCheckbox.use = false;
  headerCheckbox.sale = false;
};

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  currentPage: 0,
  pageSize: 10,
  totalPages: 1,
});

/** 페이지 당 매장 개수 */
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
  {
    value: 200,
    label: '200개씩 보기',
  },
];

const stickerOptions = [
  {
    value: 'md',
    label: '추천',
    id: 'F4001',
  },
  {
    value: 'hit',
    label: '히트',
    id: 'F4002',
  },
  {
    value: 'sale',
    label: '세일',
    id: 'F4003',
  },
  {
    value: 'best',
    label: '베스트',
    id: 'F4004',
  },
  {
    value: 'new',
    label: '신규',
    id: 'F4005',
  },
  {
    value: 'vegan',
    label: '비건',
    id: 'F4006',
  },
  {
    value: 'spicy',
    label: '스파이시',
    id: 'F4007',
  },
  {
    value: 'signature',
    label: '시그니처',
    id: 'F4008',
  },
];

const productPropertyOptions = [
  {
    value: 'is_achole',
    label: '주류 속성',
  },
  {
    value: 'is_food',
    label: '음식 속성',
  },
  {
    value: 'is_side',
    label: '사이드 속성',
  },
  {
    value: 'is_service',
    label: '서비스 속성',
  },
  {
    value: 'is_hide',
    label: '숨기기 속성',
  },
  {
    value: 'none',
    label: '없음',
  },
  {
    value: 'spicy',
    label: '스파이시',
  },
  {
    value: 'signature',
    label: '시그니처',
  },
];

const saleAdvOption = [
  {
    value: 'good_use',
    label: '판매 중지',
    id: 'F4009',
  },
  {
    value: 'good_sale',
    label: '품절',
    id: 'F4010',
  },
  {
    value: 'good_kitchen',
    label: '주방 마감',
    id: 'F4011',
  },
  {
    value: 'non_show_cart',
    label: '주문서 표기 안함',
    id: 'F4012',
  },
  {
    value: 'is_order',
    label: '주문 가능 여부',
    id: 'F4013',
  },
  {
    value: 'good_adble_adv_goods',
    label: '광고 적용 여부',
    id: 'F4014',
  },
];

/** 상품 스티커 일괄 제어 셀렉트 박스 리스트 */
const getStickerOptions = () => {
  const target = stickerOptions.filter((opt) =>
    accessAuthFunctionData.includes(opt.id),
  );
  return target;
};

/** 판매, 광고 속성 셀렉트 박스 리스트 */
const getSaleAdvOptions = () => {
  const target = saleAdvOption.filter((opt) =>
    accessAuthFunctionData.includes(opt.id),
  );
  return target;
};

const getStringFunction = (search: string[]) => search.join(';');

// 전체 상품 조회
const totalProductList = ref<productListWithCategoryType[]>([]);
const postFullGoodsList = async () => {
  const data = {
    storeCode: route.query.code as string,
    page: paginationInfo.currentPage,
    perPage: paginationInfo.pageSize,
    searchTxt: searchData.searchTxt,
    searchSaleAdv: getStringFunction(searchData.searchSaleAdv),
    searchSticker: getStringFunction(searchData.searchSticker),
    searchGoodsType: getStringFunction(searchData.searchGoodsType),
  };
  try {
    const res = (await requestFullGoodsList(data)) as AxiosResponse;
    const typeError = runtimeCheck(productWithCategoryListCodec, res.data);

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
        if (res.data.data.length > 0) {
          totalProductList.value = res.data.data;
          paginationInfo.totalPages = res.data.page_info.total;
          paginationInfo.currentPage = res.data.page_info.current_page ?? 1;
          paginationInfo.pageSize = res.data.page_info.per_page;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 상품 정보 수정하기 */
const postUpdateProduct = async (
  state: string | string[],
  target: productListWithCategoryType,
  key: string,
) => {
  const requestData = {
    storeCode: route.query.code as string,
    goodCode: target.T_order_store_good_code,
    posGoodCode: target.T_order_store_pos_code,
    [key]: state,
  };

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
    }
  } catch (error) {
    console.log(error);
  }
};

/** 상품 정보 일괄 수정하기 */
const postUpdateAllProduct = async (val: boolean, target: string) => {
  const targetArray: string[] = [];
  totalProductList.value.forEach((product) =>
    targetArray.push(product.T_order_store_good_code),
  );
  const requestData = {
    storeCode: route.query.code as string,
    column: target,
    useYN: val ? 'Y' : 'N',
    goodsCodeArr: targetArray,
  };

  try {
    const res = (await requestUpdateMultipleGoodsSetting(
      requestData,
    )) as AxiosResponse;

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
    }
  } catch (error) {
    console.log(error);
  }
};

/** 모든 체크박스 선택 */
const handleCheckAllChange = (val: boolean, option: string) => {
  ElMessageBox.confirm('일괄적으로 속성을 적용하시겠습니까?', '일괄 적용', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      for (let i = 0; i < totalProductList.value.length; i += 1) {
        totalProductList.value[i][option] = val ? 'Y' : 'N';
      }
      postUpdateAllProduct(val, option);
    })
    .catch(() => {
      resetHeaderCheckbox();
      ElMessage({
        type: 'info',
        message: '취소 되었습니다.',
      });
    });
};

/** 검색하기 */
const getSearchData = () => {
  resetHeaderCheckbox();
  paginationInfo.currentPage = 1;
  postFullGoodsList();
};

/** 초기화 */
const getResetData = () => {
  resetHeaderCheckbox();
  paginationInfo.currentPage = 1;
  paginationInfo.pageSize = 10;
  searchData.searchTxt = '';
  searchData.searchSticker = [];
  searchData.searchGoodsType = [];
  searchData.searchSaleAdv = [];
  postFullGoodsList();
};

/** 페이지네이션 */
const handleCurrentPage = (val: number) => {
  resetHeaderCheckbox();
  paginationInfo.currentPage = val;
  postFullGoodsList();
};

/** 페이지당 개수 */
const changePageSize = (value: number) => {
  resetHeaderCheckbox();
  paginationInfo.pageSize = value;
  postFullGoodsList();
};

const getSearchTitle = () => {
  if (!checkAuthFunction('F4014')) return '판매';
  return '판매 • 광고';
};

postFullGoodsList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="promotionRegisterHeader" />
  <StoreNameBox />
  <el-card
    class="mb-10"
    shadow="never"
  >
    <el-form
      :model="searchData"
      class="product-manage-form"
      label-position="top"
    >
      <el-form-item
        class="width-100"
        label="상품명"
      >
        <el-input
          v-model="searchData.searchTxt"
          clearable
          placeholder="상품명을 입력해주세요."
          @keyup.enter="getSearchData"
        />
      </el-form-item>
      <el-form-item
        class="width-100"
        label="페이지당 개수"
      >
        <el-select
          v-model="paginationInfo.pageSize"
          class="width-100"
          placeholder="개수를 선택해주세요."
          @change="changePageSize"
        >
          <el-option
            v-for="count in pageSizeOptions"
            :key="count.value"
            :label="count.label"
            :value="count.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        class="width-100"
        label="스티커"
      >
        <el-select
          v-model="searchData.searchSticker"
          class="width-100"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="스티커를 선택해주세요."
        >
          <el-option
            v-for="sticker in getStickerOptions()"
            :key="sticker.value"
            :label="sticker.label"
            :value="sticker.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        class="width-100"
        label="상품 속성"
      >
        <el-select
          v-model="searchData.searchGoodsType"
          class="width-100"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
          placeholder="상품 속성을 선택해주세요."
        >
          <el-option
            v-for="property in productPropertyOptions"
            :key="property.value"
            :label="property.label"
            :value="property.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="`${getSearchTitle()} 속성`"
        class="width-100"
      >
        <el-select
          v-model="searchData.searchSaleAdv"
          :placeholder="`${getSearchTitle()}을 선택해주세요.`"
          class="width-100"
          clearable
          collapse-tags
          collapse-tags-tooltip
          multiple
        >
          <el-option
            v-for="saleAdv in getSaleAdvOptions()"
            :key="saleAdv.value"
            :label="saleAdv.label"
            :value="saleAdv.value"
          />
        </el-select>
      </el-form-item>
      <div class="product-manage-button-grid">
        <el-button
          type="warning"
          @click="getResetData"
        >
          초기화
        </el-button>
        <el-button
          type="primary"
          @click="getSearchData"
        >
          검색하기
        </el-button>
      </div>
    </el-form>
  </el-card>
  <el-tabs
    v-model="activeTabs"
    class="mb-10"
    type="border-card"
    @tab-change="getSearchData"
  >
    <el-tab-pane
      label="상품 스티커 일괄 제어"
      name="sticker"
    >
      <el-table
        :data="totalProductList"
        border
        height="470px"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품출력이름"
          min-width="170"
          prop="T_order_store_good_display_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="상품명"
          min-width="170"
          prop="T_order_store_good_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="이미지"
          min-width="130"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.T_order_store_good_image"
              :src="row.T_order_store_good_image"
              class="product-manage-image"
              fit="fill"
            >
              <template #error>
                <div class="product-manage-image-slot">X</div>
              </template>
            </el-image>
            <el-icon
              v-else
              class="product-manage-image"
              size="22px"
            >
              <Picture />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4001')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.md"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_md')
              "
            >
              추천
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_md"
              false-label="N"
              label="추천"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodTypeMd')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4002')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.hit"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_hit')
              "
            >
              히트
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_hit"
              false-label="N"
              label="히트"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodTypeHit')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4003')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.discount"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_sale')
              "
            >
              세일
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_sale"
              false-label="N"
              label="세일"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodTypeSale')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4004')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.best"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_best')
              "
            >
              베스트
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_best"
              false-label="N"
              label="베스트"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodTypeBest')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4005')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.new"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_new')
              "
            >
              신규
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_new"
              false-label="N"
              label="신규"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodTypeNew')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4006')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.vegan"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_vegan')
              "
            >
              비건
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_vegan"
              false-label="N"
              label="비건"
              true-label="Y"
              @change="
                (state: string) =>
                  postUpdateProduct(state, row, 'goodTypeVegan')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4007')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.spicy"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_spicy')
              "
            >
              스파이시
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_spicy"
              false-label="N"
              label="스파이시"
              true-label="Y"
              @change="
                (state: string) =>
                  postUpdateProduct(state, row, 'goodTypeSpicy')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4008')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.signature"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_type_signature')
              "
            >
              시그니처
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_type_signature"
              false-label="N"
              label="시그니처"
              true-label="Y"
              @change="
                (state: string) =>
                  postUpdateProduct(state, row, 'goodTypeSignature')
              "
            />
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane
      label="상품 속성 일괄 제어"
      name="property"
    >
      <el-table
        :data="totalProductList"
        border
        class="mb-10"
        height="460px"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품출력이름"
          min-width="170"
          prop="T_order_store_good_display_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="상품명"
          min-width="170"
          prop="T_order_store_good_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="이미지"
          min-width="130"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.T_order_store_good_image"
              :src="row.T_order_store_good_image"
              class="product-manage-image"
              fit="fill"
            >
              <template #error>
                <div class="product-manage-image-slot">X</div>
              </template>
            </el-image>
            <el-icon
              v-else
              class="product-manage-image"
              size="22px"
            >
              <Picture />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="속성"
          width="800"
        >
          <template #default="{ row }">
            <el-checkbox-group
              v-model="row.T_order_store_goods_type"
              @change="
                () =>
                  postUpdateProduct(
                    getStringFunction(row.T_order_store_goods_type),
                    row,
                    'goodsType',
                  )
              "
            >
              <el-checkbox label="is_achole"> 주류 속성</el-checkbox>
              <el-checkbox label="is_food"> 음식 속성</el-checkbox>
              <el-checkbox label="is_side"> 사이드 속성</el-checkbox>
              <el-checkbox label="is_service"> 서비스 속성</el-checkbox>
              <el-checkbox label="is_hide"> 숨기기 속성</el-checkbox>
              <el-checkbox label="none"> 없음</el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane
      :label="`${getSearchTitle()} 일괄 제어`"
      name="saleAd"
    >
      <el-table
        :data="totalProductList"
        border
        height="470px"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품출력이름"
          min-width="170"
          prop="T_order_store_good_display_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="상품명"
          min-width="170"
          prop="T_order_store_good_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="이미지"
          min-width="130"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.T_order_store_good_image"
              :src="row.T_order_store_good_image"
              class="product-manage-image"
              fit="fill"
            >
              <template #error>
                <div class="product-manage-image-slot">X</div>
              </template>
            </el-image>
            <el-icon
              v-else
              class="product-manage-image"
              size="22px"
            >
              <Picture />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4009')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.use"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_use')
              "
            >
              판매 중지
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_use"
              false-label="N"
              label="판매 중지"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodUse')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4010')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              v-model="headerCheckbox.sale"
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_sale')
              "
            >
              품절
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_sale"
              false-label="N"
              label="품절"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodSale')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4011')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_good_kitchen')
              "
            >
              주방 마감
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_kitchen"
              false-label="N"
              label="주방 마감"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodKitchen')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4012')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_non_show_cart')
              "
            >
              주문서 표기
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_non_show_cart"
              false-label="N"
              label="주문서 표기"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'nonShowCart')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4013')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              @change="
                (val: boolean) =>
                  handleCheckAllChange(val, 'T_order_store_is_order')
              "
            >
              주문 가능
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_is_order"
              false-label="N"
              label="주문 가능"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'isOrder')
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F4014')"
          align="center"
          header-align="center"
          min-width="100"
        >
          <template #header>
            <el-checkbox
              @change="
                (val: boolean) =>
                  handleCheckAllChange(
                    val,
                    'T_order_store_good_adble_adv_goods',
                  )
              "
            >
              광고 적용
            </el-checkbox>
          </template>
          <template #default="{ row }">
            <el-checkbox
              v-model="row.T_order_store_good_adble_adv_goods"
              false-label="N"
              label="광고 적용"
              true-label="Y"
              @change="
                (state: string) => postUpdateProduct(state, row, 'goodAdv')
              "
            />
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
  <el-row justify="center">
    <el-pagination
      :current-page="paginationInfo.currentPage"
      :page-size="paginationInfo.pageSize"
      :total="paginationInfo.totalPages"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.product-manage-image {
  width: 130px;
  height: 100px;

  .product-manage-image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 15px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
  }
}

.product-manage-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  justify-content: space-between;

  .product-manage-button-grid {
    display: flex;
    margin-bottom: 19px;
  }
}
</style>
