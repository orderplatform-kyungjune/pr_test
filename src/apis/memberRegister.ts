import { setAxiosApi } from '@utils/apiUtil';
import {
  requestForcedStoreListType,
  requestMemberRegisterDetailType,
  requestMemberRegisterStoreType,
  requestUpdateRegisterInfoType,
  requestUpdateRegisterStateType,
} from '@interface/memberRegister';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

const objectToQueryString = (
  params: Record<string, string | number | boolean>,
) =>
  Object.keys(params)
    .map((paramKey) => `${paramKey}=${encodeURIComponent(params[paramKey])}`)
    .join('&');

/** 통합인증 심사 신청 리스트 */
export const requestMemberRegisterList = (data: requestMemberRegisterStoreType) => setAxiosApi<{
  result: boolean;
  code: number
}>({
  instance: adminTokenApi,
  config: {
    method: 'GET',
    url: `${endpoints.member.member_register_list}?${objectToQueryString(data)}`,
  },
});

/** 통합인증 심사 신청에 매칭된 매장 리스트 */
export const requestMemberRegister = (data: requestMemberRegisterDetailType) => {
  let url = `${endpoints.member.member_register}?id=${encodeURIComponent(data.id)}`;
  if (data.withinSearchTxt) url += `&withinSearchTxt=${encodeURIComponent(data.withinSearchTxt)}`;

  return setAxiosApi<{ result: boolean; code: number }>({
    instance: adminTokenApi,
    config: {
      method: 'GET',
      url,
    },
  });
};

/** 통합인증 신청 강제 매칭 매장 리스트 */
export const requestForcedStoreList = (data: requestForcedStoreListType) => {
  let url = `${endpoints.member.member_register_store}?id=${data.id}&searchTxt=${encodeURIComponent(data.searchTxt)}`;
  if (data.withinSearchTxt) url += `&withinSearchTxt=${encodeURIComponent(data.withinSearchTxt)}`;
  return setAxiosApi<{
    result: boolean;
    code: number
  }>({
    instance: adminTokenApi,
    config: {
      method: 'GET',
      url,
    },
  });
};

/** 통합인증 심사 신청에 매칭된 매장 - 정보 업데이트 */
export const requestUpdateMemberRegister = (data: requestUpdateRegisterInfoType) => setAxiosApi<{
  result: boolean;
  code: number
}>({
  instance: adminTokenApi,
  config: {
    method: 'PUT',
    url: endpoints.member.member_register,
    data,
  },
});

export const requestUpdateMemberRegisterState = (data: requestUpdateRegisterStateType) => setAxiosApi<{
  result: boolean;
  code: number
}>({
  instance: adminTokenApi,
  config: {
    method: 'PUT',
    url: endpoints.member.member_register_state,
    data,
  },
});

export const requestRegisterHistory = (registerId: string) => setAxiosApi<{
  result: boolean;
  code: number
}>({
  instance: adminTokenApi,
  config: {
    method: 'GET',
    url: `${endpoints.member.member_register_history}?id=${encodeURIComponent(registerId)}`,
  },
});

export default {
  requestMemberRegisterList,
  requestMemberRegister,
  requestUpdateMemberRegister,
  requestUpdateMemberRegisterState,
  requestRegisterHistory,
  requestForcedStoreList,
};
