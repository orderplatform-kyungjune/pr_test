<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, routeHelper } from '@utils';
import useLoadingStore from '@store/storeLoading';
import { promotionEventRemove } from '@router/routePaths';
import { eventAllStoreListType } from '@interface/promotion';
import { House, Search } from '@element-plus/icons-vue';
import { BreadcrumbHeader, Loading } from '@components';
import {
  STATISTICAL_ADMIN,
  PROMOTION_REMOVE,
  PROMOTION_EVENT,
} from '@common/string';
import { promotionCodec } from '@codecs';
import { promotion } from '@apis';

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;

const { pushPageWithQuery } = routeHelper;

const { requestPromotionEventAllStore, requestRemoveStoreGoods } = promotion;

const { promotionEventAllStoreCodec } = promotionCodec;

const { openLoading, closeLoading } = useLoadingStore();

// header props
const promotionRemoveHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: PROMOTION_EVENT },
  { name: PROMOTION_REMOVE },
]);

/** 검색 정보 */
const searchInfo = reactive({
  storeName: route.query.storeName as string,
  storeCode: route.query.storeCode as string,
});

/** 페이지네이션 */
const paginationInfo = reactive({
  currentPage: Number(route.query.currentPage),
  totalPages: 1,
  pageSize: Number(route.query.pageSize),
  firstPage: true,
  lastPage: false,
});

/** 페이지 당 매장 개수 */
const pageSizeOptions = [
  {
    value: 10,
    label: '10개씩 보기',
  },
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 30,
    label: '30개씩 보기',
  },
  {
    value: 50,
    label: '50개씩 보기',
  },
  {
    value: 100,
    label: '100개씩 보기',
  },
  {
    value: 200,
    label: '200개씩 보기',
  },
];

/** 프로모션 이벤트에 해당하는 모든 매장 리스트 */
const eventAllStoreList = ref<eventAllStoreListType[]>(
  [] as eventAllStoreListType[],
);

/** 매장 리스트 조회하기 */
const getPromotionEventList = async () => {
  const pageInfo = {
    page: paginationInfo.currentPage,
    size: paginationInfo.pageSize,
  };
  const requestData = {
    eventNum: Number(route.query.num),
    storeCode: searchInfo.storeCode,
    storeName: searchInfo.storeName,
  };

  try {
    openLoading();
    const res = (await requestPromotionEventAllStore(
      pageInfo,
      requestData,
    )) as AxiosResponse;
    if (res.status === 200) {
      const typeError = runtimeCheck(promotionEventAllStoreCodec, res.data);

      if (!typeError) {
        eventAllStoreList.value = res.data.content;
        paginationInfo.currentPage = res.data.currentPage;
        paginationInfo.totalPages = res.data.totalPages;
        paginationInfo.pageSize = res.data.pageSize;
        paginationInfo.firstPage = res.data.firstPage;
        paginationInfo.lastPage = res.data.lastPage;
        closeLoading();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 프로모션 이벤트 매장 해제 */
const setRemoveStoreEvent = async (storeCode: string) => {
  const storeInfo = { storeCode };
  const eventNum = Number(route.query.num);

  try {
    openLoading();
    const res = (await requestRemoveStoreGoods(
      storeInfo,
      eventNum,
    )) as AxiosResponse;

    if (res.status === 200) {
      ElMessage({
        type: 'success',
        message: '이벤트 매장이 해제되었습니다.',
      });
      getPromotionEventList();
      closeLoading();
    }
  } catch (error) {
    console.log(error);
  }
};

const setEventUseTag = (state: number) => {
  if (state !== 0) {
    const use = {
      type: 'success',
      text: '사용중',
    };
    return use;
  }
  const notUse = {
    type: 'info',
    text: '중지',
  };
  return notUse;
};

/** 페이지 이동, 검색 */
const setQueryData = async () => {
  const searchData = {
    num: route.query.num,
    gift: route.query.gift,
    currentPage: paginationInfo.currentPage,
    pageSize: paginationInfo.pageSize,
    storeName: searchInfo.storeName,
    storeCode: searchInfo.storeCode,
  };
  pushPageWithQuery(promotionEventRemove, searchData);
};

/** 검색하기 */
const getSearchData = () => {
  paginationInfo.currentPage = 0;
  setQueryData();
};

/** 페이지네이션 페이지 변경 */
const handleCurrentPage = async (val: number) => {
  if (paginationInfo.totalPages === -1) return;
  paginationInfo.currentPage = val - 1;
  setQueryData();
};

getPromotionEventList();
</script>

<template>
  <Loading :text="'로딩중입니다..'" />
  <BreadcrumbHeader :propsHeader="promotionRemoveHeader" />
  <p class="promotion-remove-title mb-10">프로모션 이벤트 해제</p>
  <el-card
    class="mb-20"
    shadow="never"
  >
    <el-row
      align="middle"
      justify="space-between"
    >
      <el-row class="mb-10">
        <div>
          <p class="font-small mb-5">매장명</p>
          <el-input
            v-model="searchInfo.storeName"
            class="mr-20"
            clearable
            style="width: 300px"
            @keyup.enter="getSearchData"
          >
            <template #prepend>
              <el-icon>
                <House />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <p class="font-small mb-5">매장 코드</p>
          <el-input
            v-model="searchInfo.storeCode"
            class="mr-20"
            clearable
            style="width: 300px"
            @keyup.enter="getSearchData"
          >
            <template #prepend>
              <el-icon>
                <House />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <p class="font-small mb-5">페이지당 개수</p>
          <el-select
            v-model="paginationInfo.pageSize"
            class="mr-10"
            placeholder="개수를 선택해주세요."
          >
            <el-option
              v-for="count in pageSizeOptions"
              :key="count.value"
              :label="count.label"
              :value="count.value"
            />
          </el-select>
        </div>
      </el-row>
      <el-button
        type="primary"
        @click="getSearchData"
      >
        <el-icon class="mr-10">
          <Search />
        </el-icon>
        검색하기
      </el-button>
    </el-row>
  </el-card>
  <el-table
    :data="eventAllStoreList"
    border
    class="mb-20"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      prop="storeName"
      sortable
      width="300"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장코드"
      prop="storeCode"
      sortable
      width="300"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="이벤트 등록 여부"
    >
      <template #default="scope">
        <el-tag :type="setEventUseTag(scope.row.eventUse).type">
          {{ setEventUseTag(scope.row.eventUse).text }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="등록 일자"
      prop="addedDate"
      sortable
    />
    <el-table-column
      align="center"
      header-align="center"
      label="종료 일자"
      prop="deletedDate"
      sortable
    />
    <el-table-column
      align="center"
      header-align="center"
      label="이벤트 해제"
    >
      <template #default="scope">
        <el-button
          type="danger"
          @click="setRemoveStoreEvent(scope.row.storeCode)"
        >
          이벤트 해제
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-row justify="center">
    <el-pagination
      :current-page="paginationInfo.currentPage + 1"
      :page-count="paginationInfo.totalPages + 1"
      :page-size="paginationInfo.pageSize"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.promotion-remove-title {
  font-size: 30px;
}
</style>
