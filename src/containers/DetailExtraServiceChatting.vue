<script setup lang="ts">
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { Close } from '@element-plus/icons-vue';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestDetailChattingInfoList,
  requestSaveDetailChattingInfo,
  requestDetailChattingQuickMessageList,
  requestSaveDetailChattingQuickMessage,
} = extraService;
const { requestChattingInfoListCodec, requestChattingQuickListCodec } =
  extraServiceCodec;

const chattingInfoData = reactive({
  infoMessage: '',
  quickMessage: '',
});

/** 매장 상세 - 채팅 안내 정보 리스트 */
const chattingInfoList: Ref<string[]> = ref([]);
const getChattingInfoList = async () => {
  try {
    const res = (await requestDetailChattingInfoList(
      storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(requestChattingInfoListCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        chattingInfoList.value = res.data.data.guideMessageList;
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

/** 매장 상세 - 채팅 안내 문구 저장하기 */
const postSaveChattingInfoList = async () => {
  const requestData = storeCode;
  const messageData = { guideMessageList: chattingInfoList.value };

  try {
    const res = (await requestSaveDetailChattingInfo(
      requestData,
      messageData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '저장되었습니다.',
      });
      await getChattingInfoList();
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

/** 매장 상세 - 퀵 메시지 리스트 */
const chattingQuickMessageList: Ref<string[]> = ref([]);
const getChattingQuickMessageList = async () => {
  const requestData = storeCode;

  try {
    const res = (await requestDetailChattingQuickMessageList(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestChattingQuickListCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        chattingQuickMessageList.value = res.data.data.quickMessageList;
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

/** 매장 상세 - 퀵 메시지 저장하기 */
const postSaveChattingQuickMessageList = async () => {
  const messageData = { quickMessageList: chattingQuickMessageList.value };

  try {
    const res = (await requestSaveDetailChattingQuickMessage(
      storeCode,
      messageData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '저장되었습니다.',
      });
      // getChattingQuickMessageList();
    } else {
      await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 안내 문구 추가하기 */
const addChattingInfo = () => {
  if (chattingInfoData.infoMessage.length === 0) {
    ElMessage({
      type: 'error',
      message: '안내 문구를 입력해주세요.',
    });
    return;
  }
  chattingInfoList.value.push(chattingInfoData.infoMessage);
  chattingInfoData.infoMessage = '';
  ElMessage({
    type: 'success',
    message: '메시지가 추가되었습니다.',
  });
};

/** 안내 문구 삭제 */
const deleteTargetChattingInfo = (index: number) => {
  chattingInfoList.value.splice(index, 1);
  ElMessage({
    type: 'success',
    message: '메시지가 삭제되었습니다.',
  });
};

/** 퀵 메세지 추가하기 */
const addChattingQuick = (e: Event) => {
  if (chattingInfoData.quickMessage.length === 0) {
    ElMessage({
      type: 'error',
      message: '퀵메시지를 입력해주세요.',
    });
    return;
  }
  chattingQuickMessageList.value.push(chattingInfoData.quickMessage);
  chattingInfoData.quickMessage = '';
  ElMessage({
    type: 'success',
    message: '메시지가 추가되었습니다.',
  });
  e.stopPropagation();
};

/** 퀵 메세지 삭제 */
const deleteTargetChattingQuick = (index: number) => {
  chattingQuickMessageList.value.splice(index, 1);
  ElMessage({
    type: 'success',
    message: '메시지가 삭제되었습니다.',
  });
};

getChattingInfoList();
getChattingQuickMessageList();
</script>

<template>
  <div class="detail-service-title mb-20">
    <span> 채팅 안내 문구 설정 </span>
  </div>
  <p class="font-small gray-word mb-10">
    채팅 서비스를 이용하시는 고객에게 안내 사항을 입력해주세요. 10개까지 입력
    하실 수 있습니다.
  </p>
  <el-row
    align="bottom"
    class="mb-20"
  >
    <el-input
      v-model="chattingInfoData.infoMessage"
      :rows="5"
      type="textarea"
      placeholder="안내 문구를 입력해주세요"
      maxlength="100"
      show-word-limit
      class="detail-service-chatting-textarea mr-10"
      @keyup.enter="addChattingInfo"
    />
    <el-button
      type="primary"
      class="detail-service-button"
      @click="addChattingInfo"
    >
      추가
    </el-button>
  </el-row>
  <el-card
    class="mb-10"
    shadow="never"
  >
    <el-scrollbar height="400px">
      <draggable
        v-model="chattingInfoList"
        item-key="info"
        ghost-class="draggable-ghost"
        class="detail-service-chatting-grid"
      >
        <template #item="{ element, index }">
          <div class="detail-service-chatting-item">
            <p>
              {{ element }}
            </p>
            <el-button
              :icon="Close"
              circle
              plain
              text
              type="info"
              @click="deleteTargetChattingInfo(index)"
            />
          </div>
        </template>
      </draggable>
    </el-scrollbar>
  </el-card>
  <el-row
    align="middle"
    justify="end"
    class="mb-20"
  >
    <el-button
      type="primary"
      class="detail-service-button"
      @click="postSaveChattingInfoList"
    >
      저장
    </el-button>
  </el-row>
  <div class="detail-service-title mb-20">
    <span> 퀵메시지 문구 설정 </span>
  </div>
  <p class="font-small gray-word mb-10">
    퀵메시지로 설정하실 내용을 설정해주세요.
  </p>
  <el-row class="mb-10">
    <el-input
      v-model="chattingInfoData.quickMessage"
      maxlength="10"
      show-word-limit
      placeholder="10자 이내로 입력해주세요."
      class="detail-service-chatting-quick-input mr-10"
      @keyup.enter="addChattingQuick"
    />
    <el-button
      type="primary"
      class="detail-service-button"
      @click="addChattingQuick"
    >
      추가
    </el-button>
  </el-row>
  <el-card
    class="mb-10"
    shadow="never"
  >
    <el-scrollbar height="400px">
      <draggable
        v-model="chattingQuickMessageList"
        item-key="quick"
        ghost-class="draggable-ghost"
        class="detail-service-chatting-quick-grid"
      >
        <template #item="{ element, index }">
          <div class="detail-service-chatting-quick-item">
            <p>
              {{ element }}
            </p>
            <el-button
              :icon="Close"
              circle
              type="info"
              plain
              @click="deleteTargetChattingQuick(index)"
            />
          </div>
        </template>
      </draggable>
    </el-scrollbar>
  </el-card>
  <el-row
    align="middle"
    justify="end"
  >
    <el-button
      type="primary"
      class="detail-service-button"
      @click="postSaveChattingQuickMessageList"
    >
      저장
    </el-button>
  </el-row>
</template>

<style lang="scss" scoped>
.draggable-ghost {
  background: #dedfe0;
  opacity: 0.5;
}
.detail-service-title {
  border-left: 4px solid #000;
  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.detail-service-button {
  width: 110px;
}

.detail-service-chatting-textarea {
  width: 40%;
}

.detail-service-chatting-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .detail-service-chatting-item {
    display: flex;
    gap: 60px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 30px;
    font-size: 18px;
    line-height: 30px;
    border: 1px solid #000;
    border-radius: 10px;
  }
}

.detail-service-chatting-quick-input {
  width: 30%;
}

.detail-service-chatting-quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;

  .detail-service-chatting-quick-item {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border: 1px solid #000;
    border-radius: 10px;
  }
}
</style>
