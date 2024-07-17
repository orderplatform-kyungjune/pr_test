import { ElMessageBox } from 'element-plus';
import {
  requestAllTranslateOptionGroupType,
  requestArrangeOptionGroupType,
  requestCreateOptionType,
  requestDeleteOptionType,
  requestOptionGroupListType,
  requestOrderOneOptionGroupListType,
  requestSaveReferenceOptionType,
  requestSortOptionDataType,
  requestTranslateOptionGroupPlatformType,
  requestTranslateOptionGroupType,
  requestUpdateDetailOptionType,
  requestUpdateOptionType,
} from '@interface/option';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 포스 제공 옵션 리스트 */
export const requestPosInitData = (storeCode: string, posGoodCode: string) => {
  const url = `${endpoints.option.pos_init}?storeCode=${encodeURIComponent(storeCode)}&posGoodCode=${encodeURIComponent(posGoodCode)}`;
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

/** 옵션 추가하기 */
export const requestCreateOption = (data: requestCreateOptionType) => {
  const url = endpoints.option.create;

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

/** 옵션 단일 삭제하기 */
export const requestDeleteOption = (data: requestDeleteOptionType) => {
  const url = endpoints.option.delete;

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

/** 참고 옵션 데이터 가져오기 (다른 상품) */
export const requestAllOptionList = (storeCode: string) => {
  const url = `${endpoints.option.list_all}?storeCode=${encodeURIComponent(storeCode)}`;

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

/** 참고 옵션 가져와 저장하기 */
export const requestSaveReferenceOption = (
  data: requestSaveReferenceOptionType,
) => {
  const url = endpoints.option.create_get;

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

/** 상세 옵션 순서 변경하기 */
export const requestSortOptionData = (data: requestSortOptionDataType) => {
  const url = endpoints.option.update_sort;

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

/** 상세 옵션 변경하기 */
export const requestUpdateOption = (data: requestUpdateOptionType) => {
  const url = endpoints.option.update;

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

// 옵션 단일 상세 정보 수정하기
export const requestUpdateDetailOption = (
  data: requestUpdateDetailOptionType,
) => {
  const url = endpoints.option.update_detail;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('option_no', data.option_no);
  fd.append('option_qty', data.option_qty);
  fd.append('option_use', data.option_use);
  fd.append('option_is_sale', data.option_is_sale);
  if (data.option_img) {
    fd.append('option_img', data.option_img);
  }

  return adminTokenApi
    .post(url, fd, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 옵션 그룹 리스트 요청 */
export const requestOptionGroupList = (data: requestOptionGroupListType) => {
  const url = endpoints.option.get_trans_option_list;
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

// 옵션그룹 일괄 자동번역(파파고)
export const requestPapagoTranslateAllOptionGroup = (
  data: requestAllTranslateOptionGroupType,
) => {
  const url = endpoints.option.all_lang_trans;

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

// 옵션 상품 일괄 자동번역(파파고)
export const requestPapagoTranslateAllOptionMenu = (
  data: requestAllTranslateOptionGroupType,
) => {
  const url = endpoints.option.item_all_lang_trans;

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

// 언어 번역 페이지 옵션 그룹, 아이템 수동 번역
// type: option_group or option_item
export const requestInactiveTranslateOptionGroup = (
  data: requestTranslateOptionGroupType,
) => {
  const url = endpoints.option.update_lang_trans;

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

export const requestInactiveTranslateOptionGroupInPlatform = (
  data: requestTranslateOptionGroupPlatformType,
) => {
  const url = endpoints.order2.option.update_lang_trans;

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

/** 옵션그룹 리스트 가져오기 */
export const requestOrderOneOptionGroupList = (
  data: requestOrderOneOptionGroupListType,
) => {
  const url = `${endpoints.option.option_group_name_list}?storeCode=${encodeURIComponent(data.storeCode)}&goodsCode=${encodeURIComponent(data.goodsCode)}`;

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

/** 옵션그룹 순서 변경하기 */
export const requestArrangeOptionGroup = (
  data: requestArrangeOptionGroupType,
) => {
  const url = endpoints.option.update_option_group_sort;

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

export default {
  requestPosInitData,
  requestCreateOption,
  requestDeleteOption,
  requestAllOptionList,
  requestSaveReferenceOption,
  requestSortOptionData,
  requestUpdateOption,
  requestUpdateDetailOption,
  requestOrderOneOptionGroupList,
  requestArrangeOptionGroup,
  requestOptionGroupList,
  requestPapagoTranslateAllOptionGroup,
  requestPapagoTranslateAllOptionMenu,
  requestInactiveTranslateOptionGroup,
  requestInactiveTranslateOptionGroupInPlatform,
};
