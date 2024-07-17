import {ElMessageBox} from 'element-plus';
import {isUPLUSAdmin} from '@utils/authentication';
import {
  requestArrangeOrderTwoOptionGroupType,
  requestArrangeOrderTwoOptionMenuType,
  requestCreateOptionGroupType,
  requestDeleteOrderTwoOptionGroupType,
  requestOptionPosInitType,
  requestOrderTwoOptionGroupListType,
  requestOrderTwoOptionMenuListType,
  requestOverwriteOrImportOrderTwoOptionGroupType,
  requestUpdateOrderTwoOptionGroupType,
  requestUpdateOrderTwoOptionMenuType,
} from '@interface/orderTwoOption';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 현 페이지는 초창기 하얏트 기능을 위해 만들어진 api 였으나, 현재는 티오더2에서도 같이 사용하고 있는 api 입니다. */
/** uplus 어드민: endpoints 의 'hyatt'->'2nd' 키워드 변경 */

/** 이미지 업로드 */
const requestOrderTwoUploadImage = (requestData: File) => {
  const url = endpoints.hyatt.common.upload_image;
  const fd = new FormData();
  fd.append('img', requestData);

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

// <------------------옵션 그룹-------------------->

// 포스제공 옵션 정보
const requestOrderTwoOptionPosInitData = (
  requestData: requestOptionPosInitType,
) => {
  const baseUrl = isUPLUSAdmin()
    ? endpoints.order2.option.pos_init
    : endpoints.hyatt.option.pos_init;
  const url = `${baseUrl}?storeCode=${encodeURIComponent(requestData.storeCode)}&posGoodCode=${encodeURIComponent(requestData.posGoodCode)}&type=option`;

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

/** 옵션 그룹 리스트 */
const requestOrderTwoOptionGroupList = (
  requestData: requestOrderTwoOptionGroupListType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.option_group_list
    : endpoints.hyatt.option.option_group_list;

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

/** 옵션 상품 리스트 */
const requestOrderTwoOptionMenuList = (
  requestData: requestOrderTwoOptionMenuListType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.option_group_item
    : endpoints.hyatt.option.option_group_item;

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

/** 옵션 그룹 상품 등록 */
const requestOrderTwoOptionCreate = (
  requestData: requestCreateOptionGroupType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.create
    : endpoints.hyatt.option.create;

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

/** 옵션 그룹 삭제 */
const requestDeleteOrderTwoOptionGroupList = (
  requestData: requestDeleteOrderTwoOptionGroupType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.delete
    : endpoints.hyatt.option.delete;

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

/** 옵션 그룹 수정 */
const requestUpdateOrderTwoOption = (
  requestData: requestUpdateOrderTwoOptionGroupType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.update
    : endpoints.hyatt.option.update;

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

/** 옵션 상품 수정 */
const requestUpdateOrderTwoOptionMenu = (
  requestData: requestUpdateOrderTwoOptionMenuType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.option_item_update
    : endpoints.hyatt.option.option_item_update;
  const fd = new FormData();
  fd.append('storeCode', requestData.storeCode);
  fd.append('option_no', requestData.option_no);
  fd.append('option_qty', requestData.option_qty);
  fd.append('option_use', requestData.option_use);
  fd.append('option_is_sale', requestData.option_is_sale);
  if (requestData.option_img) {
    fd.append('option_img', requestData.option_img);
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

/** 옵션 상품 순서 변경 */
const requestArrangeOrderTwoOptionMenu = (
  requestData: requestArrangeOrderTwoOptionMenuType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.option_item_sort
    : endpoints.hyatt.option.option_item_sort;

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

/** 옵션 그룹 순서 변경 */
const requestArrangeOrderTwoOptionGroup = (
  requestData: requestArrangeOrderTwoOptionGroupType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.option_group_sort
    : endpoints.hyatt.option.option_group_sort;

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

/** 티오더2 - 옵션 그룹 덮어쓰기 및 추가하기 */
const requestOverWriteOrImportOrderTwoOptionGroupList = (
  requestData: requestOverwriteOrImportOrderTwoOptionGroupType,
) => {
  const url = isUPLUSAdmin()
    ? endpoints.order2.option.create_get
    : endpoints.hyatt.option.create_get;
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

/** 티오더2 - 옵션 그룹 리스트 가져오기 */
const requestGetOrderTwoOptionGroupList = (storeCode: string) => {
  const baseUrl = isUPLUSAdmin()
    ? endpoints.order2.option.list_all
    : endpoints.hyatt.option.list_all;
  const url = `${baseUrl}?storeCode=${encodeURIComponent(storeCode)}`;
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

export default {
  requestOrderTwoUploadImage,
  requestOrderTwoOptionGroupList,
  requestDeleteOrderTwoOptionGroupList,
  requestOrderTwoOptionPosInitData,
  requestOrderTwoOptionCreate,
  requestOrderTwoOptionMenuList,
  requestUpdateOrderTwoOptionMenu,
  requestArrangeOrderTwoOptionMenu,
  requestArrangeOrderTwoOptionGroup,
  requestUpdateOrderTwoOption,
  requestOverWriteOrImportOrderTwoOptionGroupList,
  requestGetOrderTwoOptionGroupList,
};
