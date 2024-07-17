<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { promotionEventListType } from '@interface/promotion';
import { BreadcrumbHeader } from '@components';
import {
  PROMOTION_EVENT,
  PROMOTION_EVENT_INFO,
  STATISTICAL_ADMIN,
} from '@common/string';
import { promotionCodec } from '@codecs';
import { promotion } from '@apis';

const route = useRoute();

// header props
const promotionRegisterHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: PROMOTION_EVENT },
  { name: PROMOTION_EVENT_INFO },
]);

const { runtimeCheck } = runtimeCheckHelper;

const {
  requestGetPromotionEvent,
  requestEditPromotionEvent,
  requestUploadImage,
} = promotion;
const { promotionEventListContentCodec } = promotionCodec;

/** 로딩 상태값 */
const fullscreenLoading = ref(false);

/** 프로모션 이벤트 리스트 */
const eventDetailInfo = ref<promotionEventListType>({
  eventDate: ['', ''],
} as promotionEventListType);

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
        eventDetailInfo.value.eventBannerUrl = res.data.s3Url;
        eventDetailInfo.value.bannerImage = res.data.s3Url;
      }
      if (type === 'button') {
        eventDetailInfo.value.eventButtonUrl = res.data.s3Url;
        eventDetailInfo.value.buttonImage = res.data.s3Url;
      }
      if (type === 'page') {
        eventDetailInfo.value.eventPageUrl = res.data.s3Url;
        eventDetailInfo.value.pageImage = res.data.s3Url;
      }
      if (type === 'goods') {
        eventDetailInfo.value.eventGoodsImageUrl = res.data.s3Url;
        eventDetailInfo.value.goodsImage = res.data.s3Url;
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
const setEventImage = (response: any, type: string) => {
  if (checkUploadFile(response.raw.type, response.raw.size)) {
    getLanguageFlagList(response.raw, type);
  }
};

/** 프로모션 이벤트 리스트 조회 */
const getPromotionEventInfo = async () => {
  const requestData = Number(route.query.num);
  try {
    const res = (await requestGetPromotionEvent(requestData)) as AxiosResponse;

    if (res.status === 200) {
      const typeError = runtimeCheck(
        promotionEventListContentCodec,
        res.data.res,
      );

      if (!typeError) {
        eventDetailInfo.value = res.data.res;
        Object.assign(eventDetailInfo.value, {
          eventDate: [res.data.res.startDate, res.data.res.endDate],
          bannerImage: res.data.res.eventBannerUrl,
          buttonImage: res.data.res.eventButtonUrl,
          pageImage: res.data.res.eventPageUrl,
          goodsImage: res.data.res.eventGoodsImageUrl,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 이벤트 정보 수정 */
const editPromotionEventInfo = async () => {
  const eventNumber = Number(route.query.num);
  const requestData = {
    eventStartDate: eventDetailInfo.value.eventDate
      ? eventDetailInfo.value.eventDate[0]
      : '',
    eventEndDate: eventDetailInfo.value.eventDate
      ? eventDetailInfo.value.eventDate[1]
      : '',
    eventButtonUrl: eventDetailInfo.value.eventButtonUrl,
    eventBannerUrl: eventDetailInfo.value.eventBannerUrl,
    eventPageUrl: eventDetailInfo.value.eventPageUrl,
    eventGoodsImageUrl: eventDetailInfo.value.eventGoodsImageUrl,
  };
  ElMessageBox.confirm('이벤트를 수정하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(async () => {
    try {
      fullscreenLoading.value = true;
      const res = (await requestEditPromotionEvent(
        eventNumber,
        requestData,
      )) as AxiosResponse;
      if (res.status === 200) {
        await getPromotionEventInfo();
        ElMessage({
          type: 'success',
          message: '정상적으로 수정되었습니다.',
        });
        fullscreenLoading.value = false;
      }
    } catch (error) {
      fullscreenLoading.value = false;
      console.log(error);
    }
  });
};

getPromotionEventInfo();
</script>

<template>
  <BreadcrumbHeader :propsHeader="promotionRegisterHeader" />
  <el-row
    align="top"
    class="mb-10"
    justify="space-between"
  >
    <p class="promotion-info-title mb-10">프로모션 이벤트 정보</p>
    <el-button
      v-loading.fullscreen.lock="fullscreenLoading"
      type="warning"
      @click="editPromotionEventInfo"
    >
      수정하기
    </el-button>
  </el-row>
  <el-card class="mb-20">
    <template #header>
      <div>
        <span>이벤트 기본 정보</span>
      </div>
    </template>
    <el-row
      :gutter="40"
      class="event-info-basic"
      justify="space-between"
    >
      <el-col :span="12">
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 이름</p>
          <el-input
            v-model="eventDetailInfo.eventNaming"
            disabled
          />
        </div>
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 이름 (영어)</p>
          <el-input
            v-model="eventDetailInfo.eventName"
            disabled
          />
        </div>
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 상품</p>
          <el-input
            v-model="eventDetailInfo.eventGoodsName"
            disabled
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 타입</p>
          <el-input
            v-model="eventDetailInfo.eventType"
            disabled
          />
        </div>
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 재고</p>
          <el-input
            v-model="eventDetailInfo.eventQty"
            disabled
          />
        </div>
        <div class="event-info-header mb-20">
          <p class="mb-10">이벤트 기간</p>
          <el-date-picker
            v-model="eventDetailInfo.eventDate"
            end-placeholder="종료 날짜"
            format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="시작 날짜"
            type="daterange"
            value-format="YYYY-MM-DD"
          />
        </div>
      </el-col>
    </el-row>
  </el-card>
  <el-row
    :gutter="20"
    align="middle"
    justify="space-between"
  >
    <el-col :span="6">
      <el-card>
        <template #header>
          <span> 배너 이미지 </span>
        </template>
        <el-upload
          :auto-upload="false"
          :on-change="(response: any) => setEventImage(response, 'banner')"
          :show-file-list="false"
          drag
        >
          <el-image
            v-if="eventDetailInfo.bannerImage"
            :src="eventDetailInfo.bannerImage"
            class="promotion-event-image"
            fit="contain"
          />
          <div v-else>
            <el-empty
              class="promotion-event-image"
              description="이미지가 없습니다."
            />
          </div>
        </el-upload>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card>
        <template #header>
          <span> 리스트 이미지 </span>
        </template>
        <el-upload
          :auto-upload="false"
          :on-change="(response: any) => setEventImage(response, 'button')"
          :show-file-list="false"
          drag
        >
          <el-image
            v-if="eventDetailInfo.buttonImage"
            :src="eventDetailInfo.buttonImage"
            class="promotion-event-image"
            fit="contain"
          />
          <div v-else>
            <el-empty
              class="promotion-event-image"
              description="이미지가 없습니다."
            />
          </div>
        </el-upload>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card>
        <template #header>
          <span> 안내 이미지 </span>
        </template>
        <el-upload
          :auto-upload="false"
          :on-change="(response: any) => setEventImage(response, 'page')"
          :show-file-list="false"
          drag
        >
          <el-image
            v-if="eventDetailInfo.pageImage"
            :src="eventDetailInfo.pageImage"
            class="promotion-event-image"
            fit="contain"
          />
          <div v-else>
            <el-empty
              class="promotion-event-image"
              description="이미지가 없습니다."
            />
          </div>
        </el-upload>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card>
        <template #header>
          <span> 상품 이미지 </span>
        </template>
        <el-upload
          :auto-upload="false"
          :on-change="(response: any) => setEventImage(response, 'goods')"
          :show-file-list="false"
          drag
        >
          <el-image
            v-if="eventDetailInfo.goodsImage"
            :src="eventDetailInfo.goodsImage"
            class="promotion-event-image"
            fit="contain"
          />
          <div v-else>
            <el-empty
              class="promotion-event-image"
              description="이미지가 없습니다."
            />
          </div>
        </el-upload>
      </el-card>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.promotion-info-title {
  font-size: 30px;
}

.event-info-basic {
  &:deep(.el-date-editor) {
    box-sizing: border-box;
    width: 100%;
  }

  .event-info-header {
    font-size: 13px;
  }
}

.promotion-event-image {
  height: 300px;
  object-fit: contain;
}
</style>
