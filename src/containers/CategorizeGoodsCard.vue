<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, h, Ref, ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils } from '@utils';
import useTagsStore from '@store/storeTags';
import {
  goodsDetailSettingInCategory,
  goodsDetailSettingInCategoryV2,
} from '@router/routePaths';
import { goodsInCategorizeType, updateProductType } from '@interface/goods';
import {
  LocationFilled,
  Lock,
  MoreFilled,
  Unlock,
  ZoomIn,
} from '@element-plus/icons-vue';
import { goods } from '@apis';

const { failAuthenticationAlert, isUPLUSAdmin } = authentication;

const { requestUpdateProduct, requestChangeProductImage } = goods;

const { convertToEllipsis } = etcUtils;

const props = defineProps<{
  isStoreApi2?: boolean;
  isCustomTheme?: boolean;
  itemInfo: goodsInCategorizeType;
  checked: boolean;
  checkGoodsItem: (good: goodsInCategorizeType) => void;
  reloadGoodsList: (exceptInput?: boolean) => void;
  tabName?: string;
}>();

const route = useRoute();
const tagStore = useTagsStore();
const { addTagsData } = tagStore;

const storeCode = route.query.code as string;

const isUnregisteredTab = props.tabName === 'unregistered';

const checkedCard: Ref<boolean> = ref(props.checked);

const inputDpName: Ref<string> = ref(props.itemInfo.goodDpName);
const checkUse: Ref<string> = ref(props.itemInfo.goodUse);
const checkSale: Ref<string> = ref(props.itemInfo.goodSale);
const checkKitchen: Ref<string> = ref(props.itemInfo.goodKitchen);
const checkSaleLock: Ref<string> = ref(props.itemInfo.saleLock);
const checkUseLock: Ref<string> = ref(props.itemInfo.useLock);
const checkImageLock: Ref<string> = ref(props.itemInfo.imageLock);

const isGoodPosStop = (state: string) => state === 'Y';
const isGoodPosStopOrImageLock = computed(
  () =>
    props.itemInfo.goodPosStopUse === 'Y' || props.itemInfo.imageLock === 'Y',
);

const previewImageState = ref(false);
const previewImage = ref('');

watchEffect(() => {
  // 상위 컴포넌트에서 변경된 값 반영
  checkedCard.value = props.checked;
  checkUse.value = props.itemInfo.goodUse;
  checkSale.value = props.itemInfo.goodSale;
  checkKitchen.value = props.itemInfo.goodKitchen;
  checkUseLock.value = props.itemInfo.useLock;
  checkSaleLock.value = props.itemInfo.saleLock;
  checkImageLock.value = props.itemInfo.imageLock;

  // 검색결과 변경 후에도 input value 남아있는 버그로 인해 동적으로 변경
  inputDpName.value = props.itemInfo.goodDpName;
});

const openPreviewImage = (url: string) => {
  if (!url) {
    ElMessage({
      type: 'error',
      message: '이미지가 없습니다.',
    });
    return;
  }
  previewImage.value = url;
  previewImageState.value = true;
};

/** 이미지 변경하기 */
const changeProductImage = async (
  response: any,
  itemData: goodsInCategorizeType,
) => {
  const requestUpdateImageData = {
    storeCode,
    goodCode: itemData.goodCode,
    posGoodCode: itemData.posGoodCode,
    goodImage: response.raw,
  };

  try {
    ElMessage.info('이미지 변경 중 입니다.');
    const res = (await requestChangeProductImage(
      requestUpdateImageData,
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
      if (props.reloadGoodsList) props.reloadGoodsList(true);
      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const postGoodsInfoUpdate = async (requestData: updateProductType) => {
  try {
    const res = (await requestUpdateProduct(requestData)) as AxiosResponse;

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
      if (props.reloadGoodsList) props.reloadGoodsList(true);
      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 단일 항목 수정 */
const saveOneData = (dataName: 'dpName' | 'state') => {
  let requestData;

  if (dataName === 'dpName') {
    requestData = {
      storeCode,
      goodCode: props.itemInfo.goodCode as string,
      posGoodCode: props.itemInfo.posGoodCode as string,
      goodDpName: inputDpName.value,
    };
  } else {
    requestData = {
      storeCode,
      goodCode: props.itemInfo.goodCode as string,
      posGoodCode: props.itemInfo.posGoodCode as string,
      goodUse: checkUse.value,
      goodSale: checkSale.value,
    };
  }

  postGoodsInfoUpdate(requestData);
};

/** 단일 상품 전체 항목 수정 */
const setChangeProduct = (target: goodsInCategorizeType) => {
  const requestData = {
    storeCode,
    goodCode: target.goodCode as string,
    posGoodCode: target.posGoodCode as string,
    goodDpName: inputDpName.value,
    goodUse: checkUse.value,
    goodSale: checkSale.value,
    goodKitchen: checkKitchen.value,
    saleLock: checkSaleLock.value,
    useLock: checkUseLock.value,
    imageLock: checkImageLock.value,
  };
  ElMessageBox.confirm('정말로 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      postGoodsInfoUpdate(requestData);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const isOn = (status: string) => status === 'Y';
const isProductLockedAll = ref(
  isOn(checkSaleLock.value) &&
    isOn(checkUseLock.value) &&
    isOn(checkImageLock.value),
);
const isProductLocked = computed(
  () =>
    isOn(props.itemInfo.saleLock) ||
    isOn(props.itemInfo.useLock) ||
    isOn(props.itemInfo.imageLock),
);

const isOpenLockStatusDialog = ref<boolean>(false);

const openImageLockPopup = () => {
  if (isOn(props.itemInfo.imageLock)) {
    const messageText =
      '잠금 처리된 상품입니다.<br>이미지 변경이 불가합니다.<br><br>잠금 처리를 열림(해지)로 선택하면,<br>이미지 변경이 가능합니다.';
    ElMessageBox.alert(messageText, '경고', {
      confirmButtonText: '확인',
      type: 'error',
      dangerouslyUseHTMLString: true,
      center: true,
    });
  }
};

const openUseLockPopup = () => {
  if (isOn(props.itemInfo.useLock)) {
    const messageText =
      '잠금 처리된 상품입니다.<br>판매 상태 변경이 불가합니다.<br><br>잠금 처리를 열림(해지)로 선택하면,<br>판매 상태 변경이 가능합니다.';
    ElMessageBox.alert(messageText, '경고', {
      confirmButtonText: '확인',
      type: 'error',
      dangerouslyUseHTMLString: true,
      center: true,
    });
  }
};

const openUseSalePopup = () => {
  if (isOn(props.itemInfo.saleLock)) {
    const messageText =
      '잠금 처리된 상품입니다.<br>품절 상태 변경이 불가합니다.<br><br>잠금 처리를 열림(해지)로 선택하면,<br>품절 상태 변경이 가능합니다.';
    ElMessageBox.alert(messageText, '경고', {
      confirmButtonText: '확인',
      type: 'error',
      dangerouslyUseHTMLString: true,
      center: true,
    });
  }
};

const unlockProduct = () => {
  const requestData = {
    storeCode,
    goodCode: props.itemInfo.goodCode as string,
    posGoodCode: props.itemInfo.posGoodCode as string,
    saleLock: 'N',
    useLock: 'N',
    imageLock: 'N',
  };

  ElMessageBox.confirm('잠금 상태를 해제하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      await postGoodsInfoUpdate(requestData);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const openLockStatusDialog = () => {
  isProductLockedAll.value =
    isOn(checkSaleLock.value) &&
    isOn(checkUseLock.value) &&
    isOn(checkImageLock.value);
  isOpenLockStatusDialog.value = true;
};

const closeLockStatusDialog = () => {
  isOpenLockStatusDialog.value = false;
};

const resetLockStatusAndCloseDialog = () => {
  isProductLockedAll.value = isProductLocked.value;

  checkSaleLock.value = props.itemInfo.saleLock;
  checkUseLock.value = props.itemInfo.useLock;
  checkImageLock.value = props.itemInfo.imageLock;
  closeLockStatusDialog();
};

const checkLockStatus = async (lockType: string) => {
  if (
    lockType === 'useLock' &&
    isOn(checkUseLock.value) &&
    isOn(checkUse.value)
  ) {
    ElMessageBox.confirm(
      h('p', null, [
        h('p', null, '선택한 상품이 판매 중지로 되어있습니다.'),
        h('p', null, '판매 중지 해지 버튼을 선택하면, 해지 처리가 됩니다.'),
        h('p', null, '진행하시겠습니까?'),
      ]),
      '경고',
      {
        confirmButtonText: '판매중지 해지',
        cancelButtonText: '판매중지 유지',
        type: 'warning',
      },
    ).then(() => {
      checkUse.value = 'N';
    });
  }

  if (
    lockType === 'saleLock' &&
    isOn(checkSaleLock.value) &&
    isOn(checkSale.value)
  ) {
    ElMessageBox.confirm(
      h('p', null, [
        h('p', null, '선택한 상품이 품절로 되어있습니다.'),
        h('p', null, '품절 해지 버튼을 선택하면, 해지 처리가 됩니다.'),
        h('p', null, '진행하시겠습니까?'),
      ]),
      '경고',
      {
        confirmButtonText: '품절 해지',
        cancelButtonText: '품절 유지',
        type: 'warning',
      },
    ).then(() => {
      checkSale.value = 'N';
    });
  }

  isProductLockedAll.value =
    isOn(checkSaleLock.value) &&
    isOn(checkUseLock.value) &&
    isOn(checkImageLock.value);
};

const changeAllCheckBox = async (status: boolean) => {
  if (status) {
    checkSaleLock.value = 'Y';
    checkUseLock.value = 'Y';
    checkImageLock.value = 'Y';
  } else {
    checkSaleLock.value = 'N';
    checkUseLock.value = 'N';
    checkImageLock.value = 'N';
  }

  await checkLockStatus('saleLock');
  await checkLockStatus('useLock');
};

const setLockStatusAndCloseDialog = async () => {
  const requestData = {
    storeCode,
    goodCode: props.itemInfo.goodCode as string,
    posGoodCode: props.itemInfo.posGoodCode as string,
    saleLock: checkSaleLock.value,
    useLock: checkUseLock.value,
    imageLock: checkImageLock.value,
    goodUse: checkUse.value,
    goodSale: checkSale.value,
  };

  ElMessageBox.confirm('잠금 상태를 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      await postGoodsInfoUpdate(requestData);
      closeLockStatusDialog();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
      resetLockStatusAndCloseDialog();
    });
};

const addTagProductDetail = () => {
  // 현재 분류설정(구)의 접근은 제한되었으나 복구할 경우를 대비하여 남겨둠
  // 분류설정(구)로 접근 시 상품상세(구)로 이동
  const path =
    route.name === 'categorizeManageTablet'
      ? goodsDetailSettingInCategory
      : goodsDetailSettingInCategoryV2;
  addTagsData({
    name:
      route.name === 'categorizeManageTablet' ? '상품 상세(구)' : '상품 상세',
    path,
    query: {
      code: route.query.code,
      name: route.query.name,
      posGoodCode: props.itemInfo.posGoodCode,
    },
  });
};

const getDetailedDescription = (goodDetailOpen: string) =>
  goodDetailOpen === 'Y' ? '설명 보임' : '설명 숨김';
const getOptionSettings = (goodsOptionUse: string) =>
  goodsOptionUse === 'Y' ? '옵션 사용' : '옵션 미사용';

/** v-for key 방어 코드 */
const getGoodTypeKey = (goodType: string, index: number) =>
  goodType ? `goods-type-${goodType}-${index}` : `goods-type-${index}`;
const getCategoryItemTagKey = (categoryName: string, index: number) =>
  categoryName
    ? `goods-category-item-${categoryName}-${index}`
    : `goods-category-item-${index}`;

const getGoodStickerTagStyle = (goodTypeNameList: string[]) => ({
  'good-sticker-tag-wrapper': true,
  'good-sticker-not-more-than-two': goodTypeNameList.length < 3,
});

const filteredGoodTypes: Ref<string[]> = ref([]);
watchEffect(() => {
  if (props.isStoreApi2 && props.isCustomTheme) {
    filteredGoodTypes.value = props.itemInfo.goodTypeName.filter(
      (goodType) => goodType === '베스트' || goodType === '신규',
    );
    return;
  }

  filteredGoodTypes.value = props.itemInfo.goodTypeName;
});
</script>

<template>
  <!-- 이미지 미리보기 dialog -->
  <el-dialog
    v-model="previewImageState"
    width="30%"
  >
    <el-row
      align="middle"
      justify="center"
    >
      <el-image
        :src="previewImage"
        fit="contain"
      />
    </el-row>
  </el-dialog>
  <!-- 상품 카드 -->
  <el-card
    class="goods-detail-card-box"
    shadow="never"
  >
    <div
      v-if="isGoodPosStop(itemInfo.goodPosStopUse as string)"
      class="goods-pos-stop"
    >
      포스에서 삭제된 상품입니다.
    </div>
    <el-row
      align="middle"
      justify="space-between"
    >
      <el-checkbox
        v-model="checkedCard"
        @change="checkGoodsItem(itemInfo)"
      />
      <div v-if="!isUnregisteredTab">
        <el-tag
          v-if="itemInfo.nonShowCart === 'Y'"
          class="mr-5"
          type="info"
        >
          주문서 표기 안함
        </el-tag>
        <el-tag v-if="itemInfo.goodUse === 'N' && itemInfo.goodSale === 'N'">
          판매중
        </el-tag>
        <el-tag
          v-if="itemInfo.goodUse === 'Y' && itemInfo.goodSale === 'N'"
          type="danger"
        >
          판매중지 (숨김)
        </el-tag>
        <el-tag
          v-if="itemInfo.goodUse === 'N' && itemInfo.goodSale === 'Y'"
          type="warning"
        >
          품절 (보임)
        </el-tag>
        <el-tag
          v-if="itemInfo.goodUse === 'Y' && itemInfo.goodSale === 'Y'"
          type="warning"
        >
          품절 (숨김)
        </el-tag>
      </div>
    </el-row>
    <el-row
      class="mb-10"
      justify="center"
    >
      <el-icon
        v-if="itemInfo.goodImage"
        :size="20"
        class="image-button-wrapper"
        @click="openPreviewImage(itemInfo.goodImage)"
      >
        <ZoomIn />
      </el-icon>
      <el-upload
        :auto-upload="false"
        :disabled="isGoodPosStopOrImageLock"
        :on-change="(response: any) => changeProductImage(response, itemInfo)"
        :show-file-list="false"
        class="categorize-manage-tablet-upload"
        drag
        @click="openImageLockPopup"
      >
        <div
          v-if="itemInfo.goodImage"
          class="categorize-manage-tablet-box"
        >
          <el-image
            :src="itemInfo.goodImage"
            class="categorize-manage-tablet-image"
            loading="lazy"
          />
        </div>
        <div
          v-else
          class="categorize-manage-tablet-empty"
        >
          <el-empty description="이미지가 없습니다." />
        </div>
      </el-upload>
      <div
        v-if="isOn(itemInfo.imageLock)"
        @contextmenu.prevent
      >
        <el-row class="image-lock-text width-100"> 이미지 변경 불가</el-row>
      </div>
    </el-row>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-col
        :span="8"
        class="mr-10"
      >
        <el-text> ㆍ태블릿 상품명</el-text>
      </el-col>
      <el-col :span="14">
        <el-row
          align="middle"
          class="width-100"
        >
          <el-input
            v-model="inputDpName"
            class="input-text flex-1"
          />
          <el-button
            circle
            class="ml-5"
            size="small"
            type="info"
            @click="saveOneData('dpName')"
          >
            <img
              alt="태블릿 상품명 저장"
              class="one-save-button-img"
              src="@assets/floppy-disk-save.svg"
            />
          </el-button>
        </el-row>
      </el-col>
    </el-row>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-col
        :span="8"
        class="mr-10"
      >
        <el-text> ㆍ포스 상품명</el-text>
      </el-col>
      <el-col
        :span="15"
        class="text-align font-thin"
      >
        <el-text>
          {{ itemInfo.goodName }}
        </el-text>
      </el-col>
    </el-row>
    <el-row
      align="middle"
      class="category-info"
      justify="space-between"
    >
      <el-col
        :span="8"
        class="mr-10"
      >
        <el-text> ㆍ분류 정보</el-text>
        <el-text
          v-if="itemInfo.goodCategoryName?.length > 0"
          class="category-font"
        >
          ({{ itemInfo.goodCategoryName?.length }})
        </el-text>
      </el-col>
      <el-col
        v-if="itemInfo.goodCategoryName?.length > 0"
        :span="15"
      >
        <div
          v-if="itemInfo.goodCategoryName?.length > 2"
          class="category-tag-container"
        >
          <el-popover
            :width="250"
            placement="top-start"
            trigger="hover"
          >
            <template #reference>
              <el-row>
                <div class="tooltip-tag-wrapper">
                  <el-tag
                    v-for="(
                      categoryItem, categoryIndex
                    ) in itemInfo.goodCategoryList?.slice(0, 2)"
                    :key="
                      getCategoryItemTagKey(
                        categoryItem.childCategoryName,
                        categoryIndex,
                      )
                    "
                    class="category-more-tag"
                    effect="plain"
                    round
                  >
                    {{ convertToEllipsis(categoryItem.categoryName, 8) }} >
                    {{ convertToEllipsis(categoryItem.childCategoryName, 8) }}
                    <el-icon
                      v-if="categoryItem.top === 'Y'"
                      color="#FF0000"
                    >
                      <LocationFilled />
                    </el-icon>
                  </el-tag>
                </div>
                <el-icon class="more-icon more-name">
                  <MoreFilled />
                </el-icon>
              </el-row>
            </template>
            <el-row
              align="middle"
              class="category-tag-wrapper"
              justify="center"
            >
              <el-tag
                v-for="(
                  categoryItem, categoryIndex
                ) in itemInfo.goodCategoryList?.slice(2)"
                :key="
                  getCategoryItemTagKey(
                    categoryItem.childCategoryName,
                    categoryIndex,
                  )
                "
                class="category-tag"
                effect="plain"
                round
              >
                {{ convertToEllipsis(categoryItem.categoryName, 8) }} >
                {{ convertToEllipsis(categoryItem.childCategoryName, 8) }}
                <el-icon
                  v-if="categoryItem.top === 'Y'"
                  color="#FF0000"
                >
                  <LocationFilled />
                </el-icon>
              </el-tag>
            </el-row>
          </el-popover>
        </div>
        <div
          v-else
          class="category-info-wrapper"
        >
          <el-tag
            v-for="(categoryItem, categoryIndex) in itemInfo.goodCategoryList"
            :key="
              getCategoryItemTagKey(
                categoryItem.childCategoryName,
                categoryIndex,
              )
            "
            class="category-tag"
            effect="plain"
            round
          >
            {{ convertToEllipsis(categoryItem.categoryName, 8) }} >
            {{ convertToEllipsis(categoryItem.childCategoryName, 8) }}
            <el-icon
              v-if="categoryItem.top === 'Y'"
              color="#FF0000"
            >
              <LocationFilled />
            </el-icon>
          </el-tag>
        </div>
      </el-col>
      <el-col
        v-else
        :span="15"
      >
        <div class="text-align">-</div>
      </el-col>
    </el-row>
    <el-divider border-style="dashed" />
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-col :span="8">
        <el-text> ㆍ포스 상품 가격</el-text>
      </el-col>
      <el-col
        :span="14"
        class="text-align"
      >
        {{ itemInfo.goodPrice?.toLocaleString() }}
      </el-col>
    </el-row>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-col :span="8">
        <el-text> ㆍ포스 상품 코드</el-text>
      </el-col>
      <el-col
        :span="14"
        class="text-align"
      >
        {{ itemInfo.goodCode }}
        <el-tag
          v-if="itemInfo.goodCode === '99999'"
          class="ml-5"
          effect="dark"
          round
          type="danger"
        >
          직원만 호출
        </el-tag>
      </el-col>
    </el-row>
    <el-divider border-style="dashed" />
    <el-row
      align="middle"
      class="mb-10 good-sticker"
      justify="space-between"
    >
      <el-col :span="8">
        <el-text> ㆍ상품 스티커</el-text>
        <el-text
          v-if="filteredGoodTypes?.length > 0"
          class="good-sticker-font"
        >
          ({{ filteredGoodTypes?.length }})
        </el-text>
      </el-col>
      <el-col
        v-if="filteredGoodTypes?.length > 0"
        :span="16"
      >
        <div v-if="filteredGoodTypes?.length > 2">
          <el-popover
            :width="250"
            placement="top-start"
            trigger="hover"
          >
            <template #reference>
              <el-row justify="end">
                <el-row
                  class="good-sticker-tag-wrapper"
                  justify="end"
                >
                  <el-tag
                    v-for="(
                      goodType, goodTypeIndex
                    ) in filteredGoodTypes?.slice(0, 2)"
                    :key="getGoodTypeKey(goodType, goodTypeIndex)"
                    class="good-sticker-tag"
                    effect="plain"
                    round
                    type="warning"
                  >
                    {{ goodType }}
                  </el-tag>
                </el-row>
                <el-icon class="more-icon more-sticker">
                  <MoreFilled />
                </el-icon>
              </el-row>
            </template>
            <el-row
              align="middle"
              class="good-sticker-tag-wrapper"
              justify="center"
            >
              <el-tag
                v-for="(goodType, goodTypeIndex) in filteredGoodTypes?.slice(2)"
                :key="getGoodTypeKey(goodType, goodTypeIndex)"
                class="good-sticker-tag"
                effect="plain"
                round
                type="warning"
              >
                {{ goodType }}
              </el-tag>
            </el-row>
          </el-popover>
        </div>
        <div
          v-else
          :class="getGoodStickerTagStyle(filteredGoodTypes)"
        >
          <el-tag
            v-for="(goodType, goodTypeIndex) in filteredGoodTypes"
            :key="getGoodTypeKey(goodType, goodTypeIndex)"
            class="good-sticker-tag"
            effect="plain"
            round
            type="warning"
          >
            {{ goodType }}
          </el-tag>
        </div>
      </el-col>
      <el-col
        v-else
        :span="15"
      >
        <div class="text-align">-</div>
      </el-col>
    </el-row>
    <el-row
      align="middle"
      class="mb-10"
    >
      <el-col
        :span="8"
        class="mr-20"
      >
        <el-text> ㆍ옵션 사용 여부</el-text>
      </el-col>
      <el-col
        :span="14"
        class="text-align"
      >
        {{ getOptionSettings(itemInfo.goodsOptionUse) }}
      </el-col>
    </el-row>
    <el-row
      align="middle"
      class="mb-10"
    >
      <el-col
        :span="8"
        class="mr-20"
      >
        <el-text> ㆍ상세 설명</el-text>
      </el-col>
      <el-col
        :span="14"
        class="text-align"
      >
        {{ getDetailedDescription(itemInfo.goodDetailOpen) }}
      </el-col>
    </el-row>
    <el-divider border-style="dashed" />
    <el-row
      align="middle"
      class="good-status-row"
      justify="space-around"
    >
      <el-checkbox
        v-model="checkUse"
        :disabled="isOn(itemInfo.useLock)"
        false-label="N"
        label="판매중지"
        size="large"
        true-label="Y"
        @click="openUseLockPopup"
      />
      <el-checkbox
        v-model="checkSale"
        :disabled="isOn(itemInfo.saleLock)"
        false-label="N"
        label="품절"
        size="large"
        true-label="Y"
        @click="openUseSalePopup"
      />
      <el-button
        circle
        class="ml-5"
        size="small"
        type="info"
        @click="saveOneData('state')"
      >
        <img
          alt="판매상태 즉시 저장"
          class="one-save-button-img"
          src="@assets/floppy-disk-save.svg"
        />
      </el-button>
    </el-row>
    <!-- 현재 분류설정(구)의 접근은 제한되었으나 복구할 경우를 대비하여 남겨둠 -->
    <!-- 분류설정(구)로 접근 시 잠금기능 제한 -->
    <el-divider
      v-if="route.name !== 'categorizeManageTablet'"
      border-style="dashed"
    />
    <div
      v-if="route.name !== 'categorizeManageTablet' && !isUPLUSAdmin()"
      class="mb-20 lock-status-wrapper"
    >
      <el-col :span="8">
        <el-text class="lock-status-title"> ㆍ잠금 처리</el-text>
      </el-col>
      <div class="lock-status">
        <el-button
          :plain="isProductLocked"
          :type="isProductLocked ? 'info' : 'primary'"
          @click="unlockProduct"
        >
          <el-icon>
            <Unlock />
          </el-icon>
          열림
        </el-button>
        <el-button
          :plain="!isProductLocked"
          :type="isProductLocked ? 'danger' : 'info'"
          @click="openLockStatusDialog"
        >
          <el-icon>
            <Lock />
          </el-icon>
          잠김
        </el-button>
      </div>
      <el-dialog
        v-model="isOpenLockStatusDialog"
        title="잠금 처리"
        width="30%"
      >
        <el-row>
          <el-col>
            <el-checkbox
              v-model="isProductLockedAll"
              @change="changeAllCheckBox"
            >
              전체 기능 선택
            </el-checkbox>
          </el-col>
          <el-col class="mt-10">
            <el-card
              class="box-card"
              shadow="never"
            >
              <template #header>
                <div>
                  <span>판매 상태 잠금 기능</span>
                </div>
              </template>
              <el-row>
                <el-col>
                  <el-checkbox
                    v-model="checkUseLock"
                    false-label="N"
                    label="[판매 중지] 로 변경 불가"
                    true-label="Y"
                    @change="checkLockStatus('useLock')"
                  />
                </el-col>
                <el-col>
                  <el-checkbox
                    v-model="checkSaleLock"
                    false-label="N"
                    label="[품절] 로 변경 불가"
                    true-label="Y"
                    @change="checkLockStatus('saleLock')"
                  />
                </el-col>
              </el-row>
            </el-card>
          </el-col>
          <el-col class="mt-10">
            <el-card
              class="box-card"
              shadow="never"
            >
              <template #header>
                <div>
                  <span>이미지 잠금 기능</span>
                </div>
              </template>
              <div>
                <div>
                  <el-checkbox
                    v-model="checkImageLock"
                    false-label="N"
                    label="이미지 변경 불가"
                    true-label="Y"
                    @change="checkLockStatus('imageLock')"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="resetLockStatusAndCloseDialog"> 취소 </el-button>
            <el-button
              type="primary"
              @click="setLockStatusAndCloseDialog"
            >
              즉시 변경
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <el-row
      :gutter="20"
      justify="center"
    >
      <el-col :span="12">
        <router-link
          :to="{
            path:
              route.name === 'categorizeManageTablet'
                ? goodsDetailSettingInCategory
                : goodsDetailSettingInCategoryV2,
            query: {
              code: route.query.code,
              name: route.query.name,
              posGoodCode: itemInfo.posGoodCode,
            },
          }"
          class="mr-10"
        >
          <el-button
            class="width-100 mr-10"
            size="large"
            type="info"
            @click="addTagProductDetail"
          >
            상품 상세
          </el-button>
        </router-link>
      </el-col>
      <el-col :span="12">
        <el-button
          class="width-100"
          size="large"
          type="info"
          @click="setChangeProduct(itemInfo)"
        >
          즉시 변경
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
.more-icon {
  padding: 5px 3px;
  -ms-transform: rotate(90deg); /* IE 9 */
  -webkit-transform: rotate(90deg); /* Chrome, Safari, Opera */
  transform: rotate(90deg);
}

.more-name {
  filter: invert(55%) sepia(32%) saturate(3308%) hue-rotate(190deg)
    brightness(101%) contrast(105%);
}

.more-sticker {
  filter: invert(81%) sepia(65%) saturate(1118%) hue-rotate(326deg)
    brightness(92%) contrast(95%);
}

.good-sticker {
  height: 24px;
}

.category-info {
  height: 52px;
}

.good-sticker-tag-wrapper {
  display: flex;
  gap: 4px;
  justify-content: end;
}

.good-sticker-not-more-than-two {
  justify-content: center;
}

.category-tag-container {
  display: flex;
  gap: 4px;
  justify-content: end;

  &:deep(.el-row) {
    flex-wrap: nowrap;
  }

  .tooltip-tag-wrapper {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 3px;
    justify-content: space-between;
    min-width: 175px;
  }
}

.category-tag-wrapper {
  gap: 4px;
}

.category-tag {
  min-width: 200px;
}

.category-more-tag {
  max-width: 190px;
}

.good-sticker-tag {
  min-width: 80px;
}

.category-font {
  color: #007cf8;
}

.good-sticker-font {
  color: #e6a23c;
}

.store-situation-status {
  &:deep(.el-checkbox) {
    margin-right: 15px;
  }
}

.sales-status {
  &:deep(.el-checkbox) {
    margin-right: 18px;
  }
}

.input-text {
  &:deep(.el-input__inner) {
    font-size: 15px;
    text-align: center;
  }
}

.lock-status-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .lock-status-title {
    width: 25%;
  }

  .lock-status {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 75%;

    .el-button {
      &:deep(span) {
        display: flex;
        gap: 5px;
      }
    }
  }
}

.text-align {
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: end;
}

.image-button-wrapper {
  position: absolute;
  right: 0;
  z-index: 10;
  padding: 9px 20px;
  cursor: pointer;
  border: 1px solid #aeb0b3;
  border-radius: 4px;

  &:hover {
    border-color: #000;
  }
}

.image-lock-text {
  position: absolute;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  height: 43px;
  color: #fff;
  background-color: #b3e19d;
}

:deep(.el-divider--horizontal) {
  margin: 8px 0;
}

.goods-detail-category {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .goods-detail-category-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-bottom: 10px;
    overflow: auto;
  }
}

.goods-detail-card-box {
  position: relative;
  width: 380px;

  &:deep(.el-card__body) {
    padding: 17px;
  }
}

.goods-pos-stop {
  position: absolute;
  top: 9px;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 382px;
  height: 322px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.5);
  transform: translate(-20px, 40px);
}

.categorize-manage-tablet-upload {
  position: relative;
  box-sizing: border-box;
  width: 100%;

  .categorize-manage-tablet-empty {
    width: 320px;
    height: 240px;

    &:deep(.el-empty) {
      padding: 0px;
    }
  }

  .categorize-manage-tablet-box {
    position: relative;
    width: 320px;
    height: 240px;

    .categorize-manage-tablet-image {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }

    .categorize-manage-tablet-watermark {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('@assets/torder_logo_watermark.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    }
  }
}

.good-status-row {
  &:deep(.el-radio) {
    margin-right: 20px;
  }
}

.one-save-button-img {
  width: 12px;
}
</style>
