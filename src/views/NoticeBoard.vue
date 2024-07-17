<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, cookieUtils } from '@utils';
import useModalStore from '@store/storeModal';
import { noticeBoardDetail } from '@router/routePaths';
import {
  categoriesType,
  detailViewCountInfoType,
  useNoticeInfoType,
  useNoticeListType,
} from '@interface/notice';
import { CaretBottom, CaretTop, Paperclip } from '@element-plus/icons-vue';
import { DetailViewCountModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  DETAIL_VIEW_COUNT,
  NOTICE_BOARD,
  SINGLE_STORE_SETTING,
  USER_AUTHORITY,
} from '@common/string';
import { notice } from '@apis';

const { failAuthenticationAlert } = authentication;

const {
  requestNoticeInfoDelete,
  requestNoticeInfo,
  requestNoticeStatusUpdate,
} = notice;

const { flag, openModal } = useModalStore();

const router = useRouter();

const loading = ref(true);
const loadingSvg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

// header props
const noticeBoardHeader = reactive([{ name: NOTICE_BOARD }]);

const isDetailSearch = ref<boolean>(false);

const currentNoticePage = ref<number>(0);

const noticeData = reactive<useNoticeInfoType>({
  totalContentCount: 0,
  pageSize: 20,
  currentPage: 0,
  maxPageNo: 1,
  noticeAdminList: [],
});

// 검색조건 관련 데이터
const noticeSearchRequirementData = reactive({
  noticeCategoryList: ['NOTICE', 'EVENT', 'UPDATE', 'NEWS'],
  noticeSearchType: 'TITLE',
  noticeSearchQuery: '',
  noticeStatusList: [1, 0],
  createDate: '',
  endDate: '',
});

// 검색 구분
const noticeSearchTypeList = [
  {
    value: 'TITLE',
    label: '제목',
  },
  {
    value: 'DESC',
    label: '내용',
  },
];

// 카테고리 구분
const checkAllDivision = ref(true);
const isDivisionIndeterminate = ref(false);
const checkedDivision = ref<string[]>([
  '공지사항',
  '업데이트',
  '이벤트',
  '뉴스',
]);
const division = ['공지사항', '업데이트', '이벤트', '뉴스'];
const getDivisionValue = () => {
  const categories: string[] = [];
  checkedDivision.value.forEach((item) => {
    if (item === '공지사항') {
      categories.push('NOTICE');
    }
    if (item === '업데이트') {
      categories.push('UPDATE');
    }
    if (item === '이벤트') {
      categories.push('EVENT');
    }
    if (item === '뉴스') {
      categories.push('NEWS');
    }
  });
  noticeSearchRequirementData.noticeCategoryList = categories;
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

// 게시중 구분
const checkedNoticeStatus = ref<string[]>(['게시중', '게시중지']);
const noticeStatus = ['게시중', '게시중지'];
const getNoticeStatusValue = () => {
  const status: number[] = [];
  checkedNoticeStatus.value.forEach((item) => {
    if (item === '게시중') {
      status.push(1);
    }
    if (item === '게시중지') {
      status.push(0);
    }
  });
  noticeSearchRequirementData.noticeStatusList = status;
};

const selectedDate = ref<string>('');
const setDate = () => {
  const createDate = selectedDate.value[0];
  const endDate = selectedDate.value[1];
  noticeSearchRequirementData.createDate = createDate;
  noticeSearchRequirementData.endDate = endDate;
};

const shortcuts = [
  {
    text: '최근 1주일',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '최근 1개월',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '최근 3개월',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const openDetailSearch = () => {
  isDetailSearch.value = true;
};

const closeDetailSearch = () => {
  isDetailSearch.value = false;
  checkedDivision.value = division;
  checkedNoticeStatus.value = noticeStatus;
  selectedDate.value = '';
  noticeSearchRequirementData.noticeCategoryList = [
    'NOTICE',
    'EVENT',
    'UPDATE',
    'NEWS',
  ];
  noticeSearchRequirementData.noticeSearchType = 'TITLE';
  noticeSearchRequirementData.noticeSearchQuery = '';
  noticeSearchRequirementData.noticeStatusList = [1, 0];
  noticeSearchRequirementData.createDate = '';
  noticeSearchRequirementData.endDate = '';
};

const getDefaultNoticeData = async () => {
  try {
    const categoryList = noticeSearchRequirementData.noticeCategoryList.join();
    const statusList = noticeSearchRequirementData.noticeStatusList.join();
    const { createDate, endDate, noticeSearchType, noticeSearchQuery } =
      noticeSearchRequirementData;

    const query = `page=${currentNoticePage.value}&size=${noticeData.pageSize}&noticeCategoryList=${categoryList}&noticeSearchType=${noticeSearchType}
      &noticeSearchQuery=${noticeSearchQuery}&noticeCaller=ADMIN&noticeStatusList=${statusList}&createdDate=${createDate}&endDate=${endDate}`;

    const res = (await requestNoticeInfo(query)) as AxiosResponse;

    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      loading.value = false;
    }

    if (res.status === 401) {
      failAuthenticationAlert();
      loading.value = false;
    }

    if (res.status === 200) {
      noticeData.totalContentCount = res.data.totalContentCount;
      noticeData.pageSize = res.data.pageSize;
      noticeData.currentPage = res.data.currentPage;
      currentNoticePage.value = res.data.currentPage;
      noticeData.maxPageNo = res.data.maxPageNo;
      noticeData.noticeAdminList = res.data.noticeAdminList;
      loading.value = false;
    }
  } catch (error) {
    console.log(error);
  }
};

const defaultSearch = () => getDefaultNoticeData();
// 테이블
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const multipleSelection = ref<useNoticeListType[]>([]);
const handleSelectionChange = (val: useNoticeListType[]) => {
  multipleSelection.value = val;
};

const handleStoreListPage = (val: number) => {
  currentNoticePage.value = val - 1;
  getDefaultNoticeData();
};
// 구분 값 한글화
const categories = reactive<categoriesType>({
  NOTICE: '공지사항',
  UPDATE: '업데이트',
  EVENT: '이벤트',
  NEWS: '뉴스',
});
const translateCategory = (category: string): string => categories[category];

// 게시 상태
const getNoticeStatus = (status: number) => {
  if (status === 0) {
    return '게시중지';
  }
  return '게시중';
};

// 공지 상태
const isMainNotice = (status: number) => status === 1;

// 팝업 상태
const isNoticePopup = (status: number) => status === 1;

const deleteNoticeInfoDelete = async (id: string) => {
  const query = id;

  try {
    const res = (await requestNoticeInfoDelete(query)) as AxiosResponse;

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
      await getDefaultNoticeData();
    }
  } catch (error) {
    console.log('에러', error);
  }
};

const deleteSelectNoticeInfo = (noticeId: number) => {
  ElMessageBox.confirm('선택 공지사항을 삭제하시겠습니까?', '공지사항 삭제', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(async () => {
    const query = noticeId.toString();
    await deleteNoticeInfoDelete(query);
  });
};

const deleteMultipleNoticeInfo = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error('공지사항을 선택해 주세요.');
  } else {
    const selectedNoticeLength = multipleSelection.value.length;
    ElMessageBox.confirm(
      `선택한 공지사항 ${selectedNoticeLength}개를 모두 삭제하시겠습니까?`,
      '공지사항 삭제',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning',
      },
    ).then(async () => {
      const query = multipleSelection.value.map((item) => item.noticeId).join();
      await deleteNoticeInfoDelete(query);
    });
  }
};

// 게시상태 변경
const currentSelectNoticeStatus = ref(0);
const putNoticeStatusUpdate = async () => {
  try {
    const query = multipleSelection.value.map((item) => item.noticeId).join();
    const data = { noticeStatus: currentSelectNoticeStatus.value };
    const res = (await requestNoticeStatusUpdate(query, data)) as AxiosResponse;
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
      await getDefaultNoticeData();
    }
  } catch (error) {
    console.log(error);
  }
};

const stopNotice = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error('공지사항을 선택해 주세요.');
  } else {
    const selectedNoticeLength = multipleSelection.value.length;
    ElMessageBox.confirm(
      `선택한 공지사항 ${selectedNoticeLength}개의 게시를 중지하겠습니까?`,
      '공지사항 게시 중단',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning',
      },
    ).then(async () => {
      currentSelectNoticeStatus.value = 0;
      await putNoticeStatusUpdate();
    });
  }
};

const startNotice = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error('공지사항을 선택해 주세요.');
  } else {
    const selectedNoticeLength = multipleSelection.value.length;
    ElMessageBox.confirm(
      `선택한 공지사항 ${selectedNoticeLength}개를 게시하겠습니까?`,
      '공지사항 게시',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning',
      },
    ).then(async () => {
      currentSelectNoticeStatus.value = 1;
      await putNoticeStatusUpdate();
    });
  }
};

// 테이블 반응형 height 잡아주기 **element-ui table의 height 속성(내부 스크롤바)는 px만 잡음.
const getTableHeight = () => {
  const parentsContainer = document.querySelector(
    '.default_layout_contents',
  ) as HTMLElement;
  let normalHeight = 520;
  let smallHeight = 320;
  if (parentsContainer) {
    const rect = parentsContainer.getBoundingClientRect().height;
    normalHeight = (rect / 100) * 60.75;
    smallHeight = (rect / 100) * 39;
  }
  return isDetailSearch.value ? smallHeight : normalHeight;
};

// 조회 수 상세조회 모달 관련
const detailViewCountInfo = reactive<detailViewCountInfoType>({
  noticeTitle: '',
  noticeId: '',
});

const openDetailViewCountModalWithData = (data: useNoticeListType) => {
  detailViewCountInfo.noticeId = data.noticeId.toString();
  detailViewCountInfo.noticeTitle = data.noticeTitle;
  openModal(DETAIL_VIEW_COUNT);
};

// key validation
const getValidateKey = (label: string, index: number) => `${label} ${index}`;
getDefaultNoticeData();

// auth check
const authClass = ref(cookieUtils.getCookie(USER_AUTHORITY));
const checkAuth = () => {
  if (Number(authClass.value) < 9) {
    ElMessage({
      type: 'error',
      message: '권한이 없습니다.',
    });

    router.replace({ name: SINGLE_STORE_SETTING });
  }
};
onMounted(() => {
  checkAuth();
});
</script>

<template>
  <DetailViewCountModal
    v-if="flag.detailViewCount"
    :detailViewCountInfo="detailViewCountInfo"
  />
  <BreadcrumbHeader :propsHeader="noticeBoardHeader" />
  <el-card
    class="search-card"
    shadow="never"
  >
    <div class="search-container">
      <p class="search-title">검색</p>
      <div>
        <el-select
          v-model="noticeSearchRequirementData.noticeSearchType"
          style="width: 100px"
        >
          <el-option
            v-for="option in noticeSearchTypeList"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-input
          v-model="noticeSearchRequirementData.noticeSearchQuery"
          class="ml-10"
          input-style="width: 300px"
          @keydown.enter="defaultSearch()"
        />
        <el-button
          class="search-btn"
          type="primary"
          @click="defaultSearch()"
        >
          검색
        </el-button>
      </div>
    </div>
    <el-divider content-position="right">
      <el-button
        v-if="!isDetailSearch"
        size="small"
        @click="openDetailSearch()"
      >
        상세 검색 열기
        <el-icon class="ml-5">
          <CaretBottom />
        </el-icon>
      </el-button>
    </el-divider>
    <div
      v-if="isDetailSearch"
      class="search-container"
    >
      <div class="detail-search-wrapper">
        <div class="division-checkbox-container">
          <p class="detail-search-title">구분</p>
          <div class="division-checkbox-wrapper">
            <el-checkbox
              v-model="checkAllDivision"
              :indeterminate="isDivisionIndeterminate"
              class="division-all-checkbox"
              fill="#67C23A"
              @change="handleCheckAllDivisionChange"
            >
              전체
            </el-checkbox>
            <el-checkbox-group
              v-model="checkedDivision"
              class="ml-1"
              @change="handleCheckedDivisionChange"
            >
              <el-checkbox
                v-for="(item, i) in division"
                :key="getValidateKey(item, i)"
                :label="item"
              />
            </el-checkbox-group>
          </div>
        </div>
        <div class="notice-status-checkbox-container">
          <p class="detail-search-title">게시 상태</p>
          <div class="notice-status-checkbox-wrapper">
            <el-checkbox-group
              v-model="checkedNoticeStatus"
              class="ml-1"
              @change="getNoticeStatusValue"
            >
              <el-checkbox
                v-for="(item, i) in noticeStatus"
                :key="getValidateKey(item, i)"
                :label="item"
              >
                {{ item }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="create-date-container">
          <p class="create-date-title">작성일</p>
          <div class="date-picker-wrapper">
            <div class="date-picker">
              <el-date-picker
                v-model="selectedDate"
                :clearable="false"
                :shortcuts="shortcuts"
                end-placeholder="종료일"
                range-separator="~"
                start-placeholder="시작일"
                type="daterange"
                unlink-panels
                value-format="YYYY-MM-DD"
                @change="setDate"
              />
            </div>
          </div>
        </div>
      </div>
      <el-divider
        v-if="isDetailSearch"
        content-position="right"
      >
        <el-tooltip
          content="검색 조건을 모두 초기화합니다."
          effect="dark"
          placement="top-start"
        >
          <el-button
            size="small"
            @click="closeDetailSearch()"
          >
            상세 검색 닫기
            <el-icon class="ml-5">
              <CaretTop />
            </el-icon>
          </el-button>
        </el-tooltip>
      </el-divider>
    </div>
  </el-card>
  <el-card
    class="notice-board-wrapper"
    shadow="never"
  >
    <template #header>
      <div class="card-header">
        <div class="notice-count-info">
          <div>
            <span>총 </span>
            <span class="notice-count">
              {{ noticeData.totalContentCount }}
            </span>
            <span>개</span>
          </div>
          <span class="notice-tip">
            *게시중인 경우에만 서비스에 노출됩니다. (한 페이지당 20개)
          </span>
        </div>
        <div>
          <el-button
            type="warning"
            @click="startNotice"
          >
            게시
          </el-button>
          <el-button
            type="warning"
            @click="stopNotice"
          >
            게시중지
          </el-button>
          <el-button
            class="mr-10"
            type="danger"
            @click="deleteMultipleNoticeInfo"
          >
            선택 삭제
          </el-button>
          <router-link :to="{ path: noticeBoardDetail }">
            <el-button type="primary"> 새 공지 등록</el-button>
          </router-link>
        </div>
      </div>
    </template>
    <el-table
      ref="multipleTableRef"
      v-loading="loading"
      :data="noticeData.noticeAdminList"
      :element-loading-svg="loadingSvg"
      :height="getTableHeight()"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-text="상품 정보를 불러오는 중입니다..."
      flexible
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        type="selection"
      />
      <el-table-column
        align="center"
        label="수정"
        width="90"
      >
        <template #default="scope">
          <router-link
            :to="{
              path: noticeBoardDetail,
              query: { noticeId: scope.row.noticeId },
            }"
          >
            <el-button type="warning"> 수정</el-button>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="번호"
        prop="noticeId"
        width="60"
      />
      <el-table-column
        align="center"
        label="구분"
      >
        <template #default="scope">
          {{ translateCategory(scope.row.noticeCategory) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="게시상태"
      >
        <template #default="scope">
          {{ getNoticeStatus(scope.row.noticeStatus) }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="제목"
        min-width="330"
      >
        <template #default="scope">
          <el-tag
            v-if="isMainNotice(scope.row.topFix)"
            class="mr-10"
            type="danger"
          >
            공지
          </el-tag>
          <router-link
            :to="{
              path: noticeBoardDetail,
              query: { noticeId: scope.row.noticeId },
            }"
          >
            <span class="board-title">
              {{ scope.row.noticeTitle }}
            </span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="첨부"
      >
        <template #default="scope">
          <div v-if="scope.row.noticeFileStatus === 1">
            <el-icon>
              <Paperclip />
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="팝업설정"
      >
        <template #default="scope">
          <el-tag v-if="isNoticePopup(scope.row.noticePopupStatus)">
            팝업
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="조회수"
        prop="noticeViews"
      >
        <template #default="{ row }">
          <el-link
            type="success"
            @click="openDetailViewCountModalWithData(row)"
          >
            {{ row.noticeViews }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="게시 시작일"
        prop="noticePostingStartDate"
      />
      <el-table-column
        align="center"
        label="게시 종료일"
        prop="noticePostingEndDate"
      />
      <el-table-column
        align="center"
        label="작성일"
        prop="createDate"
      />
      <el-table-column
        align="center"
        label="삭제"
      >
        <template #default="scope">
          <el-button
            type="danger"
            @click="deleteSelectNoticeInfo(scope.row.noticeId)"
          >
            삭제
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row
      align="middle"
      class="mt-10"
      justify="center"
    >
      <el-pagination
        :page-size="noticeData.pageSize"
        :total="noticeData.totalContentCount"
        background
        layout="prev, pager, next"
        @current-change="handleStoreListPage"
      />
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
.search-card {
  height: auto;
  margin-bottom: 20px;

  &:deep(.el-card__body) {
    padding-bottom: 5px;
  }

  .search-container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .search-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 700;
      color: #303133;
    }

    .search-btn {
      margin-bottom: 2px;
      margin-left: 30px;
    }

    .detail-search-wrapper {
      display: flex;
      flex-direction: column;

      .division-checkbox-container {
        display: flex;
        align-content: center;
        align-items: center;

        .detail-search-title {
          margin-right: 50px;
          margin-left: 5px;
          font-size: 14px;
          font-weight: 700;
          color: #303133;
        }

        .division-all-checkbox {
          margin-right: 37px;
        }

        .division-checkbox-wrapper {
          display: flex;
        }
      }

      .notice-status-checkbox-container {
        display: flex;
        align-content: center;
        align-items: center;
        margin-top: 16px;

        .detail-search-title {
          margin: 0 20px 0 5px;
          font-size: 14px;
          font-weight: 700;
          color: #303133;
        }

        .notice-status-checkbox-wrapper {
          display: flex;
        }
      }

      .create-date-container {
        display: flex;
        align-content: center;
        align-items: center;
        margin-top: 16px;
        margin-bottom: 10px;

        .create-date-title {
          margin: 0 35px 0 5px;
          font-size: 14px;
          font-weight: 700;
          color: #303133;
        }

        .date-picker-wrapper {
          width: 410px;

          .date-picker {
            &:deep(.el-date-editor) {
              width: 100%;
            }
          }
        }
      }
    }
  }
}

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

      .notice-tip {
        margin-left: 10px;
        font-size: 14px;
        color: #aaa;
      }
    }
  }

  .board-title {
    color: #606266;
    cursor: pointer;
  }
}
</style>
