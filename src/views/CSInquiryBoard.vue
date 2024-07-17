<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, Ref, ref, watchEffect } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import {
  runtimeCheckHelper,
  authentication,
  routeHelper,
  dateFormatterUtil,
} from '@utils';
import useLoadingStore from '@store/storeLoading';
import { cSInquiryBoard, cSInquiryRegister } from '@router/routePaths';
import {
  csInquiryBoardListDataType,
  statListDataType,
  categoryDefaultType,
  categoryFirstType,
  selectOptionDataType,
} from '@interface/inquiry';
import {
  User,
  Phone,
  Headset,
  ChatLineSquare,
  Link,
  CaretBottom,
  CaretTop,
  Search,
  RefreshRight,
  Cellphone,
  House,
} from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { CS_INQUIRY_BOARD } from '@common/string';
import { inquiryCodec } from '@codecs';
import { inquiry, endpoints } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, isMasterCheck } = authentication;

const route = useRoute();

const { requestCsInquiryData, requestCommonSelectOptionData } = inquiry;
const { csInquiryBoardListCodec, requestSelectOptionListCodec } = inquiryCodec;
const { closeLoading, openLoading } = useLoadingStore();
const { pushPageWithQuery } = routeHelper;
const { downloadExcelPostWithToken } = useExcelDownload();
const { refinedToday, refinedWeek } = dateFormatterUtil;

const csInquiryBoardHeader = reactive([{ name: CS_INQUIRY_BOARD }]);

const isSearchOpen = ref<boolean>(false);

const excelDownloadState = ref<boolean>(false);

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
    label: '30개씩 보기',
    value: 30,
  },
  {
    label: '40개씩 보기',
    value: 40,
  },
  {
    label: '50개씩 보기',
    value: 50,
  },
  {
    label: '100개씩 보기',
    value: 100,
  },
];

const openSearch = () => {
  isSearchOpen.value = true;
};

const closeSearch = () => {
  isSearchOpen.value = false;
};

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  page: Number(route.query.page) ?? 1,
  pageSize: Number(route.query.pageSize) ?? 10,
  from: 1,
  to: 10,
  total: 0,
});

const contractStat = (route.query.searchStat as string) ?? '';

/** 검색 정보 */
const searchInfo = reactive({
  searchCategory1: route.query.searchCategory1 as string,
  searchCategory2: route.query.searchCategory2 as string,
  searchKeyword: route.query.searchKeyword as string,
  searchStat: contractStat.split(';').filter((stat) => stat !== ''),
  searchChecker: route.query.searchChecker as string,
  searchEnquirer: route.query.searchEnquirer as string,
  searchEnquirerHp: route.query.searchEnquirerHp as string,
  searchComment: route.query.searchComment as string,
  searchStoreName: route.query.searchStoreName as string,
  searchStoreCode: route.query.searchStoreCode as string,
  searchDate: [
    route.query.searchStartDate as string,
    route.query.searchEndDate as string,
  ],
  searchComplain: route.query.searchComplain as string,
  searchIncoming: route.query.searchIncoming as string,
  searchNum: route.query.searchNum as string,
});

/** 엑셀다운로드 */
const excelDownloadData = async () => {
  try {
    if (paginationInfo.total > 13000) {
      ElMessage({
        type: 'error',
        message:
          '다운로드 최대 건수를 초과하였습니다. 기간을 다시 설정해 주세요.(최대 건수: 1만3천 건)',
      });
      return;
    }

    excelDownloadState.value = true;

    const requestData = {
      searchCategory1: searchInfo.searchCategory1,
      searchCategory2: searchInfo.searchCategory2,
      searchKeyword: searchInfo.searchKeyword,
      searchStat: searchInfo.searchStat ? searchInfo.searchStat.join(';') : '',
      searchChecker: searchInfo.searchChecker,
      searchEnquirer: searchInfo.searchEnquirer,
      searchEnquirerHp: searchInfo.searchEnquirerHp,
      searchComment: searchInfo.searchComment,
      searchStoreName: searchInfo.searchStoreName,
      searchStoreCode: searchInfo.searchStoreCode,
      searchStartDate: searchInfo.searchDate ? searchInfo.searchDate[0] : '',
      searchEndDate: searchInfo.searchDate ? searchInfo.searchDate[1] : '',
      searchComplain: searchInfo.searchComplain,
      searchIncoming: searchInfo.searchIncoming,
      searchNum: searchInfo.searchNum,
    };
    const date = new Date();
    const year = date.getFullYear();
    const month = `0${1 + date.getMonth()}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);

    await downloadExcelPostWithToken(
      `Cs-Response_${year}${month}${day}`,
      endpoints.excel.download_cs_list,
      requestData,
    );
    excelDownloadState.value = false;
  } catch (error) {
    console.log(error);
  }
};

/** 문의 내역 데이터 */
const inquiryListData = ref<csInquiryBoardListDataType[]>([]);
/** 문의 게시판 문의 내역 리스트 불러오기 */
const getCsInquiryList = async (page?: number) => {
  const statString = searchInfo.searchStat
    ? searchInfo.searchStat.join(';')
    : '';

  try {
    openLoading();
    const requestData = {
      page: page ?? paginationInfo.page,
      perPage: paginationInfo.pageSize,
      searchCategory1: searchInfo.searchCategory1,
      searchCategory2: searchInfo.searchCategory2,
      searchKeyword: searchInfo.searchKeyword,
      searchStat: statString,
      searchChecker: searchInfo.searchChecker,
      searchEnquirer: searchInfo.searchEnquirer,
      searchEnquirerHp: searchInfo.searchEnquirerHp,
      searchComment: searchInfo.searchComment,
      searchStoreName: searchInfo.searchStoreName,
      searchStoreCode: searchInfo.searchStoreCode,
      searchStartDate: searchInfo.searchDate ? searchInfo.searchDate[0] : '',
      searchEndDate: searchInfo.searchDate ? searchInfo.searchDate[1] : '',
      searchComplain: searchInfo.searchComplain,
      searchIncoming: searchInfo.searchIncoming,
      searchNum: searchInfo.searchNum,
    };
    const res = (await requestCsInquiryData(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(csInquiryBoardListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      closeLoading();
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
      closeLoading();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        inquiryListData.value = res.data.data;
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.pageSize = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
        closeLoading();
      }
    }
  } catch (error) {
    console.log(error);
    closeLoading();
  }
};

/** 카테고리유형 데이터 */
const optionFirstCategoryList: Ref<categoryFirstType[]> = ref([]);
const optionSecondCategoryList: Ref<categoryDefaultType[]> = ref([]);

/** 문의 상태값 데이터 */
const optionStatTypeList = ref<selectOptionDataType[]>([]);

/** 코멘트 인입 유형들 */
const optionCommentIncomingTypeList = ref<selectOptionDataType[]>([]);

/** 불만 유형들 */
const optionComplainList = ref<selectOptionDataType[]>([]);

const postCommonSelectOptionData = async () => {
  try {
    /** 문의게시판 목록 페이지와 등록/수정 페이지의 selectBox option이 다름  */
    const payload = {};
    const res = (await requestCommonSelectOptionData(payload)) as AxiosResponse;
    const typeError = runtimeCheck(requestSelectOptionListCodec, res.data);

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
        optionFirstCategoryList.value = res.data.data.category_list;
        optionStatTypeList.value = res.data.data.stat_list;
        optionCommentIncomingTypeList.value = res.data.data.incoming_list;
        optionComplainList.value = res.data.data.complain_name_list;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
/** 문의 유형 이름 */
const findFirstCategoryInfo = (code: string) =>
  optionFirstCategoryList.value.find(
    (category: categoryFirstType) => category.code === code,
  );

const findFirstCategoryTypeName = (code: string) => {
  const target = findFirstCategoryInfo(code);
  if (target) return target.name;
  return '';
};

const findSecondCategoryTypeName = (firstCode: string, secondCode: string) => {
  const firstCategory = findFirstCategoryInfo(firstCode);
  if (!firstCategory) return '';
  const secondCategoryList = firstCategory.child;
  if (secondCategoryList) {
    const target = secondCategoryList.find(
      (category: categoryDefaultType) => category.code === secondCode,
    );
    return target?.name;
  }
  return '';
};

/** 문의 상태 이름 */
const findStatName = (code: string) => {
  const target = optionStatTypeList.value.find(
    (stat: statListDataType) => stat.code === Number(code),
  );
  if (target) {
    return target?.name;
  }
  return '';
};

/** 문의 상태 별 El-tag Type */
const getTagType = (statusName: string) => {
  let type = '';
  if (statusName === '대기') {
    type = 'danger';
  }
  if (statusName === '확인완료') {
    type = 'success';
  }
  if (statusName === '보류') {
    type = 'warning';
  }
  return type;
};

/** 등록 날짜 줄바꿈 */
const getSplitString = (date: string) => {
  if (!date) return '';
  const editedString = date.split(' ');
  return editedString;
};

/** 1차 유형 클릭에 따른 2차 유형 조회 */
watchEffect(() => {
  const targetFirst = optionFirstCategoryList.value.find(
    (category: categoryFirstType) =>
      category.code === searchInfo.searchCategory1,
  );
  if (!targetFirst) return;
  optionSecondCategoryList.value = targetFirst.child;
  const targetSecond = optionSecondCategoryList.value.find(
    (secondCategory: categoryDefaultType) =>
      secondCategory.code === searchInfo.searchCategory2,
  );
  if (!targetSecond) {
    searchInfo.searchCategory2 = '';
  }
});

/** 날짜 선택 shortcut */
const dateShortcuts = [
  {
    text: '오늘',
    value: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    text: '3일',
    value: () => {
      const start = new Date();
      const end = new Date();
      start.setDate(start.getDate() - 3);
      return [start, end];
    },
  },
  {
    text: '7일',
    value: () => {
      const start = new Date();
      const end = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    },
  },
  {
    text: '1개월',
    value: () => {
      const start = new Date();
      const end = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    },
  },
  {
    text: '3개월',
    value: () => {
      const start = new Date();
      const end = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    },
  },
];

/** 테이블 불만유형 및 상태에 따른 열 색상 구분 */
const tableRowClassName = ({ row }: { row: csInquiryBoardListDataType }) => {
  let color = '';
  if (row.stat_name === '확인중') {
    color = 'warning-row';
  }
  if (row.complain) {
    color = 'danger-row';
  }

  return color;
};

/** 목록표 높이 */
const getTableHeight = () => {
  const parentsContainer = document.querySelector(
    '.default_layout_contents',
  ) as HTMLElement;
  let normalHeight = 520;
  let smallHeight = 320;
  if (parentsContainer) {
    const rect = parentsContainer.getBoundingClientRect().height;
    normalHeight = (rect / 100) * 33.5;
    smallHeight = (rect / 100) * 58.5;
  }
  return isSearchOpen.value ? normalHeight : smallHeight;
};

/** 페이지 이동, 검색 */
const setQueryData = async () => {
  const searchData = {
    page: paginationInfo.page,
    pageSize: paginationInfo.pageSize,
    searchStartDate: searchInfo.searchDate ? searchInfo.searchDate[0] : '',
    searchEndDate: searchInfo.searchDate ? searchInfo.searchDate[1] : '',
    searchCategory1: searchInfo.searchCategory1,
    searchCategory2: searchInfo.searchCategory2,
    searchKeyword: searchInfo.searchKeyword,
    searchComplain: searchInfo.searchComplain,
    searchIncoming: searchInfo.searchIncoming,
    searchStat: searchInfo.searchStat ? searchInfo.searchStat.join(';') : '',
    searchEnquirerHp: searchInfo.searchEnquirerHp,
    searchStoreName: searchInfo.searchStoreName,
    searchStoreCode: searchInfo.searchStoreCode,
    searchChecker: searchInfo.searchChecker,
    searchEnquirer: searchInfo.searchEnquirer,
    searchComment: searchInfo.searchComment,
    searchNum: searchInfo.searchNum,
  };
  pushPageWithQuery(cSInquiryBoard, searchData);
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 1;
  setQueryData();
};

/** 페이지네이션 */
const handleCurrentPage = (val: number) => {
  paginationInfo.page = val;
  setQueryData();
};

/** 초기화 */
const resetQueryDataAndSearchData = () => {
  searchInfo.searchCategory1 = '';
  searchInfo.searchCategory2 = '';
  searchInfo.searchKeyword = '';
  searchInfo.searchStat = [];
  searchInfo.searchChecker = '';
  searchInfo.searchEnquirer = '';
  searchInfo.searchEnquirerHp = '';
  searchInfo.searchComment = '';
  searchInfo.searchStoreName = '';
  searchInfo.searchStoreCode = '';
  searchInfo.searchDate = [refinedWeek(), refinedToday()];
  searchInfo.searchComplain = '';
  searchInfo.searchIncoming = '';
  searchInfo.searchNum = '';
  paginationInfo.page = 1;
  paginationInfo.pageSize = 10;

  setQueryData();
};

/** v-for 방어 로직 */
const getFirstCategoryOptionKey = (name: string, index: number) =>
  name ? `firstCategory-${name}` : `firstCategory-${index}`;
const getSecondCategoryOptionKey = (name: string, index: number) =>
  name ? `secondCategory-${name}` : `secondCategory-${index}`;
const getStateOptionKey = (name: string, index: number) =>
  name ? `state-${name}` : `state-${index}`;
const getComplainOptionKey = (name: string, index: number) =>
  name ? `complain-${name}` : `complain-${index}`;
const getIncomingOptionKey = (name: string, index: number) =>
  name ? `incoming-${name}` : `incoming-${index}`;

postCommonSelectOptionData();
getCsInquiryList();
</script>

<template>
  <BreadcrumbHeader :propsHeader="csInquiryBoardHeader" />
  <el-card
    class="mb-10"
    shadow="never"
  >
    <div>
      <el-row
        align="middle"
        class="mb-20"
        justify="space-between"
      >
        <el-row>
          <div>
            <p class="font-small mb-5">날짜</p>
            <el-date-picker
              v-model="searchInfo.searchDate"
              :shortcuts="dateShortcuts"
              class="mr-20"
              end-placeholder="종료 날짜"
              format="YYYY-MM-DD"
              range-separator="~"
              start-placeholder="시작 날짜"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div>
            <p class="font-small mb-5">1차 유형</p>
            <el-select
              v-model="searchInfo.searchCategory1"
              class="mr-20"
              clearable
            >
              <el-option
                v-for="(first, index) in optionFirstCategoryList"
                :key="getFirstCategoryOptionKey(first.name, index)"
                :label="first.name"
                :value="first.code"
              />
            </el-select>
          </div>
          <div>
            <p class="font-small mb-5">상세 유형 및 비고</p>
            <el-input
              v-model="searchInfo.searchKeyword"
              class="mr-20"
              clearable
              style="width: 400px"
              @keyup.enter="getSearchData"
            >
              <template #prepend>
                <el-select
                  v-model="searchInfo.searchCategory2"
                  clearable
                  style="width: 150px"
                >
                  <el-option
                    v-for="(second, index) in optionSecondCategoryList"
                    :key="getSecondCategoryOptionKey(second.name, index)"
                    :label="second.name"
                    :value="second.code"
                  />
                </el-select>
              </template>
            </el-input>
          </div>
        </el-row>
        <el-row>
          <el-button
            :icon="Search"
            round
            type="primary"
            @click="getSearchData"
          >
            검색하기
          </el-button>
          <el-button
            :icon="RefreshRight"
            round
            @click="resetQueryDataAndSearchData"
          >
            초기화
          </el-button>
        </el-row>
      </el-row>
      <el-row class="mb-20">
        <div>
          <p class="font-small mb-5">불만 유형</p>
          <el-select
            v-model="searchInfo.searchComplain"
            class="mr-40"
            clearable
          >
            <el-option
              v-for="(complain, index) in optionComplainList"
              :key="getComplainOptionKey(complain.name, index)"
              :label="complain.name"
              :value="complain.code"
            />
          </el-select>
        </div>
        <div>
          <p class="font-small mb-5">인입 유형</p>
          <el-select
            v-model="searchInfo.searchIncoming"
            class="mr-40"
            clearable
          >
            <el-option
              v-for="incoming in optionCommentIncomingTypeList"
              :key="getIncomingOptionKey(incoming.name, incoming.code)"
              :label="incoming.name"
              :value="incoming.code"
            />
          </el-select>
        </div>
        <div>
          <p class="font-small mb-5">요청 상태</p>
          <el-checkbox-group v-model="searchInfo.searchStat">
            <el-checkbox
              v-for="(status, index) in optionStatTypeList"
              :key="getStateOptionKey(status.name, index)"
              :label="String(status.code)"
            >
              {{ status.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-row>
      <el-row
        v-if="isSearchOpen"
        class="search-input-grid mb-20"
      >
        <div>
          <p class="font-small mb-5">연락처</p>
          <el-input
            v-model="searchInfo.searchEnquirerHp"
            clearable
            @keyup.enter="getSearchData"
          >
            <template #prepend>
              <el-icon>
                <Phone />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <p class="font-small mb-5">매장명</p>
          <el-input
            v-model="searchInfo.searchStoreName"
            clearable
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
            v-model="searchInfo.searchStoreCode"
            clearable
            @keyup.enter="getSearchData"
          >
            <template #prepend>
              <el-icon>
                <Link />
              </el-icon>
            </template>
          </el-input>
        </div>
      </el-row>
      <div v-if="isSearchOpen">
        <div class="search-input-grid mb-20">
          <div>
            <p class="font-small mb-5">담당자</p>
            <el-input
              v-model="searchInfo.searchChecker"
              clearable
              @keyup.enter="getSearchData"
            >
              <template #prepend>
                <el-icon>
                  <Headset />
                </el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <p class="font-small mb-5">문의자</p>
            <el-input
              v-model="searchInfo.searchEnquirer"
              clearable
              @keyup.enter="getSearchData"
            >
              <template #prepend>
                <el-icon>
                  <User />
                </el-icon>
              </template>
            </el-input>
          </div>
          <div></div>
        </div>
        <div class="search-input-grid mb-20">
          <div>
            <p class="font-small mb-5">상담 번호</p>
            <el-input
              v-model="searchInfo.searchNum"
              clearable
              @keyup.enter="getSearchData"
            >
              <template #prepend>
                <el-icon>
                  <Cellphone />
                </el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <p class="font-small mb-5">내용</p>
            <el-input
              v-model="searchInfo.searchComment"
              clearable
              @keyup.enter="getSearchData"
            >
              <template #prepend>
                <el-icon>
                  <ChatLineSquare />
                </el-icon>
              </template>
            </el-input>
          </div>
          <div></div>
        </div>
      </div>
    </div>
    <el-row justify="end">
      <el-button
        v-if="!isSearchOpen"
        size="small"
        @click="openSearch()"
      >
        상세 검색 열기
        <el-icon>
          <CaretBottom />
        </el-icon>
      </el-button>
      <el-button
        v-else
        size="small"
        @click="closeSearch()"
      >
        상세 검색 닫기
        <el-icon>
          <CaretTop />
        </el-icon>
      </el-button>
    </el-row>
  </el-card>
  <div class="notice-board-wrapper">
    <div class="table-header mb-10">
      <div class="notice-count-info">
        <div>
          <span>
            총
            <span class="notice-count">
              {{ paginationInfo.total }}
            </span>
            개의 검색 결과가 있습니다.
          </span>
        </div>
      </div>
      <el-row>
        <el-select
          v-model="paginationInfo.pageSize"
          class="mr-10"
          placeholder="페이지당 개수를 선택해주세요."
          @change="getCsInquiryList()"
        >
          <el-option
            v-for="count in pagePerCount"
            :key="count.value"
            :label="count.label"
            :value="count.value"
          />
        </el-select>
        <div v-if="isMasterCheck()">
          <el-button
            v-if="!excelDownloadState"
            class="mr-10"
            type="primary"
            @click="excelDownloadData"
          >
            엑셀 다운로드
          </el-button>
          <el-button
            v-else
            class="mr-10"
            loading
            type="primary"
          >
            다운로드중..
          </el-button>
        </div>
        <router-link :to="{ path: cSInquiryRegister }">
          <el-button type="primary"> 문의 등록</el-button>
        </router-link>
      </el-row>
    </div>
    <el-table
      :data="inquiryListData"
      :height="getTableHeight()"
      :row-class-name="tableRowClassName"
      border
      flexible
    >
      <el-table-column
        align="center"
        head-align="center"
        label="번호"
        prop="num"
        width="80"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="1차 문의 유형"
      >
        <template #default="scope">
          {{ findFirstCategoryTypeName(scope.row.category1) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        head-align="center"
        label="2차 문의 유형"
      >
        <template #default="scope">
          {{
            findSecondCategoryTypeName(scope.row.category1, scope.row.category2)
          }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        head-align="center"
        label="매장명"
        prop="storeName"
        width="200"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="문의자"
        prop="enquirer"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="문의자 연락처"
        prop="enquirerHp"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="인입 유형"
        prop="cs_incoming_name"
        width="100"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="불만유형"
        prop="complain_name"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="담당자"
        prop="checker"
        width="150"
      />
      <el-table-column
        align="center"
        head-align="center"
        label="상태"
        prop="address"
        width="100"
      >
        <template #default="scope">
          <el-tag :type="getTagType(findStatName(scope.row.stat))">
            {{ findStatName(scope.row.stat) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="날짜"
        width="200"
      >
        <el-table-column
          align="center"
          label="수정일"
          width="120"
        >
          <template #default="scope">
            <div>
              {{ getSplitString(scope.row.comment[0]?.bbsRegisterDate)[0] }}
            </div>
            <div class="cs-time-column">
              {{ getSplitString(scope.row.comment[0]?.bbsRegisterDate)[1] }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="등록일"
          width="120"
        >
          <template #default="scope">
            <div>
              {{ getSplitString(scope.row.bbsRegisterDate)[0] }}
            </div>
            <div class="cs-time-column">
              {{ getSplitString(scope.row.bbsRegisterDate)[1] }}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        align="center"
        head-align="center"
        width="60"
      >
        <template #header>
          <div>처리</div>
          <div>내역</div>
          <div>건수</div>
        </template>
        <template #default="scope">
          <span>
            {{ scope.row.comment?.length }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        head-align="center"
        label="수정"
        width="90"
      >
        <template #default="scope">
          <router-link
            :to="{
              path: cSInquiryRegister,
              query: { num: scope.row.num },
            }"
          >
            <el-button type="warning"> 수정</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <el-row
      align="middle"
      class="mt-10"
      justify="center"
    >
      <el-pagination
        :current-page="paginationInfo.page"
        :page-size="paginationInfo.pageSize"
        :total="paginationInfo.total"
        background
        layout="prev, pager, next"
        @current-change="handleCurrentPage"
      />
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.cs-board-title {
  font-size: 24px;
}

.search-input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.cs-time-column {
  color: #f56c6c;
}

.el-table {
  font-size: 13px;

  &:deep(.warning-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }

  &:deep(.danger-row) {
    --el-table-tr-bg-color: var(--el-color-danger-light-9);
  }
}

.notice-board-wrapper {
  &:deep(.el-card__header) {
    padding: 10px 20px;
  }

  &:deep(.el-card__body) {
    padding: 0 0 10px 0;
  }

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .notice-count-info {
      display: flex;
      align-items: center;
      font-size: 15px;

      .notice-count {
        color: #fc0000;
      }
    }
  }
}
</style>
