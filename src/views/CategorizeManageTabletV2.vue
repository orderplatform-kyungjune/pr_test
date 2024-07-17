<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, Ref, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { isUPLUSAdmin } from '@utils/authentication';
import { authentication, etcUtils } from '@utils';
import useTagsStore from '@store/storeTags';
import { languageManage, productManage } from '@router/routePaths';
import {
  CategorizeRegisteredGoods,
  CategorizeStaffCallGoods,
  CategorizeUnregisteredGoods,
} from '@containers';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import { CATEGORY_SETTING, STORE_LIST } from '@common/string';
import requestPosInitDate from '@apis/common';

// header props
const categorySettingHeader = reactive([
  { name: STORE_LIST },
  { name: CATEGORY_SETTING },
]);

const activeTabName = ref('first');
const route = useRoute();

const tagStore = useTagsStore();
const { addTagsData } = tagStore;
const { failAuthenticationAlert, checkAuthFunction } = authentication;
const { replaceEmptyString } = etcUtils;

const posInitDate: Ref<string> = ref('');

const getPosInitDate = async () => {
  try {
    const storeCode = route.query.code as string;
    const res = (await requestPosInitDate(storeCode)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
    }

    if (res.data.code === 200) {
      posInitDate.value = res.data.data.data_date;
    }
  } catch (error) {
    console.log(error);
  }
};

getPosInitDate();
</script>

<template>
  <div id="scrollTop"></div>
  <BreadcrumbHeader :propsHeader="categorySettingHeader" />
  <el-row justify="space-between">
    <StoreNameBox />
    <div>
      <router-link
        :to="{
          path: languageManage,
          query: {
            code: route.query.code,
            name: route.query.name,
          },
        }"
        class="mr-10"
      >
        <el-button
          type="success"
          @click="
            addTagsData({
              name: '언어 설정',
              path: languageManage,
              query: {
                code: route.query.code,
                name: route.query.name,
              },
            })
          "
        >
          언어 설정
        </el-button>
      </router-link>
      <router-link
        v-if="checkAuthFunction('F1009') && !isUPLUSAdmin()"
        :to="{
          path: productManage,
          query: {
            code: route.query.code,
            name: route.query.name,
            tab: 'sticker',
            searchTxt: '',
            searchSticker: '',
            searchGoodsType: '',
            searchSaleAdv: '',
            page: 1,
            pageSize: 10,
          },
        }"
      >
        <el-button
          id="F1009"
          type="success"
          @click="
            addTagsData({
              name: '상품 현황',
              path: productManage,
              query: {
                code: route.query.code,
                name: route.query.name,
                tab: 'sticker',
                searchTxt: '',
                searchSticker: '',
                searchGoodsType: '',
                searchSaleAdv: '',
                page: 1,
                pageSize: 10,
              },
            })
          "
        >
          상품 현황
        </el-button>
      </router-link>
    </div>
  </el-row>
  <el-row justify="end">
    <span> 최신 포스 변경 일자: {{ replaceEmptyString(posInitDate) }} </span>
  </el-row>
  <el-tabs
    v-model="activeTabName"
    type="card"
  >
    <el-tab-pane
      label="태블릿 등록 분류ㆍ상품 보기"
      name="first"
    >
      <CategorizeRegisteredGoods v-if="activeTabName === 'first'" />
    </el-tab-pane>
    <el-tab-pane
      label="직원 호출 서비스 상품 보기"
      name="second"
    >
      <CategorizeStaffCallGoods v-if="activeTabName === 'second'" />
    </el-tab-pane>
    <el-tab-pane
      label="태블릿 미등록 상품"
      name="third"
    >
      <CategorizeUnregisteredGoods v-if="activeTabName === 'third'" />
    </el-tab-pane>
  </el-tabs>
</template>
