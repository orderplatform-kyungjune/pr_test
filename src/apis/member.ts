import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { isUPLUSAdmin } from '@utils/authentication';
import {
  authPageUpdateType,
  businessMemberUpdateInfoType,
  requestStoreMemberListType,
  requestTorderMemberListType,
  selectBoxType,
  totalMemberDataPlatformType,
  totalMemberDataType,
  totalMemberUpdateInfoPlatformType,
  totalMemberUpdateInfoType,
  totalMemberUpdatePasswordPlatformType,
  totalMemberUpdatePasswordType,
} from '@interface/member';
import { ENVIRONMENT } from '@common/envVariables';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/**  법인 구분 리스트 === 사업체 리스트 */
const requestCorporationList = () => {
  const url = endpoints.member.corporation_list;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    // TODO DELETE 24.06.04 배포에 소상공인 미노출 처리, 소상공인 open 결정되면 .then() 부분 삭제 필요
    .then((response: AxiosResponse): AxiosResponse => {
      if (response?.status === 200 && ENVIRONMENT === 'production') {
        if (response?.data.data) {
          response.data.data = response.data.data.filter((businessItem: selectBoxType) => businessItem.code !== 'brand1');
        }
        return response;
      }
      return response;
    })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/**  부서명 리스트 */
const requestDepartmentList = () => {
  const url = endpoints.member.department_list_for_create;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/**  권한명 리스트 (법인별 구분) */
const requestAuthList = () => {
  const url = endpoints.member.auth_list_for_create;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/**  권한 구분 리스트 */
const requestAuthTotalList = () => {
  const url = endpoints.member.auth_list;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/**  계정 상태 리스트 */
const requestStateList = () => {
  const url = endpoints.member.state_list;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/**  권한 설정 */
const requestAuthUpdate = (authInfo: authPageUpdateType) => {
  const url = endpoints.member.auth_update;

  return adminTokenApi
    .post(url, authInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 어드민 ID 등록 */
const requestTorderMemberCreate = (requestData: totalMemberDataType) => {
  const url = isUPLUSAdmin()
    ? endpoints.member.platform_member_create
    : endpoints.member.torder_member_create;

  return adminTokenApi
    .post(url, requestData, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTorderMemberCreateInPlatform = (
  requestData: totalMemberDataPlatformType,
) => {
  const url = endpoints.member.platform_member_create;

  return adminTokenApi
    .post(url, requestData, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 어드민 회원 리스트 */
const requestTorderMemberList = (searchInfo: requestTorderMemberListType) => {
  const url = isUPLUSAdmin()
    ? endpoints.member.platform_member_list
    : endpoints.member.torder_member_list;

  return adminTokenApi
    .post(url, searchInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 비즈니스 회원 리스트 */
const requestStoreMemberList = (searchInfo: requestStoreMemberListType) => {
  const url = endpoints.member.store_member_list;

  return adminTokenApi
    .post(url, searchInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 어드민 회원 상세 정보 */
const requestTotalMemberDetailInfo = (data: { T_order_id: string }) => {
  const url = endpoints.member.torder_member_info;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTotalMemberDetailInfoInPlatform = (data: {
  platform_id: string;
}) => {
  const url = endpoints.member.platform_member_info;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 비즈니스 회원 상세 정보 */
const requestBusinessMemberDetailInfo = (id: { T_order_id: string }) => {
  const url = endpoints.member.store_member_info;

  return adminTokenApi
    .post(url, id, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 어드민 회원 정보 수정 */
const requestTotalMemberUpdateInfo = (account: totalMemberUpdateInfoType) => {
  const url = endpoints.member.torder_member_update;

  return adminTokenApi
    .post(url, account, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTotalMemberUpdateInfoInPlatform = (
  account: totalMemberUpdateInfoPlatformType,
) => {
  const url = endpoints.member.platform_member_update;

  return adminTokenApi
    .post(url, account, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 비즈니스 회원 정보 수정 */
const requestBusinessMemberUpdateInfo = (
  account: businessMemberUpdateInfoType,
) => {
  const url = endpoints.member.store_member_update;
  return adminTokenApi
    .post(url, account, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 회원 비밀번호 변경: 어드민 회원 + 비즈니스 회원 공통 */
const requestTotalMemberUpdatePassword = (
  account: totalMemberUpdatePasswordType,
) => {
  const url = endpoints.member.change_member_pw;
  return adminTokenApi
    .post(url, account, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTotalMemberUpdatePasswordInPlatform = (
  account: totalMemberUpdatePasswordPlatformType,
) => {
  const url = endpoints.member.change_member_pw;
  return adminTokenApi
    .post(url, account, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestTorderMemberCreate,
  requestCorporationList,
  requestDepartmentList,
  requestAuthList,
  requestAuthTotalList,
  requestStateList,
  requestAuthUpdate,
  requestTorderMemberList,
  requestStoreMemberList,
  requestTotalMemberDetailInfo,
  requestBusinessMemberDetailInfo,
  requestTotalMemberUpdateInfo,
  requestBusinessMemberUpdateInfo,
  requestTotalMemberUpdatePassword,
  requestTorderMemberCreateInPlatform,
  requestTotalMemberUpdateInfoInPlatform,
  requestTotalMemberUpdatePasswordInPlatform,
  requestTotalMemberDetailInfoInPlatform,
};
