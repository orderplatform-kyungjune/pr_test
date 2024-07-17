<script setup lang="ts">
import { ref, Ref, onMounted, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import useModalStore from '@store/storeModal';
import { responseExtraServiceStoreListType } from '@interface/extraService';
import { EXTRA_SERVICE_BULK_CHANGE } from '@common/string';
import { extraService } from '@apis';

const props = defineProps<{
  storeList: responseExtraServiceStoreListType[];
  getStoreList: () => void;
}>();

const { flag, closeModal } = useModalStore();
const { requestBulkUpdateExtraService } = extraService;

// props 데이터 (데이터 가공을 위해 사용)
const propsData: Ref<responseExtraServiceStoreListType[]> = ref([]);

const changeStateData = reactive({
  entertainmentCode: 'CHATTING',
  isUsed: false,
  isIconDisplay: false,
  storeCodeList: [] as string[],
});

const confirmButtonState = ref(false);

/** 매장 일괄 수정하기 */
const patchBulkUpdateExtraService = async () => {
  try {
    const storeCodeList: string[] = propsData.value.map(
      (store) => store.storeCode,
    );
    changeStateData.storeCodeList = storeCodeList;

    const res = (await requestBulkUpdateExtraService(
      changeStateData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      props.getStoreList();
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
      closeModal(EXTRA_SERVICE_BULK_CHANGE);
    } else {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 해당 적용 매장 제거 */
const deleteTargetStore = (index: number) => {
  propsData.value.splice(index, 1);
};

const isDisplayType = () => {
  const displayType = ['CHATTING', 'TABLE_GAME', 'ZEP'];

  return displayType.includes(changeStateData.entertainmentCode);
};

const getTruthyUse = (val: boolean) => (val ? '사용' : '미사용');
const getTruthyDisplay = (val: boolean) => (val ? '노출' : '미노출');

onMounted(() => {
  propsData.value = JSON.parse(JSON.stringify(props.storeList));
  if (propsData.value.length === 0) {
    confirmButtonState.value = true;
  } else {
    confirmButtonState.value = false;
  }
});
</script>

<template>
  <el-dialog
    v-model="flag.extraServiceBulkChange"
    width="60%"
    title="일괄 변경"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <p class="bulk-change-title mb-10">적용 매장</p>
    <el-table
      class="mb-20"
      border
      :data="propsData"
      :height="300"
    >
      <el-table-column
        align="center"
        header-align="center"
        prop="storeCode"
        label="매장명"
        width="300"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="채팅"
      >
        <template #default="{ row }">
          {{ getTruthyUse(row.chatting.isUsed) }} /
          {{ getTruthyDisplay(row.chatting.isIconDisplay) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="경매"
      >
        <template #default="{ row }">
          {{ getTruthyUse(row.auction.isUsed) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="잭팟"
      >
        <template #default="{ row }">
          {{ getTruthyUse(row.jackpot.isUsed) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="테이블게임"
      >
        <template #default="{ row }">
          {{ getTruthyUse(row.tableGame.isUsed) }} /
          {{ getTruthyDisplay(row.tableGame.isIconDisplay) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="ZEP"
      >
        <template #default="{ row }">
          {{ getTruthyUse(row.zep.isUsed) }} /
          {{ getTruthyDisplay(row.zep.isIconDisplay) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="삭제"
      >
        <template #default="scope">
          <el-button
            type="danger"
            @click="deleteTargetStore(scope.$index)"
          >
            삭제
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <p class="bulk-change-title mb-10">변경사항</p>
    <el-descriptions
      :column="1"
      border
    >
      <el-descriptions-item>
        <template #label>
          <p>적용 항목 <span class="essential-star">*</span></p>
        </template>
        <el-select
          v-model="changeStateData.entertainmentCode"
          placeholder="선택해주세요"
          clearable
        >
          <el-option
            label="채팅"
            value="CHATTING"
          />
          <el-option
            label="경매"
            value="AUCTION"
          />
          <el-option
            label="잭팟"
            value="JACKPOT"
          />
          <el-option
            label="테이블게임"
            value="TABLE_GAME"
          />
          <el-option
            label="ZEP"
            value="ZEP"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item v-if="!isDisplayType()">
        <template #label>
          <p>사용 여부 <span class="essential-star">*</span></p>
        </template>
        <el-radio-group v-model="changeStateData.isUsed">
          <el-radio :label="true"> 사용 </el-radio>
          <el-radio :label="false"> 미사용 </el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item v-if="isDisplayType()">
        <template #label>
          <p>사용 여부 <span class="essential-star">*</span></p>
        </template>
        <el-radio-group v-model="changeStateData.isUsed">
          <el-radio :label="true"> 사용 </el-radio>
          <el-radio :label="false"> 미사용 </el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item v-if="isDisplayType()">
        <template #label>
          <p>노출 여부 <span class="essential-star">*</span></p>
        </template>
        <el-radio-group v-model="changeStateData.isIconDisplay">
          <el-radio :label="true"> 노출 </el-radio>
          <el-radio :label="false"> 미노출 </el-radio>
        </el-radio-group>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-row
        justify="center"
        align="middle"
      >
        <el-button
          type="danger"
          @click="closeModal(EXTRA_SERVICE_BULK_CHANGE)"
        >
          취소
        </el-button>
        <el-button
          type="primary"
          :disabled="confirmButtonState"
          @click="patchBulkUpdateExtraService"
        >
          완료
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.bulk-change-title {
  width: 90px;
  font-size: 18px;
  text-align: center;
  border-left: 4px solid #000;
}
</style>
