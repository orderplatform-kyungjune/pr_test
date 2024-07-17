<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, TabsPaneContext } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  optionGroupListType,
  optionGroupType,
  requestOrderOneOptionMenuType,
  requestTranslateOptionGroupType,
} from '@interface/option';
import {
  languageCategoryListType,
  languageProductListType,
  productDetailInfoDataType,
  requestTranslateProductDetailType,
} from '@interface/goods';
import {
  orderTwoOptionGroupListType,
  orderTwoOptionMenuListType,
} from '@interface/excel';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import {
  ExcelUploadAndDownloadModal,
  LanguageTranslateModal,
  OptionGroupAllTranslationModal,
  OptionMenuAllTranslationModal,
  OptionTranslateModal,
} from '@containers';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import {
  EXCEL_UPLOAD_AND_DOWNLOAD,
  LANGUAGE_SETTING,
  LANGUAGE_TRANSLATE,
  OPTION_GROUP_ALL_TRANSLATION,
  OPTION_MENU_ALL_TRANSLATION,
  OPTION_TRANSLATE,
  STORE_LIST,
} from '@common/string';
import { excelCodec, goodsCodec, optionCodec } from '@codecs';
import { excel, goods, option } from '@apis';

const { convertToEllipsis } = etcUtils;
const { runtimeCheck } = runtimeCheckHelper;
const {
  failAuthenticationAlert,
  isGlobalAdmin,
  checkAuthFunction,
  isOriginAdmin,
  isBrand1Admin,
} = authentication;

const {
  requestLanguageProductList,
  requestLanguageCategoryList,
  requestTranslateAllProduct,
  requestProductDetailInfo,
  requestTranslateProductDetail,
  requestUpdateProduct,
} = goods;

const {
  requestOrderTwoOptionGroupListExcelDownload,
  requestOrderTwoOptionMenuListExcelDownload,
} = excel;

const {
  requestOptionGroupList,
  requestPapagoTranslateAllOptionGroup,
  requestPapagoTranslateAllOptionMenu,
} = option;

const {
  languageProductListCodec,
  languageCategoryListCodec,
  productDetailInfoCodec,
} = goodsCodec;

const { languageOptionGroupListCodec, translateAllOptionGroupCodec } =
  optionCodec;

const {
  orderTwoOptionGroupListExcelDownloadCodec,
  orderTwoOptionMenuListExcelDownloadCodec,
} = excelCodec;

const { flag, openModalWithData, openModal } = useModalStore();

const route = useRoute();
const pathQuery = reactive(route.query);

// header props
const languageManageHeader = reactive([
  { name: STORE_LIST },
  { name: LANGUAGE_SETTING },
]);

const loading = ref(false);

const activeTab = ref('product');
const activeTag = ref(0);
const productList: Ref<languageProductListType[]> = ref([]);
const detailDescriptionList: Ref<languageProductListType[]> = ref([]);
const apiType: Ref<string> = ref('1.0');
const categoryList: Ref<languageCategoryListType[]> = ref([]);
const optionGroupList: Ref<optionGroupListType[]> = ref([]);
const orderTwoOptionGroupList: Ref<orderTwoOptionGroupListType[]> = ref([]);
const orderTwoOptionMenuList: Ref<orderTwoOptionMenuListType[]> = ref([]);
const selectedDetailProductData: Ref<productDetailInfoDataType> = ref(
  {} as productDetailInfoDataType,
);
const selectedOptionGroup: Ref<optionGroupListType> = ref(
  {} as optionGroupListType,
);
const selectedOptionGroupTranslationInfo =
  reactive<requestTranslateOptionGroupType>(
    {} as requestTranslateOptionGroupType,
  );
const selectedOptionGroupTab: Ref<string> = ref('0');
const selectedDetailProductPosCode: Ref<string> = ref('');
const translateList = [
  '한글 번역',
  '영문 번역',
  '일어 번역',
  '간체 번역',
  '번체 번역',
];
const requestTranslateProductDetailParams: Ref<
  requestTranslateProductDetailType[]
> = ref([]);
const paginationProductList = reactive({
  storeCode: pathQuery.code as string,
  type: 'excel',
  page: 1,
  perPage: 10,
  total: 0,
  searchTxt: '',
  inUse: '',
});
const paginationCategoryList = reactive({
  storeCode: pathQuery.code as string,
  type: 'excel',
  page: 1,
  perPage: 10,
  total: 0,
  searchTxt: '',
  inUse: '',
});
const paginationDetailDescriptionList = reactive({
  storeCode: pathQuery.code as string,
  type: 'excel',
  page: 1,
  perPage: 10,
  total: 0,
  searchTxt: '',
  useDetailOpen: '',
  inUse: 'Y',
});
const paginationOptionGroupList = reactive({
  page: 1,
  pageSize: 13,
  from: 1,
  to: 10,
  total: 0,
});
const paginationOrderTwoOptionGroupList = reactive({
  storeCode: pathQuery.code as string,
  type: 'excel',
  page: 1,
  perPage: 10,
  total: 0,
  searchTxt: '',
});
const paginationOrderTwoOptionMenuList = reactive({
  storeCode: pathQuery.code as string,
  type: 'excel',
  page: 1,
  perPage: 10,
  total: 0,
  searchTxt: '',
});

// 언어 번역 상품 리스트 조회
const requestProductList = async (showLoading: boolean = true) => {
  try {
    const requestData = {
      storeCode: paginationProductList.storeCode,
      page: paginationProductList.page,
      perPage: paginationProductList.perPage,
      searchTxt: paginationProductList.searchTxt,
      inUse: paginationProductList.inUse,
    };
    loading.value = showLoading;
    const res = (await requestLanguageProductList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(languageProductListCodec, res.data);

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
        apiType.value = res.data.api_type;
        productList.value = res.data.data;
        paginationProductList.total = res.data.page_info.total;
        paginationProductList.page = res.data.page_info.current_page;
        paginationProductList.perPage = res.data.page_info.per_page;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 상세설명 리스트 조회
const requestDetailDescriptionList = async (showLoading: boolean = true) => {
  try {
    const requestData = {
      storeCode: paginationDetailDescriptionList.storeCode,
      page: paginationDetailDescriptionList.page,
      perPage: paginationDetailDescriptionList.perPage,
      searchTxt: paginationDetailDescriptionList.searchTxt,
      inUse: 'Y',
      useDetailOpen: paginationDetailDescriptionList.useDetailOpen,
    };
    loading.value = showLoading;
    const res = (await requestLanguageProductList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(languageProductListCodec, res.data);

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
        apiType.value = res.data.api_type;
        detailDescriptionList.value = res.data.data?.filter(
          (goodsItem: languageProductListType) =>
            goodsItem.goods_code !== '99999',
        );
        paginationDetailDescriptionList.total = res.data.page_info.total;
        paginationDetailDescriptionList.page = res.data.page_info.current_page;
        paginationDetailDescriptionList.perPage = res.data.page_info.per_page;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 언어 번역 분류 리스트 조회
const requestCategoryList = async (
  page: number,
  perPage: number,
  searchTxt?: string,
  showLoading: boolean = true,
) => {
  try {
    const requestData = {
      storeCode: pathQuery.code as string,
      page,
      perPage,
      searchTxt,
      inUse: paginationCategoryList.inUse,
    };
    loading.value = showLoading;
    const res = (await requestLanguageCategoryList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(languageCategoryListCodec, res.data);

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
        categoryList.value = res.data.data;
        paginationCategoryList.total = res.data.page_info.total;
        paginationCategoryList.page = res.data.page_info.current_page;
        paginationCategoryList.perPage = res.data.page_info.per_page;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const isGoodDetailOpen = computed(
  () => selectedDetailProductData.value.goodDetailOpen === 'Y',
);

// 상세설명 수동 번역 disabled 조건
const disableDetailManualTranslate = (
  detailItem: requestTranslateProductDetailType,
) => {
  if (!isGoodDetailOpen.value || !detailItem.savedOriginName) return true;
  if (!isGlobalAdmin()) return detailItem.lang_trans_type === 'ko';
  return false;
};

// 상세설명 번역 요청 값 생성
const getTranslateProductDetailParams = () => {
  const languageArray = ['ko', 'en', 'jp', 'zh_hans', 'zh_hant'];
  const getTransName = (item: string): string => {
    let transName = '';
    selectedDetailProductData.value.goodHtml_array?.forEach((data) => {
      if (data.lang_trans_type === item) {
        transName = data.trans_name;
      }
    });
    return transName;
  };
  requestTranslateProductDetailParams.value = [];
  languageArray.forEach((item) => {
    requestTranslateProductDetailParams.value.push({
      item_type: 'goods_html',
      storeCode: pathQuery.code as string,
      T_order_store_good_code: selectedDetailProductData.value.goodCode,
      lang_trans_type: item,
      origin_name: selectedDetailProductData.value.goodHtml,
      trans_name: getTransName(item),
      savedOriginName: selectedDetailProductData.value.goodHtml,
    });
  });
};

// 상세설명 조회
const requestProductDetailInfoLists = async (
  posGoodCode: string,
  showLoading: boolean = true,
) => {
  try {
    const data = {
      posGoodCode,
      storeCode: pathQuery.code as string,
    };
    loading.value = showLoading;
    const res = (await requestProductDetailInfo(data)) as AxiosResponse;
    const typeError = runtimeCheck(productDetailInfoCodec, res.data);

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
        selectedDetailProductData.value = res.data.data;
        getTranslateProductDetailParams();
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 선택 상품 상세 조회
const getProductDetailInfo = (posGoodCode: string) => {
  requestProductDetailInfoLists(posGoodCode);
  selectedDetailProductPosCode.value = posGoodCode;
};

const getLanguageName = (lang: string) => {
  if (lang === 'ko') {
    return '한글';
  }
  if (lang === 'en') {
    return '영문';
  }
  if (lang === 'jp') {
    return '일어';
  }
  if (lang === 'zh_hans') {
    return '간체';
  }
  if (lang === 'zh_hant') {
    return '번체';
  }
  return '';
};

// 상세 상품 번역 요청
const requestTranslateProductDetails = async (
  params: requestTranslateProductDetailType,
  langType?: string,
) => {
  if (!params.trans_name) {
    ElMessage({
      type: 'error',
      message: '변경 사항이 없으므로 저장할 수 없습니다.',
    });
    return;
  }
  ElMessageBox.confirm(
    `해당 상품의 ${langType} 상세 설명을 저장하시겠습니까?`,
    `${langType} 상세설명을 저장합니다.`,
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(async () => {
    try {
      loading.value = true;
      const res = (await requestTranslateProductDetail(
        params,
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
        await requestProductList();
        await requestProductDetailInfoLists(selectedDetailProductPosCode.value);
        ElMessage({
          type: 'success',
          message: '정상적으로 저장되었습니다.',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  });
};

// 티오더1 옵션 그룹 리스트 조회
const requestOptionGroupLists = async (
  page: number,
  perPage: number,
  showLoading: boolean = true,
) => {
  try {
    const requestData = {
      storeCode: pathQuery.code as string,
      page,
      perPage,
    };
    loading.value = showLoading;
    const res = (await requestOptionGroupList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(languageOptionGroupListCodec, res.data);

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
        optionGroupList.value = res.data.data;
        paginationOptionGroupList.total = res.data.page_info.total;
        paginationOptionGroupList.page = res.data.page_info.current_page;
        paginationOptionGroupList.pageSize = res.data.page_info.per_page;
        paginationOptionGroupList.from = res.data.page_info.from;
        paginationOptionGroupList.to = res.data.page_info.to;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 티오더2 옵션 그룹 리스트 조회
const requestOrderTwoOptionGroupLists = async (showLoading: boolean = true) => {
  try {
    const requestData = {
      storeCode: paginationOrderTwoOptionGroupList.storeCode,
      type: 'list',
      page: paginationOrderTwoOptionGroupList.page,
      perPage: paginationOrderTwoOptionGroupList.perPage,
      searchTxt: paginationOrderTwoOptionGroupList.searchTxt,
    };
    loading.value = showLoading;
    const res = (await requestOrderTwoOptionGroupListExcelDownload(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      orderTwoOptionGroupListExcelDownloadCodec,
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
        orderTwoOptionGroupList.value = res.data.data;
        paginationOrderTwoOptionGroupList.total = res.data.page_info.total;
        paginationOrderTwoOptionGroupList.page =
          res.data.page_info.current_page;
        paginationOrderTwoOptionGroupList.perPage = res.data.page_info.per_page;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 티오더2 옵션 상품 리스트 조회
const requestOrderTwoOptionMenuLists = async (showLoading: boolean = true) => {
  try {
    const requestData = {
      storeCode: paginationOrderTwoOptionMenuList.storeCode,
      type: 'list',
      page: paginationOrderTwoOptionMenuList.page,
      perPage: paginationOrderTwoOptionMenuList.perPage,
      searchTxt: paginationOrderTwoOptionMenuList.searchTxt,
    };
    loading.value = showLoading;
    const res = (await requestOrderTwoOptionMenuListExcelDownload(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      orderTwoOptionMenuListExcelDownloadCodec,
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
        orderTwoOptionMenuList.value = res.data.data;
        paginationOrderTwoOptionMenuList.total = res.data.page_info.total;
        paginationOrderTwoOptionMenuList.page = res.data.page_info.current_page;
        paginationOrderTwoOptionMenuList.perPage = res.data.page_info.per_page;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const isDetailInfo = (status: string) => {
  if (status === 'N') {
    return 'warning';
  }
  return 'success';
};

// 상품 리스트 검색 초기화
const resetProductList = () => {
  paginationProductList.page = 1;
  paginationProductList.perPage = 10;
  paginationProductList.searchTxt = '';
  requestProductList();
};

// 상품 리스트 검색
const searchProductList = () => {
  paginationProductList.page = 1;
  paginationProductList.perPage = 10;
  requestProductList();
};

// 분류 리스트 검색
const searchCategoryList = (searchTxt: string) => {
  requestCategoryList(1, 10, searchTxt);
};

// 상세설명 리스트 검색 초기화
const resetDetailDescriptionList = () => {
  paginationDetailDescriptionList.page = 1;
  paginationDetailDescriptionList.perPage = 10;
  paginationDetailDescriptionList.searchTxt = '';
  paginationDetailDescriptionList.useDetailOpen = '';
  paginationDetailDescriptionList.inUse = '';

  requestDetailDescriptionList();
};
// 상품 리스트 검색 초기화
const resetCategoryList = () => {
  requestCategoryList(1, 10, '');
  paginationCategoryList.searchTxt = '';
};

// 티오더2 옵션 그룹 검색 초기화
const resetOrderTwoOptionGroupList = () => {
  paginationOrderTwoOptionGroupList.searchTxt = '';
  paginationOrderTwoOptionGroupList.page = 1;
  paginationOrderTwoOptionGroupList.perPage = 10;
  requestOrderTwoOptionGroupLists();
};

// 티오더2 옵션 상품 검색 초기화
const resetOrderTwoOptionMenuList = () => {
  paginationOrderTwoOptionMenuList.searchTxt = '';
  paginationOrderTwoOptionMenuList.page = 1;
  paginationOrderTwoOptionMenuList.perPage = 10;
  requestOrderTwoOptionMenuLists();
};

// 상품 리스트 페이지네이션
const handleProductListPage = (val: number) => {
  paginationProductList.page = val;
  requestProductList();
};

// 상품 리스트 페이지네이션
const handleDetailDescriptionListPage = (val: number) => {
  paginationDetailDescriptionList.page = val;
  requestDetailDescriptionList();
};

// 분류 리스트 페이지네이션
const handleCategoryListPage = (val: number) => {
  paginationCategoryList.page = val;
  requestCategoryList(
    paginationCategoryList.page,
    paginationCategoryList.perPage,
    paginationCategoryList.searchTxt,
  );
};

// 옵션그룹 리스트 페이지네이션
const handleOptionGroupListPage = (val: number) => {
  paginationOptionGroupList.page = val;
  requestOptionGroupLists(
    paginationOptionGroupList.page,
    paginationOptionGroupList.pageSize,
  );
};

// 티오더2 옵션 그룹 리스트 페이지네이션
const handleOrderTwoOptionGroupListPage = (val: number) => {
  paginationOrderTwoOptionGroupList.page = val;
  requestOrderTwoOptionGroupLists();
};

// 티오더2 옵션 상품 리스트 페이지네이션
const handleOrderTwoOptionMenuListPage = (val: number) => {
  paginationOrderTwoOptionMenuList.page = val;
  requestOrderTwoOptionMenuLists();
};

// 선택 옵션 그룹 내 옵션 그룹 타입 정보
const selectedOptionGroupData: Ref<optionGroupType> = ref(
  {} as optionGroupType,
);

// 선택 옵션그룹 정보 가져오기
const getSelectedOptionGroupTranslationInfo = (
  optionGroup: optionGroupType,
) => {
  if (optionGroup) {
    selectedOptionGroupTranslationInfo.T_order_good_option_no =
      optionGroup.group_num;
    selectedOptionGroupTranslationInfo.origin_name = optionGroup.name;
    selectedOptionGroupTranslationInfo.ko = optionGroup.name_array.ko;
    selectedOptionGroupTranslationInfo.en = optionGroup.name_array.en;
    selectedOptionGroupTranslationInfo.jp = optionGroup.name_array.jp;
    selectedOptionGroupTranslationInfo.zh_hans = optionGroup.name_array.zh_hans;
    selectedOptionGroupTranslationInfo.zh_hant = optionGroup.name_array.zh_hant;
  }
};

// 선택 상품 옵션그룹 정보 가져오기
const getSelectedOptionGroup = (goodsCode: string) => {
  const filteredItem = optionGroupList.value
    .filter((item) => item.T_order_store_good_code === goodsCode)
    .pop();
  if (filteredItem) {
    // 다른 상품 선택 시 tab index 0으로 초기화
    if (selectedOptionGroup.value.T_order_store_good_code) {
      if (
        selectedOptionGroup.value.T_order_store_good_code !==
        filteredItem.T_order_store_good_code
      ) {
        selectedOptionGroupTab.value = '0';
      }
    }
    selectedOptionGroup.value = filteredItem;
    selectedOptionGroupTranslationInfo.type = 'option_group';
    selectedOptionGroupTranslationInfo.storeCode = pathQuery.code as string;
    selectedOptionGroupTranslationInfo.goodCode =
      filteredItem.T_order_store_good_code;
    getSelectedOptionGroupTranslationInfo(
      filteredItem.option_group[Number(selectedOptionGroupTab.value)],
    );

    const [firstInfo] = selectedOptionGroup.value.option_group;
    if (firstInfo) {
      selectedOptionGroupData.value = firstInfo;
    }
  }
};

// 상품 전체 번역하기
const requestTranslateAllProductList = () => {
  ElMessageBox.confirm(
    '처리량에 따라 1분 이상의 시간이 소요될 수 있습니다.',
    '모든 상품을 번역하시겠습니까?',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(async () => {
    try {
      const config = pathQuery.code as string;
      loading.value = true;
      const res = (await requestTranslateAllProduct(config)) as AxiosResponse;

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
        await requestProductList();
        ElMessage({
          type: 'success',
          message: '정상적으로 번역되었습니다.',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  });
};

// 옵션그룹 전체 번역 함수
const papagoTranslateOptionGroup = async (type: string) => {
  const data = {
    storeCode: pathQuery.code as string,
    type,
  };

  try {
    loading.value = true;
    const res = (await requestPapagoTranslateAllOptionGroup(
      data,
    )) as AxiosResponse;
    const typeError = runtimeCheck(translateAllOptionGroupCodec, res.data);

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
        await requestOptionGroupLists(1, 13);
        getSelectedOptionGroup(selectedOptionGroupTranslationInfo.goodCode);
        ElMessage({
          type: 'success',
          message: '정상적으로 번역되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 상품 상세설명 갱신 후 재선택 */
const reselectNowDescription = async (showLoading = true) => {
  await requestDetailDescriptionList(showLoading);
  if (selectedDetailProductData.value.posGoodCode) {
    getProductDetailInfo(selectedDetailProductData.value.posGoodCode);
  }
  getTranslateProductDetailParams();
};

/** 상품 상세설명 수정하기 */
const postUpdateDescriptionInfo = async () => {
  if (selectedDetailProductData.value.goodHtml === '') {
    ElMessage({
      type: 'error',
      message: '변경 사항이 없으므로 저장할 수 없습니다.',
    });
    return;
  }
  const requestData = {
    storeCode: route.query.code as string,
    goodCode: selectedDetailProductData.value.goodCode,
    posGoodCode: selectedDetailProductData.value.posGoodCode,
    goodDetailOpen: selectedDetailProductData.value.goodDetailOpen,
    goodHtml: selectedDetailProductData.value.goodHtml,
  };
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
      await reselectNowDescription();
      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 옵션 상품 조회 클릭이벤트
const selectedTableOptionGroup = reactive({
  type: 'option_group',
  goodCode: '',
  T_order_good_option_no: 0,
  origin_name: '',
  ko: '',
  en: '',
  jp: '',
  zh_hans: '',
  zh_hant: '',
  group_num: 0,
});
const selectedTableOptionMenuList: Ref<requestOrderOneOptionMenuType[]> = ref(
  [],
);
const clickGetOptionGroupData = (
  goodCode: string,
  groupData: optionGroupType,
) => {
  selectedTableOptionGroup.goodCode = goodCode;
  selectedTableOptionGroup.origin_name = groupData.name;
  selectedTableOptionGroup.group_num = groupData.group_num;
  selectedTableOptionGroup.ko = groupData.name_array.ko;
  selectedTableOptionGroup.en = groupData.name_array.en;
  selectedTableOptionGroup.jp = groupData.name_array.jp;
  selectedTableOptionGroup.zh_hans = groupData.name_array.zh_hans;
  selectedTableOptionGroup.zh_hant = groupData.name_array.zh_hant;
  selectedTableOptionMenuList.value = groupData.option_item;
};

/** 옵션 상품 수정후 데이터 최신화 */
const refreshOptionMenuLanguageData = (langGoodCode: string) => {
  const targetOptionGroupInList = optionGroupList.value.find(
    (oGroupInList: optionGroupListType) =>
      oGroupInList.T_order_store_good_code === langGoodCode,
  );
  const targetOptionGroup = targetOptionGroupInList?.option_group.find(
    (oGroup: optionGroupType) =>
      oGroup.group_num === selectedTableOptionGroup.group_num,
  );
  if (targetOptionGroup) {
    clickGetOptionGroupData(langGoodCode, targetOptionGroup);
  }
};

// 옵션 단일 번역 수정 모달
const openOptionTranslateModal = (
  type: string,
  goodCode: string,
  optionData: any,
) => {
  const data = {
    type,
    storeCode: pathQuery.code as string,
    goodCode,
    origin_name: optionData.origin_name,
    T_order_good_option_no: optionData.T_order_good_option_no, // api1 옵션그룹,옵션 상품 모두 사용: 옵션 그룹의 group_num
    T_order_good_option_group_no: optionData.T_order_good_option_group_no, // api2 옵션그룹: 옵션그룹 넘버
    T_order_store_good_option_code: optionData.T_order_store_good_option_code, // api2 옵션상품: 옵션그룹 코드
    ko: optionData.ko,
    en: optionData.en,
    jp: optionData.jp,
    zh_hans: optionData.zh_hans,
    zh_hant: optionData.zh_hant,
  };
  openModalWithData(OPTION_TRANSLATE, data);
};

// 티오더1 옵션그룹 단일번역 수정
const optionGroupOneUpdate = (goodCode: string, groupData: optionGroupType) => {
  clickGetOptionGroupData(goodCode, groupData);
  openOptionTranslateModal('option_group', goodCode, {
    origin_name: groupData.name,
    T_order_good_option_no: groupData.group_num,
    ko: groupData.name_array.ko,
    en: groupData.name_array.en,
    jp: groupData.name_array.jp,
    zh_hans: groupData.name_array.zh_hans,
    zh_hant: groupData.name_array.zh_hant,
  });
};

// 상세설명 내용 포함 각 언어로 파파고 링크 던져주기.
const getPapagoLink = (language: string) => {
  if (language === '영문 번역') {
    return `https://papago.naver.com/?sk=ko&tk=en&st=${selectedDetailProductData.value.goodHtml}`;
  }
  if (language === '일어 번역') {
    return `https://papago.naver.com/?sk=ko&tk=ja&hn=0&st=${selectedDetailProductData.value.goodHtml}`;
  }
  if (language === '간체 번역') {
    return `https://papago.naver.com/?sk=ko&tk=zh-CN&st=${selectedDetailProductData.value.goodHtml}`;
  }
  if (language === '번체 번역') {
    return `https://papago.naver.com/?sk=ko&tk=zh-TW&st=${selectedDetailProductData.value.goodHtml}`;
  }
  return '';
};

const linkPapago = (language: string) =>
  window.open(getPapagoLink(language), '_blank');

const papagoTranslateOptionMenu = async (type: string) => {
  const data = {
    storeCode: pathQuery.code as string,
    type,
  };

  try {
    loading.value = true;
    const res = (await requestPapagoTranslateAllOptionMenu(
      data,
    )) as AxiosResponse;
    const typeError = runtimeCheck(translateAllOptionGroupCodec, res.data);

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
        await requestOptionGroupLists(1, 13);
        refreshOptionMenuLanguageData(selectedTableOptionGroup.goodCode);
        ElMessage({
          type: 'success',
          message: '정상적으로 번역되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 엑셀 다운로드 api url  */
const excelDownloadUrl = reactive({
  goodsList: `storeCode=${pathQuery.code}`,
  // group or item
  optionGroupFlag: 'optionGroup',
  optionMenuFlag: 'optionMenu',
});

const resetSelectedData = () => {
  selectedTableOptionGroup.origin_name = '';
};

const setChangTab = (tab: TabsPaneContext) => {
  activeTab.value = tab.props.name as string;

  // 탭별 api 호출
  if (activeTab.value === 'product') requestProductList();
  if (activeTab.value === 'category') requestCategoryList(1, 10);
  if (activeTab.value === 'optionGroup') requestOptionGroupLists(1, 13);
  if (activeTab.value === 'description') {
    requestTranslateProductDetailParams.value = [];
    requestDetailDescriptionList();
  }

  if (apiType.value === '2.0') {
    if (activeTab.value === 'orderTwoOptionGroup') {
      requestOrderTwoOptionGroupLists();
    }
    if (activeTab.value === 'orderTwoOptionMenu') {
      requestOrderTwoOptionMenuLists();
    }
  }
};

requestProductList();
</script>

<template>
  <ExcelUploadAndDownloadModal
    v-if="flag.excelUploadAndDownload"
    :activeTab="activeTab"
    :refreshOptionMenuLanguageData="
      () => refreshOptionMenuLanguageData(selectedTableOptionGroup.goodCode)
    "
    :requestCategoryList="
      () =>
        requestCategoryList(
          paginationCategoryList.page,
          paginationCategoryList.perPage,
          paginationCategoryList.searchTxt,
          false,
        )
    "
    :requestOptionGroupLists="() => requestOptionGroupLists(1, 13, false)"
    :requestOrderTwoOptionGroupList="
      () => requestOrderTwoOptionGroupLists(false)
    "
    :requestOrderTwoOptionMenuLists="
      () => requestOrderTwoOptionMenuLists(false)
    "
    :requestProductList="() => requestProductList(false)"
    :reselectNowDescription="() => reselectNowDescription(false)"
  />
  <LanguageTranslateModal
    v-if="flag.languageTranslate"
    :requestCategory="
      () =>
        requestCategoryList(
          paginationCategoryList.page,
          paginationCategoryList.perPage,
          paginationCategoryList.searchTxt,
          false,
        )
    "
    :requestProductList="() => requestProductList(false)"
  />
  <OptionTranslateModal
    v-if="flag.optionTranslate"
    :refreshOptionMenuLanguageData="
      () => refreshOptionMenuLanguageData(selectedTableOptionGroup.goodCode)
    "
    :requestOptionGroupLists="() => requestOptionGroupLists(1, 13, false)"
    :requestOrderTwoOptionGroupLists="
      () => requestOrderTwoOptionGroupLists(false)
    "
    :requestOrderTwoOptionMenuLists="
      () => requestOrderTwoOptionMenuLists(false)
    "
  />
  <OptionGroupAllTranslationModal
    v-if="flag.optionGroupAllTranslation"
    :papagoTranslateOptionGroup="
      (type: string) => papagoTranslateOptionGroup(type)
    "
  />
  <OptionMenuAllTranslationModal
    v-if="flag.optionMenuAllTranslation"
    :papagoTranslateOptionMenu="
      (type: string) => papagoTranslateOptionMenu(type)
    "
    :resetSelectedData="resetSelectedData"
  />
  <BreadcrumbHeader :propsHeader="languageManageHeader" />
  <StoreNameBox />
  <el-tabs
    v-model="activeTab"
    type="border-card"
    @tab-click="setChangTab"
  >
    <el-tab-pane
      label="상품 리스트"
      name="product"
    >
      <el-row
        align="middle"
        class="mb-10"
      >
        <span class="mr-20">분류에 설정된 상품</span>
        <el-radio-group
          v-model="paginationProductList.inUse"
          @change="requestProductList"
        >
          <el-radio :label="''"> 전체</el-radio>
          <el-radio :label="'Y'"> 설정</el-radio>
          <el-radio :label="'N'"> 미설정</el-radio>
        </el-radio-group>
      </el-row>
      <el-row
        align="middle"
        class="mb-20"
        justify="space-between"
      >
        <el-row align="middle">
          <span class="mr-10"> 상품 검색 </span>
          <div class="mr-10">
            <el-input
              v-model="paginationProductList.searchTxt"
              class="search-input"
              placeholder="상품코드 • 포스 상품명 • 태블릿 노출 상품명을 입력해주세요."
              @keyup.enter="searchProductList()"
            />
          </div>
          <div>
            <el-button
              :icon="Search"
              round
              type="primary"
              @click="searchProductList()"
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
          </div>
        </el-row>
        <el-row align="middle">
          <el-button
            v-if="
              checkAuthFunction('F2001') && (isOriginAdmin() || isBrand1Admin())
            "
            id="F2001"
            @click="requestTranslateAllProductList"
          >
            전체 번역하기
          </el-button>
          <el-button
            v-if="checkAuthFunction('F2002')"
            id="F2002"
            type="success"
            @click="
              openModalWithData(EXCEL_UPLOAD_AND_DOWNLOAD, {
                storeCode: paginationProductList.storeCode,
                type: 'excel',
                searchTxt: paginationProductList.searchTxt,
                inUse: paginationProductList.inUse,
              })
            "
          >
            엑셀 업로드/다운로드
          </el-button>
        </el-row>
      </el-row>
      <el-table
        v-loading="loading"
        :data="productList"
        border
        class="mb-20"
        height="530"
        style="width: 100%"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품 코드"
          prop="goods_code"
          width="95"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="포스 상품명"
          prop="pos_name"
          width="180"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="태블릿 노출 상품명"
          prop="display_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="한글"
        >
          <template #default="{ row }">
            {{ row.lang.ko }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="영어"
        >
          <template #default="{ row }">
            {{ row.lang.en }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(간체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hans }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(번체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hant }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="일본어"
        >
          <template #default="{ row }">
            {{ row.lang.jp }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="수정"
          width="150"
        >
          <template #default="{ row }">
            <el-button
              type="warning"
              @click="
                openModalWithData(LANGUAGE_TRANSLATE, {
                  type: 'goods',
                  code: row.goods_code,
                  display_name: row.display_name,
                  pos_name: row.pos_name,
                  lang: row.lang,
                })
              "
            >
              수정
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row
        align="middle"
        justify="center"
      >
        <el-pagination
          :current-page="paginationProductList.page"
          :page-size="paginationProductList.perPage"
          :total="paginationProductList.total"
          background
          layout="prev, pager, next"
          @current-change="handleProductListPage"
        />
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      label="분류 리스트"
      name="category"
    >
      <el-row
        align="middle"
        class="mb-10"
      >
        <span class="mr-20">노출 여부</span>
        <el-radio-group
          v-model="paginationCategoryList.inUse"
          @change="searchCategoryList(paginationCategoryList.searchTxt)"
        >
          <el-radio :label="''"> 전체</el-radio>
          <el-radio :label="'Y'"> 노출</el-radio>
          <el-radio :label="'N'"> 미노출</el-radio>
        </el-radio-group>
      </el-row>
      <el-row
        align="middle"
        class="mb-20"
      >
        <el-row
          align="middle"
          class="width-100"
          justify="space-between"
        >
          <el-row align="middle">
            <span class="mr-10"> 분류 검색 </span>
            <el-input
              v-model="paginationCategoryList.searchTxt"
              class="search-input mr-10"
              placeholder="분류 코드 • 분류 이름을 입력해주세요."
              @keyup.enter="
                searchCategoryList(paginationCategoryList.searchTxt)
              "
            />
            <el-button
              :icon="Search"
              round
              type="primary"
              @click="searchCategoryList(paginationCategoryList.searchTxt)"
            >
              검색
            </el-button>
            <el-button
              :icon="RefreshRight"
              round
              @click="resetCategoryList"
            >
              초기화
            </el-button>
          </el-row>
          <el-row align="middle">
            <el-button
              v-if="checkAuthFunction('F2004')"
              id="F2004"
              type="success"
              @click="
                openModalWithData(EXCEL_UPLOAD_AND_DOWNLOAD, {
                  storeCode: paginationCategoryList.storeCode,
                  type: paginationCategoryList.type,
                  searchTxt: paginationCategoryList.searchTxt,
                  inUse: paginationCategoryList.inUse,
                })
              "
            >
              엑셀 업로드/다운로드
            </el-button>
          </el-row>
        </el-row>
      </el-row>
      <el-table
        v-loading="loading"
        :data="categoryList"
        border
        class="mb-20"
        style="width: 100%"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="분류 코드"
          prop="category_code"
          width="180"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="분류 이름"
          prop="category_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="한글"
        >
          <template #default="{ row }">
            {{ row.lang.ko }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="영어"
        >
          <template #default="{ row }">
            {{ row.lang.en }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(간체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hans }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(번체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hant }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="일본어"
        >
          <template #default="{ row }">
            {{ row.lang.jp }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="수정"
          width="150"
        >
          <template #default="{ row }">
            <el-button
              type="warning"
              @click="
                openModalWithData(LANGUAGE_TRANSLATE, {
                  type: 'category',
                  code: row.category_code,
                  display_name: row.category_name,
                  pos_name: undefined,
                  lang: row.lang,
                })
              "
            >
              수정
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row
        align="middle"
        justify="center"
      >
        <el-pagination
          :current-page="paginationCategoryList.page"
          :page-size="paginationCategoryList.perPage"
          :total="paginationCategoryList.total"
          background
          layout="prev, pager, next"
          @current-change="handleCategoryListPage"
        />
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      v-loading="loading"
      label="상세설명 리스트"
      name="description"
    >
      <el-row>
        <div class="detail-product-list">
          <el-scrollbar>
            <el-row
              align="middle"
              class="mb-10"
            >
              <span class="mr-20">상세설명 여부</span>
              <el-radio-group
                v-model="paginationDetailDescriptionList.useDetailOpen"
                @change="requestDetailDescriptionList"
              >
                <el-radio :label="''"> 전체</el-radio>
                <el-radio :label="'Y'"> 사용</el-radio>
                <el-radio :label="'N'"> 미사용</el-radio>
              </el-radio-group>
            </el-row>
            <div class="search-description-wrapper">
              <el-input
                v-model="paginationDetailDescriptionList.searchTxt"
                class="flex-1"
                clearable
                placeholder="검색어를 입력해주세요."
                @keyup.enter="requestDetailDescriptionList"
              />
              <el-row>
                <el-button
                  :icon="Search"
                  round
                  type="primary"
                  @click="requestDetailDescriptionList"
                >
                  검색
                </el-button>
                <el-button
                  :icon="RefreshRight"
                  round
                  @click="resetDetailDescriptionList"
                >
                  초기화
                </el-button>
              </el-row>
              <div>
                <el-button
                  v-if="checkAuthFunction('F2005')"
                  id="F2005"
                  type="success"
                  @click="
                    openModalWithData(EXCEL_UPLOAD_AND_DOWNLOAD, {
                      storeCode: paginationDetailDescriptionList.storeCode,
                      type: paginationDetailDescriptionList.type,
                      searchTxt: paginationDetailDescriptionList.searchTxt,
                      inUse: paginationDetailDescriptionList.inUse,
                      useDetailOpen:
                        paginationDetailDescriptionList.useDetailOpen,
                    })
                  "
                >
                  엑셀 업로드/다운로드
                </el-button>
              </div>
            </div>
            <el-table
              :data="detailDescriptionList"
              :height="isGlobalAdmin() ? '480px' : '560px'"
              highlight-current-row
            >
              <el-table-column
                align="center"
                header-align="center"
                label="태블릿 노출 상품명"
              >
                <template #default="{ row }">
                  <p
                    class="product-name"
                    @click="getProductDetailInfo(row.goods_code)"
                  >
                    {{ row.display_name }}
                  </p>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                header-align="center"
                label="상품코드"
              >
                <template #default="{ row }">
                  <p
                    class="product-name"
                    @click="getProductDetailInfo(row.goods_code)"
                  >
                    {{ row.goods_code }}
                  </p>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                header-align="center"
                label="상세설명 여부"
              >
                <template #default="{ row }">
                  <p
                    class="product-name"
                    @click="getProductDetailInfo(row.goods_code)"
                  >
                    <el-tag :type="isDetailInfo(row.detail_open)">
                      {{ row.detail_open }}
                    </el-tag>
                  </p>
                </template>
              </el-table-column>
            </el-table>
            <el-row
              align="middle"
              class="mt-10"
              justify="center"
            >
              <el-pagination
                :current-page="paginationDetailDescriptionList.page"
                :page-size="paginationDetailDescriptionList.perPage"
                :total="paginationDetailDescriptionList.total"
                background
                layout="prev, pager, next"
                @current-change="handleDetailDescriptionListPage"
              />
            </el-row>
          </el-scrollbar>
        </div>
        <div
          v-if="!requestTranslateProductDetailParams.length"
          class="detail-product-description"
        >
          <el-descriptions
            :column="1"
            border
            class="width-100"
            direction="vertical"
            size="large"
          >
            <el-descriptions-item label="상품 상세설명">
              <el-scrollbar height="120px">
                상품을 선택해 주세요.
              </el-scrollbar>
            </el-descriptions-item>
            <el-descriptions-item
              v-if="!isGlobalAdmin()"
              label="파파고 번역 링크"
            >
              <el-button
                v-for="(language, i) in translateList.filter(
                  (item) => !item.includes('한글'),
                )"
                :key="i"
                disabled
                plain
                type="success"
              >
                {{ language }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item label="상세설명 수동 번역">
              <el-container class="mt-10 detail-product-translate-wrapper">
                <el-tabs
                  v-model="activeTag"
                  class="width-100"
                  type="border-card"
                >
                  <el-tab-pane
                    v-for="(params, i) in translateList"
                    :key="i"
                    :label="params.replace(' 번역', '')"
                    :name="i"
                    disabled
                  >
                    <el-form label-position="top">
                      <el-form-item>
                        <el-input
                          :rows="7"
                          disabled
                          input-style="width: 100%"
                          resize="none"
                          type="textarea"
                        />
                        <div class="detail-product-confirm-button-wrapper">
                          <el-button
                            disabled
                            type="danger"
                          >
                            {{ params.replace(' 번역', ' 상세설명 저장하기') }}
                          </el-button>
                        </div>
                      </el-form-item>
                    </el-form>
                  </el-tab-pane>
                </el-tabs>
              </el-container>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div
          v-else
          class="detail-product-description"
        >
          <el-descriptions
            :column="1"
            border
            class="width-100"
            direction="vertical"
            size="large"
          >
            <el-descriptions-item>
              <template #label>
                <el-row
                  align="middle"
                  justify="space-between"
                >
                  <p>상품 상세설명</p>
                  <el-switch
                    v-model="selectedDetailProductData.goodDetailOpen"
                    active-text="사용"
                    active-value="Y"
                    inactive-text="미사용"
                    inactive-value="N"
                    style="
                      --el-switch-on-color: #409eff;
                      --el-switch-off-color: #f56c6c;
                    "
                  />
                </el-row>
              </template>
              <el-scrollbar height="120px">
                <div class="detail-product-translate-wrapper">
                  <el-input
                    v-model="selectedDetailProductData.goodHtml"
                    :disabled="!isGoodDetailOpen"
                    :rows="5"
                    placeholder="상품 상세 설명을 입력해주세요."
                    resize="none"
                    type="textarea"
                  />
                  <div class="detail-product-confirm-button-wrapper">
                    <el-button
                      type="primary"
                      @click="postUpdateDescriptionInfo"
                    >
                      상세설명 저장
                    </el-button>
                  </div>
                </div>
              </el-scrollbar>
            </el-descriptions-item>
            <el-descriptions-item
              v-if="!isGlobalAdmin()"
              label="파파고 번역 링크"
            >
              <el-button
                v-for="(language, i) in translateList.filter(
                  (item) => !item.includes('한글'),
                )"
                :key="i"
                plain
                type="success"
                @click="linkPapago(language)"
              >
                {{ language }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item label="상세설명 수동 번역">
              <el-container class="mt-10 detail-product-translate-wrapper">
                <el-tabs
                  v-model="activeTag"
                  class="width-100"
                  type="border-card"
                >
                  <el-tab-pane
                    v-for="(params, i) in requestTranslateProductDetailParams"
                    :key="i"
                    :label="getLanguageName(params.lang_trans_type)"
                    :name="i"
                  >
                    <el-form label-position="top">
                      <el-form-item>
                        <el-input
                          v-model="params.trans_name"
                          :disabled="disableDetailManualTranslate(params)"
                          :placeholder="`${getLanguageName(params.lang_trans_type)} 상세설명을 입력해주세요.`"
                          :rows="7"
                          class="width-100"
                          resize="none"
                          type="textarea"
                        />
                        <div class="detail-product-confirm-button-wrapper">
                          <el-button
                            :disabled="disableDetailManualTranslate(params)"
                            type="danger"
                            @click="
                              requestTranslateProductDetails(
                                params,
                                getLanguageName(params.lang_trans_type),
                              )
                            "
                          >
                            {{
                              `${getLanguageName(params.lang_trans_type)} 상세설명 저장하기`
                            }}
                          </el-button>
                        </div>
                      </el-form-item>
                    </el-form>
                  </el-tab-pane>
                </el-tabs>
              </el-container>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      v-if="apiType === '1.0'"
      v-loading="loading"
      label="옵션그룹 & 상품 리스트"
      name="optionGroup"
    >
      <el-row
        class="mb-10 width-100"
        justify="space-between"
      >
        <el-row
          align="bottom"
          class="option-group-list-wrap"
          justify="end"
        >
          <el-row
            v-if="!isGlobalAdmin()"
            align="bottom"
            class="mr-10"
          >
            <span class="font-small essential-star mr-10">
              * 일괄번역은 파파고를 사용합니다.
            </span>
            <el-button
              v-if="checkAuthFunction('F2006')"
              id="F2006"
              color="#000"
              @click="openModal(OPTION_GROUP_ALL_TRANSLATION)"
            >
              <img
                alt="파파고 아이콘"
                class="papago-img mr-10"
                src="@assets/papago.png"
              />
              옵션그룹 일괄번역
            </el-button>
          </el-row>
          <el-button
            v-if="checkAuthFunction('F2007')"
            id="F2007"
            type="success"
            @click="
              openModalWithData(
                EXCEL_UPLOAD_AND_DOWNLOAD,
                excelDownloadUrl.optionGroupFlag,
              )
            "
          >
            엑셀 업로드/다운로드
          </el-button>
        </el-row>
        <el-row
          class="option-group-list-wrap"
          justify="end"
        >
          <el-button
            v-if="!isGlobalAdmin()"
            color="#000"
            @click="openModal(OPTION_MENU_ALL_TRANSLATION)"
          >
            <img
              alt="파파고 아이콘"
              class="papago-img mr-10"
              src="@assets/papago.png"
            />
            옵션상품 일괄번역
          </el-button>
          <el-button
            type="success"
            @click="
              openModalWithData(
                EXCEL_UPLOAD_AND_DOWNLOAD,
                excelDownloadUrl.optionMenuFlag,
              )
            "
          >
            엑셀 업로드/다운로드
          </el-button>
        </el-row>
      </el-row>
      <el-row>
        <div class="option-group-list-wrap">
          <el-table
            :data="optionGroupList"
            border
            class="mb-20"
            height="560"
            style="width: 100%"
          >
            <el-table-column
              align="center"
              header-align="center"
              label="태블릿 노출 상품명"
              width="131"
            >
              <template #default="scope">
                <el-row>
                  <el-col>
                    <el-tag
                      effect="plain"
                      round
                      type="info"
                    >
                      {{ scope.row.T_order_store_good_code }}
                    </el-tag>
                  </el-col>
                  <el-col>
                    <span class="font-small">
                      {{ scope.row.T_order_store_good_display_name }}
                    </span>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              header-align="center"
              label="옵션그룹 정보"
            >
              <template #default="{ row }">
                <el-table
                  v-loading="loading"
                  :data="row.option_group"
                  border
                  style="width: 100%"
                >
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="옵션그룹명"
                    prop="name"
                    width="110"
                  >
                    <template #default="scope">
                      <el-row>
                        <el-col>
                          <span>
                            {{ scope.row.name }}
                          </span>
                        </el-col>
                        <el-col>
                          <el-button
                            round
                            size="small"
                            @click="
                              clickGetOptionGroupData(
                                row.T_order_store_good_code,
                                scope.row,
                              )
                            "
                          >
                            옵션 상품 조회
                          </el-button>
                        </el-col>
                      </el-row>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="필수 여부"
                    width="80"
                  >
                    <template #default="scope">
                      <el-tag v-if="scope.row.required === 'Y'"> 필수</el-tag>
                      <el-tag
                        v-else
                        type="warning"
                      >
                        선택
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="한글"
                    prop="name_array.ko"
                  />
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="영어"
                    prop="name_array.en"
                  />
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="중국어(간체)"
                    prop="name_array.zh_hans"
                  />
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="중국어(번체)"
                    prop="name_array.zh_hant"
                  />
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="일본어"
                    prop="name_array.jp"
                  />
                  <el-table-column
                    align="center"
                    header-align="center"
                    label="수정"
                    width="70"
                  >
                    <template #default="scope">
                      <el-button
                        size="small"
                        type="warning"
                        @click="
                          optionGroupOneUpdate(
                            row.T_order_store_good_code,
                            scope.row,
                          )
                        "
                      >
                        수정
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
          </el-table>
          <el-row
            align="middle"
            class="mt-10"
            justify="center"
          >
            <el-pagination
              :page-size="paginationOptionGroupList.pageSize"
              :total="paginationOptionGroupList.total"
              background
              layout="prev, pager, next"
              @current-change="handleOptionGroupListPage"
            />
          </el-row>
        </div>

        <div
          v-if="selectedTableOptionGroup.origin_name"
          class="option-item-list-wrap"
        >
          <el-row
            align="middle"
            class="mb-20"
            justify="space-between"
          >
            <span>
              <span class="essential-star">
                {{ selectedTableOptionGroup.origin_name }}
              </span>
              의 옵션 상품 리스트
            </span>
          </el-row>
          <el-table
            :data="selectedTableOptionMenuList"
            border
          >
            <el-table-column
              align="center"
              header-align="center"
              label="옵션상품명"
            >
              <template #default="scope">
                <el-row>
                  <el-col>
                    <el-tag
                      effect="plain"
                      round
                      type="info"
                    >
                      {{ scope.row.T_order_store_good_option_code }}
                    </el-tag>
                  </el-col>
                  <el-col>
                    <span>
                      {{ scope.row.T_order_store_good_option_name }}
                    </span>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              header-align="center"
              label="한글"
              prop="T_order_store_good_option_name_array.ko"
            />
            <el-table-column
              align="center"
              header-align="center"
              label="영어"
              prop="T_order_store_good_option_name_array.en"
            />
            <el-table-column
              align="center"
              header-align="center"
              label="중국어(간체)"
              prop="T_order_store_good_option_name_array.zh_hans"
            />
            <el-table-column
              align="center"
              header-align="center"
              label="중국어(번체)"
              prop="T_order_store_good_option_name_array.zh_hant"
            />
            <el-table-column
              align="center"
              header-align="center"
              label="일본어"
              prop="T_order_store_good_option_name_array.jp"
            />
            <el-table-column
              align="center"
              header-align="center"
              label="수정"
              width="70"
            >
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="warning"
                  @click="
                    openOptionTranslateModal(
                      'option_item',
                      row.T_order_store_good_code,
                      {
                        T_order_good_option_no: row.T_order_good_option_no,
                        origin_name: row.T_order_store_good_option_name,
                        ko: row.T_order_store_good_option_name_array.ko,
                        en: row.T_order_store_good_option_name_array.en,
                        jp: row.T_order_store_good_option_name_array.jp,
                        zh_hans:
                          row.T_order_store_good_option_name_array.zh_hans,
                        zh_hant:
                          row.T_order_store_good_option_name_array.zh_hant,
                      },
                    )
                  "
                >
                  수정
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      v-if="apiType === '2.0'"
      label="옵션 그룹 리스트"
      name="orderTwoOptionGroup"
    >
      <el-row
        align="middle"
        class="mb-20"
      >
        <el-row
          align="middle"
          class="width-100"
          justify="space-between"
        >
          <el-row align="middle">
            <span class="mr-10"> 옵션 상품 이름•상품코드 검색 </span>
            <el-input
              v-model="paginationOrderTwoOptionGroupList.searchTxt"
              class="search-input mr-10"
              placeholder="검색어를 입력해주세요."
              @keyup.enter="requestOrderTwoOptionGroupLists()"
            />
            <el-button
              :icon="Search"
              round
              type="primary"
              @click="requestOrderTwoOptionGroupLists()"
            >
              검색
            </el-button>
            <el-button
              :icon="RefreshRight"
              round
              @click="resetOrderTwoOptionGroupList"
            >
              초기화
            </el-button>
          </el-row>
          <el-row align="middle">
            <el-button
              v-if="checkAuthFunction('F2008')"
              id="F2008"
              type="success"
              @click="
                openModalWithData(EXCEL_UPLOAD_AND_DOWNLOAD, {
                  storeCode: paginationOrderTwoOptionGroupList.storeCode,
                  type: paginationOrderTwoOptionGroupList.type,
                  searchTxt: paginationOrderTwoOptionGroupList.searchTxt,
                })
              "
            >
              엑셀 업로드/다운로드
            </el-button>
          </el-row>
        </el-row>
      </el-row>
      <el-table
        v-loading="loading"
        :data="orderTwoOptionGroupList"
        border
        class="mb-20"
        height="530"
        style="width: 100%"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품 정보"
        >
          <template #default="{ row }">
            {{
              `${convertToEllipsis(row.T_order_store_good_display_name, 10)}
            (${row.T_order_store_good_code})`
            }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="옵션 그룹 이름"
          prop="option_group_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="필수 여부"
          width="80"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.required === '선택'"
              type="warning"
            >
              {{ row.required }}
            </el-tag>
            <el-tag v-else>
              {{ row.required }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="한글"
        >
          <template #default="{ row }">
            {{ row.lang.ko }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="영어"
        >
          <template #default="{ row }">
            {{ row.lang.en }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(간체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hans }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(번체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hant }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="일본어"
        >
          <template #default="{ row }">
            {{ row.lang.jp }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="수정"
          width="80"
        >
          <template #default="{ row }">
            <el-button
              type="warning"
              @click="
                openOptionTranslateModal(
                  'step2_option_group',
                  row.T_order_store_good_code,
                  {
                    T_order_good_option_group_no:
                      row.T_order_good_option_group_no,
                    origin_name: row.option_group_name,
                    ko: row.lang.ko,
                    en: row.lang.en,
                    jp: row.lang.jp,
                    zh_hans: row.lang.zh_hans,
                    zh_hant: row.lang.zh_hant,
                  },
                )
              "
            >
              수정
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row
        align="middle"
        justify="center"
      >
        <el-pagination
          :current-page="paginationOrderTwoOptionGroupList.page"
          :page-size="paginationOrderTwoOptionGroupList.perPage"
          :total="paginationOrderTwoOptionGroupList.total"
          background
          layout="prev, pager, next"
          @current-change="handleOrderTwoOptionGroupListPage"
        />
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      v-if="apiType === '2.0'"
      label="옵션 상품 리스트"
      name="orderTwoOptionMenu"
    >
      <el-row
        align="middle"
        class="mb-20"
      >
        <el-row
          align="middle"
          class="width-100"
          justify="space-between"
        >
          <el-row align="middle">
            <span class="mr-10"> 옵션 상품 이름•상품코드 검색 </span>
            <el-input
              v-model="paginationOrderTwoOptionMenuList.searchTxt"
              class="search-input mr-10"
              placeholder="검색어를 입력해주세요."
              @keyup.enter="requestOrderTwoOptionMenuLists()"
            />
            <el-button
              :icon="Search"
              round
              type="primary"
              @click="requestOrderTwoOptionMenuLists()"
            >
              검색
            </el-button>
            <el-button
              :icon="RefreshRight"
              round
              @click="resetOrderTwoOptionMenuList"
            >
              초기화
            </el-button>
          </el-row>
          <el-row align="middle">
            <el-button
              v-if="checkAuthFunction('F2009')"
              id="F2009"
              type="success"
              @click="
                openModalWithData(EXCEL_UPLOAD_AND_DOWNLOAD, {
                  storeCode: paginationOrderTwoOptionMenuList.storeCode,
                  type: paginationOrderTwoOptionMenuList.type,
                })
              "
            >
              엑셀 업로드/다운로드
            </el-button>
          </el-row>
        </el-row>
      </el-row>
      <el-table
        v-loading="loading"
        :data="orderTwoOptionMenuList"
        border
        class="mb-20"
        height="530"
        style="width: 100%"
      >
        <el-table-column
          align="center"
          header-align="center"
          label="상품 정보"
        >
          <template #default="{ row }">
            {{
              `${convertToEllipsis(row.T_order_store_good_display_name, 10)}
            (${row.T_order_store_good_code})`
            }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="옵션 상품 이름"
          prop="T_order_store_good_option_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="한글"
        >
          <template #default="{ row }">
            {{ row.lang.ko }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="영어"
        >
          <template #default="{ row }">
            {{ row.lang.en }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(간체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hans }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="중국어(번체)"
        >
          <template #default="{ row }">
            {{ row.lang.zh_hant }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="일본어"
        >
          <template #default="{ row }">
            {{ row.lang.jp }}
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
              type="warning"
              @click="
                openOptionTranslateModal(
                  'step2_option_item',
                  row.T_order_store_good_code,
                  {
                    T_order_good_option_no: row.T_order_good_option_no,
                    T_order_store_good_option_code:
                      row.T_order_store_good_option_code,
                    T_order_store_good_option_name:
                      row.T_order_store_good_option_name,
                    origin_name: row.T_order_store_good_option_name,
                    ko: row.lang.ko,
                    en: row.lang.en,
                    jp: row.lang.jp,
                    zh_hans: row.lang.zh_hans,
                    zh_hant: row.lang.zh_hant,
                  },
                )
              "
            >
              수정
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row
        align="middle"
        justify="center"
      >
        <el-pagination
          :current-page="paginationOrderTwoOptionMenuList.page"
          :page-size="paginationOrderTwoOptionMenuList.perPage"
          :total="paginationOrderTwoOptionMenuList.total"
          background
          layout="prev, pager, next"
          @current-change="handleOrderTwoOptionMenuListPage"
        />
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.search-input {
  width: 360px;
}

.search-description-wrapper {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}

.detail-product-translate-wrapper {
  position: relative;

  .detail-product-confirm-button-wrapper {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(-10%, -30%);
  }
}

.product-name {
  cursor: pointer;
}

.option-item-name {
  color: #409eff;
}

.option-group-tab-container {
  width: 710px;
  padding: 0;
  overflow-x: auto;
}

.box-card {
  width: 700px;

  &:deep(.el-divider--horizontal) {
    margin: 10px 0 20px;
  }

  .option-item-title-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .option-item-title {
      font-weight: 700;
    }
  }
}

.option-group-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.detail-product-list {
  width: 60%;
  margin-right: 1%;
}

.detail-product-description {
  width: 39%;
}

.option-group-list-wrap {
  width: 49%;
  margin-right: 1%;
}

.option-item-list-wrap {
  width: 49%;
}

.papago-img {
  width: 20px;
  height: 20px;
}
</style>
