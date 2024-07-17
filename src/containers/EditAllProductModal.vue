<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, onMounted, reactive, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils } from '@utils';
import useModalStore from '@store/storeModal';
import { goodsInCategorizeType } from '@interface/goods';
import { categoryInCategorizeType, SelectGroupType } from '@interface/category';
import { CloseBold, LocationFilled, MoreFilled } from '@element-plus/icons-vue';
import { EDIT_ALL_PRODUCT } from '@common/string';
import { category, goods } from '@apis';

const { failAuthenticationAlert } = authentication;

const { requestV2CategoryList } = category;

const { convertToEllipsis } = etcUtils;

const props = defineProps<{
  checkedItem: goodsInCategorizeType[];
  checkGoodsItem?: (good: goodsInCategorizeType) => void;
  reloadAllCategoryList?: () => void;
  reloadGoodsList?: (exceptInput?: boolean) => void;
}>();

const { flag, closeModal } = useModalStore();

const filteredCheckedItem = ref<goodsInCategorizeType[]>(
  props.checkedItem.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.goodCode === item.goodCode),
  ),
);

// query
const route = useRoute();
const storeCode = route.query.code as string;

const { requestUpdateAllProduct } = goods;

const selectedChildCategory = ref('');

const isCallServiceTab = ref<boolean>(false);

const editAllCategoryData = reactive({
  storeCode,
  categoryCode: selectedChildCategory.value,
  categoryEditYn: 'Y',
  posNameUseYn: 'N',
  updateGoodCode: [] as string[],
});

/** 부모 - 자식 분류 리스트 */
const categories: Ref<categoryInCategorizeType[]> = ref([]);
const mappingCategoryToSelectType = (
  categoryInfo: categoryInCategorizeType,
) => ({
  label: categoryInfo.categoryName,
  value: categoryInfo.categoryCode,
});

const categoriesGroupInfo: Ref<SelectGroupType[]> = ref([]);

const formatCategoriesToSelectInfo = () =>
  categories.value
    .filter(
      (firstCategory: categoryInCategorizeType) =>
        firstCategory.categoryCode !== 20000,
    )
    .map((firstCategory: categoryInCategorizeType) => {
      const childCategories = firstCategory.child?.map(
        (secondCategory: categoryInCategorizeType) =>
          mappingCategoryToSelectType(secondCategory),
      );
      return {
        label: firstCategory.categoryName,
        options: childCategories || [],
      };
    });

const changeSelectBox = () => {
  editAllCategoryData.categoryEditYn = 'Y';
};

const setSecondCategory = (isSelectedStaffCallTab: boolean) => {
  // 직원호출 중분류 코드 '110700'
  selectedChildCategory.value = isSelectedStaffCallTab ? '110700' : '';
};

/** 전체 분류 불러오기 */
const getAllCategoryList = async () => {
  try {
    const requestData = {
      storeCode,
      searchType: 'big_child',
    };
    const res = (await requestV2CategoryList(requestData)) as AxiosResponse;

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

    if (res.data.code === 200) {
      categories.value = res.data.data.filter(
        (firstCategory: categoryInCategorizeType) =>
          firstCategory.child?.length,
      );
      categoriesGroupInfo.value = formatCategoriesToSelectInfo();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 선택한 상품들 분류 이동하기 */

const postMoveSelectedProductCategory = async () => {
  try {
    editAllCategoryData.updateGoodCode = filteredCheckedItem.value.map(
      (item) => item.goodCode,
    );

    const res = (await requestUpdateAllProduct(
      editAllCategoryData,
    )) as AxiosResponse;

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

    if (res.data.code === 200) {
      if (props.reloadAllCategoryList) props.reloadAllCategoryList();
      if (props.reloadGoodsList) props.reloadGoodsList(true);

      closeModal(EDIT_ALL_PRODUCT);

      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const disabledSaveButton: Ref<boolean> = computed(() => {
  const noneSelectedCategory = editAllCategoryData.updateGoodCode?.length === 0;
  const noneProductInList =
    !isCallServiceTab.value && !editAllCategoryData.categoryCode;
  return noneSelectedCategory || noneProductInList;
});

const onClickChangeSelectedProductsButton = () => {
  ElMessageBox.confirm('정말로 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      postMoveSelectedProductCategory();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const getTableRowStyle = ({ row }: { row: goodsInCategorizeType }) => ({
  'pos-stop-row': row.goodPosStopUse === 'Y',
});

watch(
  () => selectedChildCategory.value,
  () => {
    editAllCategoryData.categoryCode = selectedChildCategory.value;

    if (selectedChildCategory.value === '') {
      editAllCategoryData.categoryEditYn = 'N';
    } else {
      editAllCategoryData.categoryEditYn = 'Y';
    }
  },
);

const getCategoryItemTagKey = (categoryName: string, index: number) =>
  categoryName
    ? `goods-category-item-${categoryName}-${index}`
    : `goods-category-item-${index}`;

const reCheckGoodsItem = async (good: goodsInCategorizeType) => {
  if (props.checkGoodsItem) await props.checkGoodsItem(good);
  filteredCheckedItem.value = props.checkedItem.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.goodCode === item.goodCode),
  );
  editAllCategoryData.updateGoodCode = filteredCheckedItem.value.map(
    (item) => item.goodCode,
  );
};

// v-for key 방어코드
const getSelectBoxKey = (categoryName: string, index: number) =>
  categoryName
    ? `category-select-${categoryName}-${index}`
    : `category-select-${index}`;
const getSelectOptionKey = (categoryName: string, index: number) =>
  categoryName
    ? `category-option-${categoryName}-${index}`
    : `category-option-${index}`;

getAllCategoryList();

onMounted(() => {
  editAllCategoryData.updateGoodCode = filteredCheckedItem.value.map(
    (item) => item.goodCode,
  );
});
</script>

<template>
  <el-dialog
    v-model="flag.editAllProduct"
    title="선택 상품 분류 수정"
    top="10vh"
    width="40%"
  >
    <el-radio-group
      v-model="isCallServiceTab"
      class="mb-10"
      size="large"
      @change="setSecondCategory"
    >
      <el-radio-button :label="false"> 상품판 분류</el-radio-button>
      <el-radio-button :label="true"> 직원 호출 서비스 상품</el-radio-button>
    </el-radio-group>
    <el-row
      align="middle"
      class="mb-10"
    >
      <span class="mr-20">| 선택 상품 개수 {{ checkedItem?.length }}</span>
      <span class="mr-20">
        | 중복 상품 개수
        {{ checkedItem?.length - filteredCheckedItem?.length }}
      </span>
      <el-checkbox
        v-model="editAllCategoryData.posNameUseYn"
        false-label="N"
        label="포스의 상품 이름과 동일하게 사용합니다."
        true-label="Y"
      />
    </el-row>

    <el-card class="mb-10">
      <el-scrollbar>
        <el-table
          :data="filteredCheckedItem"
          :row-class-name="getTableRowStyle"
          class="width-100"
          height="250"
          lazy
          scrollbar-always-on
        >
          <el-table-column
            align="center"
            label="상품명"
            prop="goodDpName"
            width="270"
          />
          <el-table-column
            align="center"
            label="등록 분류 정보"
          >
            <template #default="{ row }">
              <el-row justify="center">
                <span
                  v-if="row.goodCategoryName?.length > 0"
                  class="category-font"
                >
                  {{ row.goodCategoryName?.length }}
                </span>
                <div
                  v-if="row.goodCategoryName?.length > 0"
                  class="category-tag-container"
                >
                  <el-popover
                    :width="250"
                    placement="top"
                    trigger="hover"
                  >
                    <template #reference>
                      <el-row>
                        <el-icon class="more-icon more-name">
                          <MoreFilled />
                        </el-icon>
                      </el-row>
                    </template>
                    <el-row
                      align="middle"
                      class="category-tag-wrapper"
                      justify="center"
                    >
                      <el-tag
                        v-for="(
                          categoryItem, categoryIndex
                        ) in row.goodCategoryList"
                        :key="
                          getCategoryItemTagKey(
                            categoryItem.childCategoryName,
                            categoryIndex as number,
                          )
                        "
                        class="category-tag"
                        effect="plain"
                        round
                      >
                        {{ convertToEllipsis(categoryItem.categoryName, 8) }} >
                        {{
                          convertToEllipsis(categoryItem.childCategoryName, 8)
                        }}
                        <el-icon
                          v-if="categoryItem.top === 'Y'"
                          color="#FF0000"
                        >
                          <LocationFilled />
                        </el-icon>
                      </el-tag>
                    </el-row>
                  </el-popover>
                </div>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="판매상태"
          >
            <template #default="{ row }">
              <el-tag v-if="row.goodUse === 'N' && row.goodSale === 'N'">
                판매중
              </el-tag>
              <el-tag
                v-if="row.goodUse === 'Y' && row.goodSale === 'N'"
                type="danger"
              >
                판매중지 (숨김)
              </el-tag>
              <el-tag
                v-if="row.goodUse === 'N' && row.goodSale === 'Y'"
                type="warning"
              >
                품절 (보임)
              </el-tag>
              <el-tag
                v-if="row.goodUse === 'Y' && row.goodSale === 'Y'"
                type="warning"
              >
                품절 (숨김)
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="관리"
          >
            <template #default="{ row }">
              <el-button
                :icon="CloseBold"
                circle
                size="small"
                type="danger"
                @click="reCheckGoodsItem(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-card>
    <el-card>
      <el-row
        align="middle"
        class="mb-20"
      >
        <div>
          {{
            isCallServiceTab ? 'ㅣ 직원호출 서비스' : 'ㅣ 분류를 선택해주세요.'
          }}
        </div>
      </el-row>
      <el-row>
        <el-select
          v-if="!isCallServiceTab"
          v-model="selectedChildCategory"
          :disabled="isCallServiceTab"
          class="width-100"
          placeholder="분류를 선택해주세요."
        >
          <el-option-group
            v-for="(group, index) in categoriesGroupInfo"
            :key="getSelectBoxKey(group.label, index)"
            :label="group.label"
          >
            <el-option
              v-for="(item, secondIndex) in group.options"
              :key="getSelectOptionKey(item.label, secondIndex)"
              :label="item.label"
              :value="item.value"
              @click="changeSelectBox"
            />
          </el-option-group>
        </el-select>
        <el-input
          v-else
          disabled
          placeholder="직원호출 상품"
        />
      </el-row>
    </el-card>
    <template #footer>
      <span>
        <el-button @click="closeModal(EDIT_ALL_PRODUCT)"> 닫기 </el-button>
        <el-button
          :disabled="disabledSaveButton"
          type="primary"
          @click="onClickChangeSelectedProductsButton"
        >
          {{ isCallServiceTab ? '직원호출 서비스 등록' : '분류 등록' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.edit-categorize-tablet-text {
  font-size: 14px;
  color: #adafbc;
}

.more-icon {
  padding: 5px 3px;
  -ms-transform: rotate(90deg); /* IE 9 */
  -webkit-transform: rotate(90deg); /* Chrome, Safari, Opera */
  transform: rotate(90deg);
}

.more-name {
  filter: invert(55%) sepia(32%) saturate(3308%) hue-rotate(190deg)
    brightness(101%) contrast(105%);
}

.category-more-tag {
  max-width: 190px;
}

.category-tag-wrapper {
  gap: 4px;
}

.category-tag {
  min-width: 200px;
}

.el-table {
  &:deep(.pos-stop-row) {
    --el-table-tr-bg-color: var(--el-color-info-dark-2);
  }
}
</style>
