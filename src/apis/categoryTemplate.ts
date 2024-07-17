import { ElMessageBox } from 'element-plus';
import {
  getTemplateStoreInfoType,
  restoreSaveInfoType,
  templateMappingInfoType,
} from '@interface/categoryTemplate';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** 선택한 매장의 분류 및 상품 정보 가져오기 */
const requestTemplateGet = (storeInfo: getTemplateStoreInfoType) => {
  const url = endpoints.category_template.template_get;

  return adminTokenApi
    .post(url, storeInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 선택한 매장에 분류 및 상품 정보 복사하기(맵핑, 1단계) */
const requestTemplateMapping = (mappingInfo: templateMappingInfoType) => {
  const url = endpoints.category_template.template_mapping;

  return adminTokenApi
    .post(url, mappingInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 선택한 매장 분류 및 상품 정보 복사본 최종저장(최종저장, 2단계) */
const requestTemplateSave = (mappingInfo: templateMappingInfoType) => {
  const url = endpoints.category_template.template_save;

  return adminTokenApi
    .post(url, mappingInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};
/** 선택한 매장의 매장저장 복구 데이터 리스트 조회 */
const requestTemplateRestoreList = (getStoreCode: string) => {
  const url = endpoints.category_template.template_restore_list;
  const storeCode = { getStoreCode };

  return adminTokenApi
    .post(url, storeCode, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

const requestTemplateRestoreSave = (saveInfo: restoreSaveInfoType) => {
  const url = endpoints.category_template.template_restore_save;

  return adminTokenApi
    .post(url, saveInfo, { validateStatus: (status) => status < 500 })
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
  requestTemplateGet,
  requestTemplateMapping,
  requestTemplateSave,
  requestTemplateRestoreList,
  requestTemplateRestoreSave,
};
