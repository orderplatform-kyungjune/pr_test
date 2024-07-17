<script setup lang="ts">
import { Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import useCategoryStore from '@store/storeCategory';
import {
  settingCategoryPropsType,
  settingCategoryType,
} from '@interface/category';
import { SETTING_CATEGORY } from '@common/string';
import { category } from '@apis';

const { failAuthenticationAlert } = authentication;

const props = defineProps<{
  data: settingCategoryPropsType | settingCategoryType;
  storeName?: string;
  setResetData?: () => void;
}>();

const { flag, closeModal } = useModalStore();

const { getCategoryList } = useCategoryStore();

const { requestDeleteCategory, requestEditCategory } = category;

const settingData: Ref<settingCategoryPropsType> = ref(
  props.data as settingCategoryPropsType,
);

// 수정하기
const setEditCategory = () => {
  ElMessageBox.confirm('정말로 수정하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestEditCategory(
          settingData.value,
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
          closeModal(SETTING_CATEGORY);
          await getCategoryList();
          ElMessage({
            type: 'success',
            message: '정상적으로 수정되었습니다.',
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

// 삭제 요청 함수
const postDeleteFunction = async () => {
  try {
    const { storeCode } = settingData.value;
    const { updateCategoryCode } = settingData.value;

    const deleteInfo = {
      storeCode,
      categoryCode: '',
    };

    if (updateCategoryCode) {
      deleteInfo.categoryCode = updateCategoryCode[0] as string;
    }

    const res = (await requestDeleteCategory(deleteInfo)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'warning',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      closeModal(SETTING_CATEGORY);
      await getCategoryList();
      if (props.setResetData) {
        props.setResetData();
      }
      ElMessage({
        type: 'success',
        message: '정상적으로 삭제되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 삭제하기
const setDeleteCategory = () => {
  let categoryName = '';
  if (settingData.value.updateCategoryName) {
    categoryName = settingData.value.updateCategoryName[0].toString();
  }
  ElMessageBox.prompt(
    `삭제를 하시려면 "${categoryName} 삭제합니다."를 입력해 주세요. `,
    '정말로 삭제하시겠습니까??',
    {
      confirmButtonText: '입력',
      cancelButtonText: '취소',
      inputPlaceholder: `${categoryName} 삭제합니다.`,
    },
  )
    .then(({ value }) => {
      if (value === `${categoryName} 삭제합니다.`) {
        postDeleteFunction();
      } else {
        ElMessageBox.alert('입력한 값이 일치하지 않습니다.', '실패', {
          confirmButtonText: '확인',
          type: 'warning',
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>

<template>
  <div>
    <el-dialog
      v-model="flag.settingCategory"
      width="40%"
    >
      <template #header>
        <el-row
          align="middle"
          :gutter="10"
          class="mt-10"
        >
          <p
            type="info"
            class="mr-10"
          >
            분류 설정
          </p>
          <el-tag type="info"> 분류를 수정, 삭제할 수 있는 화면입니다. </el-tag>
        </el-row>
      </template>
      <div class="setting-category-box bg-p">
        <el-row>
          <el-col
            :span="24"
            class="mb-10"
          >
            분류 이름
          </el-col>
          <el-col
            :span="24"
            class="mb-10"
          >
            <el-input v-model="settingData.updateCategoryName[0]" />
          </el-col>
        </el-row>
        <el-radio-group v-model="settingData.updateCategoryType[0]">
          <el-radio label="is_achole"> 주류 분류 </el-radio>
          <el-radio label="is_food"> 음식 분류 </el-radio>
          <el-radio label="is_side"> 사이드 분류 </el-radio>
          <el-radio label="is_service"> 서비스 분류 </el-radio>
          <el-radio label="is_hide"> 숨기기 분류 </el-radio>
          <el-radio label=""> 없음 </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-row
          align="middle"
          justify="end"
        >
          <el-button
            type="info"
            @click="closeModal(SETTING_CATEGORY)"
          >
            닫기
          </el-button>
          <el-button
            type="danger"
            @click="setDeleteCategory"
          >
            분류를 삭제합니다.
          </el-button>
          <el-button
            type="primary"
            @click="setEditCategory"
          >
            분류를 수정합니다.
          </el-button>
        </el-row>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.setting-category-box {
  padding: 20px;
}
</style>
