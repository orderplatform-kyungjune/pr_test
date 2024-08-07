<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { onMounted, reactive, ref } from 'vue';
import useModalStore from '@store/storeModal';
import { parentOptionType } from '@interface/option';
import ParentOption from '@containers/UnlimitedOptionStepsModal/ParentOption/index.vue';
import ModifyOptionGroupModal from '@containers/ModifyOptionGroupModal.vue';
import AddOldOptionGroupModal from '@containers/AddOldOptionGroupModal.vue';
import AddNewOptionGroupModal from '@containers/AddNewOptionGroupModal.vue';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { queryStorePosInfoType } from '@common/interface';
import { requestOneDepthOptionGroups } from '@apis/option';

const route = useRoute();
const query = route.query as unknown as queryStorePosInfoType;
const { flag, modalData } = useModalStore();
const modalPayload: {
  goodsName: string;
  onClose: () => void;
} = modalData.unLimitedOptionSteps;

/** 최상위 옵션그룹(parentOption) 기본 data */
const defaultParentOption: parentOptionType = {
  name: '',
  no: null,
  optionGroupNo: null,
  depthCode: '',
  items: [],
};

/** 최상위 옵션그룹(parentOption) 목록 */
const parentOptions = reactive<parentOptionType[]>([
  defaultParentOption,
  defaultParentOption,
  defaultParentOption,
]);

/**
 * 선택된 옵션이 없을경우 하위 parentOption 삭제
 * @param parentOptionIndex - 선택한 옵션이 있는지 확인할 최상위 옵션(parentOption)의 index
 */
const removeChildParentOptions = (parentOptionIndex: number) => {
  const nextParentOption = parentOptions[parentOptionIndex + 1];

  if (!nextParentOption || !nextParentOption.no) {
    return;
  }

  const optionNumbersOfParentOption = parentOptions[
    parentOptionIndex
  ].items.flatMap((optionGroup) =>
    optionGroup.items.map((option) => option.option_item_no),
  );

  if (optionNumbersOfParentOption.includes(nextParentOption.no)) {
    return;
  }

  parentOptions.forEach((_, currentIndex) => {
    if (currentIndex > parentOptionIndex) {
      parentOptions[currentIndex] = defaultParentOption;
    }
  });
};

/**
 * parentOption 상태 변경(덮어쓰기)
 * @param index - 변경될 parentOption index
 * @param newParentOption - 변경될 새로운 parentOption data
 */
const setParentOption = (index: number, newParentOption: parentOptionType) => {
  parentOptions[index] = newParentOption;
  removeChildParentOptions(index);
};

const isGetFirstDepthOptionGroupsLoading = ref(false);
/** 상품의 첫번째 depth N차 옵션그룹 목록 가져오기 api 요청 */
const getOneDepthOptionGroups = async () => {
  try {
    isGetFirstDepthOptionGroupsLoading.value = true;
    const response = await requestOneDepthOptionGroups({
      storeCode: query.code,
      posGoodCode: query.posGoodCode,
    });

    setParentOption(0, {
      name: modalPayload.goodsName,
      no: null,
      optionGroupNo: null,
      depthCode: '',
      items: response.data,
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isGetFirstDepthOptionGroupsLoading.value = false;
  }
};

onMounted(() => {
  getOneDepthOptionGroups();
});
</script>

<template>
  <el-dialog
    v-model="flag.unLimitedOptionSteps"
    width="80%"
    :close-on-click-modal="false"
    align-center
    @close="modalPayload.onClose"
  >
    <template #header>
      <h1 class="mr-10">옵션 단계 설정</h1>
    </template>
    <div v-loading="isGetFirstDepthOptionGroupsLoading">
      <el-scrollbar height="700px">
        <h2 class="mb-20">{{ parentOptions[0].name }}</h2>

        <el-row :gutter="20">
          <el-col
            v-for="(parentOption, index) in parentOptions"
            :key="`parent-option-${parentOption.no}-${index}`"
            :span="8"
          >
            <ParentOption
              :parentOptionIndex="index"
              :parentOptions="parentOptions"
              :parentOption="parentOption"
              :setParentOption="setParentOption"
              :getFirstDepthOptionGroups="getOneDepthOptionGroups"
            />
          </el-col>
        </el-row>
      </el-scrollbar>
    </div>
  </el-dialog>

  <!-- 옵션그룹 생성 모달 -->
  <AddNewOptionGroupModal v-if="flag.addNewOptionGroup" />

  <!-- 옵션그룹 가져오기 모달 -->
  <AddOldOptionGroupModal v-if="flag.addOldOptionGroup" />

  <!-- 옵션그룹 수정 모달 -->
  <ModifyOptionGroupModal v-if="flag.modifyOptionGroup" />
</template>
