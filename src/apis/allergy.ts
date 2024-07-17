import { ElMessageBox } from 'element-plus';
import {
  requestAddAllergyType,
  requestAllergyListParamType,
  requestUpdateAllergyStatusType,
  requestUpdateAllergyType,
} from '@interface/allergy';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

export const requestAllergyList = (data: requestAllergyListParamType) => {
  const url = endpoints.allergy.list;

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

export const requestUpdateAllergyStatus = (
  data: requestUpdateAllergyStatusType,
) => {
  const url = endpoints.allergy.update_allergy_status;

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

export const requestAddAllergy = (data: requestAddAllergyType) => {
  const url = endpoints.allergy.add_allergy;
  const fd = new FormData();

  fd.append('name', data.name);
  fd.append('use_yn', data.use_yn);
  fd.append('view_type', data.view_type);
  fd.append('image', data.image);

  if (data.content) fd.append('content', data.content);

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

export const requestUpdateAllergy = (data: requestUpdateAllergyType) => {
  const url = endpoints.allergy.update_allergy;
  const fd = new FormData();

  fd.append('id', data.id.toString());
  fd.append('name', data.name);
  fd.append('use_yn', data.use_yn);
  fd.append('view_type', data.view_type);
  fd.append('image', data.image);
  if (data.image_delete_yn) fd.append('image_delete_yn', data.image_delete_yn);
  if (data.content) fd.append('content', data.content);

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

export default {
  requestAllergyList,
  requestUpdateAllergyStatus,
  requestAddAllergy,
  requestUpdateAllergy,
};
