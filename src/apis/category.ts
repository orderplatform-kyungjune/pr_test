import { ElMessageBox } from 'element-plus';
import {
  arrangeCategoryType,
  createCategoryType,
  requestCategoryListType,
  requestDeleteParameterType,
  requestUpdateCategoryType,
  settingCategoryType,
} from '@interface/category';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 분류 리스트
export const requestCategoryList = (storeCode: string) => {
  const url = `${endpoints.category.list}?storeCode=${encodeURIComponent(storeCode)}`;

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

// 분류 생성
export const requestCreateCategory = (categoryInfo: createCategoryType) => {
  const url = endpoints.category.v2.create;

  return adminTokenApi
    .post(url, categoryInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류 수정
export const requestEditCategory = (categoryInfo: settingCategoryType) => {
  const url = endpoints.category.update;

  return adminTokenApi
    .post(url, categoryInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류 삭제
export const requestDeleteCategory = (info: requestDeleteParameterType) => {
  const url = endpoints.category.delete;

  return adminTokenApi
    .post(url, info, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류 순서 변경
export const requestArrangeCategory = (data: arrangeCategoryType) => {
  const url = endpoints.category.sort_update;

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

// 중분류 데이터 불러오기
export const requestChildCategoryList = (storeCode: string) => {
  const url = `${endpoints.category.child_category_list}?storeCode=${encodeURIComponent(storeCode)}`;

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

// v2 분류 설정 - 분류 리스트 요청
export const requestV2CategoryList = (data: requestCategoryListType) => {
  const url = endpoints.category.v2.list;

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

export const requestV2CategoryInfoUpdate = (
  data: requestUpdateCategoryType,
) => {
  const url = endpoints.category.v2.update;

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
  requestCategoryList,
  requestCreateCategory,
  requestEditCategory,
  requestDeleteCategory,
  requestArrangeCategory,
  requestChildCategoryList,
  requestV2CategoryList,
  requestV2CategoryInfoUpdate,
};
