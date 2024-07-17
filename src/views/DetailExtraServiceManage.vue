<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  DetailExtraServiceTableGameList,
  DetailExtraServiceTableGameSetting,
  DetailExtraServiceChatting,
  DetailExtraServiceAuctionSchedule,
  DetailExtraServiceAuctionHistory,
  DetailExtraServiceJackpotSchedule,
  DetailExtraServiceJackpotHistory,
  DetailExtraServiceSeatingPlan,
  ExtraServiceSettingHistoryModal,
} from '@containers';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import {
  EXTRA_SERVICE_MANAGE,
  DETAIL_EXTRA_SERVICE,
  SERVICE_SETTING_HISTORY,
} from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const dailyOrderStatisticsHeader = reactive([
  { name: EXTRA_SERVICE_MANAGE },
  { name: DETAIL_EXTRA_SERVICE },
]);

const route = useRoute();
const storeCode = route.query.code as string;

const { flag, openModal } = useModalStore();

const { requestDetailStoreInfo, requestUpdateStoreInfo } = extraService;
const { responseExtraServiceStoreInfoCodec } = extraServiceCodec;
const { runtimeCheck } = runtimeCheckHelper;

const detailStoreInfo = reactive({
  torderWebVersion: '',
  masterWebVersion: '',
  torderAppVersion: '',
  chattingUsed: false,
  chattingDisplay: false,
  auctionUsed: false,
  jackpotUsed: false,
  tableGameUsed: false,
  tableGameDisplay: false,
  zepUsed: false,
  zepDisplay: false,
});

const isTableGameUseState = ref(false);
const isAuctionUseState = ref(false);
const isJackpotUseState = ref(false);
const isChattingUseState = ref(false);

const activeTabs = ref('tableGame');

const isActiveTabs = (id: string) => activeTabs.value === id;

/** 매장 상세 정보 불러오기 */
const getDetailStoreInfo = async () => {
  try {
    const res = (await requestDetailStoreInfo(storeCode)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceStoreInfoCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        detailStoreInfo.torderWebVersion =
          res.data.data.version.torderWebVersion;
        detailStoreInfo.masterWebVersion =
          res.data.data.version.masterWebVersion;
        detailStoreInfo.torderAppVersion =
          res.data.data.version.torderAppVersion;
        detailStoreInfo.chattingUsed = res.data.data.chatting.isUsed;
        detailStoreInfo.chattingDisplay = res.data.data.chatting.isIconDisplay;
        detailStoreInfo.auctionUsed = res.data.data.auction.isUsed;
        isTableGameUseState.value = res.data.data.tableGame.isUsed;
        isAuctionUseState.value = res.data.data.auction.isUsed;
        isJackpotUseState.value = res.data.data.jackpot.isUsed;
        isChattingUseState.value = res.data.data.chatting.isUsed;
        detailStoreInfo.jackpotUsed = res.data.data.jackpot.isUsed;
        detailStoreInfo.tableGameUsed = res.data.data.tableGame.isUsed;
        detailStoreInfo.tableGameDisplay =
          res.data.data.tableGame.isIconDisplay;
        detailStoreInfo.zepUsed = res.data.data.zep.isUsed;
        detailStoreInfo.zepDisplay = res.data.data.zep.isIconDisplay;

        if (isTableGameUseState.value) {
          activeTabs.value = 'tableGame';
        } else if (isChattingUseState.value) {
          activeTabs.value = 'chatting';
        } else {
          activeTabs.value = 'seatingPlan';
        }
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

/** 매장 상세 정보 수정하기 */
const putUpdateStoreInfo = async () => {
  const requestData = {
    entertainmentList: [
      {
        entertainmentCode: 'CHATTING',
        isUsed: detailStoreInfo.chattingUsed,
        isIconDisplay: detailStoreInfo.chattingDisplay,
      },
      {
        entertainmentCode: 'AUCTION',
        isUsed: detailStoreInfo.auctionUsed,
      },
      {
        entertainmentCode: 'JACKPOT',
        isUsed: detailStoreInfo.jackpotUsed,
      },
      {
        entertainmentCode: 'TABLE_GAME',
        isUsed: detailStoreInfo.tableGameUsed,
        isIconDisplay: detailStoreInfo.tableGameDisplay,
      },
      {
        entertainmentCode: 'ZEP',
        isUsed: detailStoreInfo.zepUsed,
        isIconDisplay: detailStoreInfo.zepDisplay,
      },
    ],
  };

  try {
    const res = (await requestUpdateStoreInfo(
      storeCode,
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '정상적으로 변경되었습니다.',
      });
      await getDetailStoreInfo();
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

const confirmUpdateStoreInfo = () => {
  ElMessageBox.confirm(
    '사용 여부, 노출 여부 설정을 변경하시겠습니까?',
    '경고',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      putUpdateStoreInfo();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const disabledAuction = ref(false);
const disabledJackpot = ref(false);
const notUseChatting = (state: boolean) => {
  if (!state) {
    detailStoreInfo.auctionUsed = false;
    detailStoreInfo.jackpotUsed = false;
    disabledAuction.value = true;
    disabledJackpot.value = true;
  } else {
    disabledAuction.value = false;
    disabledJackpot.value = false;
  }
};

watchEffect(() => {
  if (detailStoreInfo.chattingUsed) {
    disabledAuction.value = false;
    disabledJackpot.value = false;
  } else {
    disabledAuction.value = true;
    disabledJackpot.value = true;
  }
});

getDetailStoreInfo();
</script>

<template>
  <ExtraServiceSettingHistoryModal v-if="flag.extraServiceSettingHistory" />
  <BreadcrumbHeader :propsHeader="dailyOrderStatisticsHeader" />
  <StoreNameBox />
  <el-divider class="detail-extra-service-divider" />
  <div class="detail-service-title mb-10">
    <span> 기본 정보 </span>
  </div>
  <el-descriptions
    :column="4"
    border
    class="mb-20"
    direction="vertical"
  >
    <el-descriptions-item
      align="center"
      label="티오더 웹 버전"
      label-align="center"
    >
      {{ detailStoreInfo.torderWebVersion }}
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="마스터 웹 버전"
      label-align="center"
    >
      {{ detailStoreInfo.masterWebVersion }}
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="티오더 앱 버전"
      label-align="center"
    >
      {{ detailStoreInfo.torderAppVersion }}
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="게임 앱 버전"
      label-align="center"
    >
      -
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <div class="detail-service-title">
      <span> 서비스 설정 </span>
    </div>
    <el-button
      size="small"
      type="info"
      @click="openModal(SERVICE_SETTING_HISTORY)"
    >
      변경 이력
    </el-button>
  </el-row>
  <el-descriptions
    :column="2"
    border
    class="mb-10"
  >
    <el-descriptions-item
      align="center"
      label="채팅"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group
        v-model="detailStoreInfo.chattingUsed"
        @change="notUseChatting"
      >
        <el-radio :label="false"> 미사용</el-radio>
        <el-radio :label="true"> 사용</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="태블릿 노출"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group v-model="detailStoreInfo.chattingDisplay">
        <el-radio :label="false"> 미노출</el-radio>
        <el-radio :label="true"> 노출</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="경매"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group
        v-model="detailStoreInfo.auctionUsed"
        :disabled="disabledAuction"
      >
        <el-radio :label="false"> 미사용</el-radio>
        <el-radio :label="true"> 사용</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="-"
      label-align="center"
      label-class-name="extra-service-label"
    />
    <el-descriptions-item
      align="center"
      label="잭팟"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group
        v-model="detailStoreInfo.jackpotUsed"
        :disabled="disabledJackpot"
      >
        <el-radio :label="false"> 미사용</el-radio>
        <el-radio :label="true"> 사용</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="-"
      label-align="center"
      label-class-name="extra-service-label"
    />
    <el-descriptions-item
      align="center"
      label="테이블게임"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group v-model="detailStoreInfo.tableGameUsed">
        <el-radio :label="false"> 미사용</el-radio>
        <el-radio :label="true"> 사용</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="태블릿 노출"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group v-model="detailStoreInfo.tableGameDisplay">
        <el-radio :label="false"> 미노출</el-radio>
        <el-radio :label="true"> 노출</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="ZEP(영상대화)"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group v-model="detailStoreInfo.zepUsed">
        <el-radio :label="false"> 미사용</el-radio>
        <el-radio :label="true"> 사용</el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      align="center"
      label="태블릿 노출"
      label-align="center"
      label-class-name="extra-service-label"
    >
      <el-radio-group v-model="detailStoreInfo.zepDisplay">
        <el-radio :label="false"> 미노출</el-radio>
        <el-radio :label="true"> 노출</el-radio>
      </el-radio-group>
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    justify="end"
  >
    <el-button
      class="detail-service-button mb-10"
      type="primary"
      @click="confirmUpdateStoreInfo"
    >
      저장
    </el-button>
  </el-row>
  <el-tabs
    v-model="activeTabs"
    type="border-card"
  >
    <el-tab-pane
      v-if="isTableGameUseState"
      class="empty-page"
      label="테이블 게임 내역"
      name="tableGame"
    >
      <DetailExtraServiceTableGameList v-if="isActiveTabs('tableGame')" />
    </el-tab-pane>
    <el-tab-pane
      v-if="isTableGameUseState"
      class="empty-page"
      label="테이블 게임 설정"
      name="tableSetting"
    >
      <DetailExtraServiceTableGameSetting v-if="isActiveTabs('tableSetting')" />
    </el-tab-pane>
    <el-tab-pane
      v-if="isChattingUseState"
      class="empty-page"
      label="채팅 설정"
      name="chatting"
    >
      <DetailExtraServiceChatting v-if="isActiveTabs('chatting')" />
    </el-tab-pane>
    <el-tab-pane
      v-if="isAuctionUseState"
      class="empty-page"
      label="경매 스케줄 관리"
      name="auctionSchedule"
    >
      <DetailExtraServiceAuctionSchedule
        v-if="isActiveTabs('auctionSchedule')"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="isAuctionUseState"
      class="empty-page"
      label="경매 내역"
      name="auctionHistory"
    >
      <DetailExtraServiceAuctionHistory v-if="isActiveTabs('auctionHistory')" />
    </el-tab-pane>
    <el-tab-pane
      v-if="isJackpotUseState"
      class="empty-page"
      label="잭팟 스케줄 관리"
      name="jackpotSchedule"
    >
      <DetailExtraServiceJackpotSchedule
        v-if="isActiveTabs('jackpotSchedule')"
      />
    </el-tab-pane>
    <el-tab-pane
      v-if="isJackpotUseState"
      class="empty-page"
      label="잭팟 내역"
      name="jackpotHistory"
    >
      <DetailExtraServiceJackpotHistory v-if="isActiveTabs('jackpotHistory')" />
    </el-tab-pane>
    <el-tab-pane
      class="empty-page"
      label="좌석 배치도"
      name="seatingPlan"
    >
      <DetailExtraServiceSeatingPlan v-if="isActiveTabs('seatingPlan')" />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.detail-extra-service-divider {
  margin: 0 0 15px 0;
}

:deep(.el-tabs__content) {
  padding: 30px !important;
}

.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

:deep(.extra-service-label) {
  width: 15%;
}

.detail-service-button {
  width: 100px;
}

.empty-page {
  min-height: 500px;
}
</style>
