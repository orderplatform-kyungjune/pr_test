<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { routeHelper, runtimeCheckHelper } from '@utils';
import useLoadingStore from '@store/storeLoading';
import { promotionEventRegister } from '@router/routePaths';
import {
  eventStoreListGoodsListType,
  eventStoreListType,
  requestEnrollStoreGoodsType,
  requestPromotionEventStoreListType,
} from '@interface/promotion';
import { House, Search } from '@element-plus/icons-vue';
import { BreadcrumbHeader, Loading } from '@components';
import {
  PROMOTION_EVENT,
  PROMOTION_REGISTER,
  STATISTICAL_ADMIN,
} from '@common/string';
import { promotionCodec } from '@codecs';
import { promotion } from '@apis';

const { openLoading, closeLoading } = useLoadingStore();

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;

const { pushPageWithQuery } = routeHelper;

const {
  requestPromotionEventStoreList,
  requestEnrollStoreGoods,
  requestRemoveStoreGoods,
} = promotion;

const { promotionEventStoreListCodec } = promotionCodec;

// header props
const promotionRegisterHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: PROMOTION_EVENT },
  { name: PROMOTION_REGISTER },
]);

/** 검색 정보 */
const searchStore = reactive({
  storeName: route.query.storeName as string,
  storeCode: route.query.storeCode as string,
  goodsCnt: Number(route.query.goodsCnt),
  storeCodeList: [''],
  isEventStore: true,
});

/** 검색 기능 라디오 버튼 (매장: store, 상품n개: goods, 이벤트여부: event) */
const searchRadio = ref(route.query.searchRadio);

/** 이벤트 매장 일괄 검색하기 창 토글버튼 */
const toggleTextarea = ref(false);

/** 페이지 당 매장 개수 */
const pageSizeOptions = [
  {
    value: 5,
    label: '5개씩 보기',
  },
  {
    value: 10,
    label: '10개씩 보기',
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

/** 이벤트 상품 개수 */
const eventGoodsCountOptions = [
  {
    value: 1,
    label: '1개',
  },
  {
    value: 2,
    label: '2개',
  },
  {
    value: 3,
    label: '3개',
  },
  {
    value: 4,
    label: '4개',
  },
  {
    value: 5,
    label: '5개',
  },
];

/** 이벤트 매장 등록 여부 */
const eventEnrolledOptions = [
  {
    value: true,
    label: '등록된 매장',
  },
  {
    value: false,
    label: '미등록된 매장',
  },
];

/** textarea 데이터 */
const inputTextarea = ref('');

/** 페이지네이션 */
const paginationInfo = reactive({
  currentPage: Number(route.query.currentPage),
  pageSize: Number(route.query.pageSize),
  totalPages: 1,
  firstPage: true,
  lastPage: false,
});

/** 프로모션 이벤트 리스트 */
const eventStoreList = ref<eventStoreListType[]>([] as eventStoreListType[]);

const getCategoryKey = (data: string, index: number) => {
  if (!data) return `category ${index}`;
  return data;
};

/** 매장 리스트 조회하기 */
const getPromotionEventList = async (
  data: requestPromotionEventStoreListType,
) => {
  const pageInfo = {
    page: paginationInfo.currentPage,
    size: paginationInfo.pageSize,
  };

  const searchInfo = {
    eventNum: Number(route.query.num),
    storeCode: data.storeCode ?? '',
    storeName: data.storeName ?? '',
  };

  try {
    openLoading();
    const res = (await requestPromotionEventStoreList(
      pageInfo,
      searchInfo,
    )) as AxiosResponse;
    const typeError = runtimeCheck(promotionEventStoreListCodec, res.data);

    if (!typeError) {
      if (res.status === 200) {
        eventStoreList.value = res.data.resultData.content;
        paginationInfo.currentPage = res.data.resultData.currentPageNo;
        paginationInfo.totalPages = res.data.resultData.totalPageCount;
        paginationInfo.pageSize = res.data.resultData.elementSizePerPage;
        closeLoading();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 데이터 조회 */
const getSearchDataByRadio = async () => {
  // 매장 검색한 매장 보기
  if (searchRadio.value === 'store') {
    const searchInfo = {
      eventNum: Number(route.query.num),
      storeCode: searchStore.storeCode,
      storeName: searchStore.storeName,
    };

    await getPromotionEventList(searchInfo);
  }

  // 이벤트 상정으로 등록된 매장만 보기
  if (searchRadio.value === 'event') {
    const searchInfo = {
      eventNum: Number(route.query.num),
      isEventStore: searchStore.isEventStore,
    };

    await getPromotionEventList(searchInfo);
  }
};

/** 프로모션 이벤트 매장 등록 */
const setEnrollStoreEvent = async (storeInfo: requestEnrollStoreGoodsType) => {
  const eventNum = Number(route.query.num);

  try {
    openLoading();
    const res = (await requestEnrollStoreGoods(
      storeInfo,
      eventNum,
    )) as AxiosResponse;

    if (res.status === 200) {
      ElMessage({
        type: 'success',
        message: '이벤트 매장으로 등록되었습니다.',
      });

      closeLoading();
      return;
    }

    ElMessage({
      type: 'error',
      message: '이벤트 매장 등록이 실패했습니다.',
    });
  } catch (error) {
    console.log(error);
  }
};

/** 프로모션 이벤트 매장 해제 */
const setRemoveStoreEvent = async (storeInfo: requestEnrollStoreGoodsType) => {
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

      closeLoading();
      return;
    }

    ElMessage({
      type: 'error',
      message: '이벤트 매장 등록이 실패했습니다.',
    });
  } catch (error) {
    console.log(error);
  }
};

/** textarea 데이터 변환 후 일괄 검색하기 */
const setEventAllStore = async () => {
  if (inputTextarea.value === '') {
    ElMessage({
      type: 'warning',
      message: '매장 데이터를 입력해주세요.',
    });
    return;
  }

  try {
    const splitStore = inputTextarea.value.split('\n');
    const result: string[] = [];

    splitStore.forEach((store: string) => {
      const data = store.split('\t');
      result.push(data[0]);
    });
    searchStore.storeCodeList = result;

    const searchInfo = {
      eventNum: Number(route.query.num),
      storeCodeList: searchStore.storeCodeList,
    };

    await getPromotionEventList(searchInfo);
  } catch (error) {
    ElMessageBox.alert(
      '검색에 실패하였습니다. 검색 형식을 맞춰주세요.',
      '실패',
      {
        confirmButtonText: '확인',
        type: 'error',
      },
    );
  }
};

/** 스위치 선택시 api 요청 */
const switchAction = async (
  state: boolean,
  targetGoods: eventStoreListGoodsListType,
  storeCode: string,
) => {
  const requestData = { storeCode };

  if (state) {
    const registerEventRequestData = Object.assign(requestData, {
      posGoodsCode: targetGoods.posGoodsCode,
    });
    await setEnrollStoreEvent(registerEventRequestData);
  } else {
    await setRemoveStoreEvent(requestData);
  }

  if (!toggleTextarea.value) {
    getSearchDataByRadio();
  }

  if (toggleTextarea.value) {
    setEventAllStore();
  }
};

/** 페이지 이동, 검색 */
const setQueryData = async () => {
  const searchData = {
    num: route.query.num,
    gift: route.query.gift,
    currentPage: paginationInfo.currentPage,
    pageSize: paginationInfo.pageSize,
    storeName: searchStore.storeName,
    storeCode: searchStore.storeCode,
    goodsCnt: searchStore.goodsCnt,
    searchRadio: searchRadio.value,
  };

  pushPageWithQuery(promotionEventRegister, searchData);
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

  if (!toggleTextarea.value) {
    setQueryData();
  }

  if (toggleTextarea.value) {
    setEventAllStore();
  }
};

// 라디오 버튼에 따른 disabled 처리
const isStoreSearch = () => searchRadio.value === 'store';
const isGoodsSearch = () => searchRadio.value === 'goods';
const isEventSearch = () => searchRadio.value === 'event';

getSearchDataByRadio();
</script>

<template>
  <Loading :text="'로딩중입니다..'" />
  <BreadcrumbHeader :propsHeader="promotionRegisterHeader" />
  <p class="promotion-register-title mb-10">프로모션 이벤트 등록</p>
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
        <div>
          <p class="font-small mb-5">매장명</p>
          <el-input
            v-model="searchStore.storeName"
            :disabled="!isStoreSearch()"
            class="mr-10"
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
            v-model="searchStore.storeCode"
            :disabled="!isStoreSearch()"
            class="mr-10"
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
          <p class="font-small mb-5">이벤트 상품 개수</p>
          <el-select
            v-model="searchStore.goodsCnt"
            :disabled="!isGoodsSearch()"
            class="mr-10"
            placeholder="개수를 선택해주세요."
          >
            <el-option
              v-for="count in eventGoodsCountOptions"
              :key="count.value"
              :label="count.label"
              :value="count.value"
            />
          </el-select>
        </div>
        <div>
          <p class="font-small mb-5">이벤트 매장 등록 여부</p>
          <el-select
            v-model="searchStore.isEventStore"
            :disabled="!isEventSearch()"
            placeholder="선택해주세요."
          >
            <el-option
              v-for="event in eventEnrolledOptions"
              :key="event.value"
              :label="event.label"
              :value="event.value"
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
    <el-row justify="space-between">
      <el-radio-group
        v-model="searchRadio"
        class="mr-40"
      >
        <el-radio label="store"> 검색한 매장 보기</el-radio>
        <el-radio label="event">
          이벤트 매장으로 등록 여부의 매장만 보기
        </el-radio>
      </el-radio-group>
    </el-row>
  </el-card>
  <el-table
    :data="eventStoreList"
    border
    class="mb-20"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="매장명"
      prop="storeName"
      width="200"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="매장코드"
      prop="storeCode"
      width="200"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="상품목록"
    >
      <template #default="scoped">
        <el-table
          :data="scoped.row.goodsList"
          border
        >
          <el-table-column
            align="center"
            header-align="center"
            label="이미지"
          >
            <template #default="{ row }">
              <el-image
                :src="row.goodsImageUrl"
                class="promotion-product-image"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="상품명"
            prop="goodsName"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="상품코드"
            prop="goodsCode"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="분류"
          >
            <template #default="{ row }">
              <div
                v-for="(category, categoryIndex) in row.goodsCategoryNames"
                :key="getCategoryKey(category, categoryIndex)"
              >
                {{ category }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            header-align="center"
            label="가격"
            prop="goodsPrice"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="포스상품이름"
            prop="posGoodsName"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="포스코드"
            prop="posGoodsCode"
          />
          <el-table-column
            align="center"
            header-align="center"
            label="등록"
          >
            <template #default="{ row }">
              <el-switch
                v-model="row.isEventGoods"
                :active-value="true"
                :inactive-value="false"
                active-text="등록"
                inactive-text="제거"
                style="
                  --el-switch-on-color: #409eff;
                  --el-switch-off-color: #f56c6c;
                "
                @change="
                  (state: boolean) =>
                    switchAction(state, row, scoped.row.storeCode)
                "
              />
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-table-column>
  </el-table>
  <el-row justify="center">
    <el-pagination
      :current-page="paginationInfo.currentPage + 1"
      :page-count="paginationInfo.totalPages"
      :page-size="paginationInfo.pageSize"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.promotion-register-title {
  font-size: 30px;
}

.promotion-product-image {
  width: 140px;
  height: 100px;
}
</style>
