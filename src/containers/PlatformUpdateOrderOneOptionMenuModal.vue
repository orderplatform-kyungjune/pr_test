<script lang="ts" setup>
import { computed, onMounted, reactive, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestOrderOneOptionMenuPlatformType,
  requestPosInitDataType,
} from '@interface/option';
import { productDetailInfoDataOptionPlatformType } from '@interface/goods';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { UPDATE_ORDER_ONE_OPTION_MENU } from '@common/string';
import { optionCodec } from '@codecs';
import { option } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { giveFocusToElementById } = etcUtils;

const props = defineProps<{
  options: productDetailInfoDataOptionPlatformType;
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  request: () => void;
  optionReset: () => void;
}>();

const { flag, closeModal } = useModalStore();

const { requestPosInitData, requestUpdateOption } = option;

const { optionPosInitDataCodec } = optionCodec;

const searchOptionMenu: Ref<string> = ref('');

const requestDate = reactive({
  name: '',
  limit: 0,
  require: '',
});

const loading: Ref<boolean> = ref(false);

/** 변경하기 API 데이터 */
const selectedOptionList: Ref<string[]> = ref([]);

const searchedOptionList: Ref<requestPosInitDataType[]> = ref(
  [] as requestPosInitDataType[],
);
const originOptionList: Ref<requestPosInitDataType[]> = ref(
  [] as requestPosInitDataType[],
);

const searchOption = () => {
  if (!searchOptionMenu.value) {
    ElMessage({
      type: 'warning',
      message: '검색어를 입력해주세요.',
    });
  }

  // eslint-disable-next-line vue/max-len
  searchedOptionList.value = originOptionList.value.filter(
    (optionMenu) =>
      optionMenu.O_id.toLowerCase().includes(
        searchOptionMenu.value.toLowerCase(),
      ) ||
      optionMenu.O_name.toLowerCase().includes(
        searchOptionMenu.value.toLowerCase(),
      ),
  );

  if (!searchedOptionList.value.length) {
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

const submitLoading: Ref<boolean> = ref(false);

const editOptionProduct = async () => {
  if (!requestDate.name) {
    ElMessage({
      type: 'error',
      message: '옵션 그룹 이름을 입력해주세요.',
    });
    giveFocusToElementById('option-group-name');
    return;
  }

  requestDate.limit = requestDate.limit ?? 1;

  const newOptionArr: string[] = [];
  const optionQuantityArr: number[] = [];

  // 포스에서 제거된 상품을 제외하고 서버에 요청하기 위한 로직
  selectedOptionList.value?.forEach((code: string) => {
    const target = searchedOptionList.value?.find(
      (init: requestPosInitDataType) => init.O_id === code,
    );
    if (target) newOptionArr.push(target?.O_id as string);
  });

  newOptionArr.forEach((code: string) => {
    const target = searchedOptionList.value?.find(
      (init: requestPosInitDataType) => init.O_id === code,
    );
    optionQuantityArr.push(target?.option_qty ?? 0);
  });

  try {
    submitLoading.value = true;

    const requestData = {
      storeCode: props.productInfo.storeCode,
      groupId: props.options.group_num,
      goodCode: props.productInfo.goodCode,
      posGoodCode: props.productInfo.posGoodCode,
      option_display_name: requestDate.name,
      option_require: requestDate.require,
      option_limit_select: requestDate.limit,
      option_id: newOptionArr,
      option_qty: optionQuantityArr,
    };
    const res = (await requestUpdateOption(requestData)) as AxiosResponse;

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
      props.optionReset();
      props.request();
      closeModal(UPDATE_ORDER_ONE_OPTION_MENU);
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

const isNoneData = computed(() => searchedOptionList.value.length === 0);

/** 체크박스 전체 선택 */
const checkboxAll = ref(false);
const isIndeterminate = ref(false);
const changeCheckboxAll = (state: boolean) => {
  const allCheckboxArr: string[] = [];
  searchedOptionList.value.forEach((data: requestPosInitDataType) => {
    allCheckboxArr.push(data.O_id);
  });

  if (state) {
    selectedOptionList.value = allCheckboxArr;
  } else {
    selectedOptionList.value = [];
  }

  isIndeterminate.value = false;
};
const changeCheckbox = (value: string[]) => {
  const checkedCount = value.length;
  const allData = searchedOptionList.value.filter(
    (data: requestPosInitDataType) => data.O_id,
  );
  checkboxAll.value = checkedCount === allData.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < allData.length;
};

// 기존 상품 카운트 설정
const setCheckedItemSelectCount = () => {
  selectedOptionList.value.forEach((selectedOptionCode) => {
    searchedOptionList.value.forEach((initData, i) => {
      props.options.option_item.forEach((optionMenu) => {
        if (
          selectedOptionCode === initData.O_id &&
          initData.O_id === optionMenu.platform_store_good_option_code
        ) {
          searchedOptionList.value[i].option_qty =
            optionMenu.platform_store_good_option_select_cnt;
        }
      });
    });
  });
};

/** 포스 제공 옵션 리스트 불러오기 */
const getPosInitData = async () => {
  const config = props.productInfo.storeCode;
  const { posGoodCode } = props.productInfo;
  loading.value = true;

  try {
    const res = (await requestPosInitData(
      config,
      posGoodCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(optionPosInitDataCodec, res.data);

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
        checkboxAll.value =
          originOptionList.value?.length === selectedOptionList.value?.length;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => searchedOptionList.value,
  () => setCheckedItemSelectCount(),
);

onMounted(() => {
  requestDate.name = props.options.name;
  requestDate.limit = props.options.limit;
  requestDate.require = props.options.require;

  const checkedItem: string[] = [] as string[];
  props.options.option_item.forEach(
    (item: requestOrderOneOptionMenuPlatformType) => {
      checkedItem.push(item.platform_store_good_option_code);
    },
  );
  selectedOptionList.value = checkedItem;
});

getPosInitData();
</script>

<template>
  <el-dialog
    v-model="flag.updateOrderOneOptionMenu"
    :close-on-click-modal="false"
    align-center
    width="60%"
  >
    <template #header>
      <span class="mr-10"> 옵션 그룹 변경 </span>
    </template>
    <p class="option-title">옵션 그룹 이름</p>
    <el-input
      id="option-group-name"
      v-model="requestDate.name"
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
      v-model="requestDate.require"
      class="mb-20"
    >
      <el-radio label="Y"> 필수</el-radio>
      <el-radio label="N"> 선택</el-radio>
    </el-radio-group>
    <el-row>
      <span>선택 가능 개수</span>
    </el-row>
    <el-row class="mt-10 mb-20">
      <!-- 티오더1은 옵션그룹 무제한 선택 기능이 없음: 선택 가능 개수 0 초과해야 -->
      <el-input-number
        v-model="requestDate.limit"
        :min="1"
        :value-on-clear="1"
        class="mr-5"
      />
      <el-tag size="large">
        최대 {{ requestDate.limit }}개 까지 선택할 수 있습니다.
      </el-tag>
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
      v-loading="loading"
      class="option-list-container"
    >
      <el-scrollbar
        v-if="!isNoneData"
        height="350px"
      >
        <div
          v-for="posItem in searchedOptionList"
          :key="posItem.O_id"
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
                :value-on-clear="0"
              />
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
      <el-row
        v-if="!searchedOptionList.length && !loading"
        class="none-data-alarm"
      >
        옵션 상품이 존재하지 않습니다.
      </el-row>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(UPDATE_ORDER_ONE_OPTION_MENU)"
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
          @click="editOptionProduct"
        >
          변경하기
        </el-button>
      </el-tooltip>
      <el-button
        v-else
        :loading="submitLoading"
        type="primary"
        @click="editOptionProduct"
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
