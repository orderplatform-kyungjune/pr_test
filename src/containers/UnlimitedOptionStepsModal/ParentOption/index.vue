<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import useModalStore from '@store/storeModal';
import { parentOptionType } from '@interface/option';
import OptionGroup from '@containers/UnlimitedOptionStepsModal/OptionGroup/index.vue';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { ADD_NEW_OPTION_GROUP, ADD_OLD_OPTION_GROUP } from '@common/string';
import { queryStorePosInfoType } from '@common/interface';
import { requestUnlimitedDepthOptionGroups } from '@apis/option';

const props = defineProps<{
  parentOptionIndex: number;
  parentOptions: parentOptionType[];
  parentOption: parentOptionType;
  setParentOption: (index: number, option: parentOptionType) => void;
  getFirstDepthOptionGroups: () => void;
}>();

/** 선택한 옵션 없을경우 */
const isParentOptionEmpty = computed(() => props.parentOption.name === '');
/** parentOption > 옵션그룹 1개도 없을경우 */
const isOptionGroupsEmpty = computed(
  () => !isParentOptionEmpty.value && props.parentOption.items.length < 1,
);

const route = useRoute();
const query = route.query as unknown as queryStorePosInfoType;
/** 상품 > 옵션그룹 > 옵션하위 optionGroups 가져오기 api 요청 */
const getUnlimitedDepthOptionGroups = async () => {
  try {
    // type 방어코드
    if (props.parentOption.no === null) {
      return;
    }

    const response = await requestUnlimitedDepthOptionGroups({
      storeCode: query.code as string,
      posGoodCode: query.posGoodCode as string,
      optionItemNo: props.parentOption.no,
    });

    props.setParentOption(props.parentOptionIndex, {
      ...props.parentOption,
      items: response.data,
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
  }
};

const { openModalWithData } = useModalStore();
/** 옵션그룹 생성 모달 열기 */
const showAddNewOptionGroupModal = () => {
  openModalWithData(ADD_NEW_OPTION_GROUP, {
    optionGroupNo: props.parentOption.optionGroupNo,
    depthCode: props.parentOption.depthCode,
    onSubmit:
      props.parentOptionIndex === 0
        ? props.getFirstDepthOptionGroups
        : getUnlimitedDepthOptionGroups,
  });
};

/** 옵션그룹 가져오기 모달 열기 */
const showAddOldOptionGroupModal = () => {
  openModalWithData(ADD_OLD_OPTION_GROUP, {
    optionNo: props.parentOption.no,
    onSubmit:
      props.parentOptionIndex === 0
        ? props.getFirstDepthOptionGroups
        : getUnlimitedDepthOptionGroups,
  });
};
</script>

<template>
  <el-row
    v-if="isParentOptionEmpty"
    class="no-content"
    justify="center"
    align="middle"
  >
    옆에서 메뉴를 클릭하면<br />
    옵션을 확인할 수 있습니다.
  </el-row>

  <el-row
    v-else
    class="parent-option"
  >
    <p class="mb-10">
      {{ props.parentOption.name }}
    </p>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-button
          plain
          type="primary"
          style="width: 100%"
          @click="showAddNewOptionGroupModal"
        >
          옵션 그룹 생성
        </el-button>
      </el-col>
      <el-col :span="12">
        <el-button
          plain
          type="primary"
          style="width: 100%"
          @click="showAddOldOptionGroupModal"
        >
          옵션 그룹 가져오기
        </el-button>
      </el-col>
    </el-row>

    <div class="mt-20">
      <el-row
        v-if="isOptionGroupsEmpty"
        justify="center"
        align="middle"
        class="mt-40"
        style="color: #a6a9ad"
      >
        옵션 그룹을 생성하세요
      </el-row>

      <el-row
        v-for="(optionGroup, index) in props.parentOption.items"
        v-else
        :key="`option-group-${optionGroup.option_group_no}-${index}`"
        class="mb-20"
      >
        <OptionGroup
          :parentOptionIndex="props.parentOptionIndex"
          :parentOptions="props.parentOptions"
          :optionGroup="optionGroup"
          :setParentOption="props.setParentOption"
          :getFirstDepthOptionGroups="props.getFirstDepthOptionGroups"
        />
      </el-row>
    </div>
  </el-row>
</template>

<style lang="scss" scoped>
.no-content {
  width: 100%;
  min-height: 400px;
  height: 100%;
  text-align: center;
  border: 1px dashed #cfd3dc;
  border-radius: 5px;
  color: #a6a9ad;
}

.parent-option {
  width: 100%;
  min-height: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #cfd3dc;
  border-radius: 5px;
  padding: 10px;
}
</style>
