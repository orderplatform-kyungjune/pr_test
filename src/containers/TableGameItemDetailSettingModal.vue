<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { tableGameGoodsListType } from '@interface/extraService';
import { TABLE_GAME_ITEM_DETAIL_SETTING } from '@common/string';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { flag, closeModal } = useModalStore();
const { runtimeCheck } = runtimeCheckHelper;
const { refinedToday, refinedTime } = dateFormatterUtil;
const {
  requestTableGameGoodsList,
  requestCreateTableGameSetting,
  requestDeleteTableGameSetting,
} = extraService;
const { tableGameGoodsListCodec } = extraServiceCodec;

const props = defineProps<{
  getTableGameGiftSettingList: () => Promise<void>;
}>();

const tableGameGoodsList: Ref<tableGameGoodsListType[]> = ref([]);
const getTableGameGoodList = async () => {
  try {
    const res = (await requestTableGameGoodsList(storeCode)) as AxiosResponse;
    const typeError = runtimeCheck(tableGameGoodsListCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        tableGameGoodsList.value = res.data.data;
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

/** 상품 불러오기 상품 등록 */
const postCreateTableGameGiftSetting = async (goodsName: string) => {
  try {
    const res = (await requestCreateTableGameSetting(
      storeCode,
      goodsName,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      return true;
    }
    await ElMessageBox.alert(res.data.resultMessage, '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/** 상품 불러오기 상품 삭제 */
const deleteTableGameGiftSetting = async (goodsName: string) => {
  try {
    const res = (await requestDeleteTableGameSetting(
      storeCode,
      goodsName,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      return true;
    }
    await ElMessageBox.alert(res.data.resultMessage, '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/** 상품 불러오기 확인 버튼 클릭 */
const applyGameGiftList = async () => {
  const registerGameList = tableGameGoodsList.value.filter((item) => {
    const isGoodsType = item.goodsType === 'GOODS';
    const isFromStatus = item.fromStatus === false;
    const isToStatus = item.toStatus === true;
    const isRegistrable = item.isRegistrable === true;

    if (isGoodsType && isFromStatus && isToStatus && isRegistrable) {
      return item?.goodsName;
    }
    return null;
  });

  const deleteGameList = tableGameGoodsList.value.filter((item) => {
    const isGoodsType = item.goodsType === 'GOODS';
    const isFromStatus = item.fromStatus === true;
    const isToStatus = item.toStatus === false;
    const isRegistrable = item.isRegistrable === false;

    if (isGoodsType && isFromStatus && isToStatus && isRegistrable) {
      return item?.goodsName;
    }
    return null;
  });

  const registerGameListString = registerGameList
    .map((item) => item.goodsName)
    ?.join();
  const deleteGameListString = deleteGameList
    .map((item) => item.goodsName)
    ?.join();

  const createResponse = await postCreateTableGameGiftSetting(
    registerGameListString,
  );
  const deleteResponse = await deleteTableGameGiftSetting(deleteGameListString);

  if (createResponse && deleteResponse) {
    await props.getTableGameGiftSettingList();
    ElMessage({
      type: 'success',
      message: '정상적으로 적용 되었습니다.',
    });
    closeModal(TABLE_GAME_ITEM_DETAIL_SETTING);
  }
};

const getBooleanName = (state: boolean) => (state ? 'O' : 'X');
const getResultName = (state: boolean) => (state ? '사용 가능' : '사용 불가');
const getGoodsType = (type: string) => {
  if (type === 'WIN_GOODS') return '승리 상품';
  if (type === 'LOSE_GOODS') return '패배 상품';

  return '기준 상품';
};
const isEmptyData = () => tableGameGoodsList.value[0]?.goodsName !== null;

getTableGameGoodList();
</script>

<template>
  <el-dialog
    v-model="flag.tableGameItemDetailSetting"
    width="40%"
  >
    <div v-if="isEmptyData()">
      <div class="mb-20">
        해당 상품
        <span class="table-game-item-desc">연동 정보</span>
        가 변경되었습니다.
      </div>
      <el-table
        :data="tableGameGoodsList"
        :height="440"
        border
      >
        <el-table-column
          align="center"
          header-align="center"
          label="순번"
          type="index"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="상품명"
          prop="goodsName"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="상품 분류"
        >
          <template #default="{ row }">
            {{ getGoodsType(row.goodsType) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="변경 전"
        >
          <template #default="{ row }">
            <p
              :class="{ not: !row.fromStatus }"
              class="table-game-item-state"
            >
              {{ getBooleanName(row.fromStatus) }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="변경 후"
        >
          <template #default="{ row }">
            <p
              :class="{ not: !row.toStatus }"
              class="table-game-item-state"
            >
              {{ getBooleanName(row.toStatus) }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="결과"
          width="120"
        >
          <template #default="{ row }">
            <p
              :class="{ not: !row.isRegistrable }"
              class="table-game-item-state"
            >
              {{ getResultName(row.isRegistrable) }}
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      v-else
      class="table-game-empty-container"
    >
      <p>상품 연동에 변경 사항이 없습니다.</p>
      <span> ({{ refinedToday() }} {{ refinedTime() }}) </span>
    </div>
    <template #footer>
      <el-row justify="center">
        <el-button
          v-if="isEmptyData()"
          type="primary"
          @click="applyGameGiftList"
        >
          확인
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.table-game-item-desc {
  font-size: 16px;
  font-weight: bold;
}

.table-game-item-state {
  &.not {
    color: red;
  }
}

.table-game-empty-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 30px;

  span {
    font-size: 22px;
  }
}
</style>
