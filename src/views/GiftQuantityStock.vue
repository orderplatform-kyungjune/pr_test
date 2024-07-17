<script lang="ts" setup>
import { reactive, Ref, ref } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import { giftQuantityStockType } from '@interface/promotion';
import { BreadcrumbHeader } from '@components';
import { GIFT_QUANTITY_STOCK, STATISTICAL_ADMIN } from '@common/string';
import { promotionCodec } from '@codecs';
import { promotion } from '@apis';

// header props
const storeStatisticsHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: GIFT_QUANTITY_STOCK },
]);

const { runtimeCheck } = runtimeCheckHelper;
const { requestGiftStockList } = promotion;
const { giftQuantityStockCodec } = promotionCodec;

const giftQuantityStockData: Ref<giftQuantityStockType[]> = ref([]);

/** 이벤트 경품 재고 현황 리스트 불러오기 */
const getGiftStockData = async () => {
  try {
    const res = (await requestGiftStockList()) as AxiosResponse;
    const typeError = runtimeCheck(giftQuantityStockCodec, res.data);

    if (!typeError) {
      giftQuantityStockData.value = res.data;
    }
  } catch (error) {
    console.log(error);
  }
};

getGiftStockData();
</script>

<template>
  <BreadcrumbHeader :propsHeader="storeStatisticsHeader" />
  <p class="gift-quantity-title">
    경품 수량 재고 (오늘일자 기준 실시간으로 노출)
  </p>
  <p class="gift-quantity-desc">
    * <span class="gift-quantity-bold">소진 수량</span>은 이벤트 상품에 당첨된
    손님이 휴대폰 번호까지 입력했을 경우 기준입니다.
  </p>
  <div
    v-for="gift in giftQuantityStockData"
    :key="gift.prizeName"
  >
    <el-descriptions
      :column="2"
      border
      class="mb-20"
      size="large"
    >
      <el-descriptions-item
        align="center"
        label-align="center"
        label-class-name="gift-quantity-desc-label"
        width="25%"
      >
        <template #label> {{ gift.prizeRank }} 등 상품</template>
        {{ gift.prizeName }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label-align="center"
        width="25%"
      >
        <template #label> 소진 수량</template>
        {{ gift.exhaustedCount }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label-align="center"
        width="25%"
      >
        <template #label> 총 수량</template>
        {{ gift.prizeStock }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label-align="center"
        width="25%"
      >
        <template #label> 남은 수량</template>
        {{ gift.leftoverCount }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="scss" scoped>
.gift-quantity-title {
  height: 40px;
  font-size: 30px;
  font-weight: 500;
  line-height: 40px;
}

.gift-quantity-desc {
  margin: 20px 0px;
  font-size: 13px;
  color: red;

  .gift-quantity-bold {
    font-weight: bold;
  }
}
</style>
