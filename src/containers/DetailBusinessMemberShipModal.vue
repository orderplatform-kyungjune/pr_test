<script lang="ts" setup>
import { h, reactive, Ref, ref, watchEffect } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, formattingUtils, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import {
  businessMemberDetailInfoType,
  businessMemberUpdateInfoType,
  selectBoxType,
} from '@interface/member';
import { UpdatePasswordModal } from '@containers';
import { DETAIL_BUSINESS_MEMBER_SHIP, UPDATE_PASSWORD } from '@common/string';
import { PATTERN_TORDER_ID_WITH_LENGTH } from '@common/regexPatterns';
import { memberCodec } from '@codecs';
import { helper, member } from '@apis';

const { failAuthenticationAlert } = authentication;
const { runtimeCheck } = runtimeCheckHelper;
const { flag, modalData, closeModal, openModal } = useModalStore();
const { requestCheckDuplicateAdminId } = helper;
const {
  requestBusinessMemberDetailInfo,
  requestStateList,
  requestTotalMemberUpdatePassword,
  requestBusinessMemberUpdateInfo,
} = member;
const { formatPhoneNumber, isValidPhoneNumber, createRegExp, parseOnlyNumber } =
  formattingUtils;
const { businessMemberDetailInfoCodec, departmentListCodec } = memberCodec;

const props = defineProps<{
  postRequestBusinessMemberList: () => void;
}>();

const memberId = modalData.detailBusinessMemberShip;

// 기존 계정 ID (중복 체크)
const savedMemberInfo = reactive({
  id: '',
  phone: '',
  userName: '',
});

/** 비즈니스 회원 계정 상세 정보 데이터 */
const memberDetailInfo: Ref<businessMemberDetailInfoType> = ref(
  {} as businessMemberDetailInfoType,
);
/** 비즈니스 회원 계정 상세 정보 데이터 불러오기 */
const postMemberDetailInfo = async () => {
  const requestData = { T_order_id: memberId };
  try {
    const res = (await requestBusinessMemberDetailInfo(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(businessMemberDetailInfoCodec, res.data);

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
        memberDetailInfo.value = res.data.data;
        savedMemberInfo.id = res.data.data?.T_order_id;
        savedMemberInfo.phone = res.data.data?.T_order_member_hp;
        savedMemberInfo.userName = res.data.data?.T_order_member_name;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비즈니스 회원 정보 변경 */
const checkTorderId = (inputValue: string) => {
  const regExp = createRegExp(`^${PATTERN_TORDER_ID_WITH_LENGTH}$`);
  if (!regExp.test(inputValue)) {
    ElMessageBox.alert(
      '최소 3자, 최대 20자의 영문/숫자만 입력 가능합니다.',
      '경고',
      {
        type: 'warning',
      },
    );
    return false;
  }
  return true;
};

const checkPhoneNumber = (inputValue: string) => {
  if (savedMemberInfo.phone === inputValue || !inputValue) return true;
  if (!isValidPhoneNumber(formatPhoneNumber(inputValue))) {
    ElMessageBox.alert('휴대전화번호를 확인해 주시길 바랍니다.', '경고', {
      type: 'warning',
    });
    return false;
  }
  return true;
};

const isValidValue = (key: string, inputValue: string) => {
  if (key === 'T_order_member_hp') {
    return checkPhoneNumber(inputValue);
  }

  return true;
};

const passedIdDuplication = ref(false);
watchEffect(() => {
  passedIdDuplication.value =
    memberDetailInfo.value.T_order_id === savedMemberInfo.id;
});

const postUpdateMemberShipInfo = async (
  singleData?: Record<string, number | string>,
) => {
  if (!passedIdDuplication.value) {
    ElMessageBox.alert('매장ID 중복 검사를 진행해주세요.', '경고', {
      type: 'warning',
    });
    return;
  }
  let requestData: businessMemberUpdateInfoType = {
    no: memberDetailInfo.value.no,
    T_order_id: memberDetailInfo.value.T_order_id,
    T_order_member_state: memberDetailInfo.value.T_order_member_state,
  };

  if (singleData) {
    requestData = {
      ...requestData,
      ...singleData,
    };
  } else {
    if (!checkPhoneNumber(memberDetailInfo.value.T_order_member_hp)) return;
    requestData.T_order_member_hp =
      memberDetailInfo.value.T_order_member_hp?.replaceAll('-', '');
    requestData.T_order_member_name =
      memberDetailInfo.value.T_order_member_name;
  }

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
      props.postRequestBusinessMemberList();
      ElMessage({
        type: 'success',
        message: '정보가 수정되었습니다.',
      });
      if (!singleData) closeModal(DETAIL_BUSINESS_MEMBER_SHIP);
      else postMemberDetailInfo();
    }
  } catch (error) {
    console.log(error);
  }
};

const updateSingleData = (key: string, inputValue: string) => {
  if (isValidValue(key, inputValue)) {
    let data = inputValue;
    if (key === 'T_order_member_hp') data = inputValue.replaceAll('-', '');
    postUpdateMemberShipInfo({ [key]: data });
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

// 아이디 중복 검사
const postCheckDuplicateId = async () => {
  if (!checkTorderId(memberDetailInfo.value.T_order_id)) return;
  try {
    const adminId = { T_order_id: memberDetailInfo.value.T_order_id };
    if (adminId.T_order_id === '') {
      ElMessage({
        type: 'error',
        message: '매장 아이디를 입력해주세요.',
      });
      return;
    }
    const res = (await requestCheckDuplicateAdminId(adminId)) as AxiosResponse;

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
      if (!res.data.result) {
        passedIdDuplication.value = true;
        ElMessage({
          type: 'success',
          message: '사용 가능한 아이디 입니다.',
        });
      } else {
        passedIdDuplication.value = false;
        ElMessage({
          type: 'error',
          message: '이미 등록된 아이디 입니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비밀번호 초기화하기 */
const postResetPassword = async () => {
  const requestData = {
    T_order_id: memberId,
    type: 'reset',
  };

  try {
    const res = (await requestTotalMemberUpdatePassword(
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
      ElMessage({
        type: 'success',
        message: '비밀번호가 초기화 되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/** 비밀번호 초기화 */
const resetPassword = () => {
  const resetInfoText = `비밀번호 초기화로 선택하면,
  비밀번호가 자동으로 [1234]으로 변경됩니다.
  초기화하시겠습니까?`;

  ElMessageBox.confirm('확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    message: h(
      'p',
      { style: 'white-space: break-spaces; text-align: center;' },
      resetInfoText,
    ),
    type: 'warning',
  })
    .then(() => {
      closeModal(DETAIL_BUSINESS_MEMBER_SHIP);
      postResetPassword();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소 되었습니다.',
      });
    });
};

const convertFirstLoginDate = () => {
  if (memberDetailInfo.value.first_login === '미완료') return '-';
  return memberDetailInfo.value.first_login;
};

const isDisabledUpdatePhoneNumber = () =>
  savedMemberInfo.phone?.replaceAll('-', '') ===
  memberDetailInfo.value.T_order_member_hp?.replaceAll('-', '');

// v-for 방어 코드
const getStateDataKey = (state: selectBoxType, index: number) => {
  if (!state) return `state-${index}`;
  return state.code;
};

postMemberDetailInfo();
getStateListData();
</script>

<template>
  <el-dialog
    v-model="flag.detailBusinessMemberShip"
    title="비즈니스 계정 정보"
    width="70%"
  >
    <UpdatePasswordModal
      v-if="flag.updatePassword"
      :id="memberId"
    />

    <el-descriptions
      :column="2"
      border
    >
      <el-descriptions-item
        class-name="member-ship-content"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <template #label>
          <p>
            계정 상태
            <span class="essential-star"> * </span>
          </p>
        </template>
        <el-radio-group v-model="memberDetailInfo.T_order_member_state">
          <el-radio
            v-for="(state, index) in stateListData"
            :key="getStateDataKey(state, index)"
            :label="state.code"
          >
            {{ state.code === '1' ? '등록' : '정지' }}
          </el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="권한"
        label-align="center"
        label-class-name="member-ship-label"
      >
        {{ memberDetailInfo.T_order_auth }}
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <template #label>
          <p>
            매장명
            <span class="essential-star"> * </span>
          </p>
        </template>
        <span>
          {{ memberDetailInfo.T_order_store_name }}
        </span>
        <el-tag
          v-if="memberDetailInfo.test_store_use === 'Y'"
          class="ml-5"
          effect="dark"
          round
          size="small"
          type="danger"
        >
          test
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="매장 코드"
        label-align="center"
        label-class-name="member-ship-label"
      >
        {{ memberDetailInfo.T_order_member_code }}
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="매장 ID"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <div class="flex">
          <el-input
            v-model="memberDetailInfo.T_order_id"
            class="mr-10"
          />
          <el-button
            :disabled="passedIdDuplication"
            color="#000"
            type="primary"
            @click="postCheckDuplicateId"
          >
            ID 중복 검사
          </el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="PW"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <div class="flex">
          <el-button
            class="width-100"
            color="#000"
            @click="openModal(UPDATE_PASSWORD)"
          >
            PW 변경
          </el-button>
          <el-button
            class="width-100"
            color="#000"
            @click="resetPassword"
          >
            PW 초기화
          </el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="연락처"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <div class="flex">
          <el-input
            v-model="memberDetailInfo.T_order_member_hp"
            :formatter="formatPhoneNumber"
            :parser="parseOnlyNumber"
            class="mr-10"
          />
          <el-button
            :disabled="isDisabledUpdatePhoneNumber()"
            color="#000"
            @click="
              updateSingleData(
                'T_order_member_hp',
                memberDetailInfo.T_order_member_hp,
              )
            "
          >
            수정
          </el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="계정 발급 일시"
        label-align="center"
        label-class-name="member-ship-label"
      >
        {{ memberDetailInfo.T_order_member_register_datetime }}
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="대표자명"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <div class="flex">
          <el-input
            v-model="memberDetailInfo.T_order_member_name"
            class="mr-10"
            maxlength="20"
            minlength="2"
          />
          <el-button
            :disabled="
              savedMemberInfo.userName === memberDetailInfo.T_order_member_name
            "
            color="#000"
            @click="
              updateSingleData(
                'T_order_member_name',
                memberDetailInfo.T_order_member_name,
              )
            "
          >
            수정
          </el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="최초 로그인"
        label-align="center"
        label-class-name="member-ship-label"
      >
        <span>
          {{ memberDetailInfo.first_login }}
        </span>
        /
        <span> 최초 로그인 일시: {{ convertFirstLoginDate() }} </span>
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="통합 인증"
        label-align="center"
        label-class-name="member-ship-label"
      >
        {{ memberDetailInfo.approveState === '1' ? '승인' : '미승인' }}
      </el-descriptions-item>
      <el-descriptions-item
        class-name="member-ship-content"
        label="이용약관 동의"
        label-align="center"
        label-class-name="member-ship-label"
      >
        {{ memberDetailInfo.term_agree === 'Y' ? '동의' : '미동의' }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span>
        <el-button
          type="danger"
          @click="closeModal(DETAIL_BUSINESS_MEMBER_SHIP)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="postUpdateMemberShipInfo()"
        >
          저장
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.member-ship-label) {
  width: 13%;
  height: 49px;
}

:deep(.member-ship-content) {
  width: 30%;
  vertical-align: middle;
}

.flex {
  display: flex;
}

:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  width: 14%;
  vertical-align: middle;
}
</style>
