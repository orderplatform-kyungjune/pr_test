<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import useModalStore from '@store/storeModal';
import {
  parentOptionType,
  getUnlimitedOptionGroupDataType,
  unlimitedOptionType,
} from '@interface/option';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { MODIFY_OPTION_GROUP } from '@common/string';
import { apiResponseYesNoType } from '@common/interface';
import {
  requestOptionGroupDelete,
  requestOptionSoldOut,
  requestOptionUse,
  requestUnlimitedDepthOptionGroups,
} from '@apis/option';

const props = defineProps<{
  parentOptionIndex: number;
  parentOptions: parentOptionType[];
  optionGroup: getUnlimitedOptionGroupDataType;
  setParentOption: (index: number, option: parentOptionType) => void;
  getFirstDepthOptionGroups: () => void;
}>();

/** 현재 parentOption 의 다음 parentOption */
const nextParentOption = computed(
  () => props.parentOptions[props.parentOptionIndex + 1],
);

/** 선택된 옵션 style 변경 */
const changeOptionStyle = (optionNo: number) => {
  const isOptionSelected =
    !!nextParentOption.value && optionNo === nextParentOption.value.no;

  return isOptionSelected ? 'option-selected' : 'option-unSelected';
};

const route = useRoute();
/** 옵션그룹 목록 data 가져오기 api 요청 (상품의 하위X, 옵션의 하위O) */
const getUnlimitedDepthOptionGroups = async (optionItemNo: number) =>
  requestUnlimitedDepthOptionGroups({
    storeCode: route.query.code as string,
    posGoodCode: route.query.posGoodCode as string,
    optionItemNo,
  }).catch((error) => {
    apiErrorDialogHandler({ error });
  });

/** 옵션그룹 목록 data 가져오기 api 요청 후처리 함수  */
const getOptionGroups = async () => {
  // type 방어 코드
  const parentOption = props.parentOptions[props.parentOptionIndex];
  if (parentOption.optionGroupNo === null || parentOption.no === null) {
    return;
  }

  const response = await getUnlimitedDepthOptionGroups(parentOption.no);
  if (response) {
    props.setParentOption(props.parentOptionIndex, {
      ...parentOption,
      items: response.data,
    });
  }
};

const requestOptionGroupsApiByParentOption = async () => {
  if (props.parentOptionIndex === 0) {
    props.getFirstDepthOptionGroups();
    return;
  }

  await getOptionGroups();
};

const isDeleteOptionGroupLoading = ref(false);
/** 옵션그룹 삭제 api 요청 */
const deleteOptionGroupDelete = async () => {
  try {
    isDeleteOptionGroupLoading.value = true;
    await requestOptionGroupDelete({
      storeCode: route.query.code as string,
      posGoodCode: route.query.posGoodCode as string,
      optionGroupNo: props.optionGroup.option_group_no,
    });

    ElMessage({
      type: 'success',
      message:
        '정상적으로 삭제되었습니다. 저장하기 위해 변경사항 저장 버튼을 눌러주세요.',
    });

    await requestOptionGroupsApiByParentOption();
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isDeleteOptionGroupLoading.value = false;
  }
};

/** 옵션 삭제 버튼 click 후처리 함수 */
const onClickDeleteOptionGroup = () => {
  ElMessageBox.confirm(
    `${props.optionGroup.option_group_name}을(를) 삭제하시겠습니까?`,
    '경고',
    {
      type: 'warning',
    },
  ).then(deleteOptionGroupDelete);
};

/** option 버튼 선택시 후처리 함수 */
const onSelectOption = async (option: unlimitedOptionType) => {
  const response = await getUnlimitedDepthOptionGroups(option.option_item_no);

  if (response) {
    props.setParentOption(props.parentOptionIndex + 1, {
      name: option.option_name,
      no: option.option_item_no,
      optionGroupNo: props.optionGroup.option_group_no,
      depthCode: option.depth_code,
      items: response.data,
    });
  }
};

const { openModalWithData } = useModalStore();
/** 옵션그룹 수정 모달 열기 */
const showModifyOptionGroupModal = () => {
  openModalWithData(MODIFY_OPTION_GROUP, {
    optionGroupNo: props.optionGroup.option_group_no,
    onSubmit:
      props.parentOptionIndex === 0
        ? props.getFirstDepthOptionGroups
        : getOptionGroups,
  });
};

/**
 * 옵션 판매 상태 변경
 * @param state - option 판매 상태 'Y' or 'N'
 * @param optionItemNo - option 고유번호
 */
const onChangeOptionUse = async (
  state: apiResponseYesNoType,
  optionItemNo: number,
) => {
  try {
    await requestOptionUse({
      storeCode: route.query.code as string,
      posGoodCode: route.query.posGoodCode as string,
      optionItemNo,
      use: state,
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
    await requestOptionGroupsApiByParentOption();
  }
};

/**
 * 옵션 품절 상태 변경
 * @param state - option 품절 상태 'Y' or 'N'
 * @param optionItemNo - option 고유번호
 */
const onChangeOptionSoldOut = async (
  state: apiResponseYesNoType,
  optionItemNo: number,
) => {
  try {
    await requestOptionSoldOut({
      storeCode: route.query.code as string,
      posGoodCode: route.query.posGoodCode as string,
      optionItemNo,
      soldOut: state,
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
    await requestOptionGroupsApiByParentOption();
  }
};

/** 선택 가능 개수 text */
const getOptionGroupQuantityTexts = () => {
  if (props.optionGroup.max_limit_qty === 0) {
    return `${props.optionGroup.min_limit_qty}개 이상`;
  }
  return `${props.optionGroup.min_limit_qty} ~ ${props.optionGroup.max_limit_qty}개`;
};

const getOptionTypeTexts = (option: unlimitedOptionType) => {
  let result = '';
  if (option.option_type === 'option') {
    result = '옵션';
  }
  if (option.option_type === 'goods') {
    result = '메뉴';
  }
  if (option.preset_yn === 'Y') {
    result = `${result}(기본구성)`;
  }

  return result;
};
</script>

<template>
  <div class="option-group">
    <el-row
      justify="space-between"
      align="middle"
    >
      <p class="option-group-name">{{ props.optionGroup.option_group_name }}</p>
      <div>
        <el-button
          plain
          type="warning"
          @click="showModifyOptionGroupModal"
        >
          수정
        </el-button>
        <el-button
          plain
          type="danger"
          :loading="isDeleteOptionGroupLoading"
          @click="onClickDeleteOptionGroup"
        >
          삭제
        </el-button>
      </div>
    </el-row>

    <el-col>
      <el-row
        class="option-group-info mb-5 font-thin"
        span="12"
      >
        옵션 그룹 조건:
        {{ props.optionGroup.option_require === 'Y' ? '필수' : '선택' }}
      </el-row>
      <el-row
        class="option-group-info font-thin"
        span="12"
      >
        선택 가능 개수: {{ getOptionGroupQuantityTexts() }}
      </el-row>
    </el-col>
    <el-divider />

    <el-row
      v-for="(option, index) in props.optionGroup.items"
      :key="`option-${option.option_item_no}-${index}`"
      class="mb-10"
    >
      <button
        class="option-button"
        :class="changeOptionStyle(option.option_item_no)"
        :disabled="props.parentOptionIndex === props.parentOptions.length - 1"
        @click="onSelectOption(option)"
      >
        <el-row
          :gutter="10"
          align="middle"
        >
          <el-col :span="12">
            <el-row class="mb-5">
              <el-tag type="info">
                {{ getOptionTypeTexts(option) }}
              </el-tag>
            </el-row>
            <el-row class="mb-5">
              {{ option.depth_code }}
            </el-row>
            <el-row class="mb-5">
              {{ option.option_name }}
            </el-row>
          </el-col>

          <!--기본구성이 설정되어 있을경우 disabled-->
          <el-col
            v-if="option.preset_yn === 'Y'"
            :span="12"
            @click.stop
          >
            <el-tooltip
              content="기본 구성 메뉴/옵션은 판매, 품절상태를 변경할 수 없습니다."
              placement="top"
            >
              <el-switch
                v-model="option.option_use"
                active-text="판매중"
                active-value="Y"
                inactive-value="N"
                inactive-text="중지"
                class="ml-10"
                style="
                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #f56c6c;
                "
                disabled
              />
            </el-tooltip>

            <el-tooltip
              content="기본 구성 메뉴/옵션은 판매, 품절상태를 변경할 수 없습니다."
              placement="top"
            >
              <el-switch
                v-model="option.option_sold_out"
                active-text="판매중"
                active-value="N"
                class="ml-10"
                inactive-text="품절"
                inactive-value="Y"
                style="
                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #e6a23c;
                "
                disabled
              />
            </el-tooltip>
          </el-col>

          <el-col
            v-else
            :span="12"
            @click.stop
          >
            <el-switch
              v-model="option.option_use"
              active-text="판매중"
              active-value="Y"
              inactive-value="N"
              inactive-text="중지"
              class="ml-10"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #f56c6c;
              "
              @change="
                (state: apiResponseYesNoType) =>
                  onChangeOptionUse(state, option.option_item_no)
              "
            />

            <el-switch
              v-model="option.option_sold_out"
              active-text="판매중"
              active-value="N"
              class="ml-10"
              inactive-text="품절"
              inactive-value="Y"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #e6a23c;
              "
              @change="
                (state: apiResponseYesNoType) =>
                  onChangeOptionSoldOut(state, option.option_item_no)
              "
            />
          </el-col>
        </el-row>
      </button>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.option-group {
  width: 100%;
  border-radius: 5px;
  padding: 10px 10px 0 10px;
  border: 1px solid #cfd3dc;
}

.option-group-name {
  font-size: 14px;
}

.option-group-info {
  font-size: 12px;
}

.option-button {
  width: 100%;
  border: 1px solid #cfd3dc;
  border-radius: 5px;
  padding: 10px 0 10px 10px;
  cursor: pointer;
  color: black;

  &:disabled {
    cursor: default;
  }
  &:hover:disabled {
    border-color: #cfd3dc;
  }
  &:hover {
    border-color: #898e98;
  }
}

.option-selected {
  background-color: #faf7ff;
  border-color: #c9b8ff;

  &:hover {
    border-color: #c9b8ff;
  }
}

.option-unSelected {
  background-color: white;
}
</style>
