<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { EVENT_FORCE_WIN } from '@common/string';
import { promotion } from '@apis';

const { failAuthenticationAlert } = authentication;

const { requestForceUpdateWinner } = promotion;

const { flag, closeModal, modalData } = useModalStore();

const props = defineProps<{
  getParticipantsInfo: (page: number, query: string) => void;
}>();

const phoneNumber = ref('');
const prizeRank = ref('');

const getForceWinner = async () => {
  const query = {
    userPhone: phoneNumber.value,
    orderViewKey: modalData.eventForceWin.orderViewKey,
    prizeRank: prizeRank.value,
  };
  const res = (await requestForceUpdateWinner(query)) as AxiosResponse;
  if (res.status === 400) {
    ElMessage({
      type: 'error',
      message: `${res.data.message}`,
    });
  }
  if (res.data.code === 401) {
    failAuthenticationAlert();
  }
  if (res.status === 200) {
    ElMessage({
      type: 'success',
      message: '강제 당첨 처리 성공했습니다.',
    });
    await props.getParticipantsInfo(1, '&joinStatus=false');
    closeModal(EVENT_FORCE_WIN);
  }
};

const forceWinSave = () => {
  const phoneReg = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

  if (prizeRank.value === '') {
    ElMessage({
      type: 'error',
      message: '당첨 등수를 선택해주세요.',
    });
    return;
  }
  if (!phoneReg.test(phoneNumber.value)) {
    ElMessage({
      type: 'error',
      message: '올바른 핸드폰 번호를 입력해주세요.',
    });
    return;
  }
  getForceWinner();
};
</script>

<template>
  <el-dialog v-model="flag.eventForceWin">
    <template #header> 강제 당첨 처리 </template>
    <p>당첨 등수</p>

    <el-select
      v-model="prizeRank"
      placeholder="당첨 등수를 선택해주세요."
      class="mt-10"
    >
      <el-option :value="3"> 3등 </el-option>
      <el-option :value="4"> 4등 </el-option>
    </el-select>
    <el-row
      class="mt-10 mb-10"
      align="bottom"
    >
      <span> 핸드폰 번호 </span>
      <span class="guide-text ml-5">
        숫자만 입력해도 자동으로 하이픈(-) 생성됩니다.
      </span>
    </el-row>

    <el-input
      v-model="phoneNumber"
      placeholder="핸드폰 번호를 입력해주세요."
      :formatter="
        (value: string) =>
          `${value}`
            .replace(/[^0-9]/g, '')
            .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
            .replace(/\-{1,2}$/g, '')
      "
    />
    <template #footer>
      <el-row justify="end">
        <el-button
          type="danger"
          @click="closeModal(EVENT_FORCE_WIN)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="forceWinSave"
        >
          저장
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style>
.guide-text {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #a489fb;
}
</style>
