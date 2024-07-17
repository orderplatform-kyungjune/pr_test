<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  detailViewCountInfoType,
  searchNoticeDetailViewParamsType,
  sortResType,
  useNoticeViewsListDataType,
  useStoreListType,
} from '@interface/notice';
import { DETAIL_VIEW_COUNT, DETAIL_VIEW_COUNT_MODAL } from '@common/string';
import { notice } from '@apis';

const { failAuthenticationAlert } = authentication;

const { requestSearchTypeList } = notice;

const { flag, closeModal } = useModalStore();
const props = defineProps<{
  detailViewCountInfo: detailViewCountInfoType;
}>();

const getNoticeTitle = () => {
  if (!props.detailViewCountInfo) {
    return '공지 정보를 불러오지 못하였습니다.';
  }
  return props.detailViewCountInfo.noticeTitle;
};
const searchNoticeDetailViewParams = reactive<searchNoticeDetailViewParamsType>(
  {
    searchTxt: '',
    searchType: ['VIEW', 'UNVIEW'],
    noticeId: props.detailViewCountInfo.noticeId,
  },
);

const checkAllDivision = ref(true);
const isDivisionIndeterminate = ref(false);
const checkedDivision = ref<string[]>(['조회', '미조회']);
const division = ['조회', '미조회'];
const getDivisionValue = () => {
  const categories: string[] = [];
  checkedDivision.value.forEach((item) => {
    if (item === '조회') {
      categories.push('VIEW');
    }
    if (item === '미조회') {
      categories.push('UNVIEW');
    }
  });
  searchNoticeDetailViewParams.searchType = categories;
};

const handleCheckAllDivisionChange = (val: boolean) => {
  checkedDivision.value = val ? division : [];
  isDivisionIndeterminate.value = false;
  getDivisionValue();
};
const handleCheckedDivisionChange = (value: string[]) => {
  const checkedCount = value.length;
  checkAllDivision.value = checkedCount === division.length;
  isDivisionIndeterminate.value =
    checkedCount > 0 && checkedCount < division.length;
  getDivisionValue();
};

const noticeViewsListData = reactive<useNoticeViewsListDataType>({
  totalContentCount: 0,
  pageSize: 15,
  currentPage: 0,
  maxPageNo: 0,
  noticeViewsList: [],
});
const getRequestNoticeViewsList = async (sort?: string) => {
  try {
    const { noticeId, searchType, searchTxt } = searchNoticeDetailViewParams;
    let query = `searchTypeList=${searchType}&query=${searchTxt}&page=${noticeViewsListData.currentPage}&size=15`;
    if (sort) {
      query += sort;
    }
    const res = (await requestSearchTypeList(
      Number(noticeId),
      query,
    )) as AxiosResponse;
    noticeViewsListData.currentPage = res.data.currentPage;
    noticeViewsListData.pageSize = res.data.pageSize;
    noticeViewsListData.maxPageNo = res.data.maxPageNo;
    noticeViewsListData.totalContentCount = res.data.totalContentCount;
    noticeViewsListData.noticeViewsList = res.data.noticeViewsList;

    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.status === 401) {
      failAuthenticationAlert();
    }

    if (res.status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error, '에러 확인');
  }

  return false;
};
const isSortNoticeViews = ref<boolean>(false);
const isSortStoreName = ref<boolean>(false);
const isSortLastViewData = ref<boolean>(false);
const sortOrder = ref<string>('');

const handleStoreListPage = (val: number) => {
  if (
    !isSortLastViewData.value &&
    !isSortNoticeViews.value &&
    !isSortStoreName.value
  ) {
    noticeViewsListData.currentPage = val - 1;
    getRequestNoticeViewsList();
    return;
  }
  let query = '';
  if (isSortNoticeViews.value) {
    if (sortOrder.value === 'ascending') {
      query = '&sort=views,asc';
    } else {
      query = '&sort=views,desc';
    }
  }

  if (isSortStoreName.value) {
    if (sortOrder.value === 'ascending') {
      query = '&sort=views,asc';
    } else {
      query = '&sort=views,desc';
    }
  }

  if (isSortLastViewData.value) {
    if (sortOrder.value === 'ascending') {
      query = '&sort=storeName,asc';
    } else {
      query = '&sort=storeName,desc';
    }
  }
  noticeViewsListData.currentPage = val - 1;
  getRequestNoticeViewsList(query);
};

const searchList = () => {
  isSortNoticeViews.value = false;
  isSortStoreName.value = false;
  isSortLastViewData.value = false;
  getRequestNoticeViewsList();
};

const sortTable = (data: sortResType) => {
  let query = '';
  if (data.prop === 'noticeViews') {
    isSortNoticeViews.value = true;
    if (data.order === 'ascending') {
      sortOrder.value = 'ascending';
      query = '&sort=views,asc';
    } else {
      sortOrder.value = 'descending';
      query = '&sort=views,desc';
    }
  }

  if (data.prop === 'storeName') {
    isSortStoreName.value = true;
    if (data.order === 'ascending') {
      sortOrder.value = 'ascending';
      query = '&sort=storeName,asc';
    } else {
      sortOrder.value = 'descending';
      query = '&sort=storeName,desc';
    }
  }

  if (data.prop === 'lastViewDate') {
    isSortLastViewData.value = true;
    if (data.order === 'ascending') {
      sortOrder.value = 'ascending';
      query = '&sort=lastViewDate,asc';
    } else {
      sortOrder.value = 'descending';
      query = '&sort=lastViewDate,desc';
    }
  }

  getRequestNoticeViewsList(query);
};

const getNoticeViewsStatus = (noticeViewsList: useStoreListType) =>
  noticeViewsList.noticeViews === 0 ? '미조회' : '조회';

getRequestNoticeViewsList();
</script>

<template>
  <el-dialog
    v-model="flag.detailViewCount"
    width="55%"
    top="4vh"
    :title="DETAIL_VIEW_COUNT_MODAL"
    lock-scroll
  >
    <el-card>
      <template #header>
        <div class="card-header">
          <span>공지명 : </span>
          <span>{{ getNoticeTitle() }}</span>
        </div>
      </template>
      <el-form
        :model="searchNoticeDetailViewParams"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="조회 구분">
          <el-checkbox
            v-model="checkAllDivision"
            :indeterminate="isDivisionIndeterminate"
            fill="#67C23A"
            class="division-all-checkbox"
            @change="handleCheckAllDivisionChange"
          >
            전체
          </el-checkbox>
          <el-checkbox-group
            v-model="checkedDivision"
            class="ml-20"
            @change="handleCheckedDivisionChange"
          >
            <el-checkbox
              v-for="(item, i) in division"
              :key="i"
              :label="item"
            />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="매장명">
          <el-input
            v-model="searchNoticeDetailViewParams.searchTxt"
            class="mr-40"
            input-style="width: 250px"
            placeholder="매장명을 입력해주세요"
            @keyup.enter="searchList"
          />
          <el-button
            type="primary"
            @click="searchList"
          >
            검색
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card
      class="notice-board-wrapper mt-10"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <div class="notice-count-info">
            <div>
              <span>
                총
                <span class="notice-count">
                  {{ noticeViewsListData.totalContentCount }}
                </span>
                개
              </span>
            </div>
          </div>
        </div>
      </template>
      <el-table
        :data="noticeViewsListData.noticeViewsList"
        :height="400"
        flexible
        @sort-change="sortTable"
      >
        <el-table-column
          align="center"
          label="매장명"
          prop="storeName"
          sortable
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column
          align="center"
          label="조회구분"
          width="120"
          prop="noticeViews"
          sortable
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="{ row }">
            {{ getNoticeViewsStatus(row) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="조회 수"
          width="100"
          prop="noticeViews"
          sortable
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column
          align="center"
          label="최종 조회 시간"
          width="200"
          prop="lastViewDate"
          sortable
          :sort-orders="['descending', 'ascending']"
        />
      </el-table>
      <el-row
        class="mt-10"
        align="middle"
        justify="center"
      >
        <el-pagination
          background
          layout="prev, pager, next"
          :total="noticeViewsListData.totalContentCount"
          :page-size="noticeViewsListData.pageSize"
          @current-change="handleStoreListPage"
        />
      </el-row>
    </el-card>
    <template #footer>
      <span>
        <el-button
          type="primary"
          @click="closeModal(DETAIL_VIEW_COUNT)"
        >
          닫기
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.notice-board-wrapper {
  &:deep(.el-card__header) {
    padding: 10px 20px;
  }
  &:deep(.el-card__body) {
    padding: 0 0 10px 0;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .notice-count-info {
      display: flex;
      align-items: center;

      .notice-count {
        color: #fc0000;
      }
    }
  }
}
</style>
