<script lang="ts" setup>
import {authentication} from '@utils';
import useTagsStore from '@store/storeTags';
import useModalStore from '@store/storeModal';
import {
  bannerManage,
  categorizeManageSchedule,
  categorizeManageTabletV2,
  categorizeProduct,
  customThemeManage,
  languageManage,
  productManage,
  storeManage,
  tableManage,
} from '@router/routePaths';
import {STORE_MANAGE_MODAL, TAB_CODE_TABLE_CONTROL} from '@common/string';

const { isUPLUSAdmin, checkAuthFunction } = authentication;

const tagStore = useTagsStore();
const { addTagsData } = tagStore;

const { closeModal, flag, modalData } = useModalStore();

const { storeCode, storeName } = modalData.storeManage;

const clickPushPage = (title: string, routePath: string, queryData?: any) => {
  addTagsData({
    name: title,
    path: routePath,
    query: {
      code: storeCode,
      name: storeName,
      ...queryData,
    },
  });
  closeModal(STORE_MANAGE_MODAL);
};
</script>

<template>
  <el-dialog
    v-model="flag.storeManage"
    destroy-on-close
    title="매장 관리"
    width="425px"
  >
    <div class="manage-modal-contents">
      <el-row
        align="middle"
        class="mb-20"
      >
        <div class="mr-10">
          <p class="mb-10">배너 설정</p>
          <router-link
            :to="{
              path: bannerManage,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              size="large"
              type="warning"
              @click="clickPushPage('배너 설정', bannerManage)"
            >
              배너 설정
            </el-button>
          </router-link>
        </div>
        <div class="mr-10">
          <p class="mb-10">테이블 관리</p>
          <router-link
            :to="{
              path: tableManage,
              query: {
                code: storeCode,
                name: storeName,
                tab: TAB_CODE_TABLE_CONTROL,
              },
            }"
          >
            <el-button
              size="large"
              type="danger"
              @click="
                clickPushPage('테이블 관리', tableManage, {
                  tab: TAB_CODE_TABLE_CONTROL,
                })
              "
            >
              테이블 관리
            </el-button>
          </router-link>
        </div>
        <div>
          <p class="mb-10">언어 설정</p>
          <router-link
            :to="{
              path: languageManage,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              size="large"
              type="success"
              @click="clickPushPage('언어 설정', languageManage)"
            >
              언어 설정
            </el-button>
          </router-link>
        </div>
      </el-row>
      <el-row
        align="middle"
        class="mb-20"
      >
        <p class="mb-10">매장 설정</p>
        <el-col>
          <router-link
            :to="{
              path: storeManage,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              class="mr-10"
              size="large"
              type="primary"
              @click="clickPushPage('매장 설정', storeManage)"
            >
              매장 설정
            </el-button>
          </router-link>
          <router-link
            :to="{
              path: customThemeManage,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              size="large"
              type="primary"
              @click="clickPushPage('커스텀 설정', customThemeManage)"
            >
              커스텀 설정
            </el-button>
          </router-link>
        </el-col>
      </el-row>
      <el-row
        align="middle"
        class="mb-20"
      >
        <p class="mb-10">분류 설정</p>
        <el-row class="width-100 mb-10 category-row">
          <router-link
            :to="{
              path: categorizeManageTabletV2,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              size="large"
              type="info"
              @click="clickPushPage('분류 설정', categorizeManageTabletV2)"
            >
              분류 설정
            </el-button>
          </router-link>
          <router-link
            :to="{
              path: categorizeManageSchedule,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              size="large"
              type="info"
              @click="
                clickPushPage('분류 스케줄 설정', categorizeManageSchedule)
              "
            >
              분류 스케줄 설정
            </el-button>
          </router-link>
          <router-link
            :to="{
              path: categorizeProduct,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              class="mr-10"
              size="large"
              type="info"
              @click="clickPushPage('분류 내 상품 넣기', categorizeProduct)"
            >
              분류 내 상품 넣기
            </el-button>
          </router-link>
        </el-row>
      </el-row>
      <el-row
        v-if="checkAuthFunction('F1009') && !isUPLUSAdmin()"
        align="middle"
        class="mb-20"
      >
        <p class="mb-10">상품 현황</p>
        <el-col>
          <router-link
            :to="{
              path: productManage,
              query: {
                code: storeCode,
                name: storeName,
              },
            }"
          >
            <el-button
              id="F1009"
              color="#626AEF"
              size="large"
              @click="clickPushPage('상품 현황', productManage)"
            >
              상품 현황
            </el-button>
          </router-link>
        </el-col>
      </el-row>
    </div>
    <el-row justify="end">
      <el-button
        type="danger"
        @click="closeModal(STORE_MANAGE_MODAL)"
      >
        닫기
      </el-button>
    </el-row>
  </el-dialog>
</template>

<style lang="scss" scoped>
.manage-modal-contents {
  display: flex;
  flex-direction: column;
  justify-content: center;

  :deep(.el-button + .el-button) {
    margin: 0;
  }
}

.category-row {
  gap: 10px;
}
</style>
