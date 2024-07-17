<script lang="ts" setup>
import { reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, etcUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { selectBoxType, storeMemberListDataType } from '@interface/member';
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { DetailBusinessMemberShipModal } from '@containers';
import useExcelDownload from '@composables/excelDownload';
import { BreadcrumbHeader } from '@components';
import {
  BUSINESS_MEMBERSHIP_MANAGE,
  DETAIL_BUSINESS_MEMBER_SHIP,
  TOTAL_MEMBERSHIP_MANAGE,
} from '@common/string';
import { SHOP_ADMIN_URL } from '@common/envVariables';
import { memberCodec } from '@codecs';
import { endpoints, member, user } from '@apis';

const { flag, openModalWithData } = useModalStore();

const { runtimeCheck } = runtimeCheckHelper;
const {
  requestStateList,
  requestStoreMemberList,
  requestBusinessMemberUpdateInfo,
} = member;
const { requestLoginBusinessMember } = user;
const { departmentListCodec } = memberCodec;
const { failAuthenticationAlert, checkAuthFunction } = authentication;
const { replaceEmptyString } = etcUtils;
const { downloadExcelPostWithToken } = useExcelDownload();

const totalMemberShipHeader = reactive([
  { name: TOTAL_MEMBERSHIP_MANAGE },
  { name: BUSINESS_MEMBERSHIP_MANAGE },
]);

const activeTabsName = ref('business');

const excelDownloadState = ref(false);

const searchTorderInfo = reactive({
  searchTxt: '',
  searchState: '',
  searchDate: [],
  searchTestIdYN: '',
  searchFirstTimeLogin: '',
  approveState: '',
});

const paginationInfo = reactive({
  page: 1,
  pageSize: 20,
  from: 1,
  to: 10,
  total: 0,
});

const collectiveDataInfo = ref('');

/** 테이블 체크박스 데이터 */
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const torderCheckboxData: Ref<storeMemberListDataType[]> = ref([]);
const handleTorderSelect = (val: any) => {
  torderCheckboxData.value = val;
};

/** 검색 데이터 페이지당 개수 */
const searchCount = [
  {
    value: 20,
    label: '20개씩 보기',
  },
  {
    value: 30,
    label: '30개씩 보기',
  },
];

const dateOption: Ref<string> = ref('create');

/** 일자 셀렉트 값 */
const dateOptions = [
  {
    value: 'create',
    label: '계정 발급일',
  },
  {
    value: 'last_login',
    label: '마지막 로그인',
  },
];
/** 비즈니스 회원 리스트 */
const businessMemberList = ref<storeMemberListDataType[]>([]);
/** 비즈니스 회원 리스트 불러오기 */
const postRequestBusinessMemberList = async () => {
  const requestData = {
    page: paginationInfo.page,
    perPage: paginationInfo.pageSize,
    searchState: searchTorderInfo.searchState,
    searchTxt: searchTorderInfo.searchTxt,
    searchDateType: dateOption.value,
    searchStartDate: searchTorderInfo.searchDate[0],
    searchEndDate: searchTorderInfo.searchDate[1],
    searchTestIdYN: searchTorderInfo.searchTestIdYN,
    searchFirstTimeLogin: searchTorderInfo.searchFirstTimeLogin,
    approveState: searchTorderInfo.approveState,
  };

  try {
    const res = (await requestStoreMemberList(requestData)) as AxiosResponse;
    const typeError = runtimeCheck(departmentListCodec, res.data);

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
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.pageSize = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
        businessMemberList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비즈니스 회원 정보 변경 */
const postUpdateMemberShipInfo = async () => {
  const requestData = {
    checkedNum: torderCheckboxData.value.map((account) => account.no),
    T_order_member_state: collectiveDataInfo.value,
  };

  try {
    const res = (await requestBusinessMemberUpdateInfo(
      requestData,
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
      await postRequestBusinessMemberList();
      ElMessage({
        type: 'success',
        message: '정보가 수정되었습니다.',
      });
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
        stateListData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 엑셀 다운로드 */
const postExcelDownload = async () => {
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
      searchState: searchTorderInfo.searchState,
      searchTxt: searchTorderInfo.searchTxt,
      searchStartDate: searchTorderInfo.searchDate[0],
      searchEndDate: searchTorderInfo.searchDate[1],
      searchTestIdYN: searchTorderInfo.searchTestIdYN,
      searchFirstTimeLogin: searchTorderInfo.searchFirstTimeLogin,
    };

    await downloadExcelPostWithToken(
      '비즈니스 회원 리스트',
      endpoints.excel.store_member_list_download,
      requestData,
    );
  } catch (error) {
    console.log(error);
  } finally {
    excelDownloadState.value = false;
  }
};

/** 점주어드민 페이지 이동 */
const openShopAdminPage = async (info: storeMemberListDataType) => {
  const requestData = {
    T_order_store_name: info.T_order_store_name,
    T_order_store_code: info.T_order_store_code,
    T_order_id: info.T_order_id,
  };

  try {
    const res = (await requestLoginBusinessMember(
      requestData,
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
      window.open(`${SHOP_ADMIN_URL}/#?jwt=${res.data.jwt}`, '_blank');
    }
  } catch (error) {
    console.log(error);
  }
};

/** 검색하기 */
const getSearchData = async () => {
  paginationInfo.page = 1;
  postRequestBusinessMemberList();
};

/** 페이지네이션 */
const handleCurrentPage = (val: number) => {
  paginationInfo.page = val;
  postRequestBusinessMemberList();
};

const resetTorderSearchData = async () => {
  paginationInfo.page = 1;
  paginationInfo.pageSize = 20;
  searchTorderInfo.searchState = '';
  searchTorderInfo.searchDate = [];
  searchTorderInfo.searchTxt = '';
  searchTorderInfo.searchTestIdYN = '';
  searchTorderInfo.searchFirstTimeLogin = '';

  await postRequestBusinessMemberList();
};

const convertFirstLoginState = (firstLoginState: string) =>
  firstLoginState === 'Y' ? '완료' : '미완료';

// v-for 방어 코드
const getStateDataKey = (state: selectBoxType, index: number) => {
  if (!state) return `state${index}`;
  return state.code;
};

postRequestBusinessMemberList();
getStateListData();
</script>

<template>
  <DetailBusinessMemberShipModal
    v-if="flag.detailBusinessMemberShip"
    :postRequestBusinessMemberList="() => postRequestBusinessMemberList()"
  />
  <BreadcrumbHeader :propsHeader="totalMemberShipHeader" />
  <el-tabs
    v-model="activeTabsName"
    stretch
    type="border-card"
  >
    <el-tab-pane
      class="tabs"
      label="개인매장 회원"
      name="business"
    >
      <el-descriptions
        :column="2"
        border
        class="mb-10 width-100"
        min-width="50%"
      >
        <el-descriptions-item
          label="계정 구분"
          label-align="center"
        >
          <el-radio-group v-model="searchTorderInfo.searchTestIdYN">
            <el-radio label=""> 전체</el-radio>
            <el-radio label="N"> N(운영)</el-radio>
            <el-radio label="Y"> Y(테스트)</el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item
          label="계정 상태"
          label-align="center"
        >
          <el-radio-group v-model="searchTorderInfo.searchState">
            <el-radio label=""> 전체</el-radio>
            <el-radio label="1"> 등록</el-radio>
            <el-radio label="2"> 정지</el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item
          label="검색"
          label-align="center"
        >
          <el-input
            v-model="searchTorderInfo.searchTxt"
            placeholder="검색 범위 : 매장명 / 매장 코드 / 매장 ID"
            @keyup.enter="getSearchData"
          />
        </el-descriptions-item>
        <el-descriptions-item
          :span="2"
          label="날짜"
          label-align="center"
        >
          <el-row>
            <el-select
              v-model="dateOption"
              class="mr-5"
              placeholder="Select"
            >
              <el-option
                v-for="date in dateOptions"
                :key="date.value"
                :label="date.label"
                :value="date.value"
              />
            </el-select>
            <el-date-picker
              v-model="searchTorderInfo.searchDate"
              class="flex-1"
              end-placeholder="종료 일자"
              format="YYYY-MM-DD"
              range-separator="~"
              start-placeholder="시작 일자"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          label="최초 로그인 여부"
          label-align="center"
        >
          <el-radio-group v-model="searchTorderInfo.searchFirstTimeLogin">
            <el-radio label=""> 전체</el-radio>
            <el-radio label="Y"> 완료</el-radio>
            <el-radio label="N"> 미완료</el-radio>
          </el-radio-group>
        </el-descriptions-item>
        <el-descriptions-item
          label="통합 인증"
          label-align="center"
        >
          <el-radio-group
            v-model="searchTorderInfo.approveState"
            class="search-item-width"
          >
            <el-radio label=""> 전체</el-radio>
            <el-radio label="1"> 승인</el-radio>
            <el-radio label="0"> 미승인</el-radio>
          </el-radio-group>
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
          @click="resetTorderSearchData"
        >
          초기화
        </el-button>
      </el-row>
      <p class="staff-search-table-title">검색목록</p>
      <el-divider class="member-ship-divider" />
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <p class="staff-search-count-info">
          총
          <span>
            {{ paginationInfo.total }}
          </span>
          개의 검색결과가 있습니다.
        </p>
        <div class="staff-search-button-container">
          <el-select
            v-model="collectiveDataInfo"
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
            class="excel-download-button"
            loading
            type="success"
          >
            다운로드중..
          </el-button>
          <el-select
            v-model="paginationInfo.pageSize"
            class="page-count-select-box"
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
        :data="businessMemberList"
        :height="1000"
        border
        class="mb-10"
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
          width="80"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="매장명"
          min-width="190"
        >
          <template #default="{ row }">
            <el-row justify="center">
              <div class="ellipsis-text-1">
                {{ row.T_order_origin_store_name }}
              </div>
              <el-tag
                v-if="row.test_store_use === 'Y'"
                class="ml-5"
                effect="dark"
                round
                size="small"
                type="danger"
              >
                test
              </el-tag>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="지점"
          min-width="190"
          prop="T_order_area_name"
        />
        <el-table-column
          align="center"
          header-align="center"
          prop="T_order_id"
          width="140"
        >
          <template #header>
            <p>매장 ID</p>
            <p>(마스터, 어드민)</p>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="권한"
          prop="T_order_auth"
          width="130"
        />
        <el-table-column
          align="center"
          header-align="center"
          label="계정 상태"
          width="95"
        >
          <!-- 2403 비즈니스 회원의 경우 등록/정지로 표기 변경 -->
          <template #default="{ row }">
            {{
              row.T_order_member_state === '승인'
                ? '등록'
                : row.T_order_member_state
            }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="통합 인증"
          width="100"
        >
          <template #default="{ row }">
            {{ row.approveState === '1' ? '승인' : '미승인' }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="상세"
          width="100"
        >
          <template #default="scope">
            <el-button
              type="info"
              @click="
                openModalWithData(
                  DETAIL_BUSINESS_MEMBER_SHIP,
                  scope.row.T_order_id,
                )
              "
            >
              상세
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkAuthFunction('F5001')"
          align="center"
          header-align="center"
          label="점주어드민"
          width="100"
        >
          <template #default="{ row }">
            <el-button
              type="danger"
              @click="openShopAdminPage(row)"
            >
              이동
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="이용약관"
          prop="T_order_member_state"
          width="95"
        >
          <template #default="{ row }">
            <div>
              {{ row.term_agree === 'Y' ? '동의' : '미동의' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="최초 로그인"
          width="100"
        >
          <template #default="{ row }">
            {{ convertFirstLoginState(row.first_login) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="최근 로그인"
          width="115"
        >
          <template #default="{ row }">
            {{ replaceEmptyString(row.T_order_member_login_datetime) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          header-align="center"
          label="계정 발급일"
          width="115"
        >
          <template #default="{ row }">
            {{ replaceEmptyString(row.T_order_member_register_datetime) }}
          </template>
        </el-table-column>
      </el-table>
      <el-row justify="center">
        <el-pagination
          :current-page="paginationInfo.page"
          :page-size="paginationInfo.pageSize"
          :total="paginationInfo.total"
          background
          layout="prev, pager, next"
          @current-change="handleCurrentPage"
        />
      </el-row>
    </el-tab-pane>
    <el-tab-pane
      disabled
      label="비즈니스 매니저 회원"
      name="franchise"
    >
      <!-- 추후 업데이트 예정 -->
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__label) {
  width: 10%;
}

:deep(.el-descriptions__content) {
  width: 40%;
}

.confirm-button {
  width: 120px;
}

.staff-search-table-title {
  font-size: 20px;
}

.member-ship-divider {
  margin: 10px 0px;
}

.staff-search-count-info {
  font-size: 15px;

  span {
    font-size: 17px;
    color: red;
  }
}

.staff-search-button-container {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: end;
  width: 50%;

  .excel-download-button {
    width: 120px;
    margin: 0;
  }
}

.page-count-select-box {
  width: 50%;
}
</style>
