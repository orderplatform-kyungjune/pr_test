<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { requestTableGameDetailInfoType } from '@interface/extraService';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { flag, modalData } = useModalStore();
const { runtimeCheck } = runtimeCheckHelper;
const { requestTableGameDetailInfo } = extraService;
const { requestTableGameDetailRoomInfoCodec } = extraServiceCodec;

/** 테이블 게임 내역 불러오기 */
const tableGameHistory: Ref<requestTableGameDetailInfoType> = ref(
  {} as requestTableGameDetailInfoType,
);
const getTableGameHistory = async () => {
  try {
    const res = (await requestTableGameDetailInfo(
      modalData.inquiryDetailTableGame,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestTableGameDetailRoomInfoCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGameHistory.value = res.data.data;
      }
    } else {
      ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getTableGameStatsName = (stat: string) => {
  if (stat === 'PRE_GAME') return '대기';
  if (stat === 'APP_LOADING_GAME') return '대기';
  if (stat === 'ON_GAME') return '진행 중';
  if (stat === 'END_GAME') return '완료';
  if (stat === 'PRE_GAME_EXPIRE') return '대기 이탈';
  if (stat === 'LOADING_GAME_EXPIRE') return '대기 이탈';
  if (stat === 'ON_GAME_EXPIRE') return '진행 중 이탈';
  if (stat === 'ERROR') return '에러';
  return '';
};

const getTableGameBetName = (bet: string) => {
  if (bet === 'GOODS') return '상품 내기';
  if (bet === 'CUSTOM') return '자유 내기';
  if (bet === 'BILL') return '계산하기 내기';

  return '';
};

getTableGameHistory();
</script>

<template>
  <el-dialog
    v-model="flag.inquiryDetailTableGame"
    width="70%"
  >
    <div class="detail-service-title mb-20">
      <span> 게임 상세 조회 </span>
    </div>
    <el-descriptions
      :column="8"
      border
      class="mb-20"
      direction="vertical"
    >
      <el-descriptions-item
        align="center"
        label="매장명"
        label-align="center"
      >
        {{ tableGameHistory.storeName }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="게임방코드"
        label-align="center"
      >
        {{ tableGameHistory.gameRoomCode }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="실행 게임"
        label-align="center"
      >
        {{ tableGameHistory.gameName }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="내기 종류"
        label-align="center"
      >
        {{ getTableGameBetName(tableGameHistory.betType) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="내기 상세"
        label-align="center"
      >
        {{ tableGameHistory.betDetail }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="승리 테이블"
        label-align="center"
      >
        {{ tableGameHistory.victoryTableList?.join() }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="패배테이블"
        label-align="center"
      >
        {{ tableGameHistory.defeatTableList?.join() }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="상태"
        label-align="center"
      >
        {{ getTableGameStatsName(tableGameHistory.status) }}
      </el-descriptions-item>
    </el-descriptions>
    <el-table
      :data="tableGameHistory.roomEventList"
      :height="400"
      border
    >
      <el-table-column
        align="center"
        header-align="center"
        label="번호"
        prop="no"
        width="100"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="시간"
        prop="eventDateTime"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="테이블 구분"
        prop="todTaId"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="상태 코드"
        prop="eventCode"
        width="140"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="상세"
        prop="eventDescription"
      />
    </el-table>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}
</style>
