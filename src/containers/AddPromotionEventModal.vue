<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import useModalStore from '@store/storeModal';
import { ADD_PROMOTION_EVENT } from '@common/string';
import { promotion } from '@apis';

const props = defineProps<{
  getList: () => void;
}>();

const { requestCreatePromotionEvent, requestUploadImage } = promotion;

const { flag, closeModal } = useModalStore();

/** 로딩 상태값 */
const fullscreenLoading = ref(false);

const createEventInfo = reactive({
  eventEngName: '',
  eventKorName: '',
  eventGoodsName: '',
  eventDate: [],
  eventButtonUrl: '',
  eventBannerUrl: '',
  eventPageUrl: '',
  eventGoodsImageUrl: '',
});

const getLanguageFlagList = async (image: File, type: string) => {
  try {
    const res = (await requestUploadImage(image)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    } else {
      if (type === 'banner') {
        createEventInfo.eventBannerUrl = res.data.s3Url;
      }
      if (type === 'button') {
        createEventInfo.eventButtonUrl = res.data.s3Url;
      }
      if (type === 'page') {
        createEventInfo.eventPageUrl = res.data.s3Url;
      }
      if (type === 'goods') {
        createEventInfo.eventGoodsImageUrl = res.data.s3Url;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 이미지 업로드 제한 */
const checkUploadFile = (type: string, size: number) => {
  if (
    type !== 'image/jpeg' &&
    type !== 'image/jpg' &&
    type !== 'image/png' &&
    type !== 'image/gif' &&
    type !== 'video/mp4'
  ) {
    ElMessage.error('jpg, jpeg, png, gif 파일 포멧만 가능합니다.');
    return false;
  }
  if (size / 1024 / 1024 > 2) {
    ElMessage.error('이미지 파일의 용량은 2MB로 제한됩니다.');
    return false;
  }
  return true;
};

// 사진 선택
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventImageLoadSuccess = (response: any, type: string) => {
  if (checkUploadFile(response.raw.type, response.raw.size)) {
    getLanguageFlagList(response.raw, type);
  }
};

/** 이벤트 등록 */
const createPromotionEvent = () => {
  const eventInfo = {
    eventEngName: createEventInfo.eventEngName,
    eventKorName: createEventInfo.eventKorName,
    eventGoodsName: createEventInfo.eventGoodsName,
    eventStartDate: createEventInfo.eventDate[0],
    eventEndDate: createEventInfo.eventDate[1],
    eventButtonUrl: createEventInfo.eventButtonUrl,
    eventBannerUrl: createEventInfo.eventBannerUrl,
    eventPageUrl: createEventInfo.eventPageUrl,
    eventGoodsImageUrl: createEventInfo.eventGoodsImageUrl,
  };
  ElMessageBox.confirm('이벤트를 등록하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(async () => {
    fullscreenLoading.value = true;
    try {
      const res = (await requestCreatePromotionEvent(
        eventInfo,
      )) as AxiosResponse;

      if (res.data.resultCode === 400) {
        ElMessageBox.alert(res.data.resultMessage, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      } else {
        ElMessage({
          type: 'success',
          message: '정상적으로 등록되었습니다.',
        });
        props.getList();
        closeModal(ADD_PROMOTION_EVENT);
      }
      fullscreenLoading.value = false;
    } catch (error) {
      fullscreenLoading.value = false;
      console.log(error);
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="flag.addPromotionEvent"
    width="40%"
  >
    <template #header>
      <el-row align="middle">
        <p class="mr-10">프로모션 이벤트 등록</p>
        <el-tag> 새로운 프로모션 이벤트를 등록할 수 있는 화면입니다.</el-tag>
      </el-row>
    </template>
    <div class="promotion-event-create">
      <div class="mb-20">
        <p class="mb-5">이벤트 이름</p>
        <el-input v-model="createEventInfo.eventKorName" />
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 이름 (영문)</p>
        <el-input v-model="createEventInfo.eventEngName" />
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 상품</p>
        <el-input v-model="createEventInfo.eventGoodsName" />
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 기간</p>
        <el-date-picker
          v-model="createEventInfo.eventDate"
          end-placeholder="종료 날짜"
          format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="시작 날짜"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 배너 이미지</p>
        <el-upload
          v-model="createEventInfo.eventBannerUrl"
          :auto-upload="false"
          :limit="1"
          :on-change="
            (response: any) => eventImageLoadSuccess(response, 'banner')
          "
          list-type="picture"
        >
          <el-button
            size="small"
            type="primary"
          >
            이미지 등록
          </el-button>
          <template #file="{ file }">
            <el-row align="middle">
              <img
                :src="file.url"
                alt=""
                class="promotion-event-create-image mr-10"
              />
              <p>
                {{ file.name }}
              </p>
            </el-row>
          </template>
        </el-upload>
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 리스트 이미지</p>
        <el-upload
          v-model="createEventInfo.eventButtonUrl"
          :auto-upload="false"
          :limit="1"
          :on-change="
            (response: any) => eventImageLoadSuccess(response, 'button')
          "
          list-type="picture"
        >
          <el-button
            size="small"
            type="primary"
          >
            이미지 등록
          </el-button>
          <template #file="{ file }">
            <el-row align="middle">
              <img
                :src="file.url"
                alt=""
                class="promotion-event-create-image mr-10"
              />
              <p>
                {{ file.name }}
              </p>
            </el-row>
          </template>
        </el-upload>
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 안내 이미지</p>
        <el-upload
          v-model="createEventInfo.eventPageUrl"
          :auto-upload="false"
          :limit="1"
          :on-change="
            (response: any) => eventImageLoadSuccess(response, 'page')
          "
          list-type="picture"
        >
          <el-button
            size="small"
            type="primary"
          >
            이미지 등록
          </el-button>
          <template #file="{ file }">
            <el-row align="middle">
              <img
                :src="file.url"
                alt=""
                class="promotion-event-create-image mr-10"
              />
              <p>
                {{ file.name }}
              </p>
            </el-row>
          </template>
        </el-upload>
      </div>
      <div class="mb-20">
        <p class="mb-5">이벤트 상품 이미지</p>
        <el-upload
          v-model="createEventInfo.eventGoodsImageUrl"
          :auto-upload="false"
          :limit="1"
          :on-change="
            (response: any) => eventImageLoadSuccess(response, 'goods')
          "
          list-type="picture"
        >
          <el-button
            size="small"
            type="primary"
          >
            이미지 등록
          </el-button>
          <template #file="{ file }">
            <el-row align="middle">
              <img
                :src="file.url"
                alt=""
                class="promotion-event-create-image mr-10"
              />
              <p>
                {{ file.name }}
              </p>
            </el-row>
          </template>
        </el-upload>
      </div>
    </div>

    <template #footer>
      <span>
        <el-button @click="closeModal(ADD_PROMOTION_EVENT)"> 닫기 </el-button>
        <el-button
          v-loading.fullscreen.lock="fullscreenLoading"
          type="primary"
          @click="createPromotionEvent"
        >
          등록하기
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.promotion-event-create {
  display: flex;
  flex-direction: column;

  &:deep(.el-date-editor) {
    box-sizing: border-box;
    width: 100%;
  }

  .promotion-event-create-image {
    width: 80px;
    height: 60px;
    object-fit: contain;
  }
}
</style>
