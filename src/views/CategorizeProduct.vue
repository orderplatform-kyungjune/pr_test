<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref, Ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import useCategoryStore from '@store/storeCategory';
import { categoryInGoodsListType, goodsInCategorizeType } from '@interface/goods';
import {
  categoryListChildType,
  categoryListDataType,
  settingCategoryType,
} from '@interface/category';
import { CaretLeft, CaretRight, DArrowRight, Delete, Top } from '@element-plus/icons-vue';
import {
  AddAllCategoryModal,
  ArrangeCategoryProductModal,
  ArrangeProductModal,
  ArrangeTotalCategoryModal,
  SettingCategoryModal,
} from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  ADD_ALL_CATEGORY,
  ARRANGE_CATEGORY_PRODUCT,
  ARRANGE_PRODUCT,
  ARRANGE_TOTAL_CATEGORY,
  CATEGORIZE_PRODUCT,
  SETTING_CATEGORY,
  STORE_LIST,
} from '@common/string';
import { categoryCodec } from '@codecs';
import { category } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const { requestDeleteCategory, requestEditCategory } = category;

const { flag, openModal } = useModalStore();
const route = useRoute();
const { settingCategoryCodec } = categoryCodec;
const categorizeProductHeader = reactive([
  { name: STORE_LIST },
  { name: CATEGORIZE_PRODUCT },
]);
// 분류 리스트
const categoryListTotalData: Ref<categoryListDataType[]> = ref([]);
// 매장명 표현
const currentStoreName = () => {
  let returnText = '매장 정보를 불러오지 못하였습니다.';
  if (route.query.name) {
    returnText = route.query.name as string;
    return returnText;
  }
  return returnText;
};

const currentStoreCode = () => {
  let returnText = '매장 정보를 불러오지 못하였습니다.';
  if (route.query.code) {
    returnText = route.query.code as string;
    return returnText;
  }
  return returnText;
};
// 중분류 개수
const getChildCategoryCount = (categoryList: categoryListChildType[]) => {
  let returnText = '매장 정보를 불러오지 못하였습니다.';
  if (categoryList) {
    const count = categoryList.length.toString();
    returnText = `중분류 : ${count}`;
    return returnText;
  }
  return returnText;
};

// 중분류 내 상품 개수
const getChildGoodCount = (goodList: goodsInCategorizeType[]) => {
  let returnText = '매장 정보를 불러오지 못하였습니다.';
  if (goodList) {
    const count = goodList.length.toString();
    returnText = `상품 수 : ${count}`;
    return returnText;
  }
  return returnText;
};

// 분류 리스트 호출
const { getCategoryList } = useCategoryStore();

watchEffect(() => {
  const { categoryListData } = useCategoryStore();
  categoryListTotalData.value = categoryListData;
});

// 모달 Prop 생성
const getCategoryArray = () => {
  const categoryNameArr: { name: string; code: string }[] = [];
  categoryListTotalData.value.forEach((first: categoryListDataType) => {
    categoryNameArr.push({
      name: first.categoryName,
      code: first.categoryCode,
    });
  });
  return categoryNameArr;
};

// 분류 수정
const postEditCategory = async (updateCategoryParam: settingCategoryType) => {
  try {
    const res = (await requestEditCategory(
      updateCategoryParam,
    )) as AxiosResponse;
    const typeError = runtimeCheck(settingCategoryCodec, res.data);

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
        ElMessage({
          type: 'success',
          message: '성공적으로 수정하였습니다.',
        });
        await getCategoryList();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// 분류 노출 여부 변경
const changeShowableStatus = (
  first: categoryListDataType,
  subCategory?: categoryListChildType,
) => {
  const updateCategoryParam: settingCategoryType = {
    editType: 'category',
    storeCode: route.query.code as string,
    updateCategoryCode: [first.categoryCode],
    updateCategoryUse: [first.categoryUse],
  };

  if (!subCategory) {
    postEditCategory(updateCategoryParam);
  } else {
    updateCategoryParam.editType = 'child_category';
    updateCategoryParam.categoryCode = Number(first.categoryCode);
    updateCategoryParam.updateCategoryCode = [subCategory.childCategoryCode];
    updateCategoryParam.updateCategoryUse = [subCategory.childCategoryUse];
    postEditCategory(updateCategoryParam);
  }
};

const categoryConfigData = reactive<settingCategoryType>(
  {} as settingCategoryType,
);

const getCategoryConfigData = (
  first: categoryListDataType,
  subCategory?: categoryListChildType,
) => {
  categoryConfigData.storeCode = route.query.code as string;

  if (!subCategory) {
    categoryConfigData.editType = 'category';
    categoryConfigData.updateCategoryCode = [first.categoryCode];
    categoryConfigData.updateCategoryName = [first.categoryName];
    categoryConfigData.updateCategoryType = [first.categoryType];
    openModal(SETTING_CATEGORY);
  } else {
    categoryConfigData.editType = 'child_category';
    categoryConfigData.categoryCode = Number(first.categoryCode);
    categoryConfigData.updateCategoryCode = [subCategory.childCategoryCode];
    categoryConfigData.updateCategoryName = [subCategory.childCategoryName];
    categoryConfigData.updateCategoryType = [subCategory.childCategoryType];
    openModal(SETTING_CATEGORY);
  }
};

// 분류 삭제 요청
const postDeleteCategory = async (updateCategoryCode: string) => {
  try {
    const deleteInfo = {
      storeCode: route.query.code as string,
      categoryCode: updateCategoryCode,
    };

    const res = (await requestDeleteCategory(deleteInfo)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'warning',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      await getCategoryList();
      ElMessage({
        type: 'success',
        message: '정상적으로 삭제되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 삭제하기
const deleteCategory = (
  first: categoryListDataType,
  subCategory?: categoryListChildType,
) => {
  let categoryName = '';
  let updateCategoryCode = '';
  if (!subCategory) {
    categoryName = first.categoryName;
    updateCategoryCode = first.categoryCode;
  } else {
    categoryName = subCategory.childCategoryName;
    updateCategoryCode = subCategory.childCategoryCode;
  }
  ElMessageBox.prompt(
    `삭제를 하시려면 "${categoryName} 삭제합니다."를 입력해 주세요. `,
    '정말로 삭제하시겠습니까??',
    {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      inputPlaceholder: `${categoryName} 삭제합니다.`,
    },
  )
    .then(({ value }) => {
      if (value === `${categoryName} 삭제합니다.`) {
        postDeleteCategory(updateCategoryCode);
      } else {
        ElMessageBox.alert('입력한 값이 일치하지 않습니다.', '실패', {
          confirmButtonText: '확인',
          type: 'warning',
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const getTitleHeaderStyle = (useStatus: string) => {
  if (useStatus === 'Y') {
    return 'el-card__header status-use';
  }
  return 'el-card__header status-not-use';
};

const arrangeCategoryProductProp: Ref<categoryInGoodsListType> = ref(
  {} as categoryInGoodsListType,
);

const selectedFirstCategoryName = ref<string>('');
const selectedFirstCategoryCode = ref<string | number>('');
const selectedSecondCategoryName = ref<string>('');
const selectedSecondCategoryCode = ref<string | number>('');
const openArrangeCategoryProductModalWithData = (
  first: categoryListDataType,
  subCategory: categoryListChildType,
) => {
  arrangeCategoryProductProp.value.storeCode = route.query.code as string;
  arrangeCategoryProductProp.value.searchType = 'child';
  arrangeCategoryProductProp.value.categoryCode = subCategory.childCategoryCode;

  selectedFirstCategoryName.value = first.categoryName;
  selectedSecondCategoryName.value = subCategory.childCategoryName;
  selectedSecondCategoryCode.value = subCategory.childCategoryCode;

  openModal(ARRANGE_CATEGORY_PRODUCT);
};

const openArrangeProductModal = (
  first: categoryListDataType,
  second: categoryListChildType,
) => {
  selectedFirstCategoryName.value = first.categoryName;
  selectedFirstCategoryCode.value = first.categoryCode;
  selectedSecondCategoryName.value = second.childCategoryName;
  selectedSecondCategoryCode.value = second.childCategoryCode;

  openModal(ARRANGE_PRODUCT);
};

/** 상품 구성 팝업 분리: 상품 구성/순서 변경 */

const getCategoryListKey = (code: string, index: number) => {
  if (!code) {
    return `category-${index}`;
  }
  return `${code}-${index}`;
};

const getSubCategoryListKey = (code: string, index: number) => {
  if (!code) {
    return `subcategory-${index}`;
  }
  return `${code}-${index}`;
};

const isChildListExist = (list: categoryListDataType) =>
  list.childCategoryList ? list.childCategoryList?.length === 0 : false;

const cardContainer = ref<HTMLElement>(null as unknown as HTMLElement);
const subCategoryScrollWrapper = ref<HTMLElement[]>(
  null as unknown as HTMLElement[],
);
const subCategoryWrapper = ref<HTMLElement[]>(null as unknown as HTMLElement[]);

const scrollTop = () => {
  cardContainer.value.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
};

const scrollSubCategory = (direction: string, index: number) => {
  if (direction === 'left') {
    subCategoryScrollWrapper.value[index].scrollBy({
      top: 0,
      left: -212,
      behavior: 'smooth',
    });
  } else {
    subCategoryScrollWrapper.value[index].scrollBy({
      top: 0,
      left: 212,
      behavior: 'smooth',
    });
  }
};

const getControllerClass = (direction: string, count: number) => ({
  'sub-category-controller': true,
  right: direction === 'right',
  disabled: count < 5,
});

getCategoryList();
</script>

<template>
  <AddAllCategoryModal
    v-if="flag.addAllCategory"
    :categoryInfo="getCategoryArray()"
  />
  <SettingCategoryModal
    v-if="flag.settingCategory"
    :data="categoryConfigData"
    :storeName="currentStoreName()"
  />
  <ArrangeTotalCategoryModal v-if="flag.arrangeTotalCategory" />
  <ArrangeCategoryProductModal
    v-if="flag.arrangeCategoryProduct"
    :arrangeCategoryProductProp="arrangeCategoryProductProp"
    :firstCategoryName="selectedFirstCategoryName"
    :secondCategoryCode="selectedSecondCategoryCode as number"
    :secondCategoryName="selectedSecondCategoryName"
  />
  <ArrangeProductModal
    v-if="flag.arrangeProduct"
    :from="CATEGORIZE_PRODUCT"
    :reloadBackInfo="getCategoryList"
    :selectedFirstCategoryCode="selectedFirstCategoryCode"
    :selectedFirstCategoryName="selectedFirstCategoryName"
    :selectedSecondCategoryCode="selectedSecondCategoryCode"
    :selectedSecondCategoryName="selectedSecondCategoryName"
  />
  <BreadcrumbHeader :propsHeader="categorizeProductHeader" />
  <el-tag>선택 매장의 각 분류에 상품을 설정할 수 있는 페이지입니다.</el-tag>
  <el-card
    class="mt-10 categorize-product-container"
    shadow="never"
  >
    <template #header>
      <div class="card-header">
        <el-descriptions
          :column="2"
          border
        >
          <el-descriptions-item label="매장명">
            {{ currentStoreName() }}
          </el-descriptions-item>
          <el-descriptions-item label="대분류 수">
            {{ categoryListTotalData.length }}
          </el-descriptions-item>
          <el-descriptions-item label="매장 코드">
            {{ currentStoreCode() }}
          </el-descriptions-item>
          <el-descriptions-item label="중분류 수">
            {{
              categoryListTotalData.reduce(
                (a, b) => a + b.childCategoryList?.length,
                0,
              )
            }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="tooltip-wrapper">
          <div class="color-tooltip-wrapper">
            <div class="color-tooltip">
              <span>노출 분류 : </span>
              <div class="circle on"></div>
            </div>
            <div class="color-tooltip">
              <span>미노출 분류 : </span>
              <div class="circle off"></div>
            </div>
          </div>
          <div>
            <el-button
              type="primary"
              @click="openModal(ADD_ALL_CATEGORY)"
            >
              분류 등록
            </el-button>
            <el-button
              type="success"
              @click="openModal(ARRANGE_TOTAL_CATEGORY)"
            >
              분류 순서 변경
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <div class="scroll-top-wrapper">
      <el-button
        plain
        type="danger"
        @click="scrollTop"
      >
        <el-icon plain>
          <Top />
        </el-icon>
      </el-button>
    </div>
    <el-scrollbar
      ref="cardContainer"
      height="67vh"
    >
      <div
        v-for="(categoryList, categoryIndex) in categoryListTotalData"
        :key="getCategoryListKey(categoryList.categoryCode, categoryIndex)"
        class="categorize-product-wrapper mb-10"
      >
        <el-card
          body-style="padding: 5px 6px 6px 6px"
          class="categorize-product-first-category-container"
          shadow="hover"
        >
          <template #header>
            <div :class="getTitleHeaderStyle(categoryList.categoryUse)">
              <div class="card-header-title">
                <span class="title-category ellipsis-text-1">
                  {{ categoryList.categoryName }}
                </span>
                <el-tag
                  class="info"
                  effect="dark"
                >
                  {{ getChildCategoryCount(categoryList.childCategoryList) }}
                </el-tag>
              </div>
              <el-switch
                v-model="categoryList.categoryUse"
                active-value="Y"
                class="showable-wrapper"
                inactive-value="N"
                size="small"
                style="
                  --el-switch-on-color: #409eff;
                  --el-switch-off-color: #a3a6ad;
                  --el-text-color-primary: #f56c6c;
                  --el-color-primary: #67c23a;
                "
                @change="changeShowableStatus(categoryList)"
              />
            </div>
          </template>
          <div class="first-category-action-wrapper">
            <el-button
              plain
              size="small"
              @click="getCategoryConfigData(categoryList)"
            >
              분류명 변경
            </el-button>
            <el-button
              color="#bbb"
              size="small"
              @click="deleteCategory(categoryList)"
            >
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </el-card>
        <div class="arrow-icon">
          <el-icon>
            <DArrowRight />
          </el-icon>
        </div>
        <div class="sub-category-container">
          <el-icon
            :class="
              getControllerClass('left', categoryList.childCategoryList?.length)
            "
            @click="scrollSubCategory('left', categoryIndex)"
          >
            <CaretLeft style="width: 100%; height: 50%" />
          </el-icon>
          <div
            ref="subCategoryScrollWrapper"
            class="sub-category-scrollbar"
          >
            <div
              ref="subCategoryWrapper"
              class="sub-category-card"
            >
              <el-card
                v-if="isChildListExist(categoryList)"
                class="sub-category-wrapper empty"
                shadow="hover"
              >
                중분류가 존재하지 않습니다.
              </el-card>
              <el-card
                v-for="(
                  subCategory, subCategoryIndex
                ) in categoryList.childCategoryList"
                v-else
                :key="
                  getSubCategoryListKey(
                    subCategory.childCategoryCode,
                    subCategoryIndex,
                  )
                "
                body-style="padding: 5px 6px 6px 6px"
                class="sub-category-wrapper"
                shadow="hover"
              >
                <template #header>
                  <div
                    :class="getTitleHeaderStyle(subCategory.childCategoryUse)"
                  >
                    <div class="card-header-title">
                      <span class="title-category ellipsis-text-1">{{
                        subCategory.childCategoryName
                      }}</span>
                      <el-tag
                        class="info"
                        effect="dark"
                      >
                        {{
                          getChildGoodCount(subCategory.childCategoryGoodList)
                        }}
                      </el-tag>
                    </div>
                    <el-switch
                      v-model="subCategory.childCategoryUse"
                      active-value="Y"
                      class="showable-wrapper"
                      inactive-value="N"
                      size="small"
                      style="
                        --el-switch-on-color: #409eff;
                        --el-switch-off-color: #a3a6ad;
                        --el-text-color-primary: #f56c6c;
                        --el-color-primary: #67c23a;
                      "
                      @change="changeShowableStatus(categoryList, subCategory)"
                    />
                  </div>
                </template>
                <div class="second-category-action-wrapper">
                  <el-row>
                    <el-button
                      plain
                      size="small"
                      @click="getCategoryConfigData(categoryList, subCategory)"
                    >
                      분류명 변경
                    </el-button>
                    <el-popover
                      :hide-after="0"
                      placement="right"
                      popper-class="category-popover-wrapper"
                      trigger="hover"
                    >
                      <template #reference>
                        <el-button
                          plain
                          size="small"
                        >
                          상품 구성
                        </el-button>
                      </template>
                      <el-row>
                        <el-col
                          :span="24"
                          class="category-popover-item mb-10"
                        >
                          <el-button
                            class="width-100"
                            size="small"
                            text
                            @click="
                              openArrangeCategoryProductModalWithData(
                                categoryList,
                                subCategory,
                              )
                            "
                          >
                            상품 구성
                          </el-button>
                        </el-col>
                        <el-col
                          :span="24"
                          class="category-popover-item"
                        >
                          <el-button
                            class="width-100"
                            size="small"
                            text
                            @click="
                              openArrangeProductModal(categoryList, subCategory)
                            "
                          >
                            순서 변경
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-popover>
                  </el-row>
                  <el-button
                    color="#bbb"
                    size="small"
                    @click="deleteCategory(categoryList, subCategory)"
                  >
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
          <el-card
            v-if="categoryList.childCategoryList?.length > 5"
            body-style="padding: 5px 6px 6px 6px"
            class="category-notification"
            shadow="hover"
          >
            총 {{ categoryList.childCategoryList?.length }} 개
          </el-card>
          <el-icon
            :class="
              getControllerClass(
                'right',
                categoryList.childCategoryList?.length,
              )
            "
            @click="scrollSubCategory('right', categoryIndex)"
          >
            <CaretRight style="width: 100%; height: 50%" />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<style lang="scss" scoped>
.categorize-product-container {
  position: relative;

  &:deep(.el-card__header) {
    padding: 8px 10px;
  }

  .tooltip-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: end;
    justify-content: end;

    .color-tooltip-wrapper {
      display: flex;
      gap: 40px;

      .color-tooltip {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }

    .circle {
      display: flex;
      gap: 10px;
      width: 30px;
      height: 30px;
      border: 1px solid #a3a6ac;
      border-radius: 100%;

      &.on {
        background-color: #b2e19d;
      }

      &.off {
        background-color: #f2d19d;
      }
    }
  }

  .scroll-top-wrapper {
    position: fixed;
    right: 50px;
    bottom: 100px;
    z-index: 20;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .category-count {
      color: #409eff;
    }
  }

  .categorize-product-wrapper {
    display: flex;
    width: 100%;
    overflow-x: hidden;

    &:deep(.el-card__header) {
      padding: 0;
    }

    .el-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background-color: #424243;

      &.status-use {
        background-color: #b3e19d;
      }

      &.status-not-use {
        background-color: #f3d19e;
      }

      .card-header-title {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .title-category {
          margin-bottom: 5px;
          color: black;
          word-wrap: break-word;
        }
      }
    }
  }

  .categorize-product-first-category-container {
    width: 200px;

    .first-category-action-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .showable-wrapper {
        height: 0;
        font-size: 5px;
      }
    }
  }

  .arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10%;
    min-width: 10%;
  }

  .sub-category-container {
    position: relative;
    display: flex;
    width: 78%;
    overflow-x: auto;

    .category-notification {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      margin-left: 16px;
      font-size: 12px;
    }

    .sub-category-controller {
      display: flex;
      justify-content: flex-end;
      width: 2vw;
      height: 100%;
      cursor: pointer;

      &.right {
        justify-content: flex-start;
      }

      &.disabled {
        color: #ffffff;
        cursor: none;
      }

      svg {
        width: 10vw;
      }
    }

    .sub-category-scrollbar {
      position: relative;
      width: 82%;
      overflow-x: scroll;

      .sub-category-card {
        position: absolute;

        display: flex;
        gap: 10px;
        height: 100%;

        .sub-category-wrapper {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          width: 200px;

          &.empty {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #ccc;
            font-size: 13px;
          }

          .second-category-action-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .showable-wrapper {
              height: 0;
              font-size: 5px;
            }

            &:deep(.el-button + .el-button) {
              margin-left: 5px;
            }

            &:deep(.el-button--small) {
              padding: 5px 8px;
            }

            .category-popover-item {
              display: flex;
              justify-content: center;
            }
          }

          .no-data-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 53px;
            font-size: 12px;
            line-height: 140%;
          }
        }
      }
    }
  }
}

.none {
  color: #ffffff;
}
</style>
