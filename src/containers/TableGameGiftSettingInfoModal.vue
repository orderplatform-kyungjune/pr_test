<script lang="ts" setup>
import { ref } from 'vue';
import useModalStore from '@store/storeModal';
import { TABLE_GAME_GIFT_SETTING_INFO } from '@common/string';

const { flag, closeModal } = useModalStore();

const activeNames = ref(['1']);
</script>

<template>
  <el-dialog
    v-model="flag.tableGameGiftSettingInfo"
    center
    top="3vh"
    width="35%"
  >
    <div class="detail-service-title mb-20">
      <span> 상품 설정 안내 </span>
    </div>
    <p class="gift-setting-info-desc gray-word mb-20">
      포스에 게임 상품 등록 및 게임 상품 등록 하시면 간편하게 게임 관리를 하실
      수 있습니다.
    </p>
    <el-collapse
      v-model="activeNames"
      accordion
    >
      <el-collapse-item name="1">
        <template #title>
          <span class="gift-setting-info-col-title">
            STEP1. 포스에 상품을 등록해주세요.
          </span>
        </template>
        <pre class="gift-setting-info-col-pre">
      기준이 되는 상품을 확인하시고, 승리/패배 상품을 포스에 등록해주세요.

        1. 게임 승리 상품

            - 게임승리_기준 상품명

            - 0원

        2. 게임 패배 상품

            - 게임패배_기준 상품명

            - 기준 상품 가격

      예) 콜라를 게임 상품로 등록하실 경우 아래와 같이 2개의 상품을 등록해주세요.

        - 게임승리_콜라, 0원

        - 게임패배_콜라, 1,500원

      ※ 게임이 종료되면 승리 테이블에 빌지가 출력되어 상품 서빙을 하실 수 있으며, 패배 테이블은 결제를 위해 포스에 상품이 주문 처리됩니다.
        </pre>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template #title>
          <span class="gift-setting-info-col-title">
            STEP2. 관리 화면에서 상품을 연결해주세요
          </span>
        </template>
        <pre class="gift-setting-info-col-pre">
      어드민 페이지를 통해 상품 정보를 등록해주세요.

      기준이 되는 상품 선택 이후, 포스에 등록하신 게임 승리/패배 상품을 각각 선택해주세요.

      ※ 포스에서 상품을 삭제하시거나 변경하시는 경우 연결 정보를 찾지 못하여 게임 상품로 사용하실 수 없습니다.

      ※ 게임 상품 리스트에서 상품을 삭제를 원할 경우, 포스에 등록된 상품을 삭제하시길 바랍니다.
        </pre>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template #title>
          <span class="gift-setting-info-col-title">
            STEP3. 등록된 상품을 확인해주세요.
          </span>
        </template>
        <pre class="gift-setting-info-col-pre">
      등록이 완료되어, 게임 상품로 이용하실 수 있습니다.

      정상 작동 확인을 위해 아래의 사항을 확인해주세요.

      1. 게임 상품 정상 노출 여부
      2. 마스터 태블릿 주문 연동 여부
      3. 포스 주문 연동 여부
        </pre>
      </el-collapse-item>
    </el-collapse>
    <template #footer>
      <el-button
        type="info"
        @click="closeModal(TABLE_GAME_GIFT_SETTING_INFO)"
      >
        확인
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-service-title {
  border-left: 4px solid #000;

  span {
    margin-left: 10px;
    font-size: 22px;
  }
}

.gift-setting-info-desc {
  font-size: 14px;
}

.gift-setting-info-col-title {
  padding: 0px 10px;
  font-size: 17px;
}

.gift-setting-info-col-pre {
  padding: 20px 0px 10px 0px;
  white-space: pre-wrap;
}
</style>
