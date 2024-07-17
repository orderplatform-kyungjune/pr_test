<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { requestPosInitDataType } from '@interface/option';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { ADD_ORDER_TWO_OPTION_GROUP } from '@common/string';
import { orderTwoOptionCodec } from '@codecs';
import { orderTwoOption } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { giveFocusToElementById } = etcUtils;

const props = defineProps<{
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  request: () => Promise<void>;
  requestItem: (index: number) => void;
  optionReset: () => void;
}>();

const { requestOrderTwoOptionPosInitData, requestOrderTwoOptionCreate } =
  orderTwoOption;

const { orderTwoOptionPosInitListCodec } = orderTwoOptionCodec;

const { flag, closeModal } = useModalStore();

/** 로딩 상태값 */
const optionListLoading = ref(false);

const searchOptionMenu: Ref<string> = ref('');

/** 선택한 옵션 상품 */
const selectedOptionList: Ref<requestPosInitDataType[]> = ref([]);

/** 옵션 추가하기 위한 데이터 */
const addOptionData = reactive({
  storeCode: props.productInfo.storeCode,
  goodCode: props.productInfo.goodCode,
  posGoodCode: props.productInfo.posGoodCode,
  parents_option_group_no: '',
  option_display_name: '',
  option_require: 'Y',
  option_id: [] as string[],
  option_qty: [] as number[],
  preset_yn: [] as string[],
  image: '',
  is_type: 'G', // 현 order2에서는 G든 I든 상관없는 값이 됨.
  min_limit_select: 0,
  max_limit_select: 0,
  min_limit_qty: 1,
  max_limit_qty: 0,
});

// 수량 최대,최소 개수 선택
const countRadioState = reactive({
  select: false,
  qty: false,
});

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

  optionListLoading.value = true;

  try {
    const res = (await requestOrderTwoOptionPosInitData(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(orderTwoOptionPosInitListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
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
  } finally {
    optionListLoading.value = false;
  }
};

const resetSearchInput = () => {
  searchOptionMenu.value = '';
  searchedOptionList.value = originOptionList.value;
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

  if (!searchedOptionList.value) {
    ElMessage({
      type: 'warning',
      message: `검색하신 ${searchOptionMenu.value}와(과) 일치한 상품이 존재하지 않습니다.`,
    });
  }
};

/** 옵션 그룹 추가하기 */
const submitLoading: Ref<boolean> = ref(false);

const addOptionGroup = async () => {
  if (submitLoading.value) return;

  selectedOptionList.value?.forEach((item) => {
    addOptionData.option_id.push(item.O_id);
    addOptionData.option_qty.push(item.option_qty ?? 0);
    addOptionData.preset_yn.push(item.preset_yn);
  });

  addOptionData.min_limit_qty = addOptionData.min_limit_qty ?? 1;
  addOptionData.max_limit_qty = addOptionData.max_limit_qty ?? 0;

  const {
    // select,
    qty,
  } = countRadioState;
  const {
    // min_limit_select,
    // max_limit_select,
    min_limit_qty,
    max_limit_qty,
    option_display_name,
  } = addOptionData;

  // if (select && min_limit_select > max_limit_select) {
  //   ElMessage({
  //     type: 'error',
  //     message: '최소 선택종류를 최대 선택종류보다 높게 설정할 수 없습니다.',
  //   });
  //   return;
  // }

  if (!qty) {
    // 제한없음 선택 시 최대 선택 개수 제한 0
    addOptionData.max_limit_qty = 0;
  }

  if (qty && min_limit_qty > max_limit_qty) {
    ElMessage({
      type: 'error',
      message: '최소 선택수량이 최대 수량보다 높게 설정할 수 없습니다.',
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

  if (!option_display_name) {
    ElMessage({
      type: 'error',
      message: '옵션 그룹 이름을 입력해주세요.',
    });
    giveFocusToElementById('option-group-name');
    return;
  }

  try {
    submitLoading.value = true;
    const res = (await requestOrderTwoOptionCreate(
      addOptionData,
    )) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '정상적으로 추가되었습니다.',
      });
      props.optionReset();
      await props.request();
      props.requestItem(0);
      closeModal(ADD_ORDER_TWO_OPTION_GROUP);
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
  selectedOptionList.value = allCheckedState ? searchedOptionList.value : [];
  isIndeterminate.value = false;
};
const changeCheckbox = (value: requestPosInitDataType[]) => {
  const checkedCount = value.length;
  const allData = searchedOptionList.value?.length;
  checkboxAll.value = checkedCount === allData;
  isIndeterminate.value = checkedCount > 0 && checkedCount < allData;
};

// const changeSelectRadio = (val: boolean) => {
//   if (!val) {
//     addOptionData.max_limit_select = 0;
//   }
// };

// v-for 방어 코드
const getPosInitDataKey = (data: requestPosInitDataType, index: number) =>
  !data ? `posInit ${index}` : data.O_id;

getPosInitData();
</script>

<template>
  <el-dialog
    v-model="flag.addOrderTwoOptionGroup"
    :close-on-click-modal="false"
    align-center
    width="60%"
  >
    <template #header>
      <span class="mr-10"> 옵션 그룹 생성 </span>
    </template>
    <p class="option-title">옵션 그룹 이름</p>
    <el-input
      id="option-group-name"
      v-model="addOptionData.option_display_name"
      class="mt-10 mb-20"
      clearable
      maxlength="30"
      show-word-limit
    />
    <el-row class="mb-10">
      <span class="option-title"> 옵션 그룹 조건 </span>
      <span class="guide-text ml-10">
        * [필수]는 무조건 1개 이상 필수로 선택해야 하며 [선택]은 선택하지 않아도
        주문이 가능합니다.
      </span>
    </el-row>
    <el-radio-group
      v-model="addOptionData.option_require"
      class="mb-20"
    >
      <el-radio label="Y"> 필수</el-radio>
      <el-radio label="N"> 선택</el-radio>
    </el-radio-group>
    <!-- <el-row class="mb-20">
      <span class="option-title">
        옵션 그룹 내 선택 종류 제한
      </span>
      <span class="guide-text ml-10">
        * 한 그룹 안에서 선택할 수 있는 옵션 종류의 최소/최대 수량을 설정합니다.
      </span>
    </el-row>
    <el-row class="mb-30">
      <div class="option-max-min-count-wrap">
        <div class="option-max-min-count-item">
          <span>최소 선택종류</span>
          <el-input-number
            v-model="addOptionData.min_limit_select"
            :min="1"
            controls-position="right"
          />
          <span>개 이상</span>
        </div>
        <div class="option-max-min-count-item">
          <span>최대 선택종류</span>
          <el-radio-group v-model="countRadioState.select">
            <el-radio
              :label="false"
              @change="changeSelectRadio"
            >
              제한없음
            </el-radio>
            <el-radio :label="true">
              <el-input-number
                v-model="addOptionData.max_limit_select"
                :min="0"
                controls-position="right"
                :disabled="!countRadioState.select"
              />
            </el-radio>
          </el-radio-group>
          <span>개 이하로 제한</span>
        </div>
      </div>
    </el-row> -->
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
            v-model="addOptionData.min_limit_qty"
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
                v-model="addOptionData.max_limit_qty"
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
    <div
      v-loading="optionListLoading"
      class="option-list-container"
    >
      <el-scrollbar
        v-if="searchedOptionList?.length > 0"
        height="350px"
      >
        <div
          v-for="(posItem, index) in searchedOptionList"
          :key="getPosInitDataKey(posItem, index)"
          class="item-box"
        >
          <el-checkbox-group
            v-model="selectedOptionList"
            class="item-box-checkbox ml-10"
            @change="changeCheckbox"
          >
            <el-checkbox :label="posItem">
              {{ posItem.O_id }}
            </el-checkbox>
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
                :value-on-clear="0"
                class="mr-20"
              />
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
      <el-row
        v-if="searchedOptionList?.length < 1 && !optionListLoading"
        class="none-data-alarm"
      >
        옵션 상품이 존재하지 않습니다.
      </el-row>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ADD_ORDER_TWO_OPTION_GROUP)"
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
          v-loading="submitLoading"
          class="submit-loading-button"
          disabled
          type="primary"
          @click="addOptionGroup"
        >
          생성
        </el-button>
      </el-tooltip>
      <el-button
        v-else
        v-loading="submitLoading"
        class="submit-loading-button"
        type="primary"
        @click="addOptionGroup"
      >
        생성
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.option-title {
  font-size: 15px;
  font-weight: bold;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

  .option-group-upload-desc {
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

.guide-text {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #ff6060;
}

.submit-loading-button {
  &:deep(.circular) {
    width: 50%;
  }
}

.none-data-alarm {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 18px;
  font-weight: bold;
}

.option-list-container {
  min-height: 350px;
}
</style>
