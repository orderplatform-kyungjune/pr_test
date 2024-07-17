<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestOrderOneOptionMenuPlatformType,
  requestOrderOneOptionDataPlatformType,
  requestReferenceOptionDataPlatformType,
  requestOrderTwoOptionDataPlatformType,
  requestOrderTwoOptionMenuPlatformType,
} from '@interface/option';
import { IMPORT_OPTION_GROUP } from '@common/string';
import { optionCodec } from '@codecs';
import { option, orderTwoOption } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const props = defineProps<{
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  requestDataList: () => void;
  type: string;
  isStoreApi2: boolean;
}>();

const { flag, closeModal } = useModalStore();

const { requestAllOptionList, requestSaveReferenceOption } = option;

const {
  requestGetOrderTwoOptionGroupList,
  requestOverWriteOrImportOrderTwoOptionGroupList,
} = orderTwoOption;

const { requestReferenceOptionCodec } = optionCodec;

/** 옵션 데이터 */
const optionList: Ref<requestReferenceOptionDataPlatformType[]> = ref(
  [] as requestReferenceOptionDataPlatformType[],
);
const loading: Ref<boolean> = ref(false);

/** 티오더 1 옵션 불러오기 */
const getOrderOneOptionList = async () => {
  loading.value = true;

  try {
    const res = (await requestAllOptionList(
      props.productInfo.storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(requestReferenceOptionCodec, res.data);

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
        optionList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 티오더 2 옵션 불러오기 */
const getOrderTwoOptionList = async () => {
  loading.value = true;

  try {
    const res = (await requestGetOrderTwoOptionGroupList(
      props.productInfo.storeCode,
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
      console.log(res.data.data);
      optionList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const setOrderOneOptionData = (
  item: requestReferenceOptionDataPlatformType,
) => {
  const confirmText =
    props.type === 'remove'
      ? '정말 옵션 그룹을 덮어쓰시겠습니까?'
      : '정말 옵션 그룹을 추가하시겠습니까?';
  const confirmTitle =
    props.type === 'remove' ? '옵션 그룹 덮어쓰기' : '옵션 그룹 추가하기';
  ElMessageBox.confirm(confirmText, confirmTitle, {
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    type: 'warning',
  })
    .then(async () => {
      const requestData = {
        storeCode: props.productInfo.storeCode,
        goodCode: props.productInfo.goodCode,
        posGoodCode: props.productInfo.posGoodCode,
        copyGoodCode: item.goodCode,
        copyPosGoodCode: item.posGoodCode,
        editType: props.type,
      };

      try {
        const res = (await requestSaveReferenceOption(
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
          closeModal(IMPORT_OPTION_GROUP);
          props.requestDataList();
          ElMessage({
            type: 'success',
            message: '성공적으로 옵션을 가져왔습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const setOrderTwoOptionData = (
  item: requestReferenceOptionDataPlatformType,
) => {
  const confirmText =
    props.type === 'remove'
      ? `${item.goodDpName}의 옵션 그룹을 덮어쓰시겠습니까?`
      : `${item.goodDpName}의 옵션 그룹을 추가하시겠습니까?`;
  const confirmTitle =
    props.type === 'remove' ? '옵션 그룹 덮어쓰기' : '옵션 그룹 추가하기';
  ElMessageBox.confirm(confirmText, confirmTitle, {
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    type: 'warning',
  })
    .then(async () => {
      const requestData = {
        storeCode: props.productInfo.storeCode,
        goodCode: props.productInfo.goodCode,
        copyGoodCode: item.goodCode,
        editType: props.type,
      };

      try {
        const res = (await requestOverWriteOrImportOrderTwoOptionGroupList(
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
          closeModal(IMPORT_OPTION_GROUP);
          props.requestDataList();
          ElMessage({
            type: 'success',
            message: '성공적으로 옵션을 가져왔습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const onClickAddOrOverwriteOptionGroupButton = (
  optionGroup: requestReferenceOptionDataPlatformType,
) => {
  if (props.isStoreApi2) {
    setOrderTwoOptionData(optionGroup);
  } else {
    setOrderOneOptionData(optionGroup);
  }
};

// key 방어 코드
const getProductListKey = (
  data: requestReferenceOptionDataPlatformType,
  index: number,
) => (data ? `${data.goodCode} ${index}` : `product ${index}`);
const getOrderOneOptionGroupListKey = (
  data: requestOrderOneOptionDataPlatformType,
  index: number,
) => (data ? `${data.group_num} ${index}` : `product ${index}`);
const getOrderTwoOptionGroupListKey = (
  data: requestOrderTwoOptionDataPlatformType,
  index: number,
) => (data ? `${data.option_group_no} ${index}` : `product ${index}`);
// eslint-disable-next-line vue/max-len
const getItemInfoListKey = (
  data:
    | requestOrderOneOptionMenuPlatformType
    | requestOrderTwoOptionMenuPlatformType,
  index: number,
) => (data ? `${data.platform_store_good_code} ${index}` : `product ${index}`);

const isNoneData = computed(() => optionList.value.length === 0);
const isAddType = (type: string) => type === 'add';
const isSoldOut = (
  target:
    | requestOrderOneOptionMenuPlatformType
    | requestOrderTwoOptionMenuPlatformType,
) => target.platform_store_good_option_isSale === 'Y';
const isStopSale = (
  target:
    | requestOrderOneOptionMenuPlatformType
    | requestOrderTwoOptionMenuPlatformType,
) => target.platform_store_good_option_use === 'N';

if (props.isStoreApi2) {
  getOrderTwoOptionList();
} else {
  getOrderOneOptionList();
}
</script>

<template>
  <el-dialog
    v-model="flag.importOptionGroup"
    align-center
    width="80%"
  >
    <template #header>
      <div v-if="isAddType(type)">
        <span class="mr-10"> 옵션 그룹 추가하기 </span>
      </div>
      <div v-else>
        <span class="mr-10"> 옵션 그룹 덮어쓰기 </span>
      </div>
    </template>
    <div
      v-loading="loading"
      class="dialog-content"
    >
      <div
        v-if="!isNoneData"
        class="option-list-grid"
      >
        <el-scrollbar height="800px">
          <el-card
            v-for="(product, index) in optionList"
            :key="getProductListKey(product, index)"
            class="product-info-card"
          >
            <template #header>
              <el-row
                align="middle"
                justify="space-between"
              >
                <p class="product-info-card-name mr-10">
                  {{ product.goodDpName }}
                </p>
                <el-button
                  v-if="isAddType(type)"
                  type="primary"
                  @click="onClickAddOrOverwriteOptionGroupButton(product)"
                >
                  추가하기
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  @click="onClickAddOrOverwriteOptionGroupButton(product)"
                >
                  덮어쓰기
                </el-button>
              </el-row>
            </template>
            <div class="product-info-card-gird">
              <template v-if="!isStoreApi2">
                <el-card
                  v-for="(
                    group, num
                  ) in product.option as requestOrderOneOptionDataPlatformType[]"
                  :key="getOrderOneOptionGroupListKey(group, num)"
                  class="group-info-card"
                >
                  <template #header>
                    <p class="group-info-card-name mr-10">
                      {{ group.name }}
                    </p>
                  </template>
                  <div class="group-info-card-box">
                    <div
                      v-for="(info, cnt) in group.option_item"
                      :key="getItemInfoListKey(info, cnt)"
                      class="group-info-card-item"
                    >
                      <el-row
                        align="middle"
                        class="mb-5"
                        justify="space-between"
                      >
                        <div class="group-info-card-code mr-5">
                          {{ info.platform_store_good_option_code }}
                        </div>
                        <el-row>
                          <el-tag
                            v-if="isStopSale(info)"
                            class="mr-5"
                            size="small"
                            type="danger"
                          >
                            중지
                          </el-tag>
                          <el-tag
                            v-if="isSoldOut(info)"
                            size="small"
                            type="warning"
                          >
                            품절
                          </el-tag>
                        </el-row>
                      </el-row>
                      <div class="group-info-card-item-grid">
                        <div>
                          {{ info.platform_store_good_option_name }}
                        </div>
                        <div>
                          {{
                            info.platform_store_good_option_price?.toLocaleString()
                          }}
                          원
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </template>
              <template v-else>
                <el-card
                  v-for="(
                    group, num
                  ) in product.option as requestOrderTwoOptionDataPlatformType[]"
                  :key="getOrderTwoOptionGroupListKey(group, num)"
                  class="group-info-card"
                >
                  <template #header>
                    <p class="group-info-card-name mr-10">
                      {{ group.option_group_name }}
                    </p>
                  </template>
                  <div class="group-info-card-box">
                    <div
                      v-for="(info, cnt) in group.item"
                      :key="getItemInfoListKey(info, cnt)"
                      class="group-info-card-item"
                    >
                      <el-row
                        align="middle"
                        class="mb-5"
                        justify="space-between"
                      >
                        <div class="group-info-card-code mr-5">
                          {{ info.platform_store_good_option_code }}
                        </div>
                        <el-row>
                          <el-tag
                            v-if="isStopSale(info)"
                            class="mr-5"
                            size="small"
                            type="danger"
                          >
                            중지
                          </el-tag>
                          <el-tag
                            v-if="isSoldOut(info)"
                            size="small"
                            type="warning"
                          >
                            품절
                          </el-tag>
                        </el-row>
                      </el-row>
                      <div class="group-info-card-item-grid">
                        <div>
                          {{ info.platform_store_good_option_name }}
                        </div>
                        <div>
                          {{
                            info.platform_store_good_option_price?.toLocaleString()
                          }}
                          원
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </template>
            </div>
          </el-card>
        </el-scrollbar>
      </div>
      <div
        v-if="isNoneData && !loading"
        class="none-data-alarm"
      >
        <p>다른 상품의 옵션 그룹이 존재하지 않습니다.</p>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-card.is-always-shadow) {
  box-shadow: none;
}

.option-list-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;

  .product-info-card {
    margin: 4px 0;
    background-color: #fff;

    .product-info-card-name {
      font-size: 20px;
      font-weight: bold;
    }

    .product-info-card-gird {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 30px;

      .group-info-card {
        background-color: #e8e0ff71;

        .group-info-card-name {
          font-size: 14px;
          font-weight: bold;
        }

        .group-info-card-box {
          display: flex;
          flex-direction: column;
          gap: 15px;

          .group-info-card-item {
            display: flex;
            flex-direction: column;

            .group-info-card-code {
              font-size: 12px;
              color: gray;
            }

            .group-info-card-item-grid {
              display: flex;
              justify-content: space-between;
            }
          }
        }
      }
    }
  }
}

.none-data-alarm {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  font-size: 18px;
  font-weight: bold;
}

.dialog-content {
  min-height: 800px;
}
</style>
