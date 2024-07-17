<script setup lang="ts">
import draggable from 'vuedraggable';
import { Ref, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { arrangeOptionGroupListType } from '@interface/option';
import { ARRANGE_ORDER_ONE_OPTION_GROUP } from '@common/string';
import { optionCodec } from '@codecs';
import { option } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const { flag, closeModal } = useModalStore();

const { requestOrderOneOptionGroupList, requestArrangeOptionGroup } = option;

const { arrangeOptionGroupCodec } = optionCodec;

const props = defineProps<{
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  request: () => void;
}>();

const loading: Ref<boolean> = ref(false);

/** 옵션 그룹 리스트 */
const optionGroupList = ref<arrangeOptionGroupListType[]>([]);
/** 옵션 그룹 리스트 불러오기 */
const getOrderOneOptionGroupList = async () => {
  const requestData = {
    storeCode: props.productInfo?.storeCode,
    goodsCode: props.productInfo?.goodCode,
  };

  loading.value = true;
  try {
    const res = (await requestOrderOneOptionGroupList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(arrangeOptionGroupCodec, res.data);

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
        optionGroupList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 옵션 그룹 순서 변경 */
const setSortOptionGroup = async () => {
  const groupIdArray: number[] = [];
  optionGroupList.value.forEach((opt: { id: number; name: string }) => {
    groupIdArray.push(opt.id);
  });
  const requestOptionData = {
    storeCode: props.productInfo.storeCode as string,
    goodsCode: props.productInfo.goodCode,
    group_id_array: groupIdArray,
  };

  try {
    const res = (await requestArrangeOptionGroup(
      requestOptionData,
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
      props.request();
      closeModal(ARRANGE_ORDER_ONE_OPTION_GROUP);
      ElMessage({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

getOrderOneOptionGroupList();
</script>

<template>
  <el-dialog
    v-model="flag.arrangeOrderOneOptionGroup"
    width="38%"
    align-center
  >
    <template #header>
      <span class="arrange-option-modal-header"> 옵션 그룹 순서 변경 </span>
      <span class="font-small essential-star">
        * 상하 드래그로 순서 변경을 할 수 있습니다.
      </span>
    </template>
    <div v-loading="loading">
      <el-scrollbar
        v-if="optionGroupList.length"
        height="600px"
        class="width-100"
      >
        <draggable
          v-model="optionGroupList"
          item-key="id"
          class="arrange-option-group-draggable"
        >
          <template #item="{ element }">
            <div class="arrange-option-group-draggable-box bg-p">
              <p class="arrange-option-group-id">
                {{ element.id + 1 }}
              </p>
              <p class="arrange-option-group-name">
                {{ element.name }}
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
      <span>
        <el-button
          type="danger"
          @click="closeModal(ARRANGE_ORDER_ONE_OPTION_GROUP)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="setSortOptionGroup"
        >
          등록
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.arrange-option-modal-header {
  margin: 10px 0px;
  font-size: 18px;
}

.arrange-option-group-draggable {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .arrange-option-group-draggable-box {
    display: grid;
    grid-template-columns: 1fr 2fr;
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
