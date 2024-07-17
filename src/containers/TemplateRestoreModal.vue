<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { TEMPLATE_RESTORE } from '@common/string';
import { categoryTemplate } from '@apis';

const { requestTemplateRestoreSave } = categoryTemplate;
const { failAuthenticationAlert } = authentication;

const { flag, closeModal } = useModalStore();

const props = defineProps<{
  restoreList: string[];
  addSelectStore: {
    label?: string;
    value: string;
  };
}>();

/** 복구하기 */
const selectRestoreDate = ref<string>('');
const postRestoreSave = async () => {
  try {
    const saveInfo = {
      getStoreCode: props.addSelectStore.value,
      historyTime: selectRestoreDate.value,
    };

    const res = (await requestTemplateRestoreSave(saveInfo)) as AxiosResponse;
    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      ElMessageBox.alert('복구가 정상적으로 처리되었습니다.', '알림', {
        confirmButtonText: '확인',
        type: 'success',
      });
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <el-dialog
    v-model="flag.templateRestore"
    width="385px"
  >
    <template #header> 알림</template>
    <div class="restore-modal-container">
      <div class="mb-10">매장명: {{ addSelectStore.label }}</div>
      <el-select
        v-model="selectRestoreDate"
        class="mb-10"
      >
        <el-option
          v-for="date in restoreList"
          :key="date"
          :label="date"
          :value="date"
        />
      </el-select>
      <div>이전의 분류 정보로 복구 하시겠습니까?</div>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(TEMPLATE_RESTORE)"
      >
        취소
      </el-button>
      <el-button
        type="primary"
        @click="postRestoreSave"
      >
        복구하기
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.restore-modal-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
