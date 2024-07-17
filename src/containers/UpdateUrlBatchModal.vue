<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, Ref, reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  allStoreListType,
  storeAllListType,
  requestStoreThemeListType,
  selectedThemeType,
  selectedUrlInfoType,
} from '@interface/store';
import { UPDATE_URL_SETTING, WEB_URL_MANAGE } from '@common/string';
import { storeCodec } from '@codecs';
import { store } from '@apis';

const props = defineProps<{
  type?: string;
  based: string;
  selectedStoreList?: storeAllListType[];
  selectedUrl?: selectedUrlInfoType;
  selectedThemeInfoType?: selectedThemeType;
  allUrlList: string[];
  modalTitle: string;
  reloadStoreList: () => void;
  requestApi: () => void;
  postUrlVersionList?: (apiVersion: string) => void;
}>();

const {
  allStoreListCodec,
  storeUpdatedUrlCodec,
  matchedStoreListCodec,
  allThemeListCodec,
} = storeCodec;
const {
  updateThemeList,
  updateFullStoreInfo,
  requestSearchStoreNameResults,
  requestMatchedStoreUrlList,
  requestMatchedThemeList,
  requestStoreThemeList,
} = store;
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { flag, closeModal } = useModalStore();
const route = useRoute();

const themeInfoToChange = reactive({
  apiVersion: props.selectedThemeInfoType?.apiVersion,
  themeCode: '',
  urlToChange: '',
});

const updateUrlAddress: Ref<string> = ref(props.selectedUrl?.url ?? '');
const selectedQueUseStatus: Ref<string> = ref('');

const screenInitMinutes: Ref<number> = ref(0);
const cartInitMinutes: Ref<number> = ref(0);

const hasCheckSettingInitTime: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(true);

const recommendedThemeList: Ref<requestStoreThemeListType[]> = ref([]);
// 최종 선택된 매장 리스트
const finalSelectedStoreList: Ref<string[]> = ref([]);
// 전체 매장 리스트
const allStoreList: Ref<allStoreListType[]> = ref([]);

const loadingSvg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  "style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

const isWebUrlManagePage = () => {
  if (route.name === WEB_URL_MANAGE) return true;
  return false;
};

const isThemeTab = () => {
  if (props.based === 'theme') return true;
  return false;
};

const isMasterUrlPage = () => {
  if (props.type === 'master') return true;
  return false;
};

const getSearchDataStoreItemKey = (code: string, index: number) => {
  if (code) {
    return `search-store-code-${code}-${index}`;
  }

  return `search-store-${index}`;
};

const checkRequestDataType = () => {
  const typeData = route.name === 'webUrlManage' ? 'torder' : 'master';
  const requestData = {
    type: props.type ?? typeData,
    storeArray: finalSelectedStoreList.value as string[],
    update_version: updateUrlAddress.value,
  };

  if (props.type === 'torder' && hasCheckSettingInitTime.value === true) {
    Object.assign(requestData, {
      T_order_store_refresh_time: String(screenInitMinutes.value),
      T_order_store_cart_refresh_time: String(cartInitMinutes.value),
    });
  }

  if (props.type === 'master' && selectedQueUseStatus.value !== '미변경') {
    Object.assign(requestData, { T_order_sqsUse: selectedQueUseStatus.value });
  }

  return requestData;
};

/** 테마 일괄 업데이트 */
const updateThemeToChange = async () => {
  try {
    const requestData = {
      storeArray: finalSelectedStoreList.value,
      api_version: themeInfoToChange.apiVersion ?? '',
      update_theme: themeInfoToChange.themeCode ?? '',
      update_url_version: themeInfoToChange.urlToChange,
    };
    const res = (await updateThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeUpdatedUrlCodec, res.data);

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

    if (typeError) return;

    if (res.data.code === 200) {
      ElMessageBox({
        message: '변경이 완료되었습니다.',
        title: '알림',
        confirmButtonText: '확인',
      }).then(() => {
        closeModal(UPDATE_URL_SETTING);
        props.requestApi();
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** URL 일괄 업데이트 */
const updateUrlToChange = async () => {
  try {
    const requestData = checkRequestDataType();
    const res = (await updateFullStoreInfo(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(storeUpdatedUrlCodec, res.data);

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

    if (typeError) return;

    if (res.data.code === 200) {
      ElMessageBox({
        message: '변경이 완료되었습니다.',
        title: '알림',
        confirmButtonText: '확인',
      }).then(() => {
        closeModal(UPDATE_URL_SETTING);
        props.requestApi();
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleClickChangeInfoButton = () => {
  if (props.based === 'theme') {
    updateThemeToChange();
    return;
  }

  updateUrlToChange();
};

// eslint-disable-next-line vue/max-len
const filterTransferSearchInput = (
  searchInput: string,
  storeInfo: allStoreListType,
) =>
  storeInfo.value.toLowerCase().includes(searchInput.toLowerCase()) ||
  storeInfo.label.toLowerCase().includes(searchInput.toLowerCase());

/** 매장기준일 경우 전체 매장 리스트 요청하기 */
const getAllStoreListBasedStore = async () => {
  try {
    loading.value = true;

    const payload = { searchTxt: '' };
    const res = (await requestSearchStoreNameResults(payload)) as AxiosResponse;
    const typeError = runtimeCheck(allStoreListCodec, res.data);

    loading.value = false;

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

    if (typeError) return;

    if (res.data.code === 200) {
      allStoreList.value = res.data.data;
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

/** 유알엘 기준일 경우 선택한 URL 값과 비교 및 전체 매장 리스트 보여주기 */
const getMatchedStoreUrlList = async () => {
  try {
    loading.value = true;

    const requestData = {
      searchTxt: '',
      url: props.selectedUrl?.url ?? '',
      type: props.type ?? '',
    };

    const res = (await requestMatchedStoreUrlList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(matchedStoreListCodec, res.data);

    loading.value = false;

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

    if (typeError) return;

    if (res.data.code === 200) {
      allStoreList.value = res.data.data;

      if (props.selectedUrl?.url === '' && props.selectedUrl?.count === 0) {
        return;
      }

      const filteredMatchedStoreCodeList = res.data.data
        .filter((storeInfo: allStoreListType) => storeInfo.match_res === 'Y')
        .map((storeInfo: allStoreListType) => storeInfo.value);
      finalSelectedStoreList.value = filteredMatchedStoreCodeList;
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

/** 유저가 선택한 테마와 일치하는 매장 리스트 요청 */
const getMatchedThemeList = async () => {
  try {
    loading.value = true;

    const requestData = {
      searchTxt: '',
      theme: props.selectedThemeInfoType?.themeCode ?? '',
      api: props.selectedThemeInfoType?.apiVersion ?? '',
    };

    const res = (await requestMatchedThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(matchedStoreListCodec, res.data);

    loading.value = false;

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

    if (typeError) return;

    if (res.data.code === 200) {
      allStoreList.value = res.data.data;
      finalSelectedStoreList.value = allStoreList.value
        .filter((storeInfo) => storeInfo.match_res === 'Y')
        .map((storeInfo) => storeInfo.value);
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

/** 테마별 조회 셀렉트에서 권장하는 테마를 조회하기 위한 함수 */
const getStoreThemeList = async () => {
  try {
    loading.value = true;

    const requestData = {
      api: themeInfoToChange.apiVersion ?? '',
      type: 'update',
    };

    const res = (await requestStoreThemeList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(allThemeListCodec, res.data);

    loading.value = false;

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

    if (typeError) return;

    if (res.data.code === 200) {
      recommendedThemeList.value = res.data.data;

      const isRecommendedTheme = recommendedThemeList.value.some(
        (themeInfo) =>
          String(themeInfo.no) === props.selectedThemeInfoType?.themeCode,
      );

      if (isRecommendedTheme) {
        themeInfoToChange.themeCode = props.selectedThemeInfoType
          ?.themeCode as string;
      }
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

const changeApiVersion = () => {
  themeInfoToChange.themeCode = '';
  getStoreThemeList();

  if (props.postUrlVersionList && themeInfoToChange.apiVersion) {
    props.postUrlVersionList(themeInfoToChange.apiVersion);
  }
};

const moveTransferRightOfSelectedStoreList = () => {
  if (props.selectedStoreList?.length) {
    props.selectedStoreList.forEach((data) => {
      finalSelectedStoreList.value.push(data.value);
    });
  }
};

const checkBasedType = () => {
  if (props.based === 'store') {
    getAllStoreListBasedStore();
    moveTransferRightOfSelectedStoreList();
  }

  if (props.based === 'url') {
    getMatchedStoreUrlList();
  }

  if (props.based === 'theme') {
    getMatchedThemeList();
    getStoreThemeList();
  }
};

checkBasedType();
</script>

<template>
  <el-dialog
    v-model="flag.updateUrlSetting"
    title="알림"
    top="10vh"
    width="70%"
  >
    <template #header>
      <p>{{ modalTitle }}</p>
      <el-row
        v-if="isThemeTab()"
        justify="center"
      >
        변경할 테마를 선택 후, 매장 정보를 선택해주세요.
      </el-row>
      <el-row
        v-if="isMasterUrlPage()"
        class="mt-10 mb-10"
        justify="center"
      >
        변경할 마스터 URL 정보 입력 후, 매장 정보를 선택해주세요.
      </el-row>
    </template>
    <p class="mb-10 left-border">변경 URL 정보</p>
    <el-descriptions
      :column="1"
      border
      class="mb-10"
    >
      <el-descriptions-item
        v-if="!isThemeTab()"
        align="middle"
        label="변경 URL 주소"
        label-align="center"
      >
        <el-row class="width-100">
          <el-select
            v-model="updateUrlAddress"
            allow-create
            class="search-input"
            clearable
            default-first-option
            filterable
            placeholder="변경하실 URL을 입력해주세요."
          >
            <el-option
              v-for="(url, urlIndex) in allUrlList"
              :key="getSearchDataStoreItemKey(url, urlIndex)"
              :label="url"
              :value="url"
            />
          </el-select>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="isWebUrlManagePage() && !isThemeTab()"
        align="middle"
        label="카트 초기화"
        label-align="center"
      >
        <el-row>
          <el-tooltip content="미체크시 기존 값으로 설정됩니다.">
            <el-checkbox
              v-model="hasCheckSettingInitTime"
              justify="start"
              label="초기화 시간 설정"
              size="large"
            />
          </el-tooltip>
        </el-row>
        <el-row class="grid-cart-init">
          <el-row class="grid-init-layout">
            <el-row> 화면 초기화 (sec)</el-row>
            <el-input
              v-model.number="screenInitMinutes"
              :disabled="!hasCheckSettingInitTime"
              class="input-width-100"
            />
          </el-row>
          <el-row class="grid-init-layout">
            <el-row> Cart 초기화 (sec)</el-row>
            <el-input
              v-model.number="cartInitMinutes"
              :disabled="!hasCheckSettingInitTime"
              class="input-width-100"
            />
          </el-row>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isWebUrlManagePage() && !isThemeTab()"
        align="middle"
        class="width-100"
        label="Que 사용 여부"
        label-align="center"
      >
        <el-row justify="start">
          <el-radio-group v-model="selectedQueUseStatus">
            <el-radio
              label=""
              size="large"
            >
              미변경
            </el-radio>
            <el-radio
              label="N"
              size="large"
            >
              미사용
            </el-radio>
            <el-radio
              label="Y"
              size="large"
            >
              사용
            </el-radio>
          </el-radio-group>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="isThemeTab()"
        align="center"
        label="API 버전"
        label-align="center"
      >
        <el-row>
          <el-radio-group
            v-model="themeInfoToChange.apiVersion"
            @change="changeApiVersion"
          >
            <el-radio
              label="1.0"
              size="large"
            >
              1.0
            </el-radio>
            <el-radio
              label="2.0"
              size="large"
            >
              2.0
            </el-radio>
          </el-radio-group>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="isThemeTab()"
        align="center"
        label="테마 정보"
        label-align="center"
      >
        <el-row>
          <el-select
            v-model="themeInfoToChange.themeCode"
            class="search-input"
            clearable
            collapse-tags
            collapse-tags-tooltip
            filterable
            placeholder="검색하실 테마를 선택해주세요."
          >
            <el-option
              v-for="(themeType, themeTypeIndex) in recommendedThemeList"
              :key="
                getSearchDataStoreItemKey(themeType.theme_name, themeTypeIndex)
              "
              :label="themeType.theme_name"
              :value="themeType.no"
            />
          </el-select>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="isThemeTab()"
        align="center"
        justify="space-between"
        label="변경 URL 정보"
        label-align="center"
      >
        <el-row justify="space-between">
          <el-select
            v-model="themeInfoToChange.urlToChange"
            allow-create
            class="search-input"
            clearable
            default-first-option
            filterable
            placeholder="변경하실 URL을 입력 및 선택해주세요."
          >
            <el-option
              v-for="(url, urlIndex) in allUrlList"
              :key="getSearchDataStoreItemKey(url, urlIndex)"
              :label="url"
              :value="url"
            />
          </el-select>
        </el-row>
      </el-descriptions-item>
    </el-descriptions>
    <el-card
      v-loading="loading"
      :element-loading-svg="loadingSvg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-text="매장을 불러오는 중입니다..."
    >
      <el-transfer
        v-model="finalSelectedStoreList"
        :data="allStoreList"
        :filter-method="filterTransferSearchInput"
        :props="{
          key: 'value',
          label: 'label',
        }"
        :titles="['전체 매장', '선택 매장']"
        class="transfer-wrapper"
        filter-placeholder="매장명 또는 매장코드를 입력해주세요."
        filterable
      >
        <template #default="{ option }">
          <el-row
            class="grid-layout"
            justify="start"
          >
            <p class="store-code">
              {{ option.value }}
            </p>
            <p class="store-name">
              {{ option.label }}
            </p>
          </el-row>
        </template>
      </el-transfer>
    </el-card>
    <template #footer>
      <span>
        <el-button @click="closeModal(UPDATE_URL_SETTING)"> 닫기 </el-button>
        <el-button
          type="primary"
          @click="handleClickChangeInfoButton"
        >
          정보 변경
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.left-border {
  display: flex;
  align-items: center;
  padding-left: 5px;
  border-left: 3px solid black;
}

.transfer-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  &:deep(.el-transfer-panel__body) {
    height: 40vh;
  }

  &:deep(.el-transfer-panel) {
    min-width: calc(100% - 720px);
  }

  &:deep(.el-transfer-panel__filter) {
    min-width: calc(100% - 30px);
  }

  &:deep(.el-transfer-panel__item) {
    margin-right: 24px;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 0.5fr 0.5fr;
    justify-content: space-between;

    .store-name {
      display: flex;
      justify-content: end;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .store-code {
    font-size: 13px;
    color: #adafbc;
  }
}

.grid-cart-init {
  display: grid;
  grid-template-columns: 1fr 1fr;

  .grid-init-layout {
    display: grid;
    grid-template-columns: 0.25fr 0.75fr;
    align-items: center;
  }

  .input-width-100 {
    width: 200px;
  }
}

.search-input {
  width: 550px;
}
</style>
