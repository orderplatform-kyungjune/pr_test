<script setup lang="ts">
import { storeInfoDataCustomStyleCategoryType } from '@interface/store';

const props = defineProps<{
  category: storeInfoDataCustomStyleCategoryType;
  productBackgroundColor: string;
  mode: string;
}>();

const getFontColorData = (data: string) => `color: ${data};`;
const getBackgroundData = (data: string) => `background-color: ${data};`;

const getCategoryBackgroundColor = () => {
  if (props.productBackgroundColor) {
    return getBackgroundData(props.productBackgroundColor);
  }
  if (props.mode === 'light') return getBackgroundData('#fff');
  if (props.mode === 'dark') return getBackgroundData('#fff');
  return getBackgroundData('#fff');
};
const getBoxShadowData = (isTop?: boolean) =>
  `box-shadow: 1.015625vw ${isTop ? '' : '-'}1.171875vw 0 0.859375vw ${getCategoryBackgroundColor()};`;
const getCategoryData = (image: string, background: string) =>
  `background-image: url(${image}); ${getBackgroundData(background)}`;
</script>

<template>
  <div class="first-category-container">
    <div
      class="first-category-grid"
      :style="getCategoryBackgroundColor()"
    >
      <div
        class="remake-first-category"
        :style="
          getCategoryData(category.backgroundImg, category.backgroundColor)
        "
      >
        <div class="remake-first-category-list-item-active">
          <div class="remake-wrap-content-top">
            <div
              class="remake-content-top"
              :style="getBoxShadowData(true)"
            ></div>
          </div>
          <div
            class="remake-content-container"
            :style="getCategoryBackgroundColor()"
          >
            <div
              class="remake-item-content"
              :style="`${getFontColorData(category.mainCategory.activeFontColor)} ${getCategoryBackgroundColor()}`"
            >
              활성된 분류
            </div>
          </div>
          <div class="remake-wrap-content-bottom">
            <div
              class="remake-content-bottom"
              :style="getBoxShadowData(false)"
            ></div>
          </div>
        </div>
        <div
          class="remake-first-category-list-item"
          :style="getFontColorData(category.mainCategory.fontColor)"
        >
          비활성된 분류
        </div>
        <div
          class="remake-first-category-list-item"
          :style="getFontColorData(category.mainCategory.fontColor)"
        >
          비활성된 분류
        </div>
      </div>
    </div>
    <div class="first-category-">* 이미지 규격 : 210 x 768</div>
  </div>
</template>

<style lang="scss" scoped>
.first-category-container {
  display: flex;
  flex-direction: column;

  .first-category-grid {
    display: flex;
    gap: 20px;
    width: 300px;

    .remake-first-category {
      width: 237px;

      .remake-first-category-list-item-active {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: 100%;

        .remake-wrap-content-top,
        .remake-wrap-content-bottom {
          display: flex;
          justify-content: flex-end;
          width: 10%;
        }

        .remake-content-top {
          width: 100%;
          height: 1.5625vw;
          border-bottom-right-radius: 2.3828vw;
        }

        .remake-content-bottom {
          width: 100%;
          height: 1.5625vw;
          border-top-right-radius: 2.3828vw;
        }

        .remake-content-container {
          display: flex;
          width: 90%;
          border-radius: 2.3828vw 0 0 2.3828vw;
        }

        .remake-item-content {
          z-index: 5;
          flex-grow: 1;
          padding-top: 1.0938vw;
          padding-bottom: 1.0938vw;
          padding-left: 1.9531vw;
          font-size: 1.375rem;
          font-weight: bold;
          text-align: left;
          background-color: #ffffff;
          border-radius: 30.5px;
        }
      }

      .remake-first-category-list-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding-left: 1.9531vw;
        margin-bottom: 2vw;
        font-size: 1.375rem;
        font-weight: 500;
      }
    }

    .original-first-category {
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background-color: #000000;

      .original-first-category-item-active {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 180px;
        height: 50px;
        font-size: 20px;
        font-weight: 500;
        color: #ffffff;
        border-radius: 8px;
      }

      .original-first-category-item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 180px;
        height: 50px;
        font-size: 20px;
        font-weight: bold;
        color: #000000;
        border-radius: 8px;
      }
    }
  }
}
</style>
