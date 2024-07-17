<script lang="ts" setup>
import { reactive, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useAuthStore from '@store/storeAuth';
import {
  authPageTreeType,
  elementBasicType,
  pageRouterQueryType,
  torderAuthListType,
} from '@interface/member';
import { BreadcrumbHeader } from '@components';
import { AUTH_MANAGE } from '@common/string';
import { memberCodec } from '@codecs';
import { auth, member } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { torderAuthListCodec } = memberCodec;
const { requestTorderAuthList, requestTorderAuthInfo } = auth;
const { requestAuthUpdate } = member;
const { originLnbTree, getOriginLnbData, totalPageList, totalFunctionList } =
  useAuthStore();

// header props
const tableManageHeader = reactive([{ name: AUTH_MANAGE }]);

/** 탭 선택 형식 */
const tabType = ref('lnb');

/** 권한 번호 (셀렉트 박스) */
const authNumber = ref('');

/** 권한 리스트 (5, 8, 9, 10, 1004) */
const torderAuthList: Ref<torderAuthListType[]> = ref([]);
const getTorderAuthList = async () => {
  try {
    const res = (await requestTorderAuthList()) as AxiosResponse;
    const typeError = runtimeCheck(torderAuthListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        torderAuthList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const defaultAuthLnbList: Ref<authPageTreeType[]> = ref([]);
/** 선택된 권한 lnb 리스트 */
const selectedAuthLnbList: Ref<authPageTreeType[]> = ref([]);
/** 선택된 권한 page 리스트 */
const selectedAuthPageList: Ref<elementBasicType[]> = ref([]);
/** 선택된 Function 리스트 */
const selectedFunctionList: Ref<elementBasicType[]> = ref([]);
/** 설정된 권한 데이터 불러오기 */
const getTorderAuthInfo = async () => {
  try {
    const requestData = authNumber.value;
    const res = (await requestTorderAuthInfo(requestData)) as AxiosResponse;

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
      defaultAuthLnbList.value = JSON.parse(JSON.stringify(originLnbTree));
      selectedAuthLnbList.value = res.data.data.T_order_MGroup_lnb_auth;
      selectedAuthPageList.value = res.data.data.T_order_MGroup_page_auth;
      selectedFunctionList.value = res.data.data.T_order_MGroup_function_auth;
    }
  } catch (error) {
    console.log(error);
  }
};

/** 권한 데이터 변경하기 */
const postAuthUpdate = async () => {
  try {
    let requestData;

    if (tabType.value === 'lnb') {
      requestData = {
        T_order_MGroup_code: String(authNumber.value),
        auth_type: tabType.value,
        T_order_MGroup_lnb_auth: defaultAuthLnbList.value,
      };
    } else if (tabType.value === 'page') {
      requestData = {
        T_order_MGroup_code: String(authNumber.value),
        auth_type: tabType.value,
        T_order_MGroup_page_auth: selectedAuthPageList.value,
      };
    } else if (tabType.value === 'function') {
      requestData = {
        T_order_MGroup_code: String(authNumber.value),
        auth_type: tabType.value,
        T_order_MGroup_function_auth: selectedFunctionList.value,
      };
    } else {
      ElMessageBox.alert('요청에 실패하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      return;
    }

    const res = (await requestAuthUpdate(requestData)) as AxiosResponse;

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
      ElMessage({
        type: 'success',
        message: '성공적으로 적용되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 데이터 초기화 */
const setResetData = () => {
  if (tabType.value === 'lnb') {
    selectedAuthLnbList.value = [];
  }
};

/** 기본 (스토어) lnb에 불러온 권한 번호의 flag 상태값 연결 */
watch(
  () => defaultAuthLnbList.value,
  () => {
    selectedAuthLnbList.value.forEach((first) => {
      const firstIndex = defaultAuthLnbList.value.findIndex(
        (firstInDefault: authPageTreeType) =>
          firstInDefault.code === first.code,
      );
      if (
        Object.keys(first).includes('child') &&
        defaultAuthLnbList.value[firstIndex]
      ) {
        defaultAuthLnbList.value[firstIndex].flag = first.flag;

        first.child.forEach((second) => {
          const secondIndex = defaultAuthLnbList.value[
            firstIndex
            ].child?.findIndex(
            (secondInDefault: authPageTreeType) =>
              secondInDefault.code === second.code,
          );
          const secondTarget =
            defaultAuthLnbList.value[firstIndex].child[secondIndex];
          if (secondTarget && Object.keys(secondTarget).includes('child')) {
            defaultAuthLnbList.value[firstIndex].child[secondIndex].flag =
              second.flag;

            second.child.forEach((third) => {
              const thirdIndex = defaultAuthLnbList.value[firstIndex].child[
                secondIndex
                ].child?.findIndex(
                (thirdInDefault: authPageTreeType) =>
                  thirdInDefault.code === third.code,
              );
              const thirdTarget =
                defaultAuthLnbList.value[firstIndex].child[secondIndex].child[
                  thirdIndex
                  ];
              if (thirdTarget && Object.keys(thirdTarget).includes('child')) {
                defaultAuthLnbList.value[firstIndex].child[secondIndex].child[
                  thirdIndex
                  ].flag = third.flag;
              }
            });
          }
        });
      }
    });
  },
);

const changeChildFlag = (selectedAuth: authPageTreeType) => {
  if (selectedAuth.child?.length === 0) return;

  selectedAuth.child?.forEach((childAuth: authPageTreeType) => {
    // eslint-disable-next-line no-param-reassign
    childAuth.flag = selectedAuth.flag;

    if (childAuth.child?.length > 0) {
      childAuth.child?.forEach((grandchildAuth: authPageTreeType) => {
        // eslint-disable-next-line no-param-reassign
        grandchildAuth.flag = selectedAuth.flag;
      });
    }
  });
};

const isHaveNoChild = (list: pageRouterQueryType) =>
  list && list.child?.length === 0;
const isHaveNoLnbChild = (list: authPageTreeType) =>
  list && list.child?.length === 0;

// v-for 방어 코드
const getAuthLnbKey = (authInfo: authPageTreeType, index: number) => {
  if (!authInfo) return `lnb ${index}`;
  return authInfo.code;
};
const getAuthListKey = (authInfo: torderAuthListType, index: number) => {
  if (!authInfo) return `auth ${index}`;
  return authInfo.T_order_MGroup_no;
};

getTorderAuthList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="tableManageHeader" />
  <el-card class="mb-20">
    <el-row justify="space-between">
      <div>
        <el-row align="middle">
          <div class="mr-20">권한</div>
          <el-select
            v-model="authNumber"
            placeholder="권한을 선택해주세요."
            size="large"
            style="width: 350px"
            @change="getTorderAuthInfo"
          >
            <el-option
              v-for="(number, index) in torderAuthList"
              :key="getAuthListKey(number, index)"
              :label="number.T_order_MGroup_name"
              :value="number.T_order_MGroup_code"
            >
              {{ number.T_order_MGroup_name }} ({{
                number.T_order_MGroup_code
              }})
            </el-option>
          </el-select>
        </el-row>
      </div>
      <div>
        <el-button
          size="large"
          type="primary"
          @click="postAuthUpdate"
        >
          저장하기
        </el-button>
      </div>
    </el-row>
  </el-card>

  <!-- TAB -->
  <el-tabs
    v-model="tabType"
    type="border-card"
  >
    <el-tab-pane
      label="LNB 설정"
      name="lnb"
    >
      <div
        v-if="authNumber"
        class="lnb-menu-grid"
      >
        <el-menu
          :default-openeds="['sub']"
          class="default_layout_menu"
        >
          <div
            v-for="(first, index) in defaultAuthLnbList"
            :key="getAuthLnbKey(first, index)"
          >
            <div class="menu-item-grid">
              <el-checkbox
                v-model="first.flag"
                :label="first.name"
                @change="changeChildFlag(first)"
              />
            </div>
            <div class="divider"></div>
            <div
              v-for="second in first.child"
              :key="getAuthLnbKey(second, index)"
            >
              <el-menu-item v-if="isHaveNoLnbChild(second)">
                <div class="menu-item-grid">
                  <el-checkbox
                    v-model="second.flag"
                    :label="second.name"
                  />
                </div>
              </el-menu-item>
              <el-sub-menu
                v-else
                index="sub"
              >
                <template #title>
                  <div class="menu-item-grid">
                    <el-checkbox
                      v-model="second.flag"
                      :label="second.name"
                      @change="changeChildFlag(second)"
                    />
                  </div>
                </template>
                <div
                  v-for="third in second.child"
                  :key="third.code"
                >
                  <el-menu-item>
                    <div class="menu-item-grid">
                      <el-checkbox
                        v-model="third.flag"
                        :label="third.name"
                      />
                    </div>
                  </el-menu-item>
                </div>
              </el-sub-menu>
            </div>
          </div>
        </el-menu>
        <el-menu
          :default-openeds="['sub']"
          active-text-color="#fff"
          background-color="#545c64"
          class="default_layout_menu"
          text-color="#fff"
        >
          <div
            v-for="first in defaultAuthLnbList"
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
                  <el-menu-item v-if="isHaveNoChild(second)">
                    <el-icon>
                      <component :is="getOriginLnbData(second.code)?.icon" />
                    </el-icon>
                    <span>
                      {{ getOriginLnbData(second.code)?.name }}
                    </span>
                  </el-menu-item>
                  <el-sub-menu
                    v-else
                    index="sub"
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
                        <el-menu-item>
                          <span>
                            {{ getOriginLnbData(third.code)?.name }}
                          </span>
                        </el-menu-item>
                      </div>
                    </div>
                  </el-sub-menu>
                </div>
              </div>
            </div>
          </div>
        </el-menu>
      </div>
      <div
        v-else
        class="non-selected-auth-number"
      >
        수정할 권한을 선택해주세요.
      </div>
    </el-tab-pane>
    <el-tab-pane
      label="PAGE 접근 권한 설정"
      name="page"
    >
      <el-transfer
        v-if="authNumber"
        v-model="selectedAuthPageList"
        :data="totalPageList"
        :props="{
          key: 'value',
          label: 'label',
        }"
        :titles="['모든 페이지', '권한 부여 페이지']"
        class="auth-manage-transfer-wrapper"
        filterable
        size="large"
      >
        <template #default="{ option }">
          <div class="auth-manage-transfer-grid">
            <div class="auth-manage-transfer-label">
              {{ option.label }}
            </div>
            <div class="auth-manage-transfer-value">
              {{ option.value }}
            </div>
          </div>
        </template>
      </el-transfer>
      <div
        v-else
        class="non-selected-auth-number"
      >
        수정할 권한을 선택해주세요.
      </div>
    </el-tab-pane>
    <el-tab-pane
      label="Function 권한 설정"
      name="function"
    >
      <el-transfer
        v-if="authNumber"
        v-model="selectedFunctionList"
        :data="totalFunctionList"
        :props="{
          key: 'value',
          label: 'label',
        }"
        :titles="['모든 기능', '선택된 기능']"
        class="auth-manage-transfer-wrapper"
        filterable
        size="large"
      >
        <template #default="{ option }">
          <div class="auth-manage-transfer-grid">
            <div class="auth-manage-transfer-label">
              {{ option.label }}
            </div>
            <div class="auth-manage-transfer-value">
              {{ option.value }}
            </div>
          </div>
        </template>
      </el-transfer>
      <div
        v-else
        class="non-selected-auth-number"
      >
        수정할 기능을 선택해주세요.
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.lnb-menu-grid {
  display: flex;
  gap: 100px;
  justify-content: center;
  margin-top: 10px;

  .default_layout_menu {
    box-sizing: border-box;
    width: 400px;
    min-height: calc(100vh - 60px);
    padding: 20px;
    border: 1px solid #545c64;
    border-radius: 10px;

    .category-text {
      display: block;
      margin: 10px;
      font-size: 12px;
      color: #9e9e9e;
    }

    .menu-item-grid {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .divider {
      width: 100%;
      height: 1px;
      margin: 5px auto;
      background-color: #797979;
    }
  }
}

.auth-manage-transfer-wrapper {
  --el-transfer-panel-body-height: 580px;
  --el-transfer-panel-width: 43%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:deep(.el-transfer-panel__filter) {
    width: calc(100% - 30px);
  }

  &:deep(.el-checkbox:last-of-type) {
    margin-right: 30px;
  }

  .auth-manage-transfer-grid {
    display: flex;
    justify-content: space-between;

    .auth-manage-transfer-label {
      margin-left: 10px;
      font-size: 18px;
      font-weight: bold;
    }

    .auth-manage-transfer-value {
      font-size: 13px;
      color: #adafbc;
    }
  }
}

.non-selected-auth-number {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  font-size: 26px;
}
</style>
