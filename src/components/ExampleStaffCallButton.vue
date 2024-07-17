<script setup lang="ts">
import { storeInfoDataCustomStyleButtonType } from '@interface/store';

defineProps<{
  staffCall: storeInfoDataCustomStyleButtonType;
}>();

const getStyleData = (background: string, color: string) =>
  `background-color: ${background}; color: ${color}`;
</script>

<template>
  <div class="staff-call-button-container">
    <div
      class="staff-call-button-item"
      :style="getStyleData(staffCall.backgroundColor, staffCall.fontColor)"
    >
      직원 호출
    </div>
  </div>
</template>

<style lang="scss" scoped>
.staff-call-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  background-color: #000000;

  .staff-call-button-item {
    width: 100px;
    padding: 10px 20px;
    font-size: 20px;
    font-weight: bold;
    color: #ab240f;
    text-align: center;
    background-color: #ffffff;
    border-radius: 10px;
  }
}
</style>
