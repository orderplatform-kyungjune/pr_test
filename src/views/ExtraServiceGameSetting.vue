<script lang="ts" setup>
import {reactive, ref, Ref} from 'vue';
import {ElMessageBox} from 'element-plus';
import {AxiosResponse} from 'axios';
import {runtimeCheckHelper} from '@utils';
import useModalStore from '@store/storeModal';
import {gameSettingBetType, gameSettingType} from '@interface/extraService';
import {Picture} from '@element-plus/icons-vue';
import {GameRestrictionSettingModal} from '@containers';
import {BreadcrumbHeader} from '@components';
import {
  EXTRA_SERVICE_GAME_RESTRICTION_SETTING,
  EXTRA_SERVICE_GAME_SETTING,
  EXTRA_SERVICE_SETTING,
} from '@common/string';
import {extraServiceCodec} from '@codecs';
import {extraService} from '@apis';

const { flag, openModalWithData } = useModalStore();

const { requestGameSettingList } = extraService;

const extraServiceGameSettingHeader = reactive([
  { name: EXTRA_SERVICE_SETTING },
  { name: EXTRA_SERVICE_GAME_SETTING },
]);

const { runtimeCheck } = runtimeCheckHelper;
const { responseGameSettingListCodec } = extraServiceCodec;

const gameSettingList: Ref<gameSettingType[]> = ref([]);
const getGameSettingList = async () => {
  try {
    const res = (await requestGameSettingList()) as AxiosResponse;
    const typeError = runtimeCheck(responseGameSettingListCodec, res.data.data);

    if (res.data.resultCode === 200) {
      if (!typeError) {
        gameSettingList.value = res.data.data.gameSettingList;
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

const getBetListString = (gameBetList: gameSettingBetType[]) => {
  const betTypeMap: { [key: string]: string } = {
    // index signature
    GOODS: '상품 내기',
    CUSTOM: '자유 내기',
    BILL: '전체 계산하기',
  };

  const betList = gameBetList
    .filter((bet: gameSettingBetType) => bet.isEnabled)
    .map((bet: gameSettingBetType) => {
      const betType = betTypeMap[bet.gameBetType];
      const betString = `${betType} (${bet.maxPlayerCount}명)`;
      return betString;
    });

  return betList.join('<br>');
};

const getGameUsage = (isEnabled: boolean) => (isEnabled ? '사용' : '미사용');

const openGameRestrictSettingModal = (gameId: number) => {
  openModalWithData(EXTRA_SERVICE_GAME_RESTRICTION_SETTING, gameId);
};

getGameSettingList();
</script>

<template>
  <GameRestrictionSettingModal
    v-if="flag.gameRestrictionSetting"
    :getGameSettingList="getGameSettingList"
  />
  <BreadcrumbHeader :propsHeader="extraServiceGameSettingHeader" />
  <p class="mt-20 mb-20">※ 게임 설정 변경 시, 모든 매장에 일괄 적용 됩니다.</p>
  <el-table
    :data="gameSettingList"
    border
  >
    <el-table-column
      align="center"
      class="mb-20"
      header-align="center"
      label="게임 이미지"
    >
      <template #default="{ row }">
        <el-image
          :src="row.gameImgUrl"
          class="game-setting-image"
          fit="contain"
        >
          <template #error>
            <el-icon
              :size="26"
              class="game-setting-icon"
            >
              <Picture />
            </el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="게임명"
      prop="gameName"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="내기 설정 (최대 인원수)"
    >
      <template #default="{ row }">
        <p :innerHTML="getBetListString(row.gameBetList)"></p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="사용 여부"
      width="180"
    >
      <template #default="{ row }">
        <p>{{ getGameUsage(row.isEnabled) }}</p>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="게임 이용 제한 설정"
      width="180"
    >
      <template #default="{ row }">
        <el-button @click="openGameRestrictSettingModal(row.gameId)">
          설정
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style lang="scss">
.game-setting-image {
  width: 120px;
  height: 120px;

  .game-setting-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
