<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { computed, reactive, ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import useCategoryStore from '@store/storeCategory';
import { categoryListChildType, categoryListDataType } from '@interface/category';
import { ARRANGE_TOTAL_CATEGORY } from '@common/string';
import { category } from '@apis';

const { failAuthenticationAlert } = authentication;

const { flag, closeModal } = useModalStore();

const route = useRoute();

const { getCategoryList } = useCategoryStore();

const storeCode = route.query.code as string;

const { requestArrangeCategory } = category;

const props = defineProps<{
  reloadAllCategoryList?: () => void;
}>();

const responseCategoryListData = ref([] as categoryListDataType[]);

// 선택한 대분류
const firstCategoryTargetCode = ref('');

// 대분류 데이터
const firstCategoryData = reactive({
  editType: 'category',
  storeCode,
  updateCategoryCode: [] as string[],
});

// 중분류 데이터
const secondCategoryData = reactive({
  editType: 'child_category',
  storeCode,
  categoryCode: '',
  updateCategoryCode: [] as string[],
});

// 대분류 선택
const clickCategory = (target: string) => {
  firstCategoryTargetCode.value = target;
  secondCategoryData.categoryCode = target;

  const secondCategoryArr = [] as string[];
  const targetFirst = responseCategoryListData.value.find(
    (firstClass: categoryListDataType) =>
      firstClass.categoryCode === firstCategoryTargetCode.value,
  );
  targetFirst?.childCategoryList.forEach((child: categoryListChildType) => {
    secondCategoryArr.push(child.childCategoryCode);
  });
  secondCategoryData.updateCategoryCode = secondCategoryArr;
};

watchEffect(() => {
  const { categoryListData } = useCategoryStore();
  responseCategoryListData.value = categoryListData;

  const firstArr = [] as string[];
  responseCategoryListData.value.forEach((firstClass: categoryListDataType) => {
    firstArr.push(firstClass.categoryCode);
  });

  firstCategoryData.updateCategoryCode = firstArr;
});

const getFirstCategoryName = (code: string) => {
  const target = responseCategoryListData.value.find(
    (firstClass: categoryListDataType) => firstClass.categoryCode === code,
  );
  const targetName = target?.categoryName;
  if (targetName === undefined) return '';
  return targetName;
};

const getSecondCategoryName = (code: string) => {
  const target = responseCategoryListData.value.find(
    (firstClass: categoryListDataType) =>
      firstClass.categoryCode === firstCategoryTargetCode.value,
  );
  const targetChildName = target?.childCategoryList.find(
    (child: categoryListChildType) => child.childCategoryCode === code,
  );
  if (targetChildName === undefined) return '';
  return targetChildName.childCategoryName;
};

const postSecondArrangeFunction = async () => {
  try {
    const secondRes = (await requestArrangeCategory(
      secondCategoryData,
    )) as AxiosResponse;

    if (secondRes.data.code === 400) {
      ElMessageBox.alert(secondRes.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (secondRes.data.code === 401) {
      failAuthenticationAlert();
    }
    if (secondRes.data.code === 200) {
      getCategoryList();
      if (props.reloadAllCategoryList) props.reloadAllCategoryList(); // api v2 대응 임시 코드 todo fix
      closeModal(ARRANGE_TOTAL_CATEGORY);
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const setArrangeCategory = () => {
  ElMessageBox.confirm('정말로 수정하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const firstRes = (await requestArrangeCategory(
          firstCategoryData,
        )) as AxiosResponse;

        if (firstRes.data.code === 400) {
          ElMessageBox.alert(firstRes.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (firstRes.data.code === 401) {
          failAuthenticationAlert();
        }
        if (firstRes.data.code === 200) {
          if (secondCategoryData.categoryCode !== '') {
            postSecondArrangeFunction();
          } else {
            getCategoryList();
            if (props.reloadAllCategoryList) props.reloadAllCategoryList(); // api v2 대응 임시 코드 todo fix
            closeModal(ARRANGE_TOTAL_CATEGORY);
            ElMessage({
              type: 'success',
              message: '정상적으로 수정되었습니다.',
            });
          }
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

const dragOptions = computed(() => {
  const option = {
    animation: 0,
    group: 'description',
    disabled: false,
  };
  return option;
});

// api v2 대응 임시 코드 todo fix
if (
  firstCategoryData.updateCategoryCode.length === 0 &&
  firstCategoryData.updateCategoryCode
) {
  getCategoryList();
}
</script>

<template>
  <el-dialog
    v-model="flag.arrangeTotalCategory"
    width="50%"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p
          class="mr-10"
          type="info"
        >
          분류 순서 설정
        </p>
        <el-tag type="info">
          상품이 속해 있는 분류의 순서를 변경하는 화면입니다.
        </el-tag>
      </el-row>
    </template>
    <el-row
      align="middle"
      justify="space-evenly"
    >
      <el-col :span="11">
        <el-card>
          <el-row justify="center">
            <el-tag
              class="mb-20"
              size="large"
              type="warning"
            >
              Drag 해서 대분류의 순서를 변경할 수 있습니다.
            </el-tag>
          </el-row>
          <draggable
            v-model="firstCategoryData.updateCategoryCode"
            class="arrange-category-draggable"
            group="first"
            item-key="order"
            v-bind="dragOptions"
          >
            <template #item="{ element }">
              <el-row
                align="middle"
                justify="space-between"
              >
                <div
                  class="arrange-category-box mb-10"
                  @click="clickCategory(element)"
                >
                  {{ getFirstCategoryName(element) }}
                </div>
              </el-row>
            </template>
          </draggable>
        </el-card>
      </el-col>
      <el-col :span="11">
        <el-card>
          <el-row justify="center">
            <el-tag
              class="mb-20"
              size="large"
              type="warning"
            >
              Drag 해서 중분류의 순서를 변경할 수 있습니다.
            </el-tag>
          </el-row>
          <draggable
            v-model="secondCategoryData.updateCategoryCode"
            class="arrange-category-draggable"
            group="second"
            item-key="order"
            v-bind="dragOptions"
          >
            <template #item="{ element }">
              <el-row
                align="middle"
                justify="space-between"
              >
                <div class="arrange-category-box mb-10">
                  {{ getSecondCategoryName(element) }}
                </div>
              </el-row>
            </template>
          </draggable>
        </el-card>
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ARRANGE_TOTAL_CATEGORY)"
      >
        닫기
      </el-button>
      <el-button
        type="primary"
        @click="setArrangeCategory"
      >
        순서 적용
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.arrange-category-box {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  cursor: pointer;
  background-color: #f1f1ff;
  border-radius: 6px;
}

.arrange-category-draggable {
  height: 400px;
  overflow: auto;
}
</style>
