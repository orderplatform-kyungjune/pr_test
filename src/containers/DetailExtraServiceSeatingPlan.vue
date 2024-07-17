<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, Ref, reactive } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { responseSeatingPlanType } from '@interface/extraService';
import { Plus } from '@element-plus/icons-vue';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestSeatingPlanData,
  requestCreateSeatingPlan,
  requestDeleteSeatingPlan,
  requestUpdateSeatingPlan,
} = extraService;
const { responseSeatingPlanCodec } = extraServiceCodec;

const seatingPlanModalData = reactive({
  type: 'create',
  tableLayoutId: 0,
  tableLayoutName: '',
  img: '',
  file: undefined as File | undefined,
});

const seatingPlanModalState = ref(false);

const createSeatingPlanModal = () => {
  seatingPlanModalData.type = 'create';
  seatingPlanModalState.value = true;
};
const closeSeatingPlanModal = () => {
  seatingPlanModalData.file = undefined;
  seatingPlanModalData.img = '';
  seatingPlanModalData.tableLayoutName = '';
  seatingPlanModalState.value = false;
};
const updateSeatingPlanModal = (target: responseSeatingPlanType) => {
  seatingPlanModalData.type = 'update';
  seatingPlanModalData.tableLayoutId = target.tableLayoutId;
  seatingPlanModalData.img = target.tableLayoutUrl;
  seatingPlanModalData.tableLayoutName = target.tableLayoutName;
  seatingPlanModalData.file = undefined;

  seatingPlanModalState.value = true;
};

/** 좌석 배치도 리스트 */
const seatingPlanList: Ref<responseSeatingPlanType[]> = ref([]);
const getSeatingPlanList = async () => {
  try {
    const res = (await requestSeatingPlanData(storeCode)) as AxiosResponse;
    const typeError = runtimeCheck(responseSeatingPlanCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        seatingPlanList.value = res.data.data.tableLayoutList;
      }
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 좌석 배치도 등록 */
const postCreateSeatingPlan = async () => {
  const { tableLayoutName, file } = seatingPlanModalData;
  if (!tableLayoutName) {
    ElMessage({
      type: 'error',
      message: '이미지명을 입력해주세요.',
    });
    return;
  }
  if (!file) {
    ElMessage({
      type: 'error',
      message: '이미지를 등록해주세요.',
    });
    return;
  }
  try {
    const res = (await requestCreateSeatingPlan(
      storeCode,
      file,
      tableLayoutName,
    )) as AxiosResponse;

    if (res.data.resultCode === 201) {
      await getSeatingPlanList();
      ElMessage({
        type: 'success',
        message: '정상적으로 등록되었습니다.',
      });
      closeSeatingPlanModal();
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 좌석 배치도 삭제 */
const deleteSeatingPlan = (id: number) => {
  ElMessageBox.confirm('해당 항목을 삭제하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestDeleteSeatingPlan(
          storeCode,
          id,
        )) as AxiosResponse;

        if (res.data.resultCode === 200) {
          await getSeatingPlanList();
          ElMessage({
            type: 'success',
            message: '삭제되었습니다.',
          });
        } else {
          await ElMessageBox.alert(res.data.resultMessage, '실패', {
            confirmButtonText: '확인',
            type: 'error',
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

/** 좌석 배치도 수정 */
const putUpdateSeatingPlan = async () => {
  const { tableLayoutName, file, tableLayoutId } = seatingPlanModalData;
  if (!tableLayoutName) {
    ElMessage({
      type: 'error',
      message: '이미지명을 입력해주세요.',
    });
    return;
  }

  const requestData = {
    tableLayoutId,
    tableLayoutName,
    file,
  };

  try {
    const res = (await requestUpdateSeatingPlan(
      storeCode,
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      await getSeatingPlanList();
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
      closeSeatingPlanModal();
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 좌석 배치도 이미지 선택 */
const seatingPlanImageUpload: UploadProps['onSuccess'] = (response) => {
  seatingPlanModalData.img = URL.createObjectURL(response.raw);
  seatingPlanModalData.file = response.raw;
};

/** 저장, 수정 하기 */
const confirmSeatingPlan = () => {
  if (seatingPlanModalData.type === 'create') {
    postCreateSeatingPlan();
  } else {
    putUpdateSeatingPlan();
  }
};

/** 좌서 배치도 자세히 보기 모달창 */
const previewImageModal = ref(false);
const previewImage = ref('');
const openPreviewImageModal = (image: string) => {
  previewImage.value = image;
  previewImageModal.value = true;
};

getSeatingPlanList();
</script>

<template>
  <el-dialog
    v-model="seatingPlanModalState"
    title="좌석 배치도"
    width="40%"
    :before-close="closeSeatingPlanModal"
  >
    <el-descriptions
      :column="1"
      border
      class="mb-20"
    >
      <el-descriptions-item
        label="이미지명"
        label-align="center"
      >
        <el-input v-model="seatingPlanModalData.tableLayoutName" />
      </el-descriptions-item>
      <el-descriptions-item
        label="이미지"
        label-align="center"
      >
        <div class="seating-plan-image-box">
          <el-upload
            :show-file-list="false"
            :on-change="seatingPlanImageUpload"
            :auto-upload="false"
            drag
            class="mb-20"
          >
            <el-image
              v-if="seatingPlanModalData.img"
              :src="seatingPlanModalData.img"
              fit="contain"
              class="seating-plan-image-box-image"
            />
            <el-icon
              v-else
              class="seating-plan-uploader-icon"
            >
              <Plus />
            </el-icon>
          </el-upload>
          <div>
            <p>- 이미지 사이즈: 1280 x 800px</p>
            <p>- 파일 확장자는 JPEG, PNG, BMP, JPG 형태만 등록 됩니다.</p>
            <p>- 파일 용량은 3MB까지 등록 가능 합니다.</p>
          </div>
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-row
        justify="center"
        align="middle"
      >
        <el-button
          type="danger"
          @click="closeSeatingPlanModal"
        >
          취소
        </el-button>
        <el-button
          type="primary"
          @click="confirmSeatingPlan"
        >
          확인
        </el-button>
      </el-row>
    </template>
  </el-dialog>
  <el-dialog
    v-model="previewImageModal"
    width="40%"
    align-center
  >
    <el-row
      justify="center"
      align="middle"
    >
      <el-image
        :src="previewImage"
        fit="fill"
        class="preview-image-modal"
      />
    </el-row>
  </el-dialog>
  <el-row
    justify="space-between"
    align="top"
  >
    <div class="detail-service-title mb-20">
      <span> 좌석 배치도 </span>
    </div>
    <el-button
      type="primary"
      @click="createSeatingPlanModal"
    >
      배치도 추가
    </el-button>
  </el-row>
  <el-table
    v-if="seatingPlanList.length !== 0"
    border
    :height="680"
    :data="seatingPlanList"
  >
    <el-table-column
      align="center"
      header-align="center"
      type="index"
      label="NO"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="이미지"
    >
      <template #default="{ row }">
        <el-image
          class="seating-plan-image"
          :src="row.tableLayoutUrl"
          @click="openPreviewImageModal(row.tableLayoutUrl)"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="이미지명"
      prop="tableLayoutName"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="등록자"
      prop="createdName"
      width="200"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="등록일시"
      prop="createdDateTime"
      width="200"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="비고"
      width="200"
    >
      <template #default="{ row }">
        <el-button @click="updateSeatingPlanModal(row)"> 변경 </el-button>
        <el-button @click="deleteSeatingPlan(row.tableLayoutId)">
          삭제
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-card
    v-else
    shadow="never"
    class="empty-table-data"
  >
    검색 조건에 일치하는 항목이 없습니다.
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 100px;
  vertical-align: middle;
}

.detail-service-title {
  border-left: 4px solid #000;
  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.seating-plan-image {
  width: 300px;
  height: 180px;
  cursor: pointer;
}

.seating-plan-image-box {
  display: flex;
  gap: 20px;
  align-items: center;

  .seating-plan-image-box-image {
    width: 200px;
    height: 150px;
  }

  .seating-plan-uploader-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 150px;
  }
}

.empty-table-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  font-size: 28px;
  font-weight: 500;
}

.preview-image-modal {
  width: 700px;
  height: 450px;
}
</style>
