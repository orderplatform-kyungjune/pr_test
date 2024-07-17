<script lang="ts" setup>
import { computed, reactive, ref, Ref } from 'vue';
import { dayjs, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, etcUtils, formattingUtils } from '@utils';
import useTagsStore from '@store/storeTags';
import { memberRegisterManageDetail } from '@router/routePaths';
import { memberRegisterListItemType, memberRegisterSearchDataType } from '@interface/memberRegister';
import { torderMemberListDataType } from '@interface/member';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import { MEMBER_REGISTER_MANAGE, SYSTEM_CONTROL } from '@common/string';
import { PATTERN_ONLY_NUMBER, PATTERN_STORE_NAME } from '@common/regexPatterns';
import { ADMIN_API_URL } from '@common/envVariables';
import { endpoints, member, memberRegister } from '@apis';

const { requestMemberRegisterList } = memberRegister;
const { requestTorderMemberList } = member;
const { replaceEmptyString } = etcUtils;
const { maskAllNumber, formatTaxId, createRegExp, formatPhoneNumber } = formattingUtils;
const { convertServerTimeToKorea } = dateFormatterUtil;
const { getDownloadExcelWithToken } = useExcelDownload();
const { addTagsData } = useTagsStore();

// BreadcrumbHeader
const headerProp = reactive([{ name: SYSTEM_CONTROL }, { name: MEMBER_REGISTER_MANAGE }]);

/** 오늘 날짜 YYYY-MM-DD 포맷팅 */
const getTodayText = () => dayjs().format('YYYY-MM-DD');

/** 1일 전 날짜 YYYY-MM-DD 포맷팅 */
const getYesterdayText = () => dayjs().subtract(1, 'day').format('YYYY-MM-DD');

const inputData = reactive<memberRegisterSearchDataType>({
  state: '',
  manager: '',
  txtKey: 'storeName',
  txt: '',
  dateKey: 'register',
  dateRange: ['', ''],
  checkedToday: false,
});

const searchedData: memberRegisterSearchDataType = {
  state: '',
  manager: '',
  txtKey: 'storeName',
  txt: '',
  dateKey: 'register',
  dateRange: ['', ''],
  checkedToday: false,
  excludingTestStores: 'N',
};

const paginationInfo = reactive({
  page: 1,
  perPage: 10,
  from: 1,
  to: 10,
  total: 0,
});

const searchedDataNumber = computed(
  () => (index: number) =>
    paginationInfo.total -
    (paginationInfo.page - 1) * paginationInfo.perPage -
    index,
);

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
];

const isExcelDownloading: Ref<boolean> = ref(false);
/** 엑셀 다운로드 */
const postExcelDownload = async () => {
  const startDate = searchedData.dateRange && searchedData.dateRange?.length > 0 ? searchedData.dateRange[0] : '';
  const endDate = searchedData.dateRange && searchedData.dateRange?.length > 0 ? searchedData.dateRange[1] : '';

  try {
    isExcelDownloading.value = true;
    const requestURL = `${ADMIN_API_URL}${endpoints.excel.member_register_list_download}?searchState=${searchedData.state}&searchManager=${searchedData.manager}&searchKey=${searchedData.txtKey}&searchTxt=${searchedData.txt}&searchDateKey=${searchedData.dateKey}&searchStartDate=${startDate}&searchEndDate=${endDate}&excludingTestStores=${searchedData.excludingTestStores}`;

    await getDownloadExcelWithToken(
      '통합인증승인관리_리스트',
      requestURL,
    );
  } catch (error: any) {
    if (error.status === 400) {
      await ElMessageBox.alert(error.message, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    } else {
      console.warn(error);
    }
  } finally {
    isExcelDownloading.value = false;
  }
};

/** 매장 검색 조건에 따른 placeholder 값 변경
 * @return string 매장 검색 조건에 따른 placeholder
 * */
const getSearchInputPlaceHolder = () => {
  if (inputData.txtKey === 'storeName') return '매장명을 입력해주세요.';
  if (inputData.txtKey === 'userName') return '대표자명을 입력해주세요.';
  if (inputData.txtKey === 'userTel') return '대표자 휴대전화번호를 입력해주세요.';
  if (inputData.txtKey === 'taxId') return '사업자번호를 입력해주세요.';
  if (inputData.txtKey === 'torderId') return '매장ID를 입력해주세요.';
  return '';
};

/** 매장 검색 조건에 따른 maxlength 값 변경
 * @return 20 | undefined 매장 검색 조건에 따른 maxlength
 * */
const getSearchInputMaxLength = () => {
  if (inputData.txtKey === 'userName') return 20;
  return undefined;
};

/** 매장 검색 값 clear */
const clearStoreSearchText = () => {
  inputData.txt = '';
};

/** 매장 검색 값 유효성 검사 */
const validateSearchTxt = () => {
  inputData.txt = inputData.txt.replaceAll(' ', '');
  if (!inputData.txt) return;

  let regexPattern: string = '';
  let warningMessage = '';
  if (inputData.txtKey === 'storeName') {
    regexPattern = PATTERN_STORE_NAME;
    warningMessage = '한글/영문/특문/숫자만 입력 가능합니다.';
  }
  if (inputData.txtKey === 'userTel' || inputData.txtKey === 'taxId') {
    inputData.txt = inputData.txt.replaceAll('-', '');
    regexPattern = PATTERN_ONLY_NUMBER;
    warningMessage = '숫자만 입력 가능합니다.';
  }

  const regTest = createRegExp(`^${regexPattern}+$`);
  const regMatch = createRegExp(regexPattern, 'g');

  if (!regTest.test(inputData.txt)) {
    ElMessageBox.alert(warningMessage, '경고');
    inputData.txt = inputData.txt.match(regMatch)?.join('') ?? ''; // 미부합 문자열 제거
  }
};

/** 통합 인증 승인 요청 리스트 */
const memberRegisterList: Ref<memberRegisterListItemType[]> = ref([]);

const isLoadingRegisterList = ref(false);
/** 통합 인증 승인 요청 리스트 api 호출 */
const getMemberRegisterList = async (excludingTestStores?: 'Y' | 'N') => {
  searchedData.excludingTestStores = excludingTestStores || 'N';
  const requestData = {
    page: paginationInfo.page,
    perPage: paginationInfo.perPage,
    searchState: searchedData.state,
    searchManager: searchedData.manager,
    searchKey: searchedData.txtKey,
    searchTxt: searchedData.txt,
    searchDateKey: searchedData.dateKey,
    searchStartDate:
      searchedData.dateRange && searchedData.dateRange?.length > 0
        ? searchedData.dateRange[0]
        : '',
    searchEndDate:
      searchedData.dateRange && searchedData.dateRange?.length > 0
        ? searchedData.dateRange[1]
        : '',
    excludingTestStores: searchedData.excludingTestStores,
  };

  try {
    isLoadingRegisterList.value = true;
    const res = (await requestMemberRegisterList(requestData)) as AxiosResponse;

    paginationInfo.total = res.data.page_info.total;
    paginationInfo.page = res.data.page_info.current_page;
    paginationInfo.perPage = res.data.page_info.per_page;
    paginationInfo.from = res.data.page_info.from;
    paginationInfo.to = res.data.page_info.to;
    memberRegisterList.value = res.data.data;
  } catch (error: any) {
    if (error.status === 400) {
      await ElMessageBox.alert(error.message, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    } else {
      console.warn(error);
    }
  } finally {
    isLoadingRegisterList.value = false;
  }
};

const changeIncludeTestStore = (value: boolean) => {
  getMemberRegisterList(value ? 'Y' : 'N');
};

/** 담당자 리스트 */
const selectedManagerArray: Ref<string[]> = ref([]);
const managerList: Ref<{ id: string; name: string }[]> = ref([]);

/**
 * 담당자 리스트 api 호출
 * @param searchWord 검색할 담당자명 / 담당자 ID
 * */
const postTorderMemberList = async (searchWord?: string) => {
  try {
    const payload = {
      page: 1,
      perPage: 100,
      searchTxt: searchWord ?? '',
    };
    const res = (await requestTorderMemberList(payload)) as AxiosResponse;

    managerList.value = res.data?.data?.map(
      (manager: torderMemberListDataType) => ({
        value: manager.T_order_id,
        label: manager.T_order_member_name,
      }),
    );
  } catch (error: any) {
    if (error.status === 400) {
      await ElMessageBox.alert(error.message, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    } else {
      console.warn(error);
    }
  }
};

/**
 * el-select-v2 의 담당자 자동 검색
 * @param query 검색할 담당자명 / 담당자 ID
 * */
const searchManager = async (query: string) => {
  if (!query.replaceAll(' ', '')) {
    managerList.value = [];
    return;
  }
  await postTorderMemberList(query);
};

/** 인증 요청 건 검색하기 api 호출 */
const getSearchData = async () => {
  paginationInfo.page = 1;
  searchedData.state = inputData.state;
  searchedData.manager = selectedManagerArray.value?.join(',');
  searchedData.txtKey = inputData.txtKey;
  searchedData.txt = inputData.txt;
  searchedData.dateKey = inputData.dateKey;
  searchedData.state = inputData.state;
  searchedData.dateRange = inputData.dateRange;

  await getMemberRegisterList();
};

/**
 * 페이지네이션 - 페이지 이동에 따른 요청 리스트 재호출
 * @param pageNum 선택한 페이지
 * */
const handleCurrentPage = (pageNum: number) => {
  paginationInfo.page = pageNum;
  getMemberRegisterList();
};

/**
 * 페이지네이션 - N개씩 보기
 * @param pageSize 한 페이지에 출력할 값
 * */
const changePageSize = (pageSize: number) => {
  paginationInfo.page = 1;
  paginationInfo.perPage = pageSize;
  getMemberRegisterList();
};

/** 이미지 미리보기 모달 */
const imagePreviewData = reactive({
  isOpen: false,
  src: '',
});

/**
 * 이미지 미리보기 모달 open
 * @param imgUrl 모달에 출력할 img url
 * */
const openImagePreviewModal = (imgUrl: string) => {
  imagePreviewData.isOpen = true;
  imagePreviewData.src = imgUrl;
};

/** 이미지 미리보기 모달 close */
const closeImagePreviewModal = () => {
  imagePreviewData.isOpen = false;
  imagePreviewData.src = '';
};

/** 승인 요청 검색 조건 초기화 */
const resetSearchData = async () => {
  paginationInfo.page = 1;
  paginationInfo.perPage = 20;
  inputData.state = '';
  inputData.manager = '';
  inputData.txtKey = 'storeName';
  inputData.txt = '';
  inputData.dateKey = 'register';
  inputData.dateRange = ['', ''];
  inputData.checkedToday = false;
  selectedManagerArray.value = [];
};

/** 승인 요청 검색 - 기간 조건 기본값 설정 */
const setDefaultDateRange = () => {
  if (inputData.dateRange?.[0] === '' && inputData.dateRange?.[1] === '') {
    inputData.dateRange[0] = getYesterdayText();
    inputData.dateRange[1] = getTodayText();
  }
};

/** 승인 요청 검색 - 기간 조건 '당일' 체크 시 날짜 자동 변경 */
const changeCheckedToday = () => {
  if (!inputData.checkedToday) {
    inputData.dateRange = ['', ''];
    return;
  }

  inputData.dateRange = [getTodayText(), getTodayText()];
};

/**
 승인 상태 텍스트 구하기
 @param approveState 승인 타입 값
 @return 승인 타입의 텍스트
 */
const getApproveStateTxt = (approveState: number): string => {
  if (approveState === 0 || approveState === 3) return '승인 요청';
  if (approveState === 2) return '승인 거절';
  if (approveState === 4) return '승인 보류';
  if (approveState === 1) return '승인 완료';
  return '';
};

/**
 * 승인 상태에 따른 글씨색 변경 - el-text 활용
 * @param approveState 승인 타입 값
 * @return el-text type 값
 */
const getApproveStateElType = (approveState: number) => {
  if (approveState === 2) return 'danger';
  if (approveState === 4) return 'primary';
  return '';
};

/**
 * 인증요청 건의 사업자등록번호 표기: 마스킹 / 원본 토글
 * @param registerApplyData 인증 요청 데이터
 * */
const displayTaxIdInCell = (registerApplyData: memberRegisterListItemType) => {
  const { taxId } = registerApplyData;

  if (!taxId) return '-';
  if (registerApplyData.isCellSelectedTaxId) return formatTaxId(taxId);
  return maskAllNumber(formatTaxId(taxId));
};

/**
 * 승인된 요청의 사업자등록번호 표기 토글
 * @param row 선택한 row 의 인증 요청 정보
 * */
const onClickTaxIdCell = (row: memberRegisterListItemType) => {
  row.isCellSelectedTaxId = !row.isCellSelectedTaxId;
};

/**
 * 인증요청 건의 휴대전화번호 표기: 마스킹 / 원본 토글
 * @param registerApplyData 인증 요청 데이터
 * */
const displayPhoneInCell = (registerApplyData: memberRegisterListItemType) => {
  const { userTel } = registerApplyData;
  if (!userTel) return '-';
  if (registerApplyData.isCellSelectedUserTel) return formatPhoneNumber(userTel);
  return maskAllNumber(formatPhoneNumber(userTel));
};

/**
 * 승인된 요청의 휴대전화번호 토글
 * @param row 선택한 row 의 인증 요청 정보
 * */
const onClickPhoneCell = (row: memberRegisterListItemType) => {
  row.isCellSelectedUserTel = !row.isCellSelectedUserTel;
};

/**
 * 테이블 - 승인 상태별 row background
 * @param {row} 선택한 row 의 인증 요청 정보
 * * */
const getRowStyleByState = ({ row }: { row: memberRegisterListItemType }) => {
  if (row.approveState === 0 || row.approveState === 3) return 'state-requested';
  return '';
};

getMemberRegisterList();
</script>

<template>
  <el-dialog
    v-model="imagePreviewData.isOpen"
    align-center
    width="30%"
    @close="closeImagePreviewModal"
  >
    <el-row
      align="middle"
      justify="center"
    >
      <el-image
        :initial-index="0"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="[imagePreviewData.src]"
        :src="imagePreviewData.src"
        :zoom-rate="1.2"
        fit="contain"
        style="max-width: 500px; max-height: 700px"
      />
    </el-row>
    <template #footer>
      <el-button
        color="#000"
        @click="closeImagePreviewModal"
      >
        닫기
      </el-button>
    </template>
  </el-dialog>
  <BreadcrumbHeader :propsHeader="headerProp" />
  <p
    class="mt-5 mb-10 member-register-desc font-thin"
    type="info"
  >
    사장님 앱에서 통합 인증 승인을 요청한 리스트를 볼 수 있습니다.
  </p>
  <el-descriptions
    :column="2"
    border
    class="mb-10"
    min-width="50%"
  >
    <el-descriptions-item
      label="상태"
      label-align="center"
    >
      <el-radio-group
        v-model="inputData.state"
        class="search-item-width"
      >
        <el-radio label="">
          전체
        </el-radio>
        <el-radio label="0,3">
          승인 요청
        </el-radio>
        <el-radio label="1">
          승인 완료
        </el-radio>
        <el-radio label="2">
          승인 거절
        </el-radio>
        <el-radio label="4">
          승인 보류
        </el-radio>
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item
      label="담당자"
      label-align="center"
    >
      <el-select-v2
        v-model="selectedManagerArray"
        :max-collapse-tags="6"
        :options="managerList"
        :remote-method="searchManager"
        class="width-100"
        clearable
        collapse-tags
        collapse-tags-tooltip
        filterable
        multiple
        placeholder="담당자명/담당자ID 로 검색하기 (Enter)"
        remote
        scrollbar-always-on
      />
    </el-descriptions-item>
    <el-descriptions-item
      label="매장 검색"
      label-align="center"
    >
      <el-row align="middle">
        <el-select
          v-model="inputData.txtKey"
          class="mr-5"
          @change="clearStoreSearchText"
        >
          <el-option
            label="매장명"
            value="storeName"
          />
          <el-option
            label="대표자명"
            value="userName"
          />
          <el-option
            label="휴대전화번호"
            value="userTel"
          />
          <el-option
            label="사업자번호"
            value="taxId"
          />
          <el-option
            label="매장ID"
            value="torderId"
          />
        </el-select>
        <el-input
          v-model="inputData.txt"
          :maxlength="getSearchInputMaxLength()"
          :placeholder="getSearchInputPlaceHolder()"
          class="flex-1"
          @blur="validateSearchTxt"
        />
      </el-row>
    </el-descriptions-item>
    <el-descriptions-item
      :span="2"
      label="기간"
      label-align="center"
    >
      <el-row
        align="middle"
        justify="space-around"
      >
        <el-select
          v-model="inputData.dateKey"
          class="mr-5"
          placeholder="승인 요청일"
        >
          <el-option
            label="승인 요청일"
            value="register"
          />
          <el-option
            label="승인/거절일"
            value="approve"
          />
        </el-select>
        <el-date-picker
          v-model="inputData.dateRange"
          :disabled="inputData.checkedToday"
          :end-placeholder="getTodayText()"
          :start-placeholder="getYesterdayText()"
          class="flex-1"
          format="YYYY-MM-DD"
          range-separator="~"
          type="daterange"
          value-format="YYYY-MM-DD"
          @focus="setDefaultDateRange"
        />
        <el-checkbox
          v-model="inputData.checkedToday"
          class="ml-10"
          label="당일"
          @change="changeCheckedToday"
        />
      </el-row>
    </el-descriptions-item>
  </el-descriptions>
  <el-row
    align="middle"
    justify="end"
  >
    <el-button
      :icon="Search"
      class="confirm-button"
      round
      type="primary"
      @click="getSearchData"
    >
      검색
    </el-button>
    <el-button
      :icon="RefreshRight"
      class="confirm-button"
      round
      @click="resetSearchData"
    >
      초기화
    </el-button>
  </el-row>
  <el-row
    align="bottom"
    class="mt-10"
    justify="space-between"
  >
    <el-row align="middle">
      <p>검색목록</p>
      <el-checkbox
        class="ml-10"
        @change="changeIncludeTestStore"
      >
        승인완료 된 매장 중 테스트 매장 제외
      </el-checkbox>
    </el-row>
    <el-row>
      <el-button
        :loading="isExcelDownloading"
        class="excel-download-button"
        type="success"
        @click="postExcelDownload"
      >
        엑셀 다운로드
      </el-button>
      <el-select
        v-model="paginationInfo.perPage"
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
  <el-divider />
  <el-row
    align="bottom"
    class="mb-10"
  >
    <p>
      총
      <el-text
        size="large"
        type="danger"
      >
        {{ paginationInfo.total }}
      </el-text>
      개의 검색결과가 있습니다.
    </p>
    <p
      class="member-register-desc font-thin ml-10"
      type="info"
    >
      사장님 앱에서 승인 요청 된 통합 인증 정보를 확인 할 수 있습니다.
    </p>
  </el-row>
  <el-table
    v-loading="isLoadingRegisterList"
    :data="memberRegisterList"
    :row-class-name="getRowStyleByState"
    class="width-100 font-thin"
  >
    <el-table-column
      align="center"
      header-align="center"
      label="NO"
      width="55"
    >
      <template #default="{ $index }">
        <span class="font-small">

          {{ searchedDataNumber($index) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="상태"
      width="90"
    >
      <template #default="{ row }">
        <el-text :type="getApproveStateElType(row.approveState)">
          {{ getApproveStateTxt(row.approveState) }}
        </el-text>
      </template>
    </el-table-column>
    <el-table-column
      header-align="center"
      label="매장 정보"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="매장명"
        prop="storeName"
        width="150"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="지점"
        prop="storeAreaName"
        width="145"
      />
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="대표자명"
      prop="userName"
      width="110"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="휴대전화번호"
      width="130"
    >
      <template #default="{ row }">
        <span @click="onClickPhoneCell(row)">
          {{ displayPhoneInCell(row) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장 ID"
      width="110"
    >
      <template #default="{ row }">
        {{ row.torderId }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="사업자등록정보"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="사업자등록번호"
        prop="taxId"
        width="130"
      >
        <template #default="{ row }">
          <span @click="onClickTaxIdCell(row)">
            {{ displayTaxIdInCell(row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="사업자등록증"
        width="110"
      >
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="openImagePreviewModal(row.taxFileUrl)"
          >
            파일 보기
          </el-button>
        </template>
      </el-table-column>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="매장 코드"
      prop="storeCode"
      width="110"
    >
      <template #default="{ row }">
        {{ replaceEmptyString(row.storeCode) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="담당자"
      width="100"
    >
      <template #default="{ row }">
        {{ replaceEmptyString(row.managerName) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="요청 일시"
      width="150"
    >
      <template #default="{ row }">
        <span class="font-small long-text-wrap">
          {{ convertServerTimeToKorea(row.created_at) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="승인/거절 일시"
      prop="approveStateDate"
      width="150"
    >
      <template #default="{ row }">
        <span class="font-small long-text-wrap">
          {{ convertServerTimeToKorea(row.approveStateDate) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      header-align="center"
      label="승인 관리"
      width="90"
    >
      <template #default="{ row }">
        <router-link
          :to="{
              path: memberRegisterManageDetail,
              query: {
                registerId: row.id,
              },
            }"
        >
          <el-button
            type="danger"
            @click="addTagsData({
              name: '승인 관리 상세',
              path: memberRegisterManageDetail,
            });"
          >
            보기
          </el-button>
        </router-link>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    class="mt-20"
    justify="center"
  >
    <el-pagination
      :current-page="paginationInfo.page"
      :page-size="paginationInfo.perPage"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label) {
  width: 10%;
}

:deep(.el-descriptions__content) {
  width: 40%;
}

.el-divider--horizontal {
  margin: 12px 0 !important;
}

.member-register-desc {
  font-size: 13px;
}

.long-text-wrap {
  font-size: 13px;
  word-break: keep-all;
  white-space: normal;
}

.el-table {
  &:deep(.state-requested) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
}
</style>
