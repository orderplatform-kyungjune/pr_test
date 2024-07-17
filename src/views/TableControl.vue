<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref, Ref, h } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication, etcUtils } from '@utils';
import useModalStore from '@store/storeModal';
import {
  apkType,
  tableListAndVersionListType,
  tableType,
} from '@interface/table';
import { Setting } from '@element-plus/icons-vue';
import { PaymentSettingModal } from '@containers';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { PAYMENT_SETTING } from '@common/string';
import { storeCodec, tableCodec } from '@codecs';
import { requestPostAppForceUpdate } from '@apis/tablet';
import { store, tablet } from '@apis';

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, checkAuthFunction } = authentication;
const { replaceEmptyString } = etcUtils;

const {
  requestTabletList,
  requestApkList,
  requestTabletCreate,
  requestTabletCreateAll,
  requestTabletDelete,
  requestApkUpdate,
} = tablet;

const { tableListCodec, apkCodec } = tableCodec;

const { requestTabletBrandListData } = store;

const { tabletListCodec } = storeCodec;

const { flag, openModalWithData } = useModalStore();

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
const cardLoading = ref(false);

const infoData = reactive({
  table: [] as tableType[],
} as tableListAndVersionListType);

/** 등록된 테이블 선택 */
const selectedRegTableList: Ref<tableType[]> = ref([]);
const isCheckedAllRegTables: Ref<boolean> = ref(false);
const isindeterminateReg = computed(
  () =>
    selectedRegTableList.value?.length > 0 &&
    infoData.table_count?.reg_tablet_cnt > selectedRegTableList.value?.length,
);

const changeSelectedAllByTableState = (
  state: string,
  selectedValue: boolean,
) => {
  // eslint-disable-next-line no-param-reassign
  infoData.table.forEach((table: tableType) => {
    if (table.state === state) table.isSelected = selectedValue;
  });
};

const checkRegTableAll = (isSelected: boolean) => {
  if (isSelected) {
    selectedRegTableList.value = infoData.table.filter(
      (table) => table.state === 'reg',
    );
  } else {
    selectedRegTableList.value = [];
  }
  changeSelectedAllByTableState('reg', isSelected);
};

/** 미등록된 테이블 선택 */
const selectedUnRegTableList: Ref<tableType[]> = ref([]);
const isCheckedAllUnRegTables: Ref<boolean> = ref(false);
const isindeterminateUnReg = computed(
  () =>
    selectedUnRegTableList.value?.length > 0 &&
    infoData.table_count?.unreg_tablet_cnt >
      selectedUnRegTableList.value?.length,
);

const checkUnRegTableAll = (isSelected: boolean) => {
  if (isSelected) {
    selectedUnRegTableList.value = infoData.table.filter(
      (table) => table.state === 'un_reg',
    );
  } else {
    selectedUnRegTableList.value = [];
  }
  changeSelectedAllByTableState('un_reg', isSelected);
};

const changeTableSingleSelect = (table: tableType) => {
  if (table.state === 'reg') {
    const foundIndex = selectedRegTableList.value.findIndex(
      (tableInList) => tableInList.init_id === table.init_id,
    );

    if (foundIndex > -1) {
      selectedRegTableList.value.splice(foundIndex, 1);
    } else {
      selectedRegTableList.value.push(table);
    }

    if (selectedRegTableList.value?.length === 0) {
      isCheckedAllRegTables.value = false;
    }
  }

  if (table.state === 'un_reg') {
    const foundIndex = selectedUnRegTableList.value.findIndex(
      (tableInList) => tableInList.init_id === table.init_id,
    );

    if (foundIndex > -1) {
      selectedUnRegTableList.value.splice(foundIndex, 1);
    } else {
      selectedUnRegTableList.value.push(table);
    }
  }
  if (selectedUnRegTableList.value?.length === 0) {
    isCheckedAllUnRegTables.value = false;
  }
};

/** 테이블 리스트 불러오기 */
const getTabletList = async () => {
  try {
    cardLoading.value = true;
    const res = (await requestTabletList(
      route.query.code as string,
    )) as AxiosResponse;
    const typeError = runtimeCheck(tableListCodec, res.data);

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 400) {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      });
    }

    if (!typeError) {
      if (res.data.code === 200) {
        infoData.table = res.data.table;
        infoData.store = res.data.store;
        infoData.table_count = res.data.table_count;
        // eslint-disable-next-line no-param-reassign
        infoData.table.forEach((table: tableType) => {
          table.isSelected = false;
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    cardLoading.value = false;
    selectedRegTableList.value = [];
  }
};

const clearSelectedUnRegTables = () => {
  selectedUnRegTableList.value = [];
  isCheckedAllUnRegTables.value = false;
};

const clearSelectedRegTables = async () => {
  selectedRegTableList.value = [];
  isCheckedAllRegTables.value = false;
};

/** 테이블 등록(노출) */
const postTabletCreate = async (table: tableType) => {
  try {
    const data = {
      storeCode: route.query.code as string,
      id: table.init_id,
      name: table.init_name,
    };
    const res = (await requestTabletCreate(data)) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '태블릿에 등록되었습니다.',
      });
      clearSelectedUnRegTables();
      await clearSelectedRegTables();
      await getTabletList();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 미등록 테이블 일괄 등록 */
const postTabletCreateAll = async () => {
  try {
    const ids: string[] = selectedUnRegTableList.value?.map(
      (table: tableType) => table.init_id,
    );
    const names: string[] = selectedUnRegTableList.value?.map(
      (table: tableType) => table.init_name,
    );

    const data = {
      storeCode: route.query.code as string,
      id: ids,
      name: names,
    };
    const res = (await requestTabletCreateAll(data)) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '태블릿에 전부 등록되었습니다.',
      });
      clearSelectedUnRegTables();
      await clearSelectedRegTables();
      await getTabletList();
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmTabletCreateAll = () => {
  const infoText = `선택된 미등록 테이블 ${selectedUnRegTableList.value?.length}개를
일괄 등록 진행 하시겠습니까?`;
  ElMessageBox.confirm('', '등록하기', {
    message: h(
      'p',
      { style: 'white-space: break-spaces; text-align: center;' },
      infoText,
    ),
    confirmButtonText: '확인',
    cancelButtonText: '취소',
  }).then(() => {
    postTabletCreateAll();
  });
};

/** 태블릿 삭제(미노출) */
const postTabletDelete = async (table: tableType) => {
  try {
    const data = {
      storeCode: route.query.code as string,
      Ta_Id: table.ta_id,
    };
    const res = (await requestTabletDelete(data)) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '태블릿에 삭제되었습니다.',
      });
      clearSelectedUnRegTables();
      await clearSelectedRegTables();
      await getTabletList();
    }
  } catch (error) {
    console.log(error);
  }
};

/** 테이블 등록/삭제 체크 */
const switchTable = (table: tableType) => {
  if (table.state === 'un_reg') {
    ElMessageBox.confirm('태블릿에 테이블을 등록할까요?', '등록하기', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    })
      .then(() => {
        postTabletCreate(table);
      })
      .catch(() => {
        //
      });
    return;
  }

  if (
    table.state === 'reg' ||
    table.state === 'reg_prepay' ||
    table.state === 'for_delete'
  ) {
    ElMessageBox.confirm('태블릿에 테이블을 삭제할까요?', '삭제하기', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    })
      .then(() => {
        postTabletDelete(table);
      })
      .catch(() => {
        //
      });
  }
};

/** 채팅 초기화 */
// eslint-disable-next-line camelcase
const resetChatting = (chat_reset: string) => {
  ElMessageBox.confirm('채팅 데이터를 초기화 하시겠습니까?', '채팅 초기화', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      // 서버에서 요청 url을 통째로 받아오기 때문에 팝업 처리
      const width = 300;
      const height = 300;

      let left = document.body.offsetWidth / 2 - width / 2;
      let tops = document.body.offsetHeight / 2 - height / 2;
      left += window.screenLeft;
      tops += window.screenTop;
      const popup = window.open(
        chat_reset,
        'okMsg',
        `width=${width}, height=${height}, left=${left}, top=${tops}`,
      );
      popup?.document.write('<div>초기화 성공하였습니다.</div>');
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소하였습니다.',
      });
    });
};

/** apk 업데이트 요청 */
const appVer = ref('');
const paramsAppVer = ref({} as apkType);

const updateApkVer = (apk: apkType) => {
  paramsAppVer.value = apk;
};

const postApkUpdateCall = async () => {
  try {
    const data = {
      storeCode: route.query.code as string,
      apk_file_name: paramsAppVer.value.apk,
      apk_version: paramsAppVer.value.version,
    };
    const res = (await requestApkUpdate(data)) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const isPostSelfUpdateAppLoading = ref(false);
/**
 * 티오더 태블릿 app 원격 자동 업데이트 요청 (apk.1.8.0 버전부터 가능)
 */
const postSelfUpdateApp = async () => {
  try {
    const data = {
      storeCode: route.query.code as string,
      apk_file_name: infoData.apkList[0]?.apk,
      apk_version: infoData.apkList[0]?.version,
    };

    isPostSelfUpdateAppLoading.value = true;
    await requestPostAppForceUpdate(data);
    ElMessage({
      type: 'success',
      message: '앱 자동 업데이트 요청이 완료되었습니다.',
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isPostSelfUpdateAppLoading.value = false;
  }
};

/** apk 리스트 불러오기 */
const getApkList = async () => {
  try {
    const res = (await requestApkList()) as AxiosResponse;
    const typeError = runtimeCheck(apkCodec, res.data);

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
        infoData.apkList = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
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

/** 테이블 상태별 카드 스타일 적용 */
const getCardBodyStyle = (state: string) => {
  // reg_prepay:선결제(파랑) / reg:등록(초록) / un_reg:미등록(노랑)
  if (state === 'reg_prepay') return 'card-background-blue';
  if (state === 'un_reg') return 'card-background-yellow';
  if (state === 'reg' || state === 'reg_prepay') return 'card-background-green';
  if (state === 'for_delete') return 'card-background-red';
  return '';
};

const getCardBodyGuideStyle = (type: string) => ({
  'card-body-guide': true,
  'reg-prepay': type === 'reg_prepay',
  'un-reg': type === 'un_reg',
  for_delete: type === 'for_delete',
});

const getCardBoxStyle = (tableId: string) => ({
  'card-box-wrap-selected-reg': !!selectedRegTableList.value.find(
    (table) => table.init_id === tableId,
  ),
  'card-box-wrap-selected-unreg': !!selectedUnRegTableList.value.find(
    (table) => table.init_id === tableId,
  ),
});

/** 태블릿 화면 미리보기 */
const tabletPreview = (url: string) => {
  window.open(url);
};

/** 태블릿 브랜드 찾기 */
const getTabletBrandName = computed(() => {
  if (infoData.table_count?.tablet_brand.length === 0) return '-';
  const brandName: string[] = [];
  for (let i = 0; i < infoData.table_count?.tablet_brand.length; i += 1) {
    const result = tabletBrandList.value.find(
      (list: string[]) => list[0] === infoData.table_count.tablet_brand[i],
    );
    if (result) {
      brandName.push(result[1]);
    }
  }
  return brandName;
});

const getTableKey = (id: string, index: number) => {
  if (!id) return `table${index}`;
  return `${id}${index}`;
};

const getBrandKey = (name: string, index: number) => {
  if (!name) return `brand${index}`;
  return `${name}${index}`;
};

const isNeedOption = (state: string) => {
  const isUnRegTable = state === 'un_reg';
  const isDeleteTable = state === 'for_delete';

  return !(isUnRegTable || isDeleteTable);
};

const isRegTable = (state: string) => state === 'reg';
const isPrePayTable = (state: string) => state === 'reg_prepay';
const isUnRegTable = (state: string) => state === 'un_reg';
const isDeletedTable = (state: string) => state === 'for_delete';

const getAppVersionKey = (version: string, index: number) =>
  version ? `apk-version-${version}-${index}` : `apk-index-${index}`;

const getLongTextStyle = (textLength: number) =>
  textLength > 8 ? 'long-text' : '';
getApkList();
getTabletBrandListInfo();
getTabletList();
</script>

<template>
  <PaymentSettingModal
    v-if="flag.paymentSetting"
    :clearSelectedRegTables="clearSelectedUnRegTables"
    :getTabletList="getTabletList"
  />
  <div
    v-loading.lock="cardLoading"
    class="table-control-loading"
    element-loading-text="테이블 정보를 불러오는 중입니다.."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
  ></div>

  <div class="app-download-boxes">
    <el-row class="download-box">
      <p class="download-description">
        태블릿 설치 시 선택된 APP을 선택해 주세요.
        <br />
        현재 태블릿 APP 설치 버전 :
        {{ infoData?.store?.T_order_store_apk_name }}
      </p>

      <el-select v-model="appVer">
        <el-option
          v-for="(apk, appIndex) in infoData.apkList"
          :key="getAppVersionKey(apk.version, appIndex)"
          :label="apk.apk"
          :value="apk.apk"
          @click="updateApkVer(apk)"
        />
      </el-select>

      <el-popover
        placement="top-start"
        title="APP UPDATE"
        :width="270"
        trigger="hover"
        content="선택한 APP 버전으로 매장을 업데이트합니다."
      >
        <template #reference>
          <el-button
            color="#000"
            @click="postApkUpdateCall"
          >
            apk.버전 다운로드
          </el-button>
        </template>
      </el-popover>
    </el-row>

    <el-row class="download-box">
      <p class="download-description">
        apk.1.8.0 버전 설치 태블릿 부터 자동업데이트가 가능합니다.
      </p>
      <el-button
        color="#000"
        :loading="isPostSelfUpdateAppLoading"
        @click="postSelfUpdateApp"
      >
        앱 자동 업데이트
      </el-button>
    </el-row>
  </div>

  <el-divider />

  <el-row>
    <el-row
      align="middle"
      class="table-state-wrap mr-10"
    >
      <span>등록 :</span>
      <div :class="getCardBodyGuideStyle('')"></div>
      <span>미등록 :</span>
      <div :class="getCardBodyGuideStyle('un_reg')"></div>
      <span>선결제 :</span>
      <div :class="getCardBodyGuideStyle('reg_prepay')"></div>
      <span>삭제 대상 :</span>
      <div :class="getCardBodyGuideStyle('for_delete')"></div>
    </el-row>
    <el-row
      align="middle"
      class="table-tablet-wrap"
    >
      <el-row align="middle">
        <span class="mr-5">계약 티오더 개수 :</span>
        <el-tag
          effect="plain"
          cycle
          type="info"
        >
          {{ infoData.table_count?.ordertablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">계약 마스터 개수 :</span>
        <el-tag
          effect="plain"
          round
          type="info"
        >
          {{ infoData.table_count?.viewtablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">계약 태블릿 여유 개수 :</span>
        <el-tag
          effect="plain"
          round
          type="info"
        >
          {{ infoData.table_count?.extratablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row
        align="middle"
        class="delete-cnt-column"
      >
        <span class="mr-5">삭제 대상 태블릿 개수 :</span>
        <el-tag
          effect="plain"
          round
          type="info"
        >
          {{ infoData.table_count?.for_delete_tablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">등록 태블릿 개수 :</span>
        <el-tag
          type="success"
          effect="plain"
          round
        >
          {{ infoData.table_count?.reg_tablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">미등록 태블릿 개수 :</span>
        <el-tag
          type="warning"
          effect="plain"
          round
        >
          {{ infoData.table_count?.unreg_tablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">선결제 태블릿 개수 :</span>
        <el-tag
          effect="plain"
          round
        >
          {{ infoData.table_count?.reg_prepay_tablet_cnt }} 개
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">태블릿 설치자 :</span>
        <el-tag
          type="info"
          effect="plain"
          round
        >
          {{ replaceEmptyString(infoData.table_count?.tablet_installer) }}
        </el-tag>
      </el-row>
      <el-row align="middle">
        <span class="mr-5">태블릿 브랜드 :</span>
        <div
          v-for="(brand, index) in getTabletBrandName"
          :key="getBrandKey(brand, index)"
        >
          <el-tag
            type="info"
            class="mr-5"
            effect="plain"
            round
          >
            {{ brand }}
          </el-tag>
        </div>
      </el-row>
    </el-row>
  </el-row>
  <el-row
    justify="end"
    class="mt-20 mb-10 width-100"
  >
    <div>
      <el-checkbox
        v-model="isCheckedAllUnRegTables"
        :indeterminate="isindeterminateUnReg"
        label="미등록 테이블 전체 선택"
        @change="checkUnRegTableAll"
      />
      <el-button
        type="warning"
        class="ml-10"
        :disabled="selectedUnRegTableList?.length === 0"
        @click="confirmTabletCreateAll"
      >
        <el-tag
          type="warning"
          round
          size="small"
          class="mr-5"
        >
          {{ selectedUnRegTableList?.length }}
        </el-tag>
        미등록 테이블 일괄 등록
      </el-button>
    </div>
    <div class="ml-20">
      <el-checkbox
        v-model="isCheckedAllRegTables"
        :indeterminate="isindeterminateReg"
        label="등록 테이블 전체 선택"
        @change="checkRegTableAll"
      />
      <el-button
        type="success"
        class="ml-10"
        :disabled="selectedRegTableList?.length === 0"
        @click="
          openModalWithData(PAYMENT_SETTING, {
            selectedTableList: selectedRegTableList,
          })
        "
      >
        <el-tag
          type="success"
          round
          size="small"
          class="mr-5"
        >
          {{ selectedRegTableList?.length }}
        </el-tag>
        일괄 선결제 등록
      </el-button>
    </div>
  </el-row>
  <div
    v-if="infoData.table?.length < 1"
    class="none-table"
  >
    테이블 리스트 정보가 없습니다.
  </div>

  <div class="card-wrap">
    <div
      v-for="(table, index) in infoData.table"
      :key="getTableKey(table.init_id, index)"
      :class="getCardBoxStyle(table.init_id)"
      class="card-border-wrap"
    >
      <div class="card-box">
        <el-row
          justify="space-between"
          align="middle"
          class="card-box-header"
        >
          <el-row
            justify="space-between"
            align="middle"
          >
            <el-row align="middle">
              <el-checkbox
                v-if="table.state === 'reg' || table.state === 'un_reg'"
                v-model="table.isSelected"
                @change="changeTableSingleSelect(table)"
              />
              <span
                class="table-name mr-5 ml-10"
                :class="getLongTextStyle(table.tablet_info_name?.length)"
              >
                {{
                  isDeletedTable(table.state)
                    ? table.tablet_info_name
                    : table.init_name
                }}
              </span>
              <div v-if="checkAuthFunction('F7001')">
                <el-button
                  v-if="isUnRegTable(table.state)"
                  text
                  type="primary"
                  @click="switchTable(table)"
                >
                  등록
                </el-button>
                <el-button
                  v-else
                  text
                  type="danger"
                  @click="switchTable(table)"
                >
                  삭제
                </el-button>
              </div>
            </el-row>
            <el-dropdown
              v-if="isNeedOption(table.state) && checkAuthFunction('F7002')"
              trigger="click"
            >
              <el-icon
                size="18px"
                class="cursor-pointer"
              >
                <Setting />
              </el-icon>
              <template #dropdown>
                <el-dropdown-item @click="resetChatting(table.chat_reset)">
                  채팅 초기화
                </el-dropdown-item>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click="
                      openModalWithData(PAYMENT_SETTING, {
                        selectedTableList: [table],
                      })
                    "
                  >
                    결제 설정
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click="tabletPreview(table.tablet_screen_view)"
                  >
                    태블릿 화면 미리보기
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-row>
        </el-row>
        <el-scrollbar
          :class="getCardBodyStyle(table.state)"
          always
        >
          <div class="card-box-body">
            <el-row v-if="isUnRegTable(table.state)">
              <el-col class="mb-10">
                <span class="left-text">테이블 이름</span>
                <span class="right-text">{{ table.init_name }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">태블릿 코드</span>
                <span class="right-text">{{ table.init_id }}</span>
              </el-col>
            </el-row>
            <el-row
              v-if="isRegTable(table.state) || isPrePayTable(table.state)"
            >
              <el-col class="mb-10">
                <span class="left-text">태블릿 코드</span>
                <span class="right-text">{{ table.init_id }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">태블릿 출력 이름</span>
                <span class="right-text">{{ table.tablet_info_name }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">태블릿 로그인 번호</span>
                <span class="right-text">{{ table.tablet_info_id }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">POS 테이블 이름</span>
                <span class="right-text">{{ table.init_name }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">VAN 사 정보</span>
                <span class="right-text">{{
                  table.van_type ? table.van_type : '없음'
                }}</span>
              </el-col>
            </el-row>
            <el-row v-if="isDeletedTable(table.state)">
              <el-col class="mb-10">
                <span class="left-text">태블릿 코드</span>
                <span class="right-text">{{ table.tablet_info_id }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">태블릿 출력 이름</span>
                <span class="right-text">{{ table.tablet_info_name }}</span>
              </el-col>
              <el-col class="mb-10">
                <span class="left-text">태블릿 로그인 번호</span>
                <span class="right-text">{{ table.tablet_info_name }}</span>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-download-boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .download-box {
    display: flex;
    align-items: center;
    gap: 5px;
    width: fit-content;
    background: #ecf5ff;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #daecff;
  }

  .download-description {
    font-size: 12px;
    color: #f56c6c;
    white-space: nowrap;
    margin-bottom: 5px;
  }
}

.table-control-loading {
  position: absolute;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.card-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 10px;
  justify-content: flex-start;
  margin-top: 10px;
  width: 100%;

  .long-text {
    font-size: 14px;
  }

  .card-border-wrap {
    border: 2px solid transparent;
    border-radius: 6px;
  }

  .card-box-wrap-selected-reg {
    border-color: #529b2e;
  }

  .card-box-wrap-selected-unreg {
    border-color: #b88230;
  }

  .card-box {
    width: 255px;
    height: 235px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .card-box-header {
      padding: 15px;
      height: 62px;
    }
    .card-background-blue {
      background-color: #a0cfff;
    }
    .card-background-yellow {
      background-color: #f3d19e;
    }
    .card-background-green {
      background-color: #b3e19d;
    }
    .card-background-red {
      background-color: #f89898;
    }
    .card-box-body {
      padding: 15px;
      flex: 1;
    }
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .table-name {
    font-weight: 600;
    max-width: 113px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .left-text {
    margin-right: 10px;
    font-size: 14px;
    color: #7e7e7e;
  }

  .right-text {
    font-weight: 500;
    color: #323232;
  }

  .tag-wrap {
    gap: 5px;
    margin-bottom: 15px;
  }
}

.guide-text {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #a489fb;
}

.table-state-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  padding: 10px;
  margin-top: 10px;
  font-size: 15px;
  border: 1px solid #a489fb;
  border-radius: 5px;
}

.table-tablet-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 10px;
  margin-top: 10px;
  font-size: 15px;
  border: 1px solid #a489fb;
  border-radius: 5px;
  .delete-cnt-column {
    grid-column: 4 / 6;
  }
}

.card-body-guide {
  width: 30px;
  height: 13px;
  margin: 0 5px;
  background-color: #b3e19d;
}

.reg-prepay {
  background-color: #a0cfff;
}

.un-reg {
  background-color: #f3d19e;
}

.for_delete {
  background-color: #f56c6c;
}

.none-table {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50%;
}
</style>
