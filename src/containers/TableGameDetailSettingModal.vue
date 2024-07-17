<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestTableGameSettingListBetType,
  requestTableGameSettingListDtoType,
} from '@interface/extraService';
import { Picture } from '@element-plus/icons-vue';
import { TABLE_GAME_DETAIL_SETTING } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const props = defineProps<{
  getTableGameSettingList: () => Promise<void>;
}>();

const { query } = useRoute();
const storeCode = query.code as string;

const { flag, closeModal, modalData } = useModalStore();

const { requestTableGameDetail, requestUpdateTableGame } = extraService;

const { runtimeCheck } = runtimeCheckHelper;
const { responseTableGameSettingDtoCodec } = extraServiceCodec;

const tableGameData: Ref<requestTableGameSettingListDtoType> = ref(
  {} as requestTableGameSettingListDtoType,
);

/** 내기 순서: 수정 가능/불가능 구분 */
const arrangeableOrderBets: Ref<requestTableGameSettingListBetType[]> = ref([]);
const fixedOrderBets: Ref<requestTableGameSettingListBetType[]> = ref([]);
const sortBetsByOrderType = () => {
  tableGameData.value.gameBetList.forEach(
    (bet: requestTableGameSettingListBetType) => {
      if (!bet.isMasterEnabled) {
        fixedOrderBets.value.push(bet);
      } else {
        arrangeableOrderBets.value.push(bet);
      }
    },
  );
};

const getTableGameDetail = async () => {
  const gameId = modalData.tableGameDetailSetting;
  const res = (await requestTableGameDetail(
    storeCode,
    gameId,
  )) as AxiosResponse;
  const typeError = runtimeCheck(
    responseTableGameSettingDtoCodec,
    res.data.data,
  );

  if (res.data.resultCode === 200) {
    if (!typeError) {
      tableGameData.value = res.data.data;
      sortBetsByOrderType();
    }
  } else {
    await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
  }
};

const patchTableGameSetting = async () => {
  const resetBetList: requestTableGameSettingListBetType[] = [];
  arrangeableOrderBets.value.forEach((bet) => {
    resetBetList.push(bet);
  });
  fixedOrderBets.value.forEach((bet) => {
    resetBetList.push(bet);
  });
  const requestData = {
    gameCode: tableGameData.value.gameCode,
    isEnabled: tableGameData.value.isEnabled,
    gameBetList: resetBetList,
  };
  try {
    const res = (await requestUpdateTableGame(
      query.code as string,
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
      await props.getTableGameSettingList();
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

const getBettingName = (type: string) => {
  if (type === 'GOODS') return '상품 내기';
  if (type === 'CUSTOM') return '자유 내기';
  if (type === 'BILL') return '전체 계산하기';
  return '';
};

const getFixedBetKey = (betCode: string, betIndex: number) =>
  betCode ? `bet-fixed-${betCode}-${betIndex}` : `bet-fixed-${betIndex}`;

const updateTableGameInfo = async () => {
  await patchTableGameSetting();
  closeModal(TABLE_GAME_DETAIL_SETTING);
};

getTableGameDetail();
</script>

<template>
  <el-dialog
    v-model="flag.tableGameDetailSetting"
    center
    width="30%"
  >
    <div class="detail-service-title mb-20">
      <span> 게임 설정 </span>
    </div>
    <el-descriptions
      :column="1"
      border
      class="table-game-setting-description"
    >
      <el-descriptions-item
        align="center"
        label="게임 코드"
        label-align="center"
      >
        <el-input
          v-model="tableGameData.gameCode"
          class="width-100"
          disabled
        />
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="게임명"
        label-align="center"
      >
        <el-input
          v-model="tableGameData.gameName"
          class="width-100"
          disabled
        />
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="게임 이미지"
        label-align="center"
      >
        <el-image
          :src="tableGameData.gameImgUrl"
          class="table-game-setting-image"
        >
          <template #error>
            <el-icon
              :size="26"
              class="table-game-setting-icon"
            >
              <Picture />
            </el-icon>
          </template>
        </el-image>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="게임 이용 여부"
        label-align="center"
      >
        <el-radio-group
          v-model="tableGameData.isEnabled"
          :disabled="!tableGameData.isMasterEnabled"
        >
          <el-radio :label="true"> 사용</el-radio>
          <el-radio :label="false"> 미사용</el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="내기 종류 선택"
        label-align="center"
      >
        <table class="table-bet-type-table width-100">
          <thead class="table-bet-type-table-head">
            <tr>
              <th>내기 사용 여부</th>
              <th>최대 인원수 설정</th>
            </tr>
          </thead>
          <draggable
            v-model="arrangeableOrderBets"
            item-key="gameOrderSetting"
            tag="tbody"
          >
            <template #item="{ element }">
              <tr>
                <td>
                  <el-row align="middle">
                    <el-checkbox
                      v-model="element.isEnabled"
                      :disabled="!tableGameData.isMasterEnabled"
                    />
                    <span class="ml-10">
                      {{ getBettingName(element.gameBetType) }}
                    </span>
                  </el-row>
                </td>
                <td>
                  <el-select
                    v-if="element.gameBetType !== 'BILL'"
                    v-model="element.maxPlayerCount"
                    :disabled="!tableGameData.isMasterEnabled"
                  >
                    <el-option
                      :label="2"
                      :value="2"
                    />
                    <el-option
                      :label="3"
                      :value="3"
                    />
                    <el-option
                      :label="4"
                      :value="4"
                    />
                  </el-select>
                  <span
                    v-else
                    class="ml-10"
                  >
                    {{ element.maxPlayerCount }}
                  </span>
                </td>
              </tr>
            </template>
          </draggable>
          <tbody>
            <tr
              v-for="(bet, betIndex) in fixedOrderBets"
              :key="getFixedBetKey(bet.gameBetType, betIndex)"
              class="bet-types-fixed"
            >
              <td>
                <el-checkbox
                  v-model="bet.isEnabled"
                  disabled
                />
                <span class="ml-10">
                  {{ getBettingName(bet.gameBetType) }}
                </span>
              </td>
              <td>
                <span class="ml-10">
                  {{ bet.maxPlayerCount }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-row
        align="middle"
        justify="center"
      >
        <el-button
          type="danger"
          @click="closeModal(TABLE_GAME_DETAIL_SETTING)"
        >
          취소
        </el-button>
        <el-button
          :disabled="!tableGameData.isMasterEnabled"
          type="primary"
          @click="updateTableGameInfo"
        >
          확인
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  vertical-align: middle;
}

.table-game-setting-description {
  overflow: scroll;
}

.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 22px;
  }
}

.table-game-setting-image {
  width: 120px;
  height: 120px;

  .table-game-setting-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}

.table-bet-type-table {
  .table-bet-type-table-head {
    th {
      width: 50%;
      padding: 8px;
      line-height: 23px;
      color: var(--el-text-color-secondary);
      text-align: left;
    }
  }

  th,
  td {
    padding: 5px;
    text-align: left;
    border: 1px solid #e9e9eb;
  }

  .bet-types-fixed {
    background-color: var(--el-color-info-light-9);
  }
}
</style>
