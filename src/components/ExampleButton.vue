<script setup lang="ts">
import { storeInfoDataCustomStyleButtonType } from '@interface/store';

const props = defineProps<{
  button: storeInfoDataCustomStyleButtonType;
}>();

const getStyleData = () =>
  `background-color: ${props.button.backgroundColor}; color: ${props.button.fontColor}`;
</script>

<template>
  <div class="example-button-container">
    <div class="example-button-grid">
      <div class="example-button-default-grid">
        <div
          class="example-button-default"
          :style="getStyleData()"
        >
          주문내역
        </div>
        <div
          class="example-button-default"
          :style="getStyleData()"
        >
          장바구니
        </div>
      </div>
    </div>
    <div
      class="example-button-default example-button-cart"
      :style="getStyleData()"
    >
      <span class="mr-20"> 000원 </span>
      주문하기
    </div>
  </div>
</template>

<style lang="scss" scoped>
.example-button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.example-button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  justify-content: center;
  width: 700px;

  .example-button-default-grid {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}
.example-button-default {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 60px;
  font-size: 30px;
  border-radius: 8px;
  font-family: 'Pretendard,sans-serif';
  font-weight: 700;
  line-height: 45px;
}

.example-button-cart {
  width: 500px;
  font-size: 28px;
}
</style>
