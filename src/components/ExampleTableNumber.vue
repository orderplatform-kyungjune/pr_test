<script setup lang="ts">
import { storeInfoDataCustomStyleButtonType } from '@interface/store';

defineProps<{
  table: storeInfoDataCustomStyleButtonType;
}>();

const getStyleData = (background: string, color: string) =>
  `background-color: ${background}; color: ${color}`;
</script>

<template>
  <div class="table-number-grid">
    <div class="remake-table-number-container">
      <div
        class="remake-table-number-contents"
        :style="getStyleData(table.backgroundColor, table.fontColor)"
      >
        <p class="remake-table-number-contents-title">Table.</p>
        <div class="remake-table-number-contents-number">
          <span> TEST </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-number-grid {
  display: flex;
  gap: 20px;

  .remake-table-number-container {
    display: flex;
    flex-direction: column;

    .remake-table-number-contents {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 144px;
      height: 92px;
      padding: 9px;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      border-width: 0 1px 1px 1px;
      border-style: solid;
      border-color: #d5d5d5;
      box-shadow: 0px 3px 3px 0px #00000040;

      .remake-table-number-contents-title {
        width: 100%;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .remake-table-number-contents-number {
        text-align: center;
        font-size: 48px;
        font-weight: 700;
        line-height: 45px;
      }
    }

    .remake-table-number-store {
      font-size: 9px;
      line-height: 17px;
      color: #2f2a26;
      text-align: center;
    }
  }

  .original-table-number-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    background-color: #000000;

    .original-table-number-contents {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 170px;
      height: 80px;
      padding-bottom: 10px;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;

      .original-table-number-contents-title {
        font-size: 10px;
      }

      .original-table-number-contents-number {
        font-size: 20px;
        font-weight: bold;
      }
    }
    .original-table-number-store {
      font-size: 9px;
      line-height: 17px;
      color: #ffffff;
      text-align: center;
    }
  }
}
</style>
