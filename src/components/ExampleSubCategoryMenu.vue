<script setup lang="ts">
import { storeInfoDataCustomStyleCategoryDataType } from '@interface/store';

defineProps<{
  subCategory: storeInfoDataCustomStyleCategoryDataType;
  productBackgroundColor: string;
}>();

const getFontColorData = (data: string) => `color: ${data};`;
const getBackgroundData = (data: string) => `background-color: ${data};`;
const getSubCategoryData = (color: string) =>
  `color: ${color}; border-bottom: 2px solid ${color}`;
</script>

<template>
  <div class="sub-category-grid">
    <div
      class="remake-sub-category-container"
      :style="getBackgroundData(productBackgroundColor)"
    >
      <div
        class="remake-sub-category-item"
        :style="getSubCategoryData(subCategory.activeFontColor)"
      >
        활성된 분류
      </div>
      <div
        class="remake-sub-category-item"
        :style="getFontColorData(subCategory.fontColor)"
      >
        비활성된 분류
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sub-category-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 500px;

  .remake-sub-category-container {
    display: flex;
    align-items: center;
    justify-content: left;
    height: 70px;

    .remake-sub-category-item {
      margin: 0 1.5625vw;
      font-size: 1rem;
      font-weight: bold;
      text-align: left;
      white-space: nowrap;
    }

    .remake-after-list {
      width: 0.1563vw;
      height: 1.5625vw;
      margin: auto 0;
      background-color: #999999;
    }
  }

  .original-sub-category-container {
    display: flex;
    gap: 10px;
    background-color: #000000;
    border-top: 4px solid #ff0000;

    .original-sub-category-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      padding: 0px 15px;
      font-size: 1rem;
      font-weight: bold;
      color: #ffffff;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;

      &.active {
        margin-left: 20px;
      }
    }
  }
}
</style>
