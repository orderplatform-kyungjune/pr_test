<script lang="ts" setup>
import { h, reactive, ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { allergyListItemType } from '@interface/allergy';
import { ArrowDown, Picture, RefreshRight, Search } from '@element-plus/icons-vue';
import { AllergyDetailModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import { ALLERGY_DETAIL, ALLERGY_MANAGE } from '@common/string';
import { allergy } from '@apis';

const { flag, openModalWithData } = useModalStore();

const { failAuthenticationAlert } = authentication;
const { requestAllergyList, requestUpdateAllergyStatus } = allergy;

const ALLERGY_USE_COUNT = 15;

/** breadCrumb Header */
const allergyManageHeader = reactive([{ name: ALLERGY_MANAGE }]);

// 페이지네이션 정보
const pagePerCount = [
  {
    label: '10개씩 보기',
    value: 10,
  },
  {
    label: '20개씩 보기',
    value: 20,
  },
  {
    label: '50개씩 보기',
    value: 50,
  },
  {
    label: '100개씩 보기',
    value: 100,
  },
  {
    label: '150개씩 보기',
    value: 150,
  },
];
const paginationInfo = reactive({
  page: 1,
  pageSize: 10,
  from: 1,
  to: 20,
  total: 0,
});

const searchData = reactive({
  page: 1,
  perPage: paginationInfo.pageSize,
  view_type: '',
  use_yn: '',
  searchTxt: '',
  searchStartDate: '',
  searchEndDate: '',
});

const searchDateRange: Ref<string[]> = ref(['', '']);

const allergyList: Ref<allergyListItemType[]> = ref([]);
const numberOfAllergyExposure: Ref<number> = ref(0);
const isLoadingList = ref(false);
const postAllergyList = async () => {
  if (isLoadingList.value) return;

  try {
    isLoadingList.value = true;

    searchData.page = paginationInfo.page;
    searchData.perPage = paginationInfo.pageSize;
    searchData.searchStartDate =
      searchDateRange.value && searchDateRange.value?.length > 0
        ? searchDateRange.value[0]
        : '';
    searchData.searchEndDate =
      searchDateRange.value && searchDateRange.value?.length > 0
        ? searchDateRange.value[1]
        : '';

    const res = (await requestAllergyList(searchData)) as AxiosResponse;

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
      allergyList.value = res.data.data;
      numberOfAllergyExposure.value = res.data.data.filter(
        (allergyInfo: allergyListItemType) => allergyInfo.use_yn === 'Y',
      ).length;

      paginationInfo.total = res.data.page_info.total;
      paginationInfo.page = res.data.page_info.current_page;
      paginationInfo.pageSize = res.data.page_info.per_page;
      paginationInfo.from = res.data.page_info.from;
      paginationInfo.to = res.data.page_info.to;
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingList.value = false;
  }
};

const changePageSize = (value: number) => {
  const calculatePage =
    Math.ceil(paginationInfo.total / value) < paginationInfo.page
      ? Math.floor(paginationInfo.total / value)
      : paginationInfo.page;
  paginationInfo.page = calculatePage < 1 ? 1 : calculatePage;
  paginationInfo.pageSize = value;
  postAllergyList();
};

const resetSearchData = () => {
  paginationInfo.page = 1;
  paginationInfo.pageSize = 10;
  searchData.view_type = '';
  searchData.use_yn = '';
  searchData.searchTxt = '';
  searchDateRange.value = ['', ''];
  searchData.view_type = '';
  postAllergyList();
};

/** 일괄 노출여부 변경 */
const selectedAllergyList = ref<allergyListItemType[]>([]);
const changeSelection = (selectedItems: allergyListItemType[]) => {
  selectedAllergyList.value = selectedItems;
};

const isUpdatingViewType = ref(false);
const postUpdateAllergyState = async (use_yn: string) => {
  if (isUpdatingViewType.value) return;

  try {
    isUpdatingViewType.value = true;
    const ids = selectedAllergyList.value?.map(
      (allergyItem: allergyListItemType) => allergyItem.id,
    );
    const param = {
      use_yn,
      ids,
    };
    const res = (await requestUpdateAllergyStatus(param)) as AxiosResponse;
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
        message: '정상적으로 변경되었습니다.',
      });
      postAllergyList();
    }
  } catch (error) {
    console.log(error);
    ElMessageBox.alert('개발자에게 문의해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
  } finally {
    isUpdatingViewType.value = false;
  }
};

const changeMultipleViewType = (viewType: string) => {
  if (viewType === 'N') {
    ElMessageBox.alert('', '알림', {
      message: h('p', { style: 'font-family: none; text-align: center;' }, [
        h(
          'p',
          { style: 'font-weight: bold; font-size: 15px;' },
          '미노출 상태로 변경합니다.',
        ),
        h(
          'p',
          { style: 'font-weight: normal;' },
          '기존의 미노출 상태는 그대로 유지됩니다.',
        ),
      ]),
      confirmButtonText: '확인',
    }).then(() => postUpdateAllergyState('N'));
    return;
  }

  if (selectedAllergyList.value?.length > ALLERGY_USE_COUNT) {
    ElMessageBox.alert('', '알림', {
      message: h('p', { style: 'font-family: none; text-align: center;' }, [
        h(
          'p',
          {
            style: 'font-weight: bold; font-size: 15px;',
            class: 'essential-star',
          },
          `노출 상태가 ${ALLERGY_USE_COUNT}개를 초과하여`,
        ),
        h(
          'p',
          {
            style: 'font-weight: bold; font-size: 15px;',
            class: 'essential-star',
          },
          '변경이 불가능합니다.',
        ),
        h(
          'p',
          { style: 'font-weight: normal;' },
          `알레르기 노출은 최대 ${ALLERGY_USE_COUNT}개까지 가능합니다.`,
        ),
      ]),
      confirmButtonText: '확인',
    });
    return;
  }

  ElMessageBox.alert('', '알림', {
    message: h('p', { style: 'font-family: none; text-align: center;' }, [
      h(
        'p',
        { style: 'font-weight: bold; font-size: 15px;' },
        '노출 상태로 변경합니다.',
      ),
      h(
        'p',
        { style: 'font-weight: normal;' },
        '기존의 노출 상태는 그대로 유지됩니다.',
      ),
    ]),
    confirmButtonText: '확인',
  }).then(() => postUpdateAllergyState('Y'));
};

const scrollToTop = () => {
  document.getElementById('scrollTop')?.scrollIntoView({ behavior: 'smooth' });
};

const onClickPagination = (val: number) => {
  paginationInfo.page = val;
  postAllergyList();
  scrollToTop();
};

/** 등록, 상세 모달 */
const openAllergyDetailModal = (
  mode: string,
  allergyData?: allergyListItemType,
) => {
  openModalWithData(ALLERGY_DETAIL, {
    mode,
    allergyData,
  });
};

postAllergyList();
</script>

<template>
  <AllergyDetailModal
    v-if="flag.allergyDetail"
    :allergyUseCount="ALLERGY_USE_COUNT"
    :numberOfAllergyExposure="numberOfAllergyExposure"
    :postAllergyList="postAllergyList"
  />
  <BreadcrumbHeader :propsHeader="allergyManageHeader" />
  <el-card
    class="mt-10 mb-10"
    shadow="never"
  >
    <el-row>
      <el-col
        :span="8"
        class="mr-40"
      >
        <div class="width-100 search-card-item">
          <el-text class=""> 알레르기 타입</el-text>
          <el-radio-group v-model="searchData.view_type">
            <el-radio label=""> 전체</el-radio>
            <el-radio label="image"> 이미지</el-radio>
            <el-radio
              disabled
              label="text"
            >
              텍스트
            </el-radio>
          </el-radio-group>
        </div>
      </el-col>
      <el-col
        :span="8"
        class="mr-40"
      >
        <div class="width-100 search-card-item">
          <el-text class="font-small mr-10"> 노출 여부</el-text>
          <el-radio-group v-model="searchData.use_yn">
            <el-radio label=""> 전체</el-radio>
            <el-radio label="Y"> 노출</el-radio>
            <el-radio label="N"> 미노출</el-radio>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>
    <el-row class="mt-20">
      <el-col
        :span="8"
        class="mr-40"
      >
        <div class="width-100 search-card-item">
          <el-text class=""> 아이콘 이름</el-text>
          <el-input
            v-model="searchData.searchTxt"
            class="search-card-item-input"
            placeholder="아이콘 이름을 입력해주세요."
            style="width: 240px"
            @keydown.enter="postAllergyList"
          />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="width-100 search-card-item">
          <el-text class="font-small mr-10"> 등록일</el-text>
          <el-date-picker
            v-model="searchDateRange"
            format="YYYY-MM-DD"
            range-separator="~"
            type="daterange"
            value-format="YYYY-MM-DD"
          />
        </div>
      </el-col>
      <el-col :span="7">
        <el-row
          class="ml-10"
          justify="center"
        >
          <el-button
            :icon="Search"
            round
            type="primary"
            @click="postAllergyList"
          >
            검색
          </el-button>
          <el-button
            :icon="RefreshRight"
            round
            @click="resetSearchData"
          >
            초기화
          </el-button>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
  <el-row justify="end">
    <el-button
      type="primary"
      @click="openAllergyDetailModal('create')"
    >
      신규 알레르기 아이콘 등록
    </el-button>
  </el-row>
  <el-divider />
  <el-row justify="space-between">
    <el-text>
      총
      <span class="essential-star">
        {{ paginationInfo.total }}
      </span>
      개의 검색결과가 있습니다.
    </el-text>
    <el-row justify="end">
      <el-dropdown
        trigger="click"
        @command="changeMultipleViewType"
      >
        <el-button>
          노출 여부 변경
          <el-icon class="ml-10">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu popper-class="width-100">
            <el-dropdown-item
              :disabled="!selectedAllergyList?.length"
              command="Y"
            >
              노출
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="!selectedAllergyList?.length"
              command="N"
            >
              미노출
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-select
        v-model="paginationInfo.pageSize"
        class="ml-10"
        @change="changePageSize"
      >
        <el-option
          v-for="count in pagePerCount"
          :key="count.value"
          :label="count.label"
          :value="count.value"
        />
      </el-select>
    </el-row>
  </el-row>
  <el-table
    v-loading="isLoadingList"
    :data="allergyList"
    border
    class="mt-20"
    @selection-change="changeSelection"
  >
    <el-table-column
      align="center"
      header-align="center"
      type="selection"
      width="50"
    />
    <el-table-column
      align="center"
      label="NO"
      prop="id"
      width="60"
    />
    <el-table-column
      align="center"
      label="알레르기 타입"
      prop="view_type"
    >
      <template #default="{ row }">
        {{
          row.view_type === 'text'
            ? '텍스트'
            : row.view_type === 'image'
              ? '이미지'
              : ''
        }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="아이콘 이름"
      prop="name"
    />
    <el-table-column
      align="center"
      label="상세 내용"
    >
      <template #default="{ row }">
        <span v-if="row.view_type === 'text'">
          {{ row.content }}
        </span>
        <el-tooltip
          v-else
          :show-after="500"
          placement="right"
        >
          <template #content>
            <el-image
              :src="row.image_url"
              class="image-in-tooltip"
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
          </template>
          <el-image
            :src="row.image_url"
            class="image-in-cell"
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
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="적용 상품 수"
      prop="good_count"
      width="100"
    />
    <el-table-column
      align="center"
      label="노출 여부"
      prop="use_yn"
      width="150"
    >
      <template #default="{ row }">
        {{ row.use_yn === 'Y' ? '노출' : '미노출' }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="등록일"
      prop="created_at"
    />
    <el-table-column
      align="center"
      label="등록자"
      prop="created_user"
    />
    <el-table-column
      align="center"
      label="관리"
      width="100"
    >
      <template #default="{ row }">
        <el-button @click="openAllergyDetailModal('modify', row)">
          상세
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    class="mt-10"
    justify="center"
  >
    <el-pagination
      :current-page="paginationInfo.page"
      :page-size="paginationInfo.pageSize"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="onClickPagination"
    />
  </el-row>
</template>

<style lang="scss">
:deep(.el-divider--horizontal) {
  margin: 8px 0;
}

.search-card-item {
  display: flex;
  gap: 20px;
}

.image-in-tooltip {
  width: 175px;
  height: 82px;
}

.image-in-cell {
  width: 87px;
  height: 40px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 30px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
</style>
