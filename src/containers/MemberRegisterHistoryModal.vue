<script lang="ts" setup>
import { reactive, Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, etcUtils, formattingUtils } from '@utils';
import useModalStore from '@store/storeModal';
import {
  memberRegisterDefaultStoreInfoType,
  memberRegisterHistoryItemType,
} from '@interface/memberRegister';
import { MEMBER_REGISTER_HISTORY } from '@common/string';
import { memberRegister } from '@apis';

const {
  requestRegisterHistory,
} = memberRegister;

const { flag, modalData, closeModal } = useModalStore();

const { replaceEmptyString, maskAllNumber } = etcUtils;
const { formatPhoneNumber, formatTaxId } = formattingUtils;
const { convertServerTimeToKorea } = dateFormatterUtil;

const { registerId } = modalData.memberRegisterHistory;

const inputStoreData = reactive({
  areaName: '',
  userName: '',
  phoneNumber: '',
});

const storeData: Ref<memberRegisterDefaultStoreInfoType> = ref(
  {} as memberRegisterDefaultStoreInfoType,
);
const historyList: Ref<memberRegisterHistoryItemType[]> = ref([]);

/** 수정 이력 불러오기 api 호출 */
const getHistoryList = async () => {
  try {
    const res = (await requestRegisterHistory(registerId ?? '')) as AxiosResponse;

    historyList.value = res.data.data?.history;
    delete res.data.data?.history;
    storeData.value = res.data.data;
    storeData.value.displayTaxId = maskAllNumber(
      formatTaxId(storeData.value.taxId),
    );
    inputStoreData.areaName = storeData.value.storeAreaName;
    inputStoreData.userName = storeData.value.userName;
    inputStoreData.phoneNumber = formatPhoneNumber(storeData.value.userTel);
  } catch (error: any) {
    if (error.status === 400) {
      await ElMessageBox.alert(error.message, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    } else {
      console.warn(error);
    }
  }
};

getHistoryList();
</script>

<template>
  <el-dialog
    v-model="flag.memberRegisterHistory"
    :close-on-click-modal="false"
    align-center
    width="910px"
  >
    <div>
      <p class="mb-20">| 수정 정보</p>
      <el-table
        :data="historyList"
        border
        class="width-100 font-thin"
        max-height="450"
        scrollbar-always-on
      >
        <el-table-column
          align="center"
          header-align="center"
          label="구분"
          width="120"
        >
          <template #default="{ row }">
            <el-text :type="row.approveState === 5 ? 'danger' : ''">
              {{ row.historyType }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column
          header-align="center"
          label="내용"
        >
          <template #default="{ row }">
            <el-text :type="row.approveState === 5 ? 'danger' : ''">
              {{ replaceEmptyString(row.description) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="담당자"
          width="105"
        >
          <template #default="{ row }">
            {{ replaceEmptyString(row.managerName) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="요청 일자"
          prop="registerDateTime"
          sortable
          width="160"
        >
          <template #default="{ row }">
            <span class="small-font">
              {{ convertServerTimeToKorea(row.registerDateTime) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="처리 일자"
          prop="confirmDateTime"
          sortable
          width="160"
        >
          <template #default="{ row }">
            <span class="small-font">
              {{ convertServerTimeToKorea(row.confirmDateTime) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="closeModal(MEMBER_REGISTER_HISTORY)"
      >
        닫기
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.member-register-state {
  &.approved {
    color: var(--el-color-primary-dark-2);
  }
}

.member-register-desc {
  font-size: 13px;
}
</style>
