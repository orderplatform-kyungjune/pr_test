<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, watchEffect } from 'vue';
import useTagsStore from '@store/storeTags';
import useAuthStore from '@store/storeAuth';
import { pageRouterQueryType } from '@interface/member';

const { authLnbListData, originLnbData, getOriginLnbData } = useAuthStore();

const { addTagsData } = useTagsStore();

const route = useRoute();

const activeIndex = ref('1');

/** 2차 댑스 여부 */
const isHaveChild = (list: pageRouterQueryType) =>
  list && list.child?.length === 0;

watchEffect(() => {
  const target = originLnbData.find((auth) => auth.path === route.path);
  if (target && target.code) {
    activeIndex.value = target.code;
  }
});
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="default_layout_menu"
    text-color="#fff"
  >
    <div
      v-for="first in authLnbListData"
      :key="first.code"
    >
      <div v-if="first.flag">
        <span class="category-text">
          {{ getOriginLnbData(first.code)?.name }}
        </span>
        <div class="divider"></div>
        <div
          v-for="second in first.child"
          :key="second.code"
        >
          <div v-if="second.flag">
            <router-link
              v-if="isHaveChild(second)"
              :to="{
                path: getOriginLnbData(second.code)?.path,
                query: getOriginLnbData(second.code)?.query,
              }"
              @click="addTagsData(getOriginLnbData(second.code))"
            >
              <el-menu-item :index="getOriginLnbData(second.code)?.code">
                <el-icon>
                  <component :is="getOriginLnbData(second.code)?.icon" />
                </el-icon>
                <span>
                  {{ getOriginLnbData(second.code)?.name }}
                </span>
              </el-menu-item>
            </router-link>
            <el-sub-menu
              v-else
              :index="getOriginLnbData(second.code)?.code"
            >
              <template #title>
                <el-icon>
                  <component :is="getOriginLnbData(second.code)?.icon" />
                </el-icon>
                <span>
                  {{ getOriginLnbData(second.code)?.name }}
                </span>
              </template>
              <div
                v-for="third in second.child"
                :key="third.code"
              >
                <div v-if="third.flag">
                  <router-link
                    :to="{
                      path: getOriginLnbData(third.code)?.path,
                      query: getOriginLnbData(third.code)?.query,
                    }"
                    @click="addTagsData(getOriginLnbData(third.code))"
                  >
                    <el-menu-item :index="getOriginLnbData(third.code)?.code">
                      <span>
                        {{ getOriginLnbData(third.code)?.name }}
                      </span>
                    </el-menu-item>
                  </router-link>
                </div>
              </div>
            </el-sub-menu>
          </div>
        </div>
      </div>
    </div>
  </el-menu>
</template>

<style lang="scss" scoped>
.default_layout_menu {
  min-height: calc(100vh - 85px);
  border: 1px solid #545c64;
  border-left: none;
}

.category-text {
  display: block;
  margin: 20px 0 0 25px;
  font-size: 12px;
  color: #9e9e9e;
}

.divider {
  width: 80%;
  height: 1px;
  margin: 5px auto;
  background-color: #797979;
}
</style>
