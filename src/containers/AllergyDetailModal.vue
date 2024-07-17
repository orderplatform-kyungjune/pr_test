<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { CloseBold, Picture, Plus } from '@element-plus/icons-vue';
import { ALLERGY_DETAIL } from '@common/string';
import { allergy } from '@apis';

const props = defineProps<{
  numberOfAllergyExposure: number;
  allergyUseCount: number;
  postAllergyList: () => void;
}>();

const { failAuthenticationAlert } = authentication;
const { requestAddAllergy, requestUpdateAllergy } = allergy;

const { flag, modalData, closeModal } = useModalStore();

const { mode, allergyData } = modalData.allergyDetail;

const itemInfo = reactive({
  id: 0,
  name: '',
  content: '', // view_type === 'text' 인 경우에만 사용 (추후)
  image: '',
  view_type: 'image',
  use_yn: '',
});
const imageObjectUrl = ref('');

const isAllFilled = computed(() => {
  if (itemInfo.view_type === 'text') {
    return (
      itemInfo.name && itemInfo.view_type && itemInfo.use_yn && itemInfo.content
    );
  }
  return (
    itemInfo.name && itemInfo.view_type && itemInfo.use_yn && itemInfo.image
  );
});

/** 로딩 상태값 */
const fullscreenLoading = ref(false);

const onChangeAllergyImageUploadSuccess: UploadProps['onSuccess'] = (
  response,
) => {
  console.log('BTS케이스 재현을 위한 로그 (추후 삭제 예정)', response);

  imageObjectUrl.value = URL.createObjectURL(response.raw);
  itemInfo.image = response.raw;
};

const postAddAllergy = async () => {
  try {
    const { name, content, use_yn, view_type, image } = itemInfo;
    const requestData = {
      name,
      content,
      use_yn,
      view_type,
      image,
    };

    const res = (await requestAddAllergy(requestData)) as AxiosResponse;

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
        message: '정상적으로 등록되었습니다.',
      });
      closeModal(ALLERGY_DETAIL);
      props.postAllergyList();
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullscreenLoading.value = false;
  }
};

const postUpdateAllergy = async () => {
  try {
    const res = (await requestUpdateAllergy(itemInfo)) as AxiosResponse;

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
        message: '정상적으로 등록되었습니다.',
      });
      closeModal(ALLERGY_DETAIL);
      props.postAllergyList();
    }
  } catch (error) {
    console.log(error);
    ElMessageBox.alert('개발자에게 문의해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
  } finally {
    fullscreenLoading.value = false;
  }
};

const revokeAllergyImageURL = () => {
  URL.revokeObjectURL(imageObjectUrl.value);
};

const onRemoveAllergyImage = () => {
  if (imageObjectUrl.value) {
    revokeAllergyImageURL();
    imageObjectUrl.value = '';
  }

  itemInfo.image = '';
};

const saveAllergyData = () => {
  if (
    props.numberOfAllergyExposure >= props.allergyUseCount &&
    itemInfo.use_yn === 'Y'
  ) {
    ElMessageBox.alert('', '알림', {
      message: h('p', { style: 'font-family: none; text-align: center;' }, [
        h(
          'p',
          { style: 'font-weight: bold; font-size: 15px;' },
          '최대 15개까지 노출 가능합니다.',
        ),
        h(
          'p',
          { style: 'font-weight: bold; font-size: 12px;' },
          '미노출 상태로 저장 후 노출 여부를 수정해주세요.',
        ),
      ]),
      confirmButtonText: '확인',
    });
    return;
  }

  if (mode === 'modify') {
    postUpdateAllergy();
    revokeAllergyImageURL();
    return;
  }

  postAddAllergy();
  revokeAllergyImageURL();
};

onMounted(() => {
  if (mode === 'modify') {
    itemInfo.id = allergyData.id;
    itemInfo.content = allergyData.content;
    itemInfo.name = allergyData.name;
    itemInfo.view_type = allergyData.view_type;
    itemInfo.use_yn = allergyData.use_yn;
    itemInfo.image = allergyData.image_url;
  }
});
</script>

<template>
  <el-dialog
    v-model="flag.allergyDetail"
    :close-on-click-modal="false"
    :title="mode === 'modify' ? '알레르기 아이콘 수정' : '알레르기 아이콘 등록'"
    align-center
    width="40%"
  >
    <div class="allergy-detail-container bg-p">
      <el-row>
        <el-col> 아이콘 이름</el-col>
        <el-col class="mt-10">
          <el-input v-model="itemInfo.name" />
        </el-col>
      </el-row>
      <el-row class="mt-20">
        <el-col class="mb-10"> 알레르기 타입</el-col>
        <el-col>
          <el-radio-group
            v-model="itemInfo.view_type"
            class="allergy-detail-types width-100"
          >
            <el-row class="mb-10">
              <el-col :span="4">
                <el-radio
                  disabled
                  label="text"
                >
                  텍스트형
                </el-radio>
              </el-col>
              <el-col :span="18">
                <el-input
                  :disabled="itemInfo.view_type === 'image'"
                  placeholder="입력해주세요."
                />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="4">
                <el-radio label="image"> 이미지형</el-radio>
              </el-col>
              <el-col :span="18">
                <el-upload
                  v-loading.fullscreen.lock="fullscreenLoading"
                  :auto-upload="false"
                  :file-list="itemInfo ? [itemInfo] : []"
                  :on-change="onChangeAllergyImageUploadSuccess"
                  :show-file-list="false"
                  class="allergy-detail-image-upload"
                  drag
                >
                  <div v-if="imageObjectUrl || itemInfo.image">
                    <el-image
                      :src="imageObjectUrl ? imageObjectUrl : itemInfo.image"
                      alt="알레르기 아이콘 이미지"
                      fit="cover"
                    >
                      <template #error>
                        <div class="allergy-image-preview">
                          <el-icon size="30px">
                            <Picture />
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                    <el-icon
                      class="image-delete-icon"
                      size="30px"
                      @click.stop="onRemoveAllergyImage"
                    >
                      <CloseBold />
                    </el-icon>
                  </div>
                  <div
                    v-else
                    class="allergy-image-preview"
                  >
                    <el-icon size="20">
                      <Plus />
                    </el-icon>
                  </div>
                </el-upload>
                <p class="mt-10 allergy-image-description">
                  * 이미지 파일은 최대 2MB까지 업로드 할 수 있습니다.
                  <br />
                  * 이미지 파일 포멧은 GIF, PNG, JPG, JPEG 만 가능합니다.
                </p>
              </el-col>
            </el-row>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row class="mt-20">
        <el-col>
          <p>티오더2 상품 상세 페이지 아이콘 노출 여부</p>
          <el-text
            size="small"
            type="danger"
          >
            * 15개까지 노출 가능합니다.
          </el-text>
        </el-col>
        <el-col class="mt-5">
          <el-radio-group v-model="itemInfo.use_yn">
            <el-radio label="Y"> 노출</el-radio>
            <el-radio label="N"> 미노출</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(ALLERGY_DETAIL)"
      >
        취소
      </el-button>
      <el-button
        :disabled="!isAllFilled"
        type="primary"
        @click="saveAllergyData"
      >
        저장
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.image-delete-icon {
  position: absolute;
  top: 0;
  right: 0;
}

.allergy-detail-container {
  padding: 20px;
}

.allergy-detail-types {
  display: flex;
  flex-direction: column;
  align-items: initial !important;
}

.allergy-detail-image-upload {
  width: 180px;
  height: 100px;
  padding: 10px 0 0 0;

  &:deep(.el-upload-dragger) {
    padding: 0px;
  }

  &:deep(.el-image) {
    width: 180px;
    height: 100px;
  }
}

.allergy-image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 100px;
}

.allergy-image-description {
  font-size: 13px;
  font-family: none;
}
</style>
