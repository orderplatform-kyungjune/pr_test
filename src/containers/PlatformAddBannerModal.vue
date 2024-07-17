<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { UploadProps, ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { Plus, VideoCamera } from '@element-plus/icons-vue';
import { ADD_BANNER } from '@common/string';
import { banner } from '@apis';

const { failAuthenticationAlert } = authentication;

const props = defineProps<{
  getList: () => void;
}>();

const { flag, closeModal } = useModalStore();

const { requestCreateBannerInPlatform } = banner;

// query
const route = useRoute();
const pathQuery = reactive(route.query);

const addBannerInfo = reactive({
  storeCode: pathQuery.code as string,
  bannerTitle: '',
  bannerFile: '',
  bannerImage: '',
});

/** 로딩 상태값 */
const fullscreenLoading = ref(false);

// 사진 선택
const bannerImageLoadSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.raw.type === 'video/mp4') {
    addBannerInfo.bannerImage = 'video';
    addBannerInfo.bannerFile = response.raw;
  } else {
    addBannerInfo.bannerImage = URL.createObjectURL(response.raw);
    addBannerInfo.bannerFile = response.raw;
  }
};

/** 배너 등록하기 */
const createNewBanner = () => {
  ElMessageBox.confirm('배너를 등록 하시겠습니까?', '배너 등록', {
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestCreateBannerInPlatform(
          addBannerInfo,
        )) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (res.data.code === 401) {
          failAuthenticationAlert();
        }
        if (res.data.code === 200) {
          props.getList();
          fullscreenLoading.value = false;
          closeModal(ADD_BANNER);
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
        type: 'error',
        message: '취소되었습니다.',
      });
    });
};

const isVideoType = () => addBannerInfo.bannerImage === 'video';
</script>

<template>
  <el-dialog
    v-model="flag.addBanner"
    width="30%"
  >
    <template #header>
      <el-row align="middle">
        <p class="mr-10">배너 등록</p>
        <el-tag> 매장에 새로운 배너를 추가할 수 있는 화면입니다.</el-tag>
      </el-row>
    </template>
    <el-row class="banner-uploader-wrapper width-100">
      <el-upload
        v-loading.fullscreen.lock="fullscreenLoading"
        :auto-upload="false"
        :on-change="bannerImageLoadSuccess"
        :show-file-list="false"
        class="mb-20 width-100"
        drag
      >
        <el-row>
          <el-col :span="24">
            <el-row
              align="middle"
              class="width-100"
              justify="center"
            >
              <div v-if="isVideoType()">
                <el-icon class="banner-uploader-video">
                  <VideoCamera class="banner-uploader-video-icon" />
                </el-icon>
              </div>
              <el-image
                v-else-if="addBannerInfo.bannerImage"
                :src="addBannerInfo.bannerImage"
                class="banner-uploader-image"
                fit="fill"
              />
              <div
                v-else
                class="banner-uploader-icon"
              >
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
            </el-row>
          </el-col>
        </el-row>
      </el-upload>
    </el-row>
    <hr class="mb-20 mt-20" />
    <el-row>
      <el-col
        :span="24"
        class="mb-10"
      >
        배너 이름
      </el-col>
      <el-col :span="24">
        <el-input v-model="addBannerInfo.bannerTitle" />
      </el-col>
    </el-row>
    <template #footer>
      <span>
        <el-button @click="closeModal(ADD_BANNER)"> 닫기 </el-button>
        <el-button
          type="primary"
          @click="createNewBanner"
        >
          등록
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.banner-uploader-wrapper {
  display: flex;
  justify-content: center;

  &:deep(.el-upload-dragger) {
    padding: 0;
  }

  .banner-uploader-video {
    width: 400px;
    height: 250px;

    .banner-uploader-video-icon {
      transform: scale(2.5);
    }
  }

  .banner-uploader-image {
    width: 400px;
    height: 250px;
  }

  .banner-uploader-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 250px;
  }
}
</style>
