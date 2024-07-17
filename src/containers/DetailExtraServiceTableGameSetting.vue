<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { ref, Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  requestTableGameGiftSettingListType,
  requestTableGameGoodsErrorStatusType,
  requestTableGamePrizeGoodsType,
  requestTableGameSettingListBetType,
  requestTableGameSettingListType,
  requestTableGameTorderGoodsListType,
  responseGameGoodsAvailabilityDtoType,
} from '@interface/extraService';
import { Picture, Right } from '@element-plus/icons-vue';
import {
  TableGameDetailSettingModal,
  TableGameGiftSettingInfoModal,
  TableGameItemDetailSettingModal,
} from '@containers';
import {
  TABLE_GAME_DETAIL_SETTING,
  TABLE_GAME_GIFT_SETTING_INFO,
} from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { flag, openModal, openModalWithData } = useModalStore();
const { runtimeCheck } = runtimeCheckHelper;
const {
  requestTableGameSettingList,
  requestTableGameGiftSettingList,
  requestTableGameTorderGoodsList,
  requestTableGamePrizeGoodsList,
  requestUpdateTableGameGoodsList,
  requestUpdateTableGameSetting,
} = extraService;
const {
  responseTableGameSettingCodec,
  responseExtraServiceGameGiftCodec,
  requestTableGameTorderGoodsCodec,
  requestTableGamePrizeGoodsCodec,
} = extraServiceCodec;

/** 테이블 게임 설정 리스트 불러오기 */
const tableGameSettingList: Ref<requestTableGameSettingListType> = ref(
  {} as requestTableGameSettingListType,
);
const getTableGameSettingList = async () => {
  try {
    const res = (await requestTableGameSettingList(storeCode)) as AxiosResponse;
    const typeError = runtimeCheck(
      responseTableGameSettingCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGameSettingList.value = res.data.data;
      }
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

/** 테이블 게임 상품 리스트 저장하기 */
const updateTableSettingOrder = async () => {
  try {
    const requestData = {
      gameCodeList: tableGameSettingList.value.gameList?.map(
        (item) => item.gameCode,
      ),
    };
    const res = (await requestUpdateTableGameSetting(
      storeCode,
      requestData,
    )) as AxiosResponse;
    if (res.data.resultCode === 200) {
      ElMessage({
        type: 'success',
        message: '변경 사항이 저장되었습니다.',
      });
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

/** 게임 설정 취소 버튼 클릭 */
const confirmUpdateTableGamSetting = () => {
  ElMessageBox.confirm('변경 사항을 저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      updateTableSettingOrder();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 게임 설정 취소 버튼 클릭 */
const clickSettingCancelButton = async () => {
  await getTableGameSettingList();
  ElMessage({
    type: 'info',
    message: '변경 사항이 초기화 되었습니다.',
  });
};

/** 테이블 게임 상품 설정 리스트 불러오기 */
const tableGameDtoData: Ref<responseGameGoodsAvailabilityDtoType> = ref(
  {} as responseGameGoodsAvailabilityDtoType,
);
const tableGameGiftSettingList: Ref<requestTableGameGiftSettingListType[]> =
  ref([]);
const getTableGameGiftSettingList = async () => {
  try {
    const res = (await requestTableGameGiftSettingList(
      storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseExtraServiceGameGiftCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGameDtoData.value = res.data.data.gameGoodsAvailabilityDto;
        tableGameGiftSettingList.value = res.data.data.gameGoodsList;
      }
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

/** 테이블 게임 티오더 상품 리스트 불러오기 */
const tableGameTorderGoodsList: Ref<requestTableGameTorderGoodsListType[]> =
  ref([]);
const getTableGameTorderGoodsList = async () => {
  try {
    const res = (await requestTableGameTorderGoodsList(
      storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestTableGameTorderGoodsCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGameTorderGoodsList.value = res.data.data.gameGoodsList;
      }
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

/** 테이블 게임 상품 리스트 불러오기 */
const tableGamePrizeGoodsList: Ref<requestTableGamePrizeGoodsType[]> = ref([]);
const getTableGamePrizeGoodsList = async () => {
  try {
    const res = (await requestTableGamePrizeGoodsList(
      storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      requestTableGamePrizeGoodsCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGamePrizeGoodsList.value = res.data.data.gameGoodsList;
      }
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

/** 테이블 게임 상품 리스트 저장하기 */
const postUpdateTableGameGoodsList = async () => {
  try {
    const requestData = {
      goodsCodeList: tableGamePrizeGoodsList.value?.map(
        (item) => item.goodsCode,
      ),
    };
    const res = (await requestUpdateTableGameGoodsList(
      storeCode,
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode === 201) {
      ElMessage({
        type: 'success',
        message: '변경 사항이 저장되었습니다.',
      });
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

const confirmUpdateTableGameGoodsList = () => {
  ElMessageBox.confirm('변경 사항을 저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      postUpdateTableGameGoodsList();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 게임 상품 리스트 취소 버튼 클릭 */
const clickPrizeCancelButton = async () => {
  await getTableGamePrizeGoodsList();
  ElMessage({
    type: 'info',
    message: '변경 사항이 초기화 되었습니다.',
  });
};

/** draggable 이동 벨리데이션 */
const draggableMoveCheck = (item: any) => {
  const target = item?.draggedContext?.element;

  const isExistItem = tableGamePrizeGoodsList.value.some(
    (goods) => goods.goodsCode === target.goodsCode,
  );

  if (isExistItem) {
    ElMessageBox.alert('이미 존재하는 상품입니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  }

  if (target.originalGoodsStatus !== 'NORMAL') {
    ElMessageBox.alert('기준 상품이 정상이어야 등록할 수 있습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  }

  if (target.winGoodsStatus !== 'NORMAL') {
    ElMessageBox.alert('승리 상품이 정상이어야 등록할 수 있습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  }

  if (target.loseGoodsStatus !== 'NORMAL') {
    ElMessageBox.alert('패배 상품이 정상이어야 등록할 수 있습니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  }

  return true;
};

/** 게임 상품 리스트 삭제 */
const deleteGameGoodsItem = (target: requestTableGamePrizeGoodsType) => {
  ElMessageBox.confirm(
    `${target.goodsName}을 게임 상품에서 삭제하시겠습니까?`,
    '게임 상품 삭제',
    {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      const targetIndex = tableGamePrizeGoodsList.value.findIndex(
        (item) => item.goodsCode === target.goodsCode,
      );
      if (targetIndex !== -1) {
        tableGamePrizeGoodsList.value.splice(targetIndex, 1);
      }
      ElMessage({
        type: 'success',
        message: '삭제되었습니다.',
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 게임 상품 사용중 텍스트 체크 */
const checkTableGameItemUse = (code: string) =>
  tableGamePrizeGoodsList.value.some((item) => item.goodsCode === code);

const setStateName = (state: boolean) => (state ? '사용' : '미사용');

const getGoodsStatus = (code: string) => {
  if (code === 'NORMAL') return '정상';
  if (code === 'NO_PRIZE') return '미등록';
  if (code === 'POS_REMOVED') return '포스 삭제';
  if (code === 'SOLD_OUT') return '품절';
  if (code === 'SALES_SUSPENDED') return '판매 중지';
  return '';
};

const getGoodsStatusColor = (code: string) => {
  if (code === 'NORMAL') return 'goods-status-success';
  return 'goods-status-error';
};

const getGoodsType = (code: string) => {
  if (code === 'GOODS') return '기준 상품';
  if (code === 'WIN_GOODS') return '승리 상품';
  if (code === 'LOSE_GOODS') return '패배 상품';
  return '';
};

const getBetListString = (
  gameBetList: requestTableGameSettingListBetType[],
) => {
  const betTypeMap: { [key: string]: string } = {
    // index signature
    GOODS: '상품 내기',
    CUSTOM: '자유 내기',
    BILL: '전체 계산하기',
  };

  const betList = gameBetList
    .filter((bet: requestTableGameSettingListBetType) => bet.isEnabled)
    .map((bet: requestTableGameSettingListBetType) => {
      const betType = betTypeMap[bet.gameBetType];
      const betString = `${betType} (${bet.maxPlayerCount}명)`;
      return betString;
    });

  return betList.join('<br>');
};

const getPrizeGoodsStatus = (prize: requestTableGameGoodsErrorStatusType) => {
  if (!prize) return '정상';
  return `${getGoodsType(prize?.goodsType)} ${getGoodsStatus(prize?.goodsStatus)}`;
};
const getPrizeStatusColor = (status: requestTableGameGoodsErrorStatusType) => {
  if (!status) {
    return 'table-game-draggable-item-info-title-state goods-status-success';
  }
  return 'table-game-draggable-item-info-title-state goods-status-error';
};

getTableGameSettingList();
getTableGameGiftSettingList();
getTableGameTorderGoodsList();
getTableGamePrizeGoodsList();
</script>

<template>
  <TableGameGiftSettingInfoModal v-if="flag.tableGameGiftSettingInfo" />
  <TableGameDetailSettingModal
    v-if="flag.tableGameDetailSetting"
    :getTableGameSettingList="() => getTableGameSettingList()"
  />
  <TableGameItemDetailSettingModal
    v-if="flag.tableGameItemDetailSetting"
    :getTableGameGiftSettingList="() => getTableGameGiftSettingList()"
  />
  <div class="detail-service-title mb-20">
    <span> 게임 설정 </span>
  </div>
  <table class="table-game-setting-table mb-20 width-100">
    <thead class="table-game-setting-table-head">
      <tr>
        <th>게임코드</th>
        <th>게임 이미지</th>
        <th>게임명</th>
        <th>내기 설정 (최대 인원수)</th>
        <th>사용 여부</th>
        <th>비고</th>
      </tr>
    </thead>
    <draggable
      v-model="tableGameSettingList.gameList"
      item-key="gameOrderSetting"
      tag="tbody"
    >
      <template #item="{ element }">
        <tr>
          <td>
            {{ element.gameCode }}
          </td>
          <td>
            <el-image
              :src="element.gameImgUrl"
              class="table-game-setting-image"
              fit="contain"
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
          </td>
          <td>
            {{ element.gameName }}
          </td>
          <td>
            <p :innerHTML="getBetListString(element.gameBetList)"></p>
          </td>
          <td>
            {{ setStateName(element.isEnabled) }}
          </td>
          <td>
            <el-button
              @click="
                openModalWithData(TABLE_GAME_DETAIL_SETTING, element.gameId)
              "
            >
              설정
            </el-button>
          </td>
        </tr>
      </template>
    </draggable>
  </table>
  <el-row
    align="middle"
    class="mb-20"
    justify="end"
  >
    <el-button
      class="confirm-button"
      type="danger"
      @click="clickSettingCancelButton"
    >
      취소
    </el-button>
    <el-button
      class="confirm-button"
      type="primary"
      @click="confirmUpdateTableGamSetting"
    >
      저장
    </el-button>
  </el-row>
  <el-row
    align="middle"
    class="mb-20 mr-20"
  >
    <div class="detail-service-title mr-20">
      <span> 게임 상품 리스트 </span>
    </div>
    <el-button
      type="info"
      @click="openModal(TABLE_GAME_GIFT_SETTING_INFO)"
    >
      상품 설정 안내
    </el-button>
  </el-row>

  <p class="table-game-goods-list-desc">
    게임 상품로 사용할 상품을 오른쪽으로 이동한 뒤 저장 바랍니다.
  </p>

  <p class="table-game-goods-list-desc mb-20">
    기준 상품이
    <span class="desc-bold"> "미등록" </span>
    되었거나,
    <span class="desc-bold"> "포스 삭제" </span>
    되었을 경우 티오더 상품 리스트에 노출되지 않습니다.
  </p>

  <div class="table-game-container mb-20">
    <div class="width-100">
      <p class="mb-10">티오더 상품 리스트</p>
      <el-scrollbar :height="600">
        <draggable
          v-model="tableGameTorderGoodsList"
          :group="{ name: 'tableGameList', pull: 'clone', put: false }"
          :move="draggableMoveCheck"
          class="table-game-draggable"
          item-key="order"
        >
          <template #item="{ element }">
            <div class="table-game-draggable-item">
              <div class="table-game-draggable-item-image-container">
                <el-image
                  v-if="element.goodsUrl"
                  :src="element.goodsUrl"
                  class="table-game-draggable-item-image"
                  fit="contain"
                />
                <div
                  v-else
                  class="table-game-draggable-item-image-empty"
                >
                  <el-icon :size="20">
                    <Picture />
                  </el-icon>
                </div>
              </div>
              <div class="table-game-draggable-item-info">
                <span class="table-game-draggable-item-info-title">
                  - {{ element.goodsName }}
                </span>
                <el-row
                  align="middle"
                  justify="space-between"
                >
                  <div class="table-game-draggable-item-info-title">
                    - {{ element.goodsPrice?.toLocaleString() }} 원
                  </div>

                  <div
                    v-if="checkTableGameItemUse(element.goodsCode)"
                    class="table-game-draggable-item-info-state"
                  >
                    게임 상품 사용중
                  </div>
                </el-row>
                <el-descriptions
                  :column="3"
                  border
                  direction="vertical"
                >
                  <el-descriptions-item
                    align="center"
                    label="기준 상품"
                    label-align="center"
                  >
                    <span
                      :class="getGoodsStatusColor(element.originalGoodsStatus)"
                    >
                      {{ getGoodsStatus(element.originalGoodsStatus) }}
                    </span>
                  </el-descriptions-item>
                  <el-descriptions-item
                    align="center"
                    label="승리 상품"
                    label-align="center"
                  >
                    <span :class="getGoodsStatusColor(element.winGoodsStatus)">
                      {{ getGoodsStatus(element.winGoodsStatus) }}
                    </span>
                  </el-descriptions-item>
                  <el-descriptions-item
                    align="center"
                    label="패배 상품"
                    label-align="center"
                  >
                    <span :class="getGoodsStatusColor(element.loseGoodsStatus)">
                      {{ getGoodsStatus(element.loseGoodsStatus) }}
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </template>
        </draggable>
      </el-scrollbar>
    </div>
    <el-icon :size="80">
      <Right />
    </el-icon>

    <div class="width-100">
      <p class="mb-10">게임 상품 리스트</p>
      <el-scrollbar :height="600">
        <draggable
          v-model="tableGamePrizeGoodsList"
          class="table-game-draggable"
          group="tableGameList"
          item-key="order2"
        >
          <template #item="{ element }">
            <div class="table-game-draggable-item">
              <div class="table-game-draggable-item-image-container">
                <el-image
                  v-if="element.goodsUrl"
                  :src="element.goodsUrl"
                  class="table-game-draggable-item-image"
                  fit="contain"
                />
                <div
                  v-else
                  class="table-game-draggable-item-image-empty"
                >
                  <el-icon :size="20">
                    <Picture />
                  </el-icon>
                </div>
              </div>
              <div class="table-game-draggable-item-info">
                <el-row
                  align="middle"
                  justify="space-between"
                >
                  <span class="table-game-draggable-item-info-title">
                    - {{ element.goodsName }}
                  </span>
                  <el-button @click="deleteGameGoodsItem(element)">
                    삭제
                  </el-button>
                </el-row>
                <p class="table-game-draggable-item-info-title">
                  - 상품 상태:
                  <span :class="getPrizeStatusColor(element.goodsErrorStatus)">
                    {{ getPrizeGoodsStatus(element.goodsErrorStatus) }}
                  </span>
                </p>
              </div>
            </div>
          </template>
        </draggable>
      </el-scrollbar>
    </div>
  </div>
  <el-row
    align="middle"
    justify="end"
  >
    <el-button
      class="confirm-button"
      type="danger"
      @click="clickPrizeCancelButton"
    >
      취소
    </el-button>
    <el-button
      class="confirm-button"
      type="primary"
      @click="confirmUpdateTableGameGoodsList"
    >
      저장
    </el-button>
  </el-row>
</template>

<style lang="scss" scoped>
.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 18px;
  }
}

.table-game-setting-table {
  padding: 10px;
  font-size: 14px;
  line-height: 23px;

  .table-game-setting-table-head {
    th {
      width: 120px;
      padding: 10px;
      line-height: 23px;
      color: #b1b3b8;
      text-align: center;
    }
  }

  th,
  td {
    padding: 5px;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #e9e9eb;
  }

  tbody {
    tr {
      height: 143px;
    }
  }
}

:deep(.table-game-setting-image-row) {
  display: flex;
  align-items: center;
  justify-content: center;
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

.table-game-goods-list-desc {
  font-size: 15px;
  line-height: 23px;

  .desc-bold {
    font-size: 16px;
    font-weight: bold;
  }
}

.goods-status-success {
  color: #6aa50f;
}

.goods-status-error {
  color: #d9001b;
}

.confirm-button {
  width: 120px;
}

.table-game-container {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid #dcdfe6;

  .table-game-draggable {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 600px;

    .table-game-draggable-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      border: 1px solid #dcdfe6;
      border-radius: 5px;

      .table-game-draggable-item-image-container {
        display: flex;
        align-items: center;
        justify-content: center;

        .table-game-draggable-item-image {
          width: 150px;
          height: 130px;
        }

        .table-game-draggable-item-image-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 150px;
          height: 130px;
          background-color: #f4f4f5;
        }
      }

      .table-game-draggable-item-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;

        .table-game-draggable-item-info-title {
          font-size: 18px;

          .table-game-draggable-item-info-title-state {
            margin-left: 5px;
            font-size: 20px;
            font-weight: bold;
          }
        }

        .table-game-draggable-item-info-state {
          font-size: 22px;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
