<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { responseOptionGroupListType } from '@interface/orderTwoOption';
import {
  requestReferenceOptionDataType,
  requestOrderOneOptionDataType,
} from '@interface/option';
import { DELETE_OPTION_GROUP } from '@common/string';
import { optionCodec, orderTwoOptionCodec } from '@codecs';
import { option, orderTwoOption } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;

const { failAuthenticationAlert } = authentication;

const { requestAllOptionList, requestDeleteOption } = option;

const { requestReferenceOptionCodec } = optionCodec;

const { requestOrderTwoOptionGroupList, requestDeleteOrderTwoOptionGroupList } =
  orderTwoOption;

const { orderTwoOptionGroupListCodec } = orderTwoOptionCodec;

const { flag, closeModal } = useModalStore();

const props = defineProps<{
  productInfo: {
    storeCode: string;
    goodCode: string;
    posGoodCode: string;
  };
  isStoreApi2: boolean;
  requestBasic: () => void;
  requestOption: () => Promise<void>;
  requestOptionMenu: (index: number) => void;
  optionReset: () => void;
}>();

/** 선택한 그룹명 (selectBox) */
const selectedGroupNumber = ref('');

/** 티오더1 옵션 그룹 리스트 가져오기 */
const orderOneOptionGroupList = ref<requestOrderOneOptionDataType[]>([]);
const getOrderOneOptionList = async () => {
  try {
    const res = (await requestAllOptionList(
      props.productInfo.storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(requestReferenceOptionCodec, res.data);

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
        const target = res.data.data.find(
          (optionInfo: requestReferenceOptionDataType) =>
            optionInfo.posGoodCode === props.productInfo.posGoodCode,
        );
        if (target) {
          orderOneOptionGroupList.value = target.option;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더2 옵션 그룹 리스트 불러오기 */
const orderTwoOptionGroupList = ref<responseOptionGroupListType[]>([]);
const postOrderTwoOptionGroupList = async () => {
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
        orderTwoOptionGroupList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더1 옵션 삭제 */
const postDeleteOrderOneOptionGroup = async () => {
  if (selectedGroupNumber.value === '') {
    ElMessage({
      type: 'error',
      message: '삭제할 옵션 그룹을 선택해주세요.',
    });
    return;
  }
  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodCode: props.productInfo.goodCode,
    posGoodCode: props.productInfo.posGoodCode,
    groupId: selectedGroupNumber.value,
  };

  try {
    const res = (await requestDeleteOption(requestData)) as AxiosResponse;

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
        message: '정상적으로 변경되었습니다.',
      });
      props.requestBasic();
      closeModal(DELETE_OPTION_GROUP);
    }
  } catch (error) {
    console.log(error);
  }
};

/** 티오더2 옵션 그룹 삭제 */
const postDeleteOrderTwoOptionGroup = async () => {
  if (selectedGroupNumber.value === '') {
    ElMessage({
      type: 'error',
      message: '삭제할 옵션 그룹을 선택해주세요.',
    });
    return;
  }

  const requestData = {
    storeCode: props.productInfo.storeCode,
    goodCode: props.productInfo.goodCode,
    posGoodCode: props.productInfo.posGoodCode,
    option_group_no: selectedGroupNumber.value,
  };

  try {
    const res = (await requestDeleteOrderTwoOptionGroupList(
      requestData,
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
        message: '정상적으로 변경되었습니다.',
      });

      props.optionReset();
      await props.requestOption();
      props.requestOptionMenu(0);
      closeModal(DELETE_OPTION_GROUP);
    }
  } catch (error) {
    console.log(error);
  }
};

const clickDeleteButton = () => {
  if (props.isStoreApi2) {
    postDeleteOrderTwoOptionGroup();
    return;
  }

  postDeleteOrderOneOptionGroup();
};

// v-for 방어 코드
const getBasicOptionListKey = (
  target: requestOrderOneOptionDataType,
  index: number,
) => (!target ? `basic ${index}` : target.group_num);
const getOptionListKey = (
  target: responseOptionGroupListType,
  index: number,
) => (!target ? `option ${index}` : target.option_group_no);

if (props.isStoreApi2) {
  postOrderTwoOptionGroupList();
} else {
  getOrderOneOptionList();
}
</script>

<template>
  <el-dialog
    v-model="flag.deleteOptionGroup"
    :close-on-click-modal="false"
    width="30%"
    align-center
  >
    <template #header>
      <span class="mr-10"> 옵션 그룹 삭제하기 </span>
    </template>
    <span>삭제할 옵션 그룹 선택</span>
    <el-row class="mt-10">
      <el-select
        v-if="!isStoreApi2"
        v-model="selectedGroupNumber"
        placeholder="옵션 그룹을 선택해주세요."
        class="width-100"
      >
        <el-option
          v-for="(group, index) in orderOneOptionGroupList"
          :key="getBasicOptionListKey(group, index)"
          :label="group.name"
          :value="group.group_num"
        />
      </el-select>
      <el-select
        v-else
        v-model="selectedGroupNumber"
        placeholder="옵션 그룹을 선택해주세요."
        class="width-100"
      >
        <el-option
          v-for="(group, index) in orderTwoOptionGroupList"
          :key="getOptionListKey(group, index)"
          :label="group.option_group_name"
          :value="group.option_group_no"
        />
      </el-select>
    </el-row>

    <template #footer>
      <el-button @click="closeModal(DELETE_OPTION_GROUP)"> 취소 </el-button>
      <el-button
        type="danger"
        @click="clickDeleteButton"
      >
        삭제하기
      </el-button>
    </template>
  </el-dialog>
</template>
