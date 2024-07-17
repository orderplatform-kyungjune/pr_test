<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, routeHelper, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { totalMemberShipManage } from '@router/routePaths';
import { departmentListDataType, selectBoxType, torderMemberListDataType } from '@interface/member';
import { CaretBottom, CaretTop } from '@element-plus/icons-vue';
import { AddMemberShipModal, DetailTotalMemberShipModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import {
  ADD_MEMBER_SHIP,
  DETAIL_TOTAL_MEMBERSHIP,
  TORDER_MEMBERSHIP_MANAGE,
  TOTAL_MEMBERSHIP_MANAGE,
} from '@common/string';
import { memberCodec } from '@codecs';
import { endpoints, member } from '@apis';

// header props
const totalMemberShipHeader = reactive([
  { name: TOTAL_MEMBERSHIP_MANAGE },
  { name: TORDER_MEMBERSHIP_MANAGE },
]);
const route = useRoute();
const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, isBrand1Admin } = authentication;
const { pushPageWithQuery } = routeHelper;
const { flag, openModal, openModalWithData } = useModalStore();
const {
  requestCorporationList,
  requestDepartmentList,
  requestAuthTotalList,
  requestStateList,
  requestTorderMemberList,
  requestTotalMemberUpdateInfo,
} = member;
const { departmentListCodec, selectBoxListCodec, torderMemberListCodec } =
  memberCodec;
const { downloadExcelPostWithToken } = useExcelDownload();

const excelDownloadState = ref(false);

/** 내부 회원 정보 검색 */
const searchCorporation = (route.query.searchCorporationArray as string) ?? '';
const searchState = (route.query.searchStateArray as string) ?? '';
const searchTorderInfo = reactive({
  searchCorporation: searchCorporation
    .split(';')
    .filter((corporation) => corporation !== ''),
  searchState: searchState.split(';').filter((state) => state !== ''),
  searchAuth: route.query.searchAuth as string,
  searchDepartment: route.query.searchDepartment as string,
  searchTxt: route.query.searchTxt as string,
  searchDate: [
    route.query.searchStartDate as string,
    route.query.searchEndDate as string,
  ],
});
const torderPaginationInfo = reactive({
  page: Number(route.query.page) ?? 1,
  perPage: Number(route.query.perPage) ?? 10,
  total: 0,
});

const getStringFunction = (search: string[]) => search.join(';');

/** 테이블 체크박스 데이터 */
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const torderCheckboxData = ref<torderMemberListDataType[]>([]);
const handleTorderSelect = (val: torderMemberListDataType[]) => {
  torderCheckboxData.value = val;
};

/** 기능 일괄 적용 데이터 */
const collectiveDataInfo = reactive({
  state: '',
  auth: '',
});

/** 내부 회원 리스트 데이터 */
const torderMemberListData = ref<torderMemberListDataType[]>([]);
/** 내부 회원 리스트 데이터 불러오기 */
const getTorderMemberListData = async () => {
  const searchInfo = {
    page: torderPaginationInfo.page,
    perPage: torderPaginationInfo.perPage,
    searchStartDate: searchTorderInfo.searchDate
      ? searchTorderInfo.searchDate[0]
      : '',
    searchEndDate: searchTorderInfo.searchDate
      ? searchTorderInfo.searchDate[1]
      : '',
    searchDepartment: searchTorderInfo.searchDepartment,
    searchTxt: searchTorderInfo.searchTxt,
    searchAuth: searchTorderInfo.searchAuth,
    searchCorporation: searchTorderInfo.searchCorporation
      ? searchTorderInfo.searchCorporation?.join(';')
      : '',
    searchState: searchTorderInfo.searchState
      ? searchTorderInfo.searchState?.join(';')
      : '',
  };

  try {
    const res = (await requestTorderMemberList(searchInfo)) as AxiosResponse;
    const typeError = runtimeCheck(torderMemberListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        torderPaginationInfo.page = res.data.page_info.current_page;
        torderPaginationInfo.perPage = res.data.page_info.per_page;
        torderPaginationInfo.total = res.data.page_info.total;
        torderMemberListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 법인 구분 리스트 데이터 */
const corporationListData = ref<selectBoxType[]>([]);
/** 법인 구분 리스트 데이터 불러오기 */
const getCorporationListData = async () => {
  try {
    const res = (await requestCorporationList()) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        corporationListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 부서명 리스트 데이터 */
const departmentListData = ref<departmentListDataType[]>([]);
/** 부서명 리스트 데이터 불러오기 */
const getDepartmentListData = async () => {
  try {
    const res = (await requestDepartmentList()) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        departmentListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 권한명 리스트 데이터 */
const authListData = ref<selectBoxType[]>([]);
/** 권한명 리스트 데이터 불러오기 */
const getAuthListData = async () => {
  try {
    const res = (await requestAuthTotalList()) as AxiosResponse;
    const typeError = runtimeCheck(selectBoxListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        authListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 계정 상태 데이터 */
const stateListData = ref<selectBoxType[]>([]);
/** 계정 상태 데이터 불러오기 */
const getStateListData = async () => {
  try {
    const res = (await requestStateList()) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        stateListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 어드민 회원 정보 일괄 변경 */
const postUpdateMemberShipInfo = () => {
  ElMessageBox.confirm('정말로 변경하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const checkedNumberArray: number[] = [];

        torderCheckboxData.value.forEach((account) => {
          checkedNumberArray.push(account.no);
        });

        const isCheckedNumber = checkedNumberArray.length === 0;
        const isStateData = collectiveDataInfo.state.length === 0;
        const isAuthData = collectiveDataInfo.auth.length === 0;

        if (isCheckedNumber) {
          ElMessage({
            type: 'error',
            message: '수정할 회원 계정을 선택해주세요.',
          });
          return;
        }

        if (isStateData && isAuthData) {
          ElMessage({
            type: 'error',
            message: '변경할 속성을 선택해주세요.',
          });
          return;
        }

        const requestData = {
          checkedNum: checkedNumberArray,
          T_order_member_state: isStateData
            ? undefined
            : collectiveDataInfo.state,
          T_order_auth: isAuthData ? undefined : collectiveDataInfo.auth,
        };

        const res = (await requestTotalMemberUpdateInfo(
          requestData,
        )) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
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
            message: '정보가 일괄 수정되었습니다.',
          });
          await getTorderMemberListData();
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 엑셀 다운로드 */
const postExcelDownload = async () => {
  try {
    if (torderPaginationInfo.total > 13000) {
      ElMessage({
        type: 'error',
        message:
          '다운로드 최대 건수를 초과하였습니다. 기간을 다시 설정해 주세요.(최대 건수: 1만3천 건)',
      });
      return;
    }

    excelDownloadState.value = true;
    const requestData = {
      searchStartDate: searchTorderInfo.searchDate
        ? searchTorderInfo.searchDate[0]
        : '',
      searchEndDate: searchTorderInfo.searchDate
        ? searchTorderInfo.searchDate[1]
        : '',
      searchDepartment: searchTorderInfo.searchDepartment,
      searchTxt: searchTorderInfo.searchTxt,
      searchAuth: searchTorderInfo.searchAuth,
      searchCorporation: searchTorderInfo.searchCorporation
        ? searchTorderInfo.searchCorporation?.join(';')
        : '',
      searchState: searchTorderInfo.searchState
        ? searchTorderInfo.searchState?.join(';')
        : '',
    };
    const requestURL = endpoints.excel.torder_member_list_download;
    await downloadExcelPostWithToken(
      '전체 회원 리스트',
      requestURL,
      requestData,
    );
    excelDownloadState.value = false;
  } catch (error) {
    console.log(error);
  }
};

/** 상세 검색 열기 닫기 상태값 */
const torderDetailSearchState = ref(false);
const openSearch = () => {
  torderDetailSearchState.value = true;
};
const closeSearch = () => {
  torderDetailSearchState.value = false;
};

// 법인 구분 전체 선택 체크박스 기능
const corporationAllCheckbox = ref(false);
const isIndeterminateCorporation = ref(true);
const corporationCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  corporationListData.value.forEach((cop) => allCheckArray.push(cop.code));
  searchTorderInfo.searchCorporation = val ? allCheckArray : [];
  isIndeterminateCorporation.value = false;
};
const checkedCorporationChange = (value: string[]) => {
  const checkedCount = value.length;
  corporationAllCheckbox.value =
    checkedCount === corporationListData.value.length;
  isIndeterminateCorporation.value =
    checkedCount > 0 && checkedCount < corporationListData.value.length;
};

// 계정 상태 전체 선택 체크박스 기능
const stateAllCheckbox = ref(false);
const isIndeterminateState = ref(true);
const stateCheckAllChange = (val: boolean) => {
  const allCheckArray: string[] = [];
  stateListData.value.forEach((state) => allCheckArray.push(state.code));
  searchTorderInfo.searchState = val ? allCheckArray : [];
  isIndeterminateState.value = false;
};
const checkedStateChange = (value: string[]) => {
  const checkedCount = value.length;
  stateAllCheckbox.value = checkedCount === stateListData.value.length;
  isIndeterminateState.value =
    checkedCount > 0 && checkedCount < stateListData.value.length;
};

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

/** 검색 데이터 페이지당 개수 */
const searchCount = [
  {
    value: 10,
    label: '10개씩 보기',
  },
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 30,
    label: '30개씩 보기',
  },
];

/** 페이지당 개수 변경시 데이터 재요청 */
const changePageSize = (value: number) => {
  torderPaginationInfo.perPage = value;
  getTorderMemberListData();
};

/** 내부 회원 페이지 검색 */
const setTorderQueryData = async () => {
  const searchData = {
    tabsIndex: 'torder',
    page: torderPaginationInfo.page,
    perPage: torderPaginationInfo.perPage,
    searchStartDate: searchTorderInfo.searchDate
      ? searchTorderInfo.searchDate[0]
      : '',
    searchEndDate: searchTorderInfo.searchDate
      ? searchTorderInfo.searchDate[1]
      : '',
    searchCorporationArray: getStringFunction(
      searchTorderInfo.searchCorporation,
    ),
    searchStateArray: getStringFunction(searchTorderInfo.searchState),
    searchAuth: searchTorderInfo.searchAuth,
    searchDepartment: searchTorderInfo.searchDepartment,
    searchTxt: searchTorderInfo.searchTxt,
  };
  pushPageWithQuery(totalMemberShipManage, searchData);
};

/** 검색하기 */
const getTorderSearchData = () => {
  torderPaginationInfo.page = 1;
  setTorderQueryData();
};

/** 초기화하기 */
const resetTorderSearchData = async () => {
  torderPaginationInfo.page = 1;
  torderPaginationInfo.perPage = 10;
  searchTorderInfo.searchCorporation = [];
  searchTorderInfo.searchState = [];
  searchTorderInfo.searchDate = [];
  searchTorderInfo.searchAuth = '';
  searchTorderInfo.searchDepartment = '';
  searchTorderInfo.searchTxt = '';

  await setTorderQueryData();
};

/** 페이지네이션 */
const torderHandlePage = (val: number) => {
  torderPaginationInfo.page = val;
  setTorderQueryData();
};

/** 목록표 높이 */
const getTorderTableHeight = () => {
  const parentsContainer = document.querySelector(
    '.default_layout_contents',
  ) as HTMLElement;
  let normalHeight = 340;
  let smallHeight = 240;
  if (parentsContainer) {
    const rect = parentsContainer.getBoundingClientRect().height;
    normalHeight = (rect / 100) * 55;
    smallHeight = (rect / 100) * 48;
  }
  return torderDetailSearchState.value ? smallHeight : normalHeight;
};

// v-for 방어 코드
const getCorporationKey = (corporation: selectBoxType, index: number) => {
  if (!corporation) return `corporation-${index}`;
  return corporation.code;
};
const getAuthKey = (auth: selectBoxType, index: number) => {
  if (!auth) return `auth${index}`;
  return auth.code;
};
const getStateDataKey = (state: selectBoxType, index: number) => {
  if (!state) return `state${index}`;
  return state.code;
};
const getDepartmentDataKey = (
  department: departmentListDataType,
  index: number,
) => {
  if (!department) return `department${index}`;
  return department.code;
};

const getDescContentWidth = computed(() => torderDetailSearchState.value ? '40%' : '90%');

getCorporationListData();
getDepartmentListData();
getAuthListData();
getStateListData();
getTorderMemberListData();
</script>

<template>
  <DetailTotalMemberShipModal
    v-if="flag.detailTotalMemberShip"
    :requestTorderMemberListData="() => getTorderMemberListData()"
  />
  <AddMemberShipModal
    v-if="flag.addMemberShip"
    :postMemberList="() => getTorderMemberListData()"
  />
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <BreadcrumbHeader :propsHeader="totalMemberShipHeader" />
    <el-button
      color="#000"
      @click="openModal(ADD_MEMBER_SHIP)"
    >
      어드민 ID 등록
    </el-button>
  </el-row>
  <div class="mb-10">
    <el-descriptions
      :column="torderDetailSearchState ? 2 : 1"
      border
    >
      <el-descriptions-item
        v-if="corporationListData.length > 0"
        class-name="member-ship-content"
        label="법인 구분"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-row>
          <el-checkbox
            v-model="corporationAllCheckbox"
            :indeterminate="isIndeterminateCorporation"
            @change="corporationCheckAllChange"
          >
            전체
          </el-checkbox>
          <el-checkbox-group
            v-model="searchTorderInfo.searchCorporation"
            class="ml-30"
            @change="checkedCorporationChange"
          >
            <el-checkbox
              v-for="(corporation, index) in corporationListData"
              :key="getCorporationKey(corporation, index)"
              :label="corporation.code"
            >
              {{ corporation.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="torderDetailSearchState"
        class-name="member-ship-content"
        label="부서명"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-select
          v-model="searchTorderInfo.searchDepartment"
          class="width-100"
          clearable
          placeholder="부서명을 선택해주세요."
        >
          <el-option
            v-for="(department, index) in departmentListData"
            :key="getDepartmentDataKey(department, index)"
            :label="department.name"
            :value="department.code"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="torderDetailSearchState"
        class-name="member-ship-content"
        label="권한명"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-select
          v-model="searchTorderInfo.searchAuth"
          class="width-100"
          clearable
          placeholder="권한을 선택해주세요."
        >
          <el-option
            v-for="(auth, index) in authListData"
            :key="getAuthKey(auth, index)"
            :label="auth.name"
            :value="auth.code"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="torderDetailSearchState"
        class-name="member-ship-content"
        label="계정 상태"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-row>
          <el-checkbox
            v-model="stateAllCheckbox"
            :indeterminate="isIndeterminateState"
            @change="stateCheckAllChange"
          >
            전체
          </el-checkbox>
          <el-checkbox-group
            v-model="searchTorderInfo.searchState"
            class="ml-30"
            @change="checkedStateChange"
          >
            <el-checkbox
              v-for="(state, index) in stateListData"
              :key="getStateDataKey(state, index)"
              :label="state.code"
            >
              {{ state.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="검색"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-input
          v-model="searchTorderInfo.searchTxt"
          placeholder="계정 ID 혹은 이름으로 검색할 수 있습니다."
          @keyup.enter="getTorderSearchData"
        />
      </el-descriptions-item>
      <el-descriptions-item
        v-if="torderDetailSearchState"
        class-name="member-ship-content"
        label="발급일"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <el-date-picker
          v-model="searchTorderInfo.searchDate"
          :shortcuts="dateShortcuts"
          end-placeholder="종료 일자"
          format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="시작 일자"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
      </el-descriptions-item>
    </el-descriptions>
  </div>
  <div class="member-ship-search-button">
    <div></div>
    <div class="member-ship-search-button-center">
      <el-button
        type="warning"
        @click="resetTorderSearchData"
      >
        초기화
      </el-button>
      <el-button
        type="primary"
        @click="getTorderSearchData"
      >
        검색
      </el-button>
    </div>
    <div class="member-ship-search-button-end">
      <el-button
        v-if="!torderDetailSearchState"
        size="small"
        @click="openSearch"
      >
        상세검색 열기
        <el-icon>
          <CaretBottom />
        </el-icon>
      </el-button>
      <el-button
        v-else
        size="small"
        @click="closeSearch"
      >
        상세 검색 닫기
        <el-icon>
          <CaretTop />
        </el-icon>
      </el-button>
    </div>
  </div>
  <p class="staff-search-table-title">검색목록</p>
  <el-divider class="member-ship-divider" />
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <p class="staff-search-count-info">
      총 <span>{{ torderPaginationInfo.total }}</span> 개의 검색결과가 있습니다.
    </p>
    <div class="staff-search-button-grid">
      <el-select
        v-model="collectiveDataInfo.state"
        class="width-100"
        clearable
        placeholder="일괄 적용할 계정 상태를 선택하세요."
      >
        <el-option
          v-for="(state, index) in stateListData"
          :key="getStateDataKey(state, index)"
          :label="state.name"
          :value="state.code"
        />
      </el-select>
      <el-select
        v-model="collectiveDataInfo.auth"
        class="width-100"
        clearable
        placeholder="일괄 적용할 권한 번호를 선택하세요."
      >
        <el-option
          v-for="(auth, index) in authListData"
          :key="getAuthKey(auth, index)"
          :label="auth.name"
          :value="auth.code"
        />
      </el-select>
      <el-button
        type="primary"
        @click="postUpdateMemberShipInfo"
      >
        수정 저장
      </el-button>
      <el-button
        v-if="!excelDownloadState"
        class="excel-download-button"
        type="success"
        @click="postExcelDownload"
      >
        엑셀 다운로드
      </el-button>
      <el-button
        v-else
        class="m-0"
        loading
        type="success"
      >
        다운로드중..
      </el-button>
      <el-select
        v-model="torderPaginationInfo.perPage"
        class="staff-search-button-select"
        @change="changePageSize"
      >
        <el-option
          v-for="count in searchCount"
          :key="count.value"
          :label="count.label"
          :value="count.value"
        />
      </el-select>
    </div>
  </el-row>
  <el-table
    ref="multipleTableRef"
    :data="torderMemberListData"
    :height="getTorderTableHeight()"
    border
    @selection-change="handleTorderSelect"
  >
    <el-table-column
      align="center"
      header-align="center"
      type="selection"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="NO"
      prop="no"
      width="100"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="법인명"
      prop="T_order_member_corporation_name"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="부서명"
      prop="T_order_member_Department"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="계정 ID"
      prop="T_order_id"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="계정 이름"
      prop="T_order_member_name"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="권한명"
      prop="T_order_auth"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="계정 상태"
      prop="T_order_member_state"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="발급일"
      prop="T_order_member_register_datetime"
    />
    <el-table-column
      align="center"
      header-align="center"
      label="상세"
    >
      <template #default="scope">
        <el-button
          type="info"
          @click="
            openModalWithData(DETAIL_TOTAL_MEMBERSHIP, scope.row.T_order_id)
          "
        >
          상세
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
      :current-page="torderPaginationInfo.page"
      :page-size="torderPaginationInfo.perPage"
      :total="torderPaginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="torderHandlePage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
:deep(.member-ship-label) {
  width: 10%;
}

:deep(.member-ship-content) {
  width: v-bind(getDescContentWidth);
}

.staff-search-table-title {
  font-size: 20px;
}

.staff-search-count-info {
  font-size: 15px;

  span {
    color: red;
  }
}

.staff-search-button-grid {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 65%;

  .staff-search-button-select {
    width: 60%;
  }

  .excel-download-button {
    margin: 0;
  }
}

.member-ship-search-button {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  margin-bottom: 10px;

  .member-ship-search-button-center {
    display: flex;
    justify-content: center;
  }

  .member-ship-search-button-end {
    display: flex;
    justify-content: end;
  }
}

.member-ship-divider {
  margin: 10px 0;
}
</style>
