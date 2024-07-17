<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { computed, h, onMounted, reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import useCategoryStore from '@store/storeCategory';
import router from '@router';
import {
  orderTwoOptionMenuDataPlatformType,
  responseOptionGroupListType,
  responseSetGroupListType,
} from '@interface/orderTwoOption';
import { requestOrderOneOptionMenuPlatformType } from '@interface/option';
import {
  allergyListType,
  arrangeProductNameType,
  categoryInGoodsListType,
  productDetailInfoDataGoodCategoryListType,
  productDetailInfoDataOptionPlatformType,
  productDetailInfoDataPlatformType,
  updateProductType,
} from '@interface/goods';
import { childCategoryType } from '@interface/category';
import {
  LocationFilled,
  Picture,
  Plus,
  RefreshRight,
  Top,
  WarningFilled,
  ZoomIn,
} from '@element-plus/icons-vue';
import {
  AddOrderOneOptionGroupModal,
  AddOrderTwoOptionGroupModal,
  ArrangeOrderOneOptionGroupModal,
  ArrangeOrderTwoOptionGroupModal,
  ArrangeProductModal,
  DeleteOptionGroupModal,
  LanguageTranslateModal,
  PlatformImportOptionGroupModal,
  PlatformUpdateOrderOneOptionMenuModal,
  PlatformUpdateOrderTwoOptionMenuModal,
} from '@containers';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import {
  ADD_ORDER_ONE_OPTION_GROUP,
  ADD_ORDER_TWO_OPTION_GROUP,
  ARRANGE_ORDER_ONE_OPTION_GROUP,
  ARRANGE_ORDER_TWO_OPTION_GROUP,
  ARRANGE_PRODUCT,
  CUSTOM_THEME_CODE,
  DELETE_OPTION_GROUP,
  IMPORT_OPTION_GROUP,
  PRODUCT_DETAIL_SETTING,
  UPDATE_ORDER_ONE_OPTION_MENU,
  UPDATE_ORDER_TWO_OPTION_MENU,
} from '@common/string';
import { categoryCodec, goodsCodec, orderTwoOptionCodec } from '@codecs';
import { category, goods, option, orderTwoOption } from '@apis';

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const {
  requestProductDetailInfo,
  requestCustomProductCode,
  requestChangeProductImage,
  requestUpdateProduct,
} = goods;

const { requestV2CategoryList } = category;

const {
  requestDeleteOrderTwoOptionGroupList,
  requestOrderTwoOptionGroupList,
  requestOrderTwoOptionMenuList,
  requestUpdateOrderTwoOptionMenu,
  requestArrangeOrderTwoOptionMenu,
} = orderTwoOption;

const {
  requestDeleteOption,
  requestSortOptionData,
  requestUpdateDetailOption,
} = option;

const { productDetailInfoCodec, customProductCodeCodec } = goodsCodec;

const { orderTwoOptionGroupListCodec, orderTwoOptionMenuListCodec } =
  orderTwoOptionCodec;

const { responseEachBigChildCategoryListCodec } = categoryCodec;

const { flag, openModal } = useModalStore();

const { getCategoryList } = useCategoryStore();

const { convertToEllipsis } = etcUtils;

/** 상품 상세 정보 데이터 */
const productDetailData: Ref<productDetailInfoDataPlatformType> = ref({
  useLock: '',
  imageLock: '',
  saleLock: '',
  goodPriceOptionNameArray: {
    en: {
      option_1: '',
      option_2: '',
    },
    jp: {
      option_1: '',
      option_2: '',
    },
    ko: {
      option_1: '',
      option_2: '',
    },
    zh_hans: {
      option_1: '',
      option_2: '',
    },
    zh_hant: {
      option_1: '',
      option_2: '',
    },
  },
} as productDetailInfoDataPlatformType);

/** 매장 API 2.0버전 및 테마 체크 */
const isStoreApi2: Ref<boolean> = ref(true);
const isCustomTheme: Ref<boolean> = ref(false);

/** 상품 상세 티오더 1 옵션 그룹 */
const orderOneOptionGroupList: Ref<productDetailInfoDataOptionPlatformType[]> =
  ref([] as productDetailInfoDataOptionPlatformType[]);

/** 커스텀 코드 데이터 */
const customCodeData = ref([] as { code: string; text: string }[]);

/** 중분류 데이터 */
const childCategoryListData: Ref<childCategoryType[]> = ref(
  [] as childCategoryType[],
);

/** 옵션 추가하기 props 데이터 */
const productPropsData = reactive({
  storeCode: route.query.code as string,
  goodCode: '',
  posGoodCode: '',
});

/** 로딩 상태값 */
const fullscreenLoading = ref(false);
const activeTabName = ref('description');

/** 옵션 정보 탭 인덱스 */
const orderOneOptionGroupTabsIndex = ref<number>(0);
const orderTwoOptionGroupTabsIndex = ref<number>(0);

const goodsDetailSettingInCategoryHeader = reactive([
  { name: PRODUCT_DETAIL_SETTING },
]);

const isOn = (status: string) => status === 'Y';

const selectedAllergyList: Ref<number[]> = ref([]);

/** 포스 삭제 상품 여부 */
const isGoodPosStop = computed(() =>
  isOn(productDetailData.value.goodPosStopUse),
);

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
        customCodeData.value.unshift({
          code: productDetailData.value.posGoodCode,
          text: productDetailData.value.posGoodCode,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const selectedCategory: Ref<number[]> = ref([]);

const convertedCategoryName = (categoryName: string) => {
  if (categoryName?.length > 12) {
    return `${categoryName.slice(0, 12)}...`;
  }

  return categoryName;
};

const arrangeCategoryProductProp = reactive({} as categoryInGoodsListType);
const arrangeCategoryNameProp = reactive({} as arrangeProductNameType);
const selectedSCategoryCodeForModal = reactive({
  first: '',
  second: '',
});

const openArrangeProductModal = (
  row: productDetailInfoDataGoodCategoryListType,
) => {
  arrangeCategoryProductProp.storeCode = route.query.code as string;
  arrangeCategoryProductProp.searchType = 'child';
  arrangeCategoryProductProp.categoryCode = row.childCategoryCode;

  arrangeCategoryNameProp.firstCategoryName = row.categoryName;
  arrangeCategoryNameProp.secondCategoryName = row.childCategoryName;

  selectedSCategoryCodeForModal.first = row.categoryCode;
  selectedSCategoryCodeForModal.second = row.childCategoryCode;

  openModal(ARRANGE_PRODUCT);
};

const optionLoading: Ref<boolean> = ref(false);

/** 상품 상세 + 옵션 정보 불러오기 */
const getProductDetailInfo = async () => {
  const data = {
    posGoodCode: route.query.posGoodCode as string,
    storeCode: route.query.code as string,
  };

  optionLoading.value = true;

  try {
    const res = (await requestProductDetailInfo(data)) as AxiosResponse;
    const typeError = runtimeCheck(productDetailInfoCodec, res.data);

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
        productDetailData.value = res.data.data;
        orderOneOptionGroupList.value = res.data.data.option;
        orderOneOptionGroupList.value.forEach(
          (group: productDetailInfoDataOptionPlatformType, index: number) => {
            Object.assign(group, { index });
          },
        );
        productDetailData.value.goodTypeSpicyRate = res.data.data.spicy_rate;
        productPropsData.goodCode = res.data.data.goodCode;
        productPropsData.posGoodCode = res.data.data.posGoodCode;
        productDetailData.value.goodRetailPrice = res.data.data.goodRetailPrice;
        productDetailData.value.goodRetailPriceUse = res.data.data
          .goodRetailPriceUse
          ? res.data.data.goodRetailPriceUse
          : 'N';
        selectedCategory.value = res.data.data?.goodCategoryList?.map(
          (categoryInfo: productDetailInfoDataGoodCategoryListType) =>
            categoryInfo.childCategoryCode,
        );
        selectedAllergyList.value = res.data.data?.allergy_list
          .filter((allergyInfo: allergyListType) => allergyInfo.set_yn === 'Y')
          .map((allergyInfo: allergyListType) => allergyInfo.id);
        isCustomTheme.value =
          productDetailData.value.platform_store_Theme.includes(
            CUSTOM_THEME_CODE,
          );
        await getCustomProductCode();
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    optionLoading.value = false;
  }
};

const onCheckRightTransfer = (value: number[], movedKeys: number[]) => {
  const checkedTopGoods = value.some((item) => movedKeys.includes(item));

  if (!checkedTopGoods) return;

  const matchingCategoryList = childCategoryListData.value.filter(
    (obj) => obj.top === 'Y' && movedKeys.includes(obj.childCode),
  );
  const isTopGoods = matchingCategoryList.map(
    (categoryObj) => categoryObj.childCode,
  );

  if (isTopGoods.length) {
    const title = `선택한 분류를 이동 처리할 수 없습니다.

      선택한 분류에서 상품을 이동을 원할 경우,
      상품 최상단 고정 기능을 해지를 해주세요.`;

    ElMessageBox.alert('경고', {
      confirmButtonText: '확인',
      message: h(
        'p',
        { style: 'white-space: break-spaces; text-align: center;' },
        title,
      ),
    });
  }
};

const onChangeCategoryInfoTransfer = (
  value: number[],
  direction: 'left' | 'right',
  movedKeys: number[],
) => {
  if (direction === 'left') {
    const matchingCategoryList = childCategoryListData.value.filter(
      (obj) => obj.top === 'Y' && movedKeys.includes(obj.childCode),
    );
    const isTopGoods = matchingCategoryList.map(
      (categoryObj) => categoryObj.childCode,
    );

    if (isTopGoods.length) {
      selectedCategory.value.push(...isTopGoods);
    }
  }
};

/** 상품 이미지 변경 */
const changeProductImage = async (response: any) => {
  const requestUpdateImageData = {
    storeCode: route.query.code as string,
    goodCode: productDetailData.value.goodCode,
    posGoodCode: productDetailData.value.posGoodCode,
    goodImage: response.raw,
  };

  try {
    fullscreenLoading.value = true;
    const res = (await requestChangeProductImage(
      requestUpdateImageData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
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
        message: '정상적으로 수정되었습니다.',
      });
      productDetailData.value.goodImage = res.data.data?.goods_img_update_url;
      await getCategoryList();
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

/** v2 버전 - 중분류 데이터 */
const getChildCategoryList = async () => {
  const payload = {
    storeCode: route.query.code as string,
    searchType: 'each_big_child',
    goodCode: productDetailData.value.goodCode,
  };

  try {
    const res = (await requestV2CategoryList(payload)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseEachBigChildCategoryListCodec,
      res.data,
    );

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        childCategoryListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const spicyRateMarks = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
};
const onSpicyChange = () => {
  if (productDetailData.value.goodTypeSpicy === 'N') {
    productDetailData.value.goodTypeSpicyRate = 0;
  }
};

/** 상품 정보 수정하기 */
const postGoodsInfoUpdate = async (requestData: updateProductType) => {
  try {
    const res = (await requestUpdateProduct(requestData)) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
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
      await getProductDetailInfo();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 할인가 적용 후, 할인 전 가격이 판매가보다 작을 경우, alert message */
const failGoodsPriceValidationAlert = () => {
  ElMessageBox.alert('할인 전 가격은 판매가와 같거나 커야합니다.', '실패', {
    callback: () => {
      document
        .querySelector('.goods-price-input')
        ?.getElementsByTagName('input')[0]
        ?.focus();
    },
    confirmButtonText: '확인',
    type: 'error',
  });
};

/** 상품 상세 설명 보이기 설정 시, 상품 상세 설명 내용이 없을 경우, alert message */
const failGoodsDetailValidationAlert = () => {
  ElMessageBox.alert(
    '상품 상세 설명 내용이 없으면 보이기 설정이 불가능합니다.',
    '실패',
    {
      callback: () => {
        document
          .querySelector('.good-html-input')
          ?.getElementsByTagName('textarea')[0]
          ?.focus();
      },
      confirmButtonText: '확인',
      type: 'error',
    },
  );
};

/** 최대 주문 수량이 0이 아니고 최대 수량보다 최소 수량이 작을 때 alert message */
const failGoodsQtyValidationAlert = () => {
  ElMessageBox.alert(
    '상품의 최소 주문 수량이 최대 주문 수량보다 큽니다. 확인 후 다시 진행 해주세요.',
    '실패',
    {
      confirmButtonText: '취소',
      type: 'error',
    },
  );
};

/** 최대 주문 수량과 최소 주문 수량이 동일할 때, confirm message */
const warnGoodsSameQtyValidationConfirm = (requestData: updateProductType) => {
  ElMessageBox.confirm(
    '최소 주문 수량과 최대 주문 수량이 동일합니다. 그래도 진행하시겠습니까?',
    '경고',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(() => {
    postGoodsInfoUpdate(requestData);
  });
};

/** 조건 통과 후 최종 confirm message */
const warnGoodsQtyValidationFinalConfirm = (requestData: updateProductType) => {
  ElMessageBox.confirm('저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(() => {
    postGoodsInfoUpdate(requestData);
  });
};

/** 변경 사항 저장 버튼 클릭 */
const saveGoodsDetail = (
  productDetailDataValue: productDetailInfoDataPlatformType,
) => {
  // 할인가 적용 후, 할인 전 가격이 판매가보다 작을 경우
  if (
    productDetailDataValue.goodRetailPriceUse === 'Y' &&
    Number(productDetailDataValue.goodRetailPrice) <
      Number(productDetailDataValue.goodPrice)
  ) {
    failGoodsPriceValidationAlert();
    return;
  }

  // 상품 상세 설명 보이기 설정 시, 상품 상세 설명 내용이 없을 경우
  if (
    productDetailDataValue.goodDetailOpen === 'Y' &&
    productDetailDataValue.goodHtml === ''
  ) {
    failGoodsDetailValidationAlert();
    return;
  }

  // 최대 수량보다 최소 수량이 높은 경우(단, 최대수량이 0인 경우는 제외)
  if (
    productDetailDataValue.goodsMaxOrderQty <
      productDetailDataValue.goodsMinOrderQty &&
    productDetailDataValue.goodsMaxOrderQty !== 0
  ) {
    failGoodsQtyValidationAlert();
    return;
  }

  const requestData = {
    storeCode: route.query.code as string,
    goodCode: productDetailDataValue.goodCode,
    posGoodCode: productDetailDataValue.posGoodCode,
    goodDpName: productDetailDataValue.goodDpName,
    goodUse: productDetailDataValue.goodUse,
    goodSale: productDetailDataValue.goodSale,
    goodKitchen: productDetailDataValue.goodKitchen,
    nonShowCart: productDetailDataValue.nonShowCart,
    platform_store_good_kitchen: productDetailDataValue.goodKitchen,
    goodReviewCnt: productDetailDataValue.goodReviewCnt,
    goodsMaxOrderQty: productDetailDataValue.goodsMaxOrderQty,
    goodsMinOrderQty: productDetailDataValue.goodsMinOrderQty,
    goodTypeBest: productDetailDataValue.goodTypeBest,
    goodTypeHit: productDetailDataValue.goodTypeHit,
    goodTypeMd: productDetailDataValue.goodTypeMd,
    goodTypeSale: productDetailDataValue.goodTypeSale,
    goodTypeNew: productDetailDataValue.goodTypeNew,
    goodTypeVegan: productDetailDataValue.goodTypeVegan,
    goodTypeSpicy: productDetailDataValue.goodTypeSpicy,
    goodTypeSpicyRate: productDetailDataValue.goodTypeSpicyRate,
    goodTypeSignature: productDetailDataValue.goodTypeSignature,
    goodsOptionUse: productDetailDataValue.goodsOptionUse,
    goodDetailOpen: productDetailDataValue.goodDetailOpen,
    goodHtml: productDetailDataValue.goodHtml,
    platform_store_is_set: productDetailDataValue.platform_store_is_set,
    platform_store_is_order: productDetailDataValue.platform_store_is_order,
    childCategoryCode: selectedCategory.value.map((code: number | string) =>
      String(code),
    ),
    option_group_select_auto: productDetailDataValue.option_group_select_auto,
    goodPriceOptionNameArrayYN:
      productDetailDataValue.goodPriceOptionNameArrayYN,
    country_of_origin: productDetailDataValue.country_of_origin,
    spicy_rate: productDetailDataValue.goodTypeSpicyRate,
    goodRetailPrice: productDetailDataValue.goodRetailPrice,
    goodRetailPriceUse: productDetailDataValue.goodRetailPriceUse,
    platform_store_good_allergy_use:
      productDetailDataValue.platform_store_good_allergy_use,
    allergy_ids: selectedAllergyList.value,
  };

  // 최대 수량과 최소 수량이 동일한 경우(단, 최대 수량이 0보다 큰 경우는 제외)
  if (
    requestData.goodsMaxOrderQty === requestData.goodsMinOrderQty &&
    requestData.goodsMinOrderQty > 0
  ) {
    warnGoodsSameQtyValidationConfirm(requestData);
    return;
  }

  // 최대 수량과 최소 수량이 모두 0인 경우(최대 및 최소 제한 없음으로 정상)
  // 최대 수량과 최소 수량이 정상적으로 설정된 경우
  warnGoodsQtyValidationFinalConfirm(requestData);
};

/** 옵션 그룹 사용 여부에 따른 disabled 처리 */
const isDisabled = (target: string) => target !== 'Y';

/** 옵션 그룹 전체 삭제하기 */
const postDeleteAllBasicOption = () => {
  ElMessageBox.confirm(
    '정말 모든 옵션 그룹을 삭제하시겠습니까?',
    '옵션 그룹 전체삭제',
    {
      confirmButtonText: '네',
      cancelButtonText: '아니오',
      type: 'warning',
    },
  )
    .then(async () => {
      const requestData = {
        storeCode: route.query.code as string,
        goodCode: productDetailData.value.goodCode,
        posGoodCode: productDetailData.value.posGoodCode,
        groupAll: 'Y',
      };

      try {
        const res = (await requestDeleteOption(requestData)) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }

        if (res.data.code === 401) {
          failAuthenticationAlert();
        }

        if (res.data.code === 200) {
          await getProductDetailInfo();
          ElMessage({
            type: 'success',
            message: '전체 삭제되었습니다..',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '취소되었습니다.',
      });
    });
};

/** 옵션 그룹 가져오기 상태 (추가하기, 덮어쓰기) */
const importOptionType: Ref<string> = ref('');

/** 옵션 그룹 덮어쓰기 / 가져오기 모달창 열기  */
const openImportOptionModal = (type: 'add' | 'remove') => {
  importOptionType.value = type;
  openModal(IMPORT_OPTION_GROUP);
};

/** 티오더 1 옵션 수정하기 모달창 열기 */
const editOrderOneOptionTargetData = ref(
  {} as productDetailInfoDataOptionPlatformType,
);
const openEditOrderOneOptionModal = (
  target: productDetailInfoDataOptionPlatformType,
) => {
  editOrderOneOptionTargetData.value = target;
  openModal(UPDATE_ORDER_ONE_OPTION_MENU);
};
/** 티오더 2 옵션 수정하기 모달창 열기 */
const editOrderTwoOptionTargetData = ref({} as responseOptionGroupListType);
const openEditOrderTwoOptionModal = (target: responseOptionGroupListType) => {
  editOrderTwoOptionTargetData.value = target;
  openModal(UPDATE_ORDER_TWO_OPTION_MENU);
};

/** 옵션 순서 변경하기 */
const setSortOptionData = async (
  target: productDetailInfoDataOptionPlatformType,
) => {
  const getOptionArr = () => {
    const newArr: number[] = [];
    target.option_item.forEach(
      (item: requestOrderOneOptionMenuPlatformType) => {
        newArr.push(item.platform_good_option_no);
      },
    );
    return newArr;
  };

  const requestData = {
    storeCode: route.query.code as string,
    goodCode: productDetailData.value.goodCode,
    posGoodCode: productDetailData.value.posGoodCode,
    groupId: target.group_num,
    option_no: getOptionArr(),
  };

  try {
    const res = (await requestSortOptionData(requestData)) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
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

/** 상품 이미지 업로드 */
const setProductImage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  product: requestOrderOneOptionMenuPlatformType,
) => {
  const requestUpdateImageData = {
    storeCode: route.query.code as string,
    option_no: String(product.platform_good_option_no),
    option_qty: String(product.platform_store_good_option_select_cnt),
    option_use: product.platform_store_good_option_use,
    option_is_sale: product.platform_store_good_option_isSale,
    option_img: response.raw,
  };

  try {
    fullscreenLoading.value = true;
    const res = (await requestUpdateDetailOption(
      requestUpdateImageData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      await getProductDetailInfo();
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    fullscreenLoading.value = false;
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

/** 판매, 중지 스위치 API 요청 */
const setSoldOutSwitch = async (
  product: requestOrderOneOptionMenuPlatformType,
) => {
  const requestUpdateImageData = {
    storeCode: route.query.code as string,
    option_no: String(product.platform_good_option_no),
    option_qty: String(product.platform_store_good_option_select_cnt),
    option_use: product.platform_store_good_option_use,
    option_is_sale: product.platform_store_good_option_isSale,
  };

  try {
    const res = (await requestUpdateDetailOption(
      requestUpdateImageData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      await getProductDetailInfo();
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더 2 옵션 그룹 리스트 불러오기 */
const orderTwoOptionGroupList = ref<responseOptionGroupListType[]>([]);
const postOrderTwoOptionGroupList = async () => {
  const requestData = {
    storeCode: route.query.code as string,
    goodsCode: productDetailData.value.goodCode,
  };

  try {
    const res = (await requestOrderTwoOptionGroupList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionGroupListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        orderTwoOptionGroupList.value = res.data.data;
        orderTwoOptionGroupList.value.forEach(
          (group: responseOptionGroupListType, index: number) => {
            Object.assign(group, { index });
          },
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더 2 옵션 상품 리스트 불러오기 */
const orderTwoOptionMenuList = ref<orderTwoOptionMenuDataPlatformType[]>([]);
const postOrderTwoOptionMenuList = async (index: number) => {
  if (orderTwoOptionGroupList.value.length === 0) return;

  const requestData = {
    storeCode: route.query.code as string,
    goodsCode: productDetailData.value.goodCode,
    option_group_no: orderTwoOptionGroupList.value[index].option_group_no,
  };

  try {
    const res = (await requestOrderTwoOptionMenuList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionMenuListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        orderTwoOptionMenuList.value = res.data.data.item;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더 2 옵션 상품 순서 변경 */
const postSortOrderTwoOptionMenu = async () => {
  const getOptionArr = () => {
    const newArr: number[] = [];
    orderTwoOptionMenuList.value.forEach(
      (item: orderTwoOptionMenuDataPlatformType) => {
        newArr.push(item.platform_good_option_no);
      },
    );
    return newArr;
  };

  const requestData = {
    storeCode: route.query.code as string,
    goodCode: productDetailData.value.goodCode,
    posGoodCode: productDetailData.value.posGoodCode,
    option_group_no:
      orderTwoOptionGroupList.value[orderTwoOptionGroupTabsIndex.value]
        .option_group_no,
    option_no: getOptionArr(),
  };

  try {
    const res = (await requestArrangeOrderTwoOptionMenu(
      requestData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      await postOrderTwoOptionMenuList(orderTwoOptionGroupTabsIndex.value);
      ElMessage({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const postOptionGroupList = async () => {
  if (isStoreApi2.value) {
    await postOrderTwoOptionGroupList();

    if (orderTwoOptionGroupList.value.length === 0) return;
    await postOrderTwoOptionMenuList(0);
  } else {
    await getProductDetailInfo();
  }
};

/** 티오더 2 옵션 상품 수정하기 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postOptionMenuUpdate = async (
  target: orderTwoOptionMenuDataPlatformType,
  file?: any,
) => {
  const requestData = {
    storeCode: route.query.code as string,
    option_no: String(target.platform_good_option_no),
    option_qty: String(target.platform_store_good_option_select_cnt),
    option_use: target.platform_store_good_option_use,
    option_is_sale: target.platform_store_good_option_isSale,
    option_img: file ? file.raw : '',
  };

  try {
    const res = (await requestUpdateOrderTwoOptionMenu(
      requestData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      await postOrderTwoOptionMenuList(orderTwoOptionGroupTabsIndex.value);
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더 2 옵션 그룹 전체 삭제하기 */
const postDeleteAllOption = () => {
  ElMessageBox.confirm(
    '정말 모든 옵션 그룹을 삭제하시겠습니까?',
    '옵션 그룹 전체삭제',
    {
      confirmButtonText: '네',
      cancelButtonText: '아니오',
      type: 'warning',
    },
  )
    .then(async () => {
      const requestData = {
        storeCode: route.query.code as string,
        goodCode: productDetailData.value.goodCode,
        posGoodCode: productDetailData.value.posGoodCode,
      };

      try {
        const res = (await requestDeleteOrderTwoOptionGroupList(
          requestData,
        )) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }

        if (res.data.code === 401) {
          failAuthenticationAlert();
        }

        if (res.data.code === 200) {
          await postOrderTwoOptionGroupList();
          ElMessage({
            type: 'success',
            message: '전체 삭제되었습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '취소되었습니다.',
      });
    });
};

const resetSelectedAllergyList = () => {
  selectedAllergyList.value = [];
};

/** 해당 위치 스크롤 이동 */
const setMoveTargetPosition = (id: string) => {
  const container = document.querySelector('.default_layout_contents');
  const target = document.getElementById(`${id}`)?.offsetTop;

  if (container && target) {
    container.scrollTo({
      top: target - 150,
      behavior: 'smooth',
    });
  }
};

const getValueName = (value: string) => (value === 'Y' ? '필수' : '선택');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getValueLength = (value: any[]) => value.length !== 0;

/** 스크롤 상단 이동 */
const scrollToTop = () => {
  document.getElementById('scroll-top')?.scrollIntoView({ behavior: 'smooth' });
};

/** 티오더 1 옵션 그룹 리스트 리셋 */
const resetOrderOneOptionList = () => {
  orderOneOptionGroupTabsIndex.value = 0;
  orderOneOptionGroupList.value = [];
};

/** 티오더 2 옵션 그룹 리스트 리셋 */
const resetOrderTwoOptionList = () => {
  orderTwoOptionGroupTabsIndex.value = 0;
  orderTwoOptionGroupList.value = [];
};

const previewImageState = ref(false);
const previewImage = ref('');

const openPreviewImage = (url: string) => {
  if (!url) {
    ElMessage({
      type: 'error',
      message: '이미지가 없습니다.',
    });
    return;
  }

  previewImage.value = url;
  previewImageState.value = true;
};

const onClickAllergyImageIcon = (event: Event, imageUrl: string) => {
  event.preventDefault();
  openPreviewImage(imageUrl);
};

// 선택 가능한 수량 개수
const getQtyCount = (
  qty: responseOptionGroupListType | responseSetGroupListType,
) => {
  const max = qty.max_limit_qty;
  const min = qty.min_limit_qty;

  if (max === 0) return `${min}개 이상`;
  if (max === min) return `${max}개`;
  return `${min} ~ ${max}개`;
};

const displayUnitPrice = (targetValue: number | string) =>
  Number(targetValue) ? Number(targetValue).toLocaleString() : '0';

// v-for 방어 코드
const getBasicListDataKey = (
  opt: productDetailInfoDataOptionPlatformType,
  index: number,
) => (opt ? opt.group_num : `basic ${index}`);
const getOptionListDataKey = (
  opt: responseOptionGroupListType,
  index: number,
) => (opt ? opt.parents_option_group_no : `option ${index}`);

// 동적 style
const getDetailInfoCardStyle = () => ({
  'goods-detail-info-card-wrap': true,
  'goods-detail-info-card-wrap-long': isStoreApi2.value && isCustomTheme.value,
});

onMounted(async () => {
  await getProductDetailInfo();
  await getChildCategoryList();

  if (isStoreApi2.value) {
    await postOrderTwoOptionGroupList();
  }

  if (orderTwoOptionGroupList.value.length !== 0) {
    await postOrderTwoOptionMenuList(0);
  }
});
</script>

<template>
  <ArrangeProductModal
    v-if="flag.arrangeProduct"
    :reloadBackInfo="getProductDetailInfo"
    :selectedFirstCategoryCode="selectedSCategoryCodeForModal.first"
    :selectedFirstCategoryName="arrangeCategoryNameProp.firstCategoryName"
    :selectedSecondCategoryCode="selectedSCategoryCodeForModal.second"
    :selectedSecondCategoryName="arrangeCategoryNameProp.secondCategoryName"
  />
  <div id="scroll-top"></div>
  <BreadcrumbHeader :propsHeader="goodsDetailSettingInCategoryHeader" />
  <el-tag class="mt-5">
    단일 상품에 대한 설정을 할 수 있습니다. (상품 이미지, 상품정보, 옵션 등)
  </el-tag>
  <StoreNameBox />
  <!-- 이미지 미리보기 dialog -->
  <el-dialog
    v-model="previewImageState"
    top="20vh"
    width="30%"
  >
    <el-row
      align="middle"
      justify="center"
    >
      <el-image
        :src="previewImage"
        fit="contain"
      />
    </el-row>
  </el-dialog>
  <LanguageTranslateModal
    v-if="flag.languageTranslate"
    :requestProductDetail="getProductDetailInfo"
  />
  <AddOrderOneOptionGroupModal
    v-if="flag.addOrderOneOptionGroup"
    :productInfo="productPropsData"
    :request="getProductDetailInfo"
  />
  <AddOrderTwoOptionGroupModal
    v-if="flag.addOrderTwoOptionGroup"
    :optionReset="resetOrderTwoOptionList"
    :productInfo="productPropsData"
    :request="postOrderTwoOptionGroupList"
    :requestItem="(index: number) => postOrderTwoOptionMenuList(index)"
  />
  <DeleteOptionGroupModal
    v-if="flag.deleteOptionGroup"
    :isStoreApi2="isStoreApi2"
    :optionReset="resetOrderTwoOptionList"
    :productInfo="productPropsData"
    :requestBasic="getProductDetailInfo"
    :requestOption="postOrderTwoOptionGroupList"
    :requestOptionMenu="(index: number) => postOrderTwoOptionMenuList(index)"
  />
  <PlatformImportOptionGroupModal
    v-if="flag.importOptionGroup"
    :isStoreApi2="isStoreApi2"
    :productInfo="productPropsData"
    :requestDataList="postOptionGroupList"
    :type="importOptionType"
  />
  <PlatformUpdateOrderOneOptionMenuModal
    v-if="flag.updateOrderOneOptionMenu"
    :optionReset="resetOrderOneOptionList"
    :options="editOrderOneOptionTargetData"
    :productInfo="productPropsData"
    :request="getProductDetailInfo"
  />
  <PlatformUpdateOrderTwoOptionMenuModal
    v-if="flag.updateOrderTwoOptionMenu"
    :optionReset="resetOrderTwoOptionList"
    :options="editOrderTwoOptionTargetData"
    :productInfo="productPropsData"
    :request="postOrderTwoOptionGroupList"
    :requestItem="(index: number) => postOrderTwoOptionMenuList(index)"
  />
  <ArrangeOrderOneOptionGroupModal
    v-if="flag.arrangeOrderOneOptionGroup"
    :productInfo="productPropsData"
    :request="getProductDetailInfo"
  />
  <ArrangeOrderTwoOptionGroupModal
    v-if="flag.arrangeOrderTwoOptionGroup"
    :optionReset="resetOrderTwoOptionList"
    :productInfo="productPropsData"
    :requestOption="postOrderTwoOptionGroupList"
  />
  <el-affix
    :offset="100"
    class="mb-10"
  >
    <div class="header-button flex">
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('tablet-info')"
      >
        주문 태블릿 정보
      </el-button>
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('pos-info')"
      >
        포스 정보
      </el-button>
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('category-setting')"
      >
        분류 정보 ㆍ 직원 호출 서비스 상품
      </el-button>
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('sticker-setting')"
      >
        스티커 설정
      </el-button>
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('description-setting')"
      >
        <span v-if="isStoreApi2"> 상세 설명 ㆍ 알레르기 설정 </span>
        <span v-else> 상세 설명 설정 </span>
      </el-button>
      <el-button
        class="flex-1"
        size="large"
        @click="setMoveTargetPosition('goods-option')"
      >
        상품 옵션
      </el-button>
    </div>
  </el-affix>
  <el-row
    id="tablet-info"
    align="middle"
    class="mb-10 title-text"
  >
    <span class="ml-10"> 주문 태블릿 정보 </span>
  </el-row>
  <el-row
    :gutter="10"
    class="mb-20"
  >
    <el-col :span="7">
      <el-card
        :class="getDetailInfoCardStyle()"
        class="width-100"
        shadow="never"
      >
        <div class="width-100 flex image-card-wrapper">
          <div class="width-100 flex flex-1 product-image-wrapper">
            <el-upload
              v-loading.fullscreen.lock="fullscreenLoading"
              :auto-upload="false"
              :disabled="isGoodPosStop"
              :on-change="(response: any) => changeProductImage(response)"
              :show-file-list="false"
              class="product-image-uploader"
              drag
            >
              <el-row
                align="middle"
                class="width-100 height-100"
                justify="center"
              >
                <el-icon
                  v-if="productDetailData.goodImage"
                  class="width-100 image-zoomin-button"
                  @click="openPreviewImage(productDetailData.goodImage)"
                >
                  <ZoomIn />
                </el-icon>
                <div v-if="productDetailData.goodImage">
                  <el-image
                    :src="productDetailData.goodImage"
                    class="goods-image width-100"
                    fit="contain"
                  />
                </div>
                <el-icon
                  v-else
                  class="avatar-uploader-icon"
                >
                  <Plus />
                </el-icon>
              </el-row>
            </el-upload>
            <el-row
              v-if="isOn(productDetailData.goodPosStopUse)"
              class="width-100 goods-pos-stop-dim"
              justify="center"
            >
              포스에서 삭제된 상품입니다.
            </el-row>
          </div>
          <el-row>
            <p class="upload-image-desc">
              * 이미지를 클릭 또는 드래그로 변경할 수 있습니다.
            </p>
            <p class="upload-image-desc">
              * 이미지 파일은 최대 2MB까지 업로드 할 수 있습니다.
            </p>
            <p class="upload-image-desc">
              * 이미지 파일 포멧은 GIF, PNG, JPG, JPEG 만 가능합니다.
            </p>
          </el-row>
        </div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card
        class="height-100"
        shadow="never"
      >
        <el-row
          class="width-100 mb-30"
          justify="space-between"
        >
          <el-col :span="12">
            <span> 태블릿 노출 상품명 </span>
            <el-row
              align="middle"
              class="mt-10"
            >
              <el-input
                v-model="productDetailData.goodDpName"
                class="tablet-goods-name-input mr-10"
              />
            </el-row>
          </el-col>
          <el-col :span="10">
            <div>상품 코드</div>
            <el-select
              v-model="productDetailData.goodCode"
              class="tablet-goods-name-input mt-10"
            >
              <el-option
                v-for="code in customCodeData"
                :key="code.code"
                :label="code.text"
                :value="code.code"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-row
          class="mb-30"
          justify="space-between"
        >
          <el-col :span="12">
            <span class="mr-5"> 상품 판매 상태 </span>
            <span>
              <el-tag
                v-if="
                  productDetailData.goodUse === 'N' &&
                  productDetailData.goodSale === 'N'
                "
              >
                판매중
              </el-tag>
              <el-tag
                v-if="
                  productDetailData.goodUse === 'Y' &&
                  productDetailData.goodSale === 'N'
                "
                type="danger"
              >
                판매중지 (숨김)
              </el-tag>
              <el-tag
                v-if="
                  productDetailData.goodUse === 'N' &&
                  productDetailData.goodSale === 'Y'
                "
                type="warning"
              >
                품절 (보임)
              </el-tag>
              <el-tag
                v-if="
                  productDetailData.goodUse === 'Y' &&
                  productDetailData.goodSale === 'Y'
                "
                type="warning"
              >
                품절 (숨김)
              </el-tag>
            </span>
            <el-checkbox
              v-model="productDetailData.goodUse"
              class="ml-20"
              false-label="N"
              label="판매중지"
              size="large"
              true-label="Y"
            />
            <el-checkbox
              v-model="productDetailData.goodSale"
              false-label="N"
              label="품절"
              size="large"
              true-label="Y"
            />
          </el-col>
          <el-col :span="10">
            <span class="mr-10"> 주문서 표기 </span>
            <el-radio-group v-model="productDetailData.nonShowCart">
              <el-radio label="N"> 표기</el-radio>
              <el-radio label="Y"> 표기 안함</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        <el-row
          align="middle"
          class="mb-30"
          justify="space-between"
        >
          <el-col :span="10">
            <el-row>
              <span class="mr-5 mb-5"> 상품 가격 </span>
              <span class="guide-text">
                상품 가격은 POS에서 수정 가능합니다.
              </span>
            </el-row>
            <el-input
              v-model="productDetailData.goodPrice"
              :formatter="(price: string) => displayUnitPrice(price)"
              class="mt-10"
              disabled
            />
          </el-col>
        </el-row>
        <el-row
          v-if="isStoreApi2 && isCustomTheme"
          class="goods-price-box"
        >
          <el-row>
            할인가 설정
            <el-text
              class="goods-price-discount-info"
              size="small"
            >
              <el-icon>
                <WarningFilled class="essential-star" />
              </el-icon>
              할인 전 가격을 입력해야합니다.
            </el-text>
          </el-row>
          <el-row class="width-100 goods-price-contents-row">
            <el-col :span="10">
              <el-radio-group
                v-model="productDetailData.goodRetailPriceUse"
                class="mt-10"
              >
                <el-radio label="N"> 미설정</el-radio>
                <el-radio label="Y"> 설정</el-radio>
              </el-radio-group>
            </el-col>
            <el-col :span="13">
              <span>할인 전 가격</span>
              <el-input
                v-model="productDetailData.goodRetailPrice"
                :disabled="productDetailData.goodRetailPriceUse === 'N'"
                :formatter="(price: string) => displayUnitPrice(price)"
                :parser="(price: string) => price.replace(/,/g, '')"
                class="goods-price-input ml-10"
                maxlength="20"
              />
            </el-col>
          </el-row>
          <el-row class="width-100 mt-10 goods-price-contents-row">
            <el-col :span="12">
              판매가
              <el-text
                class="goods-price-discount-info"
                size="small"
              >
                상품 가격은 POS에서 수정 가능합니다.
              </el-text>
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="productDetailData.goodPrice"
                :formatter="(price: string) => displayUnitPrice(price)"
                class="goods-price-input ml-10"
                disabled
              />
            </el-col>
          </el-row>
          <el-divider class="goods-price-contents-divider" />
          <el-row class="width-100 mt-10 goods-price-contents-row">
            <span>태블릿 노출 형태</span>
            <el-row class="goods-price-display ml-20">
              <el-text
                v-if="productDetailData.goodRetailPriceUse === 'Y'"
                class="goods-price-display-number"
                tag="del"
              >
                {{ displayUnitPrice(productDetailData.goodRetailPrice) }}
              </el-text>
              <el-text
                class="goods-price-display-number goods-sell-price"
                tag="b"
              >
                {{ displayUnitPrice(productDetailData.goodPrice) }} 원
              </el-text>
            </el-row>
            <el-text
              v-if="productDetailData.goodRetailPriceUse === 'Y'"
              type="danger"
            >
              <el-icon class="ml-10">
                <WarningFilled class="essential-star" />
              </el-icon>
              {{
                displayUnitPrice(
                  productDetailData.goodRetailPrice -
                    productDetailData.goodPrice,
                )
              }}원 할인
            </el-text>
          </el-row>
        </el-row>
      </el-card>
    </el-col>
    <el-col :span="5">
      <el-card
        :class="getDetailInfoCardStyle()"
        shadow="never"
      >
        <el-row>
          <el-col class="mb-5"> 최대 주문 수량</el-col>
          <el-col class="guide-text">
            설정 시 최대 주문 가능 수량 제한 됨
          </el-col>
          <el-col class="guide-text mb-20"> 제한 없을 시 "0" 으로 설정</el-col>
          <el-input-number
            v-model="productDetailData.goodsMaxOrderQty"
            :min="0"
          />
        </el-row>
        <el-row>
          <el-col class="mb-5"> 최소 주문 수량</el-col>
          <el-col class="guide-text">
            설정 시 최소 주문 가능 수량 제한 됨
          </el-col>
          <el-col class="guide-text mb-20"> 제한 없을 시 "0" 으로 설정</el-col>
          <el-input-number
            v-model="productDetailData.goodsMinOrderQty"
            :min="0"
          />
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <el-row
    id="pos-info"
    align="middle"
    class="mb-10 title-text"
  >
    <span class="ml-10"> 포스 정보 </span>
  </el-row>
  <el-card
    class="mb-20"
    shadow="never"
  >
    <el-row
      align="middle"
      justify="space-between"
    >
      <div class="flex-1 mr-20">
        <el-row align="middle">
          <span class="mr-10"> 포스 상품명 </span>
          <span class="pos-name-guide-text">
            상품 이름은 POS에서 수정 가능합니다.
          </span>
        </el-row>
        <el-input
          v-model="productDetailData.goodName"
          class="mt-10 mb-10"
          disabled
        />
      </div>
      <el-row
        align="middle"
        class="flex-1 mr-20"
      >
        <span> 포스 코드 </span>
        <el-input
          v-model="productDetailData.posGoodCode"
          class="mt-10 mb-10"
          disabled
        />
      </el-row>
      <el-row
        align="top"
        class="pos-delete-state flex-1"
      >
        <el-row> 포스 삭제 여부</el-row>
        <el-radio
          v-model="productDetailData.goodPosStopUse"
          :label="'Y'"
          class="mt-5 mb-5"
          disabled
        >
          삭제 처리 완료
        </el-radio>
      </el-row>
    </el-row>
  </el-card>
  <el-row
    id="category-setting"
    align="middle"
    class="mb-10 title-text"
  >
    <span class="ml-10"> 분류 정보 ㆍ 직원 호출 서비스 상품 </span>
  </el-row>
  <el-card
    class="mb-20"
    shadow="never"
  >
    <el-transfer
      v-model="selectedCategory"
      :data="childCategoryListData"
      :props="{
        key: 'childCode',
        label: 'childName',
      }"
      :titles="['전체 분류', '선택 분류']"
      class="detail-setting-transfer"
      @change="onChangeCategoryInfoTransfer"
      @right-check-change="onCheckRightTransfer"
    >
      <template #default="{ option: option2 }">
        <el-row align="middle">
          <span class="detail-setting-transfer-first">
            {{ convertToEllipsis(option2.bigName, 8) }}
          </span>
          <span>
            <span class="detail-setting-transfer-second ml-10">
              {{ convertToEllipsis(option2.childName, 8) }}
            </span>
            <el-icon
              v-if="option2.top === 'Y'"
              color="#FF0000"
            >
              <LocationFilled />
            </el-icon>
          </span>
        </el-row>
      </template>
    </el-transfer>
    <el-row class="mt-20">
      <el-col class="mb-10"> 상품 순서</el-col>
      <el-col>
        <el-table
          :data="productDetailData.goodCategoryList"
          border
          class="product-order-table"
          height="185"
          highlight-current-row
          scrollbar-always-on
        >
          <el-table-column
            header-align="center"
            label="분류명"
          >
            <template #default="{ row }">
              <el-row justify="space-between">
                <span>
                  {{ convertedCategoryName(row.categoryName) }} >
                  {{ convertedCategoryName(row.childCategoryName) }}
                </span>
                <el-tooltip
                  v-if="row.top === 'Y'"
                  content="해당 분류에서 상품이 최상단 고정 되어있습니다."
                  effect="dark"
                  placement="top"
                >
                  <el-icon color="#FF0000">
                    <LocationFilled />
                  </el-icon>
                </el-tooltip>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="상품 순서 변경"
            width="150"
          >
            <template #default="{ row }">
              <el-button
                plain
                type="warning"
                @click="openArrangeProductModal(row)"
              >
                상품 순서 변경
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
  <el-row
    id="sticker-setting"
    align="middle"
    class="mb-10 title-text"
  >
    <span class="ml-10"> 스티커 설정 </span>
  </el-row>
  <el-card
    class="mb-20"
    shadow="never"
  >
    <el-row
      :gutter="20"
      align="middle"
    >
      <el-col :span="2">
        <el-checkbox
          v-model="productDetailData.goodTypeBest"
          false-label="N"
          true-label="Y"
        >
          베스트
        </el-checkbox>
      </el-col>
      <el-col :span="2">
        <el-checkbox
          v-model="productDetailData.goodTypeNew"
          false-label="N"
          true-label="Y"
        >
          신규
        </el-checkbox>
      </el-col>
      <el-col
        v-if="!(isStoreApi2 && isCustomTheme)"
        :span="2"
      >
        <el-checkbox
          v-model="productDetailData.goodTypeHit"
          false-label="N"
          true-label="Y"
        >
          인기
        </el-checkbox>
      </el-col>
      <el-col
        v-if="!(isStoreApi2 && isCustomTheme)"
        :span="2"
      >
        <el-checkbox
          v-model="productDetailData.goodTypeMd"
          false-label="N"
          true-label="Y"
        >
          추천
        </el-checkbox>
      </el-col>
      <el-col
        v-if="!(isStoreApi2 && isCustomTheme)"
        :span="2"
      >
        <el-checkbox
          v-model="productDetailData.goodTypeSale"
          false-label="N"
          true-label="Y"
        >
          할인
        </el-checkbox>
      </el-col>
      <el-col :span="2">
        <el-checkbox
          v-model="productDetailData.goodTypeSpicy"
          false-label="N"
          true-label="Y"
          @change="onSpicyChange"
        >
          매운
        </el-checkbox>
      </el-col>
      <el-col
        :span="12"
        class="mb-10"
      >
        <el-tag
          :type="productDetailData.goodTypeSpicy === 'Y' ? '' : 'info'"
          round
          size="small"
        >
          맵기 조절
        </el-tag>
        <el-slider
          v-model="productDetailData.goodTypeSpicyRate"
          :disabled="productDetailData.goodTypeSpicy !== 'Y'"
          :marks="spicyRateMarks"
          :max="10"
          :min="0"
          :show-stops="true"
          class="ml-10"
          size="small"
        />
      </el-col>
    </el-row>
  </el-card>
  <el-row
    id="description-setting"
    align="middle"
    class="mb-10 title-text"
  >
    <span
      v-if="isStoreApi2"
      class="ml-10"
    >
      상세 설명 ㆍ 알레르기 설정
    </span>
    <span
      v-else
      class="ml-10"
    >
      상세 설명 설정
    </span>
  </el-row>
  <el-card
    v-if="!isStoreApi2"
    class="mb-20"
    shadow="never"
  >
    <el-row>
      <el-col :span="3">
        <el-radio-group
          v-model="productDetailData.goodDetailOpen"
          class="radio-group-direction-column"
        >
          <el-radio label="Y"> 상세 설명 보이기</el-radio>
          <el-radio label="N"> 상세 설명 숨기기</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="10">
        <el-row>
          <span>상세 설명 내용 입력</span>
          <el-input
            v-model="productDetailData.goodHtml"
            :disabled="isDisabled(productDetailData.goodDetailOpen)"
            :rows="6"
            class="good-html-input mt-10"
            placeholder="상품 상세 설명을 작성해주세요."
            type="textarea"
          />
        </el-row>
      </el-col>
    </el-row>
  </el-card>
  <el-card
    v-else
    class="mb-20"
    shadow="never"
  >
    <el-tabs
      v-model="activeTabName"
      type="card"
    >
      <el-tab-pane
        label="상세설명"
        name="description"
      >
        <el-row class="mr-10 ml-10">
          <el-col :span="3">
            <el-radio-group
              v-model="productDetailData.goodDetailOpen"
              class="radio-group-direction-column"
            >
              <el-radio label="Y"> 상세 설명 보이기</el-radio>
              <el-radio label="N"> 상세 설명 숨기기</el-radio>
            </el-radio-group>
          </el-col>
          <el-col
            :span="10"
            class="ml-10"
          >
            <span>상세 설명 내용 입력</span>
            <el-input
              v-model="productDetailData.goodHtml"
              :disabled="isDisabled(productDetailData.goodDetailOpen)"
              :rows="6"
              class="good-html-input mt-10"
              placeholder="상품 상세 설명을 작성해주세요."
              type="textarea"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        class="mr-10"
        label="알레르기"
        name="allergy"
      >
        <el-row class="mr-10 ml-10">
          <el-col :span="3">
            <el-radio-group
              v-model="productDetailData.platform_store_good_allergy_use"
              class="radio-group-direction-column"
            >
              <el-radio label="Y"> 알레르기 보이기</el-radio>
              <el-radio label="N"> 알레르기 숨기기</el-radio>
            </el-radio-group>
          </el-col>
          <el-col
            :span="20"
            class="ml-10"
          >
            <el-row
              class="mb-10"
              justify="space-between"
            >
              <el-row class="allergy-top-description">
                <el-text size="large">
                  알레르기 선택 ({{ selectedAllergyList.length }}개 선택)
                </el-text>
                <el-text
                  size="small"
                  type="danger"
                >
                  * 최대 15개 선택 가능합니다.
                </el-text>
              </el-row>
              <el-button
                :icon="RefreshRight"
                @click="resetSelectedAllergyList"
              >
                전체 선택 초기화
              </el-button>
            </el-row>
            <el-checkbox-group
              v-model="selectedAllergyList"
              class="allergy-select-box-list"
            >
              <span
                v-for="allergyInfo in productDetailData.allergy_list"
                :key="allergyInfo.id"
                class="allergy-select-box"
              >
                <el-checkbox
                  :disabled="
                    !isOn(productDetailData.platform_store_good_allergy_use)
                  "
                  :label="allergyInfo.id"
                  border
                >
                  {{ allergyInfo.allergy_name }}
                  <el-icon
                    v-if="allergyInfo.allergy_view_type === 'image'"
                    :size="20"
                    class="ml-10 allergy-image-icon"
                    @click="
                      (event: Event) =>
                        onClickAllergyImageIcon(
                          event,
                          allergyInfo.allergy_image_url,
                        )
                    "
                  >
                    <ZoomIn />
                  </el-icon>
                  <el-tag
                    v-else
                    class="allergy-image-icon"
                  >
                    텍스트형
                  </el-tag>
                </el-checkbox>
              </span>
            </el-checkbox-group>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
  <el-row
    id="goods-option"
    align="middle"
    class="mb-10 title-text"
  >
    <span class="ml-10"> 상품 옵션 설정 </span>
  </el-row>
  <el-row
    :gutter="10"
    class="mb-20"
  >
    <el-col :span="10">
      <el-card
        class="option-use-state-card"
        shadow="never"
      >
        <div
          v-if="!isStoreApi2"
          class="detail-info-card-option-setting ml-10"
        >
          <div class="detail-info-card-option-desc">
            <span> 옵션 사용 여부 </span>
            <span class="guide-text mt-5">
              해당 상품의 옵션을 사용 여부를 선택합니다.
            </span>
          </div>
          <el-row class="mt-10">
            <el-radio-group v-model="productDetailData.goodsOptionUse">
              <el-radio label="Y"> 옵션 사용</el-radio>
              <el-radio label="N"> 옵션 미사용</el-radio>
            </el-radio-group>
          </el-row>
          <el-divider />
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹 생성 </span>
            <span class="guide-text mt-5"> 단일 옵션 그룹을 추가합니다. </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="openModal(ADD_ORDER_ONE_OPTION_GROUP)"
          >
            옵션 그룹 생성
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹 삭제 </span>
            <span class="guide-text mt-5"> 단일 옵션 그룹을 삭제합니다. </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="openModal(DELETE_OPTION_GROUP)"
          >
            옵션 그룹 삭제
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 상품에 등록된 옵션 그룹 전체삭제 </span>
            <span class="guide-text mt-5">
              상품의 모든 옵션들을 삭제합니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="danger"
            @click="postDeleteAllBasicOption"
          >
            옵션 그룹 전체삭제
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 다른 상품의 옵션 그룹 덮어쓰기 </span>
            <span class="guide-text mt-5">
              기존 옵션 그룹은 삭제되고 다른 상품에서 사용하는 옵션 그룹을
              복사하여 덮어씁니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="() => openImportOptionModal('remove')"
          >
            옵션 그룹 덮어쓰기
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 다른 상품의 옵션 그룹 추가하기 </span>
            <span class="guide-text mt-5">
              기존 옵션 그룹 그대로 사용하며 다른 상품에서 사용하는 옵션 그룹을
              가져와 추가합니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="() => openImportOptionModal('add')"
          >
            옵션 그룹 추가하기
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹의 순서 변경하기 </span>
            <span class="guide-text mt-5">
              옵션 그룹의 순서를 변경합니다.
            </span>
          </div>
          <el-button
            class="mt-20"
            plain
            type="primary"
            @click="openModal(ARRANGE_ORDER_ONE_OPTION_GROUP)"
          >
            옵션 그룹 순서변경
          </el-button>
        </div>
        <div
          v-else
          class="detail-info-card-option-setting ml-10"
        >
          <div class="detail-info-card-option-desc">
            <span> 옵션 사용 여부 </span>
            <span class="guide-text mt-5">
              해당 상품의 옵션을 사용 여부를 선택합니다.
            </span>
          </div>
          <el-row class="mt-10">
            <el-radio-group v-model="productDetailData.goodsOptionUse">
              <el-radio label="Y"> 옵션 사용</el-radio>
              <el-radio label="N"> 옵션 미사용</el-radio>
            </el-radio-group>
          </el-row>
          <el-divider />
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹 생성 </span>
            <span class="guide-text mt-5"> 단일 옵션 그룹을 생성합니다. </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="openModal(ADD_ORDER_TWO_OPTION_GROUP)"
          >
            옵션 그룹 생성
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹 삭제 </span>
            <span class="guide-text mt-5"> 단일 옵션 그룹을 삭제합니다. </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="openModal(DELETE_OPTION_GROUP)"
          >
            옵션 그룹 삭제
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 상품에 등록된 옵션 그룹 전체삭제 </span>
            <span class="guide-text mt-5">
              상품의 모든 옵션들을 삭제합니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="danger"
            @click="postDeleteAllOption"
          >
            옵션 그룹 전체삭제
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 다른 상품의 옵션 그룹 덮어쓰기 </span>
            <span class="guide-text mt-5">
              기존 옵션 그룹은 삭제되고 다른 상품에서 사용하는 옵션 그룹을
              복사하여 덮어씁니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="() => openImportOptionModal('remove')"
          >
            옵션 그룹 덮어쓰기
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 다른 상품의 옵션 그룹 추가하기 </span>
            <span class="guide-text mt-5">
              기존 옵션 그룹 그대로 사용하며 다른 상품에서 사용하는 옵션 그룹을
              가져와 추가합니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="() => openImportOptionModal('add')"
          >
            옵션 그룹 추가하기
          </el-button>
          <div class="detail-info-card-option-desc">
            <span> 옵션 그룹의 순서 변경하기 </span>
            <span class="guide-text mt-5">
              옵션 그룹의 순서를 변경합니다.
            </span>
          </div>
          <el-button
            class="mt-20 mb-20"
            plain
            type="primary"
            @click="openModal(ARRANGE_ORDER_TWO_OPTION_GROUP)"
          >
            옵션 그룹 순서변경
          </el-button>
        </div>
      </el-card>
    </el-col>
    <el-col :span="14">
      <el-card
        v-loading="optionLoading"
        class="height-100"
        shadow="never"
      >
        <template #header>
          <el-row
            align="middle"
            justify="space-between"
          >
            <span> 옵션 정보 </span>
          </el-row>
        </template>
        <el-tabs
          v-if="getValueLength(orderOneOptionGroupList) && !isStoreApi2"
          v-model="orderOneOptionGroupTabsIndex"
          class="option-list-tab-container"
          type="border-card"
        >
          <el-tab-pane
            v-for="(target, index) in orderOneOptionGroupList"
            :key="getBasicListDataKey(target, index)"
            :label="target.name"
            :name="target.index"
          >
            <el-descriptions
              :column="3"
              border
              class="mb-20 mt-20"
              direction="vertical"
            >
              <el-descriptions-item
                align="center"
                label="옵션 그룹 이름"
                label-align="center"
              >
                {{ target.name }}
              </el-descriptions-item>
              <el-descriptions-item
                align="center"
                label="옵션 그룹 조건"
                label-align="center"
              >
                {{ getValueName(target.require) }}
              </el-descriptions-item>
              <el-descriptions-item
                align="center"
                label="선택 가능 개수"
                label-align="center"
              >
                {{ target.limit }}개
              </el-descriptions-item>
            </el-descriptions>
            <el-row
              align="middle"
              class="mb-20"
              justify="space-between"
            >
              <span>선택된 옵션 상품</span>
              <el-button
                type="primary"
                @click="openEditOrderOneOptionModal(target)"
              >
                옵션 그룹 변경
              </el-button>
            </el-row>
            <div class="guide-text mb-5">
              * 상하 드래그로 순서 변경을 할 수 있습니다.
            </div>
            <el-scrollbar height="500px">
              <draggable
                v-if="getValueLength(target.option_item)"
                v-model="target.option_item"
                item-key="option"
                @change="setSortOptionData(target)"
              >
                <template #item="{ element }">
                  <div class="option-list-item">
                    <el-upload
                      v-loading.fullscreen.lock="fullscreenLoading"
                      :auto-upload="false"
                      :on-change="
                        (response: any) => setProductImage(response, element)
                      "
                      :show-file-list="false"
                      class="option-list-upload"
                      drag
                    >
                      <el-image
                        v-if="element.platform_store_good_option_img"
                        :src="element.platform_store_good_option_img"
                        class="option-list-image"
                        fit="cover"
                      >
                        <template #error>
                          <el-icon
                            class="option-list-image"
                            size="30px"
                          >
                            <Picture />
                          </el-icon>
                        </template>
                      </el-image>
                      <div
                        v-else
                        class="option-list-empty"
                      >
                        <el-icon>
                          <Plus />
                        </el-icon>
                      </div>
                    </el-upload>
                    <div class="option-list-info">
                      <div class="info-row">
                        <span>
                          {{ element.platform_store_good_option_name }}
                        </span>
                        <span>
                          {{
                            element.platform_store_good_option_price?.toLocaleString()
                          }}원
                        </span>
                      </div>
                      <div class="info-row">
                        <span>{{
                          element.platform_store_good_option_code
                        }}</span>
                        <span>
                          최대 선택 개수 :
                          {{ element.platform_store_good_option_select_cnt }}
                        </span>
                      </div>
                    </div>
                    <div class="option-radio-wrapper">
                      <el-switch
                        v-model="element.platform_store_good_option_use"
                        active-text="판매중"
                        active-value="Y"
                        class="ml-10"
                        inactive-text="중지"
                        inactive-value="N"
                        style="
                          --el-switch-on-color: #13ce66;
                          --el-switch-off-color: #f56c6c;
                        "
                        @click="setSoldOutSwitch(element)"
                      />
                      <el-switch
                        v-model="element.platform_store_good_option_isSale"
                        active-text="판매중"
                        active-value="N"
                        class="ml-10"
                        inactive-text="품절"
                        inactive-value="Y"
                        style="
                          --el-switch-on-color: #13ce66;
                          --el-switch-off-color: #e6a23c;
                        "
                        @click="setSoldOutSwitch(element)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
              <div
                v-else
                class="option-group-item-list-empty"
              >
                옵션 상품이 없습니다.
              </div>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
        <el-tabs
          v-if="getValueLength(orderTwoOptionGroupList) && isStoreApi2"
          v-model="orderTwoOptionGroupTabsIndex"
          class="option-list-tab-container"
          type="border-card"
          @tab-change="(index: number) => postOrderTwoOptionMenuList(index)"
        >
          <el-tab-pane
            v-for="(optionInfo, index) in orderTwoOptionGroupList"
            :key="getOptionListDataKey(optionInfo, index)"
            :label="optionInfo.option_group_name"
            :name="optionInfo.index"
          >
            <div class="option-list-tab-desc-grid mt-20 mb-20">
              <el-descriptions
                :column="3"
                border
                direction="vertical"
              >
                <el-descriptions-item
                  align="center"
                  label="옵션 그룹 이름"
                  label-align="center"
                >
                  {{ optionInfo.option_group_name }}
                </el-descriptions-item>
                <el-descriptions-item
                  align="center"
                  label="옵션 그룹 조건"
                  label-align="center"
                >
                  {{ getValueName(optionInfo.option_require) }}
                </el-descriptions-item>
                <el-descriptions-item
                  align="center"
                  label="선택 가능 개수"
                  label-align="center"
                >
                  {{ getQtyCount(optionInfo) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <el-row
              align="middle"
              class="mb-20"
              justify="space-between"
            >
              <span>선택된 옵션 상품</span>
              <el-button
                type="primary"
                @click="openEditOrderTwoOptionModal(optionInfo)"
              >
                옵션 그룹 변경
              </el-button>
            </el-row>
            <div class="guide-text mb-5">
              * 상하 드래그로 순서 변경을 할 수 있습니다.
            </div>
            <el-scrollbar height="300px">
              <draggable
                v-if="getValueLength(orderTwoOptionMenuList)"
                v-model="orderTwoOptionMenuList"
                item-key="option"
                @change="postSortOrderTwoOptionMenu"
              >
                <template #item="{ element }">
                  <div class="option-list-item">
                    <el-upload
                      v-loading.fullscreen.lock="fullscreenLoading"
                      :auto-upload="false"
                      :on-change="
                        (response: any) =>
                          postOptionMenuUpdate(element, response)
                      "
                      :show-file-list="false"
                      class="option-list-upload"
                      drag
                    >
                      <el-image
                        v-if="element.platform_store_good_option_img"
                        :src="element.platform_store_good_option_img"
                        class="option-list-image"
                        fit="cover"
                      >
                        <template #error>
                          <el-icon
                            class="option-list-image"
                            size="20px"
                          >
                            <Picture />
                          </el-icon>
                        </template>
                      </el-image>
                      <div
                        v-else
                        class="option-list-empty"
                      >
                        <el-icon>
                          <Plus />
                        </el-icon>
                      </div>
                    </el-upload>
                    <div class="option-list-info">
                      <div class="info-row">
                        <span>
                          {{ element.platform_store_good_option_name }}
                        </span>
                        <span>
                          {{
                            element.platform_store_good_option_price?.toLocaleString()
                          }}원
                        </span>
                      </div>
                      <div class="info-row">
                        <el-row align="middle">
                          {{ element.platform_store_good_option_code }}
                        </el-row>
                        <span>
                          최대 선택 개수 :
                          {{ element.platform_store_good_option_select_cnt }}
                        </span>
                      </div>
                    </div>
                    <div class="option-radio-wrapper">
                      <el-switch
                        v-model="element.platform_store_good_option_use"
                        active-text="판매중"
                        active-value="Y"
                        class="ml-10"
                        inactive-text="중지"
                        inactive-value="N"
                        style="
                          --el-switch-on-color: #13ce66;
                          --el-switch-off-color: #f56c6c;
                        "
                        @click="postOptionMenuUpdate(element)"
                      />
                      <el-switch
                        v-model="element.platform_store_good_option_isSale"
                        active-text="판매중"
                        active-value="N"
                        class="ml-10"
                        inactive-text="품절"
                        inactive-value="Y"
                        style="
                          --el-switch-on-color: #13ce66;
                          --el-switch-off-color: #e6a23c;
                        "
                        @click="postOptionMenuUpdate(element)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
              <div
                v-else
                class="option-group-item-list-empty"
              >
                옵션 상품이 없습니다.
              </div>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
        <div
          v-if="
            (!getValueLength(orderOneOptionGroupList) && !isStoreApi2) ||
            (!getValueLength(orderTwoOptionGroupList) && isStoreApi2)
          "
          class="option-non-setting"
        >
          옵션 정보가 없습니다.
        </div>
      </el-card>
    </el-col>
    <div class="goods-detail-floating-button">
      <el-button
        plain
        size="large"
        @click="router.back()"
      >
        상품 목록으로 이동
      </el-button>
      <el-button
        :icon="Top"
        plain
        size="large"
        type="info"
        @click="scrollToTop"
      />
      <el-button
        size="large"
        type="danger"
        @click="saveGoodsDetail(productDetailData)"
      >
        변경 사항 저장
      </el-button>
    </div>
  </el-row>
</template>

<style lang="scss" scoped>
.image-card-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 20px;
}

.product-image-wrapper {
  position: relative;
  justify-content: center;
  max-height: 326px;

  .product-image-uploader {
    height: 100%;
    aspect-ratio: 1;

    :deep(.el-upload) {
      height: 100%;
    }

    :deep(.el-upload-dragger) {
      height: 100%;
      padding: 0;
    }

    :deep(.el-upload-dragger) {
      height: 100%;
    }

    .avatar-uploader-icon {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      font-size: 28px;
      color: #8c939d;
      text-align: center;
      border: 1px dashed #dcdfe6;
      border-radius: 5px;
    }
  }
}

.allergy-select-box-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.allergy-select-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  :deep(.el-checkbox) {
    flex: 1;
  }

  :deep(.el-checkbox__label) {
    display: flex;
    align-items: center;
  }
}

.allergy-image-icon {
  position: absolute;
  right: 8px;
  cursor: pointer;

  :deep(path) {
    fill: #000 !important;
  }
}

.product-order-table {
  width: 880px;
}

:deep(.el-transfer-panel) {
  width: 350px;
}

:deep(.el-slider) {
  width: 400px;
}

:deep(.el-slider__marks-text) {
  margin-top: 13px;
  font-size: 12px;
}

:deep(.el-slider__button) {
  width: 15px;
  height: 15px;
}

.no-use-lock-tag {
  width: 120px;
}

.height-100 {
  height: 100%;
}

.option-non-setting {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 18px;
  font-weight: bold;
}

.option-use-state-card {
  height: 100%;

  &:deep(.el-tabs__item) {
    padding: 0 15px 0 0;
  }
}

.detail-setting-transfer-first {
  font-size: 13px;
  color: #adafbc;
}

.detail-setting-transfer-second {
  font-size: 16px;
  font-weight: 700;
}

.goods-detail-info-card-wrap {
  height: 400px;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 90%;
  }

  .goods-detail-info-tabs {
    width: 100%;
  }

  .detail-setting-transfer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    &:deep(.el-transfer-panel) {
      width: 290px;
    }

    &:deep(.el-transfer-panel__body) {
      height: 380px;
    }

    &:deep(.el-transfer-panel__list) {
      height: 100%;
    }
  }

  .detail-info-card-option-setting {
    width: 100%;

    .detail-info-card-option-desc {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }

  .upload-image-desc {
    margin-bottom: 10px;
    font-size: 12px;
    color: #adafbc;
  }
}

.goods-detail-info-card-wrap-long {
  height: 460px;
}

.goods-image {
  height: 200px;
}

.goods-info-vertical-wrap {
  width: 100%;
  height: 100%;

  .goods-info-vertical-check-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;

    .goods-info-spicy-rate {
      font-size: 14px;
    }
  }

  :deep(.el-divider--horizontal) {
    margin: 15px 0;
  }
}

.display-name-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.option-price-exposure {
  align-items: center;
  width: 100%;

  .option-price-exposure-input {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.guide-text {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 15px;
  color: #a489fb;
}

.pos-name-guide-text {
  font-size: 12px;
  line-height: 15px;
  color: #a489fb;
}

.option-list-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: #f2eefe;
  border-radius: 5px;

  .option-list-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: space-around;
    width: 100%;
    padding: 0 10px;

    .info-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }

    .info-row-triple {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
    }
  }

  .option-radio-wrapper {
    display: flex;
    flex-direction: column;
    width: 250px;
  }

  > span {
    font-size: 15px;
    color: #525252;
  }

  .option-list-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 75.28px;

    &:deep(.el-upload-dragger) {
      padding: 0;
    }

    .option-list-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 75.28px;
    }

    .option-list-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 75.28px;
      border: 1px dashed #525252;
      border-radius: 5px;
    }
  }

  .option-list-image {
    position: static;
    width: 100px;
    height: 75.28px;
  }

  .option-list-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 75.28px;
    border: 1px dashed #525252;
    border-radius: 5px;
  }
}

.option-group-item-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 20px;
}

.option-list-tab-container {
  width: 100%;

  .option-list-tab-image {
    width: 172px;
    height: 130px;
    border-radius: 3px;
  }

  .option-list-tab-desc-grid {
    .option-list-tab-desc-title {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 49px;
      padding: 12px 15px;
      font-size: 14px;
      font-weight: 700;
      color: #000000;
      background-color: #f5f7fa;
      border: 1px solid #ebeef5;
    }

    .option-list-tab-desc-image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100% - 50px);
      overflow: initial;
      border-right: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
    }
  }
}

.goods-detail-floating-button {
  position: fixed;
  right: 50px;
  bottom: 50px;
  z-index: 10;
}

.header-button {
  :not(:last-child) {
    border-right: none;
  }

  &:deep(.el-button--large) {
    border-radius: 0;
  }

  &:deep(.el-button) {
    margin-left: 0;
  }
}

.title-text {
  border-left: 2px solid #000;
}

.lock-setting-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  &:deep(.el-radio) {
    margin-right: 5px;
  }
}

.lock-setting-row {
  padding: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.pos-delete-state {
  flex-direction: column;
}

.lock-detail-wrapper {
  padding: 5px;
  background-color: #f9f9f9;
  border: 1px solid #c6c6c6;
  border-radius: 4px;
}

.lock-state-detail {
  width: 100px;
}

.radio-group-direction-column {
  flex-direction: column;

  :deep(.el-radio) {
    margin: 0;
  }
}

.allergy-top-description {
  gap: 10px;
}

.tablet-goods-name-input {
  width: 100%;
}

.image-zoomin-button {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  padding: 5px 20px;
  cursor: pointer;
  border: 1px solid #aeb0b3;
  border-radius: 4px;

  &:hover {
    border-color: #000;
  }
}

.goods-pos-stop-dim {
  position: absolute;
  top: 0;
  z-index: 99;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  pointer-events: none;
  border-radius: 1px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.goods-price-box {
  padding: 10px;
  background-color: #f2eefe;
  border-radius: 5px;

  .goods-price-contents-divider {
    margin: 5px 0 !important;
  }

  .goods-price-discount-info {
    margin-left: 20px !important;
    color: #a489fb;
  }

  .goods-price-input {
    width: 200px;
  }

  .goods-price-contents-row {
    align-items: center;
  }

  .goods-price-display {
    padding: 5px;
    background-color: #fff;
  }

  .goods-price-display-number {
    min-width: 55px;
  }

  .goods-sell-price {
    margin: 0 5px !important;
  }
}
</style>
