<script lang="ts" setup>
import { h, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { etcUtils, formattingUtils } from '@utils';
import useModalStore from '@store/storeModal';
import {
  memberRegisterDetailType,
  memberRegisterSearchStoreInfoType,
  singleDataUpdateKeyType,
} from '@interface/memberRegister';
import { memberRegister } from '@apis';

const {
  requestUpdateMemberRegister,
} = memberRegister;
const { replaceEmptyString } = etcUtils;
const {
  formatPhoneNumber,
  parseOnlyNumber,
  isValidPhoneNumber,
  formatTaxId,
  isValidTaxId,
} = formattingUtils;

const { flag } = useModalStore();

const props = defineProps<{
  getRegisterMatchingInfo: () => void;
  registerId: number,
  applyInfo: memberRegisterDetailType,
  selectedStoreInfo: memberRegisterSearchStoreInfoType,
  requestHoldingState: () => void,
  openDisapprovalModal: (fromTotal: boolean) => void
  openApprovalModal: () => void
}>();

/** 매장별 정보: 수정값 */
const inputData = reactive({
  storeName: props.selectedStoreInfo.info.storeName || '',
  storeAreaName: props.selectedStoreInfo.info.storeAreaName || '',
  userName: props.selectedStoreInfo.info.userName || '',
  userTel: props.selectedStoreInfo.info.userTel || '',
  taxId: props.selectedStoreInfo.info.taxId || '',
});

/** 매칭 매장 정보 중 불일치 정보 배경색 지정 */
const getDifferentDataStyle = (dataChecker: string) => {
  if (dataChecker === 'diff') return 'background-red';
  return '';
};

/**
 * 매장의 단일 정보 업데이트 api 호출
 * @param {Record<string, number | string>} target 단일 업데이트 할 정보 key:string, value: number|string
 * */
const putUpdateMatchingStoreSingleData = async (
  target: Record<string, number | string>,
) => {
  try {
    const payload = {
      ...{
        id: props.registerId,
        storeCode: props.selectedStoreInfo.storeCode ?? '',
        torderId: props.selectedStoreInfo.info.torderId,
      },
      ...target,
    };

    await requestUpdateMemberRegister(payload);

    ElMessage({
      type: 'success',
      message: '정상적으로 등록되었습니다.',
    });
    props.getRegisterMatchingInfo?.();
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

/**
 * 단일 정보 업데이트 시 정보의 변화 유무 확인
 * @param {string} newValue 현재 input 값
 * */
const isChangedSingleData = (newValue: string) => {
  if (!newValue.trim()) {
    ElMessageBox.confirm(
      h('p', null, [
        h('p', { style: getConfirmTitleStyle('red') }, '"입력값이 없습니다"'),
        h('p', null, '확인 후 수정 진행해주세요.'),
        h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
      ]),
      '확인 요망!',
      {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'error',
      },
    );
    return false;
  }
  return true;
};

/**
 * 휴대전화번호 변화 유무, 유효성 검증
 * @param {string} newValue isChangedSingleData() 호출 param1
 * @return {string} 새로 입력된 값 or 빈 문자열
 * */
const checkStorePhoneNumberValidation = (newValue: string): string => {
  // 변경값 있는지 확인
  if (!isChangedSingleData(newValue)) return '';

  // 유효성 검사 진행
  if (!isValidPhoneNumber(newValue)) {
    ElMessageBox.alert('올바른 휴대전화번호를 입력해주시길 바랍니다.', '경고', {
      type: 'warning',
    });
    return '';
  }
  return newValue.replaceAll('-', '');
};

/**
 * 사업자등록번호 변화 유무, 유효성 검증
 * @param {string} newValue isChangedSingleData() 호출 param1
 * @return {string} 새로 입력된 값 or 빈 문자열
 * */
const checkStoreTaxIdValidation = (newValue: string): string => {
  // 변경값 있는지 확인
  if (!isChangedSingleData(newValue)) return '';

  // 유효성 검사 진행
  if (!isValidTaxId(newValue)) {
    ElMessageBox.alert(
      '올바른 사업자등록번호를 입력해주시길 바랍니다.',
      '경고',
      {
        type: 'warning',
      },
    );
    return '';
  }
  return newValue.replaceAll('-', '');
};

/**
 * 매장 정보 중 단일 정보 업데이트 confirm
 * @param {singleDataUpdateKeyType} key 업데이트 할 단일 정보 key
 * @param {string} data 업데이트 할 단일 정보 value
 * */
const confirmAndUpdateSingleData = (
  key: singleDataUpdateKeyType,
  data: string,
) => {
  let typeTxt = '';
  if (key === 'storeName') typeTxt = '매장명';
  if (key === 'storeAreaName') typeTxt = '지점';
  if (key === 'userName') typeTxt = '대표자명';
  if (key === 'userTel') typeTxt = '대표자 휴대전화번호';
  if (key === 'taxId') typeTxt = '사업자등록번호';
  ElMessageBox.confirm(
    h('p', null, [
      h(
        'p',
        { style: getConfirmTitleStyle('red') },
        `"${typeTxt} 정보가 업데이트 됩니다. 계속 진행 하시겠습니까?"`,
      ),
      h('p', null, '확인 버튼 클릭 시 수정이 완료됩니다.'),
      h('p', null, '전 단계로 가시려면 [취소] 버튼을 눌러주세요.'),
    ]),
    `${typeTxt} 정보 수정!`,
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
    },
  ).then(() => {
    putUpdateMatchingStoreSingleData({ [key]: data });
  });
};

/**
 *  매장 단일 정보 업데이트 api 호출 전, 종류에 따른 payload 유효성검증, 설정
 *  @param {singleDataUpdateKeyType} key 단일 업데이트 정보 종류
 *  @param {string} inputValue 업데이트할 값
 *  */
const updateSingleData = (key: singleDataUpdateKeyType, inputValue: string) => {
  let formattedData;

  if (key === 'storeName' || key === 'storeAreaName' || key === 'userName') {
    if (isChangedSingleData(inputValue)) formattedData = inputValue;
  } else if (key === 'userTel') {
    formattedData = checkStorePhoneNumberValidation(formatPhoneNumber(inputValue));
  } else if (key === 'taxId') {
    formattedData = checkStoreTaxIdValidation(formatTaxId(inputValue));
  } else {
    formattedData = inputValue;
  }

  if (!formattedData) return;

  confirmAndUpdateSingleData(key, formattedData);
};

</script>

<template>
  <el-dialog
    v-model="flag.memberRegisterSingleStoreInfo"
    :close-on-click-modal="false"
    :lock-scroll="false"
    align-center
    width="1100px"
  >
    <el-row class="width-100 info-wrapper font-thin">
      <el-descriptions
        :column="1"
        border
        class="flex-1"
        title="통합 인증 정보"
      >
        <el-descriptions-item>
          <template #label> 매장명</template>
          {{ replaceEmptyString(applyInfo?.storeName) }}
        </el-descriptions-item>
        <el-descriptions-item label="지점">
          {{ replaceEmptyString(applyInfo?.storeAreaName) }}
        </el-descriptions-item>
        <el-descriptions-item label="대표자명">
          {{ replaceEmptyString(applyInfo?.userName) }}
        </el-descriptions-item>
        <el-descriptions-item label="대표자 휴대전화번호">
          {{ replaceEmptyString(formatPhoneNumber(applyInfo?.userTel as string)) }}
        </el-descriptions-item>
        <el-descriptions-item label="사업자등록번호">
          {{ replaceEmptyString(formatTaxId(applyInfo?.taxId ?? '')) }}
        </el-descriptions-item>
        <el-descriptions-item label="매장 ID">
          {{ replaceEmptyString(applyInfo?.torderId) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        :column="1"
        border
        class="flex-1"
        title="매칭 매장 정보"
      >
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.storeName)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.storeName)"
          label="매장명"
        >
          <el-row>
            <el-input
              v-model="inputData.storeName"
              class="flex-1 mr-5"
            />
            <el-button
              type="info"
              @click="updateSingleData('storeName', inputData.storeName)"
            >
              수정
            </el-button>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.storeAreaName)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.storeAreaName)"
          label="지점"
        >
          <el-row>
            <el-input
              v-model="inputData.storeAreaName"
              class="flex-1 mr-5"
            />
            <el-button
              type="info"
              @click="updateSingleData('storeAreaName', inputData.storeAreaName)"
            >
              수정
            </el-button>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.userName)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.userName)"
          label="대표자명"
        >
          <el-row>
            <el-input
              v-model="inputData.userName"
              class="flex-1 mr-5"
            />
            <el-button
              type="info"
              @click="updateSingleData('userName', inputData.userName)"
            >
              수정
            </el-button>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.userTel)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.userTel)"
          label="대표자 휴대전화번호"
        >
          <el-row>
            <el-input
              v-model="inputData.userTel"
              :formatter="formatPhoneNumber"
              :parser="parseOnlyNumber"
              class="flex-1 mr-5"
            />
            <el-button
              type="info"
              @click="updateSingleData('userTel', inputData.userTel)"
            >
              수정
            </el-button>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.taxId)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.taxId)"
          label="사업자등록번호"
        >
          <el-row>
            <el-input
              v-model="inputData.taxId"
              :formatter="formatTaxId"
              :maxlength="12"
              :parser="parseOnlyNumber"
              class="flex-1 mr-5"
            />
            <el-button
              type="info"
              @click="updateSingleData('taxId', inputData.taxId)"
            >
              수정
            </el-button>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getDifferentDataStyle(selectedStoreInfo.checker?.torderId)"
          :label-class-name="getDifferentDataStyle(selectedStoreInfo.checker?.torderId)"
          label="매장 ID"
        >
          {{ replaceEmptyString(selectedStoreInfo.info?.torderId) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row
      class="width-100 mt-20 font-thin"
      justify="center"
    >
      <el-button
        type="primary"
        @click="openDisapprovalModal(false)"
      >
        거절
      </el-button>
      <el-button
        type="info"
        @click="requestHoldingState"
      >
        보류
      </el-button>
      <el-button
        type="danger"
        @click="openApprovalModal"
      >
        승인
      </el-button>
    </el-row>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__content) {
  min-width: 100px;
  height: 41px;
}

:deep(.el-descriptions__header) {
  margin: 5px 0;
}

:deep(.result-description-label) {
  width: 205px;
}

:deep(.background-red) {
  background-color: var(--el-color-danger-light-7) !important;
}

:deep(.el-descriptions__label) {
  width: 170px;
  height: 49px;
  vertical-align: middle;
}

:deep(.el-descriptions__cell) {
  vertical-align: middle;
}

.info-wrapper {
  gap: 10px;
  padding: 10px;
}

.cell-mismatch {
  word-break: keep-all;
}
</style>
