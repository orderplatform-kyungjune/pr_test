import { ElMessageBox } from 'element-plus';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 프렌차이즈 리스트
export const requestFranchiseList = () => {
  const url = endpoints.fran.list;

  return adminTokenApi
    .get(url, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default { requestFranchiseList };
