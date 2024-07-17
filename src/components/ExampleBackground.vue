<script lang="ts" setup>
import { computed } from 'vue';
import { isUPLUSAdmin } from '@utils/authentication';
import { authentication, etcUtils } from '@utils';
import { storeInfoDataCustomStyleType } from '@interface/store';
import noImageGray400 from '../assets/icon_torder_logo_gray_400.svg';
import noImageGray200 from '../assets/icon_torder_logo_gray_200.svg';
import noImageCI400 from '../assets/icon_torder_logo_CI_gray_400.svg';
import noImageCI200 from '../assets/icon_torder_logo_CI_gray_200.svg';

const { isGlobalAdmin } = authentication;
const { getSubPrimaryColorInTabletPreview } = etcUtils;

const props = defineProps<{
  customStyle: storeInfoDataCustomStyleType;
}>();

const isDarkMode = computed(() => props.customStyle.mode === 'dark');

const noImageUrl = computed(() => {
  if (isGlobalAdmin()) {
    if (isDarkMode.value) {
      return noImageCI400;
    }
    return noImageCI200;
  }

  if (isDarkMode.value) {
    return noImageGray400;
  }

  return noImageGray200;
});

const getFontColor = (fontColor: string) => `color: ${fontColor}`;
const getBackgroundColor = (background: string) =>
  `background-color: ${background?.length === 0 ? '#fff' : background}`;
const getBackgroundAndFontColor = (background: string, fontColor: string) =>
  `${getFontColor(fontColor)}; ${getBackgroundColor(background)}`;
const getFontColorStyleByMode = (lightColor: string, darkColor: string) =>
  getFontColor(isDarkMode.value ? darkColor : lightColor);

const getCategoryBackgroundStyle = (image: string, background: string) =>
  `background-image: url(${image}); ${getBackgroundColor(background)}`;
const getActiveSubCategoryStyle = (subCategoryActiveColor: string) =>
  `${getFontColor(subCategoryActiveColor)}; border-bottom: 1.5px solid ${subCategoryActiveColor};`;
const getSideMenuButtonTopColor = (background: string) =>
  `box-shadow: 13px 15px 0 11px ${background?.length === 0 ? '#fff' : background};`;
const getSideMenuButtonBottomColor = (background: string) =>
  `box-shadow: 13px -15px 0 11px ${background?.length === 0 ? '#fff' : background};`;
const getCategoryArrowStyleByMode = () =>
  `${isDarkMode.value ? '#FFFFFF' : '#313131'}`;
</script>

<template>
  <div class="preview-total-container">
    <div class="preview-main-container">
      <div
        :style="
          getCategoryBackgroundStyle(
            customStyle.category.backgroundImg,
            customStyle.category.backgroundColor,
          )
        "
        class="side-menu-container"
      >
        <div class="side-menu-container-top-info">
          <img
            v-if="isUPLUSAdmin()"
            alt="uplus 로고"
            class="side-menu-container-logo uplus"
            src="https://static.torder.co.kr/torder2/icon_lg_logo_white_admin.svg"
          />
          <img
            v-else-if="!isGlobalAdmin()"
            alt="BI 로고"
            class="side-menu-container-logo"
            src="https://static.torder.co.kr/torder2/icn_torder_logo_BI_red.svg"
          />
          <img
            v-else
            alt="CI 로고"
            class="side-menu-container-logo global"
            src="https://static.torder.co.kr/torder2/icn_torder_logo_CI_red.svg"
          />
          <div
            :style="
              getBackgroundAndFontColor(
                getSubPrimaryColorInTabletPreview(
                  customStyle.category.backgroundColor || '',
                  14,
                  'Y',
                ),
                '#fff',
              )
            "
            class="side-menu-container-store-name-box"
          >
            <span class="store-name-text"> 매장명 (지점명) </span>
          </div>
        </div>
        <div class="side-menu-container-category-warp">
          <div
            :style="
              getFontColor(customStyle.category.mainCategory.activeFontColor)
            "
            class="side-menu-container-first-category"
          >
            <div
              :style="
                getSideMenuButtonTopColor(
                  customStyle.background.backgroundColor,
                )
              "
              class="side-menu-container-first-category-top"
            ></div>
            <div
              :style="
                getBackgroundColor(customStyle.background.backgroundColor)
              "
              class="side-menu-container-first-category-contents"
            >
              <div class="side-menu-container-first-category-contents-item">
                대분류 1
              </div>
            </div>
            <div
              :style="
                getSideMenuButtonBottomColor(
                  customStyle.background.backgroundColor,
                )
              "
              class="side-menu-container-first-category-bottom"
            ></div>
          </div>
          <div
            :style="getFontColor(customStyle.category.mainCategory.fontColor)"
            class="side-menu-container-second-category"
          >
            대분류 2
          </div>
          <div
            :style="getFontColor(customStyle.category.mainCategory.fontColor)"
            class="side-menu-container-second-category"
          >
            대분류 3
          </div>
          <div
            :style="getFontColor(customStyle.category.mainCategory.fontColor)"
            class="side-menu-container-second-category"
          >
            대분류 4
          </div>
        </div>
        <div class="side-menu-container-staff-button">
          <img
            alt=""
            class="side-menu-container-staff-call-bell"
            src="../assets/torder2-tablet-bell.png"
          />
          직원호출
        </div>
      </div>
      <div
        :style="
          getBackgroundAndFontColor(
            customStyle.tableNum.backgroundColor,
            customStyle.tableNum.fontColor,
          )
        "
        class="contents-main-table-num-box"
      >
        <p class="table-num-title">Table.</p>
        <p class="table-num-contents">T-01</p>
      </div>
      <div
        :style="
          getCategoryBackgroundStyle('', customStyle.background.backgroundColor)
        "
        class="preview-contents-container flex-1"
      >
        <div class="contents-main-sub-category-wrap">
          <div
            :style="
              getActiveSubCategoryStyle(
                customStyle.category.subCategory.activeFontColor,
              )
            "
            class="sub-category"
          >
            <span> 중분류 1 </span>
          </div>
          <div
            :style="getFontColor(customStyle.category.subCategory.fontColor)"
            class="sub-category"
          >
            <span> 중분류 2 </span>
          </div>
        </div>
        <div class="contents-main-category-depth">
          <span
            :style="getFontColorStyleByMode('#7A7A7A', '#AFAFAF')"
            class="category-depth-main"
          >
            대분류1
          </span>
          <div class="category-depth-divider">
            <svg
              fill="none"
              viewBox="0 0 20 30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                :stroke="`${getCategoryArrowStyleByMode()}`"
                d="M7 21L13 15L7 9"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
          <span
            :style="getFontColorStyleByMode('#313131', '#FFFFFF')"
            class="category-depth-sub"
          >
            중분류1
          </span>
        </div>
        <div class="contents-product-container">
          <div
            v-for="num in 6"
            :key="num"
            :style="getFontColorStyleByMode('#313131', '#FFFFFF')"
            class="preview-contents-main-item"
          >
            <div
              :class="{ dark: isDarkMode }"
              class="preview-contents-main-item-image"
            >
              <img
                :src="noImageUrl"
                alt=""
                class="main-item-logo"
              />
            </div>
            <div class="preview-contents-main-item-text">상품 {{ num }}</div>
            <div class="good-item-text-price">
              {{ Number(num * 1000).toLocaleString()
              }}{{ !isGlobalAdmin() ? '원' : '' }}
            </div>
          </div>
        </div>
        <div
          :style="
            getCategoryBackgroundStyle(
              '',
              customStyle.background.backgroundColor,
            )
          "
          class="contents-footer-container"
        >
          <div class="footer-contents-button-wrap">
            <div
              :style="
                getBackgroundAndFontColor(
                  customStyle.button.backgroundColor,
                  customStyle.button.fontColor,
                )
              "
              class="footer-contents-button"
            >
              주문내역
            </div>
            <div
              :style="
                getBackgroundAndFontColor(
                  customStyle.button.backgroundColor,
                  customStyle.button.fontColor,
                )
              "
              class="footer-contents-button"
            >
              장바구니
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preview-total-container {
  position: relative;
  width: 640px;
  height: 400px;
  line-height: 125%;
  font-family: 'Pretendard';

  .contents-main-table-num-box {
    position: absolute;
    display: flex;
    right: 10px;
    width: 80px;
    height: 43px;
    padding: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 0px 0px 8px 8px;
    box-shadow: 0px 3px 3px 0px #00000040;
    gap: 5px;

    .table-num-title {
      width: 100%;
      text-align: start;
      font-size: 7px;
    }

    .table-num-contents {
      width: 100%;
      text-align: center;
      font-size: 24px;
      font-weight: 700;
    }
  }
}

.preview-main-container {
  display: flex;
  margin-right: 10px;
  width: 100%;
  height: 100%;

  .side-menu-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 118px;
    height: 100%;
    background-color: #94ab41;
    background-size: cover;

    .side-menu-container-top-info {
      width: 100%;
      height: 60px;
      margin-bottom: 10px;

      .side-menu-container-logo {
        margin: 10px 10px 0px 10px;
        width: 30px;
        height: 15px;

        &.global {
          width: 50px;
          height: 15px;
        }

        &.uplus {
          width: 50px;
          height: 13px;
        }
      }

      .side-menu-container-store-name-box {
        display: flex;
        align-items: center;
        padding: 5px 7px 5px 7px;
        border-radius: 4px;
        box-shadow: -1px 2px 3px 0px rgba(0, 0, 0, 0.25) inset;
        margin: 8px 10px 0 10px;

        .store-name-text {
          font-size: 10px;
        }
      }
    }

    .side-menu-container-category-warp {
      padding-left: 10px;
      height: 280px;

      .side-menu-container-first-category {
        width: 100%;
        height: 50px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        color: #94ab41;

        .side-menu-container-first-category-top {
          width: 10%;
          height: 8px;
          border-bottom-right-radius: 10px;
          box-shadow: 13px 15px 0 11px #fff;
        }

        .side-menu-container-first-category-contents {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: 35px;
          background-color: #fff;
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;

          .side-menu-container-first-category-contents-item {
            padding-left: 10px;
            font-size: 14px;
            font-weight: 700;
          }
        }

        .side-menu-container-first-category-bottom {
          width: 10%;
          height: 8px;
          border-top-right-radius: 30px;
          box-shadow: 13px -15px 0 11px #fff;
        }
      }

      .side-menu-container-second-category {
        height: 30px;
        padding: 8px;
        font-size: 14px;
        color: #fff;
      }
    }

    .side-menu-container-staff-button {
      width: 100%;
      height: 43px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background-color: #313131;
      font-weight: 700;

      .side-menu-container-staff-call-bell {
        margin-right: 5px;
        width: 12px;
        height: 12px;
      }
    }
  }

  .preview-contents-container {
    display: flex;
    flex-direction: column;
    height: 400px;
    font-size: 12px;

    .contents-main-sub-category-wrap {
      display: flex;
      flex-direction: row;
      padding: 8px 10px;
      gap: 10px;
      height: 28px;

      .sub-category {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 700;
      }
    }

    .contents-main-category-depth {
      display: flex;
      align-items: center;
      padding: 0 0 5px 10px;
      vertical-align: baseline;

      .category-depth-main {
        font-weight: 400;
      }

      .category-depth-divider {
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;

        svg {
          width: 10px;
        }
      }

      .category-depth-sub {
        font-weight: 700;
      }
    }

    .contents-product-container {
      flex: 1;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      width: 100%;
      padding: 0px 5px;
      overflow: hidden;

      .preview-contents-main-item {
        display: flex;
        flex-direction: column;
        padding: 5px;

        .preview-contents-main-item-image {
          width: 162px;
          height: 120px;
          background-color: #efefef;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #d5d5d5;

          &.dark {
            background-color: #7a7a7a;
            border: 1px solid #7a7a7a;
          }

          .main-item-logo {
            width: 40px;
            height: 50px;
          }
        }

        .preview-contents-main-item-text {
          margin-top: 10px;
        }

        .good-item-text-price {
          font-size: 14px;
          text-align: end;
          font-weight: bold;
          margin-bottom: 10px;
        }
      }
    }

    .contents-footer-container {
      width: 100%;
      height: 43px;
      font-size: 12px;

      .preview-contents-footer-grid {
        box-sizing: border-box;
        display: flex;
        gap: 30px;
        align-items: center;
        width: 100%;
        height: 60px;
        padding-left: 30px;
        font-size: 18px;
      }

      .footer-contents-button-wrap {
        display: flex;
        gap: 5px;
        justify-content: end;
        padding: 5px 10px 6px 10px;
        height: 32px;

        .footer-contents-button {
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          gap: 5px;
          background-color: #fff;
          width: 106px;
          font-weight: 700;
        }
      }
    }
  }
}
</style>
