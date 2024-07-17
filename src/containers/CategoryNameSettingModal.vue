<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { requestUpdateCategoryType } from '@interface/category';
import { CHANGE_CATEGORY_NAME } from '@common/string';
import { categoryCodec } from '@codecs';
import { category } from '@apis';

const { responseUpdateCategoryCodec } = categoryCodec;

const { flag, closeModalWithData, modalData } = useModalStore();

const { targetCategoryData, replaceCategoryName } =
  modalData.changeCategoryName;
const { requestV2CategoryInfoUpdate } = category;

const { failAuthenticationAlert } = authentication;
const { runtimeCheck } = runtimeCheckHelper;
const route = useRoute();

const storeCode = route.query.code as string;

const inputCategoryName: Ref<string> = ref(targetCategoryData.name);

const postCategoryInfoUpdate = async () => {
  try {
    const param: requestUpdateCategoryType = {
      storeCode,
      type: targetCategoryData.type,
      categoryCode:
        targetCategoryData.type === 'child'
          ? targetCategoryData.parentCode
          : undefined,
      updateCategoryCode: [targetCategoryData.code],
      updateCategoryName: [inputCategoryName.value],
    };
    const res = (await requestV2CategoryInfoUpdate(param)) as AxiosResponse;
    const typeError = runtimeCheck(responseUpdateCategoryCodec, res.data);

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
        closeModalWithData('changeCategoryName', {});
        ElMessage({
          type: 'success',
          message: '정상적으로 수정되었습니다.',
        });
        replaceCategoryName();
      }
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <el-dialog
    v-model="flag.changeCategoryName"
    width="50%"
    top="20vh"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p type="info">분류명 변경</p>
      </el-row>
    </template>
    <div class="add-all-category-box bg-p">
      <el-row>
        <el-col>
          <el-input
            v-model="inputCategoryName"
            input-style="width: 100%"
          />
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button
        type="danger"
        @click="closeModalWithData(CHANGE_CATEGORY_NAME, {})"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="postCategoryInfoUpdate"
      >
        분류명을 수정합니다.
      </el-button>
    </template>
  </el-dialog>
</template>
