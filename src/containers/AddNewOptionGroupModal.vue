<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, reactive, Ref, onMounted, computed } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';
import useModalStore from '@store/storeModal';
import {
  addNewOptionGroupListDataType,
  initOptionRequestType,
  requestOptionGroupCreateRequestBodyType,
  optionCreateRequestDataType,
} from '@interface/option';
import { Search, RefreshRight } from '@element-plus/icons-vue';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { ADD_NEW_OPTION_GROUP } from '@common/string';
import { apiResponseYesNoType, queryStorePosInfoType } from '@common/interface';
import {
  requestInitGoods,
  requestInitOptions,
  requestOptionGroupCreate,
} from '@apis/option';

const route = useRoute();
const query = route.query as unknown as queryStorePosInfoType;
const { flag, closeModal, modalData } = useModalStore();

/** openModalWithData 함수 실행시 보내는 data */
const modalPayload: {
  optionGroupNo: number | null;
  depthCode: string;
  onSubmit: () => void;
} = modalData.addNewOptionGroup;

/** form 입력 data */
const requestFormData = reactive<optionCreateRequestDataType>({
  setting: {
    storeCode: query.code,
    posGoodCode: query.posGoodCode,
    optionGroupNo: modalPayload.optionGroupNo,
    depthCode: modalPayload.depthCode,
    option_display_name: '',
    option_require: 'Y',
    min_limit_qty: 1,
    max_limit_qty: 0,
  },
  items: {
    goods: [],
    option: [],
  },
});

/** 옵션/메뉴 목록 api response data */
const listData = reactive<addNewOptionGroupListDataType>({
  originOptions: [],
  originGoods: [],
});

/** 옵션/메뉴 목록 탭 상태 */
const optionsTab = ref<'option' | 'goods'>('option');
/** 옵션 그룹 "최대 선택 개수" radio box 상태 */
const isUnlimitedQty = ref(true);
/** 옵션/메뉴 목록 검색 인풋 text(onChange) */
const searchInputTexts: Ref<string> = ref('');
/** 옵션/메뉴 목록 검색 최종 text(onSubmit) */
const searchResultTexts: Ref<string> = ref('');
/** 선택된 옵션이 있을경우 true */
const isOptionSelected = computed(
  () =>
    requestFormData.items.option.length > 0 ||
    requestFormData.items.goods.length > 0,
);

/** 검색조건 validation true/false callback */
const searchOptionCallback = (option: initOptionRequestType) =>
  option.O_id.toLowerCase().includes(searchResultTexts.value.toLowerCase()) ||
  option.O_name.toLowerCase().includes(searchResultTexts.value.toLowerCase());

/** 옵션/메뉴 목록 > 검색에 따른 validation 조건 */
const showOptionBySearchResultTexts = computed(() => searchOptionCallback);

const isGetOptionsLoading = ref(false);
/** 옵션 목록 가져오기 api 요청 */
const getInitOptions = async () => {
  try {
    isGetOptionsLoading.value = true;
    const response = await requestInitOptions({
      storeCode: query.code,
      posGoodCode: query.posGoodCode,
    });

    listData.originOptions = response.data.map((option) => ({
      ...option,
      option_qty: 1,
      preset_yn: 'N',
    })) as initOptionRequestType[];
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isGetOptionsLoading.value = false;
  }
};

/** 메뉴 목록 가져오기 api 요청 */
const getInitGoods = async () => {
  try {
    const response = await requestInitGoods({
      storeCode: query.code,
      posGoodCode: query.posGoodCode,
    });

    listData.originGoods = response.data.map((goods) => ({
      ...goods,
      option_qty: 1,
      preset_yn: 'N',
    })) as initOptionRequestType[];
  } catch (error) {
    apiErrorDialogHandler({ error });
  }
};

onMounted(async () => {
  await getInitOptions();
  await getInitGoods();
});

/** 옵션 그룹 조건 "선택" 클릭시 후처리 */
const onSelectOptionRequire = (state: apiResponseYesNoType) => {
  if (state === 'Y') {
    return;
  }

  const isPresetSelected = [
    ...listData.originGoods,
    ...listData.originOptions,
  ].some((option) => option.preset_yn === 'Y');

  if (isPresetSelected) {
    ElMessageBox({
      type: 'warning',
      title: '경고',
      message:
        '옵션 그룹 조건을 선택으로 변경하면 목록에서 체크한 기본 구성이 초기화 됩니다.',
    })
      .then(() => {
        requestFormData.setting.option_require = 'N';
        listData.originOptions = listData.originOptions.map((option) => ({
          ...option,
          preset_yn: 'N',
        }));
        listData.originGoods = listData.originGoods.map((goods) => ({
          ...goods,
          preset_yn: 'N',
        }));
      })
      .catch(() => {
        requestFormData.setting.option_require = 'Y';
      });
  }
};

/** 검색 "초기화" 버튼 클릭 후처리 함수 */
const onReset = () => {
  searchInputTexts.value = '';
  searchResultTexts.value = '';
};

/** "검색" 버튼 클릭 후처리 함수 */
const onSearchTexts = () => {
  searchResultTexts.value = searchInputTexts.value;
};

/**
 * 검색 조건에 따른 옵션목록을 반환
 * @param options - 모든 옵션/메뉴 목록
 * @return options - 검색조건에 맞는 옵션/메뉴 목록
 */
const getSearchedOption = (options: initOptionRequestType[]) =>
  cloneDeep(options.filter(searchOptionCallback));

/** 옵션 "전체 선택" 체크박스 상태 */
const isAllOptionsChecked = computed(
  () =>
    requestFormData.items.option.length > 0 &&
    getSearchedOption(listData.originOptions).every((searchedOption) =>
      requestFormData.items.option.some(
        (selectedOptionId) => selectedOptionId === searchedOption.O_id,
      ),
    ),
);
/** 옵션 "전체 선택" 체크박스 선택시 실행 함수 */
const onChangeOptionCheckboxAll = (state: boolean) => {
  if (state) {
    requestFormData.items.option = getSearchedOption(
      listData.originOptions,
    ).map((searchedOption) => searchedOption.O_id);
    return;
  }

  requestFormData.items.option = [];
};

/** 메뉴 "전체 선택" 체크박스 상태 */
const isAllGoodsChecked = computed(
  () =>
    requestFormData.items.goods.length > 0 &&
    getSearchedOption(listData.originGoods).every((searchedGoods) =>
      requestFormData.items.goods.some(
        (selectedGoodsId) => selectedGoodsId === searchedGoods.O_id,
      ),
    ),
);
/** 메뉴 "전체 선택" 체크박스 선택시 실행 함수 */
const onChangeGoodsCheckboxAll = (state: boolean) => {
  if (state) {
    requestFormData.items.goods = getSearchedOption(listData.originGoods).map(
      (searchedGoods) => searchedGoods.O_id,
    );
    return;
  }

  requestFormData.items.goods = [];
};

/**
 * 옵션그룹 "생성"시 validation 조건
 * @param selectedOptions - 선택된 옵션/메뉴 목록
 * @return state - validation 검증 결과(모두 통과시 true)
 */
const validateAddOptionGroup = (selectedOptions: initOptionRequestType[]) => {
  // 옵션그룹명을 입력하지 않았을경우
  if (requestFormData.setting.option_display_name === '') {
    ElMessage({
      type: 'error',
      message: '옵션 그룹 이름을 입력해주세요.',
    });
    return false;
  }

  // 최소 선택 개수보다 최대 선택 개수가 작을경우
  if (
    !isUnlimitedQty.value &&
    requestFormData.setting.min_limit_qty >
      requestFormData.setting.max_limit_qty
  ) {
    ElMessage({
      type: 'error',
      message: '최소 수량이 최대 수량보다 높게 설정할 수 없습니다.',
    });
    return false;
  }

  // 선택한 옵션/메뉴의 기본구성 개수보다 최대 선택 개수가 많을경우
  const presetYList = selectedOptions.filter(
    (selectedOption) => selectedOption.preset_yn === 'Y',
  );
  if (
    !isUnlimitedQty.value &&
    presetYList.length > requestFormData.setting.max_limit_qty
  ) {
    ElMessage({
      type: 'error',
      message: `기본 구성은 최대 ${requestFormData.setting.max_limit_qty}개까지 선택할 수 있습니다.`,
    });
    return false;
  }
  return true;
};

const isAddOptionGroupLoading: Ref<boolean> = ref(false);
/** 옵션그룹 생성 api 요청 및 후처리 */
const createOptionCreate = async () => {
  try {
    const resultGoods = listData.originGoods.filter((originGoods) =>
      requestFormData.items.goods.includes(originGoods.O_id),
    );
    const resultOptions = listData.originOptions.filter((originOption) =>
      requestFormData.items.option.includes(originOption.O_id),
    );

    if (!validateAddOptionGroup([...resultGoods, ...resultOptions])) {
      return;
    }

    isAddOptionGroupLoading.value = true;
    const requestBody: requestOptionGroupCreateRequestBodyType = {
      setting: {
        ...requestFormData.setting,
        optionGroupNo: requestFormData.setting.optionGroupNo,
        max_limit_qty: isUnlimitedQty.value
          ? 0
          : requestFormData.setting.max_limit_qty,
      },
      items: {
        goods: {
          goods_id: resultGoods.map((goods) => goods.O_id),
          goods_qty: resultGoods.map((goods) => goods.option_qty),
          preset_yn: resultGoods.map((goods) => goods.preset_yn),
        },
        option: {
          option_id: resultOptions.map((option) => option.O_id),
          option_qty: resultOptions.map((option) => option.option_qty),
          preset_yn: resultOptions.map((option) => option.preset_yn),
        },
      },
    };

    await requestOptionGroupCreate(requestBody);
    modalPayload.onSubmit();
    closeModal(ADD_NEW_OPTION_GROUP);
    ElMessage({
      type: 'success',
      message:
        '정상적으로 추가되었습니다. 저장하기 위해 변경사항 저장 버튼을 눌러주세요.',
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isAddOptionGroupLoading.value = false;
  }
};
</script>

<template>
  <el-dialog
    v-model="flag.addNewOptionGroup"
    :close-on-click-modal="false"
    width="80%"
    align-center
  >
    <template #header>
      <span class="mr-10"> 옵션 그룹 생성 </span>
    </template>
    <el-scrollbar height="700px">
      <p class="form-title">옵션 그룹 이름</p>
      <el-input
        id="option-group-name"
        v-model="requestFormData.setting.option_display_name"
        clearable
        maxlength="30"
        show-word-limit
        class="mt-10 mb-20"
      />
      <el-row class="mb-10">
        <span class="form-title"> 옵션 그룹 조건 </span>
        <span class="form-description ml-10">
          * [필수]는 무조건 1개 이상 필수로 선택해야 하며 [선택]은 선택하지
          않아도 주문이 가능합니다.
        </span>
      </el-row>
      <el-radio-group
        v-model="requestFormData.setting.option_require"
        class="mb-20"
        @change="onSelectOptionRequire"
      >
        <el-radio label="Y"> 필수 </el-radio>
        <el-radio label="N"> 선택 </el-radio>
      </el-radio-group>
      <el-row>
        <el-row class="mb-10 width-100">
          <span class="form-title"> 옵션 그룹 내 선택 가능 개수 </span>
          <span class="form-description ml-10">
            * 한 그룹 안에서 선택할 수 있는 총 옵션 메뉴의 최소/최대 개수를
            설정합니다.
          </span>
        </el-row>
        <div class="width-100">
          <div class="option-minmax-container mb-10">
            <span>최소 선택 개수</span>
            <el-input-number
              v-model="requestFormData.setting.min_limit_qty"
              :min="1"
              :value-on-clear="1"
            />
            <span>개 이상</span>
          </div>
          <div class="option-minmax-container">
            <span>최대 선택 개수</span>
            <div>
              <el-radio-group v-model="isUnlimitedQty">
                <el-radio :label="true"> 제한없음 </el-radio>
                <el-radio :label="false"><span></span></el-radio>
              </el-radio-group>
              <el-input-number
                v-model="requestFormData.setting.max_limit_qty"
                :min="1"
                :disabled="isUnlimitedQty"
                :value-on-clear="1"
              />
            </div>
            <span>개 이하로 제한</span>
          </div>
        </div>
      </el-row>

      <el-divider />

      <p class="form-title mb-10">목록</p>
      <el-tabs
        v-model="optionsTab"
        type="card"
      >
        <el-tab-pane
          label="옵션"
          name="option"
        />
        <el-tab-pane
          label="메뉴"
          name="goods"
        />
      </el-tabs>

      <el-row>
        <el-row
          class="width-100 mb-5"
          align="bottom"
        >
          <el-input
            v-model="searchInputTexts"
            clearable
            placeholder="검색할 메뉴명 및 메뉴코드를 입력해주세요."
            class="mt-10 flex-1"
            @keydown.enter="onSearchTexts"
          />
          <div>
            <el-button
              type="primary"
              round
              :icon="Search"
              class="ml-10"
              :disabled="searchInputTexts?.length < 1"
              @click="onSearchTexts"
            >
              검색
            </el-button>
            <el-button
              round
              :icon="RefreshRight"
              @click="onReset"
            >
              초기화
            </el-button>
          </div>
        </el-row>
      </el-row>

      <!-- 옵션 탭 -->
      <div v-if="optionsTab === 'option'">
        <el-row class="ml-5">
          <el-checkbox
            label="전체 선택"
            size="large"
            :disabled="listData.originOptions.length < 1"
            :model-value="isAllOptionsChecked"
            @change="onChangeOptionCheckboxAll"
          />
        </el-row>
        <div
          v-loading="isGetOptionsLoading"
          class="options-container"
        >
          <el-row
            v-if="listData.originOptions.length < 1"
            class="no-content"
          >
            옵션이 존재하지 않습니다.
          </el-row>

          <el-scrollbar
            v-else
            height="350px"
          >
            <div
              v-for="(originOption, index) in listData.originOptions"
              :key="`origin-option-${originOption.O_id}-${index}`"
            >
              <div
                v-if="showOptionBySearchResultTexts(originOption)"
                class="option-button"
              >
                <el-checkbox-group
                  v-model="requestFormData.items.option"
                  class="option-checkbox ml-10"
                >
                  <el-checkbox :label="originOption.O_id">
                    {{ originOption.O_id }}
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox
                  v-model="originOption.preset_yn"
                  true-label="Y"
                  false-label="N"
                  :disabled="requestFormData.setting.option_require === 'N'"
                >
                  기본 구성
                </el-checkbox>
                <span class="option-info">
                  {{ originOption.O_name }}
                </span>
                <span class="option-info">
                  {{ originOption.O_price?.toLocaleString() }}원
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
                      v-model="originOption.option_qty"
                      :min="0"
                      class="mr-20"
                      :value-on-clear="0"
                    />
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>

      <!-- 메뉴 탭 -->
      <div v-if="optionsTab === 'goods'">
        <el-row class="ml-5">
          <el-checkbox
            label="전체 선택"
            size="large"
            :disabled="listData.originGoods.length < 1"
            :model-value="isAllGoodsChecked"
            @change="onChangeGoodsCheckboxAll"
          />
        </el-row>
        <div class="options-container">
          <el-row
            v-if="listData.originGoods.length < 1"
            class="no-content"
          >
            메뉴가 존재하지 않습니다.
          </el-row>

          <el-scrollbar
            v-else
            height="350px"
          >
            <div
              v-for="(goods, index) in listData.originGoods"
              :key="`origin-goods-${goods.O_id}-${index}`"
            >
              <div
                v-if="showOptionBySearchResultTexts(goods)"
                class="option-button"
              >
                <el-checkbox-group
                  v-model="requestFormData.items.goods"
                  class="option-checkbox ml-10"
                >
                  <el-checkbox :label="goods.O_id">
                    {{ goods.O_id }}
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox
                  v-model="goods.preset_yn"
                  true-label="Y"
                  false-label="N"
                  :disabled="requestFormData.setting.option_require === 'N'"
                >
                  기본 구성
                </el-checkbox>
                <span class="option-info">
                  {{ goods.O_name }}
                </span>
                <span class="option-info">
                  {{ goods.O_price?.toLocaleString() }}원
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
                      v-model="goods.option_qty"
                      :min="0"
                      class="mr-20"
                      :value-on-clear="0"
                    />
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ADD_NEW_OPTION_GROUP)"
      >
        취소
      </el-button>

      <el-button
        v-loading="isAddOptionGroupLoading"
        class="submit-loading-button"
        type="primary"
        :disabled="!isOptionSelected"
        @click="createOptionCreate"
      >
        생성
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-title {
  font-size: 15px;
  font-weight: bold;
}

.form-description {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #ff6060;
}

.option-minmax-container {
  display: flex;
  gap: 20px;

  > span {
    display: flex;
    align-items: center;
  }
}

.no-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 18px;
  font-weight: bold;
}

.option-button {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
  align-items: center;
  height: 50px;
  padding: 10px;
  margin-bottom: 2px;
  border: 1px solid #d5c7ff;
  border-radius: 5px;

  .option-checkbox {
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-info {
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.submit-loading-button {
  &:deep(.circular) {
    width: 50%;
  }
}

.options-container {
  min-height: 350px;
}
</style>
