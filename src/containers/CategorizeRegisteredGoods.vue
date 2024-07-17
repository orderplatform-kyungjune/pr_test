<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, onActivated, reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { category, endpoints, goods } from '@src/apis/';
import {
  categoryInGoodsListType,
  goodsInCategorizeType,
  requestGoodsSearchListType,
} from '@interface/goods';
import {
  categoryInCategorizeType,
  requestCategoryListType,
  requestUpdateCategoryType,
} from '@interface/category';
import {
  Clock,
  DeleteFilled,
  Filter,
  Pointer,
  QuestionFilled,
  RefreshRight,
  Search,
  WarningFilled,
} from '@element-plus/icons-vue';
import {
  AddAllCategoryModal,
  ArrangeProductModal,
  ArrangeTotalCategoryModal,
  CategorizeBottomFloatingBar,
  CategorizeGoodsCard,
  CategoryNameSettingModal,
  EditAllProductModal,
} from '@containers';
import useExcelDownload from '@composables/excelDownload';
import {
  ADD_ALL_CATEGORY,
  ARRANGE_PRODUCT,
  ARRANGE_TOTAL_CATEGORY,
  CATEGORIZE_TAB_REGISTERED,
  CHANGE_CATEGORY_NAME,
  CUSTOM_THEME_CODE,
} from '@common/string';
import { categoryCodec, goodsCodec } from '@codecs';

const { requestV2CategoryInfoUpdate, requestDeleteCategory } = category;

const { failAuthenticationAlert } = authentication;
const { runtimeCheck } = runtimeCheckHelper;
const { requestV2CategoryList } = category;
const { requestGoodsSearchList } = goods;
const { responseGoodsListInCategorizeCodec } = goodsCodec;
const { downloadExcelPostWithToken } = useExcelDownload();

const route = useRoute();

const storeCode = route.query.code as string;

const { openModal, openModalWithData, flag } = useModalStore();

/** 매장 API 2.0버전 및 테마 체크 */
const isStoreApi2: Ref<boolean> = ref(false);
const isCustomTheme: Ref<boolean> = ref(false);

const firstCategoryList: Ref<categoryInCategorizeType[]> = ref([]);
const secondCategoryList: Ref<categoryInCategorizeType[]> = ref([]);

/** 분류 추가 모달용 대분류 배열 */
const firstCategoryArr = () => {
  const categoryNameArr: { name: string; code: number }[] = [];
  firstCategoryList.value.forEach((first: categoryInCategorizeType) => {
    categoryNameArr.push({
      name: first.categoryName,
      code: first.categoryCode,
    });
  });
  return categoryNameArr;
};

const selectedFirstCategory = reactive({
  code: 0,
  name: '',
});

const selectedSecondCategory = reactive({
  code: 0,
  name: '',
});

const recentlySelectedCategory = reactive({
  type: '',
  code: 0,
  name: '',
});

const { responseCategoryListCodec, responseUpdateCategoryCodec } =
  categoryCodec;

const totalGoodsCount: Ref<number> = ref(0);
const postCategoryList = async (
  searchType: string,
  secondCategoryCode?: number,
) => {
  try {
    const param: requestCategoryListType = {
      storeCode,
      searchType,
      categoryCode: secondCategoryCode,
    };
    const res = (await requestV2CategoryList(param)) as AxiosResponse;
    const typeError = runtimeCheck(responseCategoryListCodec, res.data);

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
        if (searchType === 'big') {
          // 등록된 상품이 없는 상품: 엑셀 다운로드 비활성화
          totalGoodsCount.value = 0;
          // 직원호출 분류 제거
          firstCategoryList.value = res.data.data.filter(
            (firstCategoryValue: categoryInCategorizeType) =>
              firstCategoryValue.categoryCode !== 20000,
          );
          firstCategoryList.value.forEach(
            (firstCategory: categoryInCategorizeType) => {
              totalGoodsCount.value += firstCategory.categoryGoodCount;
            },
          );
        }

        if (searchType === 'child') {
          secondCategoryList.value = res.data.data;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 상품 조회하기 */
const isAfterSearched: Ref<boolean> = ref(false);

const goodsList: Ref<goodsInCategorizeType[]> = ref([]);

const getGoodsListByCategory = async ({
  categoryType = '',
  categoryCode = 0,
  searchTxt = '',
  goodImage = '',
  goodOptionUse = '',
}) => {
  try {
    const param: requestGoodsSearchListType = {
      storeCode,
      categoryType,
      categoryCode,
      searchTxt: searchTxt ?? '',
      goodImage: goodImage ?? '',
      goodOptionUse: goodOptionUse ?? '',
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
        isStoreApi2.value = res.data.api_type === '2.0';
        isCustomTheme.value = res.data.store_theme === CUSTOM_THEME_CODE;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 상품 내 필터링 검색 -  */
const haveGoodImage: Ref<string> = ref('');
const haveGoodOption: Ref<string> = ref('');

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

/** 상품 검색 */
const searchInput: Ref<string> = ref('');
const recentSearchInput: Ref<string> = ref('');

const resetRecentlySelectedCategory = () => {
  recentlySelectedCategory.code = 0;
  recentlySelectedCategory.name = '';
  recentlySelectedCategory.type = '';
};

const searchByKeyword = () => {
  resetRecentlySelectedCategory();
  changeAllCheck(false);

  selectedFirstCategory.code = 0;
  selectedFirstCategory.name = '';

  selectedSecondCategory.code = 0;
  selectedSecondCategory.name = '';

  haveGoodImage.value = '';
  haveGoodOption.value = '';

  isAfterSearched.value = true;
  recentSearchInput.value = searchInput.value;
  getGoodsListByCategory({
    categoryCode: 0,
    searchTxt: searchInput.value,
  });
};

const getSearchValueByExceptInput = (exceptInput?: boolean) =>
  exceptInput ? '' : searchInput.value;

/** 상품 순서 변경, 상품 상세 변경 이후 리스트 재호출 */
const reloadGoodsList = async (exceptInput?: boolean) => {
  await getGoodsListByCategory({
    categoryType: recentlySelectedCategory.type,
    categoryCode: recentlySelectedCategory.code,
    searchTxt: isAfterSearched.value
      ? recentSearchInput.value
      : getSearchValueByExceptInput(exceptInput),
    goodImage: haveGoodImage.value,
    goodOptionUse: haveGoodOption.value,
  });

  // checkedGoodsList 데이터 업데이트
  const checkedCodes = checkedGoodsList.value.map((good) => good.goodCode);
  checkedGoodsList.value = goodsList.value.filter((good) =>
    checkedCodes.includes(good.goodCode),
  );
};

const resetData = () => {
  resetRecentlySelectedCategory();
  changeAllCheck(false);

  selectedFirstCategory.code = 0;
  selectedFirstCategory.name = '';

  selectedSecondCategory.code = 0;
  selectedSecondCategory.name = '';

  haveGoodImage.value = '';
  haveGoodOption.value = '';

  searchInput.value = '';
};

const selectFirstCategory = (firstCategory: categoryInCategorizeType) => {
  if (selectedFirstCategory.code === firstCategory.categoryCode) {
    resetData();

    secondCategoryList.value = [];
    goodsList.value = [];
    return;
  }

  resetData();
  selectedFirstCategory.code = firstCategory.categoryCode;
  selectedFirstCategory.name = firstCategory.categoryName;

  recentlySelectedCategory.type = 'big';
  recentlySelectedCategory.code = selectedFirstCategory.code;
  recentlySelectedCategory.name = selectedFirstCategory.name;
  postCategoryList('child', selectedFirstCategory.code);
  getGoodsListByCategory({
    categoryType: 'big',
    categoryCode: selectedFirstCategory.code,
  });

  isAfterSearched.value = false;
};

const selectSecondCategory = (secondCategory: categoryInCategorizeType) => {
  if (recentlySelectedCategory.code === secondCategory.categoryCode) {
    recentlySelectedCategory.type = 'big';
    recentlySelectedCategory.code = selectedFirstCategory.code;
    recentlySelectedCategory.name = selectedFirstCategory.name;

    getGoodsListByCategory({
      categoryType: 'big',
      categoryCode: selectedFirstCategory.code,
    });

    selectedSecondCategory.code = 0;
    selectedSecondCategory.name = '';
    return;
  }

  changeAllCheck(false);

  selectedSecondCategory.code = secondCategory.categoryCode;
  selectedSecondCategory.name = secondCategory.categoryName;

  recentlySelectedCategory.type = 'child';
  recentlySelectedCategory.code = selectedSecondCategory.code;
  recentlySelectedCategory.name = selectedSecondCategory.name;
  getGoodsListByCategory({
    categoryType: 'child',
    categoryCode: selectedSecondCategory.code,
  });

  isAfterSearched.value = false;
};

/** 분류 이름 변경 후 선택한 버튼에 변경된 이름 변경 */
const replaceCategoryName = async () => {
  let founded;
  if (recentlySelectedCategory.type === 'child') {
    await postCategoryList('child', selectedFirstCategory.code);
    founded = secondCategoryList.value.find(
      (secondCategory: categoryInCategorizeType) =>
        secondCategory.categoryCode === recentlySelectedCategory.code,
    );
  } else {
    await postCategoryList('big');
    founded = firstCategoryList.value.find(
      (firstCategory: categoryInCategorizeType) =>
        firstCategory.categoryCode === recentlySelectedCategory.code,
    );
  }
  if (founded) {
    recentlySelectedCategory.name = founded.categoryName;
  }
};

const openChangeNameModal = () => {
  const targetCategoryData = {
    name: recentlySelectedCategory.name,
    code: recentlySelectedCategory.code,
    type: recentlySelectedCategory.type,
    parentCode:
      recentlySelectedCategory.type === 'child'
        ? selectedFirstCategory.code
        : 0,
  };

  openModalWithData(CHANGE_CATEGORY_NAME, {
    targetCategoryData,
    replaceCategoryName,
  });
};

// api v2 대응 임시 코드 todo fix
const reloadAllCategoryList = () => {
  postCategoryList('big');
  if (selectedFirstCategory.code > 0) {
    postCategoryList('child', selectedFirstCategory.code);
  }
};

const reloadCategoryList = () => {
  if (recentlySelectedCategory.type === 'big') {
    postCategoryList('big');
  } else if (recentlySelectedCategory.type === 'child') {
    postCategoryList('child', selectedFirstCategory.code);
  }
};

const postCategoryInfoUpdate = async (isOpen: boolean) => {
  try {
    const param: requestUpdateCategoryType = {
      storeCode,
      type: recentlySelectedCategory.type,
      categoryCode:
        recentlySelectedCategory.type === 'child'
          ? selectedFirstCategory.code
          : 0, // 대분류 코드(type이 child인 경우만 필수),
      updateCategoryCode: [recentlySelectedCategory.code],
      updateCategoryUse: [isOpen ? 'Y' : 'N'],
    };
    const res = (await requestV2CategoryInfoUpdate(param)) as AxiosResponse;
    const typeError = runtimeCheck(responseUpdateCategoryCodec, res.data);

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
        reloadCategoryList();
        ElMessage({
          type: 'success',
          message: '정상적으로 수정되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const handleCategoryOpenState = (openState: string) => {
  ElMessageBox.confirm('정말로 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      postCategoryInfoUpdate(openState === 'open');
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const resetProductList = () => {
  searchInput.value = '';
  resetData();
  goodsList.value = [];
  isAfterSearched.value = false;
};

const filterGoodsByImage = () => {
  changeAllCheck(false);
  reloadGoodsList(true);
  isAfterSearched.value = true;
};

const filterGoodsByOption = () => {
  changeAllCheck(false);
  reloadGoodsList(true);
  isAfterSearched.value = true;
};

/** 분류 라디오 버튼 동적 스타일 */
const getCategoryBackgroundStyle = (
  categoryInfo: categoryInCategorizeType,
  isBig: boolean,
) => ({
  'opened-category': categoryInfo.categoryUse === 'Y',
  'closed-category': categoryInfo.categoryUse !== 'Y',
  'active-button': isBig
    ? categoryInfo.categoryCode === selectedFirstCategory.code
    : categoryInfo.categoryCode === selectedSecondCategory.code,
  'default-status-button': isBig
    ? categoryInfo.categoryCode !== selectedFirstCategory.code
    : categoryInfo.categoryCode !== selectedSecondCategory.code,
});

const getCategoryStateId = (isClosed: string) =>
  isClosed === 'Y' ? 'open' : 'close';

/** 삭제 요청 함수 */
const postDeleteCategory = async () => {
  try {
    const deleteInfo = {
      storeCode,
      categoryCode: 0,
    };

    deleteInfo.categoryCode = recentlySelectedCategory.code;

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
      reloadCategoryList();
      ElMessage({
        type: 'success',
        message: '정상적으로 삭제되었습니다.',
      });

      // recentlySelectedCategory 초기화
      if (recentlySelectedCategory.type === 'big') {
        recentlySelectedCategory.type = '';
        recentlySelectedCategory.name = '';
        recentlySelectedCategory.code = 0;
      } else if (recentlySelectedCategory.type === 'child') {
        recentlySelectedCategory.type = 'big';
        recentlySelectedCategory.name = selectedFirstCategory.name;
        recentlySelectedCategory.code = selectedFirstCategory.code;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const openDeleteCategoryPrompt = () => {
  const categoryName: string = recentlySelectedCategory.name;

  ElMessageBox.prompt(
    `삭제를 하시려면 "${categoryName} 삭제합니다."를 입력해 주세요. `,
    '정말로 삭제하시겠습니까??',
    {
      confirmButtonText: '입력',
      cancelButtonText: '취소',
      inputPlaceholder: `${categoryName} 삭제합니다.`,
    },
  )
    .then(({ value }) => {
      if (value === `${categoryName} 삭제합니다.`) {
        postDeleteCategory();
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

/** 전체 상품 엑셀 다운로드 */
const isExcelDownloading: Ref<boolean> = ref(false);
const convertStoreCodeName = (storeName: string) =>
  storeName.replaceAll('.', '_');
const getExcelDownload = async () => {
  try {
    isExcelDownloading.value = true;
    const excelTitle = convertStoreCodeName(
      `[${route.query.name ? route.query.name : storeCode}]_등록_상품_목록`,
    );
    const param = {
      storeCode,
      selectType: 'in',
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

const arrangeCategoryProductProp: Ref<categoryInGoodsListType> = ref(
  {} as categoryInGoodsListType,
);

const openArrangeProductModal = () => {
  arrangeCategoryProductProp.value.storeCode = route.query.code as string;
  arrangeCategoryProductProp.value.searchType = 'child';
  arrangeCategoryProductProp.value.categoryCode = selectedSecondCategory.code;

  openModal(ARRANGE_PRODUCT);
};

const reloadBackInfo = () => {
  reloadAllCategoryList();
  reloadGoodsList(true);
};

// 분류스케쥴 설정 여부
const isScheduleChildCategory = (categoryData: categoryInCategorizeType) =>
  categoryData.categoryScheduleOn === 'Y';

/** v-for key 방어 코드 */
const getFirstCategoryKey = (code: number, index: number) =>
  code ? `firstCategory-${code}-${index}` : `firstCategory-${index}`;
const getSecondCategoryKey = (code: number, index: number) =>
  code ? `secondCategory-${code}-${index}` : `secondCategory-${index}`;
const getGoodsKey = (categoryName: string, index: number) =>
  categoryName ? `goods-${categoryName}-${index}` : `goods-${index}`;

/** 상품 상세 -> 뒤로가기 keepAlive 상태에서 데이터 최신화 */
onActivated(() => {
  if (selectedFirstCategory.code > 0) {
    reloadAllCategoryList();
    reloadGoodsList();
  }
});

postCategoryList('big');
</script>

<template>
  <EditAllProductModal
    v-if="flag.editAllProduct"
    :checkGoodsItem="checkGoodsItem"
    :checkedItem="checkedGoodsList"
    :reloadAllCategoryList="reloadAllCategoryList"
    :reloadGoodsList="reloadGoodsList"
  />
  <AddAllCategoryModal
    v-if="flag.addAllCategory"
    :categoryInfo="firstCategoryArr()"
    :reloadAllCategoryList="reloadAllCategoryList"
  />
  <ArrangeTotalCategoryModal
    v-if="flag.arrangeTotalCategory"
    :reloadAllCategoryList="reloadAllCategoryList"
  />
  <CategoryNameSettingModal v-if="flag.changeCategoryName" />
  <ArrangeProductModal
    v-if="flag.arrangeProduct"
    :from="CATEGORIZE_TAB_REGISTERED"
    :reloadBackInfo="reloadBackInfo"
    :selectedFirstCategoryCode="selectedFirstCategory.code"
    :selectedSecondCategoryCode="selectedSecondCategory.code"
  />
  <div>
    <!-- 분류 카드 영역 -->
    <el-card
      class="categorize-registered-wrapper mb-10"
      shadow="hover"
    >
      <p>대분류</p>
      <el-tag
        v-if="firstCategoryList?.length === 0"
        class="mt-10"
        effect="plain"
        type="info"
      >
        분류를 등록해주세요
      </el-tag>
      <div
        v-if="firstCategoryList?.length > 0"
        class="categorize-registered-container mt-10"
      >
        <el-button
          v-for="(firstCategory, index) in firstCategoryList"
          :id="getCategoryStateId(firstCategory.categoryUse)"
          :key="getFirstCategoryKey(firstCategory.categoryCode, index)"
          :class="getCategoryBackgroundStyle(firstCategory, true)"
          :label="firstCategory.categoryCode"
          :type="firstCategory.categoryUse === 'Y' ? 'danger' : 'info'"
          plain
          @click="selectFirstCategory(firstCategory)"
        >
          {{
            `${firstCategory.categoryName} ( ${firstCategory.categoryGoodCount} )`
          }}
          <el-tag
            :type="firstCategory.categoryUse === 'Y' ? 'danger' : 'info'"
            class="ml-5"
            effect="plain"
            size="small"
          >
            {{ firstCategory.categoryUse === 'Y' ? '열림' : '닫힘' }}
          </el-tag>
          <el-icon
            v-if="isScheduleChildCategory(firstCategory)"
            class="ml-5"
          >
            <Clock />
          </el-icon>
        </el-button>
      </div>
      <p class="mt-20 mb-10">중분류</p>
      <el-tag
        v-if="
          recentlySelectedCategory.type === 'big' &&
          secondCategoryList?.length === 0
        "
        class="mt-10"
        effect="plain"
        type="info"
      >
        중분류가 존재하지 않습니다.
      </el-tag>
      <div
        v-if="
          recentlySelectedCategory.type === '' &&
          secondCategoryList?.length === 0
        "
        class="category-empty-space"
      ></div>
      <div
        v-if="secondCategoryList?.length > 0"
        class="categorize-registered-container"
      >
        <el-button
          v-for="(secondCategory, index) in secondCategoryList"
          :id="getCategoryStateId(secondCategory.categoryUse)"
          :key="getSecondCategoryKey(secondCategory.categoryCode, index)"
          :class="getCategoryBackgroundStyle(secondCategory, false)"
          :label="secondCategory.categoryCode"
          :type="secondCategory.categoryUse === 'Y' ? 'danger' : 'info'"
          plain
          @click="selectSecondCategory(secondCategory)"
        >
          {{
            `${secondCategory.categoryName} ( ${secondCategory.categoryGoodCount} )`
          }}
          <el-tag
            :type="secondCategory.categoryUse === 'Y' ? 'danger' : 'info'"
            class="ml-5"
            effect="plain"
            size="small"
          >
            {{ secondCategory.categoryUse === 'Y' ? '열림' : '닫힘' }}
          </el-tag>
          <el-icon
            v-if="isScheduleChildCategory(secondCategory)"
            class="ml-5"
          >
            <Clock />
          </el-icon>
        </el-button>
      </div>
    </el-card>

    <!-- 분류 설정 및 상품 설정 카드 영역 -->
    <el-row class="categorize-settings-wrapper mb-10">
      <!-- 분류 설정 영역 -->
      <el-card
        class="categorize-settings-container"
        shadow="hover"
      >
        <el-row align="middle">
          <span> 분류 설정 </span>
          <el-tooltip
            class="ml-10"
            content="분류 선택 후에 변경이 가능합니다."
            placement="right"
          >
            <el-icon class="ml-5">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-row>
        <el-row
          align="bottom"
          justify="space-between"
        >
          <div>
            <el-button
              plain
              type="success"
              @click="openModal(ADD_ALL_CATEGORY)"
            >
              분류 등록
            </el-button>
            <el-button
              plain
              type="success"
              @click="openModal(ARRANGE_TOTAL_CATEGORY)"
            >
              분류 순서 설정
            </el-button>
            <el-button
              :disabled="recentlySelectedCategory.code === 0"
              plain
              type="success"
              @click="openChangeNameModal"
            >
              분류명 변경
            </el-button>
          </div>
          <div>
            <p class="font-small mb-5 category-on-off-setting">
              태블릿 분류 노출 설정
            </p>
            <el-row>
              <el-button
                :disabled="!recentlySelectedCategory.type"
                plain
                type="success"
                @click="handleCategoryOpenState('open')"
              >
                열기
              </el-button>
              <el-button
                :disabled="!recentlySelectedCategory.type"
                plain
                type="success"
                @click="handleCategoryOpenState('close')"
              >
                닫기
              </el-button>
            </el-row>
          </div>
          <div>
            <el-tooltip
              content="삭제할 분류를 선택해주세요."
              effect="dark"
              placement="top"
            >
              <el-button
                :disabled="recentlySelectedCategory.code === 0"
                color="#bbb"
                @click="openDeleteCategoryPrompt"
              >
                <el-icon>
                  <DeleteFilled />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </el-row>
      </el-card>

      <!-- 상품 설정 카드 영역 -->
      <el-card
        class="flex-1"
        shadow="hover"
      >
        <el-row align="middle">
          <span> 상품 설정 </span>
          <el-tooltip
            content="중분류 선택 후에 변경이 가능합니다."
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
            :disabled="recentlySelectedCategory.type !== 'child'"
            plain
            type="warning"
            @click="openArrangeProductModal"
          >
            상품 순서 변경
          </el-button>
        </el-row>
      </el-card>

      <!-- 정보 내려받기 영역 -->
      <el-card
        class="flex-1"
        shadow="hover"
      >
        <el-row align="middle">
          <span> 정보 내려받기 </span>
          <el-tooltip
            content="등록된 상품 목록을 다운로드합니다."
            placement="right"
          >
            <el-icon class="ml-5">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-row>
        <el-row class="mt-20">
          <el-button
            :disabled="totalGoodsCount === 0"
            :loading="isExcelDownloading"
            type="success"
            @click="getExcelDownload()"
          >
            등록된 상품 전체 다운로드
          </el-button>
        </el-row>
      </el-card>
    </el-row>

    <!-- 상품 검색 영역 -->
    <el-card
      class="mb-10"
      shadow="hover"
    >
      <el-row align="middle">
        <span class="mr-5">상품 검색</span>
        <el-tag type="info">
          상품 검색은 분류를 미선택해도 등록된 분류 기준으로 전체 검색됩니다.
        </el-tag>
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

    <!-- 상품 영역 -->
    <el-card
      class="mb-20 goods-list-container"
      shadow="hover"
    >
      <el-row
        align="middle"
        class="goods-list-top-title"
      >
        <!-- 분류 선택 x, 전체 상품 -->
        <el-tag
          v-if="recentlySelectedCategory.type === '' && goodsList?.length > 0"
          type="success"
        >
          모든 상품 데이터
        </el-tag>
        <!-- 대분류만 선택 -->
        <span
          v-if="recentlySelectedCategory.type === 'big'"
          class="mr-5"
        >
          {{ recentlySelectedCategory.name }} ({{ goodsList?.length }})
        </span>
        <el-tag
          v-if="recentlySelectedCategory.type === 'big'"
          type="danger"
        >
          중분류 미지정
        </el-tag>
        <!-- 중분류까지 선택 -->
        <span
          v-if="recentlySelectedCategory.type === 'child'"
          class="mr-10"
        >
          {{ selectedFirstCategory.name }} >
          {{ selectedSecondCategory.name }} ({{ goodsList?.length }})
        </span>
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
        <div class="categorize-filter">
          <el-icon
            :size="17"
            class="mr-5"
          >
            <Filter />
          </el-icon>
          <el-select
            v-model="haveGoodImage"
            class="mr-20"
            placeholder="이미지 설정 여부"
            @change="filterGoodsByImage"
          >
            <el-option
              key="goods-image-default"
              label="이미지 전체 (설정 & 미설정)"
              value=""
            />
            <el-option
              key="goods-image-y"
              label="이미지 설정"
              value="Y"
            />
            <el-option
              key="goods-image-n"
              label="이미지 미설정"
              value="N"
            />
          </el-select>
          <el-icon
            :size="17"
            class="mr-5"
          >
            <Filter />
          </el-icon>
          <el-select
            v-model="haveGoodOption"
            placeholder="옵션 사용 여부"
            @change="filterGoodsByOption"
          >
            <el-option
              key="goods-option-default"
              label="옵션 전체 (사용 & 미사용)"
              value=""
            />
            <el-option
              key="goods-option-y"
              label="옵션 사용 상품"
              value="Y"
            />
            <el-option
              key="goods-option-n"
              label="옵션 미사용 상품"
              value="N"
            />
          </el-select>
        </div>
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
          :isCustomTheme="isCustomTheme"
          :isStoreApi2="isStoreApi2"
          :itemInfo="goodsItem"
          :reloadGoodsList="reloadGoodsList"
        />
      </div>
      <div v-else>
        <el-row
          v-if="recentlySelectedCategory.code === 0 && !searchInput"
          class="goods-empty mt-20 mb-20"
          justify="center"
        >
          <el-icon
            :size="30"
            class="mb-10"
          >
            <Pointer color="#73767a" />
          </el-icon>
          <el-text type="info"> 분류를 선택해주세요.</el-text>
        </el-row>

        <el-row
          v-if="recentlySelectedCategory.code !== 0 && !isAfterSearched"
          class="goods-empty mt-20 mb-20"
          justify="center"
        >
          <el-icon
            :size="30"
            class="mb-10"
          >
            <WarningFilled color="#73767a" />
          </el-icon>
          <el-text type="info"> 선택한 분류에 상품이 없습니다.</el-text>
        </el-row>

        <el-row
          v-if="isAfterSearched"
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
      </div>
    </el-card>

    <!-- 하단 플로팅 영역 -->
    <CategorizeBottomFloatingBar
      :changeAllCheck="changeAllCheck"
      :checkedGoodsList="checkedGoodsList"
      :isAllChecked="isAllChecked"
      :isCustomTheme="isCustomTheme"
      :isDisableAllCheckbox="isDisableAllCheckbox"
      :isIndeterminateAll="isIndeterminateAll"
      :isStoreApi2="isStoreApi2"
      :reloadGoodsList="reloadGoodsList"
      tabName="registered"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-on-off-setting {
  text-align: center;
}

.categorize-registered-wrapper {
  display: flex;
  flex-direction: column;

  .category-empty-space {
    height: 32px;
  }

  .categorize-registered-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    &:deep(.el-button + .el-button) {
      margin-left: 0;
    }

    .opened-category {
      &.active-button {
        color: #fff;
        background-color: #f56c6c;
      }

      &.default-status-button {
        color: #f56c6c;
        background-color: #fef0f0;
        border-color: #fab6b6;
      }
    }

    .closed-category {
      &.active-button {
        color: #fff;
        background-color: #909399;
      }

      &.default-status-button {
        color: #909399;
        background-color: #f4f4f5;
        border-color: #c8c9cc;
      }
    }
  }
}

.categorize-settings-wrapper {
  display: flex;
  gap: 10px;

  .categorize-settings-container {
    flex: 2;
  }
}

.search-input {
  width: 720px;
}

.goods-list-top-title {
  height: 25px;
}

.categorize-filter {
  display: flex;
  align-items: center;
}

.categorize-goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 70px;
  overflow: auto;
}

.goods-empty {
  flex-direction: column;
  align-items: center;
  min-height: 100px;
}
</style>
