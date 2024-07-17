<script lang="ts" setup>
import useModalStore from '@store/storeModal';
import { OPTION_MENU_ALL_TRANSLATION } from '@common/string';

const { flag, closeModal } = useModalStore();

const props = defineProps<{
  papagoTranslateOptionMenu: (type: string) => Promise<void>;
  resetSelectedData: () => void;
}>();

const translateAllItem = async (type: string) => {
  await props.papagoTranslateOptionMenu(type);
  props.resetSelectedData();
  closeModal(OPTION_MENU_ALL_TRANSLATION);
};
</script>

<template>
  <el-dialog
    v-model="flag.optionMenuAllTranslation"
    width="30%"
  >
    <template #header>
      <el-row align="middle">
        <img
          alt=""
          class="papago-img"
          src="../assets/papago.png"
        />
        <span> 옵션상품 일괄번역 </span>
      </el-row>
    </template>
    <p>* 전체 적용 - 번역 적용된 옵션상품까지 모두 일괄번역됩니다.</p>
    <p>* 미번역 적용 - 번역되지 않은 옵션상품만 일괄번역됩니다.</p>
    <br />
    <p>처리량에 따라 몇 분의 시간이 소요될 수 있습니다.</p>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(OPTION_MENU_ALL_TRANSLATION)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="translateAllItem('remove')"
      >
        전체 적용
      </el-button>
      <el-button
        type="primary"
        @click="translateAllItem('add')"
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
