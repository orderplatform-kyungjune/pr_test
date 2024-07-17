<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { toRefs } from '@vueuse/core';
import { isUPLUSAdmin } from '@utils/authentication';
import { authentication, routeHelper } from '@utils';
import useTagsStore from '@store/storeTags';
import {
  categorizeManageTablet,
  categorizeManageTabletV2,
  goodsDetailSettingInCategory,
  goodsDetailSettingInCategoryV2,
  login,
  myPage,
} from '@router/routePaths';
import { pageRouterQueryType } from '@interface/member';
import { Delete, UserFilled } from '@element-plus/icons-vue';
import { SideMenuContainer } from '@containers';
import { MASTER } from '@common/string';
import { ENVIRONMENT, SERVICE_TARGET } from '@common/envVariables';

const { pushPage } = routeHelper;
const router = useRouter();
const route = useRoute();
const tagStore = useTagsStore();
const { clearApplication } = authentication;
const { localCachePage, localCacheIndex } = toRefs(tagStore);
const { addTagsData, deleteTagsData, setTagsIndex, resetCacheData } = tagStore;

const keepAliveState = ref<string[]>();

const masterName: Ref<string> = ref(localStorage.getItem(MASTER) ?? '');

const logoutMessage = () => {
  ElMessageBox.alert('로그아웃 되었습니다!', '성공', {
    confirmButtonText: '확인',
    type: 'success',
  });
};

const failMessage = () => {
  ElMessageBox.alert('로그아웃에 실패하였습니다.', '실패', {
    confirmButtonText: '확인',
    type: 'error',
  });
};

// 로그아웃하기
const logout = () => {
  try {
    clearApplication();
    resetCacheData();
    logoutMessage();
    pushPage(login);
  } catch (error) {
    failMessage();
  }
};

/** 상단 서버 상태값 표시 (DEV, STAGE, 어드민) */
const getLayoutTitle = () => {
  if (SERVICE_TARGET === 'uplus' && ENVIRONMENT === 'production') return '';
  if (ENVIRONMENT === 'staging') return 'STAGE';
  if (ENVIRONMENT === 'production') return '어드민';
  return 'DEV';
};

/** 상단 테그 삭제 */
const deleteTargetTag = (index: number) => {
  if (localCacheIndex.value === index) {
    if (localCacheIndex.value === 0) {
      if (localCachePage.value.length !== 1) {
        const target = localCachePage.value[index + 1];
        router.push({
          path: target.path,
          query: target.query,
        });
      }
    } else {
      const target = localCachePage.value[index - 1];
      router.push({
        path: target.path,
        query: target.query,
      });
    }
  }
  deleteTagsData(index);
};

/** 상단 태그 선택 */
const selectTargetTag = (tag: pageRouterQueryType, index: number) => {
  setTagsIndex(index);
  router.push({
    path: tag.path,
    query: tag.query,
  });
};

const getRouterPathColor = (index: number) => {
  if (localCacheIndex.value === index) return 'dark';
  return 'plain';
};

const getStoreName = (name: string) => {
  if (name) return `(${name})`;
  return '';
};

/** router-view key를 fullPath를 사용하면서 keep-alive가 동작하지 않는 문제 해결을 위한 함수 */
const getRouteKey = () => {
  // 현재 분류설정(구)의 접근은 제한되었으나 복구할 경우를 대비하여 남겨둠
  if (
    route.path === categorizeManageTabletV2 ||
    route.path === goodsDetailSettingInCategoryV2 ||
    route.path === categorizeManageTablet ||
    route.path === goodsDetailSettingInCategory
  ) {
    return undefined;
  }
  return route.fullPath;
};
const adminVersion = VITE_DEFINE_ADMIN_VERSION;

// 페이지 이동에 따라 keep-alive 동적 변경 (매장리스트 <=> 분류설정)
router.beforeEach(async (to, from, next) => {
  // 현재 분류설정(구)의 접근은 제한되었으나 복구할 경우를 대비하여 남겨둠
  if (
    from.path === categorizeManageTablet &&
    to.path === goodsDetailSettingInCategory
  ) {
    keepAliveState.value = [
      'CategorizeManageTablet',
      'GoodsDetailSettingInCategory',
    ];
  } else if (
    from.path === goodsDetailSettingInCategory &&
    to.path === categorizeManageTablet
  ) {
    keepAliveState.value = ['CategorizeManageTablet'];
  } else if (
    from.path === categorizeManageTabletV2 &&
    to.path === goodsDetailSettingInCategoryV2
  ) {
    keepAliveState.value = [
      'CategorizeManageTabletV2',
      'GoodsDetailSettingInCategoryV2',
    ];
  } else if (
    from.path === goodsDetailSettingInCategoryV2 &&
    to.path === categorizeManageTabletV2
  ) {
    keepAliveState.value = ['CategorizeManageTabletV2'];
  } else {
    keepAliveState.value = [];
  }
  next();
});
</script>

<template>
  <div class="default_layout_container">
    <el-container>
      <el-header style="padding: 0 !important">
        <div class="default_layout_header">
          <div class="layout_logo">
            <div class="layout-logo-wrap">
              <img
                v-if="isUPLUSAdmin()"
                alt="Uplus 로고"
                class="layout-logo-image"
                src="https://static.torder.co.kr/torder2/icon_lg_logo_white_admin.svg"
              />
              <img
                v-else
                alt="티오더 로고"
                class="layout-logo-image"
                src="@assets/torder_logo.svg"
              />
            </div>
            <span class="header_text">
              {{ getLayoutTitle() }}
            </span>
          </div>
          <el-row align="middle">
            <el-avatar
              :icon="UserFilled"
              :size="28"
              class="mr-10"
            />
            <p class="master-identification-name">
              {{ masterName }}
            </p>
            <router-link
              :to="myPage"
              class="mr-10"
            >
              <el-button
                type="warning"
                @click="
                  addTagsData({
                    name: '마이페이지',
                    path: myPage,
                  })
                "
              >
                마이페이지
              </el-button>
            </router-link>
            <div>
              <el-button
                type="danger"
                @click="logout"
              >
                로그아웃
              </el-button>
            </div>
          </el-row>
        </div>
      </el-header>
      <el-container>
        <el-aside class="aside-width">
          <el-scrollbar height="calc(100vh - 60px)">
            <SideMenuContainer />
            <p
              v-if="adminVersion"
              class="admin-version font-thin ml-10 mt-10"
            >
              v {{ adminVersion }}
            </p>
          </el-scrollbar>
        </el-aside>
        <el-main class="default_layout_main">
          <div class="tag_layout">
            <div class="tag_layout_header">
              <el-tag
                v-for="(tag, index) in localCachePage"
                :key="tag.code"
                :effect="getRouterPathColor(index)"
                class="tag-layout-tag"
                closable
                disable-transitions
                @click="() => selectTargetTag(tag, index)"
                @close="deleteTargetTag(index)"
              >
                {{ tag.name }} {{ getStoreName(tag.query?.name) }}
              </el-tag>
            </div>
            <el-button @click="resetCacheData">
              <el-icon>
                <Delete color="#000" />
              </el-icon>
            </el-button>
          </div>
          <div class="default_layout_contents">
            <router-view
              :key="getRouteKey()"
              v-slot="{ Component }"
            >
              <keep-alive :include="keepAliveState">
                <component
                  :is="Component"
                  :key="$route.fullPath"
                />
              </keep-alive>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.default_layout_container {
  .default_layout_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 20px;
    line-height: 50px;
    background-color: #545c64;

    .layout_logo {
      display: flex;
      align-items: center;
      gap: 10px;

      .layout-logo-wrap {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .layout-logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }

    .master-identification-name {
      margin-right: 20px;
      font-size: 18px;
      font-weight: 500;
      color: #fff;
    }

    .header_text {
      display: flex;
      align-items: flex-end;
      margin-top: 3px;
      margin-left: 10px;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }
  }

  .default_layout_main {
    padding: 10px 20px 10px 20px;

    .tag_layout {
      display: flex;
      gap: 20px;
      width: 100%;
      height: 45px;

      .tag_layout_header {
        display: flex;
        gap: 10px;
        width: 100%;
        padding-bottom: 10px;
        margin-bottom: 10px;
        overflow: scroll;
        border-bottom: 1px solid #dcdfe6;

        a {
          color: #303133;
        }

        .tag-layout-tag {
          cursor: pointer;
        }
      }
    }

    .default_layout_contents {
      box-sizing: border-box;
      height: calc(100vh - 125px);
      overflow: scroll;

      //** URL 변경페이지의 modal에서 el-message가 Element UI의 el-dialog가 자동 생성해주는 요소의 z-index로 인해 가려지는 현상 발생하여 강제적으로 css 설정합니다.*/
      //** el-dialog가 생성해주는 아래 요소의 z-index가 2003~2004로 el-message의 z-index를 침범하지 못하도록 강제적으로 수정합니다.*/
      &:deep(.el-overlay) {
        z-index: 2000 !important;
      }
    }
  }

  ::-webkit-scrollbar {
    display: none;
  }

  .aside-width {
    width: 13%;
    min-width: 220px;
    background-color: #545c64;
  }

  .admin-version {
    color: #aaa;
    font-size: 12px;
  }
}
</style>
