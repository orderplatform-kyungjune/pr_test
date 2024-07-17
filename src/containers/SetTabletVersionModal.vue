<script lang="ts" setup>
import {useRoute} from 'vue-router';
import {computed, h, onMounted, reactive, ref, Ref} from 'vue';
import {cloneDeep} from 'lodash';
import {ElMessage, ElMessageBox} from 'element-plus';
import {AxiosResponse} from 'axios';
import {authentication} from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestStoreThemeListType,
  requestUpdateStoreTabletVersionType,
  storeInfoDataCustomStyleType,
  storeInfoDataStoreType,
} from '@interface/store';
import {WarnTriangleFilled} from '@element-plus/icons-vue';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import {ExampleBackground} from '@components';
import {
  CUSTOM_THEME_CODE,
  SET_TABLET_VERSION,
  USER_MIXED_PALETTE_CODE,
  USER_MIXED_PALETTE_NAME,
} from '@common/string';
import {migration, store} from '@apis';

const { requestConvertVersionPreview } = migration;
const { failAuthenticationAlert } = authentication;
const {
  requestStoreInfo,
  requestStoreThemeList,
  requestDefaultLayout,
  requestCustomTemplateList,
  requestStoreTabletVersionUpdate,
} = store;
const { closeModal, flag } = useModalStore();

const props = defineProps<{
  initTabletDisplayData: () => void;
}>();

const route = useRoute();
const storeCode = route.query.code as string;

/** 매장 설정 데이터 */
const originStoreInfo: Ref<storeInfoDataStoreType> = ref(
  {} as storeInfoDataStoreType,
);

const displayInfo = reactive({
  apiType: '',
  theme: '',
  optionLayout: '',
  templateCode: '',
  tabletUrl: '',
});

const isAgreeOptionMigration = ref(false);
const clickOptionMigrationBox = (event: Event) => {
  event.preventDefault();
  isAgreeOptionMigration.value = !isAgreeOptionMigration.value;
};

const isTryingVersionToTwo = computed(
  () =>
    originStoreInfo.value.T_order_store_apiType === '1.0' &&
    displayInfo.apiType === '2.0',
);

const disabledStyleSelect = computed(
  () => isTryingVersionToTwo.value && !isAgreeOptionMigration.value,
);

const disabledSaveButton = computed(
  () =>
    disabledStyleSelect.value ||
    displayInfo.apiType === '' ||
    displayInfo.theme === '' ||
    displayInfo.optionLayout === '',
);

// 버전 전환 시 기본 세팅값 미리보기
const getVersionPreview = async () => {
  try {
    const res = (await requestConvertVersionPreview(
      displayInfo.apiType,
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
      displayInfo.apiType = res.data.data?.apiVersion;
      displayInfo.tabletUrl = res.data.data?.tabletUrl;
      displayInfo.theme = `${res.data.data?.storeTheme}`;
      displayInfo.optionLayout = res.data.data?.optionLayout;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 테마 설정 */
const storeThemeList: Ref<requestStoreThemeListType[]> = ref([]);
const getStoreThemeList = async () => {
  const requestData = {
    api: displayInfo.apiType,
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

/** 옵션 레이아웃 설정 */
const basicLayoutList = ref([['', '']]);
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
    }
  } catch (error) {
    console.log(error);
  }
};

// 옵션 레이아웃은 테마별로 달라짐. api로부터 모든 옵션 레이아웃을 받은 후 선택한 테마에 따라 필터링
const filteredOptionLayout = ref([['', '']]);
const filterOptionLayout = () => {
  if (displayInfo.theme.includes(CUSTOM_THEME_CODE)) {
    filteredOptionLayout.value = basicLayoutList.value?.filter((item) =>
      item[0].includes('custom'),
    );
    return;
  }

  filteredOptionLayout.value = basicLayoutList.value?.filter(
    (item) => !item[0].includes('custom'),
  );
};

/** 커스텀 테마 템플릿 리스트 */
const allTemplateList: Ref<storeInfoDataCustomStyleType[]> = ref([]);
const filteredTemplateList: Ref<storeInfoDataCustomStyleType[]> = ref([]);

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
const selectedTemplate = ref<storeInfoDataCustomStyleType>(unfilledCustomStyle);

const isColorTemplate = (templateCode: string) =>
  templateCode?.startsWith('color-');
const isDisabledDarkMode = computed(
  () =>
    !isColorTemplate(selectedTemplate.value.code as string) &&
    selectedTemplate.value.code !== USER_MIXED_PALETTE_CODE,
);

/** 커스텀 스타일 반영 */
const applyTemplateData = (targetTemplate: storeInfoDataCustomStyleType) => {
  selectedTemplate.value = cloneDeep(targetTemplate);
  selectedTemplate.value.useYn = 'Y';

  // 색상 사용자 지정의 경우: select의 리스트에는 출력되지 않지만, 사용자 지정' 문구는 표기
  if (targetTemplate) {
    displayInfo.templateCode =
      targetTemplate.code === USER_MIXED_PALETTE_CODE
        ? USER_MIXED_PALETTE_NAME
        : (targetTemplate.code as string);
  }
};

const changeCustomStyleMode = (isModeChange?: boolean) => {
  /** 모드에 맞는 템플릿 리스트 구성 */
  // eslint-disable-next-line vue/max-len
  filteredTemplateList.value = allTemplateList.value?.filter(
    (templateItem: storeInfoDataCustomStyleType) =>
      isColorTemplate(templateItem.code as string) &&
      templateItem.mode === selectedTemplate.value.mode,
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
    selectedTemplate.value.background.backgroundColor =
      selectedTemplate.value.mode === 'light' ? '#FFFFFF' : '#181818';
    selectedTemplate.value.category.subCategory.fontColor =
      selectedTemplate.value.mode === 'light' ? '#313131' : '#FFFFFF';
  }
  // 컬러 템플릿: 선택된 템플릿의 다른 모드 선택
  if (isColorTemplate(selectedTemplate.value.code as string)) {
    const sameTemplateByMode = filteredTemplateList.value?.find(
      (templateInMode: storeInfoDataCustomStyleType) =>
        templateInMode.name === selectedTemplate.value.name,
    );
    if (sameTemplateByMode) {
      applyTemplateData(sameTemplateByMode);
    }
  }
};

const setDefaultCustomStyle = () => {
  let defaultTemplate: storeInfoDataCustomStyleType | undefined;

  // 적용된 템플릿 or 개별 색상 조합이 있는 경우
  const hasStyle =
    originStoreInfo.value.T_order_store_tablet_custom_style &&
    originStoreInfo.value.T_order_store_tablet_custom_style.useYn === 'Y';
  // eslint-disable-next-line vue/max-len
  const isValidCustomStyle =
    !!originStoreInfo.value.T_order_store_tablet_custom_style?.background
      .backgroundColor &&
    !!originStoreInfo.value.T_order_store_tablet_custom_style?.button
      .backgroundColor;
  if (hasStyle && isValidCustomStyle) {
    defaultTemplate = cloneDeep(
      originStoreInfo.value.T_order_store_tablet_custom_style,
    );

    const isCustomized =
      allTemplateList.value.findIndex(
        (template: storeInfoDataCustomStyleType) =>
          template.code === defaultTemplate?.code,
      ) < 0;
    if (isCustomized && defaultTemplate) {
      defaultTemplate.code = USER_MIXED_PALETTE_CODE;
      defaultTemplate.name = USER_MIXED_PALETTE_NAME;
      defaultTemplate.mainColor = [];
      if (!defaultTemplate.mode) defaultTemplate.mode = 'light';
    }
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

const changeTemplateSelect = () => {
  const foundTemplate = filteredTemplateList.value?.find(
    (templateUnit: storeInfoDataCustomStyleType) =>
      templateUnit.code === displayInfo.templateCode,
  );
  if (foundTemplate) applyTemplateData(foundTemplate);
};

/** 커스텀테마 템플릿 모두 불러오기 */
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

      if (originStoreInfo.value.T_order_store_Theme === CUSTOM_THEME_CODE) {
        setDefaultCustomStyle();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 테마 선택 변경 시 옵션 레이아웃 리스트 및 선택 초기화, (커스텀테마) 템플릿 및 스타일 초기화  */
const changeSelectTheme = () => {
  filterOptionLayout();
  displayInfo.optionLayout = '';
  displayInfo.templateCode = '';

  if (displayInfo.theme === CUSTOM_THEME_CODE) {
    setDefaultCustomStyle();
  }
};

/** 매장 관련 정보 */
const getStoreInfo = async () => {
  try {
    const res = (await requestStoreInfo(
      route.query?.code as string,
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
      originStoreInfo.value = res.data.data.store;
      displayInfo.apiType = originStoreInfo.value.T_order_store_apiType;
      displayInfo.tabletUrl =
        originStoreInfo.value.T_order_store_tablet_version;
      displayInfo.theme = originStoreInfo.value.T_order_store_Theme;
      displayInfo.optionLayout = originStoreInfo.value.optionLayout;
    }
  } catch (error) {
    console.log(error);
  }
};

const isUpdateProgressing = ref(false);
/** 매장 수정 */
const postUpdateStoreTabletVersion = async () => {
  if (isUpdateProgressing.value) {
    return;
  }

  isUpdateProgressing.value = true;
  selectedTemplate.value.useYn =
    displayInfo.theme === CUSTOM_THEME_CODE ? 'Y' : 'N';
  const requestData: requestUpdateStoreTabletVersionType = {
    storeCode,
    T_order_store_apiType: displayInfo.apiType,
    T_order_store_tablet_version: displayInfo.tabletUrl,
    T_order_store_Theme: displayInfo.theme,
    optionLayout: displayInfo.optionLayout,
    option_migration_yn:
      isTryingVersionToTwo.value && isAgreeOptionMigration.value ? 'Y' : 'N',
    T_order_store_tablet_custom_style:
      displayInfo.theme === CUSTOM_THEME_CODE
        ? selectedTemplate.value
        : unfilledCustomStyle,
  };

  const onSuccess = () => {
    ElMessage({
      type: 'success',
      message: '정상적으로 수정되었습니다.',
    });
    props.initTabletDisplayData?.();
    closeModal(SET_TABLET_VERSION);
  };

  try {
    await requestStoreTabletVersionUpdate(requestData);
    onSuccess();
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isUpdateProgressing.value = false;
  }
};

/** api 버전 선택 */
const changeStoreApiType = async () => {
  if (displayInfo.apiType === originStoreInfo.value.T_order_store_apiType) {
    displayInfo.tabletUrl = originStoreInfo.value.T_order_store_tablet_version;
    displayInfo.theme = originStoreInfo.value.T_order_store_Theme;
    displayInfo.optionLayout = originStoreInfo.value.optionLayout;
  } else {
    await getVersionPreview();
  }

  filterOptionLayout();
  await getStoreThemeList();

  if (displayInfo.theme === CUSTOM_THEME_CODE) {
    setDefaultCustomStyle();
  }
};

/** 저장 버튼 */
const updateTabletVersionAndTheme = async () => {
  if (
    originStoreInfo.value.T_order_store_apiType === '2.0' &&
    displayInfo.apiType === '1.0'
  ) {
    ElMessageBox.confirm(
      h('p', { style: 'font-family: none; text-align: center;' }, [
        h(
          'p',
          {
            style: 'font-weight: 800;',
            class: 'essential-star',
          },
          [
            h('p', null, 'api 2.0에서 api 1.0으로 전환 시'),
            h('p', null, '서비스 운영에 문제가 발생할 수 있으므로,'),
            h('p', null, '[개발팀에 문의 후 진행하시는 것을 권장드립니다.\n'),
            h(
              'p',
              { style: 'line-height: 50px !important;' },
              '그래도 진행하시겠습니까?',
            ),
          ],
        ),
        h('p', { style: 'color: #000; font-weight: normal;' }, [
          h('p', null, '[확인] 버튼 클릭 시'),
          h('p', null, '버전 설정이 완료됩니다.'),
        ]),
      ]),
      '경고',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning',
      },
    ).then(async () => {
      await postUpdateStoreTabletVersion();
    });

    return;
  }

  ElMessageBox.confirm(
    h('p', { style: 'text-align: center;' }, [
      h('p', null, '버전 설정을 진행하시겠습니까?'),
      h('p', null, '[확인] 버튼 클릭 시'),
      h('p', null, '버전 설정이 완료됩니다.'),
    ]),
    '경고',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(async () => {
    await postUpdateStoreTabletVersion();
  });
};

const getListValue = (data: string[]) => data[0];
const getListLabel = (data: string[]) => data[1];

// v-for key 방어 코드
const getThemeKey = (code: string | number, index: number) =>
  code ? `theme-${code}-${index}` : `theme-${index}`;
const getTemplateKey = (code: string, index: number) =>
  code ? `template-${code}-${index}` : `template-${index}`;
const getOptionLayoutKey = (index: number) => `optionLayout-${index}`;

onMounted(async () => {
  await getStoreInfo();
  await getStoreThemeList();
  await getCustomTemplateList();
  await getDefaultLayout();
  filterOptionLayout();
});
</script>

<template>
  <el-dialog
    v-model="flag.setTabletVersion"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    align-center
  >
    <template #header> 태블릿 버전 설정</template>
    <el-scrollbar
      always
      class="set-tablet-wrapper"
      max-height="75vh"
    >
      <div class="set-tablet-contents-container">
        <div class="contents-title">
          <div>API 버전</div>
          <span> - 1.0(Original) / 2.0(Remake, 커스텀테마)</span>
        </div>
        <div>
          <el-radio-group
            v-model="displayInfo.apiType"
            @change="changeStoreApiType"
          >
            <el-radio
              border
              label="1.0"
            >
              1.0
            </el-radio>
            <el-radio
              border
              label="2.0"
            >
              2.0
            </el-radio>
          </el-radio-group>
        </div>
        <!-- 티오더1 -> 티오더2 전환 시도 + 옵션 마이그레이션 최초 시도 -->
        <el-row
          v-if="
            isTryingVersionToTwo && originStoreInfo.option_migration_yn === 'N'
          "
          class="mt-10 contents-migration-box"
          @click="clickOptionMigrationBox"
        >
          <el-checkbox
            v-model="isAgreeOptionMigration"
            class="migration-checkbox"
          />
          <el-row class="flex-1 ml-10 migration-description">
            <p>옵션 마이그레이션하기</p>
            <div class="font-mild mt-10">
              <p>
                '옵션 마이그레이션하기' 체크 시 기본 설정대로 아래 항목들이
                설정되며 수정이 가능합니다.
              </p>
              <p class="mt-5">
                또한, '저장' 버튼 클릭 시 옵션 마이그레이션이 정상적으로
                완료되어 티오더 2로 전환됩니다.
              </p>
            </div>
          </el-row>
        </el-row>
        <!-- 티오더1 -> 티오더2 전환 시도 + 옵션 마이그레이션 이력이 있는 경우: 옵션 중복 생성 가능하여 경고문구 출력-->
        <el-row
          v-if="
            isTryingVersionToTwo && originStoreInfo.option_migration_yn === 'Y'
          "
          class="mt-10 contents-migration-box migration-warning-box"
          @click="clickOptionMigrationBox"
        >
          <el-checkbox
            v-model="isAgreeOptionMigration"
            class="migration-checkbox"
          />
          <el-row class="flex-1 ml-10 migration-description">
            <p>옵션 마이그레이션하기</p>
            <div class="migration-description-warning font-mild">
              <p class="mt-5">
                <el-icon size="large">
                  <WarnTriangleFilled />
                </el-icon>
                <span class="warning-important">
                  이미 마이그레이션 이력이 있는 매장입니다.
                </span>
              </p>
              <p class="mt-10">
                옵션이 중복되어 저장될 수 있기 때문에
                <span class="warning-important"> 개발팀에 문의 </span>
                해주세요.
              </p>
            </div>
          </el-row>
        </el-row>
      </div>
      <div class="set-tablet-contents-container">
        <div class="contents-title">
          <div>URL 버전 정보</div>
          <span>
            - 버전 변경은 오더 태블릿 버전 설정 메뉴에서 진행해주세요.
          </span>
        </div>
        <span
          v-if="displayInfo.apiType === originStoreInfo.T_order_store_apiType"
          class="contents-url-text font-mild"
        >
          {{ displayInfo.tabletUrl }}
        </span>
        <el-row v-else>
          <div class="flex-1">
            <el-tag
              class="mr-5"
              effect="dark"
              type="info"
            >
              현재 URL
            </el-tag>
            <span class="font-mild">
              {{ originStoreInfo.T_order_store_tablet_version }}
            </span>
          </div>
          <div class="flex-1">
            <el-tag
              class="mr-5"
              effect="dark"
              type="danger"
            >
              변경될 URL
            </el-tag>
            <span class="font-mild">
              {{ displayInfo.tabletUrl }}
            </span>
          </div>
        </el-row>
      </div>
      <div class="set-tablet-contents-container">
        <div class="contents-title">
          <div>태블릿 테마 설정</div>
          <span> - 태블릿의 기본 테마를 지정합니다.</span>
        </div>
        <el-row>
          <el-row
            class="width-100"
            justify="space-between"
          >
            <!-- 티오더1 버전 매장이 티오더2 API 전환 시도 시 옵션 마이그레이션 필수 체크 -->
            <el-tooltip
              :disabled="!disabledStyleSelect"
              content="'옵션 마이그레이션하기' 체크 시 활성화 됩니다."
            >
              <el-select
                v-model="displayInfo.theme"
                :disabled="disabledStyleSelect"
                class="style-select-box-big"
                placeholder="테마를 선택해주세요."
                @change="changeSelectTheme"
              >
                <el-option
                  v-for="(theme, index) in storeThemeList"
                  :key="getThemeKey(theme.no, index)"
                  :label="theme.theme_name"
                  :value="theme.no"
                />
              </el-select>
            </el-tooltip>
            <!-- 티오더2 커스텀테마일 때 selectBox 노출, '옵션마이그레이션' 확인 안하면 disabled -->
            <el-tooltip
              v-if="
                displayInfo.apiType === '2.0' &&
                displayInfo.theme?.includes(CUSTOM_THEME_CODE)
              "
              :disabled="!disabledStyleSelect"
              content="'옵션 마이그레이션하기' 체크 시 활성화 됩니다."
            >
              <el-select
                v-model="selectedTemplate.mode"
                :disabled="disabledStyleSelect"
                class="flex-1 ml-10"
                placeholder="색상 모드"
                @change="changeCustomStyleMode(true)"
              >
                <el-option
                  label="라이트 모드"
                  value="light"
                />
                <el-option
                  :disabled="isDisabledDarkMode"
                  label="다크 모드"
                  value="dark"
                />
              </el-select>
            </el-tooltip>
            <el-tooltip
              v-if="
                displayInfo.apiType === '2.0' &&
                displayInfo.theme?.includes(CUSTOM_THEME_CODE)
              "
              :disabled="!disabledStyleSelect"
              content="'옵션 마이그레이션하기' 체크 시 활성화 됩니다."
            >
              <el-select
                v-model="displayInfo.templateCode"
                :disabled="disabledStyleSelect"
                class="style-select-box-big ml-10"
                placeholder="새롭게 적용할 템플릿을 선택해주세요."
                @change="changeTemplateSelect"
              >
                <el-option
                  v-for="(template, index) in filteredTemplateList"
                  :key="getTemplateKey(template.code as string, index)"
                  :disabled="
                    selectedTemplate.mode === 'dark' &&
                    !isColorTemplate(template.code as string)
                  "
                  :label="template.name"
                  :value="template.code"
                />
              </el-select>
            </el-tooltip>
          </el-row>
          <el-row
            v-if="
              displayInfo.apiType === '2.0' &&
              displayInfo.theme?.includes(CUSTOM_THEME_CODE)
            "
            class="mt-10 width-100"
          >
            <ExampleBackground
              v-if="selectedTemplate"
              :customStyle="selectedTemplate"
            />
          </el-row>
        </el-row>
      </div>
      <div class="set-tablet-contents-container">
        <div class="contents-title">
          <div>옵션 레이아웃</div>
          <span> - 옵션 선택 시 화면 레이아웃을 설정합니다.</span>
        </div>
        <el-tooltip
          :disabled="!disabledStyleSelect"
          content="'옵션 마이그레이션하기' 체크 시 활성화 됩니다."
          placement="top"
        >
          <el-select
            v-model="displayInfo.optionLayout"
            :disabled="disabledStyleSelect"
            class="width-100"
            placeholder="레이아웃을 선택해 주세요."
          >
            <el-option
              v-for="(optionLayout, index) in filteredOptionLayout"
              :key="getOptionLayoutKey(index)"
              :label="getListLabel(optionLayout)"
              :value="getListValue(optionLayout)"
            />
          </el-select>
        </el-tooltip>
      </div>
    </el-scrollbar>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(SET_TABLET_VERSION)"
      >
        취소
      </el-button>
      <el-button
        :disabled="disabledSaveButton"
        :loading="isUpdateProgressing"
        :type="disabledSaveButton ? 'info' : 'primary'"
        @click="updateTabletVersionAndTheme"
      >
        저장
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.set-tablet-wrapper {
  width: 100%;
  min-height: 41vh;

  .set-tablet-contents-container {
    margin-bottom: 12px;

    .contents-title {
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

    .contents-migration-box {
      border: 1px solid #626aef;
      padding: 10px;
      background-color: #eff0fd;
      cursor: pointer;

      &.migration-warning-box {
        border: 1px solid #d9001b;
        background-color: #fdefef;

        .migration-description-warning {
          color: #d9001b;

          .warning-important {
            font-size: 18px;
            font-weight: 800;
          }
        }
      }

      .migration-checkbox {
        height: 15px;
      }

      .migration-description {
        flex-direction: column;
        gap: 5px;
      }
    }

    .contents-url-text {
      padding-left: 10px;
    }

    .style-select-box-big {
      flex: 2;
    }
  }

  .font-mild {
    font-family: none;
  }
}
</style>
