<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  optionItemListType,
  productDataListChildGoodsType,
  productDataListChildType,
  productDataListType,
  productOptionListType,
  requestFirstCategoryListType,
  requestOptionItemType,
  updateAuctionScheduleType,
} from '@interface/extraService';
import { Picture, Plus } from '@element-plus/icons-vue';
import { AUCTION_SCHEDULE } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { flag, closeModalWithData, modalData } = useModalStore();
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const {
  requestCreateAuctionSchedule,
  requestProductListData,
  requestFirstCategoryList,
  requestSecondCategoryList,
  requestUpdateAuctionSchedule,
  requestCheckCustomItem,
  requestUploadCustomItem,
  requestCreateCustomItem,
  requestProductOptionData,
} = extraService;
const {
  requestFirstCategoryListCodec,
  requestSecondCategoryListCodec,
  requestProductListDataCodec,
} = extraServiceCodec;

const props = defineProps<{
  getAuctionScheduleData: () => Promise<void>;
  createEditType: 'create' | 'edit';
}>();

const editData = modalData.auctionSchedule as updateAuctionScheduleType;

/** 경매 스캐줄 등록 데이터 */
const auctionScheduleData = reactive({
  isRepeat: editData.isRepeat ?? false,
  repeatDayList: editData.repeatDayList ?? [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  isSetDateTime: editData.isSetDateTime ?? false,
  startDate: editData.startDateTime?.split('T')[0] ?? '',
  startTime: editData.startDateTime?.split('T')[1] ?? '',
  isCustom: editData.isCustom ?? false,
  goodsCode: editData.goodsCode ?? '',
  goodsUrl: editData.goodsUrl ?? '',
  goodsName: editData.goodsName ?? '',
  goodsPrice: editData.goodsPrice ?? 0,
  optionGoodsJsonList:
    editData.optionGoodsJsonList ?? ([] as requestOptionItemType[]),
  isExceedMaxPrice: editData.isExceedMaxPrice ?? false,
  isAgree: true,
  startPrice: editData.startPrice ?? 0,
  quickPrice: editData.quickPrice
    ?.split('|')
    ?.map((price: string) => Number(price)) ?? [100, 500, 1000],
  waitTime: editData.waitTime ?? 10,
  runningTime: editData.runningTime ?? 30,
  themeCode: editData.themeCode ?? 'DEFAULT',
  customItemId: editData.customItemId as number | undefined,
});

/** 상품 선택하기 검색 데이터 */
const searchProductListData = reactive({
  category1: '',
  category2: '',
  goodsStatus: ['SELL', 'STOP_SELL', 'SOLD'],
  isDeletedInPos: false,
  goodsSearchType: 'ALL',
  goodsName: '',
});

/** 직접 등록하기 아이템 데이터 */
const auctionScheduleModalData = reactive({
  isCustomItemUsed: false,
  customItemPosName: '',
  customItemPrice: 0,
  customItemName: '',
  customItemUrl: '',
  customItemCode: '',
});

/** 대기 시간 리스트 */
const waitTimeList = [
  {
    value: 10,
    label: '10초',
  },
  {
    value: 20,
    label: '20초',
  },
  {
    value: 30,
    label: '30초',
  },
  {
    value: 40,
    label: '40초',
  },
  {
    value: 50,
    label: '50초',
  },
  {
    value: 60,
    label: '60초',
  },
];

/** 진행 시간 리스트 */
const runTimeList = [
  {
    value: 30,
    label: '30초',
  },
  {
    value: 40,
    label: '40초',
  },
  {
    value: 50,
    label: '50초',
  },
  {
    value: 60,
    label: '60초',
  },
  {
    value: 70,
    label: '70초',
  },
  {
    value: 80,
    label: '80초',
  },
  {
    value: 90,
    label: '90초',
  },
];

/** 상품 등록 상품 검색 타입 */
const productSearchType = [
  {
    value: 'ALL',
    label: '전체',
  },
  {
    value: 'POS',
    label: '상품명(포스)',
  },
  {
    value: 'TORDER',
    label: '상품명(티오더)',
  },
];

/** 상품 검색 - 분류 선택 리스트 */
const productStateType = [
  {
    value: 'SELL',
    label: '판매',
  },
  {
    value: 'STOP_SELL',
    label: '판매중지',
  },
  {
    value: 'SOLD',
    label: '품절',
  },
];

/** 상품 검색 데이터 리스트 */
const productDataList: Ref<productDataListType[]> = ref([]);
const getProductDataList = async () => {
  const requestData = {
    category1: searchProductListData.category1,
    category2: searchProductListData.category2,
    goodsStatus: searchProductListData.goodsStatus?.join(','),
    isDeletedInPos: searchProductListData.isDeletedInPos,
    goodsSearchType:
      searchProductListData.goodsSearchType === 'ALL'
        ? 'POS,TORDER'
        : searchProductListData.goodsSearchType,
    goodsName: searchProductListData.goodsName,
  };

  try {
    const res = (await requestProductListData(
      storeCode,
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestProductListDataCodec,
      res.data.data.parentCategoryList,
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

    if (res.data.resultCode === 200) {
      if (!typeError) {
        productDataList.value = res.data.data.parentCategoryList;
      }
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 대분류 리스트 */
const firstCategoryList: Ref<requestFirstCategoryListType[]> = ref([]);
const getFirstCategoryList = async () => {
  try {
    const res = (await requestFirstCategoryList(storeCode)) as AxiosResponse;
    const typeError = runtimeCheck(
      requestFirstCategoryListCodec,
      res.data.data,
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

    if (res.data.resultCode === 200) {
      if (!typeError) {
        firstCategoryList.value = res.data.data.largeCategoryList;
      }
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const resetFirstCategory = () => {
  searchProductListData.category2 = '';
};

/** 중분류 리스트 */
const secondCategoryList: Ref<requestFirstCategoryListType[]> = ref([]);
const getSecondCategoryList = async (code: string) => {
  try {
    const res = (await requestSecondCategoryList(
      storeCode,
      code,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestSecondCategoryListCodec,
      res.data.data,
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

    if (res.data.resultCode === 200) {
      if (!typeError) {
        secondCategoryList.value = res.data.data.middleCategoryList;
        resetFirstCategory();
      }
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 경매 스캐줄 등록 */
const postCreateAuctionSchedule = async () => {
  const requestData = {
    isRepeat: auctionScheduleData.isRepeat,
    repeatDayList: auctionScheduleData.isRepeat
      ? auctionScheduleData.repeatDayList
      : undefined,
    isSetDateTime: auctionScheduleData.isSetDateTime,
    startDate:
      !auctionScheduleData.isRepeat && auctionScheduleData.isSetDateTime
        ? auctionScheduleData.startDate
        : undefined,
    startTime: auctionScheduleData.isSetDateTime
      ? auctionScheduleData.startTime
      : undefined,
    isCustom: auctionScheduleData.isCustom,
    goodsCode: auctionScheduleData.goodsCode,
    goodsUrl: auctionScheduleData.goodsUrl,
    goodsName: auctionScheduleData.goodsName,
    goodsPrice: auctionScheduleData.goodsPrice,
    optionGoodsJsonList: auctionScheduleData.optionGoodsJsonList,
    isExceedMaxPrice: auctionScheduleData.isExceedMaxPrice,
    startPrice: auctionScheduleData.startPrice,
    quickPrice: auctionScheduleData.quickPrice.join('|'),
    waitTime: auctionScheduleData.waitTime,
    runningTime: auctionScheduleData.runningTime,
    themeCode: auctionScheduleData.themeCode,
    isAgree: auctionScheduleData.isAgree,
    customItemId: auctionScheduleData.customItemId,
  };
  try {
    const res = (await requestCreateAuctionSchedule(
      storeCode,
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

    if (res.data.resultCode === 201) {
      ElMessage({
        type: 'success',
        message: '정상적으로 등록되었습니다.',
      });
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 경매 스캐줄 수정 */
const putUpdateAuctionSchedule = async () => {
  const requestData = {
    isRepeat: auctionScheduleData.isRepeat,
    repeatDayList: auctionScheduleData.isRepeat
      ? auctionScheduleData.repeatDayList
      : undefined,
    isSetDateTime: auctionScheduleData.isSetDateTime,
    startDate:
      !auctionScheduleData.isRepeat && auctionScheduleData.isSetDateTime
        ? auctionScheduleData.startDate
        : undefined,
    startTime: auctionScheduleData.isSetDateTime
      ? auctionScheduleData.startTime
      : undefined,
    isCustom: auctionScheduleData.isCustom,
    goodsCode: auctionScheduleData.goodsCode,
    goodsUrl: auctionScheduleData.goodsUrl,
    goodsName: auctionScheduleData.goodsName,
    goodsPrice: auctionScheduleData.goodsPrice,
    optionGoodsJsonList: auctionScheduleData.optionGoodsJsonList,
    isExceedMaxPrice: auctionScheduleData.isExceedMaxPrice,
    startPrice: auctionScheduleData.startPrice,
    quickPrice: auctionScheduleData.quickPrice.join('|'),
    waitTime: auctionScheduleData.waitTime,
    runningTime: auctionScheduleData.runningTime,
    themeCode: auctionScheduleData.themeCode,
    isAgree: auctionScheduleData.isAgree,
    customItemId: auctionScheduleData.customItemId,
  };
  try {
    const res = (await requestUpdateAuctionSchedule(
      storeCode,
      requestData,
      editData.scheduleId,
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

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 커스텀 상품 이미지 등록 */
const postUploadCustomItemImage = async (image: File) => {
  try {
    const res = (await requestUploadCustomItem(
      storeCode,
      image,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      auctionScheduleModalData.customItemUrl = res.data.data.path;
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 커스텀 상품 데이터 불러오기 */
const getCheckCustomItem = async () => {
  try {
    const res = (await requestCheckCustomItem(storeCode)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.resultCode === 200) {
      auctionScheduleModalData.isCustomItemUsed =
        res.data.data.isCustomItemUsed;
      auctionScheduleModalData.customItemCode = res.data.data.customItemCode;
      auctionScheduleModalData.customItemPosName =
        res.data.data.customItemPosName;
    } else {
      ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 커스텀 상품 등록하기 */
const postCreateCustomItem = async () => {
  const requestData = {
    customItemPosName: auctionScheduleModalData.customItemPosName,
    customItemPrice: auctionScheduleModalData.customItemPrice,
    customItemName: auctionScheduleModalData.customItemName,
    customItemImageUrl: auctionScheduleModalData.customItemUrl,
    customItemCode: auctionScheduleModalData.customItemCode,
  };
  try {
    const res = (await requestCreateCustomItem(
      storeCode,
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

    if (res.data.resultCode === 201) {
      auctionScheduleData.customItemId = res.data.data.customItemId;
      auctionScheduleData.goodsCode = res.data.data.customItemCode;
      auctionScheduleData.goodsName = res.data.data.customItemName;
      auctionScheduleData.goodsUrl = res.data.data.customItemImageUrl;
      auctionScheduleData.goodsPrice = res.data.data.customItemPrice;
      auctionScheduleData.startPrice =
        Math.floor(res.data.data.customItemPrice * 0.004) * 100;
    } else {
      ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 선택한 옵션 데이터 리스트 */
const selectedOptionData: Ref<optionItemListType[][]> = ref([]);
/** 상품 옵션 리스트 */
const productOptionList: Ref<productOptionListType[]> = ref([]);
const getProductOptionList = async (code: string) => {
  try {
    const res = (await requestProductOptionData(
      storeCode,
      code,
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

    if (res.data.resultCode === 200) {
      productOptionList.value = res.data.data.optionList;
      productOptionList.value.forEach((group) => {
        group.optionItemList.forEach((item) => {
          Object.assign(item, { qty: 0 });
        });
      });
      const emptyArray = Array.from(
        { length: productOptionList.value.length },
        () => [],
      );
      selectedOptionData.value = emptyArray;
    } else {
      ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 경매 상품 직접 등록 */
const directEnrollModal = ref(false);
const openDirectEnrollModal = () => {
  directEnrollModal.value = true;
};
const closeDirectEnrollModal = () => {
  directEnrollModal.value = false;
  auctionScheduleModalData.customItemUrl = '';
  auctionScheduleModalData.customItemName = '';
  auctionScheduleModalData.customItemPrice = 0;
};

/** 직접 등록하기 */
const confirmDirectEnrollModal = async () => {
  if (!auctionScheduleModalData.customItemUrl) {
    ElMessage({
      type: 'error',
      message: '이미지를 등록해주세요.',
    });
    return;
  }
  if (!auctionScheduleModalData.customItemName) {
    ElMessage({
      type: 'error',
      message: '상품명을 입력해주세요.',
    });
    return;
  }

  await postCreateCustomItem();

  // 모달창 데이터 초기화
  auctionScheduleModalData.customItemPrice = 0;
  auctionScheduleModalData.customItemName = '';
  auctionScheduleModalData.customItemUrl = '';
  auctionScheduleData.optionGoodsJsonList = [];
  directEnrollModal.value = false;
  auctionScheduleData.isCustom = true;
};

const radioSelectState: Ref<string> = ref('');

/** 상품 선택하기에서 선택한 상품 */
const checkedData: Ref<productDataListChildGoodsType> = ref(
  {} as productDataListChildGoodsType,
);
const clickTargetRadioData = (item: productDataListChildGoodsType) => {
  checkedData.value = item;
};
/** 경매 상품 선택 등록 모달 */
const searchEnrollModal = ref(false);
const openSearchEnrollModal = async () => {
  await getProductDataList();
  await getFirstCategoryList();
  searchEnrollModal.value = true;
};
/** 경품 상품 옵션 선택 모달 */
const selectOptionModal = ref(false);
const openSelectOptionModal = () => {
  selectOptionModal.value = true;
};
const closeSelectOptionModal = () => {
  selectOptionModal.value = false;
};
/** 옵션 상품 선택하기 */
const confirmOptionItemSelectModal = () => {
  const editedData: requestOptionItemType[] = [];
  selectedOptionData.value?.flat()?.forEach((option) => {
    editedData.push({
      optionGoodsCode: option.optionCode,
      qty: option.qty ?? 0,
      optionGoodsImgUrl: option.optionGoodsImgUrl ?? '',
      optionGoodsDisName: option.optionGoodsDisName,
    });
  });

  auctionScheduleData.goodsCode = checkedData.value.goodsCode;
  auctionScheduleData.goodsName = checkedData.value.goodsName;
  auctionScheduleData.goodsPrice = checkedData.value.goodsPrice;
  auctionScheduleData.startPrice =
    Math.floor(checkedData.value.goodsPrice * 0.004) * 100;
  auctionScheduleData.goodsUrl = checkedData.value.goodsUrl ?? '';
  auctionScheduleData.optionGoodsJsonList = editedData;
  auctionScheduleData.isCustom = false;
  auctionScheduleData.customItemId = undefined;
  selectOptionModal.value = false;
  searchEnrollModal.value = false;
};

// 상품 상태 전체 선택
const productStateAllCheckbox = ref(true);
const isIndeterminateProductState = ref(false);
const productStateAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  productStateType.forEach((game) => allCheckArray.push(game.value));
  searchProductListData.goodsStatus = val ? allCheckArray : [];
  isIndeterminateProductState.value = false;
};
const checkedProductStateChange = (value: string[]) => {
  const checkedCount = value.length;
  productStateAllCheckbox.value = checkedCount === productStateType.length;
  isIndeterminateProductState.value =
    checkedCount > 0 && checkedCount < productStateType.length;
};

/** 검색 초기화 */
const resetSearchProductData = () => {
  searchProductListData.category1 = '';
  searchProductListData.category2 = '';
  searchProductListData.goodsStatus = ['SELL', 'STOP_SELL', 'SOLD'];
  searchProductListData.isDeletedInPos = false;
  searchProductListData.goodsSearchType = 'ALL';
  searchProductListData.goodsName = '';
  productStateAllCheckbox.value = true;
  isIndeterminateProductState.value = false;

  getProductDataList();
};
const closeSearchEnrollModal = () => {
  radioSelectState.value = '';
  resetSearchProductData();
  searchEnrollModal.value = false;
};
const confirmSearchEnrollModal = async () => {
  if (checkedData.value.hasOption) {
    await getProductOptionList(checkedData.value.goodsCode);
    openSelectOptionModal();
    return;
  }

  auctionScheduleData.goodsCode = checkedData.value.goodsCode;
  auctionScheduleData.goodsName = checkedData.value.goodsName;
  auctionScheduleData.goodsPrice = checkedData.value.goodsPrice;
  auctionScheduleData.startPrice =
    Math.floor(checkedData.value.goodsPrice * 0.004) * 100;
  auctionScheduleData.goodsUrl = checkedData.value.goodsUrl ?? '';
  searchEnrollModal.value = false;
  auctionScheduleData.isCustom = false;
  auctionScheduleData.customItemId = undefined;
};
const isDisabledConfirmButton = () => radioSelectState.value === '';

/** 상품 이미지 선택 */
const productImageUploadSuccess: UploadProps['onSuccess'] = (response) => {
  postUploadCustomItemImage(response.raw);
};

/** 상품 검색 총 수량 */
const getTotalDataCount = computed(() => {
  let count = 0;
  productDataList.value.forEach((first) => {
    first.childCategoryList.forEach((second) => {
      count += second.goodsList.length;
    });
  });

  return count;
});

const isEmptyItem = () =>
  auctionScheduleData.goodsName?.length === 0 &&
  auctionScheduleData.goodsUrl?.length === 0;

const isNotEmptyArray = (data: productDataListChildType) =>
  data.goodsList.length !== 0;

const isNotExistData = () => getTotalDataCount.value !== 0;

const setIsSetDateTimeTrue = () => {
  auctionScheduleData.isSetDateTime = true;
  auctionScheduleData.startTime = '';
  auctionScheduleData.startDate = '';
  auctionScheduleData.repeatDayList = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];
};

const setResetNoRepeat = () => {
  auctionScheduleData.repeatDayList = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];
  auctionScheduleData.startTime = '';
  auctionScheduleData.startDate = '';
  auctionScheduleData.isSetDateTime = false;
};

const isCreateType = () => props.createEditType === 'create';
const isEditType = () => props.createEditType === 'edit';

const getModalTitle = () => (isCreateType() ? '경매 등록' : '경매 수정');
const getButtonTitle = () => (isCreateType() ? '등록' : '수정');

/** 백원 단위 체킹 */
const checkHundredUnit = (price: number) => {
  const targetPrice = String(price);
  const oneUnitNumber = targetPrice[targetPrice.length - 1];
  const tenUnitNumber = targetPrice[targetPrice.length - 2];

  return oneUnitNumber !== '0' || tenUnitNumber !== '0';
};

/** 경매 등록/수정 하기 */
const createUpdateAuctionSchedule = async () => {
  const {
    isRepeat,
    isSetDateTime,
    startDate,
    startTime,
    startPrice,
    goodsPrice,
  } = auctionScheduleData;

  if (!isRepeat && isSetDateTime && startDate.length === 0) {
    ElMessageBox.alert('이벤트 시작 날짜를 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (isSetDateTime && startTime.length === 0) {
    ElMessageBox.alert('이벤트 시작 시간을 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (isEmptyItem()) {
    ElMessageBox.alert('이벤트 상품을 등록해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (startPrice >= goodsPrice) {
    ElMessageBox.alert('경매 시작가가 기존 상품이와 같거나 큽니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (checkHundredUnit(startPrice)) {
    ElMessageBox.alert('시작가는 100원 단위로 입력해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  const normalQuickPriceCount = auctionScheduleData.quickPrice.filter(
    (price) => price,
  );
  if (normalQuickPriceCount.length < 2) {
    ElMessageBox.alert('입찰 단위를 2개 이상 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  const checkQuickPriceUnit = normalQuickPriceCount.some((price) =>
    checkHundredUnit(price),
  );
  if (checkQuickPriceUnit) {
    ElMessageBox.alert('입찰 단위를 100원 단위로 입력해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (isCreateType()) {
    await postCreateAuctionSchedule();
  }
  if (isEditType()) {
    await putUpdateAuctionSchedule();
  }
  await props.getAuctionScheduleData();
  closeModalWithData(AUCTION_SCHEDULE, {});
};

const getTagNameStyle = (require: boolean) => {
  if (require) {
    return {
      name: '필수',
      color: 'danger',
    };
  }
  return {
    name: '선택',
    color: 'info',
  };
};

const getLimitSelectCount = (count: number) =>
  count === 0 ? undefined : count;
const getTotalPriceCount = (price: number, count?: number) => {
  if (count) {
    return price * count;
  }
  return 0;
};
const isNotLimitSelect = (count: number) => count !== 0;
const isSaleStopState = (isUsed: boolean) => (isUsed ? '' : '판매중지');
const isSoldOutState = (isSale: boolean) => (isSale ? '품절' : '');

// v-for 방어 코드
const getFirstCategoryKey = (
  target: requestFirstCategoryListType,
  index: number,
) => {
  if (!target) {
    return `first-category-${index}`;
  }
  return `first-category-${index}-${target.categoryCode}`;
};
const getSecondCategoryKey = (
  target: requestFirstCategoryListType,
  index: number,
) => {
  if (!target) {
    return `second-category-${index}`;
  }
  return `second-category-${index}-${target.categoryCode}`;
};
const getFirstChildKey = (target: productDataListType, index: number) => {
  if (!target) {
    return `first-child-${index}`;
  }
  return `first-child-${index}-${target.categoryCode}`;
};
const getSecondChildKey = (target: productDataListChildType, index: number) => {
  if (!target) {
    return `second-child-${index}`;
  }
  return `second-child-${index}-${target.categoryCode}`;
};
const getItemKey = (target: productDataListChildGoodsType, index: number) => {
  if (!target) {
    return `item-${index}`;
  }
  return `item-${index}-${target.goodsCode}`;
};
const getOptionItemKey = (target: string, index: number) => {
  if (!target) {
    return `option-item-${index}`;
  }
  return `option-item-${index}-${target}`;
};

getCheckCustomItem();
</script>

<template>
  <el-dialog
    v-model="flag.auctionSchedule"
    :before-close="() => closeModalWithData(AUCTION_SCHEDULE, {})"
    :close-on-click-modal="false"
    :title="getModalTitle()"
    top="1vh"
    width="50%"
  >
    <el-dialog
      v-model="directEnrollModal"
      append-to-body
      class="direct-enroll-item-modal"
      title="상품 직접 등록"
      width="25%"
    >
      <el-upload
        :auto-upload="false"
        :on-change="productImageUploadSuccess"
        :show-file-list="false"
        class="mb-20"
        drag
      >
        <el-row>
          <el-col :span="24">
            <el-row
              align="middle"
              justify="center"
            >
              <el-image
                v-if="auctionScheduleModalData.customItemUrl"
                :src="auctionScheduleModalData.customItemUrl"
                class="auction-item-uploader-image"
                fit="contain"
              >
                <template #error>
                  <div class="auction-item-uploader-image">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <el-icon
                v-else
                class="auction-item-uploader-icon"
              >
                <Plus />
              </el-icon>
            </el-row>
          </el-col>
        </el-row>
      </el-upload>
      <div class="direct-enroll-item-modal-gird mb-20">
        <span> 상품명 </span>
        <div class="width-100">
          <el-input
            v-model="auctionScheduleModalData.customItemName"
            placeholder="상품명 입력"
          />
        </div>
      </div>
      <div class="direct-enroll-item-modal-gird">
        <span> 가격 </span>
        <el-input-number
          v-model="auctionScheduleModalData.customItemPrice"
          :min="0"
          :step="100"
          class="width-100"
          controls-position="right"
          placeholder="가격 입력"
        />
        <span> 원 </span>
      </div>
      <template #footer>
        <el-button
          type="danger"
          @click="closeDirectEnrollModal"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="confirmDirectEnrollModal"
        >
          확인
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="searchEnrollModal"
      append-to-body
      title="상품 검색"
      top="1vh"
      width="50%"
    >
      <el-dialog
        v-model="selectOptionModal"
        append-to-body
        class="option-select-modal"
        title="옵션 선택"
        top="3vh"
        width="50%"
      >
        <el-card class="mb-20">
          <div class="option-select-modal-product-info">
            <el-image
              :src="checkedData.goodsUrl"
              class="option-select-modal-product-image"
              fit="contain"
            />
            <div class="option-select-modal-product-text">
              <span>
                {{ checkedData.goodsName }}
              </span>
              <span> {{ checkedData.goodsPrice?.toLocaleString() }} 원 </span>
            </div>
          </div>
        </el-card>
        <el-card class="option-select-card-grid mb-20">
          <el-scrollbar height="450">
            <el-card
              v-for="(optionGroup, index) in productOptionList"
              :key="optionGroup.optionSortNumber"
              class="mb-10"
              shadow="never"
            >
              <template #header>
                <div class="option-select-group">
                  <span>
                    {{ optionGroup.optionName }}
                  </span>
                  <div class="option-select-group-grid">
                    <div
                      v-if="isNotLimitSelect(optionGroup.limitSelectedCount)"
                      class="option-select-group-grid-text"
                    >
                      {{ optionGroup.limitSelectedCount }}개까지 선택 가능
                    </div>
                    <el-tag
                      :type="getTagNameStyle(optionGroup.isRequired).color"
                    >
                      {{ getTagNameStyle(optionGroup.isRequired).name }}
                    </el-tag>
                  </div>
                </div>
              </template>
              <div v-if="optionGroup.optionItemList.length !== 0">
                <div
                  v-for="(option, index2) in optionGroup.optionItemList"
                  :key="getOptionItemKey(option.optionCode, index2)"
                >
                  <el-checkbox-group
                    v-model="selectedOptionData[index]"
                    :max="getLimitSelectCount(optionGroup.limitSelectedCount)"
                    class="option-select-group-item"
                  >
                    <el-checkbox
                      :disabled="!option.isUsed || option.isSale"
                      :label="option"
                      class="ellipsis-text-1"
                      size="large"
                    >
                      {{ option.optionGoodsName }}
                    </el-checkbox>
                    <div class="option-select-group-item-tags">
                      <el-tag
                        v-if="!option.isUsed"
                        type="danger"
                      >
                        {{ isSaleStopState(option.isUsed) }}
                      </el-tag>
                      <el-tag
                        v-if="option.isSale"
                        type="danger"
                      >
                        {{ isSoldOutState(option.isSale) }}
                      </el-tag>
                    </div>
                    <span class="option-select-group-item-price">
                      +{{ option.optionPrice?.toLocaleString() }}원
                    </span>
                    <el-input-number
                      v-model="option.qty"
                      :disabled="!option.isUsed || option.isSale"
                      :min="0"
                      class="option-select-group-item-input"
                    />
                    <span class="option-select-group-item-total-price">
                      {{
                        getTotalPriceCount(
                          option.optionPrice,
                          option.qty,
                        )?.toLocaleString()
                      }}원
                    </span>
                  </el-checkbox-group>
                </div>
              </div>
              <el-row
                v-else
                justify="center"
              >
                옵션 상품이 존재하지 않습니다.
              </el-row>
            </el-card>
          </el-scrollbar>
        </el-card>
        <el-row
          align="middle"
          class="width-100"
          justify="center"
        >
          <el-button
            size="large"
            type="danger"
            @click="closeSelectOptionModal"
          >
            취소
          </el-button>
          <el-button
            size="large"
            type="primary"
            @click="confirmOptionItemSelectModal"
          >
            확인
          </el-button>
        </el-row>
      </el-dialog>
      <div class="detail-service-title mb-10">
        <span> 조회 조건 </span>
      </div>
      <el-descriptions
        :column="1"
        border
        class="mb-20"
      >
        <el-descriptions-item
          label="분류 선택"
          label-align="center"
          label-class-name="auction-schedule-label"
        >
          <el-select
            v-model="searchProductListData.category1"
            class="mr-10"
            @change="getSecondCategoryList(searchProductListData.category1)"
          >
            <el-option
              v-for="(first, index) in firstCategoryList"
              :key="getFirstCategoryKey(first, index)"
              :label="first.categoryName"
              :value="first.categoryCode"
            />
          </el-select>
          <el-select v-model="searchProductListData.category2">
            <el-option
              v-for="(second, index) in secondCategoryList"
              :key="getSecondCategoryKey(second, index)"
              :label="second.categoryName"
              :value="second.categoryCode"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="상품 상태"
          label-align="center"
          label-class-name="auction-schedule-label"
        >
          <el-row>
            <el-checkbox
              v-model="productStateAllCheckbox"
              :indeterminate="isIndeterminateProductState"
              @change="productStateAllChange"
            >
              전체
            </el-checkbox>
            <el-checkbox-group
              v-model="searchProductListData.goodsStatus"
              class="ml-30"
              @change="checkedProductStateChange"
            >
              <el-checkbox
                v-for="state in productStateType"
                :key="state.value"
                :label="state.value"
              >
                {{ state.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          label="POS 삭제 상품"
          label-align="center"
          label-class-name="auction-schedule-label"
        >
          <el-radio-group v-model="searchProductListData.isDeletedInPos">
            <el-radio :label="false"> 미포함</el-radio>
            <el-radio :label="true"> 포함</el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item
          label="상품명"
          label-align="center"
          label-class-name="auction-schedule-label"
        >
          <div class="product-search-input-grid">
            <el-select v-model="searchProductListData.goodsSearchType">
              <el-option
                v-for="productType in productSearchType"
                :key="productType.value"
                :label="productType.label"
                :value="productType.value"
              />
            </el-select>
            <el-input
              v-model="searchProductListData.goodsName"
              placeholder="상품명"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <el-row
        align="middle"
        class="mb-40"
        justify="center"
      >
        <el-button
          type="warning"
          @click="resetSearchProductData"
        >
          초기화
        </el-button>
        <el-button
          type="primary"
          @click="getProductDataList"
        >
          검색
        </el-button>
      </el-row>
      <div class="detail-service-title mb-10">
        <span> 검색 결과 </span>
      </div>
      <el-divider class="extra-service-divider" />
      <el-row class="mb-20">
        <p class="extra-service-count-info">
          총 <span>{{ getTotalDataCount }} </span>
          개의 검색결과가 있습니다.
        </p>
      </el-row>
      <el-scrollbar :height="500">
        <el-radio-group
          v-if="isNotExistData()"
          v-model="radioSelectState"
          class="product-list-container"
        >
          <div
            v-for="(first, index) in productDataList"
            :key="getFirstChildKey(first, index)"
            class="product-list-layout"
          >
            <div
              v-for="(second, index2) in first.childCategoryList"
              :key="getSecondChildKey(second, index2)"
              class="product-list-layout-box"
            >
              <div
                v-if="isNotEmptyArray(second)"
                class="product-list-box"
              >
                <div class="product-list-path">
                  {{ first.categoryName }} > {{ second.categoryName }}
                </div>
                <div class="product-list-grid">
                  <div
                    v-for="(item, index3) in second.goodsList"
                    :key="getItemKey(item, index3)"
                  >
                    <div class="product-list-card">
                      <el-row
                        align="middle"
                        class="width-100"
                        justify="space-between"
                      >
                        <el-radio
                          :disabled="item.isSale || !item.isUsed"
                          :label="item.goodsCode"
                          @click="clickTargetRadioData(item)"
                        >
                          선택
                        </el-radio>
                        <el-tag
                          v-if="item.hasOption"
                          round
                          type="info"
                        >
                          옵션
                        </el-tag>
                      </el-row>
                      <el-image
                        :src="item.goodsUrl"
                        class="product-list-image"
                        fit="contain"
                      />
                      <div class="product-list-tag-gird">
                        <el-tag
                          v-if="!item.isUsed"
                          type="warning"
                        >
                          판매중지
                        </el-tag>
                        <el-tag
                          v-if="item.isSale"
                          type="danger"
                        >
                          품절
                        </el-tag>
                        <el-tag v-if="item.isUsed && !item.isSale">
                          판매
                        </el-tag>
                      </div>
                      <div class="ellipsis-text-1 product-list-card-title">
                        {{ item.goodsName }}
                      </div>
                      <div class="ellipsis-text-1 product-list-card-title">
                        {{ item.goodsPrice?.toLocaleString() }} 원
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-radio-group>
        <p
          v-else
          class="empty-data-text"
        >
          검색 조건에 일치하는 항목이 없습니다.
        </p>
      </el-scrollbar>
      <template #footer>
        <el-button
          type="danger"
          @click="closeSearchEnrollModal"
        >
          취소
        </el-button>
        <el-button
          :disabled="isDisabledConfirmButton()"
          type="primary"
          @click="confirmSearchEnrollModal"
        >
          선택
        </el-button>
      </template>
    </el-dialog>
    <div class="detail-service-title mb-10">
      <span> 일정 설정 </span>
    </div>
    <el-descriptions
      :column="1"
      border
      class="mb-40"
    >
      <el-descriptions-item
        label="이벤트 구분"
        label-align="center"
        label-class-name="auction-schedule-label"
      >
        <el-radio-group v-model="auctionScheduleData.isRepeat">
          <el-radio
            :label="false"
            @click="setResetNoRepeat"
          >
            반복 안함
          </el-radio>
          <el-radio
            :label="true"
            @click="setIsSetDateTimeTrue"
          >
            반복 실행
          </el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!auctionScheduleData.isRepeat"
        label="이벤트 시작 일시"
        label-align="center"
      >
        <el-row>
          <el-radio-group
            v-model="auctionScheduleData.isSetDateTime"
            class="mr-20"
          >
            <el-radio :label="false"> 즉시 실행</el-radio>
            <el-radio :label="true"> 일시 지정</el-radio>
          </el-radio-group>
          <el-row>
            <el-date-picker
              v-model="auctionScheduleData.startDate"
              :disabled="!auctionScheduleData.isSetDateTime"
              class="mr-20"
              format="YYYY-MM-DD"
              placeholder="날짜 선택"
              type="date"
              value-format="YYYY-MM-DD"
            />
            <el-time-picker
              v-model="auctionScheduleData.startTime"
              :disabled="!auctionScheduleData.isSetDateTime"
              format="HH:mm"
              placeholder="시간 선택"
              value-format="HH:mm"
            />
          </el-row>
        </el-row>
      </el-descriptions-item>
      <div v-else>
        <el-descriptions-item
          label="반복 요일"
          label-align="center"
        >
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[0]"
            label="월"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[1]"
            label="화"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[2]"
            label="수"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[3]"
            label="목"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[4]"
            label="금"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[5]"
            label="토"
          />
          <el-checkbox
            v-model="auctionScheduleData.repeatDayList[6]"
            label="일"
          />
        </el-descriptions-item>
        <el-descriptions-item
          label="반복 시간"
          label-align="center"
        >
          <el-time-picker
            v-model="auctionScheduleData.startTime"
            format="HH:mm"
            placeholder="시간 선택"
            value-format="HH:mm"
          />
        </el-descriptions-item>
      </div>
    </el-descriptions>
    <div class="detail-service-title mb-10">
      <span> 이벤트 상품 설정 </span>
    </div>
    <el-descriptions
      :column="1"
      border
      class="mb-40"
    >
      <el-descriptions-item
        label="이벤트 상품"
        label-align="center"
        label-class-name="auction-schedule-label"
      >
        <el-row align="middle">
          <div class="mr-10">
            <el-button
              v-if="auctionScheduleModalData.isCustomItemUsed"
              @click="openDirectEnrollModal"
            >
              직접 등록
            </el-button>
          </div>
          <div>
            <el-button @click="openSearchEnrollModal"> 상품 선택</el-button>
          </div>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        label="상품 정보"
        label-align="center"
      >
        <p v-if="isEmptyItem()">선택한 상품이 없습니다.</p>
        <div v-else>
          <div class="auction-schedule-goods">
            <el-image
              :src="auctionScheduleData.goodsUrl"
              class="auction-schedule-goods-image"
            />
            <div class="auction-schedule-goods-info">
              <p class="auction-schedule-goods-info-title ellipsis-text-1">
                {{ auctionScheduleData.goodsName }}
              </p>
              <p>
                가격: {{ auctionScheduleData.goodsPrice?.toLocaleString() }} 원
              </p>
              <div class="auction-schedule-goods-info-option">
                <div
                  v-for="(
                    option, index
                  ) in auctionScheduleData.optionGoodsJsonList"
                  :key="getOptionItemKey(option.optionGoodsCode, index)"
                >
                  <p>• {{ option.optionGoodsDisName }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        label="최고가"
        label-align="center"
      >
        <el-radio-group v-model="auctionScheduleData.isExceedMaxPrice">
          <el-radio :label="true"> 입찰 금액 제한(상품 정상가 이내)</el-radio>
          <el-radio :label="false">
            입찰 금액 제한 없음(상품 정상가 초과 가능)
          </el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item
        label="시작가"
        label-align="center"
      >
        <el-input-number
          v-model="auctionScheduleData.startPrice"
          :min="0"
          :step="100"
          controls-position="right"
          step-strictly
        />
      </el-descriptions-item>
      <el-descriptions-item
        label="입찰 단위 설정"
        label-align="center"
      >
        <el-row align="middle">
          <el-input-number
            v-model="auctionScheduleData.quickPrice[0]"
            :min="0"
            :step="100"
            class="mr-10"
            controls-position="right"
            step-strictly
          />
          <el-input-number
            v-model="auctionScheduleData.quickPrice[1]"
            :min="0"
            :step="100"
            class="mr-10"
            controls-position="right"
            step-strictly
          />
          <el-input-number
            v-model="auctionScheduleData.quickPrice[2]"
            :min="0"
            :step="100"
            controls-position="right"
            step-strictly
          />
          <span class="ml-10"> ※ 필수 2개 이상 입력 </span>
        </el-row>
      </el-descriptions-item>
    </el-descriptions>
    <div class="detail-service-title mb-10">
      <span> 진행 조건 설정 </span>
    </div>
    <el-descriptions
      :column="1"
      border
      class="mb-40"
    >
      <el-descriptions-item
        label="참여 설정"
        label-align="center"
        label-class-name="auction-schedule-label"
      >
        <el-checkbox
          v-model="auctionScheduleData.isAgree"
          disabled
        >
          동의한 테이블만 참여: 전체 테이블에 참여 여부를 물은 후 동의한
          테이블만 참여
        </el-checkbox>
      </el-descriptions-item>
      <el-descriptions-item
        label="대기 시간(초)"
        label-align="center"
      >
        <el-row align="middle">
          <el-select
            v-model="auctionScheduleData.waitTime"
            class="mr-10"
          >
            <el-option
              v-for="wait in waitTimeList"
              :key="wait.value"
              :label="wait.label"
              :value="wait.value"
            />
          </el-select>
          <span> ※ 대기 시간은 경매 진행 전 안내를 제공하는 시간 입니다. </span>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        label="진행 시간(초)"
        label-align="center"
      >
        <el-select v-model="auctionScheduleData.runningTime">
          <el-option
            v-for="run in runTimeList"
            :key="run.value"
            :label="run.label"
            :value="run.value"
          />
        </el-select>
      </el-descriptions-item>
    </el-descriptions>
    <div class="detail-service-title mb-10">
      <span> 테마 설정 </span>
    </div>
    <el-descriptions
      :column="1"
      border
    >
      <el-descriptions-item
        label="테마 설정"
        label-align="center"
        label-class-name="auction-schedule-label"
      >
        <el-radio-group v-model="auctionScheduleData.themeCode">
          <el-radio label="DEFAULT"> 기본(블루)</el-radio>
          <el-radio label="BLACK"> 심플(블랙)</el-radio>
        </el-radio-group>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-row
        align="middle"
        justify="center"
      >
        <el-button
          type="danger"
          @click="closeModalWithData(AUCTION_SCHEDULE, {})"
        >
          취소
        </el-button>
        <el-button
          type="primary"
          @click="createUpdateAuctionSchedule"
        >
          {{ getButtonTitle() }}
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.auction-schedule-label) {
  width: 30%;
}

:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 220px;
  vertical-align: middle;
}

.option-select-modal {
  .option-select-modal-product-info {
    box-sizing: border-box;
    display: flex;
    gap: 30px;
    align-items: center;
    width: 100%;
    padding: 3px 10px;
    border-radius: 10px;

    .option-select-modal-product-image {
      width: 160px;
      height: 100px;
    }

    .option-select-modal-product-text {
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-size: 18px;
    }
  }

  .option-select-card-grid {
    padding: 10px;

    .option-select-group {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .option-select-group-grid {
        display: flex;
        gap: 10px;
        align-items: center;

        .option-select-group-grid-text {
          color: red;
        }
      }
    }

    .option-select-group-item {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .option-select-group-item-tags {
        display: flex;
        gap: 5px;
        align-items: center;
        justify-self: center;
      }

      .option-select-group-item-price {
        justify-self: center;
        font-size: 14px;
      }

      .option-select-group-item-input {
        justify-self: center;
      }

      .option-select-group-item-total-price {
        justify-self: end;
        font-size: 14px;
      }
    }
  }
}

.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.direct-enroll-item-modal {
  .auction-item-uploader-image {
    width: 300px;
    height: 200px;
  }

  .auction-item-uploader-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 300px;
    height: 200px;
  }

  .direct-enroll-item-modal-gird {
    display: flex;
    gap: 20px;
    align-items: center;

    span {
      font-size: 16px;
      white-space: nowrap;
    }
  }
}

.auction-schedule-goods {
  display: grid;
  grid-template-columns: 1fr 7fr;
  gap: 20px;
  padding: 15px;
  border: 1px solid #000;

  .auction-schedule-goods-image {
    width: 160px;
    height: 120px;
  }

  .auction-schedule-goods-info {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .auction-schedule-goods-info-title {
      display: block;
      max-width: 420px;
      font-size: 17px;
      font-weight: bold;
    }

    .auction-schedule-goods-info-option {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
  }
}

.product-search-input-grid {
  display: flex;
  gap: 10px;
}

.extra-service-divider {
  margin: 10px 0px;
}

.extra-service-count-info {
  font-size: 15px;

  span {
    font-size: 17px;
    color: red;
  }
}

.product-list-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  .product-list-layout {
    display: flex;
    flex-direction: column;
    width: 100%;

    .product-list-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 16px;

      .product-list-path {
        display: flex;
        align-items: center;
        height: 28px;
        padding: 5px 10px;
        font-size: 19px;
        font-weight: bold;
        background-color: #ebebef;
      }

      .product-list-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .product-list-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          padding: 15px;
          border: 1px solid #000;
          border-radius: 5px;

          .product-list-image {
            display: flex;
            justify-content: center;
            width: 140px;
            height: 120px;
          }

          .product-list-card-title {
            width: 140px;
            text-align: center;
          }

          .product-list-tag-gird {
            display: flex;
            gap: 5px;
          }
        }
      }
    }
  }
}

.empty-data-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
}
</style>
