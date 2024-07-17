<script lang="ts" setup>
import { storeStatsListDateResListType } from '@interface/promotion';

defineProps<{
  tableData: storeStatsListDateResListType[];
}>();
</script>

<template>
  <el-table
    :data="tableData"
    border
    style="width: 100%"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      prop="storeName"
      width="180"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="태블릿 운영대수"
      min-width="120"
      prop="tabletCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="주문 횟수"
      min-width="120"
      prop="orderCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="주문 수량"
      min-width="120"
      prop="orderGoodsQty"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="경품 당첨자 수"
      min-width="120"
      prop="winnerCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="경품 미당첨자 수"
      min-width="120"
      prop="loserCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="1등 상품 당첨"
      min-width="120"
      prop="firstPrizeCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="2등 상품 당첨"
      min-width="120"
      prop="secondPrizeCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="3등 상품 당첨"
      min-width="120"
      prop="thirdPrizeCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="4등 상품 당첨"
      min-width="120"
      prop="fourthPrizeCnt"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="일자"
      min-width="120"
      prop="saveDate"
    />
  </el-table>
</template>
