<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { h, reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import { AxiosResponse } from 'axios';
import { etcUtils, formattingUtils } from '@utils/index';
import useModalStore from '@store/storeModal';
import {
  memberRegisterApproveModalDataType,
  memberRegisterDetailType,
  memberRegisterSearchStoreInfoType,
  requestUpdateRegisterStateType,
} from '@interface/memberRegister';
import { ZoomIn } from '@element-plus/icons-vue';
import { MemberRegisterHistoryModal, MemberRegisterStoreMatchingModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  MEMBER_REGISTER_HISTORY,
  MEMBER_REGISTER_MANAGE,
  MEMBER_REGISTER_MANAGE_DETAIL,
  MEMBER_REGISTER_SINGLE_STORE_INFO,
  SYSTEM_CONTROL,
} from '@common/string';
import { requestForcedStoreList } from '@apis/memberRegister';
import { memberRegister } from '@apis';

const { replaceEmptyString } = etcUtils;
const { flag, openModal, openModalWithData, closeModal } = useModalStore();
const {
  maskAllNumber,
  isAllMasked,
  formatTaxId,
  formatPhoneNumber,
} = formattingUtils;
const {
  requestMemberRegister,
  requestUpdateMemberRegisterState,
} = memberRegister;

const headerProp = reactive([{ name: SYSTEM_CONTROL }, { name: MEMBER_REGISTER_MANAGE }, { name: MEMBER_REGISTER_MANAGE_DETAIL }]);

const route = useRoute();
const registerId = ref(route.query?.registerId as string || '');

const applyInfo: Ref<memberRegisterDetailType> = ref(
  {} as memberRegisterDetailType,
);
const searchStoreList: Ref<memberRegisterSearchStoreInfoType[]> = ref([]);
const isLoadingStores = ref(true);

const searchingType: Ref<'matching' | 'forced'> = ref('matching');

/** 리스트 중 선택한 매장 정보 * */
const selectedStoreInfo: Ref<memberRegisterSearchStoreInfoType> = ref({
  info: {
    taxId: '',
    userTel: '',
    torderId: '',
    userName: '',
    storeName: '',
    storeAreaName: '',
  },
  checker: {
    taxId: '',
    userTel: '',
    torderId: '',
    userName: '',
    storeName: '',
    storeAreaName: '',
  },
  storeCode: '',
});

/** 매장리스트 결과 내 검색 키워드  * */
const withinSearchTxt = ref('');

/** 통합 인증 승인 요청 상세 정보 호출 * */
const getRegisterMatchingInfo = async (withinSearchTxt?: string) => {
  searchStoreList.value = [];
  try {
    isLoadingStores.value = true;
    const data = {
      id: Number(registerId.value),
      withinSearchTxt,
    };
    const res = (await requestMemberRegister(data)) as AxiosResponse;

    searchStoreList.value = [];
    applyInfo.value = res.data.data;
    applyInfo.value.displayTaxId = maskAllNumber(formatTaxId(applyInfo.value.taxId));
    applyInfo.value.displayUserTel = maskAllNumber(formatPhoneNumber(applyInfo.value.userTel));

    if (applyInfo.value.matchingStoreInfo?.length > 0) {
      applyInfo.value.matchingStoreInfo[0].displayTaxId = maskAllNumber(formatTaxId(applyInfo.value.matchingStoreInfo[0].taxId));
      applyInfo.value.matchingStoreInfo[0].displayUserTel = maskAllNumber(formatPhoneNumber(applyInfo.value.matchingStoreInfo[0].userTel));
    }

    const searchStoreInfo = res.data.data?.searchStoreInfo;
    Object.keys(searchStoreInfo).forEach((storeCode: string) => {
      const item: memberRegisterSearchStoreInfoType = {
        ...searchStoreInfo[storeCode],
        storeCode,
      };
      item.info.flagTaxIdMasking = true;
      item.info.displayTaxId = maskAllNumber(formatTaxId(item.info.taxId));
      searchStoreList.value.push(item);
    });

    // 개별 매장 팝업이 띄워진 경우, 선택된 매장 정보 업데이트
    if (selectedStoreInfo.value.storeCode) {
      const openedStore = searchStoreList.value?.find((store) => store.storeCode === selectedStoreInfo.value.storeCode);
      if (openedStore) {
        selectedStoreInfo.value = openedStore;
      }
    }
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
    isLoadingStores.value = false;
  }
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

/**
 * ElMessageBox.confirm 의 커스텀된 타이틀 스타일
 * @param {'red' | 'blue'} color 표현할 color
 * @return {string} 커스텀된 스타일 string
 * */
const getConfirmTitleStyle = (color: 'red' | 'blue'): string => {
  let colorName = '';
  if (color === 'red') colorName = '--el-color-danger';
  if (color === 'blue') colorName = '--el-color-primary-dark-2';

  return `font-weight: 900; color: var(${colorName}); margin-bottom: 15px`;
};

const rejectReasonOptionList: { label: string; type: number }[] = [
  {
    label: '매장 정보 불일치',
    type: 0,
  },
  {
    label: '티오더 미이용 매장',
    type: 1,
  },
  {
    label: '이미 연동된 매장',
    type: 2,
  },
  {
    label: '기타',
    type: 3,
  },
];

/** 신청 거절/승인 시 상세사유 modal data * */
const approveModalData: memberRegisterApproveModalDataType = reactive({
  isOpen: false,
  fromTotal: false,
  approveState: 0,
  approveType: undefined,
  disapproveReasonList: rejectReasonOptionList,
  message: {
    title: '',
    titleElType: 'danger',
    msgArr: [],
    memo: '',
    memoPlaceholder: '',
    memoBytes: 0,
  },
  onDismiss: () => {
  },
  onSubmit: () => {
  },
});

/**
 * 신청 정보 승인 상태 관리: 승인, 보류, 거절, 매칭 취소
 *  @param statePayload 승인 타입 값
 * */
const putMemberRegisterStateUpdate = async (statePayload: requestUpdateRegisterStateType) => {
  try {
    await requestUpdateMemberRegisterState(statePayload);

    if (approveModalData.isOpen) approveModalData.isOpen = false;
    if (flag.memberRegisterSingleStoreInfo) closeModal(MEMBER_REGISTER_SINGLE_STORE_INFO);
    ElMessage({
      message: '왼료되었습니다.',
      type: 'success',
    });
    await getRegisterMatchingInfo();
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

/** 매칭 취소 버튼 클릭 시 확인 팝업 * */
const onClickMatchingCancel = () => {
  ElMessageBox.confirm(
    h('div', { style: 'display: flex; flex-direction: column;', class: 'font-thin' }, [
      h('span', null, '매칭 된 매장 연결을 취소합니다.'),
      h('p', null, '통합 인증 승인 요청 건과 매장을 오 매칭 한 경우에만 사용해주세요.'),
      h('p', null, '오매칭 해제 후 원 해당 승인정보로 이후 업무 진행바랍니다.'),
    ]),
    undefined,
    {
      confirmButtonText: '계속',
      cancelButtonText: '뒤로',
    },
  ).then(() => {
    ElMessageBox.confirm(
      h('div', { style: 'display: flex; flex-direction: column;' }, [
        h('span', { style: getConfirmTitleStyle('red') }, '주의! 매장 매칭이 취소(연결 해제) 됩니다.'),
        h('p', null, '[확인] 버튼 클릭 시 매칭 된 매장 연결이 해제됩니다.'),
        h('p', null, '진행을 취소 하시려면 [취소] 버튼을 눌러주세요.'),
      ]),
      undefined,
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'error',
      },
    ).then(() => {
      const cancelPayload: requestUpdateRegisterStateType = {
        id: Number(registerId.value),
        approveState: 0, // 매칭 취소 시 항상 0
        approveType: 5, // 매칭 취소 시 항상 5
      };
      putMemberRegisterStateUpdate(cancelPayload);
    });
  });
};

/**
 * 80바이트 미만의 문자열만 리턴
 * @param {string} inputText - 계산 대상 문자열
 * @return {string} UTF 기반 80바이트 미만의 문자열
 */
const calculateMemoBytes = (inputText: string): string => {
  const encodedBytes = new TextEncoder().encode(inputText);

  if (encodedBytes.length <= 80) {
    return inputText;
  }

  let truncatedText = '';
  let byteLength = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < inputText.length; i++) {
    const charBytes = new TextEncoder().encode(inputText[i]);
    if (byteLength + charBytes.length <= 80) {
      truncatedText += inputText[i];
      byteLength += charBytes.length;
    } else {
      break;
    }
  }

  return truncatedText;
};

/**
 * 거절 모달 - 상세 내용 입력 내용 80byte 제한
 * @param {string} inputText - input 태그에 입력된 문자열
 */
const inputDisapproveMemo = (inputText: string) => {
  approveModalData.message.memo = calculateMemoBytes(inputText);
  approveModalData.message.memoBytes = new TextEncoder().encode(approveModalData.message.memo).length;
};

/** 상세사유 modal close 시 data 초기화 * */
const resetApproveModalData = () => {
  approveModalData.isOpen = false;
  approveModalData.fromTotal = false;
  approveModalData.approveState = undefined;
  approveModalData.approveType = undefined;
  approveModalData.message.title = '';
  approveModalData.disapproveReasonList = rejectReasonOptionList;
  approveModalData.message.titleElType = 'danger';
  approveModalData.message.msgArr = [];
  approveModalData.message.memo = '';
  approveModalData.message.memoBytes = 0;
  approveModalData.onDismiss = () => {
  };
  approveModalData.onSubmit = () => {
  };
};

/** 신청 거절 종류에 따른 컨펌창 * */
const showDisapprovalConfirmByApproveType = () => {
  // 처리 불가: '기타'이면서 상세 사유 없는 경우
  if (approveModalData.approveType === undefined) {
    // 거절 사유(approveType) 미선택
    ElMessageBox.confirm(h('div', { style: 'display: flex; flex-direction: column;' }, [
      h('span', { style: getConfirmTitleStyle('red') }, '거절 사유 미선택!'),
      h('p', null, '거절 사유가 없는 경우 승인 거절이 불가합니다.'),
      h('p', null, '사유를 선택해 주세요.'),
      h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
    ]));
    return;
  }
  if (approveModalData.approveType === 3 && approveModalData.message.memo === '') {
    ElMessageBox.confirm(h('div', { style: 'display: flex; flex-direction: column;' }, [
      h('span', { style: getConfirmTitleStyle('red') }, '처리 불가!'),
      h('p', null, '상세내용을 입력해주세요.'),
      h('p', null, '기타 선택 시 상세내용 입력은 필수입니다.'),
      h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
    ]));
    return;
  }

  // 거절 사유(approveType) 에 따른 컨펌 메시지
  let confirmMessageData;
  if (approveModalData.approveType === 3) {
    // '기타' && 상세설명 O
    confirmMessageData = h('div', { style: 'display: flex; flex-direction: column;' }, [
      h('span', { style: getConfirmTitleStyle('red') }, '기타를 선택하셨습니다.'),
      h('p', { style: 'word-break: break-all;' }, `{${approveModalData.message.memo}}`),
      h('p', { style: getConfirmTitleStyle('red') }, '위 사유로 승인이 거절 되었습니다.'),
      h('p', null, '확인 버튼 클릭 시 상세 내용으로 승인 거절 처리 및'),
      h('p', null, '고객에게 {메시지/알림톡} 이 발송 됩니다.'),
      h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
    ]);
  } else {
    const rejectReasonTxt = rejectReasonOptionList.find((reasonItem) => reasonItem.type === approveModalData.approveType)?.label ?? '';
    confirmMessageData = h('div', { style: 'display: flex; flex-direction: column;' }, [
      h('span', { style: getConfirmTitleStyle('red') }, `${rejectReasonTxt}`),
      h('p', null, '확인 버튼 클릭 시 선택 사유로 승인 거절 처리 및'),
      h('p', null, '고객에게 {메시지/알림톡} 이 발송 됩니다.'),
      h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
    ]);
  }

  ElMessageBox.confirm(confirmMessageData).then(() => {
    const disapprovalPayload: requestUpdateRegisterStateType = {
      id: Number(registerId.value),
      approveState: 2, // 거절 항상 2
      storeCode: selectedStoreInfo.value.storeCode ?? '',
      approveType: approveModalData.approveType,
      approveMemo: approveModalData.message.memo,
    };
    putMemberRegisterStateUpdate(disapprovalPayload);
  });
};

/** 신청 정보 거절: 상세사유 modal 출력 * */
const openDisapprovalModal = (fromTotal?: boolean) => {
  approveModalData.fromTotal = !!fromTotal; // 일괄 거절인 경우 true
  approveModalData.approveState = 2;
  approveModalData.message.title = '승인 거절';

  if (fromTotal) {
    approveModalData.disapproveReasonList = rejectReasonOptionList.filter((reason) => reason.type > 0);
  } else {
    approveModalData.disapproveReasonList = rejectReasonOptionList;
  }
  approveModalData.message.titleElType = 'danger';
  approveModalData.message.msgArr = [
    '거절 사유가 없는 경우 승인 거절이 불가합니다.',
    '사유 선택 후 확인 버튼을 눌러주세요.',
    '전 단계로 가시려면 [취소] 버튼을 눌러주세요.',
  ];
  approveModalData.onDismiss = () => {
    resetApproveModalData();
  };
  approveModalData.onSubmit = () => {
    showDisapprovalConfirmByApproveType();
  };
  approveModalData.isOpen = true;
};

/** 신청 정보 승인: 상세사유 modal 출력* */
const openApprovalModal = () => {
  // 불일치 정보 개수
  const diffCount = Object.values(selectedStoreInfo.value.checker)?.filter((data: string) => data === 'diff')?.length ?? 0;

  if (diffCount > 0) {
    approveModalData.message.title = '매장 정보 불일치!!';
    approveModalData.message.titleElType = 'danger';
    approveModalData.message.msgArr = [
      `${diffCount} 정보가 불일치 합니다. 계속 진행 하시겠습니까?`,
      '확인 버튼 클릭 시 승인이 완료됩니다.',
      '전 단계로 가시려면 [취소] 버튼을 눌러주세요.',
    ];
  } else {
    approveModalData.message.title = '모든 매장 정보 일치!!';
    approveModalData.message.titleElType = 'primary';
    approveModalData.message.msgArr = [
      '[확인]버튼 클릭 시 통합 인증 승인이 완료됩니다.',
      '(고객 {메시지/알림톡} 발송.)',
      '전 단계로 가시려면 [취소] 버튼을 눌러주세요.',
    ];
  }

  approveModalData.onDismiss = () => {
    resetApproveModalData();
  };
  approveModalData.onSubmit = () => {
    const approvalPayload: requestUpdateRegisterStateType = {
      id: Number(registerId.value),
      approveState: 1,
      storeCode: selectedStoreInfo.value.storeCode ?? '',
      torderId: selectedStoreInfo.value.info.torderId,
      approveType: approveModalData.approveType,
      approveMemo: approveModalData.message.memo,
    };
    putMemberRegisterStateUpdate(approvalPayload);
  };
  approveModalData.isOpen = true;
};

/** 신청 보류: 상세사유 modal 단계 생략 * */
const requestHoldingState = () => {
  ElMessageBox.confirm(h('div', { style: 'display: flex; flex-direction: column;' }, [
    h('span', { style: getConfirmTitleStyle('red') }, '가입 보류를 선택하셨습니다.'),
    h('p', null, '티오더 계약 완료, 매장 설치 전 매장으로'),
    h('p', null, '승인 대기 상태로 전환됩니다.'),
    h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
  ])).then(() => {
    const holdingPayload: requestUpdateRegisterStateType = {
      id: Number(registerId.value),
      approveState: 2, // 보류는 거절의 종류
      approveType: 4,
    };
    putMemberRegisterStateUpdate(holdingPayload);
  });
};

/** 강제매칭 매장 불러오기: 검색 키워드 * */
const forcedMatchingTxt = ref('');

/** 강제매칭 매장 불러오기 * */
const getForcedStoreList = async (withinSearchTxt?: string) => {
  try {
    isLoadingStores.value = true;
    const data = {
      id: Number(registerId.value),
      searchTxt: forcedMatchingTxt.value,
      withinSearchTxt,
    };
    const res = (await requestForcedStoreList(data)) as AxiosResponse;

    searchStoreList.value = [];
    applyInfo.value = res.data.data;
    const searchStoreInfo = res.data.data?.searchStoreInfo;
    Object.keys(searchStoreInfo).forEach((storeCode: string) => {
      const item: memberRegisterSearchStoreInfoType = {
        ...searchStoreInfo[storeCode],
        storeCode,
      };
      item.info.flagTaxIdMasking = true;
      item.info.displayTaxId = maskAllNumber(formatTaxId(item.info.taxId));
      searchStoreList.value.push(item);
    });
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
    isLoadingStores.value = false;
  }
};

const onClickForcedMatching = () => {
  ElMessageBox.confirm(
    h('div', { style: 'display: flex; flex-direction: column;' }, [
      h('div', { class: 'mt-10 mb-10' }, [
        h('span', { style: getConfirmTitleStyle('blue') }, `${forcedMatchingTxt.value}`),
        h('span', null, ' 을/를 입력하셨습니다.'),
      ]),
      h('p', { class: 'mt-10' }, '위 매장정보로 불러오기 하시겠습니까?'),
    ]),
    undefined,
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
    },
  ).then(() => {
    searchingType.value = 'forced'; // 결과 내 검색 시 api 구분을 위해 설정
    getForcedStoreList();
  });
};

/** 매장 리스트 결과 내 검색 * */
const onClickInnerSearching = () => {
  if (searchingType.value === 'matching') getRegisterMatchingInfo(withinSearchTxt.value);
  else if (searchingType.value === 'forced') getForcedStoreList(withinSearchTxt.value);
};

/** 강제 매칭 검색 초기화 * */
const onClickResetSearchData = () => {
  // 검색어 제거
  forcedMatchingTxt.value = '';
  withinSearchTxt.value = '';
  searchingType.value = 'matching';
  getRegisterMatchingInfo();
};

/** 매장리스트 내 기매칭여부 텍스트  * */
const getMatchingStatusTextInList = (storeMatched: 'Y' | 'N') => storeMatched === 'Y' ? '매칭완료' : '-';
/** 매장리스트 내 기매칭여부 스타일  * */
const getMatchingStatusStyleInList = (storeMatched: 'Y' | 'N') => storeMatched === 'Y' ? 'danger' : '';

/** 매장리스트 중 특정 매장 선택 * */
const showSingleStoreDetailModal = (row: any) => {
  selectedStoreInfo.value = row;
  openModal(MEMBER_REGISTER_SINGLE_STORE_INFO);
};

/** 마스킹 토글: 요청정보 - 휴대전화번호 * */
const toggleMaskingApplyUserTel = () => {
  if (applyInfo.value.displayUserTel === '-') return;

  const originalUserTel = formatPhoneNumber(applyInfo.value.userTel);
  const isDisplayingMasked = isAllMasked(applyInfo.value.displayUserTel);

  if (isDisplayingMasked) applyInfo.value.displayUserTel = originalUserTel;
  else applyInfo.value.displayUserTel = maskAllNumber(originalUserTel);
};

/** 마스킹 토글: 요청정보 - 사업자등록정보 * */
const toggleMaskingApplyTaxId = () => {
  if (applyInfo.value.displayTaxId === '-') return;

  const originalTaxId = formatTaxId(applyInfo.value.taxId);
  const isDisplayingMasked = isAllMasked(applyInfo.value.displayTaxId);

  if (isDisplayingMasked) applyInfo.value.displayTaxId = originalTaxId;
  else applyInfo.value.displayTaxId = maskAllNumber(originalTaxId);
};

/** 마스킹 토글: 매칭정보 - 휴대전화번호 * */
const toggleMaskingMatchingUserTel = () => {
  const isBlankMatchingUserTel = applyInfo.value.matchingStoreInfo.length > 0 ? applyInfo.value.matchingStoreInfo?.[0].displayUserTel === '-' : true;
  if (isBlankMatchingUserTel) return;

  const originalUserTel = formatPhoneNumber(applyInfo.value.matchingStoreInfo[0].userTel);
  const isDisplayingMasked = isAllMasked(applyInfo.value.matchingStoreInfo?.[0].displayUserTel);

  if (isDisplayingMasked) applyInfo.value.matchingStoreInfo[0].displayUserTel = originalUserTel;
  else applyInfo.value.matchingStoreInfo[0].displayUserTel = maskAllNumber(originalUserTel);
};

/** 마스킹 토글: 매칭정보 - 사업자등록정보 * */
const toggleMaskingMatchingTaxId = () => {
  const isBlankMatchingTaxId = applyInfo.value.matchingStoreInfo.length > 0 ? applyInfo.value.matchingStoreInfo?.[0].displayTaxId === '-' : true;
  if (isBlankMatchingTaxId) return;

  const originalTaxId = formatPhoneNumber(applyInfo.value.matchingStoreInfo[0].taxId);
  const isDisplayingMasked = isAllMasked(applyInfo.value.matchingStoreInfo?.[0].displayTaxId);

  if (isDisplayingMasked) applyInfo.value.matchingStoreInfo[0].displayTaxId = originalTaxId;
  else applyInfo.value.matchingStoreInfo[0].displayTaxId = maskAllNumber(originalTaxId);
};

getRegisterMatchingInfo();
</script>

<template>
  <MemberRegisterStoreMatchingModal
    v-if="flag.memberRegisterSingleStoreInfo"
    :applyInfo="applyInfo"
    :getRegisterMatchingInfo="getRegisterMatchingInfo"
    :openApprovalModal="openApprovalModal"
    :openDisapprovalModal="openDisapprovalModal"
    :registerId="Number(registerId) || 0"
    :requestHoldingState="requestHoldingState"
    :selectedStoreInfo="selectedStoreInfo"
  />
  <MemberRegisterHistoryModal
    v-if="flag.memberRegisterHistory"
  />
  <el-dialog
    v-model="approveModalData.isOpen"
    align-center
    width="400px"
    @close="resetApproveModalData"
  >
    <div class="flex-col">
      <el-text
        :type="approveModalData.message.titleElType"
        size="large"
      >
        {{ approveModalData.message.title }}
      </el-text>
      <div class="mt-20 mb-10">
        <p
          v-for="(msg, index) in approveModalData.message.msgArr"
          :key="`modal-msg-${index}`"
          class="font-thin mt-5"
        >
          {{ msg }}
        </p>
      </div>
      <el-select
        v-if="approveModalData.approveState === 2"
        v-model="approveModalData.approveType"
        :style="{ width: '280px' }"
        class="mb-5"
        placeholder="승인 거절 사유를 선택해주세요"
      >
        <el-option
          v-for="(item, index) in approveModalData.disapproveReasonList"
          :key="`reject-reason-${index}`"
          :label="item.label"
          :value="item.type"
        />
      </el-select>
      <el-row align="bottom">
        <el-input
          v-if="approveModalData.approveState !== 4"
          v-model="approveModalData.message.memo"
          :style="{ width: '280px' }"
          placeholder="상세 내용을 입력해주세요"
          @input="inputDisapproveMemo"
        />

        <el-row
          align="middle"
          class="ml-10 mb-10 font-thin font-small approve-memo-byte-wrapper"
          justify="end"
        >
          <span>
            {{ approveModalData.message.memoBytes }}
          </span>
          / 80byte
        </el-row>
      </el-row>
    </div>
    <template #footer>
      <el-button @click="approveModalData.onDismiss">
        취소
      </el-button>
      <el-button
        type="primary"
        @click="approveModalData.onSubmit"
      >
        확인
      </el-button>
    </template>
  </el-dialog>
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
        style="max-width: 500px; max-height: 700px;"
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
  <div class="mt-10">
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <p>
        | 요청 정보
      </p>
      <el-button
        type="success"
        @click="openModalWithData(MEMBER_REGISTER_HISTORY, { registerId })"
      >
        수정 이력
      </el-button>
    </el-row>
    <el-descriptions
      :column="7"
      border
      class="font-thin mb-20 width-100"
      direction="vertical"
    >
      <el-descriptions-item
        align="center"
        label="매장명"
        label-align="center"
        width="20%"
      >
        {{ replaceEmptyString(applyInfo.storeName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="지점"
        label-align="center"
        width="14%"
      >
        {{ replaceEmptyString(applyInfo.storeAreaName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="대표자명"
        label-align="center"
        width="15%"
      >
        {{ replaceEmptyString(applyInfo.userName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="휴대전화번호"
        label-align="center"
        width="12%"
      >
        <p @click="toggleMaskingApplyUserTel">
          {{ applyInfo.displayUserTel }}
        </p>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="매장 ID"
        label-align="center"
        width="12%"
      >
        {{ replaceEmptyString(applyInfo.torderId) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="사업자등록정보"
        label-align="center"
        width="15%"
      >
        <el-row justify="space-between">
          <span
            class="flex-1 register-info-taxId"
            @click="toggleMaskingApplyTaxId"
          >
            {{ applyInfo.displayTaxId }}
          </span>
          <el-button
            v-if="applyInfo.taxFileUrl"
            :icon="ZoomIn"
            circle
            size="small"
            @click="openImagePreviewModal(applyInfo.taxFileUrl)"
          />
        </el-row>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="매장 코드"
        label-align="center"
        width="12%"
      >
        {{ replaceEmptyString(applyInfo.storeCode) }}
      </el-descriptions-item>
    </el-descriptions>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <p>
        | 매칭 정보
      </p>
      <el-button
        :disabled="applyInfo.matchingStoreInfo?.length === 0"
        color="#D50000"
        @click="onClickMatchingCancel"
      >
        매칭 취소
      </el-button>
    </el-row>
    <el-descriptions
      :column="7"
      border
      class="font-thin mb-20"
      direction="vertical"
    >
      <el-descriptions-item
        align="center"
        label="매장명"
        label-align="center"
        width="20%"
      >
        {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.storeName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="지점"
        label-align="center"
        width="14%"
      >
        {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.storeAreaName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="대표자명"
        label-align="center"
        width="15%"
      >
        {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.userName) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="휴대전화번호"
        label-align="center"
        width="12%"
      >
        <p @click="toggleMaskingMatchingUserTel">
          {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.displayUserTel) }}
        </p>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="매장 ID"
        label-align="center"
        width="12%"
      >
        {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.torderId) }}
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="사업자등록정보"
        label-align="center"
        width="15%"
      >
        <p @click="toggleMaskingMatchingTaxId">
          {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.displayTaxId) }}
        </p>
      </el-descriptions-item>
      <el-descriptions-item
        align="center"
        label="매장 코드"
        label-align="center"
        width="12%"
      >
        {{ replaceEmptyString(applyInfo.matchingStoreInfo?.[0]?.storeCode) }}
      </el-descriptions-item>
    </el-descriptions>
    <el-row
      align="bottom"
      class="mb-10"
    >
      <p>
        | 매장 검색 (강제 매칭)
      </p>
      <span class="ml-10 font-small font-thin">
        (검색 결과에 해당하는 매장이 없을 경우 직접 검색하여 진행합니다.)
      </span>
    </el-row>
    <el-row>
      <el-input
        v-model="forcedMatchingTxt"
        :maxlength="50"
        placeholder="매장코드/매장ID/매장명을 입력해주세요."
        style="width: 300px"
        @keyup.enter="onClickForcedMatching"
      />
      <el-button
        :disabled="!forcedMatchingTxt"
        class="ml-10"
        type="info"
        @click="onClickForcedMatching"
      >
        불러오기
      </el-button>
      <el-button
        round
        @click="onClickResetSearchData"
      >
        초기화
      </el-button>
    </el-row>
  </div>
  <el-divider />
  <div class="mt-10">
    <el-row
      align="bottom"
      class="mb-10"
    >
      <p>
        | 매장 리스트
      </p>
      <span class="ml-10 font-small font-thin">
        (승인 요청 정보 기준 조건에 부합하는 매장 리스트 입니다, 매장리스트는 버튼 클릭 시마다 새로고침 되어 검색 됩니다.)
      </span>
    </el-row>
    <el-row>
      <el-input
        v-model="withinSearchTxt"
        :maxlength="50"
        clearable
        placeholder="검색어를 입력하세요."
        style="width: 300px"
        @clear="onClickInnerSearching"
        @keyup.enter="onClickInnerSearching"
      />
      <el-button
        :disabled="!withinSearchTxt"
        class="ml-10"
        type="info"
        @click="onClickInnerSearching"
      >
        결과 내 검색
      </el-button>
    </el-row>
    <el-row
      align="bottom"
      class="mb-10"
      justify="space-between"
    >
      <div>
        <p
          v-if="searchStoreList?.length > 0"
          class="font-thin"
        >
          총 {{ searchStoreList?.length }}개의 검색결과가 있습니다.
        </p>
      </div>
      <div>
        <el-button
          type="primary"
          @click="openDisapprovalModal(true)"
        >
          일괄 거절
        </el-button>
        <el-button
          type="info"
          @click="requestHoldingState"
        >
          일괄 보류
        </el-button>
      </div>
    </el-row>
    <el-row
      v-if="isLoadingStores && searchStoreList?.length === 0"
      v-loading="isLoadingStores"
      class="width-100"
    />
    <el-text
      v-if="!isLoadingStores && searchStoreList?.length === 0"
      class="mt-20 font-thin"
      type="danger"
    >
      조건에 부합하는 매장이 없습니다.
    </el-text>
    <el-table
      v-if="searchStoreList?.length > 0"
      :data="searchStoreList"
      :height="400"
      border
      class="width-100 font-thin"
      header-cell-class-name="font-thin font-small"
      scrollbar-always-on
      @row-click="showSingleStoreDetailModal"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="매장명"
        prop="info.storeName"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="지점"
        prop="info.storeAreaName"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="대표자명"
        prop="info.userName"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="휴대전화번호"
        prop="info.userTel"
      >
        <template #default="{ row }">
          {{ maskAllNumber(formatPhoneNumber(row.info.userTel)) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="매장 ID"
        prop="info.torderId"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="사업자등록번호"
      >
        <template #default="{ row }">
          {{ maskAllNumber(formatTaxId(row.info.taxId)) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="매장코드"
        prop="storeCode"
      />
      <el-table-column
        align="center"
        header-align="center"
        label="기매칭여부"
      >
        <template #default="{ row }">
          <el-text :type="getMatchingStatusStyleInList(row.storeMatched)">
            {{ getMatchingStatusTextInList(row.storeMatched) }}
          </el-text>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
:deep(.background-red) {
  background-color: var(--el-color-danger-light-7) !important;
}

:deep(.el-descriptions__label) {
  width: 140px !important;
  vertical-align: middle;
}

:deep(.el-descriptions__cell) {
  vertical-align: middle;
  padding: 6px !important;
}

.register-info-taxId {
  text-align: center;
}

.approve-memo-byte-wrapper {
  width: 65px;
}

.flex-col {
  flex-direction: column;
}

</style>
