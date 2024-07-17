<script lang="ts" setup>
import useModalStore from '@store/storeModal';
import { OPTION_GROUP_ALL_TRANSLATION } from '@common/string';

const { flag, closeModal } = useModalStore();

defineProps<{
  papagoTranslateOptionGroup: (type: string) => Promise<void>;
}>();
</script>

<template>
  <el-dialog
    v-model="flag.optionGroupAllTranslation"
    width="30%"
  >
    <template #header>
      <el-row align="middle">
        <img
          src="../assets/papago.png"
          class="papago-img mr-10"
          alt=""
        />
        <span> 옵션 그룹 일괄 번역 </span>
      </el-row>
    </template>
    <p>* 전체 적용 - 번역 적용된 그룹까지 모두 일괄번역됩니다.</p>
    <p>* 미번역 적용 - 번역되지 않은 그룹만 일괄번역됩니다.</p>
    <br />
    <p>처리량에 따라 몇 분의 시간이 소요될 수 있습니다.</p>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(OPTION_GROUP_ALL_TRANSLATION)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="papagoTranslateOptionGroup('remove')"
      >
        전체 적용
      </el-button>
      <el-button
        type="primary"
        @click="papagoTranslateOptionGroup('add')"
      >
        미번역 적용
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.papago-img {
  width: 20px;
  height: 20px;
}
</style>
