<script lang="ts" setup>
import draggable from 'vuedraggable';
import { ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { orderTwoOptionGroupDataType } from '@interface/orderTwoOption';
import { ARRANGE_ORDER_TWO_OPTION_GROUP } from '@common/string';
import { orderTwoOption } from '@apis';

const props = defineProps<{
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  requestOption: () => void;
  optionReset: () => void;
}>();

const { failAuthenticationAlert } = authentication;

const { requestOrderTwoOptionGroupList, requestArrangeOrderTwoOptionGroup } =
  orderTwoOption;

const { flag, closeModal } = useModalStore();

const loading: Ref<boolean> = ref(false);

/** 티오더2 옵션 그룹 리스트 (순서대로) 불러오기 */
const optionGroupList: Ref<orderTwoOptionGroupDataType[]> = ref([]);
const postOrderTwoOptionGroupList = async () => {
  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodsCode: props.productInfo.goodCode,
  };

  try {
    loading.value = true;
    const res = (await requestOrderTwoOptionGroupList(
      requestData,
    )) as AxiosResponse;
    loading.value = false;

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
      optionGroupList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 옵션 그룹 순서 변경 */
const postSortOptionGroupList = async () => {
  const groupNumberArray: [string, string][] = [];
  optionGroupList.value?.forEach((groupInfo: orderTwoOptionGroupDataType) => {
    groupNumberArray.push(['', groupInfo.option_group_no]);
  });

  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodsCode: props.productInfo.goodCode,
    option_group_no_array: groupNumberArray,
  };

  try {
    loading.value = true;
    const res = (await requestArrangeOrderTwoOptionGroup(
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
      props.optionReset();
      props.requestOption();
      ElMessage({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
      closeModal(ARRANGE_ORDER_TWO_OPTION_GROUP);
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

postOrderTwoOptionGroupList();
</script>

<template>
  <el-dialog
    v-model="flag.arrangeOrderTwoOptionGroup"
    :close-on-click-modal="false"
    align-center
    width="38%"
  >
    <template #header>
      <span class="arrange-option-modal-header"> 옵션 그룹 순서 변경 </span>
      <span class="font-small essential-star">
        * 상하 드래그로 순서 변경을 할 수 있습니다.
      </span>
    </template>
    <div
      v-loading="loading"
      class="arrange-option-container"
    >
      <el-scrollbar
        v-if="optionGroupList.length"
        class="width-100"
        height="600px"
      >
        <draggable
          v-model="optionGroupList"
          class="arrange-option-group-draggable"
          item-key="option_group_no"
        >
          <template #item="{ element }">
            <div class="arrange-option-group-draggable-box bg-p">
              <p class="arrange-option-group-id">
                {{ element.option_sort_number }}
              </p>
              <p class="arrange-option-group-name">
                {{ element.option_group_name }}
              </p>
            </div>
          </template>
        </draggable>
      </el-scrollbar>
      <el-row
        v-else
        class="none-data-alarm"
      >
        옵션 그룹이 존재하지 않습니다.
      </el-row>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ARRANGE_ORDER_TWO_OPTION_GROUP)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="postSortOptionGroupList"
      >
        순서 적용
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.arrange-option-modal-header {
  margin: 10px 0;
  font-size: 18px;
}

.arrange-option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.arrange-option-group-draggable {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  cursor: pointer;

  .arrange-option-group-draggable-box {
    display: grid;
    grid-template-columns: 0.5fr 2fr;
    gap: 20px;
    text-align: center;

    .arrange-option-group-id {
      font-size: 15px;
    }

    .arrange-option-group-name {
      font-size: 18px;
    }
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
</style>
