<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  apkType,
  tableListAndVersionListPlatformType,
  tableType,
} from '@interface/table';
import { Setting } from '@element-plus/icons-vue';
import { PaymentSettingModal } from '@containers';
import { PAYMENT_SETTING } from '@common/string';
import { tableCodec } from '@codecs';
import { tablet } from '@apis';

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, checkAuthFunction } = authentication;

const {
  requestTabletList,
  requestApkList,
  requestTabletCreate,
  requestTabletDelete,
  requestApkUpdate,
} = tablet;

const { tableListCodec, apkCodec } = tableCodec;

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
} as tableListAndVersionListPlatformType);

/** 등록된 테이블 선택 */
const selectedRegTableList: Ref<tableType[]> = ref([]);
const isCheckedAllRegTables: Ref<boolean> = ref(false);

/** 미등록된 테이블 선택 */
const selectedUnRegTableList: Ref<tableType[]> = ref([]);
const isCheckedAllUnRegTables: Ref<boolean> = ref(false);

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

const getTableKey = (id: string, index: number) => {
  if (!id) return `table${index}`;
  return `${id}${index}`;
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

  <el-row align="middle">
    <el-tag
      size="large"
      class="mr-10"
    >
      태블릿 설치 시 선택된 APP을 선택해 주세요.
      <br />
      <div class="default-apk-info">
        현재 태블릿 APP 설치 버전 :
        {{ infoData?.store?.platform_store_apk_name }}
      </div>
    </el-tag>
    <el-select
      v-model="appVer"
      class="apk-select mr-10"
    >
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
          APP UPDATE
        </el-button>
      </template>
    </el-popover>
  </el-row>

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
    </el-row>
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
          <el-row align="middle">
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
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
.table-control-loading {
  position: absolute;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
.apk-select {
  width: 300px;
}

.card-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 10px;
  justify-content: flex-start;
  width: 100%;
  margin-top: 10px;

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
    max-width: 120px;
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  grid-template-columns: repeat(3, 1fr);
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

.default-apk-info {
  margin-top: 1px;
}
</style>
