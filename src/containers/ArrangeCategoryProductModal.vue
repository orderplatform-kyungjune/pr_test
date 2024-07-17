<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import useLoadingStore from '@store/storeLoading';
import useCategoryStore from '@store/storeCategory';
import {
  categoryInGoodsListType,
  categoryProductParamType,
  productListInfoType,
} from '@interface/goods';
import { optionType, treeType } from '@interface/category';
import {
  ARRANGE_CATEGORY_PRODUCT,
  ARRANGE_CATEGORY_PRODUCT_MODAL,
} from '@common/string';
import { goodsCodec } from '@codecs';
import { goods } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const { requestArrangeProduct, requestProductList } = goods;

const { flag, closeModal } = useModalStore();
const { listProductCodec } = goodsCodec;

const prop = defineProps<{
  arrangeCategoryProductProp: categoryInGoodsListType;
  firstCategoryName: string;
  secondCategoryName: string;
  secondCategoryCode: number;
}>();

const route = useRoute();
const activeName = ref('first');
const loading = ref(true);
const loadingSvg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
const { openLoading, closeLoading } = useLoadingStore();
const totalProductList = ref<productListInfoType[]>([]);
const undesignatedProductList = ref<productListInfoType[]>([]);
const subCategoryProductList = ref<productListInfoType[]>([]);
const refinedProductList = ref<optionType[]>([]);
const refinedUndesignatedProductList = ref<optionType[]>([]);
const currentCategoryProductKey = ref<string[]>([]);
const undesignatedCurrentCategoryProductKey = ref<string[]>([]);
const currentCategoryProduct = ref<treeType[]>([]);
const fixedCategoryProduct = ref<productListInfoType[]>([]);
const unfixedCategoryProduct = ref<productListInfoType[]>([]);

const { getCategoryList } = useCategoryStore();

/** 상품리스트를 El-transfer 지정 형식으로 정제하는 함수 */
const refinedTotalProductData = () => {
  const transferData: optionType[] = [];
  if (totalProductList.value && totalProductList.value?.length) {
    totalProductList.value.forEach((data, i) => {
      transferData[i] = {
        key: data.goodCode,
        label: data.goodDpName,
        posGoodName: data.goodName,
        price: data.goodPrice,
        isSale: data.goodSale,
        isUse: data.goodUse,
        isPosStop: data.goodPosStopUse,
        disabled: data.top === 'Y',
      };
    });
  }
  refinedProductList.value = transferData;
  loading.value = false;
};

/** 태블릿 미등록 상품 리스트를 El-transfer 지정 형식으로 정제하는 함수 */
const refineUndesignatedProductData = () => {
  const transferData: optionType[] = [];
  if (undesignatedProductList.value && undesignatedProductList.value?.length) {
    undesignatedProductList.value.forEach((data, i) => {
      transferData[i] = {
        key: data.goodCode,
        label: data.goodDpName,
        posGoodName: data.goodName,
        price: data.goodPrice,
        isSale: data.goodSale,
        isUse: data.goodUse,
        isPosStop: data.goodPosStopUse,
        disabled: data.top === 'Y',
      };
    });
  }
  refinedUndesignatedProductList.value = transferData;
  loading.value = false;
};

const isGoodUse = (good: optionType) => good.isUse === 'Y';
const isGoodSale = (good: optionType) => good.isSale === 'Y';
const getTransferListStyle = (good: optionType) => ({
  'transfer-list-wrapper': true,
  'pos-stop': good.isPosStop === 'Y',
});

const getGoodUseTagType = (good: optionType) => {
  const posStopFlag = good.isPosStop === 'Y';
  if (posStopFlag) {
    return 'info';
  }
  if (isGoodUse(good)) {
    return 'danger';
  }
  return '';
};

const getGoodSaleTagType = (good: optionType) => {
  const posStopFlag = good.isPosStop === 'Y';
  if (posStopFlag) {
    return 'info';
  }
  if (isGoodSale(good)) {
    return 'warning';
  }
  return '';
};
const priceLocalization = (price: number) => `${price?.toLocaleString()}원`;

const refineSubData = () => {
  currentCategoryProduct.value = [];
  fixedCategoryProduct.value = subCategoryProductList.value.filter(
    (item) => item.top === 'Y',
  );
  unfixedCategoryProduct.value = subCategoryProductList.value.filter(
    (item) => item.top === 'N',
  );
  currentCategoryProductKey.value = subCategoryProductList.value.map(
    (item) => item.goodCode,
  );
  currentCategoryProduct.value = subCategoryProductList.value.map((item) => ({
    id: item.goodCode,
    label: item.goodDpName,
  }));
};

const postAllProductList = async () => {
  const data = {
    storeCode: route.query.code as string,
    searchType: 'all',
    searchPosStopUse: 'N',
    childCategoryCode: prop.arrangeCategoryProductProp.categoryCode,
  };
  try {
    const res = (await requestProductList(data)) as AxiosResponse;

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
      totalProductList.value = res.data.data;
      refinedTotalProductData();
    }
  } catch (error) {
    console.log(error);
  }
};

const postUndesignatedProductList = async () => {
  const data = {
    storeCode: route.query.code as string,
    searchType: 'not',
  };
  try {
    const res = (await requestProductList(data)) as AxiosResponse;
    const typeError = runtimeCheck(listProductCodec, res.data);

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
        undesignatedProductList.value = res.data.data;
        refineUndesignatedProductData();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const postSubCategoryProduct = async () => {
  const data = prop.arrangeCategoryProductProp;
  try {
    const res = (await requestProductList(data)) as AxiosResponse;

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
      subCategoryProductList.value = res.data.data;
      refineSubData();
    }
  } catch (error) {
    console.log(error);
  }
};

const categoryProductParams = reactive<categoryProductParamType>({
  storeCode: route.query.code as string,
  childCategoryCode: prop.arrangeCategoryProductProp.categoryCode as string,
  goodCode: currentCategoryProductKey.value,
  topGoodCode: [],
});

/** 수정 정보를 저장 요청 */

const filterProducts = (isTop: boolean): string[] => {
  const items = refinedProductList.value
    .filter((item) => currentCategoryProductKey.value.includes(item.key))
    .filter((item) => (isTop ? item.disabled : !item.disabled))
    .map((item) => item.key);

  // currentCategoryProductKey 기준으로 재배열
  return currentCategoryProductKey.value.filter((item) => items.includes(item));
};

const postUpdateArrangeProduct = async () => {
  const topGoodCode = filterProducts(true);
  const goodCode = filterProducts(false);

  categoryProductParams.goodCode = goodCode;
  categoryProductParams.topGoodCode = topGoodCode;

  if (undesignatedCurrentCategoryProductKey.value?.length > 0) {
    categoryProductParams.goodCode = [
      ...goodCode,
      ...undesignatedCurrentCategoryProductKey.value,
    ];
  }

  openLoading();

  try {
    const res = (await requestArrangeProduct(
      categoryProductParams,
    )) as AxiosResponse;
    const { code, msg } = res.data;

    if (code === 400) {
      ElMessageBox.alert(msg, '실패', {
        confirmButtonText: '확인',
        type: 'warning',
      });
    } else if (code === 401) {
      failAuthenticationAlert();
    } else if (code === 200) {
      getCategoryList();
      closeModal(ARRANGE_CATEGORY_PRODUCT);
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    closeLoading();
  }
};

const addProductToCategory = () => {
  ElMessageBox.confirm('정말로 수정하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        await postUpdateArrangeProduct();
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

const customFilterMethod = (query: string, item: optionType) => {
  const labelMatch = item.label.toLowerCase().includes(query.toLowerCase());
  const posGoodNameMatch =
    item.posGoodName?.toLowerCase().includes(query.toLowerCase()) ?? false;

  return labelMatch || posGoodNameMatch;
};

const isRefinedList = (goodsCode: string) => {
  const exist = currentCategoryProductKey.value.find(
    (item) => item === goodsCode,
  );
  return !!exist;
};

const noticeTopLock = (status: boolean) => {
  if (status) {
    ElNotification({
      title: '상품 고정 상태',
      type: 'error',
      message:
        '선택한 분류에서 상품 제외를 원할 경우,\n상품 최상단 고정 기능을 해지해주세요.',
    });
  }
};

const changeTransferProduct = (
  value: number | string,
  direction: 'left' | 'right',
  movedKeys: string[] | number[],
) => {
  if (direction === 'left') {
    const foundItem = movedKeys
      .map((key) => refinedProductList.value.find((item) => item.key === key))
      .find(Boolean);

    if (foundItem && foundItem.disabled) {
      ElNotification({
        title: '비정상적 접근',
        type: 'error',
        message: '비정상적인 접근입니다.',
      });
      currentCategoryProductKey.value = subCategoryProductList.value.map(
        (item) => item.goodCode,
      );
    }
  }
};

postAllProductList();
postUndesignatedProductList();
postSubCategoryProduct();
</script>

<template>
  <el-dialog
    v-model="flag.arrangeCategoryProduct"
    :title="ARRANGE_CATEGORY_PRODUCT_MODAL"
    lock-scroll
    top="4vh"
    width="75%"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="상품 구성"
        name="first"
      >
        <div class="transfer-container">
          <el-row class="title-marker">
            <p class="title-text ml-10">선택 분류 정보</p>
          </el-row>
          <el-row class="width-100">
            <el-descriptions
              :column="1"
              border
              class="ml-10 mt-5 mb-20 width-100"
            >
              <el-descriptions-item label="분류">
                {{ firstCategoryName }} > {{ secondCategoryName }}
              </el-descriptions-item>
            </el-descriptions>
          </el-row>
          <el-row class="title-marker">
            <p class="ml-10">상품 목록</p>
          </el-row>
          <el-transfer
            v-model="currentCategoryProductKey"
            v-loading="loading"
            :data="refinedProductList"
            :element-loading-svg="loadingSvg"
            :filter-method="customFilterMethod"
            :titles="['전체 상품', '선택 상품']"
            class="transfer-wrapper mt-10"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-text="상품 정보를 불러오는 중입니다..."
            filter-placeholder="상품명을 입력해주세요."
            filterable
            target-order="push"
            @change="changeTransferProduct"
          >
            <template #default="{ option }">
              <div class="transfer-list-container">
                <div
                  :class="getTransferListStyle(option)"
                  @click="noticeTopLock(option.disabled)"
                >
                  <p class="goods-code">
                    {{ option.key }}
                  </p>
                  <span class="transfer-divider"> - </span>
                  <p class="goods-name">
                    {{ option.label }}
                  </p>
                  <span class="transfer-divider"> - </span>
                  <p class="goods-price">
                    {{ priceLocalization(option.price) }}
                  </p>
                  <div class="goods-status">
                    <el-tag v-if="!isGoodUse(option) && !isGoodSale(option)">
                      판매중
                    </el-tag>
                    <el-tag
                      v-if="isGoodUse(option) && !isGoodSale(option)"
                      type="danger"
                    >
                      판매중지 (숨김)
                    </el-tag>
                    <el-tag
                      v-if="!isGoodUse(option) && isGoodSale(option)"
                      type="warning"
                    >
                      품절 (보임)
                    </el-tag>
                    <el-tag
                      v-if="isGoodUse(option) && isGoodSale(option)"
                      type="warning"
                    >
                      품절 (숨김)
                    </el-tag>
                  </div>
                </div>
                <div class="goods-lock">
                  <el-switch
                    v-if="isRefinedList(option.key)"
                    v-model="option.disabled"
                  />
                </div>
              </div>
            </template>
          </el-transfer>
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="태블릿 미등록 상품"
        lazy
        name="second"
      >
        <div class="transfer-container">
          <el-row class="title-marker">
            <p class="ml-10">선택 분류 정보</p>
          </el-row>
          <el-row class="width-100">
            <el-descriptions
              :column="1"
              border
              class="ml-10 mt-5 mb-20 width-100"
            >
              <el-descriptions-item label="분류">
                {{ firstCategoryName }} > {{ secondCategoryName }}
              </el-descriptions-item>
            </el-descriptions>
          </el-row>
          <el-row class="title-marker">
            <p class="ml-10">상품 목록</p>
          </el-row>
          <el-transfer
            v-model="undesignatedCurrentCategoryProductKey"
            v-loading="loading"
            :data="refinedUndesignatedProductList"
            :element-loading-svg="loadingSvg"
            :filter-method="customFilterMethod"
            :titles="['태블릿 미등록 상품', '선택 상품']"
            class="transfer-wrapper mt-10"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-text="상품 정보를 불러오는 중입니다..."
            filter-placeholder="상품명을 입력해주세요."
            filterable
          >
            <template #default="{ option }">
              <div :class="getTransferListStyle(option)">
                <p class="goods-code">
                  {{ option.key }}
                </p>
                <span class="transfer-divider"> - </span>
                <p class="goods-name">
                  {{ option.posGoodName }}
                </p>
                <span class="transfer-divider"> - </span>
                <p class="goods-name">
                  {{ option.label }}
                </p>
                <span class="transfer-divider"> - </span>
                <p class="goods-price">
                  {{ priceLocalization(option.price) }}
                </p>
                <el-row class="goods-status">
                  <el-tag
                    v-if="isGoodUse(option)"
                    :type="getGoodUseTagType(option)"
                  >
                    중지
                  </el-tag>
                  <el-tag
                    v-if="isGoodSale(option)"
                    :type="getGoodSaleTagType(option)"
                  >
                    품절
                  </el-tag>
                </el-row>
              </div>
            </template>
          </el-transfer>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span>
        <el-button @click="closeModal(ARRANGE_CATEGORY_PRODUCT)">
          닫기
        </el-button>
        <el-button
          type="warning"
          @click="addProductToCategory()"
        >
          상품 수정
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-descriptions {
  &:deep(.is-bordered-label) {
    width: 100px;
  }

  .el-descriptions__body {
    .el-descriptions__label {
      width: 300px;
    }
  }
}

.title-marker {
  border-left: 2px solid #000;
  margin: 5px;

  .title-text {
    font-size: 16px;
  }
}

.transfer-container {
  height: 630px;

  .transfer-wrapper {
    --el-transfer-panel-body-height: 425px;
    --el-transfer-panel-width: 43%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:deep(.el-input) {
      width: 90%;
    }

    &:deep(.el-transfer-panel__item):last-of-type {
      margin-right: 30px;
    }

    &:deep(.el-transfer__buttons) {
      padding: 0 2%;
    }

    .transfer-list-container {
      position: relative;
      display: flex;
      width: 100%;
    }

    .transfer-list-wrapper {
      position: relative;
      display: flex;
      justify-content: space-between;
      width: 90%;
      font-size: 13px;

      &.pos-stop {
        color: #f56c6c;
        background-color: #2222221a;
      }

      .goods-code {
        display: flex;
        justify-content: center;
        width: 15%;
      }

      .transfer-divider {
        display: flex;
        justify-content: flex-start;
        width: 5%;
      }

      .goods-name {
        display: block;
        width: 25%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .goods-price {
        display: block;
        width: 20%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .goods-status {
        display: flex;
        gap: 5px;
        align-items: center;
        justify-content: flex-end;
        width: 15%;
      }
    }

    .goods-lock {
      position: absolute;
      right: 0;
      display: flex;
      justify-content: flex-end;
      width: 5%;
    }
  }
}
</style>
