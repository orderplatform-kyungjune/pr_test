<script lang="ts" setup>
import { onMounted, reactive, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  orderTwoOptionGroupDataPlatformType,
  orderTwoOptionMenuDataPlatformType,
  responseOptionGroupListType,
} from '@interface/orderTwoOption';
import { requestPosInitDataType } from '@interface/option';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { UPDATE_ORDER_TWO_OPTION_MENU } from '@common/string';
import { orderTwoOptionCodec } from '@codecs';
import { orderTwoOption } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { giveFocusToElementById } = etcUtils;

const props = defineProps<{
  options: responseOptionGroupListType;
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  request: () => Promise<void>;
  requestItem: (index: number) => void;
  optionReset: () => void;
}>();

const { flag, closeModal } = useModalStore();

const {
  requestOrderTwoOptionMenuList,
  requestOrderTwoOptionPosInitData,
  requestUpdateOrderTwoOption,
  requestOrderTwoOptionGroupList,
} = orderTwoOption;

const {
  orderTwoOptionMenuListCodec,
  orderTwoOptionPosInitListCodec,
  orderTwoOptionGroupListCodec,
} = orderTwoOptionCodec;

/** 로딩 상태값 */
const optionInfoLoading: Ref<boolean> = ref(false);
const searchOptionMenu: Ref<string> = ref('');

/** 변경하기 API 데이터 */
const selectedOptionList: Ref<string[]> = ref([]);

/** 티오더2 옵션 상품 리스트 */
const optionMenuList: Ref<orderTwoOptionMenuDataPlatformType[]> = ref([]);

/** 티오더2 옵션 그룹 정보 (현 order2에서는 is_type 값이 G든 I든 상관없는 값이 됨.) */
const optionGroupData: Ref<orderTwoOptionGroupDataPlatformType> = ref({
  is_type: 'G',
} as orderTwoOptionGroupDataPlatformType);

const isOptionResetLimitPopoverVisible = ref(false);

// 수량 최대,최소 개수 선택
const countRadioState = reactive({
  select: false,
  qty: false,
});

const hasOptionLimitSelect = ref(false);

/** 티오더2 옵션 상품 리스트 불러오기 */
const postOptionMenuList = async () => {
  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodsCode: props.productInfo.goodCode,
    option_group_no: props.options.option_group_no,
  };

  try {
    const res = (await requestOrderTwoOptionMenuList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionMenuListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        optionGroupData.value = res.data.data;
        optionMenuList.value = res.data.data.item;

        countRadioState.select = res.data.data.max_limit_select !== 0;

        countRadioState.qty = res.data.data.max_limit_qty !== 0;

        hasOptionLimitSelect.value =
          (optionGroupData.value.min_limit_select !== 1 &&
            optionGroupData.value.max_limit_select !== 0) ||
          (optionGroupData.value.min_limit_select !== 0 &&
            optionGroupData.value.max_limit_select !== 0);
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    optionInfoLoading.value = false;
  }
};

/** 포스 제공 옵션 리스트 불러오기 */
const searchedOptionList: Ref<requestPosInitDataType[]> = ref(
  [] as requestPosInitDataType[],
);
const originOptionList: Ref<requestPosInitDataType[]> = ref(
  [] as requestPosInitDataType[],
);
const getPosInitData = async () => {
  const requestData = {
    storeCode: props.productInfo.storeCode,
    posGoodCode: props.productInfo.posGoodCode,
    type: 'goods',
  };

  try {
    const res = (await requestOrderTwoOptionPosInitData(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionPosInitListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        originOptionList.value = res.data.data.map(
          (pos: requestPosInitDataType) => ({
            ...pos,
            option_qty: 1,
            preset_yn: 'N',
          }),
        );
        searchedOptionList.value = originOptionList.value;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const searchOption = () => {
  if (!searchOptionMenu.value) {
    ElMessage({
      type: 'warning',
      message: '검색어를 입력해주세요.',
    });
  }

  // eslint-disable-next-line vue/max-len
  searchedOptionList.value = originOptionList.value.filter(
    (option) =>
      option.O_id.toLowerCase().includes(
        searchOptionMenu.value.toLowerCase(),
      ) ||
      option.O_name.toLowerCase().includes(
        searchOptionMenu.value.toLowerCase(),
      ),
  );

  if (searchedOptionList.value?.length < 1) {
    ElMessage({
      type: 'warning',
      message: `검색하신 ${searchOptionMenu.value}와(과) 일치한 상품이 존재하지 않습니다.`,
    });
  }
};

const resetSearchInput = () => {
  searchOptionMenu.value = '';
  searchedOptionList.value = originOptionList.value;
};

/** 옵션 그룹 리스트 불러오기 */
const optionGroupList = ref<responseOptionGroupListType[]>([]);
const postOptionGroupList = async () => {
  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodsCode: props.productInfo.goodCode,
  };

  try {
    const res = (await requestOrderTwoOptionGroupList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionGroupListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.data.code === 200) {
        optionGroupList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const submitLoading: Ref<boolean> = ref(false);

/** 옵션 그룹 수정 */
const postUpdateOptionGroup = async (
  type: 'resetOptionLimitSelect' | 'setOption',
) => {
  if (!optionGroupData.value.option_group_name) {
    ElMessage({
      type: 'error',
      message: '옵션 그룹 이름을 입력해주세요.',
    });
    giveFocusToElementById('option-group-name');
    return;
  }
  const newOptionArr: string[] = [];
  const optionQuantityArr: number[] = [];
  const presetOptionArr: string[] = [];

  const getInitTarget = (code: string) =>
    originOptionList.value.find(
      (init: requestPosInitDataType) => init.O_id === code,
    );

  // 포스에서 제거된 상품을 제외하고 서버에 요청하기 위한 로직
  selectedOptionList.value.forEach((code: string) => {
    const target = getInitTarget(code);
    if (target) newOptionArr.push(target?.O_id as string);
  });

  newOptionArr.forEach((code: string) => {
    const target = getInitTarget(code);
    if (target) {
      optionQuantityArr.push(target.option_qty ?? 0);
      presetOptionArr.push(target.preset_yn);
    }
  });

  optionGroupData.value.min_limit_qty =
    optionGroupData.value.min_limit_qty ?? 1;
  optionGroupData.value.max_limit_qty =
    optionGroupData.value.max_limit_qty ?? 0;

  const {
    // select,
    qty,
  } = countRadioState;
  const {
    // min_limit_select,
    // max_limit_select,
    min_limit_qty,
    max_limit_qty,
  } = optionGroupData.value;

  // if (select && min_limit_select > max_limit_select) {
  //   ElMessage({
  //     type: 'error',
  //     message: '최소 수량이 최대 수량보다 높게 설정할 수 없습니다.',
  //   });
  //   return;
  // }

  if (!qty) {
    // 제한없음 선택 시 최대 선택 개수 제한 0
    optionGroupData.value.max_limit_qty = 0;
  }

  if (qty && min_limit_qty > max_limit_qty) {
    ElMessage({
      type: 'error',
      message: '최소 수량이 최대 수량보다 높게 설정할 수 없습니다.',
    });
    return;
  }

  // if (select && qty && max_limit_select > max_limit_qty) {
  //   ElMessage({
  //     type: 'error',
  //     message: '최대 선택수량은 최대 선택종류보다 많아야 합니다.',
  //   });
  //   return;
  // }

  // if (qty && min_limit_select > max_limit_qty) {
  //   ElMessage({
  //     type: 'error',
  //     message: '최대 선택수량은 최소 선택종류보다 많아야 합니다.',
  //   });
  //   return;
  // }

  try {
    submitLoading.value = true;

    const requestData = {
      storeCode: props.productInfo.storeCode,
      goodCode: props.productInfo.goodCode,
      posGoodCode: props.productInfo.posGoodCode,
      option_group_no: optionGroupData.value.option_group_no,
      parents_option_group_no: optionGroupData.value.parents_option_group_no,
      option_display_name: optionGroupData.value.option_group_name,
      option_require: optionGroupData.value.option_require,
      option_id: newOptionArr,
      option_qty: optionQuantityArr,
      image: optionGroupData.value.image,
      is_type: optionGroupData.value.is_type,
      preset_yn: presetOptionArr,
      min_limit_select: optionGroupData.value.min_limit_select,
      max_limit_select: optionGroupData.value.max_limit_select,
      min_limit_qty: optionGroupData.value.min_limit_qty,
      max_limit_qty: optionGroupData.value.max_limit_qty,
    };
    const res = (await requestUpdateOrderTwoOption(
      requestData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      // 옵션 종류 초기화 진행할 경우
      if (type === 'resetOptionLimitSelect') {
        ElMessage({
          type: 'success',
          message:
            '옵션 그룹 내 선택 종류 초기화 및 옵션 상품 변경이 완료되었습니다.',
        });
        await postOptionMenuList();
        return;
      }

      props.optionReset();
      await props.request();
      props.requestItem(0);
      closeModal(UPDATE_ORDER_TWO_OPTION_MENU);
      ElMessage({
        type: 'success',
        message: '옵션 상품이 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    submitLoading.value = false;
  }
};

/** 체크박스 전체 선택 */
const checkboxAll = ref(false);
const isIndeterminate = ref(false);
const changeCheckboxAll = (allCheckedState: boolean) => {
  const allCheckboxArr: string[] = [];
  searchedOptionList.value.forEach((data: requestPosInitDataType) => {
    allCheckboxArr.push(data.O_id);
  });

  selectedOptionList.value = allCheckedState ? allCheckboxArr : [];
  isIndeterminate.value = false;
};
const changeCheckbox = (value: string[]) => {
  const checkedCount = value.length;
  const allData = searchedOptionList?.value.filter(
    (data: requestPosInitDataType) => data.O_id,
  );
  checkboxAll.value = checkedCount === allData.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < allData.length;
};

// 기존 상품 카운트 설정
const setCheckedItemSelectCount = () => {
  selectedOptionList.value.forEach((selectedOptionCode) => {
    const targetInfo = optionGroupData.value.item.find(
      (checked) =>
        checked.platform_store_good_option_code === selectedOptionCode,
    );
    const targetIndex = searchedOptionList.value.findIndex(
      (init) => init.O_id === selectedOptionCode,
    );

    if (targetInfo && targetIndex !== -1) {
      searchedOptionList.value[targetIndex].option_qty =
        targetInfo.platform_store_good_option_select_cnt;
    }
  });

  checkboxAll.value =
    selectedOptionList.value?.length === originOptionList.value?.length;
};

const toggleOptionResetLimitPopoverVisible = (state: boolean) => {
  isOptionResetLimitPopoverVisible.value = state;
};

const onClickResetOptionLimitSelect = () => {
  toggleOptionResetLimitPopoverVisible(true);

  optionGroupData.value.min_limit_select = 0;
  optionGroupData.value.max_limit_select = 0;
  postUpdateOptionGroup('resetOptionLimitSelect');
};

watch(optionGroupData, () => {
  const checkedItem: string[] = [] as string[];
  optionGroupData.value.item?.forEach(
    (item: orderTwoOptionMenuDataPlatformType) => {
      checkedItem?.push(item.platform_store_good_option_code);
    },
  );
  selectedOptionList.value = checkedItem;
  setCheckedItemSelectCount();
});

// v-for 방어 코드
const getOptionMenuKey = (item: requestPosInitDataType, index: number) =>
  !item ? `posItem ${index}` : item.O_id;

onMounted(async () => {
  optionInfoLoading.value = true;

  await getPosInitData();
  await postOptionGroupList();
  await postOptionMenuList();
});
</script>

<template>
  <el-dialog
    v-model="flag.updateOrderTwoOptionMenu"
    :close-on-click-modal="false"
    align-center
    width="60%"
  >
    <template #header>
      <span> 옵션 그룹 변경 </span>
    </template>
    <div v-loading="optionInfoLoading">
      <span class="option-title"> 옵션 그룹 이름 </span>
      <el-input
        id="option-group-name"
        v-model="optionGroupData.option_group_name"
        class="mt-10 mb-20"
        maxlength="30"
        show-word-limit
      />
      <el-row class="mb-10">
        <span class="option-title"> 옵션 그룹 조건 </span>
        <span class="guide-text ml-10">
          * [필수]는 무조건 1개 이상 필수로 선택해야 하며 [선택]은 선택하지
          않아도 주문이 가능합니다.
        </span>
      </el-row>
      <el-radio-group
        v-model="optionGroupData.option_require"
        class="mb-20"
      >
        <el-radio label="Y"> 필수</el-radio>
        <el-radio label="N"> 선택</el-radio>
      </el-radio-group>

      <!-- 옵션 종류 값이 설정되어져있는 상품일 경우에만 활성화 -->
      <el-row
        v-if="hasOptionLimitSelect"
        class="mb-20"
      >
        <el-row class="width-100">
          <el-col :span="4">
            <span class="option-title"> 옵션 그룹 내 선택 종류 초기화 </span>
          </el-col>
          <el-col :span="20">
            <el-col
              :span="24"
              class="guide-text ml-10 mb-5"
            >
              * 한 그룹 안에서 선택할 수 있는 옵션 종류 수를 [최소: 1, 최대:
              제한없음]으로 변경합니다.
            </el-col>
            <el-col
              :span="24"
              class="guide-text ml-10"
            >
              * 초기화 후 복구 불가능하며 해당 버튼은 숨김 처리 됩니다.
            </el-col>
          </el-col>
        </el-row>

        <el-col>
          <el-popover
            :visible="isOptionResetLimitPopoverVisible"
            :width="220"
            placement="top"
          >
            <p>옵션 그룹 내 선택 종류를 초기화 하시겠습니까?</p>
            <div>
              <el-button
                size="small"
                @click="toggleOptionResetLimitPopoverVisible(false)"
              >
                아니요
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="onClickResetOptionLimitSelect"
              >
                예
              </el-button>
            </div>
            <template #reference>
              <el-button
                type="danger"
                @click="toggleOptionResetLimitPopoverVisible(true)"
              >
                옵션 선택 종류 초기화
              </el-button>
            </template>
          </el-popover>
        </el-col>
      </el-row>

      <el-row>
        <el-row class="mb-10 width-100">
          <span class="option-title"> 옵션 그룹 내 선택 가능 개수 </span>
          <span class="guide-text ml-10">
            * 한 그룹 안에서 선택할 수 있는 총 옵션 상품의 최소/최대 개수를
            설정합니다.
          </span>
        </el-row>
        <div class="option-max-min-count-wrap width-100">
          <div class="option-max-min-count-item">
            <span>최소 선택 개수</span>
            <el-input-number
              v-model="optionGroupData.min_limit_qty"
              :min="1"
              :value-on-clear="1"
            />
            <span>개 이상</span>
          </div>
          <div class="option-max-min-count-item">
            <span>최대 선택 개수</span>
            <el-radio-group v-model="countRadioState.qty">
              <el-radio :label="false"> 제한없음</el-radio>
              <el-radio :label="true">
                <el-input-number
                  v-model="optionGroupData.max_limit_qty"
                  :disabled="!countRadioState.qty"
                  :min="1"
                  :value-on-clear="1"
                />
              </el-radio>
            </el-radio-group>
            <span>개 이하로 제한</span>
          </div>
        </div>
      </el-row>
      <el-divider />
      <el-row>
        <p class="option-title">옵션 목록</p>
        <el-row
          align="bottom"
          class="width-100 mb-5"
        >
          <el-input
            v-model="searchOptionMenu"
            class="mt-10 flex-1"
            clearable
            placeholder="검색할 상품명 및 상품코드를 입력해주세요."
            @keydown.enter="searchOption"
          />
          <div>
            <el-button
              :disabled="searchOptionMenu?.length < 1"
              :icon="Search"
              class="ml-10"
              round
              type="primary"
              @click="searchOption"
            >
              검색
            </el-button>
            <el-button
              :icon="RefreshRight"
              round
              @click="resetSearchInput"
            >
              초기화
            </el-button>
          </div>
        </el-row>
      </el-row>
      <el-row class="ml-5">
        <el-checkbox
          v-model="checkboxAll"
          :disabled="searchedOptionList?.length < 1"
          :indeterminate="isIndeterminate"
          label="전체 선택"
          size="large"
          @change="changeCheckboxAll"
        />
      </el-row>
      <div class="option-list-container">
        <el-scrollbar
          v-if="searchedOptionList?.length > 0"
          height="350px"
        >
          <div
            v-for="(posItem, index) in searchedOptionList"
            :key="getOptionMenuKey(posItem, index)"
            class="item-box"
          >
            <el-checkbox-group
              v-model="selectedOptionList"
              class="item-box-checkbox ml-10"
              @change="changeCheckbox"
            >
              <el-checkbox :label="posItem.O_id" />
            </el-checkbox-group>
            <span class="item-box-contents">
              {{ posItem.O_name }}
            </span>
            <span class="item-box-contents">
              {{ posItem.O_price?.toLocaleString() }}원
            </span>
            <el-row
              align="middle"
              justify="end"
            >
              <el-col :span="8">
                <span class="mr-10"> 최대 선택 개수 </span>
              </el-col>
              <el-col :span="12">
                <el-input-number
                  v-model="posItem.option_qty"
                  :min="0"
                  :value-on-clear="1"
                />
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
        <el-row
          v-if="searchedOptionList?.length < 1 && !optionInfoLoading"
          class="none-data-alarm"
        >
          옵션 상품이 존재하지 않습니다.
        </el-row>
      </div>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(UPDATE_ORDER_TWO_OPTION_MENU)"
      >
        취소
      </el-button>
      <el-tooltip
        v-if="selectedOptionList?.length < 1"
        content="옵션 상품을 선택해주세요."
        effect="dark"
        placement="top"
      >
        <el-button
          :loading="submitLoading"
          disabled
          type="primary"
          @click="() => postUpdateOptionGroup('setOption')"
        >
          변경하기
        </el-button>
      </el-tooltip>
      <el-button
        v-else
        :loading="submitLoading"
        type="primary"
        @click="() => postUpdateOptionGroup('setOption')"
      >
        변경하기
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.option-title {
  font-size: 15px;
  font-weight: bold;
}

.option-max-min-count-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;

  .option-max-min-count-item {
    display: flex;
    gap: 20px;

    > span {
      display: flex;
      align-items: center;
    }
  }
}

.option-group-select {
  width: 100%;
}

.option-group-upload-wrapper {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 100px;
  padding: 20px;
  border: 1px solid #000;
  border-radius: 10px;

  .option-group-upload {
    display: flex;
    align-items: center;
    justify-content: center;

    &:deep(.el-upload-dragger) {
      padding: 20px;
    }

    .option-group-image {
      width: 200px;
      height: 153.8px;
    }

    .option-group-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200px;
      height: 153.8px;
    }
  }

  .set-option-group-upload-desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    height: auto;
  }
}

.item-box {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  align-items: center;
  width: 100%;
  height: 50px;
  padding: 10px;
  margin-bottom: 2px;
  border: 1px solid #d5c7ff;
  border-radius: 5px;

  .item-box-checkbox {
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-box-contents {
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.none-data-alarm {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 270px;
  font-size: 18px;
  font-weight: bold;
}

.guide-text {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #ff6060;
}

.option-list-container {
  min-height: 350px;
}
</style>
