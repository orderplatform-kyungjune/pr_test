<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useTagsStore from '@store/storeTags';
import useModalStore from '@store/storeModal';
import {
  promotionEventRegister,
  promotionEventInfo,
  promotionEventRemove,
} from '@router/routePaths';
import { promotionEventListType } from '@interface/promotion';
import { Picture } from '@element-plus/icons-vue';
import { AddPromotionEventModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  STATISTICAL_ADMIN,
  PROMOTION_EVENT,
  ADD_PROMOTION_EVENT,
} from '@common/string';
import { promotionCodec } from '@codecs';
import { promotion } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { requestPromotionEventList } = promotion;
const { promotionEventListCodec } = promotionCodec;
const tagStore = useTagsStore();
const { addTagsData } = tagStore;
const { flag, openModal } = useModalStore();
// header props
const promotionListHeader = reactive([
  { name: STATISTICAL_ADMIN },
  { name: PROMOTION_EVENT },
]);

/** 프로모션 이벤트 리스트 */
const promotionList = ref<promotionEventListType[]>([]);
/** 프로모션 이벤트 리스트 조회 */
const getPromotionEventList = async () => {
  try {
    const res = (await requestPromotionEventList()) as AxiosResponse;
    if (res.status === 200) {
      const typeError = runtimeCheck(promotionEventListCodec, res.data);

      if (!typeError) {
        promotionList.value = res.data.content;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 이벤트 상태 태그 이름 */
const getStateTagName = (event: promotionEventListType) => {
  const nowTime = new Date();
  const eventTime = new Date(event.endDate);
  if (event.eventQty === 0) return '경품 소진';
  if (nowTime > eventTime) return '이벤트 종료';
  return '이벤트 진행중';
};

/** 이벤트 상태 태그 색상 */
const getStateTagColor = (event: promotionEventListType) => {
  const nowTime = new Date();
  const eventTime = new Date(event.endDate);
  if (event.eventQty === 0) return 'danger';
  if (nowTime > eventTime) return 'info';
  return '';
};

/** key 방어코드 */
const getEventKey = (event: promotionEventListType, index: number) => {
  if (!event) {
    return `event-${index}`;
  }
  return `event-${event.num}`;
};

getPromotionEventList();
</script>

<template>
  <AddPromotionEventModal
    v-if="flag.addPromotionEvent"
    :getList="() => getPromotionEventList()"
  />
  <BreadcrumbHeader :propsHeader="promotionListHeader" />
  <el-row
    align="top"
    justify="space-between"
  >
    <p class="promotion-list-title mb-30">프로모션 이벤트 목록</p>
    <el-button
      type="primary"
      @click="openModal(ADD_PROMOTION_EVENT)"
    >
      이벤트 등록
    </el-button>
  </el-row>
  <div class="promotion-event-grid">
    <div
      v-for="(event, index) in promotionList"
      :key="getEventKey(event, index)"
    >
      <el-card :body-style="{ padding: '0px' }">
        <el-image
          :src="event.eventBannerUrl"
          class="promotion-event-image"
          fit="contain"
        >
          <template #error>
            <div class="image-slot">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
          </template>
        </el-image>
        <div class="promotion-event-card">
          <el-row
            align="middle"
            class="mb-20"
          >
            <p class="promotion-event-card-title mr-10">
              {{ event.eventNaming }}
            </p>
            <el-tag :type="getStateTagColor(event)">
              {{ getStateTagName(event) }}
            </el-tag>
          </el-row>
          <el-row>
            <router-link
              :to="{
                path: promotionEventRegister,
                query: {
                  num: event.num,
                  gift: event.eventGoodsName,
                  currentPage: 0,
                  pageSize: 5,
                  storeName: '',
                  storeCode: '',
                  goodsCnt: 1,
                  searchRadio: 'store',
                },
              }"
              class="mr-10"
            >
              <el-button
                type="primary"
                @click="
                  addTagsData({
                    name: '이벤트 매장 등록',
                    path: promotionEventRegister,
                    query: {
                      num: event.num,
                      gift: event.eventGoodsName,
                      currentPage: 0,
                      pageSize: 5,
                      storeName: '',
                      storeCode: '',
                      goodsCnt: 1,
                      searchRadio: 'store',
                    },
                  })
                "
              >
                매장 등록
              </el-button>
            </router-link>
            <router-link
              :to="{
                path: promotionEventRemove,
                query: {
                  num: event.num,
                  currentPage: 0,
                  pageSize: 10,
                  storeName: '',
                  storeCode: '',
                },
              }"
              class="mr-10"
            >
              <el-button
                type="danger"
                @click="
                  addTagsData({
                    name: '이벤트 매장 해제',
                    path: promotionEventRemove,
                    query: {
                      num: event.num,
                      currentPage: 0,
                      pageSize: 10,
                      storeName: '',
                      storeCode: '',
                    },
                  })
                "
              >
                매장 해제
              </el-button>
            </router-link>
            <router-link
              :to="{
                path: promotionEventInfo,
                query: { num: event.num },
              }"
              class="mr-10"
            >
              <el-button
                type="info"
                @click="
                  addTagsData({
                    name: '이벤트 정보',
                    path: promotionEventInfo,
                    query: { num: event.num },
                  })
                "
              >
                이벤트 정보
              </el-button>
            </router-link>
            <!-- <el-button
              type="success"
              @click="openModal(ABUSING_STORE)"
            >
              어뷰징 매장 조회
            </el-button> -->
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.promotion-list-title {
  font-size: 30px;
}

.promotion-event-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;

  .promotion-event-image {
    width: 100%;
    height: 300px;
    background-color: #e9e9e9;
  }

  .promotion-event-card {
    padding: 20px;

    .promotion-event-card-title {
      display: flex;
      align-items: center;
      font-size: 18px;
    }
  }
}
</style>
