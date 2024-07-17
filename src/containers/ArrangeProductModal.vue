<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { computed, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import useLoadingStore from '@store/storeLoading';
import useCategoryStore from '@store/storeCategory';
import { category, goods } from '@src/apis';
import { goodsInCategorizeType } from '@interface/goods';
import { categoryInCategorizeType } from '@interface/category';
import {
  ArrowDown,
  ArrowUp,
  CloseBold,
  Picture,
  Refresh,
  Search,
} from '@element-plus/icons-vue';
import {
  ARRANGE_PRODUCT,
  CATEGORIZE_MANAGE_TABLET_LEGACY,
  CATEGORIZE_TAB_REGISTERED,
} from '@common/string';

const { failAuthenticationAlert } = authentication;

const { requestArrangeProduct, requestGoodsSearchList } = goods;

const { requestV2CategoryList } = category;

const { flag, closeModal } = useModalStore();

const prop = defineProps<{
  from?: string;
  selectedFirstCategoryCode: string | number;
  selectedSecondCategoryCode: string | number;
  reloadBackInfo?: (exceptInput?: boolean) => void;
  selectedFirstCategoryName?: string; // 분류 정보 변경 불가능할 때만 사용
  selectedSecondCategoryName?: string; // 분류 정보 변경 불가능할 때만 사용
}>();

const route = useRoute();
const { openLoading, closeLoading } = useLoadingStore();

const { getCategoryList } = useCategoryStore();

const storeCode = route.query.code as string;

/** 상단 분류 select */
const isCategoryLock: Ref<boolean> = ref(true);

const resolveCategoryLock = () => {
  isCategoryLock.value = false;
};

const pickedFirstCategoryCode: Ref<number | string> = ref(
  prop.selectedFirstCategoryCode,
);
const pickedSecondCategoryCode: Ref<number | string> = ref(
  prop.selectedSecondCategoryCode,
);

const firstCategoryList: Ref<categoryInCategorizeType[]> = ref([]);
const secondCategoryList: Ref<categoryInCategorizeType[]> = ref([]);

const postCategoryList = async (
  searchType: string,
  firstCategoryCode?: number,
) => {
  try {
    const param = {
      storeCode,
      searchType,
      categoryCode: firstCategoryCode,
    };
    const res = (await requestV2CategoryList(param)) as AxiosResponse;

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
      if (searchType === 'big') {
        // 직원호출 분류 제거
        firstCategoryList.value = res.data.data.filter(
          (firstCategoryValue: categoryInCategorizeType) =>
            firstCategoryValue.categoryCode !== 20000,
        );
      }

      if (searchType === 'child') {
        secondCategoryList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

watch(
  () => pickedFirstCategoryCode.value,
  async () => {
    pickedSecondCategoryCode.value = '';
    await postCategoryList('child', pickedFirstCategoryCode.value as number);
  },
);

/** 상품 불러오기 */
const subCategoryProductList = ref<goodsInCategorizeType[]>([]);
const fixedCategoryProduct = ref<goodsInCategorizeType[]>([]);
const unfixedCategoryProduct = ref<goodsInCategorizeType[]>([]);

const postGoodsListInCategorize = async (categoryCode: number) => {
  try {
    openLoading();
    const data = {
      storeCode,
      categoryType: 'child',
      categoryCode,
    };
    const res = (await requestGoodsSearchList(data)) as AxiosResponse;

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
      fixedCategoryProduct.value = subCategoryProductList.value.filter(
        (item) => item.top === 'Y',
      );
      unfixedCategoryProduct.value = subCategoryProductList.value.filter(
        (item) => item.top === 'N',
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    closeLoading();
  }
};

watch(
  () => pickedSecondCategoryCode.value,
  () => {
    if (pickedSecondCategoryCode.value) {
      postGoodsListInCategorize(pickedSecondCategoryCode.value as number);
    }
  },
  { immediate: true },
);

const postUpdateArrangeProduct = async () => {
  try {
    openLoading();

    const params = {
      storeCode,
      childCategoryCode: prop.selectedSecondCategoryCode as string,
      goodCode: unfixedCategoryProduct.value.map((item) => item.goodCode),
      topGoodCode: fixedCategoryProduct.value.map((item) => item.goodCode),
    };

    const res = (await requestArrangeProduct(params)) as AxiosResponse;
    const { code, msg } = res.data;

    if (code === 400) {
      ElMessageBox.alert(msg, '실패', {
        confirmButtonText: '확인',
        type: 'warning',
      });
    } else if (code === 401) {
      failAuthenticationAlert();
    } else if (code === 200) {
      if (prop.reloadBackInfo) prop.reloadBackInfo(true);
      getCategoryList(); // api v2 대응 임시 코드 todo fix
      closeModal(ARRANGE_PRODUCT);
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

const removeProductInList = async (deleteGoodCode: string, isTop: boolean) => {
  if (isTop) {
    fixedCategoryProduct.value = fixedCategoryProduct.value.filter(
      (goodItem: goodsInCategorizeType) => goodItem.goodCode !== deleteGoodCode,
    );
    return;
  }
  unfixedCategoryProduct.value = unfixedCategoryProduct.value.filter(
    (goodItem: goodsInCategorizeType) => goodItem.goodCode !== deleteGoodCode,
  );
};

const searchTxt = ref<string>('');

const resetTxt = () => {
  searchTxt.value = '';
  document
    .querySelector('.table-header-wrapper')
    ?.scrollIntoView({ behavior: 'smooth' });
};

const searchCard = () => {
  if (searchTxt.value?.length < 1) {
    ElMessage({
      type: 'warning',
      message: '검색어를 입력해주세요.',
    });
    return;
  }

  const nodeList = document.querySelectorAll('[id^="sort-"]');
  const els = Array.from(nodeList) as HTMLElement[];
  const matchedOne = els.find((item) =>
    item.id.split('-')[1].includes(searchTxt.value),
  );
  if (matchedOne) {
    matchedOne.scrollIntoView({ behavior: 'smooth' });
    if (!matchedOne.className.includes('searched')) {
      matchedOne.classList.add('searched');
      setTimeout(() => {
        matchedOne.classList.remove('searched');
      }, 1000);
    }
  } else {
    ElMessage({
      type: 'warning',
      message: `검색하신 ${searchTxt.value}와(과) 부합한 상품이 존재하지 않습니다.`,
    });
  }
};

const changeTopLockSorting = (status: string, goodCode: string) => {
  subCategoryProductList.value = subCategoryProductList.value.map((item) => {
    if (item.goodCode === goodCode) {
      return {
        ...item,
        top: status,
      };
    }
    return item;
  });
  fixedCategoryProduct.value = subCategoryProductList.value.filter(
    (item) => item.top === 'Y',
  );
  unfixedCategoryProduct.value = subCategoryProductList.value.filter(
    (item) => item.top === 'N',
  );
};

const sortHighPrice = () => {
  unfixedCategoryProduct.value = unfixedCategoryProduct.value.sort(
    (a, b) => b.goodPrice - a.goodPrice,
  );
};

const sortLowPrice = () => {
  unfixedCategoryProduct.value = unfixedCategoryProduct.value.sort(
    (a, b) => a.goodPrice - b.goodPrice,
  );
};

const dragOptions = computed(() => ({
  animation: 200,
  group: 'first',
  disabled: false,
  ghostClass: 'drag-item-ghost',
}));

const secondDragOptions = computed(() => ({
  animation: 200,
  group: 'second',
  disabled: false,
  ghostClass: 'drag-item-ghost',
}));

const priceLocalization = (price: number) => `${price?.toLocaleString()}원`;
const getFirstCategoriesOptionKey = (categoryName: string, index: number) =>
  categoryName
    ? `first-category-${categoryName}-${index}`
    : `first-category-${index}`;
const getSecondCategoriesOptionKey = (categoryName: string, index: number) =>
  categoryName
    ? `first-category-${categoryName}-${index}`
    : `first-category-${index}`;

postCategoryList('big');
postCategoryList('child', prop.selectedFirstCategoryCode as number);
</script>

<template>
  <el-dialog
    v-model="flag.arrangeProduct"
    align-center
    width="75%"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p class="mr-10">상품 순서 변경</p>
      </el-row>
    </template>
    <el-row
      v-if="
        from === CATEGORIZE_TAB_REGISTERED ||
        from === CATEGORIZE_MANAGE_TABLET_LEGACY
      "
      class="mb-10"
    >
      <el-col class="title-marker">
        <p class="title-text ml-10">검색</p>
      </el-col>
      <el-col>
        <el-descriptions
          :column="1"
          border
          class="ml-10 mt-10 mb-20"
        >
          <el-descriptions-item
            align="center"
            label="분류"
            label-align="center"
          >
            <el-row justify="space-between">
              <el-row align="middle">
                <el-row
                  align="middle"
                  class="mr-20"
                >
                  <span class="mr-10">대분류</span>
                  <el-select
                    v-model="pickedFirstCategoryCode"
                    :disabled="isCategoryLock"
                    placeholder="대분류를 선택해주세요."
                  >
                    <el-option
                      v-for="(firstCategory, index) in firstCategoryList"
                      :key="
                        getFirstCategoriesOptionKey(
                          firstCategory.categoryName,
                          index,
                        )
                      "
                      :label="firstCategory.categoryName"
                      :value="firstCategory.categoryCode"
                    />
                  </el-select>
                </el-row>
                <el-row align="middle">
                  <span class="mr-10">중분류</span>
                  <el-select
                    v-model="pickedSecondCategoryCode"
                    :disabled="isCategoryLock"
                    placeholder="중분류를 선택해주세요."
                  >
                    <el-option
                      v-for="(secondCategory, index) in secondCategoryList"
                      :key="
                        getSecondCategoriesOptionKey(
                          secondCategory.categoryName,
                          index,
                        )
                      "
                      :label="secondCategory.categoryName"
                      :value="secondCategory.categoryCode"
                    />
                  </el-select>
                </el-row>
              </el-row>
              <el-button
                :icon="Refresh"
                round
                @click="resolveCategoryLock"
              >
                분류 초기화
              </el-button>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
    <el-row
      v-else
      class="width-100"
    >
      <el-col class="title-marker">
        <p class="ml-10">선택 분류 정보</p>
      </el-col>
      <el-col>
        <el-descriptions
          :column="1"
          border
          class="ml-10 mt-10 mb-20"
        >
          <el-descriptions-item label="분류">
            {{ selectedFirstCategoryName }} > {{ selectedSecondCategoryName }}
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>

    <el-row class="title-marker">
      <p class="ml-10">상품 목록 ( {{ subCategoryProductList?.length }} 개)</p>
    </el-row>
    <div class="arrange-items-contents width-100">
      <el-row
        class="mt-10 mr-10 mb-10 ml-10"
        justify="space-between"
      >
        <el-input
          v-model="searchTxt"
          class="flex-1 mr-10"
          clearable
          placeholder="검색할 상품명을 입력해주세요."
          @keydown.enter="searchCard"
        />
        <div>
          <el-button
            :icon="Refresh"
            round
            @click="resetTxt"
          >
            초기화
          </el-button>
          <el-button
            :icon="Search"
            class="ml-10"
            round
            type="primary"
            @click="searchCard"
          >
            검색
          </el-button>
        </div>
      </el-row>
      <el-scrollbar
        class="mr-10 mb-10 ml-10"
        height="447px"
      >
        <el-row class="product-sort-container">
          <div class="product-sort-fixed-wrapper">
            <el-row class="table-header-wrapper width-100">
              <el-row class="table-cell table-header table-cell-first">
                고정
              </el-row>
              <el-row class="table-cell table-header"> 순서</el-row>
              <el-row class="table-cell table-header"> 상품 이미지</el-row>
              <el-row class="table-cell table-header"> 티오더 상품명</el-row>
              <el-row class="table-cell table-header">
                <span class="mr-5"> 상품 가격 </span>
                <el-tooltip
                  class="box-item"
                  content="최상단 고정 상품은 제외하고 높은 가격 순으로 정렬됩니다."
                  effect="dark"
                  placement="top"
                >
                  <el-button
                    :icon="ArrowUp"
                    circle
                    class="mr-5"
                    size="small"
                    @click="sortHighPrice"
                  />
                </el-tooltip>
                <el-tooltip
                  class="box-item"
                  content="최상단 고정 상품은 제외하고 낮은 가격순으로 정렬됩니다."
                  effect="dark"
                  placement="top"
                >
                  <el-button
                    :icon="ArrowDown"
                    circle
                    size="small"
                    @click="sortLowPrice"
                  />
                </el-tooltip>
              </el-row>
              <el-row class="table-cell table-header"> 판매상태</el-row>
              <el-row class="table-cell table-header" />
            </el-row>
            <el-row
              v-if="!fixedCategoryProduct?.length"
              class="fixed-good fixed-goods-empty"
            >
              상품 최상단 고정 기능적용 상품이 없습니다.
            </el-row>
            <draggable
              v-else
              v-model="fixedCategoryProduct"
              :componentData="{
                tag: 'div',
                type: 'transition-group',
              }"
              class="list-group"
              item-key="goodCode"
              v-bind="dragOptions"
            >
              <template #item="{ element, index }">
                <el-row
                  v-if="element.goodCode !== '99999'"
                  :id="`sort-${element.goodDpName}`"
                  class="table-item-wrapper fixed-good width-100"
                >
                  <el-row class="table-cell table-cell-first">
                    <el-switch
                      v-model="element.top"
                      active-value="Y"
                      inactive-value="N"
                      @change="
                        (e: string) => changeTopLockSorting(e, element.goodCode)
                      "
                    />
                  </el-row>
                  <el-row class="table-cell">
                    {{ index + 1 }}
                  </el-row>
                  <el-row class="table-cell">
                    <el-tooltip
                      :show-after="500"
                      placement="right"
                    >
                      <template #content>
                        <el-image
                          :src="element.goodImage"
                          class="image-in-tooltip"
                          fit="cover"
                        >
                          <template #error>
                            <div class="image-slot">
                              <el-icon>
                                <Picture />
                              </el-icon>
                            </div>
                          </template>
                        </el-image>
                      </template>
                      <el-image
                        :src="element.goodImage"
                        class="image-in-cell"
                        fit="cover"
                      >
                        <template #error>
                          <div class="image-slot">
                            <el-icon>
                              <Picture />
                            </el-icon>
                          </div>
                        </template>
                      </el-image>
                    </el-tooltip>
                  </el-row>
                  <el-row class="table-cell">
                    {{ element.goodDpName }}
                  </el-row>
                  <el-row class="table-cell">
                    {{ priceLocalization(element.goodPrice) }}
                  </el-row>
                  <el-row class="table-cell">
                    <el-tag
                      v-if="element.goodUse === 'N' && element.goodSale === 'N'"
                    >
                      판매중
                    </el-tag>
                    <el-tag
                      v-if="element.goodUse === 'Y' && element.goodSale === 'N'"
                      type="danger"
                    >
                      판매중지 (숨김)
                    </el-tag>
                    <el-tag
                      v-if="element.goodUse === 'N' && element.goodSale === 'Y'"
                      type="warning"
                    >
                      품절 (보임)
                    </el-tag>
                    <el-tag
                      v-if="element.goodUse === 'Y' && element.goodSale === 'Y'"
                      type="warning"
                    >
                      품절 (숨김)
                    </el-tag>
                  </el-row>
                  <el-row class="table-cell">
                    <el-popconfirm
                      :title="`${element.goodDpName} 상품을 제거하시겠습니까?`"
                      width="200"
                      @confirm="removeProductInList(element.goodCode, true)"
                    >
                      <template #reference>
                        <el-button
                          :icon="CloseBold"
                          circle
                          plain
                          type="danger"
                        />
                      </template>
                    </el-popconfirm>
                  </el-row>
                </el-row>
              </template>
            </draggable>
          </div>
          <el-divider />
          <draggable
            v-model="unfixedCategoryProduct"
            :componentData="{
              tag: 'div',
              type: 'transition-group',
            }"
            class="list-group"
            item-key="goodCode"
            v-bind="secondDragOptions"
          >
            <template #item="{ element, index }">
              <el-row
                v-if="element.goodCode !== '99999'"
                :id="`sort-${element.goodDpName}`"
                class="table-item-wrapper"
              >
                <el-row class="table-cell table-cell-first">
                  <el-switch
                    v-model="element.top"
                    active-value="Y"
                    inactive-value="N"
                    @change="
                      (e: string) => changeTopLockSorting(e, element.goodCode)
                    "
                  />
                </el-row>
                <el-row class="table-cell">
                  {{ fixedCategoryProduct?.length + index + 1 }}
                </el-row>
                <el-row class="table-cell">
                  <el-tooltip
                    :show-after="500"
                    placement="right"
                  >
                    <template #content>
                      <el-image
                        :fit="'cover'"
                        :src="element.goodImage"
                        class="image-in-tooltip"
                      >
                        <template #error>
                          <div class="image-slot">
                            <el-icon>
                              <Picture />
                            </el-icon>
                          </div>
                        </template>
                      </el-image>
                    </template>
                    <el-image
                      :fit="'cover'"
                      :src="element.goodImage"
                      class="image-in-cell"
                    >
                      <template #error>
                        <div class="image-slot">
                          <el-icon>
                            <Picture />
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                  </el-tooltip>
                </el-row>
                <el-row class="table-cell">
                  {{ element.goodDpName }}
                </el-row>
                <el-row class="table-cell">
                  {{ priceLocalization(element.goodPrice) }}
                </el-row>
                <el-row class="table-cell">
                  <el-tag
                    v-if="element.goodUse === 'N' && element.goodSale === 'N'"
                  >
                    판매중
                  </el-tag>
                  <el-tag
                    v-if="element.goodUse === 'Y' && element.goodSale === 'N'"
                    type="danger"
                  >
                    판매중지 (숨김)
                  </el-tag>
                  <el-tag
                    v-if="element.goodUse === 'N' && element.goodSale === 'Y'"
                    type="warning"
                  >
                    품절 (보임)
                  </el-tag>
                  <el-tag
                    v-if="element.goodUse === 'Y' && element.goodSale === 'Y'"
                    type="warning"
                  >
                    품절 (숨김)
                  </el-tag>
                </el-row>
                <el-row class="table-cell">
                  <el-popconfirm
                    :title="`${element.goodDpName} 상품을 제거하시겠습니까?`"
                    width="200"
                    @confirm="removeProductInList(element.goodCode, false)"
                  >
                    <template #reference>
                      <el-button
                        :icon="CloseBold"
                        circle
                        plain
                        type="danger"
                      />
                    </template>
                  </el-popconfirm>
                </el-row>
                <el-row
                  v-if="element.goodPosStopUse === 'Y'"
                  class="pos-stop-item"
                >
                  POS 삭제 상품
                </el-row>
              </el-row>
            </template>
          </draggable>
        </el-row>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ARRANGE_PRODUCT)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="postUpdateArrangeProduct"
      >
        순서 적용
      </el-button>
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
  margin: 5px;
  border-left: 2px solid #000;

  .title-text {
    font-size: 16px;
  }
}

.arrange-items-contents {
  display: flex;
  flex-direction: column;
}

.product-sort-container {
  flex-direction: column;

  .product-sort-fixed-wrapper {
    flex-direction: column;

    .table-header-wrapper {
      display: grid;
      grid-template-columns: 1fr 0.5fr 2fr 3fr 1.5fr 1.5fr 0.5fr;

      .table-header {
        background: #f4f7fa;

        &:deep(.el-button.el-button) {
          margin-left: 0;
        }
      }
    }
  }
}

.table-cell {
  align-items: center;
  justify-content: center;
  min-height: 60px;
  border: 1px solid #dcdfe5;
  border-bottom: none;

  &:not(:first-child) {
    border-left: 0;
  }
}

.list-group {
  display: flex;
  flex-direction: column;
}

.fixed-goods-empty {
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background-color: #7adf83bf;
}

.table-item-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 0.5fr 2fr 3fr 1.5fr 1.5fr 0.5fr;
  width: 100%;
  background-color: #ffffff4d;

  &:last-child {
    border-bottom: 1px solid #dcdfe5;
  }

  .table-cell-first {
    border-left: 1px solid #dcdfe5;
  }

  &.fixed-good {
    background-color: #7adf83bf;
  }

  &.searched {
    background-color: #f56c6ccc !important;
    transition: all 0.5s ease-in-out;
  }

  .pos-stop-item {
    position: absolute;
    left: 10%;
    align-items: center;
    justify-content: center;
    width: 70%;
    height: 100%;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background-color: #00000080;
  }

  .delete-item-wrapper {
    position: absolute;
    top: -15px;
    right: -15px;
  }
}

.move-tag {
  &:deep(.el-tag__content) {
    display: flex;
    gap: 2px;
    align-items: center;
    justify-content: center;
  }
}

.drag-item-ghost {
  background: #c8ebfb;
  opacity: 0.5;
}

.image-in-tooltip {
  width: 300px;
  height: 300px;
}

.image-in-cell {
  width: 50px;
  height: 50px;
}
</style>
