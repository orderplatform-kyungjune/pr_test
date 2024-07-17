<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { h, Ref, ref, watch, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { goodsInCategorizeType, requestGoodsUpdateInCategorizeType } from '@interface/goods';
import { DArrowLeft, Refresh, Top } from '@element-plus/icons-vue';
import { EDIT_ALL_PRODUCT } from '@common/string';
import { goodsCodec } from '@codecs';
import { goods } from '@apis';

const { openModal } = useModalStore();

const { runtimeCheck } = runtimeCheckHelper;

const { failAuthenticationAlert } = authentication;

const route = useRoute();

const { requestMultipleGoodsUpdateInCategorize } = goods;

const { responseGoodsUpdateInCategorizeCodec } = goodsCodec;

const props = defineProps<{
  tabName?: string;
  reloadGoodsList?: (exceptInput?: boolean) => void;
  checkedGoodsList: goodsInCategorizeType[];
  isAllChecked: boolean;
  isIndeterminateAll: boolean;
  isDisableAllCheckbox: boolean;
  changeAllCheck: (value: boolean) => void;
  isStoreApi2?: boolean;
  isCustomTheme?: boolean;
}>();

const checkedAllSelected: Ref<boolean> = ref(props.isAllChecked);

const options = ref([
  {
    label: '',
    options: [
      {
        label: '스티커 제거',
        value: 'clear',
      },
    ],
  },
  {
    label: '',
    options: [
      {
        label: '베스트',
        value: 'best',
      },
      {
        label: '인기',
        value: 'hit',
      },
      {
        label: '추천',
        value: 'md',
      },
      {
        label: '할인',
        value: 'sale',
      },
      {
        label: '신규',
        value: 'new',
      },
    ],
  },
]);
watch(
  () => props.isAllChecked,
  () => {
    checkedAllSelected.value = props.isAllChecked;
  },
);

/** 일괄 판매 상태 변경 */
const chosenSaleStateList: Ref<string[]> = ref([]);

/** 일괄 스티커 변경 */
const chosenStickerList: Ref<string[]> = ref([]);
const chooseStickerOption = (isClearOption?: boolean) => {
  if (isClearOption) {
    chosenStickerList.value = [];
    chosenStickerList.value.push('clear');
  } else {
    const clearIndex = chosenStickerList.value.findIndex(
      (sticker: string) => sticker === 'clear',
    );
    if (clearIndex > -1) {
      chosenStickerList.value.splice(clearIndex, 1);
    }
  }
};

const onChangeStickerOptions = (selectedOption: string[]) => {
  const lastOption = selectedOption[selectedOption.length - 1];

  if (lastOption === 'clear') {
    chooseStickerOption(true);
    return;
  }

  chooseStickerOption();
};

watchEffect(() => {
  if (props.isStoreApi2 && props.isCustomTheme) {
    const filteredOptions = options.value.map((group) => ({
      label: group.label,
      options: group.options.filter(
        (option) =>
          option.value === 'clear' ||
          option.value === 'best' ||
          option.value === 'new',
      ),
    }));

    options.value = filteredOptions;
  }
});

/** 일괄 변경 저장 */
const getSaleState = () => {
  if (chosenSaleStateList.value.includes('sale-Y')) return 'use';
  if (chosenSaleStateList.value.includes('sale-N')) return 'stop';
  if (chosenSaleStateList.value.includes('soldOut')) return 'soldout';
  return '';
};

const getStickerState = (findSticker: string) =>
  chosenStickerList.value.includes(findSticker);

const postMultipleGoodsInCategorize = async () => {
  try {
    const goodsCodeArr = props.checkedGoodsList.map(
      (product) => product.goodCode,
    );
    const data: requestGoodsUpdateInCategorizeType = {
      storeCode: route.query.code as string,
      goodSaleState: getSaleState(),
      goodsCodeArr,
    };

    if (chosenStickerList.value.length > 0) {
      data.goodTypeBest = getStickerState('best') ? 'Y' : 'N';
      data.goodTypeHit = getStickerState('hit') ? 'Y' : 'N';
      data.goodTypeMd = getStickerState('md') ? 'Y' : 'N';
      data.goodTypeSale = getStickerState('sale') ? 'Y' : 'N';
      data.goodTypeNew = getStickerState('new') ? 'Y' : 'N';
    }

    const res = (await requestMultipleGoodsUpdateInCategorize(
      data,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseGoodsUpdateInCategorizeCodec,
      res.data,
    );

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
        ElMessage({
          type: 'success',
          message: '정상적으로 수정되었습니다.',
        });
        props.reloadGoodsList?.(true);
        props.changeAllCheck?.(false);
        chosenSaleStateList.value = [];
        chosenStickerList.value = [];
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const countLockedGoods = (lockType: string) => {
  if (lockType === 'useLock') {
    return props.checkedGoodsList.filter(
      (good: goodsInCategorizeType) => good.useLock === 'Y',
    )?.length;
  }
  if (lockType === 'saleLock') {
    return props.checkedGoodsList.filter(
      (good: goodsInCategorizeType) => good.saleLock === 'Y',
    )?.length;
  }
  return 0;
};

const checkAllowedChange = () => {
  const selectedSaleState = getSaleState();

  if (selectedSaleState === 'use' || selectedSaleState === 'stop') {
    if (countLockedGoods('useLock') > 0) {
      ElMessageBox.alert(
        h('p', { style: 'text-align: center;' }, [
          h(
            'p',
            null,
            `잠금 상품이 ${countLockedGoods('useLock')}개 있습니다.`,
          ),
          h('p', null, '일괄 상품 판매 상태 변경 불가능합니다.'),
        ]),
        '경고',
        {
          confirmButtonText: '확인',
          type: 'error',
        },
      );
      return;
    }
  }

  if (selectedSaleState === 'soldout') {
    if (countLockedGoods('saleLock') > 0) {
      ElMessageBox.alert(
        h('p', { style: 'text-align: center;' }, [
          h(
            'p',
            null,
            `잠금 상품이 ${countLockedGoods('saleLock')}개 있습니다.`,
          ),
          h('p', null, '일괄 상품 품절 변경 불가능합니다.'),
        ]),
        '경고',
        {
          confirmButtonText: '확인',
          type: 'error',
        },
      );
      return;
    }
  }

  ElMessageBox.confirm(
    `선택 상품 ${props.checkedGoodsList?.length}개를\n일괄로 변경 진행하시겠습니까?`,
    '알림',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'info',
    },
  )
    .then(() => {
      postMultipleGoodsInCategorize();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const isOpenLeftFloatingBar: Ref<boolean> = ref(true);

const toggleLeftFloatingBar = () => {
  isOpenLeftFloatingBar.value = !isOpenLeftFloatingBar.value;
};

/** 스크롤 상단 이동 */
const scrollToTop = () => {
  document.getElementById('scrollTop')?.scrollIntoView({ behavior: 'smooth' });
};

const getSelectedGoodsCountWrapStyle = () => ({
  'selected-count-wrap': true,
  'selected-count-wrap-active': props.checkedGoodsList?.length > 0,
});

const getSelectedGoodsCountStyle = () => ({
  'selected-count-box': true,
  'selected-count-none': props.checkedGoodsList?.length === 0,
  'selected-count-active': props.checkedGoodsList?.length > 0,
});

const getLeftExpandButtonStyle = () => ({
  'button-close': isOpenLeftFloatingBar.value,
  'button-open': !isOpenLeftFloatingBar.value,
});

const getLeftSectionStyle = () => ({
  'categorize-floating-bar': true,
  'expand-contents': true,
  'expand-open': isOpenLeftFloatingBar.value,
});
</script>

<template>
  <el-affix
    :offset="20"
    class="left-affix-wrapper mt-10"
    position="bottom"
  >
    <el-row
      v-if="tabName !== 'unregistered'"
      align="middle"
    >
      <el-button
        :class="getLeftExpandButtonStyle()"
        :icon="DArrowLeft"
        circle
        size="large"
        type="info"
        @click="toggleLeftFloatingBar"
      />
      <el-row
        :class="getLeftSectionStyle()"
        justify="space-between"
      >
        <div class="categorize-floating-left">
          <el-tag
            class="all-select-check-box"
            effect="plain"
            type="info"
          >
            <el-checkbox
              v-model="checkedAllSelected"
              :disabled="isDisableAllCheckbox"
              :indeterminate="isIndeterminateAll"
              class="mr-10"
              @change="changeAllCheck"
            >
              전체 <br />선택
            </el-checkbox>
          </el-tag>
          <div class="change-box-in-floating">
            <el-select
              v-model="chosenSaleStateList"
              :disabled="checkedGoodsList.length === 0"
              class="change-box-select"
              placeholder="일괄 판매 상태 변경"
            >
              <el-option
                label="판매 중"
                value="sale-Y"
              />
              <el-option
                label="판매 중지"
                value="sale-N"
              />
              <el-option
                label="품절"
                value="soldOut"
              />
            </el-select>
          </div>
          <div
            v-if="props.tabName !== 'staffCall'"
            class="change-box-in-floating"
          >
            <el-tooltip
              content="일괄 스티커 변경은 프로덕트와 버전 & 테마에 따라 스티커가 적용 되는 것이 다릅니다."
              placement="top"
            >
              <el-select
                v-model="chosenStickerList"
                :disabled="checkedGoodsList.length === 0"
                collapse-tags
                collapse-tags-tooltip
                multiple
                placeholder="일괄 스티커 변경"
                @change="onChangeStickerOptions"
              >
                <el-option-group
                  v-for="group in options"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </el-tooltip>
          </div>
          <el-button
            :dark="true"
            class="change-button"
            color="#000"
            @click="checkAllowedChange"
          >
            수정 저장
          </el-button>
        </div>
      </el-row>
    </el-row>
  </el-affix>
  <el-affix
    :offset="20"
    class="right-affix-wrapper"
    position="bottom"
  >
    <el-row
      class="categorize-floating-bar"
      justify="space-between"
    >
      <div class="categorize-floating-right">
        <el-button
          :icon="Top"
          plain
          type="info"
          @click="scrollToTop"
        />
        <div :class="getSelectedGoodsCountWrapStyle()">
          <p :class="getSelectedGoodsCountStyle()">
            <span>{{ checkedGoodsList?.length }}</span>
          </p>
          <el-button
            :disabled="checkedGoodsList?.length === 0"
            type="danger"
            @click="openModal(EDIT_ALL_PRODUCT)"
          >
            선택 상품 분류 수정
          </el-button>
        </div>
        <el-button
          :icon="Refresh"
          plain
          type="info"
          @click="changeAllCheck(false)"
        />
      </div>
    </el-row>
  </el-affix>
</template>

<style lang="scss" scoped>
.right-affix-wrapper {
  position: absolute;
  right: 0;
}

.left-affix-wrapper {
  position: absolute;
  left: 0;
  display: flex;
}

.categorize-floating-bar {
  gap: 20px;

  .categorize-floating-left {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;

    .all-select-check-box {
      height: 100%;
      padding-right: 10px;
    }

    .change-box-in-floating {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
      padding: 5px 10px 5px 10px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;

      .change-box-select {
        width: 200px;
      }
    }

    .change-button {
      padding: 18px;
    }
  }

  .categorize-floating-right {
    display: flex;
    gap: 10px;
    align-items: center;

    .selected-count-wrap {
      display: flex;
      align-items: center;
      background-color: #fff;
      border: 2px solid #fab6b6;
      border-radius: 6px;

      &.selected-count-wrap-active {
        border: 2px solid #f56c6c;
      }

      &:deep(.el-button) {
        border-radius: 0 3px 3px 0;
      }

      .selected-count-box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
      }

      .selected-count-none {
        color: #fab6b6;
      }

      .selected-count-active {
        color: #f56c6c;
      }
    }
  }
}

.button-close {
  transition: transform 0.5s;
  transform: rotate(0deg);
}

.button-open {
  transition: transform 0.5s;
  transform: rotate(180deg);
}

.expand-contents {
  position: absolute;
  left: 42px;
  display: flex;
  width: 0;
  overflow: hidden;
  transition: width 0.5s;
}

.expand-open {
  width: 625px;
  transition: width 0.5s; /* width 변경에 따른 애니메이션 */
}
</style>
