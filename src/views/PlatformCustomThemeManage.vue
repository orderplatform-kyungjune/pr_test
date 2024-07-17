<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, Ref, ref } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils/index';
import { isUPLUSAdmin } from '@utils/authentication';
import useTagsStore from '@store/storeTags';
import useModalStore from '@store/storeModal';
import { bannerManage, categorizeManageTabletV2, tableManage } from '@router/routePaths';
import {
  requestStoreInfoDataStorePlatformType,
  requestStoreThemeListType,
  storeInfoDataCustomStyleType,
  storeInfoDataStorePlatformType,
} from '@interface/store';
import { Close, Histogram, Management, Platform, SetUp } from '@element-plus/icons-vue';
import {
  BreadcrumbHeader,
  ExampleBackground,
  ExampleButton,
  ExampleMainCategoryMenu,
  ExampleSubCategoryMenu,
  ExampleTableNumber,
  StoreNameBox,
} from '@components';
import {
  CUSTOM_SETTING,
  CUSTOM_THEME_CODE,
  SET_TABLET_VERSION,
  STORE_LIST,
  TAB_CODE_TABLE_CONTROL,
  USER_MIXED_PALETTE_CODE,
  USER_MIXED_PALETTE_NAME,
} from '@common/string';
import { store } from '@apis';

const { failAuthenticationAlert, checkAuthFunction } = authentication;

const { openModal } = useModalStore();

const { addTagsData } = useTagsStore();

const {
  requestStoreThemeList,
  requestDefaultLayout,
  requestUpdateCategoryBackGroundImageInPlatform,
  requestCustomStyleDataInPlatform,
  requestCustomTemplateList,
  requestStoreInfo,
  requestStoreUpdate,
} = store;

const storeManageHeader = [{ name: STORE_LIST }, { name: CUSTOM_SETTING }];

const pathQuery = useRoute().query;

/** 커스텀 색상 토글 선택 */
const activeToggleName = ref(['']);

const tabletCount: Ref<number> = ref(0);

/** 매장 설정 정보 (테마 설정, 옵션 레이아웃 설정) */
const storeDetailData: Ref<Partial<requestStoreInfoDataStorePlatformType>> =
  ref({
    platform_store_Theme: '',
    optionLayout: '',
    platform_store_staff_password: '',
  });

/** 매장 설정 데이터 */
const originStoreData = ref({} as storeInfoDataStorePlatformType);

/** 커스텀 테마 색 조합 */
// 커스텀테마- 템플릿 데이터 구성은 문서 참고: https://www.notion.so/torderkorea/2-14040f360ccc49fab36b1936f1f1a081?pvs=4
const unfilledCustomStyle = {
  code: '',
  name: '',
  useYn: 'N',
  button: {
    fontColor: '',
    backgroundColor: '',
  },
  font: {
    color: '',
    activeColor: '',
  },
  staffCallButton: {
    fontColor: '',
    backgroundColor: '',
  },
  tableNum: {
    fontColor: '',
    backgroundColor: '',
  },
  category: {
    subCategory: {
      fontColor: '',
      activeFontColor: '',
    },
    mainCategory: {
      fontColor: '',
      activeFontColor: '',
    },
    backgroundImg: '',
    backgroundColor: '',
  },
  background: { backgroundColor: '' },
  bottomNavbar: { backgroundColor: '' },
  primaryColor: '',
  mainColor: [],
  mode: '',
};

/** 커스텀 스타일 정보 */
const customStyleData = ref<storeInfoDataCustomStyleType>(unfilledCustomStyle);

/** 옵션 레이아웃 설정 */
const basicLayoutList = ref([['', '']]);

/** 옵션 레이아웃은 테마별로 달라짐. api로부터 모든 옵션 레이아웃을 받은 후 선택한 테마에 따라 필터링 */
const filteredOptionLayout = ref([['', '']]);
const filterOptionLayout = () => {
  if (storeDetailData.value.platform_store_Theme?.includes(CUSTOM_THEME_CODE)) {
    filteredOptionLayout.value = basicLayoutList.value?.filter((item) =>
      item[0].includes('custom'),
    );
    return;
  }

  filteredOptionLayout.value = basicLayoutList.value?.filter(
    (item) => !item[0].includes('custom'),
  );
};

/** 옵션 레이아웃 데이터 요청 */
const getDefaultLayout = async () => {
  try {
    const res = (await requestDefaultLayout()) as AxiosResponse;

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
      basicLayoutList.value = Object.entries(res.data.data);
      filterOptionLayout();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 테마 설정 */
const storeThemeList: Ref<requestStoreThemeListType[]> = ref([]);
const getStoreThemeList = async () => {
  const requestData = {
    api: storeDetailData.value.platform_store_apiType ?? '',
    type: 'update',
  };

  try {
    const res = (await requestStoreThemeList(requestData)) as AxiosResponse;

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
      storeThemeList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const isCustomTheme = () =>
  storeDetailData.value.platform_store_Theme?.includes(CUSTOM_THEME_CODE);

/** 커스텀 스타일 저장하기 */
const postCustomStyleInfo = async () => {
  try {
    customStyleData.value.useYn = isCustomTheme() ? 'Y' : 'N';

    const customStyleInfo = {
      storeCode: pathQuery.code as string,
      platform_store_tablet_custom_style: isCustomTheme()
        ? customStyleData.value
        : unfilledCustomStyle,
    };
    const res = (await requestCustomStyleDataInPlatform(
      customStyleInfo,
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
  } catch (error) {
    console.log(error);
  }
};

/** 상품 배경 이미지 변경하기 */
const postCustomBackgroundImage = async () => {
  const backgroundImageData = {
    storeCode: pathQuery.code as string,
    platform_store_category_background:
      customStyleData.value.category.backgroundImg,
  };

  try {
    ElMessage.info('이미지 적용중 입니다.');
    const res = (await requestUpdateCategoryBackGroundImageInPlatform(
      backgroundImageData,
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
      customStyleData.value.category.backgroundImg =
        res.data.data.platform_store_category_background;
    }
  } catch (error) {
    console.log(error);
  }
};

const isColorTemplate = (templateCode: string) =>
  templateCode?.startsWith('color-');

/** 커스텀 테마 템플릿 리스트 */
const allTemplateList: Ref<storeInfoDataCustomStyleType[]> = ref([]);
const filteredTemplateList: Ref<storeInfoDataCustomStyleType[]> = ref([]);
const selectedTemplateDisplayInfo = reactive({
  code: '',
  mainColor: '',
});
const isDisabledDarkMode = computed(
  () =>
    !isColorTemplate(customStyleData.value.code as string) &&
    customStyleData.value.code !== USER_MIXED_PALETTE_CODE,
);

/** 템플릿 세부 색상 변경: 템플릿 코드 아닌 별도 코드 지정 */
const changeTemplateSettings = () => {
  selectedTemplateDisplayInfo.code = USER_MIXED_PALETTE_CODE;
  customStyleData.value.code = USER_MIXED_PALETTE_CODE;
  customStyleData.value.name = '사용자 지정';
};

/** 상품 배경 이미지 변경하기 */
const changeBackgroundImage = async (response: any) => {
  customStyleData.value.category.backgroundImg = response.raw;
  await postCustomBackgroundImage();
  changeTemplateSettings();
};

/** 커스텀 스타일 배경 이미지 제거 */
const deleteCustomStyleImage = () => {
  customStyleData.value.category.backgroundImg = '';
  changeTemplateSettings();
};

/** 커스텀 스타일 반영 */
const applyTemplateData = (targetTemplate: storeInfoDataCustomStyleType) => {
  customStyleData.value = cloneDeep(targetTemplate);
  selectedTemplateDisplayInfo.mainColor =
    customStyleData.value?.mainColor?.[0] ?? '#000';
};

const changeCustomStyleMode = (isModeChange?: boolean) => {
  /** 모드에 맞는 템플릿 리스트 구성 */
  // eslint-disable-next-line vue/max-len
  filteredTemplateList.value = allTemplateList.value?.filter(
    (templateItem: storeInfoDataCustomStyleType) =>
      isColorTemplate(templateItem.code as string) &&
      templateItem.mode === customStyleData.value.mode,
  );

  // 기존 템플릿은 두 밝기모드에 항상 출력: 기본, 레스토랑, 청담스케줄
  const basicTemplates: storeInfoDataCustomStyleType[] =
    allTemplateList.value?.filter(
      (templateItem: storeInfoDataCustomStyleType) =>
        !isColorTemplate(templateItem.code as string),
    );
  filteredTemplateList.value = basicTemplates.concat(
    filteredTemplateList.value,
  );

  /** 다크/라이트 모드의 기본 설정 반영 */
  if (isModeChange) {
    customStyleData.value.background.backgroundColor =
      customStyleData.value.mode === 'light' ? '#FFFFFF' : '#181818';
    customStyleData.value.category.subCategory.fontColor =
      customStyleData.value.mode === 'light' ? '#313131' : '#FFFFFF';
  }

  // 컬러 템플릿: 선택된 템플릿의 다른 모드 선택
  if (isColorTemplate(customStyleData.value.code as string)) {
    const sameTemplateByMode = filteredTemplateList.value?.find(
      (templateInMode: storeInfoDataCustomStyleType) =>
        templateInMode.name === customStyleData.value.name,
    );
    if (sameTemplateByMode) {
      selectedTemplateDisplayInfo.code = sameTemplateByMode.code ?? '';
      applyTemplateData(sameTemplateByMode);
    }
  }
};

// 티오더2 커스텀테마의 기본 템플릿 값 설정
const setDefaultCustomStyle = () => {
  let defaultTemplate: storeInfoDataCustomStyleType | null = null;

  const hasCustomizedStyle =
    originStoreData.value.platform_store_tablet_custom_style &&
    originStoreData.value.platform_store_tablet_custom_style.useYn === 'Y';
  // eslint-disable-next-line vue/max-len
  const isValidCustomStyle =
    !!originStoreData.value.platform_store_tablet_custom_style?.background
      .backgroundColor &&
    !!originStoreData.value.platform_store_tablet_custom_style?.button
      .backgroundColor;
  if (hasCustomizedStyle && isValidCustomStyle) {
    defaultTemplate = cloneDeep(
      originStoreData.value.platform_store_tablet_custom_style,
    );
    defaultTemplate.code = USER_MIXED_PALETTE_CODE;
    defaultTemplate.name = USER_MIXED_PALETTE_NAME;
    defaultTemplate.mainColor = [];
    if (!defaultTemplate.mode) defaultTemplate.mode = 'light';
  }

  // 기본 color-green-light 템플릿 설정
  if (!defaultTemplate) {
    defaultTemplate = allTemplateList.value?.find(
      (templateItem: storeInfoDataCustomStyleType) =>
        templateItem.code === 'color-green-light',
    ) as storeInfoDataCustomStyleType;
  }

  applyTemplateData(defaultTemplate);

  changeCustomStyleMode();
};

const setCustomStylePart = () => {
  if (storeDetailData.value.platform_store_Theme === CUSTOM_THEME_CODE) {
    activeToggleName.value = ['totalPreview', 'template'];
    setDefaultCustomStyle();
  } else {
    activeToggleName.value = [];
  }
};

// 테마 선택 변경 시 동작: 옵션 레이아웃 리스트 및 선택 초기화, (커스텀테마) 템플릿 및 스타일 초기화
const changeThemeSelect = () => {
  storeDetailData.value.optionLayout = '';
  filterOptionLayout();
  setCustomStylePart();
};

const getSelectedTemplateButtonClass = (
  templateInfo: storeInfoDataCustomStyleType,
) => ({
  dark:
    templateInfo.code === customStyleData.value.code &&
    customStyleData.value.mode === 'dark',
  selected: templateInfo.code === customStyleData.value.code,
});
const getTemplateColorPreviewStyle = (mainColor: string[]) =>
  `background-image: linear-gradient(to right, ${mainColor[0]} 52%, ${mainColor[1] ?? mainColor[0]} 48%);`;

/** 커스텀 테마 템플릿 리스트 불러오기 */
const getCustomTemplateList = async () => {
  try {
    const res = (await requestCustomTemplateList()) as AxiosResponse;

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
      allTemplateList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 관련 정보 */
const getStoreInfo = async () => {
  try {
    const res = (await requestStoreInfo(
      pathQuery.code as string,
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
      originStoreData.value = res.data.data.store;
      storeDetailData.value.platform_store_Theme =
        res.data.data.store.platform_store_Theme;
      storeDetailData.value.platform_store_staff_password =
        res.data.data.store.platform_store_staff_password;
      storeDetailData.value.optionLayout = res.data.data.store.optionLayout;
      tabletCount.value = res.data.data.tablet_count;

      // 커스텀테마인 경우 템플릿 및 태블릿 개별 색상 설정 적용
      if (storeDetailData.value.platform_store_Theme === CUSTOM_THEME_CODE) {
        activeToggleName.value = ['totalPreview', 'template'];
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 수정 */
const editStoreInfo = async () => {
  const storeCode = { storeCode: pathQuery.code as string };
  const requestStoreData = cloneDeep(storeDetailData.value);

  delete requestStoreData.platform_store_tablet_custom_style;

  const requestEditData: requestStoreInfoDataStorePlatformType = Object.assign(
    requestStoreData,
    storeCode,
  );

  try {
    ElMessageBox.confirm('매장 정보를 수정하시겠습니까?', '경고', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    }).then(async () => {
      try {
        await postCustomStyleInfo();
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
          await getStoreInfo();

          ElMessage({
            type: 'success',
            message: '정상적으로 수정되었습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const getThemeListKey = (flags: requestStoreThemeListType, index: number) => {
  if (!flags) {
    return `flag-${index}`;
  }
  return `${flags.no} - ${flags.theme_name}`;
};

const getTemplateKey = (templateCode: string, index: number) => {
  if (!templateCode) {
    return `template-${index}`;
  }
  return `template-${templateCode}-${index}`;
};

const getOptionLayoutKey = (layout: string[], index: number) =>
  layout ? `${layout[0]}-${layout[1]}-${index}` : `optionLayout-${index}`;

const getTemplateMainColor = computed(
  () => selectedTemplateDisplayInfo.mainColor,
);

// el-color-picker 초기화버튼 숨기기
document
  .querySelectorAll('.el-color-dropdown__link-btn')
  .forEach((element: Element) => {
    // eslint-disable-next-line no-param-reassign
    (element as HTMLElement).style.visibility = 'hidden';
  });

const initTabletDisplayData = async () => {
  await getStoreInfo();
  await getStoreThemeList();
  await getCustomTemplateList();
  await getDefaultLayout();

  filterOptionLayout();
  setCustomStylePart();
  // 티오더2 1/0/5 배포 전 커스텀스타일 지정한 경우, 기존 스타일 우선
  customStyleData.value.background.backgroundColor =
    originStoreData.value.platform_store_tablet_custom_style?.background?.backgroundColor;
};
initTabletDisplayData();
</script>

<template>
  <BreadcrumbHeader :propsHeader="storeManageHeader" />
  <StoreNameBox :apiVersion="storeDetailData.platform_store_apiType" />
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
    <el-button
      v-if="!isUPLUSAdmin()"
      :icon="SetUp"
      color="#626aef"
      size="large"
      @click="openModal(SET_TABLET_VERSION)"
    >
      태블릿 버전 설정
    </el-button>
  </div>
  <div class="custom-theme-manage-container">
    <div class="tabs-contents-wrapper">
      <div class="tabs-contents-title">
        <div>태블릿 테마 설정</div>
        <span> - 태블릿의 기본 테마를 지정합니다.</span>
      </div>
      <el-select
        v-model="storeDetailData.platform_store_Theme"
        class="width-100"
        placeholder="테마를 선택해주세요."
        @change="changeThemeSelect"
      >
        <el-option
          v-for="(theme, index) in storeThemeList"
          :key="getThemeListKey(theme, index)"
          :label="theme.theme_name"
          :value="theme.no"
        />
      </el-select>
    </div>
    <div class="tabs-contents-wrapper">
      <div class="tabs-contents-title">
        <div>옵션 레이아웃</div>
        <span> - 옵션 선택 시 화면 레이아웃을 설정합니다.</span>
      </div>
      <el-select
        v-model="storeDetailData.optionLayout"
        class="width-100"
        placeholder="레이아웃을 선택해 주세요."
      >
        <el-option
          v-for="(option, index) in filteredOptionLayout"
          :key="getOptionLayoutKey(option, index)"
          :label="option[1]"
          :value="option[0]"
        />
      </el-select>
    </div>
    <div class="tabs-contents-wrapper">
      <div
        class="tabs-contents-title tabs-contents-only-custom-style
          none-underline"
      >
        <div>
          <div>커스텀 테마 설정</div>
          <span> * 커스텀 테마의 템플릿을 선택합니다.</span>
        </div>
      </div>
      <el-collapse v-model="activeToggleName">
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="template"
          title="템플릿 설정"
        >
          <div>
            <div class="sub-container-in-collapse">
              <p class="font-thin mb-5">• 색상 모드</p>
              <div class="sub-contents-in-collapse">
                <el-radio-group
                  v-model="customStyleData.mode"
                  :disabled="!isCustomTheme()"
                  @change="changeCustomStyleMode(true)"
                >
                  <el-radio
                    border
                    label="light"
                  >
                    라이트 모드
                  </el-radio>
                  <el-radio
                    :disabled="isDisabledDarkMode"
                    border
                    label="dark"
                  >
                    다크 모드
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
            <div>
              <div class="sub-container-in-collapse">
                <p class="font-thin mb-5 mt-20">• 템플릿 종류</p>
                <div class="sub-contents-in-collapse">
                  <el-radio-group
                    v-model="selectedTemplateDisplayInfo.code"
                    class="template-preview-button-group"
                  >
                    <el-radio
                      v-for="(templateItem, index) in filteredTemplateList"
                      :key="getTemplateKey(templateItem.code as string, index)"
                      :class="getSelectedTemplateButtonClass(templateItem)"
                      :disabled="
                        customStyleData.mode === 'dark' &&
                        !templateItem.code?.includes('color')
                      "
                      :label="templateItem.code"
                      border
                      class="template-preview-button"
                      size="large"
                      @change="applyTemplateData(templateItem)"
                    >
                      <div class="template-preview-button-wrap">
                        <span class="template-button-title">
                          {{ templateItem.name }}
                        </span>
                        <div
                          :style="
                            getTemplateColorPreviewStyle(
                              templateItem.mainColor ?? ['#000'],
                            )
                          "
                          class="template-button-preview"
                        ></div>
                      </div>
                    </el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="totalPreview"
          title="미리보기"
        >
          <div>
            <ExampleBackground :customStyle="customStyleData" />
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="first"
          title="대분류"
        >
          <div class="color-picker-grid">
            <ExampleMainCategoryMenu
              :category="customStyleData.category"
              :mode="customStyleData.mode ?? ''"
              :productBackgroundColor="
                customStyleData.background.backgroundColor
              "
            />
            <div class="color-picker-setting-grid">
              <el-row align="middle">
                <p class="color-picker-title mr-10">상품 배경 색상</p>
                <el-color-picker
                  v-model="customStyleData.category.backgroundColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">분류 배경 이미지</p>
                <el-upload
                  :auto-upload="false"
                  :on-change="changeBackgroundImage"
                  :show-file-list="false"
                >
                  <div class="custom-style-background-image">
                    <el-image
                      :src="customStyleData.category.backgroundImg"
                      class="image-slot-background"
                    >
                      <template #error>
                        <el-icon>
                          <Close />
                        </el-icon>
                      </template>
                    </el-image>
                  </div>
                </el-upload>
                <el-button
                  :icon="Close"
                  circle
                  class="ml-10"
                  @click="deleteCustomStyleImage"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상 (활성)</p>
                <el-color-picker
                  v-model="
                    customStyleData.category.mainCategory.activeFontColor
                  "
                  @change="changeTemplateSettings"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상 (비활성)</p>
                <el-color-picker
                  v-model="customStyleData.category.mainCategory.fontColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="second"
          title="중분류"
        >
          <div class="color-picker-grid">
            <ExampleSubCategoryMenu
              :productBackgroundColor="
                customStyleData.background.backgroundColor
              "
              :subCategory="customStyleData.category.subCategory"
            />
            <div class="color-picker-setting-grid">
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상 (활성)</p>
                <el-color-picker
                  v-model="customStyleData.category.subCategory.activeFontColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상 (비활성)</p>
                <el-color-picker
                  v-model="customStyleData.category.subCategory.fontColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="table"
          title="테이블 번호"
        >
          <div class="color-picker-grid">
            <ExampleTableNumber :table="customStyleData.tableNum" />
            <div class="color-picker-setting-grid">
              <el-row align="middle">
                <p class="color-picker-title mr-10">배경 색상</p>
                <el-color-picker
                  v-model="customStyleData.tableNum.backgroundColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상</p>
                <el-color-picker
                  v-model="customStyleData.tableNum.fontColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="button"
          title="버튼"
        >
          <div class="color-picker-grid">
            <ExampleButton :button="customStyleData.button" />
            <div class="color-picker-setting-grid">
              <el-row align="middle">
                <p class="color-picker-title mr-10">배경 색상</p>
                <el-color-picker
                  v-model="customStyleData.button.backgroundColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
              <el-row align="middle">
                <p class="color-picker-title mr-10">폰트 색상</p>
                <el-color-picker
                  v-model="customStyleData.button.fontColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          :disabled="!isCustomTheme()"
          name="background"
          title="배경"
        >
          <div class="color-picker-grid">
            <ExampleBackground :customStyle="customStyleData" />
            <div class="color-picker-setting-grid ml-30">
              <el-row align="middle">
                <p class="color-picker-title mr-10">상품 배경 색상</p>
                <el-color-picker
                  v-model="customStyleData.background.backgroundColor"
                  @change="changeTemplateSettings"
                />
              </el-row>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
  <el-button
    class="store-manage-floating-button"
    size="large"
    type="primary"
    @click="editStoreInfo"
  >
    매장 설정 저장
  </el-button>
</template>

<style lang="scss" scoped>
:deep(.el-color-dropdown__link-btn) {
  display: none;
}

.store-manage-transfer-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.custom-theme-manage-container {
  .tabs-contents-wrapper {
    margin-bottom: 30px;

    .tabs-contents-title {
      display: flex;
      flex-direction: column;
      gap: 5px;
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

      &.tabs-contents-only-custom-style {
        flex-direction: row;
        align-items: center;

        span {
          color: #e30000;
          font-weight: bold;
        }
      }
    }

    .color-picker-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      width: 100%;

      .color-picker-setting-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .color-picker-title {
          font-size: 13px;
        }
      }
    }

    .sub-container-in-collapse {
      padding-left: 15px;

      .sub-contents-in-collapse {
        padding-left: 10px;
        width: 100%;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-flow: wrap;
      }
    }

    .template-preview-button-group {
      display: flex;
      gap: 10px;

      .template-preview-button {
        margin-right: 0 !important;

        &.selected {
          --el-color-primary: v-bind(getTemplateMainColor);
        }

        &.dark {
          background-color: #181818;
        }

        :deep(.el-radio__input) {
          display: none;
        }

        .template-preview-button-wrap {
          display: flex;
          align-items: center;
          width: 120px;

          .template-button-title {
            flex: 1;
            text-align: start;
          }

          .template-button-preview {
            width: 23px;
            height: 23px;
            border-radius: 50%;
            background-color: #000;
          }
        }
      }
    }
  }

  .custom-style-background-image {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 4px;
    width: 20px;
    height: 20px;

    :deep(.image-slot-background) {
      i,
      img {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.store-manage-floating-button {
  position: fixed;
  right: 60px;
  bottom: 60px;
}

.none-underline {
  margin: 0 !important;
  border-bottom: 0 !important;
}
</style>
