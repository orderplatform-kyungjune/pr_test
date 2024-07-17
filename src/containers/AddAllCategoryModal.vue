<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, Ref, computed, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import useCategoryStore from '@store/storeCategory';
import { ADD_ALL_CATEGORY } from '@common/string';
import { category } from '@apis';

const { failAuthenticationAlert } = authentication;

const props = defineProps<{
  categoryInfo: {
    name: string;
    code: string | number;
  }[];
  reloadAllCategoryList?: () => void;
}>();

const { flag, closeModal } = useModalStore();

const route = useRoute();

const storeCode = route.query.code as string;

const { requestCreateCategory } = category;

const { getCategoryList } = useCategoryStore();

const newCategoryInfo = reactive({
  type: 'big',
  storeCode,
  categoryName: '',
  categoryType: '',
  categoryCode: '',
});

const flagAutoCreateSecondCategory: Ref<boolean> = ref(false);

const setCategoryType = (type: string) => {
  newCategoryInfo.type = type;
  if (newCategoryInfo.type === 'child') {
    flagAutoCreateSecondCategory.value = false;
  }
};

const selectBoxData = ref(props.categoryInfo);

onMounted(() => {
  selectBoxData.value = props.categoryInfo;
});

const isSecondCategory = computed(() => {
  if (newCategoryInfo.type === 'child') return true;
  return false;
});

const closeModalAfterCreate = () => {
  closeModal(ADD_ALL_CATEGORY);

  newCategoryInfo.categoryName = '';
  newCategoryInfo.type = 'big';

  getCategoryList();
  if (props.reloadAllCategoryList) {
    props.reloadAllCategoryList(); // api v2 대응 임시 코드 todo fix
  }

  ElMessage({
    type: 'success',
    message: '정상적으로 추가되었습니다.',
  });
};

const loadingCreate = ref(false);

/** 단일 분류 생성 */
const postCreateCategoryOnlyOne = async (type: string) => {
  try {
    const payload = {
      type,
      storeCode,
      categoryName: newCategoryInfo.categoryName,
      categoryType: newCategoryInfo.categoryType,
      categoryCode: newCategoryInfo.categoryCode,
    };

    loadingCreate.value = true;
    const res = (await requestCreateCategory(payload)) as AxiosResponse;

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
      closeModalAfterCreate();
    }
  } catch (error) {
    console.log(error);
  } finally {
    loadingCreate.value = false;
  }
};

/** 대/중분류 동시 생성 */
const postCreateCategoryBoth = async () => {
  try {
    const firstCategoryInfo = {
      type: 'big',
      storeCode,
      categoryName: newCategoryInfo.categoryName,
      categoryType: newCategoryInfo.categoryType,
    };

    loadingCreate.value = true;
    const res = (await requestCreateCategory(
      firstCategoryInfo,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
      loadingCreate.value = false;
    }
    if (res.data.code === 200) {
      newCategoryInfo.categoryCode = res.data.data.categoryCode;
      postCreateCategoryOnlyOne('child');
      // 추가 api요청 위해 loadingCreate 유지
    }
  } catch (error) {
    console.log(error);
  }
};

const handleSaveButton = () => {
  if (newCategoryInfo.type === 'child' && !newCategoryInfo.categoryCode) {
    ElMessageBox.alert('대분류를 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  ElMessageBox.confirm('정말로 추가하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      if (loadingCreate.value) return;

      if (flagAutoCreateSecondCategory.value) {
        postCreateCategoryBoth();
      } else {
        postCreateCategoryOnlyOne(newCategoryInfo.type);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const getCategoryKey = (name: string, index: number) =>
  name
    ? `first-category-select-${name}-${index}`
    : `first-category-select-${index}`;
</script>

<template>
  <el-dialog
    v-model="flag.addAllCategory"
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
          class="mr-5"
        >
          분류 등록
        </p>
        <el-tag type="info">
          새로운 대분류, 중분류를 추가할 수 있는 화면입니다.
        </el-tag>
      </el-row>
    </template>
    <div class="add-all-category-box bg-p">
      <el-row
        class="mb-20"
        align="middle"
      >
        <el-col :span="24">
          <p class="font-emphasis mb-10">1. 어디에 추가하실 건가요?</p>
        </el-col>
        <el-col :span="12">
          <el-radio-group
            v-model="newCategoryInfo.type"
            size="large"
          >
            <el-radio-button
              label="big"
              @click="setCategoryType('big')"
            >
              대분류
            </el-radio-button>
            <el-radio-button
              label="child"
              @click="setCategoryType('child')"
            >
              중분류
            </el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="12">
          <el-select
            v-if="isSecondCategory"
            v-model="newCategoryInfo.categoryCode"
            size="large"
          >
            <el-option
              v-for="(first, index) in selectBoxData"
              :key="getCategoryKey(first.name, index)"
              :label="first.name"
              :value="first.code"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-col>
        <p class="font-emphasis mb-10">2. 분류 이름을 입력해주세요.</p>
        <el-row justify="space-between">
          <el-input
            v-model="newCategoryInfo.categoryName"
            input-style="width: 400px"
          />
          <el-checkbox
            v-if="newCategoryInfo.type === 'big'"
            v-model="flagAutoCreateSecondCategory"
            label="대분류명과 동일하게 중분류 동시 생성"
          />
        </el-row>
      </el-col>
      <el-row class="mt-20">
        <el-col class="mb-10">
          <p class="font-emphasis">3. 분류 구분을 선택해 주세요.</p>
        </el-col>
        <el-radio-group v-model="newCategoryInfo.categoryType">
          <el-radio :label="'is_achole'"> 주류 분류 </el-radio>
          <el-radio :label="'is_food'"> 음식 분류 </el-radio>
          <el-radio :label="'is_side'"> 사이드 분류 </el-radio>
          <el-radio :label="'is_service'"> 서비스 분류 </el-radio>
          <el-radio :label="'is_hide'"> 숨기기 분류 </el-radio>
          <el-radio :label="''"> 없음 </el-radio>
        </el-radio-group>
      </el-row>
    </div>

    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ADD_ALL_CATEGORY)"
      >
        취소
      </el-button>
      <el-button
        type="primary"
        :loading="loadingCreate"
        @click="handleSaveButton"
      >
        저장
      </el-button>
    </template>
  </el-dialog>
</template>

<style>
.add-all-category-box {
  padding: 20px;
}
.input-box-name {
  flex-direction: column;
}
</style>
