<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  gameSettingBetType,
  gameSettingType,
  requestUpdateGameDetailType,
} from '@interface/extraService';
import { Picture } from '@element-plus/icons-vue';
import { EXTRA_SERVICE_GAME_RESTRICTION_SETTING } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { flag, closeModal, modalData } = useModalStore();

const { requestGameDetail, requestUploadGameImage, requestUpdateGameInfo } =
  extraService;

const { runtimeCheck } = runtimeCheckHelper;
const { gameSettingInfoCodec } = extraServiceCodec;

const props = defineProps<{
  getGameSettingList: () => Promise<void>;
}>();

const gameId = modalData.gameRestrictionSetting;
const uploadLogoImageUrl: Ref<string> = ref('');
const uploadLogoImageName: Ref<string> = ref('');
const gameData: Ref<gameSettingType> = ref({} as gameSettingType);

const getGameDetail = async () => {
  const res = (await requestGameDetail(gameId)) as AxiosResponse;
  const typeError = runtimeCheck(gameSettingInfoCodec, res.data.data);

  if (res.data.resultCode === 200) {
    if (!typeError) {
      gameData.value = res.data.data;
      const { gameImgUrl } = res.data.data;
      uploadLogoImageUrl.value = gameImgUrl;
      uploadLogoImageName.value =
        gameImgUrl.split('/')[gameImgUrl.split('/').length - 1];
    }
  } else {
    await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
  }
};

/** 로딩 상태값 */
const imageUploadLoading: Ref<boolean> = ref(false);

const gameImageUploadSuccess: UploadProps['onSuccess'] = async (response) => {
  try {
    imageUploadLoading.value = true;
    const res = (await requestUploadGameImage(
      gameId,
      response.raw,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      uploadLogoImageUrl.value = res.data.data.gameImageUrl;
      const splitted = res.data.data.gameImageUrl.split('/');
      uploadLogoImageName.value = splitted[splitted.length - 1];
      await props.getGameSettingList();
      imageUploadLoading.value = false;
    } else {
      await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
    imageUploadLoading.value = false;
  }
};

const updateGameSettingInfo = async () => {
  try {
    const data: requestUpdateGameDetailType = {
      gameImgUrl: uploadLogoImageUrl.value,
      isEnabled: gameData.value.isEnabled,
      gameBetList: gameData.value.gameBetList,
    };
    const res = (await requestUpdateGameInfo(gameId, data)) as AxiosResponse;

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
      await props.getGameSettingList();
      closeModal(EXTRA_SERVICE_GAME_RESTRICTION_SETTING);
    } else {
      await ElMessageBox.alert(res.data.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getBettingName = (betType: string) => {
  if (betType === 'GOODS') return '상품 내기';
  if (betType === 'CUSTOM') return '자유 내기';
  if (betType === 'BILL') return '전체 계산하기';
  return '';
};

const isBetBillType = (bet: gameSettingBetType) => bet.gameBetType === 'BILL';

getGameDetail();
</script>

<template>
  <el-dialog
    v-model="flag.gameRestrictionSetting"
    class="game-setting-dialog"
    top="2vh"
    width="37%"
  >
    <div class="detail-service-title mb-20">
      <span class="ml-10"> 모든 매장 게임 이용 설정 </span>
    </div>
    <p class="detail-service-title-notice essential-star mb-20">
      ※ 매장에서 개별적으로 적용한 게임 설정과 관계없이<br />
      모든 매장 게임 설정을 강제로 제한할 수 있습니다.
    </p>
    <el-descriptions
      :column="1"
      border
    >
      <el-descriptions-item
        label="게임 코드"
        label-align="center"
        width="110"
      >
        <el-input
          v-model="gameData.gameCode"
          disabled
          placeholder="게임 코드"
        />
      </el-descriptions-item>
      <el-descriptions-item
        label="게임명"
        label-align="center"
        width="110"
      >
        <el-input
          v-model="gameData.gameName"
          disabled
          placeholder="게임명"
        />
      </el-descriptions-item>
      <el-descriptions-item
        label="게임 이미지"
        label-align="center"
        width="110"
      >
        <div class="image-uploader-wrap">
          <el-upload
            v-loading.lock="imageUploadLoading"
            :auto-upload="false"
            :on-change="gameImageUploadSuccess"
            :show-file-list="false"
            class="mr-5 image-uploader-box"
            drag
          >
            <div>
              <el-image
                :src="uploadLogoImageUrl"
                alt="upload-image"
                class="upload-image"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </el-upload>

          <div class="image-uploader-right ml-10">
            <p class="image-upload-name mb-10">
              {{ uploadLogoImageName }}
            </p>
            <el-upload
              v-loading.lock="imageUploadLoading"
              :auto-upload="false"
              :on-change="gameImageUploadSuccess"
              :show-file-list="false"
            >
              <template #trigger>
                <el-button type="primary"> 기기에서 파일 선택</el-button>
              </template>
            </el-upload>
          </div>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        label="게임 이용 여부"
        label-align="center"
        width="110"
      >
        <el-radio-group
          v-model="gameData.isEnabled"
          class="ml-4"
        >
          <el-radio :label="true"> 사용</el-radio>
          <el-radio :label="false"> 미사용</el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item
        label="내기 종류 선택"
        label-align="center"
        width="110"
      >
        <p class="mt-5 ml-5">
          ※ 최대 인원수 설정: 매장에서 설정 가능한 게임 참여 인원수 설정.<br />
          ex) 최대 인원수 설정이 2명일 경우, 매장에서 설정 가능한 인원수는
          동일하게 2명.<br />
          ex) 최대 인원수 설정이 4명일 경우, 매장에서 설정 가능한 인원수는
          2~4명.
        </p>
        <el-table
          :data="gameData.gameBetList"
          border
          class="bet-table mt-20"
        >
          <el-table-column label="내기 사용 여부">
            <template #default="{ row }">
              <el-checkbox v-model="row.isEnabled" />
              <span class="ml-10">
                {{ getBettingName(row.gameBetType) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="최대 인원수 설정">
            <template #default="{ row }">
              <span
                v-if="isBetBillType(row)"
                class="ml-10"
              >
                {{ row.maxPlayerCount }}
              </span>
              <el-select
                v-else
                v-model="row.maxPlayerCount"
                :disabled="row.gameBetType === 'BILL'"
                placeholder="최대 인원수"
              >
                <el-option
                  :value="2"
                  label="2"
                />
                <el-option
                  :value="3"
                  label="3"
                />
                <el-option
                  :value="4"
                  label="4"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-row
        align="middle"
        justify="center"
      >
        <el-button
          type="danger"
          @click="closeModal(EXTRA_SERVICE_GAME_RESTRICTION_SETTING)"
        >
          취소
        </el-button>
        <el-button
          type="primary"
          @click="updateGameSettingInfo"
        >
          확인
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-service-title {
  font-size: 22px;
  border-left: 4px solid #000;
}

.detail-service-title-notice {
  font-size: 16px;
}

.image-uploader-box {
  width: 190px;

  &:deep(.el-upload-dragger) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 190px;
  }
}

.image-uploader-wrap {
  display: flex;
  width: fit-content;

  .image-uploader-right {
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
}

.bet-table {
  width: 70%;
}
</style>
