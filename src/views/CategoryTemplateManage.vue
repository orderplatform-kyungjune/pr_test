<script lang="ts" setup>
import { computed, h, reactive, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  responseStoreListItemType,
  storeMappingResListType,
  storeSearchItemType,
  storesMappingDataType,
  storeTemplateDataType,
  storeTemplateResListType,
} from '@interface/categoryTemplate';
import { InfoFilled, Picture } from '@element-plus/icons-vue';
import { TemplateRestoreModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import { CATEGORY_TEMPLATE_MANAGE } from '@common/string';
import { categoryTemplateCodec, inquiryCodec } from '@codecs';
import { categoryTemplate, store } from '@apis';

const { flag } = useModalStore();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;

const { requestSearchStoreNameResults } = store;
const {
  requestTemplateGet,
  requestTemplateMapping,
  requestTemplateRestoreList,
  requestTemplateSave,
} = categoryTemplate;
const categoryTemplateManageHeader = reactive([
  { name: CATEGORY_TEMPLATE_MANAGE },
]);
const { storeListCodec } = inquiryCodec;
const {
  storeTemplateResponseCodec,
  storeMappingResponseCodec,
  restoreTemplateResponseCodec,
} = categoryTemplateCodec;

const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

const loading = ref(true);

/** 데이터 사용 매장 선택 */
const inputDataSelectStore = ref('');
const dataSelectStore = reactive<storeSearchItemType>({
  value: '',
  storeCode: '',
  apiType: '',
});
/** 등록 매장 선택 */
const inputAddSelectStore = ref('');
const addSelectStore = reactive<storeSearchItemType>({
  value: '',
  storeCode: '',
  apiType: '',
});
/** 최종 정보 저장 데이터 */
const categoryTemplateData = reactive({
  categoryType: 'remove',
  mappingType: 'code',
  getStoreCode: computed(() => dataSelectStore.storeCode),
  setStoreCode: computed(() => addSelectStore.storeCode),
});

/** 모든 매장 정보 데이터 불러오기 */
const searchedStoreList: Ref<storeSearchItemType[]> = ref([]);

/** 매장명 검색  */
const postSearchStoreName = async () => {
  loading.value = true;

  try {
    const payload = { searchTxt: '' };
    const res = (await requestSearchStoreNameResults(payload)) as AxiosResponse;
    const typeError = runtimeCheck(storeListCodec, res.data);

    loading.value = false;

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
        searchedStoreList.value = res.data.data.map(
          (storeItem: responseStoreListItemType) => ({
            value: storeItem.label,
            storeCode: storeItem.value,
            apiType: storeItem.api_type,
          }),
        );
      }
    }
  } catch (error) {
    console.log(error);
    loading.value = false;
  }
};

const setDataSelectStore = (selectedStore: storeSearchItemType) => {
  dataSelectStore.value = selectedStore.value;
  dataSelectStore.storeCode = selectedStore.storeCode;
  dataSelectStore.apiType = selectedStore.apiType;
};

const setAddSelectStore = (selectedStore: storeSearchItemType) => {
  addSelectStore.value = selectedStore.value;
  addSelectStore.storeCode = selectedStore.storeCode;
  addSelectStore.apiType = selectedStore.apiType;
};

const createFilter =
  (queryString: string) => (storeListItem: storeSearchItemType) =>
    storeListItem.value.toLowerCase().includes(queryString.toLowerCase());
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? searchedStoreList.value.filter(createFilter(queryString))
    : searchedStoreList.value;
  cb(results);
};

/** 선택 매장의 분류 가져오기 API 호출 */
const selectStoreData = reactive<storeTemplateDataType>({
  info: {
    big_cnt: 0,
    child_cnt: 0,
    goods_cnt: 0,
  },
  list: [],
});

const postSelectStoreTemplate = async () => {
  try {
    const storeInfo = {
      type: 'store',
      getStoreCode: dataSelectStore.storeCode,
    };
    const res = (await requestTemplateGet(storeInfo)) as AxiosResponse;
    const typeError = runtimeCheck(storeTemplateResponseCodec, res.data);

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
        selectStoreData.info = res.data.data.info;
        selectStoreData.list = res.data.data.list;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const formatGoodPrice = (price: number) => price?.toLocaleString();

/** 선택한 매장의 매장저장 복구 데이터 리스트 조회 */
const restoreList = ref<string[]>([]);
const postTemplateRestoreList = async () => {
  try {
    const res = (await requestTemplateRestoreList(
      addSelectStore.storeCode,
    )) as AxiosResponse;
    const typeError = runtimeCheck(restoreTemplateResponseCodec, res.data);

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
        restoreList.value = res.data.data.historyTime;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 선택한 매장에 분류 및 상품 정보 복사하기(맵핑, 1단계) */
const storesMappingData = reactive<storesMappingDataType>({
  info: {
    goods_cnt: 0,
    false_cnt: 0,
    true_cnt: 0,
  },
  list: [],
});

const postStoresTemplateMapping = async () => {
  if (selectStoreData.list?.length <= 0) {
    ElMessageBox.alert('분류 가져오기를 먼저 실행해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }
  if (!categoryTemplateData.setStoreCode) {
    ElMessageBox.alert('매장을 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  try {
    const res = (await requestTemplateMapping(
      categoryTemplateData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(storeMappingResponseCodec, res.data);

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
        storesMappingData.list = res.data.data.list;
        const text = `<span class="essential-star">${addSelectStore.value}</span>에 <span class="essential-star">${dataSelectStore.value}</span>의 분류 정보가 정상적으로 복사 완료되었습니다.`;
        ElMessageBox.alert(text, '알림', {
          confirmButtonText: '확인',
          type: 'success',
          center: true,
          dangerouslyUseHTMLString: true,
        });
        // 분류 정보 복사할 때 복구 리스트 함께 조회
        await postTemplateRestoreList();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const postTemplateSave = async () => {
  loading.value = true;

  try {
    const res = (await requestTemplateSave(
      categoryTemplateData,
    )) as AxiosResponse;

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
        showClose: true,
        message: '정보 저장을 완료하였습니다.',
        type: 'success',
      });
    }
  } catch (error) {
    console.log(error);
    ElMessage({
      showClose: true,
      message: '정보를 저장하는데 실패하였습니다.',
      type: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const readCtgGuideTextFlag = (
  list: storeTemplateResListType[] | storeMappingResListType[],
) => list?.length <= 0;

/** 가져오기 조건 변경 시 정보 비교란 초기화 */
watch(
  () => categoryTemplateData.categoryType,
  () => {
    storesMappingData.list = [];
  },
);

/** 상품 판정 기준 변경 시 정보 비교란 초기화 */
watch(
  () => categoryTemplateData.mappingType,
  () => {
    storesMappingData.list = [];
  },
);

const templateSaveConfirm = () => {
  if (!dataSelectStore.storeCode) {
    ElMessageBox.alert('데이터를 사용하실 매장을 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (!addSelectStore.storeCode) {
    ElMessageBox.alert('등록하실 매장을 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  if (readCtgGuideTextFlag(storesMappingData.list)) {
    ElMessageBox.alert('[등록 전 정보 미리보기]를 해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  ElMessageBox({
    title: '경고',
    message: h('p', null, [
      h('span', null, '정말로 '),
      h('em', { class: 'essential-star' }, dataSelectStore.value),
      h('span', null, '에서 가져온 분류 정보를'),
      h('br'),
      h('em', { class: 'essential-star' }, addSelectStore.value),
      h('span', null, '에 저장하시겠습니까?'),
    ]),
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
  })
    .then(() => {
      postTemplateSave();
    })
    .catch((error) => {
      console.log(error);
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

watch(
  () => addSelectStore.storeCode,
  () => {
    storesMappingData.list = [];
  },
);

watch(
  () => dataSelectStore.storeCode,
  () => {
    selectStoreData.list = [];
  },
);

const getFirstCtgKey = (name: string, index: number) =>
  name ? `first-ctg-name-${name}-${index}` : `first-ctg-${index}`;
const getSecondeCtgKey = (name: string, index: number) =>
  name ? `second-ctg-name-${name}-${index}` : `second-ctg-${index}`;

postSearchStoreName();
</script>

<template>
  <TemplateRestoreModal
    v-if="flag.templateRestore"
    :addSelectStore="addSelectStore"
    :restoreList="restoreList"
  />
  <BreadcrumbHeader :propsHeader="categoryTemplateManageHeader" />
  <el-row
    v-loading="loading"
    :element-loading-svg="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-text="데이터를 불러오는 중입니다..."
    justify="space-between"
  >
    <div class="template-manage-wrap">
      <el-descriptions
        :column="1"
        border
        title="매장 템플릿 가져오기"
      >
        <el-descriptions-item
          label="매장 선택"
          label-align="center"
        >
          <el-autocomplete
            v-model="inputDataSelectStore"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            class="width-100"
            clearable
            placeholder="매장명을 검색해주세요."
            @select="setDataSelectStore"
          />
        </el-descriptions-item>
        <el-descriptions-item
          label="선택 매장"
          label-align="center"
        >
          <el-row
            align="middle"
            justify="space-between"
          >
            <el-row>
              <span class="ml-5">
                {{ dataSelectStore.value ? dataSelectStore.value : '미선택' }}
              </span>
              <el-tag
                v-if="dataSelectStore.apiType"
                :effect="dataSelectStore.apiType === '2.0' ? 'dark' : 'plain'"
                class="ml-5"
                round
                type="info"
              >
                {{ `API ${dataSelectStore.apiType}` }}
              </el-tag>
            </el-row>
            <el-button
              v-if="dataSelectStore.value"
              color="#000"
              @click="postSelectStoreTemplate"
            >
              분류 가져오기
            </el-button>
          </el-row>
        </el-descriptions-item>
      </el-descriptions>
      <el-card
        :body-style="{ height: '485px', overflow: 'scroll' }"
        class="mt-40"
        shadow="never"
      >
        <template #header>
          <p class="font-small">분류 정보</p>
          <div class="font-small mt-10">
            (대분류 수: {{ selectStoreData.info.big_cnt }}) / (중분류 수:
            {{ selectStoreData.info.child_cnt }}) / (총 상품 수:
            {{ selectStoreData.info.goods_cnt }})
          </div>
        </template>
        <div
          v-if="readCtgGuideTextFlag(selectStoreData.list)"
          class="font-small gray-word"
        >
          매장을 선택하신 후 [분류 가져오기]를 해주세요.
        </div>
        <el-collapse
          v-for="(firstCtg, index) in selectStoreData.list"
          :key="getFirstCtgKey(firstCtg.categoryName, index)"
          class="mb-30"
        >
          <!-- 빨간색 대분류 -->
          <div class="first-ctg-title-wrap">
            <div class="ellipsis-text-1">
              {{ firstCtg.categoryName }}
            </div>
          </div>
          <!-- 주황색 중분류 -->
          <el-collapse-item
            v-for="(secondCtg, ctgIndex) in firstCtg.childCategoryList"
            :key="getSecondeCtgKey(secondCtg.childCategoryName, ctgIndex)"
            class="mb-5"
          >
            <template #title>
              <el-row
                align="middle"
                class="sub-category-title-wrap"
                justify="space-between"
              >
                <div class="ellipsis-text-1">
                  {{ secondCtg.childCategoryName }}
                </div>
                <el-tag
                  effect="dark"
                  type="warning"
                >
                  {{ secondCtg.childCategoryGoodCount }}
                </el-tag>
              </el-row>
            </template>
            <el-table
              :data="secondCtg.childCategoryGoodList"
              border
            >
              <el-table-column
                align="center"
                label="상품코드"
                prop="goodCode"
                width="78px"
              />
              <el-table-column
                align="center"
                label="상품명"
              >
                <template #default="scope">
                  <span class="ellipsis-text-2">
                    {{ scope.row.goodDpName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="가격"
              >
                <template #default="scope">
                  {{ formatGoodPrice(scope.row.goodPrice) }}
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="이미지"
                width="125px"
              >
                <template #default="scope">
                  <el-image
                    :src="scope.row.goodImage"
                    fit="cover"
                    style="width: 70px; height: 50px"
                  >
                    <template #error>
                      <div class="template-item-image-slot">
                        <el-icon>
                          <Picture />
                        </el-icon>
                      </div>
                    </template>
                  </el-image>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
    <div class="template-manage-wrap">
      <el-descriptions
        :column="1"
        border
        title="적용할 매장 정보"
      >
        <el-descriptions-item label-align="center">
          <template #label>
            <span> 매장 선택 </span>
            <span class="essential-star"> * </span>
          </template>
          <el-autocomplete
            v-model="inputAddSelectStore"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            class="width-100"
            clearable
            placeholder="매장명을 검색해주세요."
            @select="setAddSelectStore"
          />
        </el-descriptions-item>
        <el-descriptions-item
          label="선택 매장"
          label-align="center"
        >
          <el-row>
            <span class="ml-5">
              {{ addSelectStore.value ? addSelectStore.value : '미선택' }}
            </span>
            <el-tag
              v-if="addSelectStore.apiType"
              :effect="addSelectStore.apiType === '2.0' ? 'dark' : 'plain'"
              class="ml-5"
              round
              type="info"
            >
              {{ `API ${addSelectStore.apiType}` }}
            </el-tag>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          label="상품 판정 기준"
          label-align="center"
        >
          <div class="radio-button-wrapper">
            <el-radio-group
              v-model="categoryTemplateData.mappingType"
              class="radio-button-group"
            >
              <el-row>
                <el-radio label="code"> 포스 상품 코드</el-radio>
                <el-radio label="name">
                  상품명
                  <el-popover
                    :width="158"
                    placement="top-start"
                    trigger="hover"
                  >
                    <template #reference>
                      <el-icon>
                        <InfoFilled />
                      </el-icon>
                    </template>
                    <el-text size="small"> 동일 상품명 다중 등록처리</el-text>
                  </el-popover>
                </el-radio>
              </el-row>
            </el-radio-group>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="가져오기 유형"
          label-align="center"
        >
          <div class="radio-button-wrapper">
            <el-radio-group
              v-model="categoryTemplateData.categoryType"
              class="radio-button-group"
            >
              <el-radio label="remove">
                기존 정보 초기화 & 전체 덮어 쓰기
                <el-popover
                  :width="290"
                  placement="top-start"
                  trigger="hover"
                >
                  <template #reference>
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                  </template>
                  <el-text size="small">
                    적용할 매장의 분류 정보나 상품 상세 설정이 있어도, 모든 정보
                    초기화되어 덮어씀<br />
                    (ex: 분류, 상품 이미지, 상품 상세 설정(상품 화면 출력명,
                    판매 상태, 스티커, 옵션 설정)
                  </el-text>
                </el-popover>
              </el-radio>
              <el-radio label="add">
                기존 정보 유지 & 없는 분류 정보 추가
                <el-popover
                  :width="290"
                  placement="top-start"
                  trigger="hover"
                >
                  <template #reference>
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                  </template>
                  <el-text size="small">
                    적용할 매장의 분류 정보나 상품 상세 설정이 있다면, 없는
                    정보만 추가처리
                  </el-text>
                </el-popover>
              </el-radio>
            </el-radio-group>
            <el-button
              class="preview-button"
              color="#000"
              @click="postStoresTemplateMapping"
            >
              등록 전
              <br />
              정보 미리보기
            </el-button>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <el-card
        class="processing-result-card-wrap"
        shadow="never"
      >
        <div
          v-if="readCtgGuideTextFlag(storesMappingData.list)"
          class="font-small gray-word"
        >
          매장을 선택하신 후 [등록 전 정보 미리보기]를 해주세요.
        </div>
        <el-table
          v-else
          :data="storesMappingData.list"
          border
          class="mb-30"
          height="440px"
        >
          <el-table-column
            align="center"
            label="대분류명"
            prop="categoryName"
          >
            <template #default="scope">
              <div class="ellipsis-text-2">
                {{ scope.row.categoryName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="중분류명"
          >
            <template #default="scope">
              <div class="ellipsis-text-2">
                {{ scope.row.childCategoryName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="상품명"
          >
            <template #default="scope">
              <div
                v-if="scope.row.goodName"
                class="ellipsis-text-2"
              >
                {{ scope.row.goodName }}
              </div>
              <el-text
                v-else
                type="danger"
              >
                포스 상품 없음
              </el-text>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="상품코드"
            prop="goodCode"
          />
        </el-table>
      </el-card>
      <el-button
        class="preview-button width-100"
        color="#000"
        @click="templateSaveConfirm"
      >
        정보 최종 저장
      </el-button>
    </div>
  </el-row>
</template>

<style lang="scss" scoped>
.radio-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.radio-button-group {
  flex-direction: column;

  &:deep(.el-radio:first-child) {
    margin-right: 14px;
  }
}

.preview-button {
  height: 60px;
  font-size: 14px;
  line-height: 20px;
}

:deep(.el-divider--horizontal) {
  margin: 5px 0;
}

.condition-description {
  font-size: 12px;
  color: #909399;
}

.template-manage-wrap {
  width: 45%;

  &:deep(.el-descriptions__cell) {
    height: 49px;
    vertical-align: middle;
  }

  &:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 150px;
  }
}

.select-option-store-code {
  float: right;
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.update-time-text {
  margin-top: 2px;
}

.first-ctg-title-wrap {
  display: flex;
  align-items: center;
  height: 30px;
  padding-left: 5px;
  margin-bottom: 5px;
  font-size: 12px;
  color: #fc0000;
  background-color: #fef0f0;
  border: 1px solid #fab6b6;
  border-radius: 5px;
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  height: 30px;
  padding-left: 5px;
  color: #fc9e10;
  background-color: #fdf6ec;
  border: 1px solid #f3d19e;
  border-radius: 5px;
}

:deep(.el-collapse-item__header.is-active) {
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

:deep(.el-collapse-item__content) {
  padding: 0 10px;
  padding-bottom: 10px;
  background-color: #fdf6ec;
  border: 1px solid #f3d19e;
  border-top: #f3d19e;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.sub-category-title-wrap {
  flex-wrap: nowrap;
  width: 100%;
}

.processing-result-card-wrap {
  height: 520px;
}

.preview-info {
  &:deep(.el-card__body) {
    padding: 0;
  }
}

.template-item-image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
</style>
