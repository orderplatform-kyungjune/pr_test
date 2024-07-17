<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import useModalStore from '@store/storeModal';
import { optionType } from '@interface/category';
import { EDIT_NOTICE_STORE_LIST, EDIT_NOTICE_STORE_LIST_MODAL } from '@common/string';

const { flag, closeModal } = useModalStore();

const props = defineProps<{
  requestAllProduct: () => Promise<void>;
  refineTotalStoreListData: () => void;
  refinedStoreList: optionType[];
  loading: boolean;
  updateCurrentNoticeStoreList: (storeKey: string[]) => void;
  refinedSelectedStoreList: string[];
}>();

const activeName = ref('first');
const loadingState = ref<boolean>(true);
const loadingSvg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
const currentStoreListKey = ref<string[]>([]);

const editStoreList = () => {
  props.updateCurrentNoticeStoreList(currentStoreListKey.value);
  closeModal(EDIT_NOTICE_STORE_LIST);
};

const filterMethod = (query: string, item: optionType) =>
  item.key.toLowerCase().includes(query.toLowerCase()) ||
  item.label.toLowerCase().includes(query.toLowerCase());

props.requestAllProduct().then(() => {
  loadingState.value = false;
});

watchEffect(() => {
  const currentStoreList = props.refinedSelectedStoreList;
  currentStoreListKey.value = currentStoreList;
});
</script>

<template>
  <el-dialog
    v-model="flag.editNoticeStoreList"
    :title="EDIT_NOTICE_STORE_LIST_MODAL"
    lock-scroll
    width="55%"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="매장 추가"
        name="first"
      >
        <el-card
          v-loading="loadingState"
          :element-loading-svg="loadingSvg"
          class="mt-10 transfer-container"
          element-loading-svg-view-box="-10, -10, 50, 50"
          element-loading-text="상품 정보를 불러오는 중입니다..."
        >
          <el-transfer
            v-model="currentStoreListKey"
            :data="refinedStoreList"
            :filter-method="filterMethod"
            :titles="['전체 매장', '선택된 매장']"
            class="transfer-wrapper"
            filter-placeholder="매장명 또는 코드를 입력해주세요."
            filterable
          >
            <template #default="{ option }">
              <span>{{ option.key }} - {{ option.label }}</span>
            </template>
          </el-transfer>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span>
        <el-button @click="closeModal(EDIT_NOTICE_STORE_LIST)">
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="editStoreList"
        >
          매장 수정
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.transfer-container {
  height: 500px;

  .transfer-wrapper {
    --el-transfer-panel-body-height: 420px;
    --el-transfer-panel-width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:deep(.el-input) {
      width: 90%;
    }
  }
}
</style>
