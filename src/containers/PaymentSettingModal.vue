<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  getTableInfoParamType,
  paymentInfoType,
  tableType,
} from '@interface/table';
import { PAYMENT_SETTING } from '@common/string';
import { tableCodec } from '@codecs';
import { tablet } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const {
  requestLoadVanTypeList,
  requestUpdateSingleTableInfo,
  requestUpdateMultiTableInfo,
  requestLoadSingleTableInfo,
} = tablet;

const { vanTypeListCodec, singleTableInfoCodec } = tableCodec;

const route = useRoute();

const props = defineProps<{
  clearSelectedRegTables: () => void;
  getTabletList: () => void;
}>();

const { flag, modalData, closeModal } = useModalStore();

const { selectedTableList } = modalData.paymentSetting;

const getTableNames = () => {
  if (selectedTableList) {
    const tableNames: string[] = [];
    selectedTableList.map((table: tableType) =>
      tableNames.push(table.tablet_info_name),
    );
    return tableNames.join(', ');
  }
  return '';
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

/** 테이블별 결제 상세 정보 조회 */
const paymentInfo = reactive({
  Tablet_credit_functionArray: {
    card: false,
    cash: false,
    compound: false,
    multiple: false,
  },
} as paymentInfoType);

const getLoadPaymentInfo = async () => {
  try {
    const data = {
      storeCode: route.query.code,
      Ta_Id: selectedTableList[0]?.ta_id,
    };
    const res = (await requestLoadSingleTableInfo(
      data as getTableInfoParamType,
    )) as AxiosResponse;
    const typeError = runtimeCheck(singleTableInfoCodec, res.data);

    if (!typeError) {
      if (res.data.code === 401) {
        failAuthenticationAlert();
      }

      if (res.data.code === 400) {
        ElMessageBox.alert(res.data.msg, '조회 실패', {
          confirmButtonText: '확인',
          callback: () => {
            closeModal(PAYMENT_SETTING);
          },
        });
      }

      if (res.data.code === 200) {
        paymentInfo.Tablet_creditVanType = res.data.data.Tablet_creditVanType;
        paymentInfo.Tablet_credit_functionArray =
          res.data.data.Tablet_credit_functionArray;
        paymentInfo.Tablet_credit_serialnumber =
          res.data.data.Tablet_credit_serialnumber;
        paymentInfo.Tablet_credit_use = res.data.data.Tablet_credit_use;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getTableIds = () => {
  const idList: string[] = [];
  selectedTableList.map((table: tableType) => idList.push(table.ta_id));
  return idList;
};

/** 결제 정보 업데이트(저장) */
const postUpdatePaymentInfo = async () => {
  try {
    let res;
    if (selectedTableList.length === 1) {
      const data = {
        storeCode: route.query.code as string,
        Ta_Id: selectedTableList[0].ta_id,
        ...paymentInfo,
      };
      res = (await requestUpdateSingleTableInfo(data)) as AxiosResponse;
    } else {
      const data = {
        storeCode: route.query.code as string,
        Ta_Id: getTableIds(),
        ...paymentInfo,
      };
      res = (await requestUpdateMultiTableInfo(data)) as AxiosResponse;
    }

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
        message: '저장되었습니다.',
      });
      closeModal(PAYMENT_SETTING);
      if (props.clearSelectedRegTables) props.clearSelectedRegTables();
      if (props.getTabletList) props.getTabletList();
    }
  } catch (error) {
    console.log(error);
  }
};

const selectedTableSetting = () => {
  ElMessageBox.confirm('변경한 설정을 저장하시겠습니까?', '설정 저장', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      postUpdatePaymentInfo();
    })
    .catch(() => {
      //
    });
};

/**
 * 단일건 등록 시 data get 하여 input창에 입력 위해 getLoadPaymentInfo
 * 다중건 등록 시 input 비우기
 */
if (selectedTableList.length === 1) {
  getLoadPaymentInfo();
}
getLoadVanTypeList();
</script>

<template>
  <el-dialog
    v-model="flag.paymentSetting"
    width="520px"
  >
    <template #header>
      <span>테이블 결제 설정</span>
    </template>
    <el-row>
      <el-row class="mb-10">
        <p>선택 테이블 정보</p>
        <el-tag
          class="ml-5"
          round
          size="small"
          type="info"
        >
          {{ selectedTableList.length }}
        </el-tag>
      </el-row>
      <el-descriptions
        :column="2"
        border
        class="mb-10 width-100"
      >
        <el-descriptions-item
          align="center"
          class-name="selected-tables-desc-content"
          label="테이블 명"
          label-align="center"
          label-class-name="selected-tables-desc-label"
        >
          {{ getTableNames() }}
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <div class="bg-p">
      <span>선결제 사용 여부</span>
      <el-row class="mt-10 mb-10">
        <el-radio-group v-model="paymentInfo.Tablet_credit_use">
          <el-radio label="Y"> 사용</el-radio>
          <el-radio label="N"> 미사용</el-radio>
        </el-radio-group>
      </el-row>

      <span>VAN사</span>
      <el-row>
        <el-select
          v-model="paymentInfo.Tablet_creditVanType"
          class="mt-10 mb-10"
        >
          <el-option
            v-for="(vanType, keyName) in vanTypeList"
            :key="vanType"
            :label="vanType"
            :value="keyName"
          />
        </el-select>
      </el-row>

      <div class="mt-10">TID</div>
      <el-input
        v-model="paymentInfo.Tablet_credit_serialnumber"
        class="mt-10 mb-10"
      />

      <div class="mt-10 mb-10">결제 유형</div>
      <el-checkbox v-model="paymentInfo.Tablet_credit_functionArray.card">
        카드 결제
      </el-checkbox>
      <el-checkbox v-model="paymentInfo.Tablet_credit_functionArray.cash">
        현금 결제
      </el-checkbox>
      <el-checkbox v-model="paymentInfo.Tablet_credit_functionArray.compound">
        복합결제(나눠서 결제)
      </el-checkbox>
      <el-checkbox v-model="paymentInfo.Tablet_credit_functionArray.multiple">
        더치페이(상품별 결제)
      </el-checkbox>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(PAYMENT_SETTING)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="selectedTableSetting"
      >
        저장
      </el-button>
    </template>
  </el-dialog>
</template>

<style>
.selected-tables-desc-label {
  vertical-align: middle;
  width: 180px;
}
</style>
