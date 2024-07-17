<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {computed, nextTick, onMounted, reactive, Ref, ref, watch} from 'vue';
import {cloneDeep} from 'lodash';
import {ElMessage, ElMessageBox, UploadProps} from 'element-plus';
import {AxiosResponse} from 'axios';
import {authentication, etcUtils, runtimeCheckHelper} from '@utils';
import useTagsStore from '@store/storeTags';
import useModalStore from '@store/storeModal';
import {bannerManage, categorizeManageTabletV2, tableManage,} from '@router/routePaths';
import {
  requestStoreThemeListType,
  requestUpdateRestroomImageType,
  requestUpdateStoreBackgroundImageType,
  storeAdBannerListType,
  storeBannerInfoType,
  storeInfoCreditPaymentMethodType,
  storeInfoCreditPaymentType,
  storeInfoDataStoreLanguageListType,
  storeInfoDataStoreType,
  storeInfoOfStoreManage,
  storeStateListDataType,
  storeTabletSortType,
} from '@interface/store';
import {selectBoxType} from '@interface/member';
import {requestFranchiseListType} from '@interface/fran';
import {
  Histogram,
  Management,
  Picture,
  Platform,
  Refresh,
  SetUp,
  StarFilled,
} from '@element-plus/icons-vue';
import {RefreshTabletModal, SetTabletVersionModal} from '@containers';
import {BreadcrumbHeader, StoreNameBox} from '@components';
import {
  CUSTOM_THEME_CODE,
  REFRESH_TABLET,
  SET_TABLET_VERSION,
  STORE_LIST,
  STORE_SETTING,
  TAB_CODE_TABLE_CONTROL,
} from '@common/string';
import {franCodec, memberCodec, storeCodec, tableCodec} from '@codecs';
import {fran, helper, member, store, tablet} from '@apis';

const {selectBoxListCodec} = memberCodec;

const {runtimeCheck} = runtimeCheckHelper;
const {failAuthenticationAlert, checkAuthFunction, isGlobalAdmin} =
  authentication;
const {giveFocusToElementById} = etcUtils;
const {
  requestCheckDuplicateTabletId,
  requestCheckDuplicateMiddleWareCode,
  requestCheckDuplicateSerialNumber,
} = helper;
const tagStore = useTagsStore();
const {openModal, flag} = useModalStore();
const route = useRoute();
const router = useRouter();
const {addTagsData, updateStoreNamesInTagArray} = tagStore;
const storeManageHeader = reactive([
  {name: STORE_LIST},
  {name: STORE_SETTING},
]);
const pathQuery = reactive(route.query);
const {requestCorporationList} = member;
const {
  requestStoreInfo,
  requestStoreUpdate,
  requestLogoImageUpdate,
  requestDefaultLanguage,
  requestDefaultCurrency,
  requestDefaultLayout,
  requestTabletBrandListData,
  requestStoreStateListData,
  requestLanguageFlagList,
  requestUpdateRestroomImage,
  requestStoreAdBannerListData,
  requestUpdateStoreBackgroundImage,
  requestPosInformationList,
  requestStoreThemeList,
} = store;
const {requestFranchiseList} = fran;
const {requestLoadVanTypeList} = tablet;
const {
  storeInfoCodec,
  storeThemeListCodec,
  storeDefaultLanguageCodec,
  storeDefaultCurrencyCodec,
  storeDefaultLayoutCodec,
  tabletListCodec,
  storeStateListCodec,
  storeAdBannerListCodec,
  storeLanguageFlagListCodec,
  posInformationListCodec,
} = storeCodec;
const {vanTypeListCodec} = tableCodec;
const {requestFranchiseListCodec} = franCodec;

/** 매장 설정 데이터 */
const storeDetailData = ref({
  T_order_store_Tablet_sort: {
    order: '',
    column: '',
  },
  T_order_store_pwd: '',
  T_order_store_pwd_re: '',
} as storeInfoDataStoreType);

/** 중복검사: 저장된 매장 데이터 */
const savedData = reactive({
  serialNumber2: '',
  middleWareId: '',
  tabletId: '',
});

/** 중복검사: 중복 검사 완료 여부 */
const isPassedDuplicateData = reactive({
  serialNumber2: false,
  middleWareId: false,
  tabletId: false,
});

/** 중복검사: 중복 검사가 필요한 경우 */
const activeDuplicateCheck = reactive({
  serialNumber2: false,
  middleWareId: false,
  tabletId: false,
});

watch(
  () => storeDetailData.value.serial_number2,
  () => {
    activeDuplicateCheck.serialNumber2 = !!(
      storeDetailData.value.serial_number2 &&
      storeDetailData.value.serial_number2 !== savedData.serialNumber2
    );
    isPassedDuplicateData.serialNumber2 = storeDetailData.value.serial_number2
      ? !activeDuplicateCheck.serialNumber2
      : true;
  },
);

watch(
  () => storeDetailData.value.posMiddleWareCode,
  () => {
    activeDuplicateCheck.middleWareId = !!(
      storeDetailData.value.posMiddleWareCode &&
      storeDetailData.value.posMiddleWareCode !== savedData.middleWareId
    );
    isPassedDuplicateData.middleWareId = storeDetailData.value.posMiddleWareCode
      ? !activeDuplicateCheck.middleWareId
      : true;
  },
);

watch(
  () => storeDetailData.value.T_order_store_Id,
  () => {
    activeDuplicateCheck.tabletId = !!(
      storeDetailData.value.T_order_store_Id &&
      storeDetailData.value.T_order_store_Id !== savedData.tabletId
    );
    isPassedDuplicateData.tabletId = storeDetailData.value.T_order_store_Id
      ? !activeDuplicateCheck.tabletId
      : true;
  },
);

const beforeModificationStoreName = ref('');

const posInitUpdatedDate: Ref<string> = ref('');

/** 리메이크 선결제 매장 결제수단 초기값 */
const originPaymentTypeOfPreCreditTable: storeInfoCreditPaymentType = reactive({
  single: false,
  byMenu: false,
  byPrice: false,
});
const originPaymentMethodOfPreCreditTable: storeInfoCreditPaymentMethodType =
  reactive({
    cash: false,
    card: false,
  });

const validateInput = () => {
  const semicolonCount =
    storeDetailData.value.visitGroups.split(';').length - 1;

  if (semicolonCount > 1) {
    storeDetailData.value.visitGroups =
      storeDetailData.value.visitGroups.substring(
        0,
        storeDetailData.value.visitGroups.lastIndexOf(';'),
      );
  }
};

/** 매장 배너 데이터 */
const storeBannerData: Ref<storeBannerInfoType[]> = ref(
  [] as storeBannerInfoType[],
);

// 광고 배너 리스트
const storeAdBannerList: Ref<storeAdBannerListType[]> = ref(
  [] as storeAdBannerListType[],
);

const getStoreAdBannerList = async () => {
  try {
    const res = (await requestStoreAdBannerListData()) as AxiosResponse;
    const typeError = runtimeCheck(storeAdBannerListCodec, res.data);

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
        storeAdBannerList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 로고 업로드 이미지 */
const uploadLogoImage = ref('');

/** 로딩 상태값 */
const fullscreenLoading: Ref<boolean> = ref(false);

const tabletCount: Ref<number> = ref(0);

/** 태블릿 화면 밝기 */
const tabletBrightnessMarks = reactive({
  0: '0',
  100: '100',
});
const tabletBrightness = ref([0, 0]);

const changePreCreditField = () => {
  const isAllNoneValueInPaymentMethod = Object.values(
    originPaymentMethodOfPreCreditTable,
  )?.every((value) => value === false);
  const isAnyFieldTrueInPaymentType = Object.values(
    originPaymentTypeOfPreCreditTable,
  )?.some((value) => value === true);

  const isAllNoneValueInPaymentType = Object.values(
    originPaymentTypeOfPreCreditTable,
  )?.every((value) => value === false);
  const isAnyFieldTrueInPaymentMethod = Object.values(
    originPaymentMethodOfPreCreditTable,
  )?.some((value) => value === true);

  if (isAllNoneValueInPaymentMethod && isAllNoneValueInPaymentType) {
    return;
  }

  if (isAllNoneValueInPaymentMethod && isAnyFieldTrueInPaymentType) {
    storeDetailData.value.credit_payment_method.card = true;
  }

  if (isAllNoneValueInPaymentType && isAnyFieldTrueInPaymentMethod) {
    storeDetailData.value.credit_payment_type.single = true;
  }
};

/** '태블릿 기본 언어 설정'값 '태블릿 로고페이지 국기 & 언어변경'에 기본 포함 */
const addBasicLanguageInList = () => {
  if (
    storeDetailData.value.T_order_store_language === 'CN' &&
    !storeDetailData.value.T_order_store_use_language_list?.includes('zh_hant')
  ) {
    storeDetailData.value.T_order_store_use_language_list?.push('zh_hant');
    return;
  }
  if (
    storeDetailData.value.T_order_store_language === 'CN-S' &&
    !storeDetailData.value.T_order_store_use_language_list?.includes('zh_hans')
  ) {
    storeDetailData.value.T_order_store_use_language_list?.push('zh_hans');
    return;
  }
  if (
    storeDetailData.value.T_order_store_language === 'CN' ||
    storeDetailData.value.T_order_store_language === 'CN-S'
  ) {
    return;
  }

  const lowerLang =
    storeDetailData.value.T_order_store_language?.toLocaleLowerCase();
  if (
    !storeDetailData.value.T_order_store_use_language_list?.includes(lowerLang)
  ) {
    storeDetailData.value.T_order_store_use_language_list?.push(lowerLang);
  }
};

/** 매장 관련 정보 */
const getStoreInfo = async () => {
  try {
    const res = (await requestStoreInfo(
      pathQuery.code as string,
    )) as AxiosResponse;
    const typeError = runtimeCheck(storeInfoCodec, res.data);

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
        storeDetailData.value = res.data.data.store;
        beforeModificationStoreName.value =
          res.data.data.store?.T_order_store_name;
        storeBannerData.value = res.data.data.banner;
        posInitUpdatedDate.value = res.data.data.pos_init_date
          ? res.data.data.pos_init_date
          : '없음';

        originPaymentMethodOfPreCreditTable.card =
          res.data.data.store.credit_payment_method.card;
        originPaymentMethodOfPreCreditTable.cash =
          res.data.data.store.credit_payment_method.cash;

        originPaymentTypeOfPreCreditTable.byMenu =
          res.data.data.store.credit_payment_type.byMenu;
        originPaymentTypeOfPreCreditTable.byPrice =
          res.data.data.store.credit_payment_type.byPrice;
        originPaymentTypeOfPreCreditTable.single =
          res.data.data.store.credit_payment_type.single;

        changePreCreditField();

        tabletCount.value = res.data.data.tablet_count;
        storeDetailData.value.T_order_store_Ad_banner_list =
          res.data.data.store.T_order_store_Ad_banner_list;
        storeDetailData.value.T_order_store_use_language_list =
          res.data.data.store.T_order_store_use_language_list;
        addBasicLanguageInList();

        tabletBrightness.value = [
          storeDetailData.value.TabletMinBrightness,
          storeDetailData.value.TabletMaxBrightness,
        ];
        savedData.serialNumber2 = res.data.data.store?.serial_number2 || '';
        savedData.middleWareId = res.data.data.store?.posMiddleWareCode || '';
        savedData.tabletId = res.data.data.store?.T_order_store_Id || '';
        activeDuplicateCheck.serialNumber2 = false;
        activeDuplicateCheck.middleWareId = false;
        activeDuplicateCheck.tabletId = false;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 로고 이미지 변경 */
const setLogoImage = async () => {
  fullscreenLoading.value = true;

  try {
    const storeCode = route.query.code as string;
    const logoImage = uploadLogoImage.value;
    const data = {
      storeCode,
      T_order_logo_img: logoImage,
    };

    const res = (await requestLogoImageUpdate(data)) as AxiosResponse;

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
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

/** 매장 배경 이미지 변경 */
const selectedBgImg = ref<string>('');

const updateStoreBgImg = async () => {
  fullscreenLoading.value = true;

  try {
    const storeCode = route.query.code as string;
    const backgroundImg = selectedBgImg.value;
    const data: requestUpdateStoreBackgroundImageType = {
      storeCode,
      T_order_store_background: backgroundImg,
    };

    const res = (await requestUpdateStoreBackgroundImage(
      data,
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
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

/** 화장실 안내 이미지 변경 */
const selectedRestroomImg = ref<string>('');

const updateRestroomImg = async () => {
  fullscreenLoading.value = true;

  try {
    const storeCode = route.query.code as string;
    const backgroundImg = selectedRestroomImg.value;
    const data: requestUpdateRestroomImageType = {
      storeCode,
      T_order_store_restroom_img: backgroundImg,
    };

    const res = (await requestUpdateRestroomImage(data)) as AxiosResponse;

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
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

/** 로컬 스토리지 스크롤 Y 포지션 존재 시 스크롤 이동 */
const saveScrollPosition = () => {
  const defaultLayout = document.querySelector('.default_layout_contents');
  localStorage.setItem('scrollPosition', String(defaultLayout?.scrollTop));
};

const restoreScrollPosition = () => {
  const savedPosition = localStorage.getItem('scrollPosition');
  const defaultLayout = document.querySelector('.default_layout_contents');
  if (savedPosition) {
    defaultLayout?.scrollTo(0, Number(savedPosition));
    localStorage.removeItem('scrollPosition');
  }
};

/** 매장 수정 */
const postStoreUpdate = async () => {
  const storeCode = {storeCode: pathQuery.code as string};
  const requestStoreData = cloneDeep(storeDetailData.value);

  const storeTabletOrder =
    requestStoreData.T_order_store_Tablet_sort as storeTabletSortType;
  const editPropertyColumn = {
    T_order_store_Tablet_sort: storeTabletOrder?.column as string,
  };
  const editPropertyOrder = {
    T_order_store_orderBy: storeTabletOrder?.order as string,
  };
  const editTabletBrightness = {
    TabletMinBrightness: tabletBrightness.value[0] as number,
    TabletMaxBrightness: tabletBrightness.value[1] as number,
  };
  delete requestStoreData.T_order_store_Tablet_sort;
  delete requestStoreData.T_order_store_logo;
  delete requestStoreData.T_order_store_background;
  delete requestStoreData.T_order_store_restroom_img;
  delete requestStoreData.T_order_store_tablet_custom_style;
  const requestEditData = Object.assign(
    requestStoreData,
    storeCode,
    editPropertyColumn,
    editPropertyOrder,
    editTabletBrightness,
  );
  storeDetailData.value.T_order_store_Ad_banner_list?.sort((a, b) => a - b);

  try {
    ElMessageBox.confirm('매장 정보를 수정하시겠습니까?', '경고', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    }).then(async () => {
      try {
        const res = (await requestStoreUpdate(
          requestEditData,
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

          if (
            beforeModificationStoreName.value !==
            storeDetailData.value.T_order_store_name
          ) {
            saveScrollPosition();
            await router.replace({
              query: {
                code: route.query.code as string,
                name: storeDetailData.value.T_order_store_name,
              },
            });
            updateStoreNamesInTagArray(
              route.query.code as string,
              storeDetailData.value.T_order_store_name,
            );
            return;
          }

          await getStoreInfo();
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// 필수값 확인
const validateRequiredData = async () => {
  if (
    storeDetailData.value.serial_number2 &&
    activeDuplicateCheck.serialNumber2 &&
    !isPassedDuplicateData.serialNumber2
  ) {
    ElMessage({
      type: 'error',
      message: '접수 번호 중복 검사를 진행해주세요.',
    });

    giveFocusToElementById('button-duplicate-check-serialNumber2');
    return;
  }

  if (
    storeDetailData.value.posMiddleWareCode &&
    activeDuplicateCheck.middleWareId &&
    !isPassedDuplicateData.middleWareId
  ) {
    ElMessage({
      type: 'error',
      message: '미들웨어 ID 중복 검사를 진행해주세요.',
    });

    giveFocusToElementById('button-duplicate-check-middleWareId');
    return;
  }

  if (activeDuplicateCheck.tabletId && !isPassedDuplicateData.tabletId) {
    ElMessage({
      type: 'error',
      message: '태블릿 로그인 아이디 중복 검사를 진행해주세요.',
    });

    giveFocusToElementById('button-duplicate-check-tablet-login-id');
    return;
  }

  if (!storeDetailData.value.T_order_store_staff_password) {
    ElMessage({
      type: 'error',
      message: '태블릿 접근 비밀번호를 입력해주세요.',
    });

    giveFocusToElementById('store-manage-contents-staff-password');
    return;
  }

  if (!storeDetailData.value.T_order_store_Id) {
    ElMessage({
      type: 'error',
      message: '태블릿 로그인 아이디를 입력해주세요.',
    });

    giveFocusToElementById('store-manage-contents-tablet-login-id');
    return;
  }

  if (!storeDetailData.value.T_order_store_name) {
    ElMessage({
      type: 'error',
      message: '태블릿 노출 매장명을 입력해주세요.',
    });

    giveFocusToElementById('store-manage-contents-tablet-store-name');
    return;
  }

  if (!storeDetailData.value.T_order_store_Theme) {
    ElMessage({
      type: 'error',
      message: '테마를 선택해주세요.',
    });

    await nextTick();
    giveFocusToElementById('store-manage-contents-theme');
    return;
  }

  if (!storeDetailData.value.optionLayout) {
    ElMessage({
      type: 'error',
      message: '옵션 레이아웃을 선택해주세요.',
    });

    await nextTick();
    giveFocusToElementById('store-manage-contents-optionLayout');
    return;
  }

  await postStoreUpdate();
};

/** 테마 설정 */
const storeThemeList: Ref<requestStoreThemeListType[]> = ref([]);
const getStoreThemeList = async () => {
  const requestData = {
    api: storeDetailData.value.T_order_store_apiType,
    type: 'search',
  };

  try {
    const res = (await requestStoreThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeThemeListCodec, res.data);

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
        storeThemeList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 이미지 선택 */
const storeLogoUploadSuccess: UploadProps['onSuccess'] = (response) => {
  storeDetailData.value.T_order_store_logo = URL.createObjectURL(response.raw);
  uploadLogoImage.value = response.raw;

  setLogoImage();
};

const storeBgImgUploadSuccess: UploadProps['onSuccess'] = (response) => {
  storeDetailData.value.T_order_store_background = URL.createObjectURL(
    response.raw,
  );
  selectedBgImg.value = response.raw;

  updateStoreBgImg();
};

const storeRestroomUploadSuccess: UploadProps['onSuccess'] = (response) => {
  storeDetailData.value.T_order_store_restroom_img = URL.createObjectURL(
    response.raw,
  );
  selectedRestroomImg.value = response.raw;

  updateRestroomImg();
};

/** 기본 언어 설정 */
const basicLanguageList = ref([['', '']]);
const getDefaultLanguage = async () => {
  try {
    const res = (await requestDefaultLanguage()) as AxiosResponse;
    const typeError = runtimeCheck(storeDefaultLanguageCodec, res.data);

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
        basicLanguageList.value = Object.entries(res.data.data);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** '태블릿 기본 언어 설정'값 '태블릿 로고페이지 국기 & 언어변경'에 기본 포함: 제거 불가 */
const isSameAsDefaultLanguage = (langInList: string) => {
  if (
    storeDetailData.value.T_order_store_language === 'CN-S' &&
    langInList === 'zh_hans'
  ) {
    return true;
  }
  if (
    storeDetailData.value.T_order_store_language === 'CN' &&
    langInList === 'zh_hant'
  ) {
    return true;
  }

  return (
    storeDetailData.value.T_order_store_language?.toLocaleLowerCase() ===
    langInList?.toLocaleLowerCase()
  );
};

/** 기본 화폐 설정 */
const basicCurrencyList = ref([['', '']]);
const getDefaultCurrency = async () => {
  try {
    const res = (await requestDefaultCurrency()) as AxiosResponse;
    const typeError = runtimeCheck(storeDefaultCurrencyCodec, res.data);

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
        basicCurrencyList.value = Object.entries(res.data.data);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 옵션 레이아웃 설정 */
const basicLayoutList = ref([['', '']]);
const filteredOptionLayout = ref([['', '']]);
const filterOptionLayout = () => {
  if (storeDetailData.value.T_order_store_Theme.includes(CUSTOM_THEME_CODE)) {
    filteredOptionLayout.value = basicLayoutList.value.filter((item) =>
      item[0].includes('custom'),
    );
    return;
  }

  filteredOptionLayout.value = basicLayoutList.value.filter(
    (item) => !item[0].includes('custom'),
  );
};

const getDefaultLayout = async () => {
  try {
    const res = (await requestDefaultLayout()) as AxiosResponse;
    const typeError = runtimeCheck(storeDefaultLayoutCodec, res.data);

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
        basicLayoutList.value = Object.entries(res.data.data);
        filterOptionLayout();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// 테마 선택 변경 시 동작: 옵션 레이아웃 리스트 및 선택 초기화
const changeSelectTheme = () => {
  filterOptionLayout();
  storeDetailData.value.optionLayout = '';
};

/** 태블릿 브랜드 정보 */
const tabletBrandList = ref([['', '']]);
/** 태블릿 브랜드 정보 불러오기 */
const getTabletBrandListInfo = async () => {
  try {
    const res = (await requestTabletBrandListData()) as AxiosResponse;
    const typeError = runtimeCheck(tabletListCodec, res.data);

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
        tabletBrandList.value = Object.entries(res.data.data);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 계약 상태 리스트 */
const storeStateList = ref<storeStateListDataType[]>([]);
/** 매장 계약 상태 리스트 불러오기 */
const getStoreStateListInfo = async () => {
  try {
    const res = (await requestStoreStateListData()) as AxiosResponse;
    const typeError = runtimeCheck(storeStateListCodec, res.data);

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
        storeStateList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 태블릿 로그인 아이디 중복 검사 */
const postCheckDuplicateId = async () => {
  const storeCode = route.query.code as string;

  try {
    const adminIdInfo = {
      storeCode,
      T_order_id: storeDetailData.value.T_order_store_Id,
    };

    if (adminIdInfo.T_order_id === '') {
      ElMessage({
        type: 'error',
        message: '아이디를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateTabletId(
      adminIdInfo,
    )) as AxiosResponse;

    isPassedDuplicateData.tabletId = false;
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
      if (!res.data.result) {
        isPassedDuplicateData.tabletId = true;
        ElMessage({
          type: 'success',
          message: '사용 가능한 아이디 입니다.',
        });
      } else {
        ElMessage({
          type: 'error',
          message: '이미 등록된 아이디 입니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 미들웨어 코드 중복 검사 */
const postCheckDuplicateMiddleWareCode = async () => {
  const storeCode = route.query.code as string;

  try {
    if (storeDetailData.value.posMiddleWareCode === '') {
      ElMessage({
        type: 'error',
        message: '미들웨어 아이디를 입력해주세요.',
      });
      return;
    }

    const posInfo = {
      storeCode,
      posMiddleWareCode: storeDetailData.value.posMiddleWareCode,
    };

    const res = (await requestCheckDuplicateMiddleWareCode(
      posInfo,
    )) as AxiosResponse;

    isPassedDuplicateData.middleWareId = false;
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
      if (!res.data.result) {
        isPassedDuplicateData.middleWareId = true;
        ElMessage({
          type: 'success',
          message: '사용 가능한 미들웨어 아이디 입니다.',
        });
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 등록된 미들웨어 아이디 입니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 태블릿 국기 화면 리스트 */
const languageFlagList = ref<storeInfoDataStoreLanguageListType[]>([]);
/** 매장 계약 상태 리스트 불러오기 */
const getLanguageFlagList = async () => {
  try {
    const res = (await requestLanguageFlagList()) as AxiosResponse;
    const typeError = runtimeCheck(storeLanguageFlagListCodec, res.data);

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
        languageFlagList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const vanTypeList = ref({});
/** 벤사 리스트 조회 */
const getLoadVanTypeList = async () => {
  try {
    const res = (await requestLoadVanTypeList()) as AxiosResponse;
    const typeError = runtimeCheck(vanTypeListCodec, res.data.data);

    if (!typeError) {
      if (res.data.code === 401) {
        failAuthenticationAlert();
      }

      if (res.data.code === 400) {
        ElMessage({
          type: 'error',
          message: res.data.msg,
        });
      }

      if (res.data.code === 200) {
        vanTypeList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getListValue = (data: string[]) => data[0];
const getListLabel = (data: string[]) => data[1];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUndefinedData = (info: any) => info !== undefined; // 서버와 협의하여 매장설정 필드를 숨기고 싶을 때 (프론트 배포 없이) 서버 필드 value를 undefined로 강제 내려줌. (프론트 자체 예외처리 아님)

const havePreCreditTableUse = computed(
  () => storeDetailData.value.preCreditTableUse,
);

/** 매장 open 시간 selectBox 배열 */
const getOpenStoreTime = Array.from({length: 24}).map((_, index) => {
  if (index < 10) {
    const lowerObj = {
      value: `0${index}`,
      label: `0${index} 시`,
    };
    return lowerObj;
  }

  const highObj = {
    value: `${index}`,
    label: `${index} 시`,
  };
  return highObj;
});

/** 매장 close 시간 selectBox 배열 */
const getCloseStoreTime = Array.from({length: 31}).map((_, index) => {
  if (index < 10) {
    const lowerObj = {
      value: `0${index}`,
      label: `0${index} 시`,
    };
    return lowerObj;
  }

  if (index > 23) {
    const highObj = {
      value: `${index}`,
      label: `익일 0${index - 24} 시`,
    };
    return highObj;
  }

  const middleObj = {
    value: `${index}`,
    label: `${index} 시`,
  };
  return middleObj;
});

// 선택된 스토어 정보
const selectedStoreInfo = reactive<storeInfoOfStoreManage>({
  storeCodeArray: [],
  storeBriefInfo: [],
});

/** 태블릿 새로고침 */
const openRefreshTabletModal = () => {
  const storeCode = route.query.code as string;
  const storeName = route.query.name as string;

  selectedStoreInfo.storeCodeArray = [storeCode];
  selectedStoreInfo.storeBriefInfo = [
    {
      T_order_store_name: storeName,
      T_order_store_code: storeCode,
    },
  ];

  openModal(REFRESH_TABLET);
};

const isValidAddress = (value: string) => {
  if (storeDetailData.value.T_order_store_address) {
    storeDetailData.value.T_order_store_drive_call_hide = value;
    return;
  }

  if (value === 'Y') {
    ElMessage({
      type: 'error',
      message: '매장 주소를 등록해주세요.',
    });
    giveFocusToElementById('address');
  }

  storeDetailData.value.T_order_store_drive_call_hide = 'N';
};

/** 주소 검색 */
const getPostInfo = () => {
  const width = 500;
  const height = 600;
  const daumPostSearch = () => {
    window.daum.postcode.load(() => {
      const searchPost = new window.daum.Postcode({
        width,
        height,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oncomplete: (data: any) => {
          if (storeDetailData.value.T_order_store_address2 !== '') {
            storeDetailData.value.T_order_store_address2 = '';
          }

          if (data.userSelectedType === 'R') {
            // 사용자가 도로명 주소를 선택했을 경우
            storeDetailData.value.T_order_store_address = data.roadAddress;
          } else {
            // 사용자가 지번 주소를 선택했을 경우(J)
            storeDetailData.value.T_order_store_address = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
          if (data.userSelectedType === 'R') {
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              storeDetailData.value.T_order_store_address2 += data.bname;
            }

            // 건물명이 있고, 공동주택일 경우 추가한다.
            if (data.buildingName !== '' && data.apartment === 'Y') {
              storeDetailData.value.T_order_store_address2 +=
                storeDetailData.value.T_order_store_address2 !== ''
                  ? `, ${data.buildingName}`
                  : data.buildingName;
            }

            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if (storeDetailData.value.T_order_store_address2 !== '') {
              storeDetailData.value.T_order_store_address2 = `(${storeDetailData.value.T_order_store_address2})`;
            }
          } else {
            storeDetailData.value.T_order_store_address2 = '';
          }
          // 우편번호를 입력한다.
          storeDetailData.value.T_order_store_zipcode = data.zonecode;
        },
      });

      searchPost.open({
        left: document.body.offsetWidth / 2 - width / 2 + window.screenLeft,
        top: document.body.offsetHeight / 2 - height / 2,
        popupTitle: '주소 검색',
      });
    });
  };

  if (!window.daum) {
    const daumPostcodeScript = document.createElement('script');
    daumPostcodeScript.src =
      'https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js?autoload=false';
    daumPostcodeScript.onload = daumPostSearch;
    document.body.appendChild(daumPostcodeScript);
  } else {
    daumPostSearch();
  }
};

/** 사업체 리스트 */
const corporationListData: Ref<selectBoxType[]> = ref([]);
const getCorporationListData = async () => {
  try {
    const res = (await requestCorporationList()) as AxiosResponse;
    const typeError = runtimeCheck(selectBoxListCodec, res.data);

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
        corporationListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 접수 번호 중복 검사 api 호출 */
const postCheckDuplicateSerialNumber2 = async () => {
  try {
    const serial = {serial_number2: storeDetailData.value.serial_number2};

    if (serial.serial_number2 === '') {
      ElMessage({
        type: 'error',
        message: '접수 번호를 입력해주세요.',
      });
      return;
    }

    const res = (await requestCheckDuplicateSerialNumber(
      serial,
    )) as AxiosResponse;

    isPassedDuplicateData.serialNumber2 = false;

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
      if (!res.data.result) {
        isPassedDuplicateData.serialNumber2 = true;
        ElMessage({
          type: 'success',
          message: '사용 가능한 접수 번호 입니다.',
        });
        return;
      }

      ElMessage({
        type: 'error',
        message: '이미 등록된 접수 번호 입니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 프랜차이즈 리스트 */
const franChiseList: Ref<requestFranchiseListType[]> = ref([
  {
    no: '0',
    T_Order_Fran_code: '',
    T_Order_Fran_name: '해당사항 없음',
  },
]);
const getFranChiseList = async () => {
  try {
    const res = (await requestFranchiseList()) as AxiosResponse;
    const typeError = runtimeCheck(requestFranchiseListCodec, res.data);

    if (res.data.code === 400) {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        franChiseList.value.push(...res.data.data);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const posInfoList: Ref<string[]> = ref([]);
const getPosInfoList = async () => {
  try {
    const res = (await requestPosInformationList()) as AxiosResponse;
    const typeError = runtimeCheck(posInformationListCodec, res.data);

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
        posInfoList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 미들웨어 연동 여부, 포스 구분 */
/** 미들웨어 N, 포스 N인 경우: 노포스로 고정 */
const isOnlyNoPos = ref(false);

// 미들웨어 Y인 경우: POS 항상 O
watch(
  () => storeDetailData.value.T_order_store_has_middleware,
  () => {
    if (storeDetailData.value.T_order_store_has_middleware === 'Y') {
      storeDetailData.value.T_order_store_has_pos = 'Y';
    }
  },
);

watch(
  () => storeDetailData.value.T_order_store_has_pos,
  (newValue, oldValue) => {
    if (
      storeDetailData.value.T_order_store_has_middleware === 'N' &&
      storeDetailData.value.T_order_store_has_pos === 'N'
    ) {
      storeDetailData.value.T_order_store_pos_info = '노포스(자체포스)';
      isOnlyNoPos.value = true;
      return;
    }

    if (newValue === 'Y' && oldValue === 'N') {
      storeDetailData.value.T_order_store_pos_info = '';
      isOnlyNoPos.value = false;
      return;
    }

    isOnlyNoPos.value = false;
  },
);

/** 리메이크 선결제 매장 필드 값이 하나라도 선택되어있었을시 해당 체크박스 해제되는 기능 막기 */
const preventUncheckPaymentMethod = (type: 'card' | 'cash') => {
  const selectedCount = Object.values(
    storeDetailData.value.credit_payment_method,
  )?.filter((value) => value)?.length;
  const isAllNoneValueInPaymentMethod = Object.values(
    originPaymentMethodOfPreCreditTable,
  )?.some((value) => value === true);
  const isAllNoneValueInPaymentType = Object.values(
    originPaymentTypeOfPreCreditTable,
  )?.some((value) => value === true);

  if (
    selectedCount === 1 &&
    (isAllNoneValueInPaymentMethod || isAllNoneValueInPaymentType)
  ) {
    storeDetailData.value.credit_payment_method[type] = true;
  } else {
    storeDetailData.value.credit_payment_method[type] =
      !storeDetailData.value.credit_payment_method[type];
  }
};

/** 리메이크 선결제 매장 필드 값이 하나라도 선택되어있었을시 해당 체크박스 해제되는 기능 막기 */
const preventUncheckPaymentType = (type: 'byMenu' | 'byPrice' | 'single') => {
  const selectedCount = Object.values(
    storeDetailData.value.credit_payment_type,
  )?.filter((value) => value)?.length;
  const isAllNoneValueInPaymentType = Object.values(
    originPaymentTypeOfPreCreditTable,
  )?.some((value) => value === true);
  const isAllNoneValueInPaymentMethod = Object.values(
    originPaymentMethodOfPreCreditTable,
  )?.some((value) => value === true);

  if (
    selectedCount === 1 &&
    (isAllNoneValueInPaymentMethod || isAllNoneValueInPaymentType)
  ) {
    storeDetailData.value.credit_payment_type[type] = true;
  } else {
    storeDetailData.value.credit_payment_type[type] =
      !storeDetailData.value.credit_payment_type[type];
  }
};

const storeTabletInfo = ref(null);
const torderMasterLanguage = ref(null);
const billSetting = ref(null);
const contractInfo = ref(null);
const adBanner = ref(null);
const orderAdManage = ref(null);
const tabletOrderSetting = ref(null);
const storeOperationInfo = ref(null);
const storeLogoSetting = ref(null);
const backgroundSetting = ref(null);

const isHaveDataState = reactive({
  storeTabletInfo: true,
  torderMasterLanguage: true,
  billSetting: true,
  contractInfo: true,
  adBanner: true,
  orderAdManage: true,
  tabletOrderSetting: true,
  storeOperationInfo: true,
  storeLogoSetting: true,
  backgroundSetting: true,
});

const getCheckingData = () => {
  const isStoreTabletInfo = storeTabletInfo.value as HTMLElement | null;
  const isTorderMasterLanguage =
    torderMasterLanguage.value as HTMLElement | null;
  const isBillSetting = billSetting.value as HTMLElement | null;
  const isContractInfo = contractInfo.value as HTMLElement | null;
  const isAdBanner = adBanner.value as HTMLElement | null;
  const isOrderAdManage = orderAdManage.value as HTMLElement | null;
  const isTabletOrderSetting = tabletOrderSetting.value as HTMLElement | null;
  const isStoreOperationInfo = storeOperationInfo.value as HTMLElement | null;
  const isStoreLogoSetting = storeLogoSetting.value as HTMLElement | null;
  const isBackgroundSetting = backgroundSetting.value as HTMLElement | null;

  if (isStoreTabletInfo && isStoreTabletInfo.childElementCount === 0) {
    isHaveDataState.storeTabletInfo = false;
  }

  if (
    isTorderMasterLanguage &&
    isTorderMasterLanguage.childElementCount === 0
  ) {
    isHaveDataState.torderMasterLanguage = false;
  }

  if (isBillSetting && isBillSetting.childElementCount === 0) {
    isHaveDataState.billSetting = false;
  }

  if (isContractInfo && isContractInfo.childElementCount === 0) {
    isHaveDataState.contractInfo = false;
  }

  if (isAdBanner && isAdBanner.childElementCount === 0) {
    isHaveDataState.adBanner = false;
  }

  if (isOrderAdManage && isOrderAdManage.childElementCount === 0) {
    isHaveDataState.orderAdManage = false;
  }

  if (isTabletOrderSetting && isTabletOrderSetting.childElementCount === 0) {
    isHaveDataState.tabletOrderSetting = false;
  }

  if (isStoreOperationInfo && isStoreOperationInfo.childElementCount === 0) {
    isHaveDataState.storeOperationInfo = false;
  }

  if (isStoreLogoSetting && isStoreLogoSetting.childElementCount === 0) {
    isHaveDataState.storeLogoSetting = false;
  }

  if (isBackgroundSetting && isBackgroundSetting.childElementCount === 0) {
    isHaveDataState.backgroundSetting = false;
  }
};

// v-for key 방어 코드
const getCorporationKey = (corporation: selectBoxType, index: number) =>
  corporation ? corporation.code : `corporation-${index}`;

const isStoreStat = (data: string, index: number) => {
  if (!data) {
    return `stat${index}`;
  }
  return `${data}-${index}`;
};
const bannerKeyValidate = (name: string, index: number) => {
  if (!name) {
    return `banner-${index}`;
  }
  return `${name}-${index}`;
};
const flagKeyValidate = (
  flags: storeInfoDataStoreLanguageListType,
  index: number,
) => {
  if (!flags) {
    return `flag-${index}`;
  }
  return `${flags.value} - ${flags.label}`;
};
const themeKeyValidate = (flags: requestStoreThemeListType, index: number) => {
  if (!flags) {
    return `flag-${index}`;
  }
  return `${flags.no} - ${flags.theme_name}`;
};
const getFranChiseListKey = (
  target: requestFranchiseListType,
  index: number,
) => {
  if (!target) {
    return `franChise-${index}`;
  }
  return `franChise-${target.no}-${index}`;
};

const initTabletDisplayData = async () => {
  await getStoreInfo();
  await getStoreThemeList();
  await getDefaultLayout();
};

onMounted(async () => {
  await getCorporationListData();
  await initTabletDisplayData();
  await getDefaultLanguage();
  await getDefaultCurrency();
  await getTabletBrandListInfo();
  await getStoreStateListInfo();
  await getStoreAdBannerList();
  await getLanguageFlagList();
  await getLoadVanTypeList();
  await getFranChiseList();
  await getPosInfoList();
  getCheckingData();

  await nextTick(() => {
    restoreScrollPosition();
  });
});
</script>

<template>
  <SetTabletVersionModal
    v-if="flag.setTabletVersion"
    :initTabletDisplayData="initTabletDisplayData"
  />
  <RefreshTabletModal
    v-if="flag.refreshTablet"
    :storeCode="selectedStoreInfo.storeBriefInfo[0]?.T_order_store_code"
    :storeName="selectedStoreInfo.storeBriefInfo[0]?.T_order_store_name"
  />
  <BreadcrumbHeader :propsHeader="storeManageHeader"/>
  <StoreNameBox :apiVersion="storeDetailData.T_order_store_apiType"/>
  <el-row
    align="middle"
    justify="space-between"
  >
    <div class="store-manage-transfer-grid">
      <router-link
        v-if="checkAuthFunction('F1005')"
        :to="{
          path: categorizeManageTabletV2,
          query: {
            code: pathQuery.code,
            name: pathQuery.name,
          },
        }"
      >
        <el-button
          id="F1005"
          :icon="Histogram"
          size="large"
          type="primary"
          @click="
            addTagsData({
              name: '분류 설정',
              path: categorizeManageTabletV2,
              query: {
                code: pathQuery.code,
                name: pathQuery.name,
              },
            })
          "
        >
          분류 설정
        </el-button>
      </router-link>
      <router-link
        v-if="checkAuthFunction('F1010')"
        :to="{
          path: bannerManage,
          query: {
            code: pathQuery.code,
            name: pathQuery.name,
          },
        }"
      >
        <el-button
          id="F1010"
          :icon="Management"
          size="large"
          type="success"
          @click="
            addTagsData({
              name: '배너 관리',
              path: bannerManage,
              query: {
                code: pathQuery.code,
                name: pathQuery.name,
              },
            })
          "
        >
          배너 관리
        </el-button>
      </router-link>
      <router-link
        v-if="checkAuthFunction('F1011')"
        :to="{
          path: tableManage,
          query: {
            code: pathQuery.code,
            name: pathQuery.name,
            tab: TAB_CODE_TABLE_CONTROL,
          },
        }"
      >
        <el-button
          id="F1011"
          :icon="Platform"
          size="large"
          type="danger"
          @click="
            addTagsData({
              name: '테이블 관리',
              path: tableManage,
              query: {
                code: pathQuery.code,
                name: pathQuery.name,
                tab: TAB_CODE_TABLE_CONTROL,
              },
            })
          "
        >
          테이블 관리 ({{ tabletCount }}개 설치)
        </el-button>
      </router-link>
      <div>
        <el-button
          :icon="SetUp"
          color="#626aef"
          size="large"
          @click="openModal(SET_TABLET_VERSION)"
        >
          태블릿 버전 설정
        </el-button>
      </div>
      <el-button
        v-if="checkAuthFunction('F3001')"
        :icon="Refresh"
        size="large"
        type="info"
        @click="openRefreshTabletModal"
      >
        태블릿 새로고침
      </el-button>
    </div>
    <div>최신 포스변경 일자: {{ posInitUpdatedDate }}</div>
  </el-row>
  <div class="store-manage-contents">
    <div
      v-if="isHaveDataState.storeTabletInfo"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">매장 태블릿 정보</div>
      <div
        ref="storeTabletInfo"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.memo)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>특이사항</div>
          </div>
          <el-input
            v-model="storeDetailData.memo"
            :autosize="{ minRows: 5, maxRows: 10 }"
            type="textarea"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.test_store_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>테스트 매장</div>
            <span> - 해당 매장이 테스트 매장인지 설정합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.test_store_use">
            <el-radio
              border
              label="N"
            >
              N
            </el-radio>
            <el-radio
              border
              label="Y"
            >
              Y
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="
            isUndefinedData(storeDetailData.business_type) &&
            corporationListData?.length > 0
          "
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>사업체 구분</div>
            <span>
              - 태블릿의 사업체 구분을 설정합니다.
              <span v-if="!isGlobalAdmin()">
                U+오더와 소상공인의 전환은 티오더2와 마스터1에서 제한적으로
                이루어지며, 이는 Web URL 버전에 따라 구분됩니다.
              </span>
            </span>
          </div>
          <el-radio-group
            v-model="storeDetailData.business_type"
            class="flex corporation-wrapper width-100"
          >
            <div
              v-for="(corporation, index) in corporationListData"
              :key="getCorporationKey(corporation, index)"
            >
              <el-radio
                :label="corporation.code"
                border
              >
                {{ corporation.name }}
              </el-radio>
            </div>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_fran_code)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>프랜차이즈</div>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_fran_code"
            class="width-100"
            clearable
            filterable
          >
            <el-option
              v-for="(franChise, index) in franChiseList"
              :key="getFranChiseListKey(franChise, index)"
              :label="franChise.T_Order_Fran_name"
              :value="franChise.T_Order_Fran_code"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.serial_number2)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>접수 번호</div>
          </div>
          <div class="store-manage-contents-duplicate-check">
            <div class="store-manage-contents-duplicate-input">
              <el-input v-model="storeDetailData.serial_number2"/>
            </div>
            <div>
              <el-button
                id="button-duplicate-check-serialNumber2"
                :disabled="!activeDuplicateCheck.serialNumber2"
                type="primary"
                @click="postCheckDuplicateSerialNumber2"
              >
                중복 검사
              </el-button>
            </div>
          </div>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.posMiddleWareCode)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>미들웨어 ID</div>
          </div>
          <div class="store-manage-contents-duplicate-check">
            <div class="store-manage-contents-duplicate-input">
              <el-input
                v-model="storeDetailData.posMiddleWareCode"
                clearable
              />
            </div>
            <div>
              <el-button
                id="button-duplicate-check-middleWareId"
                :disabled="!activeDuplicateCheck.middleWareId"
                type="primary"
                @click="postCheckDuplicateMiddleWareCode"
              >
                중복 검사
              </el-button>
            </div>
          </div>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Id)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>
              태블릿 로그인 아이디
              <el-icon>
                <StarFilled color="red"/>
              </el-icon>
            </div>
            <span> - 운영중인 태블릿의 로그인 아이디 입니다.</span>
          </div>
          <div class="store-manage-contents-duplicate-check">
            <div class="store-manage-contents-duplicate-input">
              <el-input
                id="store-manage-contents-tablet-login-id"
                v-model="storeDetailData.T_order_store_Id"
                clearable
                oninput="this.value = this.value.replace(/\s/g, '');"
              />
            </div>
            <div>
              <el-button
                id="button-duplicate-check-tablet-login-id"
                :disabled="!activeDuplicateCheck.tabletId"
                type="primary"
                @click="postCheckDuplicateId"
              >
                중복 검사
              </el-button>
            </div>
          </div>
        </div>
        <div class="store-manage-contents-contents-wrapper">
          <div class="store-manage-contents-contents-title">
            <div>비밀번호 변경</div>
            <span>
              - 태블릿 비밀번호를 변경하실 경우 변경하실 비밀번호를 입력하신 후
              저장을 눌러주세요.
            </span>
          </div>
          <form>
            <el-input
              v-model="storeDetailData.T_order_store_pwd"
              autocomplete="new-password"
              clearable
              placeholder="Password"
              show-password
              type="password"
            />
          </form>
        </div>
        <div class="store-manage-contents-contents-wrapper">
          <div class="store-manage-contents-contents-title">
            <div>비밀번호 변경 확인</div>
          </div>
          <form>
            <el-input
              v-model="storeDetailData.T_order_store_pwd_re"
              autocomplete="new-password"
              clearable
              placeholder="Password"
              show-password
              type="password"
            />
          </form>
        </div>
        <div class="store-manage-contents-contents-wrapper">
          <div class="store-manage-contents-contents-title">
            <div>
              태블릿 접근 비밀번호
              <el-icon>
                <StarFilled color="red"/>
              </el-icon>
            </div>
            <span> - 태블릿의 설정 접근 시 입력하는 비밀번호입니다.</span>
          </div>
          <el-input
            id="store-manage-contents-staff-password"
            v-model="storeDetailData.T_order_store_staff_password"
            clearable
            oninput="this.value = this.value.replace(/\D/g, '').replace(/(\..*)\./g, '$1');"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_direct_table)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 설정 접근 방식</div>
            <span>
              - 테이블 번호 연타를 하지 않고 테이블설정 화면으로 이동합니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_direct_table">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_ipv4)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 접근 IP</div>
            <span>
              - ;으로 구분합니다.(해당 IP는 해당 매장으로 로그인 됩니다.)
            </span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_ipv4"
            clearable
          />
        </div>
        <div class="tablet-control-wrap mb-20">
          <el-text size="large"> 태블릿 설정</el-text>
          <div
            v-if="isUndefinedData(storeDetailData.T_order_store_tablet_version)"
            class="store-manage-contents-contents-wrapper"
          >
            <div class="store-manage-contents-contents-title mt-10">
              <div>URL 버전 정보</div>
              <span>
                - 현재 적용된 web url 정보입니다. 버전 변경은 오더 태블릿 버전
                설정 메뉴에서 진행해주세요.
              </span>
            </div>
            <div class="store-manage-url-contents font-thin">
              <el-text class="ml-10">
                {{ storeDetailData.T_order_store_tablet_version }}
              </el-text>
            </div>
          </div>
          <div
            v-if="isUndefinedData(storeDetailData.T_order_store_Theme)"
            class="store-manage-contents-contents-wrapper"
          >
            <div class="store-manage-contents-contents-title">
              <div>
                태블릿 테마 설정
                <el-icon>
                  <StarFilled color="red"/>
                </el-icon>
              </div>
              <span> - 태블릿의 기본 테마를 지정합니다.</span>
            </div>
            <el-row>
              <el-select
                id="store-manage-contents-theme"
                v-model="storeDetailData.T_order_store_Theme"
                class="width-100"
                placeholder="테마를 선택해주세요."
                @change="changeSelectTheme"
              >
                <el-option
                  v-for="(theme, index) in storeThemeList"
                  :key="themeKeyValidate(theme, index)"
                  :label="theme.theme_name"
                  :value="theme.no"
                />
              </el-select>
            </el-row>
          </div>
          <div
            v-if="isUndefinedData(storeDetailData.optionLayout)"
            class="store-manage-contents-contents-wrapper"
          >
            <div class="store-manage-contents-contents-title">
              <div>
                옵션 레이아웃
                <el-icon>
                  <StarFilled color="red"/>
                </el-icon>
              </div>
              <span> - 옵션 선택 시 화면 레이아웃을 설정합니다.</span>
            </div>
            <el-select
              id="store-manage-contents-optionLayout"
              v-model="storeDetailData.optionLayout"
              class="width-100"
              placeholder="레이아웃을 선택해 주세요."
            >
              <el-option
                v-for="option in filteredOptionLayout"
                :key="getListValue(option)"
                :label="getListLabel(option)"
                :value="getListValue(option)"
              />
            </el-select>
          </div>
          <div
            v-if="
              isUndefinedData(storeDetailData.T_order_store_orderView_version)
            "
            class="store-manage-contents-contents-wrapper"
          >
            <div class="store-manage-contents-contents-title">
              <div>마스터 태블릿 버전 정보</div>
              <span>
                - 현재 적용된 web url 정보입니다. 버전 변경은 마스터 태블릿 버전
                설정 메뉴에서 진행해주세요.
              </span>
            </div>
            <div class="store-manage-url-contents font-thin">
              <el-text class="ml-10">
                {{ storeDetailData.T_order_store_orderView_version }}
              </el-text>
            </div>
          </div>
        </div>

        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Tablet_sort)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 상품 출력 SORT</div>
          </div>
          <div
            v-if="
              isUndefinedData(storeDetailData.T_order_store_Tablet_sort) &&
              storeDetailData.T_order_store_Tablet_sort
            "
          >
            <el-radio-group
              v-model="storeDetailData.T_order_store_Tablet_sort.column"
              class="mb-10"
            >
              <el-radio
                border
                label="price"
              >
                가격순
              </el-radio>
              <el-radio
                border
                label="register"
              >
                등록순
              </el-radio>
              <el-radio
                border
                label="cart_cnt"
              >
                조회순
              </el-radio>
            </el-radio-group>
          </div>
          <div
            v-if="
              isUndefinedData(storeDetailData.T_order_store_Tablet_sort) &&
              storeDetailData.T_order_store_Tablet_sort
            "
          >
            <el-radio-group
              v-model="storeDetailData.T_order_store_Tablet_sort.order"
            >
              <el-radio
                border
                label="ASC"
              >
                오름차순
              </el-radio>
              <el-radio
                border
                label="DESC"
              >
                내림차순
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <div
          v-if="
            isUndefinedData(storeDetailData.T_order_store_standardPriceUnit)
          "
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>기본 화폐 단위</div>
            <span> - 가격 화폐 단위를 설정합니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_standardPriceUnit"
            class="width-100"
          >
            <el-option
              v-for="money in basicCurrencyList"
              :key="getListValue(money)"
              :label="getListLabel(money)"
              :value="getListValue(money)"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_service_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>서비스 요청 설정</div>
            <span> - 태블릿 하단의 서비스 요청 상품 사용을 설정합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_service_use">
            <el-radio
              :label="0"
              border
            >
              [직원 호출]만 사용합니다.
            </el-radio>
            <el-radio
              :label="1"
              border
            >
              서비스 상품을 출력합니다.
            </el-radio>
            <el-radio
              :label="2"
              border
            >
              직원 호출을 사용하지 않습니다.
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_banner_text)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>배너 TEXT 입력</div>
            <span> - 태블릿 초기화면 문구를 입력합니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_banner_text"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Main_rows)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>메인 화면 상품 출력 숫자</div>
            <span> - 한줄에 상품을 지정한 수 만큼 출력합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_Main_rows">
            <el-radio
              border
              label="2Pcs"
            >
              2
            </el-radio>
            <el-radio
              border
              label="3Pcs"
            >
              3
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_banner_Ad_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>배너 사용</div>
            <span> - 배너 사용 여부를 선택합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_banner_Ad_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_banner_time)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>배너/로고 노출 시간</div>
            <span>
              - 태블릿 사용 중이 아닐 때 배너/로고를 노출하는 시간을 설정합니다.
              (10~300초 설정가능)
            </span>
          </div>
          <el-input-number
            v-model="storeDetailData.T_order_store_banner_time"
            :max="300"
            :min="10"
            controls-position="right"
          />
          <span class="store-manage-banner-exposure-time ml-10">
            초 후에 배너/로고를 노출합니다.
          </span>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_banner_control)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>배너 컨트롤</div>
            <span> - 배너 클릭 시 컨트롤러 창을 띄웁니다.</span>
          </div>
          <el-radio-group
            v-model="storeDetailData.T_order_store_banner_control"
          >
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="
            isUndefinedData(storeDetailData.TabletMinBrightness) &&
            isUndefinedData(storeDetailData.TabletMaxBrightness)
          "
          class="store-manage-contents-contents-wrapper tablet-brightness"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 화면 밝기 설정</div>
            <span>
              - 태블릿 화면의 최소/최대 밝기와 동작이 없을 때 대기시간을
              설정합니다.
            </span>
          </div>
          <div class="tablet-brightness-values">
            <el-slider
              v-model="tabletBrightness"
              :marks="tabletBrightnessMarks"
              class="ml-20 mb-20"
              placement="bottom"
              range
            />
            <div class="tablet-brightness-values-wrap">
              <span>최소 밝기 : {{ tabletBrightness[0] }}</span>
              <span class="ml-10 mr-10">/</span>
              <span>최대 밝기 : {{ tabletBrightness[1] }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.TabletWaitBrightness)"
          class="store-manage-contents-contents-wrapper tablet-brightness"
        >
          <div class="store-manage-contents-contents-title">
            <div>자동 페이드 아웃 대기 시간 설정</div>
            <span>
              - 설정한 시간 동안 화면 터치가 없을 경우, 자동으로 화면이
              어두워집니다.
            </span>
          </div>

          <div class="mt-10">
            <el-input-number
              v-model="storeDetailData.TabletWaitBrightness"
              :min="5"
              controls-position="right"
            />
            <span class="tablet-brightness-wait-desc ml-10">
              초 동안 동작이 없으면 화면이 어두워집니다.
            </span>
          </div>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_guide_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>애니메이션 가이드 사용</div>
            <span> - 태블릿 화면의 주문 가이드 사용.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_guide_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_categoryListUp)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>브랜드 선택 페이지 노출</div>
            <span>
              - 사용 선택 시 초기화면에 브랜드 선택 화면이 노출됩니다.
            </span>
          </div>
          <el-radio-group
            v-model="storeDetailData.T_order_store_categoryListUp"
          >
            <el-radio
              :label="1"
              border
            >
              사용
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.categoryIsBrand)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>브랜드 선택 페이지 문구 지정</div>
            <span> - 브랜드 선택 페이지 하단의 노출할 문구를 선택합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.categoryIsBrand">
            <el-radio
              :label="1"
              border
            >
              카테고리를 선택하세요.
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              브랜드를 선택하세요.
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.categoryRows)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>브랜드 선택 페이지 이미지 갯수</div>
            <span> - 1줄에 이미지를 몇 개씩 출력할지를 설정합니다.</span>
          </div>
          <el-input-number
            v-model="storeDetailData.categoryRows"
            :min="0"
            disabled
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_cartPage_override)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>장바구니 덮어보이기</div>
            <span> - 장바구니 열때 덮어 보이기</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_cartPage_override">
            <el-radio
              :label="1"
              border
            >
              덮기
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              안덮기
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_simpleView)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>간단히 보기</div>
            <span> - 테마와 관계없이 텍스트 뷰로만 보이게 합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_simpleView">
            <el-radio
              border
              label="Y"
            >
              네
            </el-radio>
            <el-radio
              border
              label="N"
            >
              아니오
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.cart_open_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>옵션 장바구니</div>
            <span>
              - 상품 옵션 조건을 모두 충족하면 옵션 장바구니가 노출 됩니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.cart_open_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <!-- 언어 관련 관련 태블릿 동작
      [공통]
      - 언어사용 Y일 때: 로고화면에 체크된 언어 리스트 출력
      - 언어사용 N일 때: 로고화면에 언어 리스트 출력X, 주문 페이지 하단 언어 버튼 출력되지만 태블릿 init에 상품/옵션 등의 번역값이 내려오지 않음

      [티오더1]
      - '태블릿 로고페이지 국기 & 언어변경'에 체크된 언어가 항상 '추가기능-언어번역' 리스트에 출력됨. but 번역여부는 '언어 사용' 값으로 결정됨

      [티오더2]
      - '태블릿 로고페이지 국기 & 언어변경'에 체크된 언어가 한가지인 경우: 주문 화면 하단 언어 버튼 미출력
      -->
    <div
      v-if="isHaveDataState.torderMasterLanguage"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">
        티오더ㆍ마스터 기본 언어 설정
      </div>
      <div
        ref="torderMasterLanguage"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_language)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 기본 언어 설정</div>
            <span> - 기본 언어 출력을 설정합니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_language"
            class="width-100"
            @change="addBasicLanguageInList"
          >
            <el-option
              v-for="lang in basicLanguageList"
              :key="getListValue(lang)"
              :label="getListLabel(lang)"
              :value="getListValue(lang)"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_language_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>언어 사용</div>
            <span> - 로고 화면에 손님이 번역된 언어를 선택할 수 있습니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_language_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="
            isUndefinedData(storeDetailData.T_order_store_use_language_list)
          "
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 로고페이지 국기 & 언어변경</div>
            <span>
              - 사용 국기는 태블릿의 [추가기능 > 언어변경]에도 노출됩니다.
            </span>
          </div>
          <el-checkbox-group
            v-model="storeDetailData.T_order_store_use_language_list"
            class="ad-banner-wrapper"
          >
            <div
              v-for="(lang, index) in languageFlagList"
              :key="flagKeyValidate(lang, index)"
              class="flag-list-wrap"
            >
              <el-image
                :src="lang.img_url"
                class="national-flag"
                fit="contain"
              >
                <template #error>
                  <div class="image-slot ad-list">
                    <el-icon class="error-icon">
                      <Picture/>
                    </el-icon>
                    <span>불러오기 실패</span>
                  </div>
                </template>
              </el-image>

              <el-tag
                effect="plain"
                round
                type="info"
              >
                {{ lang.value }}
              </el-tag>

              <el-checkbox
                :disabled="isSameAsDefaultLanguage(lang.label)"
                :label="lang.label"
                border
              >
                사용
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_master_language)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>마스터 기본 언어 설정</div>
            <span> - 기본 언어 출력을 설정합니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_master_language"
            class="width-100"
          >
            <el-option
              v-for="lang in basicLanguageList"
              :key="getListValue(lang)"
              :label="getListLabel(lang)"
              :value="getListValue(lang)"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.billSetting"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">빌지 (계산서) 출력 설정</div>
      <div
        ref="billSetting"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.sendOrderRevers)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>장바구니 순서 설정</div>
            <span>
              - 장바구니에 담기는 순서를 설정합니다. 계산서(빌지)에 출력되는
              순서가 변경됩니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.sendOrderRevers">
            <el-radio
              :label="1"
              border
            >
              과거 주문이 최상단
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              최신 주문이 최상단
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.option_receipt_sort)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>옵션 순서 설정</div>
            <span>
              - 사용자가 선택한 옵션 순서대로 계산서(빌지)에 출력됩니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.option_receipt_sort">
            <el-radio
              :label="0"
              border
            >
              미사용(기본값으로 출력 진행)
            </el-radio>
            <el-radio
              :label="1"
              border
            >
              사용 (옵션을 선택한 순서대로 출력 진행)
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.contractInfo"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">매장 계약 정보</div>
      <div
        ref="contractInfo"
        class="store-manage-contents-contents"
      >
        <div
          v-if="
            isUndefinedData(storeDetailData.T_order_store_contract_startDate)
          "
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 계약 기간</div>
            <span> - 매장의 계약 기간을 설정합니다.</span>
          </div>
          <span class="store-manage-contents-text">시작일</span>
          <el-date-picker
            v-model="storeDetailData.T_order_store_contract_startDate"
            class="ml-10"
            type="date"
            value-format="YYYY-MM-DD"
          />
          <span class="store-manage-contents-text">종료일</span>
          <el-date-picker
            v-model="storeDetailData.T_order_store_contract_endDate"
            class="ml-10"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_upjong)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 업종 설정</div>
            <span> - 매장의 영업 종류(업종)를 설정합니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_upjong"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_upte)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 업태 설정</div>
            <span> - 매장의 사업 실태(업태)를 설정합니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_upte"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_contractNumber)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>계약자 번호 설정</div>
            <span> - 계약자 번호를 설정합니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_contractNumber"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_tablet_installer)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>티오더 태블릿 설치 담당자</div>
            <span> - 태블릿 설치 담당자 명을 설정합니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_tablet_installer"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_ordertablet_cnt)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>설치된 티오더 태블릿 개수</div>
            <span> - 설치된 티오더 태블릿 개수를 설정합니다.</span>
          </div>
          <el-input-number
            v-model="storeDetailData.T_order_store_ordertablet_cnt"
            :min="0"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_viewtablet_cnt)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>설치된 마스터 태블릿 개수</div>
            <span> - 설치된 마스터 태블릿 개수를 설정합니다.</span>
          </div>
          <el-input-number
            v-model="storeDetailData.T_order_store_viewtablet_cnt"
            :min="0"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_extratablet_cnt)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>티오더 태블릿 잔여 개수</div>
            <span> - 티오더 태블릿의 여유분 개수를 설정합니다.</span>
          </div>
          <el-input-number
            v-model="storeDetailData.T_order_store_extratablet_cnt"
            :min="0"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_tablet_brand)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 브랜드 설정</div>
            <span> - 현재 설치되어 있는 태블릿의 브랜드을 설정합니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_tablet_brand"
            class="width-100"
            multiple
            placeholder="브랜드를 선택해주세요."
          >
            <el-option
              v-for="brand in tabletBrandList"
              :key="brand[0]"
              :label="brand[1]"
              :value="brand[0]"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.adBanner"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">광고 배너 관리</div>
      <div
        ref="adBanner"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Ad_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>광고 배너 사용</div>
            <span> - 광고 배너 사용 여부를 체크해 주세요.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_Ad_use">
            <el-radio
              :label="'Y'"
              border
            >
              사용
            </el-radio>
            <el-radio
              :label="'N'"
              border
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Ad_banner_list)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>광고 배너 사용 리스트</div>
            <span> - 매장에 사용될 광고 배너를 설정해 주세요.</span>
          </div>
          <el-checkbox-group
            v-model="storeDetailData.T_order_store_Ad_banner_list"
            class="ad-banner-wrapper"
          >
            <div
              v-for="(bannerInfo, index) in storeAdBannerList"
              :key="
                bannerKeyValidate(bannerInfo.T_order_store_banner_name, index)
              "
            >
              <el-image
                :src="bannerInfo.T_order_store_banner_url"
                class="ad-list-image-wrapper"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot ad-list">
                    <el-icon class="error-icon">
                      <Picture/>
                    </el-icon>
                    <span>불러오기 실패</span>
                  </div>
                </template>
              </el-image>
              <div class="ad-banner-info mt-10">
                <el-tag
                  effect="dark"
                  size="large"
                  type="info"
                >
                  {{ bannerInfo.T_order_store_banner_name }}
                </el-tag>
                <el-checkbox
                  :label="bannerInfo.id"
                  border
                >
                  사용
                </el-checkbox>
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.orderAdManage"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">주문 완료 광고 관리</div>
      <div
        ref="orderAdManage"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_checkout_Ad_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>주문 완료 광고 표기</div>
            <span> - 광고 배너 사용 여부를 체크해 주세요.</span>
          </div>
          <el-radio-group
            v-model="storeDetailData.T_order_store_checkout_Ad_use"
          >
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              disabled
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.tabletOrderSetting"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">태블릿 주문 설정</div>
      <div
        ref="tabletOrderSetting"
        class="store-manage-contents-contents"
      >
        <!-- 리뷰 서비스 on/off 기능: 24.05.30 선적용되는 일부 매장 제어를 위해 1004권한만 활성화 -->
        <div
          v-if="isUndefinedData(storeDetailData.store_survey_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>리뷰 서비스 사용 여부</div>
            <span>
              - 사용 선택 시 리뷰 서비스 버튼 노출 여부를 설정합니다. (api2
              커스텀테마 1/0/14 이후 버전부터 적용.)
            </span>
          </div>
          <el-radio-group
            v-model="storeDetailData.store_survey_use"
            :disabled="!checkAuthFunction('F3002')"
          >
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <!-- no_goods_notify_use on/off 기능은 티오더2에만 적용됨 -->
        <div
          v-if="isUndefinedData(storeDetailData.no_goods_notify_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>등록된 상품이 없을 때 안내문구 노출 사용 여부</div>
            <span>
              - 중분류를 모두 닫은 경우 또는 중분류에 등록된 상품이 없는 경우
              노출되는 "등록된 상품이 없습니다." 안내문구 노출 여부를
              설정합니다. (api2 1/0/15 이후 버전부터 적용.)
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.no_goods_notify_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_close)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 점검 중 표시</div>
            <span> - 태블릿 점검중 표시.(상품 확인 불가능)</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_close">
            <el-radio
              :label="1"
              border
            >
              열기
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              닫기
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_close_order)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>장바구니 주문 가능 여부</div>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_close_order">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_recent_order_hide)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>주문 내역</div>
            <span> - 태블릿에 주문 내역을 표기합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_recent_order_hide">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.tabletBillsOnOff)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>계산서</div>
          </div>
          <!-- N일때 계산서가 보임 -->
          <el-radio-group v-model="storeDetailData.tabletBillsOnOff">
            <el-radio
              border
              label="N"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="Y"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_order_confirm)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>주문 시 확인 창</div>
            <span> - 태블릿 주문 시 한번 더 물어봅니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_order_confirm">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_set_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>세트 상품 사용</div>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_set_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_credit_able)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>연동할 미들웨어 버전</div>
            <span> - 미들웨어 버전에 맞춰서 설정해주시면 됩니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_credit_able">
            <el-radio
              :label="1"
              border
            >
              운영 버전(선/후불 공용)
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              과거 버전(후불 전용)
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.preCreditTableUse)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>선결제 매장</div>
            <span> - 선결제 매장일 경우 체크</span>
          </div>
          <el-radio-group v-model="storeDetailData.preCreditTableUse">
            <el-radio
              :label="0"
              border
            >
              후불형 매장
            </el-radio>
            <el-radio
              :label="1"
              border
            >
              선불형 매장
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="havePreCreditTableUse"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="mt-10">
            <div class="store-manage-contents-sub-title">
              (선결제 리메이크) 결제 설정
            </div>
            <div class="store-manage-contents-sub-explanation">
              - 매장에서 이용하는 결제 방법과 수단을 설정합니다.
            </div>
            <div class="store-manage-contents-sub-explanation">
              - 앱버전 1.6.x 이상부터 설정이 적용됩니다.
            </div>
          </div>
          <div class="store-manage-contents-contents-title mt-5">
            <div>선택 1. 결제 수단 선택 (필수)</div>
            <span> - 중복 선택 가능</span>
          </div>
          <el-checkbox
            :model-value="storeDetailData.credit_payment_method.card"
            border
            label="card"
            @change="preventUncheckPaymentMethod('card')"
          >
            카드
          </el-checkbox>
          <el-checkbox
            :model-value="storeDetailData.credit_payment_method.cash"
            border
            label="cash"
            @change="preventUncheckPaymentMethod('cash')"
          >
            현금
          </el-checkbox>
          <div class="store-manage-contents-contents-title mt-5">
            <div>선택 2. 결제 방법 선택 (필수)</div>
            <span> - 중복 선택 가능</span>
            <span>
              - 단일 결제: [선택 1. 결제 수단 선택]에서 선택한 항목만 결제
              방법으로 노출됩니다.
            </span>
          </div>
          <el-checkbox
            :model-value="storeDetailData.credit_payment_type.single"
            border
            label="single"
            @change="preventUncheckPaymentType('single')"
          >
            단일 결제
          </el-checkbox>
          <el-checkbox
            :model-value="storeDetailData.credit_payment_type.byPrice"
            border
            label="byPrice"
            @change="preventUncheckPaymentType('byPrice')"
          >
            더치페이
          </el-checkbox>
          <el-checkbox
            :model-value="storeDetailData.credit_payment_type.byMenu"
            border
            label="byMenu"
            @change="preventUncheckPaymentType('byMenu')"
          >
            상품별 결제
          </el-checkbox>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_van_info)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>Van사 정보</div>
            <span> - Van사 정보를 설정합니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_van_info"
            class="width-100 mt-10 mb-10"
          >
            <el-option
              v-for="(vanType, keyName) in vanTypeList"
              :key="vanType"
              :label="vanType"
              :value="keyName"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.storeSerialNumber)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포스 시리얼 넘버</div>
            <span> - Van사가 kosess 일 경우 반드시 입력</span>
          </div>
          <el-input
            v-model="storeDetailData.storeSerialNumber"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.storeVanTid)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>단말기 TID</div>
          </div>
          <el-input
            v-model="storeDetailData.storeVanTid"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.paymentMethod)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div class="mb-5">
              (선결제 구버전) 더치페이, 상품별 결제의 결제수단 선택
            </div>
            <div class="store-manage-contents-sub-explanation">
              - 매장에서 이용하는 결제 방법과 수단을 설정합니다.
            </div>
            <div class="store-manage-contents-sub-explanation">
              - 앱버전 1.5.x이하만 설정이 적용됩니다.
            </div>
          </div>
          <el-radio-group v-model="storeDetailData.paymentMethod">
            <el-radio
              :label="0"
              border
            >
              전체사용
            </el-radio>
            <el-radio
              :label="1"
              border
            >
              카드만
            </el-radio>
            <el-radio
              :label="2"
              border
            >
              현금만
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_visitBook)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>1. 인원 수 선택</div>
            <span>- 인원 수 기능 사용 여부 선택</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_visitBook">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitGroupOpenType)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>1.1 인원 수 선택 팝업 노출 순서</div>
            <span> - 주문 태블릿에서 인원 수 팝업이 노출되는 순서 선택 </span>
          </div>
          <el-radio-group v-model="storeDetailData.visitGroupOpenType">
            <el-radio
              border
              label="order"
            >
              주문하기 버튼 터치 한 다음 노출
            </el-radio>
            <el-radio
              border
              label="storeLogo"
            >
              첫 주문 전, 태블릿 터치한 다음 노출
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitOrderAble)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>2. 인원 수 미선택 시 주문 불가</div>
            <span>- 사용자가 인원 수를 입력해야만 주문 가능</span>
          </div>
          <el-radio-group v-model="storeDetailData.visitOrderAble">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitGroupUse)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>3. 총 인원 입력 버튼 터치 시 총 인원 입력</div>
            <span>
              - 주문 태블릿에서 [인원 수 선택 팝업] 노출 여부 설정 / 미사용 시
              [지역, 나이, 성별 선택 팝업] 노출 / API 버전 1.0만 사용 가능
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.visitGroupUse">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitGroups)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>
              3-1. 인원 수 그룹명 등록 (ex: 남자;여자 OR 내국인;외국인) 최대 2개
              가능
            </div>
            <span>
              - 인원 수 선택 창에 노출할 그룹명 등록 / 3번 사용 설정 시 사용
              가능
            </span>
          </div>
          <el-input
            v-model="storeDetailData.visitGroups"
            clearable
            @input="validateInput"
          />
        </div>
        <div
          v-if="
            isUndefinedData(storeDetailData.visitGroupsOrderAble) &&
            !isGlobalAdmin()
          "
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>4. 로고에 전자출입명부 버튼 노출</div>
            <span>
              - 전자출입명부: 인원 수 등록 화면 / API 버전 1.0만 사용 가능
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.visitGroupsOrderAble">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitInfoSendPos)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>총 인원수 정보 포스 전달</div>
            <span> - 총 인원수 정보를 포스에 전달함</span>
          </div>
          <el-radio-group v-model="storeDetailData.visitInfoSendPos">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitInfoSendFirstorder)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포스에 전달하는 시점</div>
            <span> - 첫주문 시 인원수 정보 전달</span>
          </div>
          <el-radio-group v-model="storeDetailData.visitInfoSendFirstorder">
            <el-radio
              :label="1"
              border
            >
              첫 주문 시 전달
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              인원수 입력 즉시 전달
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitSendFirstOrderMerge)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>첫 주문 인원수 정보 전달</div>
            <span> - 인원수 정보 와 첫 주문을 나눠서 보냄</span>
          </div>
          <el-radio-group v-model="storeDetailData.visitSendFirstOrderMerge">
            <el-radio
              :label="1"
              border
            >
              주문과 합침
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              나눠서 보냄
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.visitInfoPosPrintPeopleIsQty)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포스에 전달하는 형식 (옵션 또는 수량)</div>
            <span> - 총 인원수 수량으로 전달</span>
          </div>
          <el-radio-group
            v-model="storeDetailData.visitInfoPosPrintPeopleIsQty"
          >
            <el-radio
              :label="1"
              border
            >
              수량으로 전달
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              옵션으로 전달
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.sendOrderViewPosErr)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>태블릿 포스 응답 메세지</div>
            <span> - 포스 응답을 받습니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.sendOrderViewPosErr">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.serviceGoods_sendPaidOrder)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>선결제 직원 호출</div>
            <span> - 직원 호출 상품을 선결제 Type으로 접수합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.serviceGoods_sendPaidOrder">
            <el-radio
              :label="1"
              border
            >
              선불형 주문
            </el-radio>
            <el-radio
              :label="0"
              border
            >
              후불형 주문
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_drive_call_hide)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>1577 대리운전 사용</div>
            <span> - 1577 대리운전 사용</span>
          </div>
          <el-radio-group
            v-model="storeDetailData.T_order_store_drive_call_hide"
            @change="isValidAddress"
          >
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.storeOperationInfo"
      class="store-manage-contents-container"
    >
      <div class="store-manage-contents-title">매장 운영 정보</div>
      <div
        ref="storeOperationInfo"
        class="store-manage-contents-contents"
      >
        <!-- T_order_store_pos_info가 없는 경우 미들웨어, 포스 정보도 불필요 -->
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_pos_info)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>미들웨어 연동 여부</div>
          </div>
          <el-radio-group
            v-model="storeDetailData.T_order_store_has_middleware"
          >
            <el-radio
              id="store-manage-contents-has-middleware"
              border
              label="Y"
            >
              미들웨어 연동
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미들웨어 미연동
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_pos_info)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포스 구분</div>
          </div>
          <el-radio-group
            id="store-manage-contents-has-pos"
            v-model="storeDetailData.T_order_store_has_pos"
          >
            <el-radio
              id="store-manage-contents-has-pos"
              border
              label="Y"
            >
              포스 유(有)
            </el-radio>
            <el-radio
              :disabled="storeDetailData.T_order_store_has_middleware === 'Y'"
              border
              class="ml-10"
              label="N"
            >
              포스 무(無)
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_pos_info)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포스 정보</div>
            <span> - 매장 포스 정보</span>
          </div>
          <el-select
            id="store-manage-contents-pos-info"
            v-model="storeDetailData.T_order_store_pos_info"
            :disabled="isOnlyNoPos"
            class="width-100"
          >
            <el-option
              v-for="posInfo in posInfoList"
              :key="posInfo"
              :label="posInfo"
              :value="posInfo"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_origin_store_name)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장명</div>
            <span> - 운영중인 매장 이름입니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_origin_store_name"
            :disabled="!checkAuthFunction('F3003')"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_area_name)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>지점명</div>
            <span> - 운영중인 매장의 지점 노출</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_area_name"
            :disabled="!checkAuthFunction('F3003')"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_name)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>
              태블릿 노출 매장명
              <el-icon>
                <StarFilled color="red"/>
              </el-icon>
            </div>
            <span> - 운영중인 업체 이름입니다.</span>
          </div>
          <el-input
            id="store-manage-contents-tablet-store-name"
            v-model="storeDetailData.T_order_store_name"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Saup_number)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>사업자 번호</div>
            <span> - 운영중인 업체의 사업자 번호입니다.</span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_Saup_number"
            clearable
          />
        </div>

        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_address)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-title-button">
            <div>매장 주소</div>
            <div>
              <el-button
                size="small"
                type="primary"
                @click="getPostInfo"
              >
                검색하기
              </el-button>
            </div>
          </div>
          <el-row
            align="middle"
            justify="space-between"
          >
            <p class="store-manage-contents-text">우편 번호</p>
            <el-input
              id="postCode"
              v-model="storeDetailData.T_order_store_zipcode"
              class="address-input"
              clearable
            />
          </el-row>
          <el-row
            align="middle"
            justify="space-between"
          >
            <p class="store-manage-contents-text">주소</p>
            <el-input
              id="address"
              v-model="storeDetailData.T_order_store_address"
              class="address-input"
              clearable
            />
          </el-row>
          <el-row
            align="middle"
            justify="space-between"
          >
            <p class="store-manage-contents-text">상세 주소</p>
            <el-input
              id="detailAddress"
              v-model="storeDetailData.T_order_store_address2"
              class="address-input"
              clearable
            />
          </el-row>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_Popup_time)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>리뷰 서비스 시간</div>
          </div>
          <el-input-number
            v-model="storeDetailData.T_order_store_Popup_time"
            :min="0"
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_stote_register_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>가입하기 사용</div>
            <span> - 주문 시 가입하기</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_stote_register_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_point_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>포인트 사용</div>
            <span> - 포인트 미사용 시 적립되지 않습니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_point_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_cart_point_type)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>결제시 포인트</div>
            <span> - 주문 시 가입하기</span>
          </div>
          <div class="mb-10">
            <el-radio-group
              v-model="storeDetailData.T_order_store_cart_point_type"
            >
              <el-radio
                :label="0"
                border
              >
                구매 금액에 따른 N% 적립
              </el-radio>
              <el-radio
                :label="1"
                border
              >
                구매 금액에 따라 N원 적립
              </el-radio>
            </el-radio-group>
          </div>
          <el-input
            v-model="storeDetailData.T_order_store_cart_point"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_min_order_price)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>최소 주문 금액 설정</div>
            <span>
              - 최초 주문 시 아래 금액 미만일 경우 주문되지 않습니다.
            </span>
          </div>
          <el-input
            v-model="storeDetailData.T_order_min_order_price"
            clearable
          />
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_stat)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 계약 상태</div>
            <span> - 진행중인 매장 계약 상태를 나타냅니다.</span>
          </div>
          <el-select
            v-model="storeDetailData.T_order_store_stat"
            class="width-100"
            placeholder="매장 계약 상태를 선택해주세요."
          >
            <el-option
              v-for="(state, index) in storeStateList"
              :key="isStoreStat(state.code, index)"
              :disabled="!state.valid"
              :label="state.name"
              :value="state.code"
            />
          </el-select>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.open_hour)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>운영 시간</div>
            <span> - 매장 운영 시간을 설정합니다.</span>
          </div>
          <el-row justify="space-between">
            <div class="store-manage-contents-detail">
              <p class="store-manage-contents-text">운영 시작 시간</p>
              <div>
                <el-select
                  v-model="storeDetailData.open_hour"
                  placeholder="운영 시작 시간"
                >
                  <el-option
                    v-for="time in getOpenStoreTime"
                    :key="time.value"
                    :label="time.label"
                    :value="time.value"
                  />
                </el-select>
              </div>
            </div>
            <div class="store-manage-contents-detail">
              <p class="store-manage-contents-text">운영 종료 시간</p>
              <el-select
                v-model="storeDetailData.close_hour"
                placeholder="운영 종료 시간"
              >
                <el-option
                  v-for="time in getCloseStoreTime"
                  :key="time.value"
                  :label="time.label"
                  :value="time.value"
                />
              </el-select>
            </div>
          </el-row>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_restroom_use)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>화장실 안내 기능 사용</div>
            <span> - 화장실 위치 안내 기능 사용여부를 선택합니다.</span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_restroom_use">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_restroom_img)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>화장실 안내 이미지</div>
            <span> - 화장실 위치 안내 이미지를 등록합니다.</span>
          </div>
          <el-row
            class="mb-10"
            justify="center"
          >
            <el-upload
              v-loading.fullscreen.lock="fullscreenLoading"
              :auto-upload="false"
              :on-change="storeRestroomUploadSuccess"
              :show-file-list="false"
              class="mr-5"
              drag
            >
              <div class="mb-10">
                <el-image
                  :src="storeDetailData.T_order_store_restroom_img"
                  alt="upload-image"
                  class="upload-image"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture/>
                      </el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </el-upload>
          </el-row>
          <el-row>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지를 클릭하거나 드래그해서 이미지를 변경할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일은 최대 2MB까지 업로드 할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일 포멧은 PNG, JPG, JPEG 만 가능합니다.
              </p>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.storeLogoSetting"
      class="store-manage-contents-container"
    >
      <div
        ref="storeLogoSetting"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_logo)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 로고</div>
            <span> - 태블릿 초기 화면에 띄우는 이미지입니다.</span>
          </div>
          <el-row
            class="mb-10"
            justify="center"
          >
            <el-upload
              v-loading.fullscreen.lock="fullscreenLoading"
              :auto-upload="false"
              :on-change="storeLogoUploadSuccess"
              :show-file-list="false"
              class="mr-5"
              drag
            >
              <div class="mb-10">
                <el-image
                  :src="storeDetailData.T_order_store_logo"
                  alt="upload-image"
                  class="upload-image"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture/>
                      </el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </el-upload>
          </el-row>
          <el-row>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지를 클릭하거나 드래그해서 이미지를 변경할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일은 최대 2MB까지 업로드 할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일 포멧은 PNG, JPG, JPEG 만 가능합니다.
              </p>
            </el-col>
          </el-row>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_logoUse)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>로고 사용</div>
            <span>
              - 로고 이미지가 등록되더라도 '아니오'를 선택하면 로고가 출력되지
              않습니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_logoUse">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div
      v-if="isHaveDataState.backgroundSetting"
      class="store-manage-contents-container"
    >
      <div
        ref="backgroundSetting"
        class="store-manage-contents-contents"
      >
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_background)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>매장 배경</div>
            <span> - 태블릿 배경 이미지</span>
          </div>
          <el-row
            class="mb-10"
            justify="center"
          >
            <el-upload
              v-loading.fullscreen.lock="fullscreenLoading"
              :auto-upload="false"
              :on-change="storeBgImgUploadSuccess"
              :show-file-list="false"
              class="mr-5"
              drag
            >
              <div class="mb-10">
                <el-image
                  :src="storeDetailData.T_order_store_background"
                  alt="upload-image"
                  class="upload-image"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture/>
                      </el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </el-upload>
          </el-row>
          <el-row>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지를 클릭하거나 드래그해서 이미지를 변경할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일은 최대 2MB까지 업로드 할 수 있습니다.
              </p>
            </el-col>
            <el-col :span="24">
              <p class="upload-image-desc">
                - 이미지 파일 포멧은 GIF, PNG, JPG, JPEG 만 가능합니다.
              </p>
            </el-col>
          </el-row>
        </div>
        <div
          v-if="isUndefinedData(storeDetailData.T_order_store_backgroundUse)"
          class="store-manage-contents-contents-wrapper"
        >
          <div class="store-manage-contents-contents-title">
            <div>배경 사용</div>
            <span>
              - 배경 이미지가 등록되더라도 '아니오'를 선택하면 배경이 출력되지
              않습니다.
            </span>
          </div>
          <el-radio-group v-model="storeDetailData.T_order_store_backgroundUse">
            <el-radio
              border
              label="Y"
            >
              사용
            </el-radio>
            <el-radio
              border
              label="N"
            >
              미사용
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
  </div>
  <div class="store-manage-floating-button">
    <el-button
      size="large"
      type="primary"
      @click="validateRequiredData"
    >
      매장 설정 저장
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.store-manage-transfer-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.store-manage-contents {
  column-count: 2;
  width: 100%;

  .store-manage-contents-container {
    display: inline-block;
    width: 100%;
    margin-bottom: 20px;
    background-color: #f1f1ff;
    break-inside: avoid;

    .store-manage-contents-title {
      padding: 12px 20px;
      font-size: 15px;
      border-bottom: 1px solid #d2d2e4;
    }

    .store-manage-contents-contents {
      padding: 20px;

      .store-manage-contents-contents-wrapper {
        margin-bottom: 12px;

        .store-manage-contents-contents-title {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
          padding: 10px 6px;
          margin-bottom: 8px;
          font-size: 15px;
          font-weight: bold;
          border-bottom: 1px solid #d2d2e4;

          span {
            font-size: 12px;
            color: #f56c6c;
          }
        }

        .store-manage-contents-duplicate-check {
          display: flex;
          gap: 5px;
          width: 100%;

          .store-manage-contents-duplicate-input {
            width: 100%;
          }
        }

        .store-manage-contents-title-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 6px;
          margin-bottom: 8px;
          font-size: 15px;
          font-weight: bold;
          border-bottom: 1px solid #d2d2e4;
        }

        .store-manage-contents-text {
          margin: 0 0 3px 7px;
          font-size: 14px;
        }

        .corporation-wrapper {
          gap: 30px;
        }

        .upload-image {
          width: 480px;
          height: 300px;
          object-fit: fill;
        }

        .ad-list-image-wrapper {
          width: 100%;
          height: 150px;
        }

        .flag-list-wrap {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          gap: 5px;
          align-items: center;
          justify-content: center;

          .national-flag {
            width: 75px;
            height: 75px;
          }
        }

        .image-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 30px;
          color: var(--el-text-color-secondary);
          background: var(--el-fill-color-light);

          &.ad-list {
            flex-direction: column;
            gap: 15px;
            font-size: 14px;

            .error-icon {
              font-size: 30px;
            }
          }
        }

        .upload-image-desc {
          margin-bottom: 5px;
          font-size: 14px;
          color: #adafbc;
        }

        .ad-banner-wrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;

          .ad-banner-info {
            display: flex;
            align-items: center;
            justify-content: space-around;
          }
        }

        .store-manage-contents-detail {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .store-manage-url-contents {
          padding-left: 10px;
        }

        .store-manage-banner-exposure-time {
          font-size: 14px;
        }
      }

      .store-manage-contents-sub-title {
        padding: 4px 4px 6px 4px;
        font-size: 15px;
        font-weight: bold;
      }

      .store-manage-contents-sub-explanation {
        padding: 2px;
        font-size: 13px;
        font-weight: bold;
        color: #4c4c4c;
      }

      .tablet-control-wrap {
        padding: 10px;
        background-color: #ffffff;
      }
    }
  }
}

.store-manage-floating-button {
  position: fixed;
  right: 60px;
  bottom: 60px;
}

.address-input {
  margin-bottom: 10px;
}

:deep(.el-date-editor.el-input, .el-date-editor.el-input__wrapper) {
  width: 150px;
}

.tablet-brightness {
  .tablet-brightness-values {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 50%;

    .tablet-brightness-values-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      font-size: 14px;
    }
  }

  .tablet-brightness-wait-desc {
    font-size: 14px;
  }
}

.option-migration-text {
  font-size: 12px;
  color: #f56c6c;

  .no-migration-text {
    color: #409eff;
  }
}
</style>
