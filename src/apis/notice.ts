import { ElMessageBox } from 'element-plus';
import { useNoticeDetailInfoType } from '@interface/notice';
import endpoints from '@apis/endpoints';
import gatewayApi from '@apis/axios/gatewayApi';

export const requestNoticeInfo = (query: string) => {
  const url = `${endpoints.notice.noticeInfo}?${query}`;

  return gatewayApi
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

export const requestNoticeDetailInfo = (query: string) => {
  const url = `${endpoints.notice.noticeInfo}/${query}`;

  return gatewayApi
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

export const requestNoticeStatusUpdate = (
  query: string,
  data: {
    noticeStatus: number;
  },
) => {
  const url = `${endpoints.notice.noticeStatus}/${query}`;

  return gatewayApi
    .put(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestNoticeInfoDelete = (query: string) => {
  const url = `${endpoints.notice.noticeInfo}/${query}`;

  return gatewayApi
    .delete(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestNoticeFileUpload = (data: File) => {
  const url = endpoints.notice.noticeFile;
  const fd = new FormData();
  fd.append('file', data);

  return gatewayApi
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

export const requestNoticeFileDelete = (data: { filePath: string }) => {
  const url = endpoints.notice.noticeFile;

  return gatewayApi.delete(url, { data }).catch((error) => {
    if (error.response.status !== 200) {
      ElMessageBox.alert(
        '오류가 발생하였습니다. 개발자에게 문의해주세요.',
        '실패',
        {
          confirmButtonText: '확인',
          type: 'error',
        },
      );
    }
  });
};

// 공지사항 글 수정
export const requestNoticeDetailInfoUpdate = (
  data: useNoticeDetailInfoType,
) => {
  const url = endpoints.notice.noticeInfo;

  return gatewayApi
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

export const requestSearchTypeList = (noticeId: number, query: string) => {
  const url = `${endpoints.notice.searchTypeList}/${noticeId}?${query}`;

  return gatewayApi
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

export const requestStoreList = (query: string) => {
  const url = `${endpoints.notice.storeList}?${query}`;

  return gatewayApi
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
  requestNoticeInfo,
  requestNoticeStatusUpdate,
  requestNoticeDetailInfo,
  requestNoticeInfoDelete,
  requestNoticeFileUpload,
  requestNoticeFileDelete,
  requestNoticeDetailInfoUpdate,
  requestSearchTypeList,
  requestStoreList,
};
