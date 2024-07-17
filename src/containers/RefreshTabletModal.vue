<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { tabletRefreshParamsType } from '@interface/table';
import { REFRESH_TABLET } from '@common/string';
import { tablet } from '@apis';

const { failAuthenticationAlert } = authentication;

const { requestTabletRefresh } = tablet;

const props = defineProps<{
  storeName: string;
  storeCode: string;
}>();

const { flag, closeModal } = useModalStore();

const isInProgress = ref(false);
const storeData = reactive<tabletRefreshParamsType>({
  storeCode: props.storeCode,
  timer: 3,
});

/** 선택 매장 태블릿 일괄 새로고침 */
const refreshTablet = async () => {
  try {
    const res = await requestTabletRefresh(storeData);
    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      isInProgress.value = false;
    }
    if (res.status === 401) {
      failAuthenticationAlert();
      isInProgress.value = false;
    }
    if (res.status === 200) {
      isInProgress.value = false;
      ElMessageBox.confirm('새로고침 완료', '성공', {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'success',
      });
    }
  } catch (error) {
    isInProgress.value = false;
    console.log(error);
  }
};

const confirmRefresh = () => {
  if (isInProgress.value) {
    ElMessage.error('태블릿 새로고침 진행 중입니다.');
    return;
  }
  ElMessageBox.confirm(
    '선택 매장의 모든 태블릿을 새로고침하시겠습니까?',
    '확인',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  ).then(() => {
    if (storeData.storeCode.length === 0) {
      ElMessage.error('매장 정보가 없습니다.');
      return;
    }
    ElMessageBox.confirm(
      '새로고침 중에는 브라우저를 종료하지 마세요.',
      '중요!',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'error',
      },
    ).then(() => {
      isInProgress.value = true;
      refreshTablet();
    });
  });
};

const checkDialog = (done: () => void) => {
  if (isInProgress.value) {
    ElMessage.error('태블릿 새로고침 진행중입니다.');
  } else {
    done();
  }
};

const closeDialog = () => {
  if (isInProgress.value) {
    ElMessage.error('태블릿 새로고침 진행중입니다.');
  } else {
    closeModal(REFRESH_TABLET);
  }
};
</script>

<template>
  <el-dialog
    v-model="flag.refreshTablet"
    :before-close="checkDialog"
    align-center
    title="매장 태블릿 일괄 새로고침"
    width="40%"
  >
    <el-tag type="info"> 선택한 매장의 모든 태블릿을 새로고침합니다.</el-tag>
    <el-card class="mt-10">
      <el-row>
        <el-tag
          class="ml-5"
          type="warning"
        >
          {{ storeName }} 매장을 선택하셨습니다.
        </el-tag>
      </el-row>
      <el-divider />
      <el-row align="middle">
        <el-tag type="danger"> 태블릿 새로고침 진행 상황</el-tag>
      </el-row>
      <el-row class="refresh-tablet-information">
        <div>
          <el-tag class="tablet-count mt-10"> 새로고침 태블릿 수</el-tag>
          <el-tag class="estimate-time ml-5 mt-10">
            태블릿 초기화 예상 완료 시간
          </el-tag>
        </div>
        <el-scrollbar
          always
          class="mt-10"
          height="300px"
          style="width: 100%"
        >
          <ol class="progress-text-wrapper"></ol>
        </el-scrollbar>
      </el-row>
    </el-card>
    <template #footer>
      <span>
        <el-button @click="closeDialog"> 닫기 </el-button>
        <el-button
          type="danger"
          @click="confirmRefresh"
        >
          새로고침
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.progress-text-wrapper {
  line-height: 1.5;
}
</style>
