import { ElMessageBox } from 'element-plus';
import { optionMigrationInfoType } from '@interface/migration';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

const requestConvertGoodOptionsMigration = (
  requestData: optionMigrationInfoType,
) => {
  const url = endpoints.migration.convert_good_options;

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

const requestConvertVersionPreview = (apiVersion: string) => {
  const url = `${endpoints.migration.convert_store_version_preview}?apiVersion=${apiVersion}`;

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
  requestConvertGoodOptionsMigration,
  requestConvertVersionPreview,
};
