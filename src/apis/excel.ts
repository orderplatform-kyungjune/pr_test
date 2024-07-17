import { ElMessageBox } from 'element-plus';
import { etcUtils } from '@utils';
import {
  postExcelUploadData,
  requestCategoryListExcelDownloadType,
} from '@interface/excel';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/**
 * 오더 태블릿 버전 설정 페이지 -> 엑셀 업로드
 * @param file - 엑셀파일
 * @returns return - Promise
 */
export const postTorderTabletExcelFile = async ({ file }: { file: File }) => {
  const url = endpoints.excel.upload_torder_tablet_version;
  const formData = etcUtils.setFormData({ object: { uploadFile: file } });

  return adminTokenApi
    .post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      validateStatus: (status: number) => status < 500,
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

// 언어번역 - 상품리스트 엑셀 일괄 업로드
export const requestGoodsListExcelUpload = (data: postExcelUploadData) => {
  const url = endpoints.excel.upload_lang_trans;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 분류 리스트 엑셀 일괄 업로드
export const requestCategoryListExcelUpload = (data: postExcelUploadData) => {
  const url = endpoints.excel.category_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 상세설명 리스트 엑셀 일괄 업로드
export const requestDescriptionListExcelUpload = (
  data: postExcelUploadData,
) => {
  const url = endpoints.excel.goods_html_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 티오더2 옵션 그룹 리스트 불러오기, 엑셀 다운로드
export const requestOrderTwoOptionGroupListExcelDownload = (
  requestData: requestCategoryListExcelDownloadType,
) => {
  const url = endpoints.excel.option_group_lang_trans_list_download;

  return adminTokenApi
    .post(url, requestData, {
      validateStatus: (status: number) => status < 500,
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

// 언어번역 - 티오더2 옵션 그룹 리스트 엑셀 일괄 업로드
export const requestOrderTwoOptionGroupListExcelUpload = (
  data: postExcelUploadData,
) => {
  const url = endpoints.excel.option_group_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 티오더2 옵션 상품 리스트 불러오기, 엑셀 다운로드
export const requestOrderTwoOptionMenuListExcelDownload = (
  requestData: requestCategoryListExcelDownloadType,
) => {
  const url = endpoints.excel.option_item_lang_trans_list_download;

  return adminTokenApi
    .post(url, requestData, {
      validateStatus: (status: number) => status < 500,
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

// 언어번역 - 티오더2 옵션 상품 리스트 엑셀 일괄 업로드
export const requestOrderTwoOptionMenuListExcelUpload = (
  data: postExcelUploadData,
) => {
  const url = endpoints.excel.option_item_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 옵션그룹 엑셀 일괄 다운로드
export const requestOptionGroupExcelDownload = (storeCode: string) => {
  const url = endpoints.excel.goods_option_group_lang_trans_list_download;
  const data = { storeCode };

  return adminTokenApi
    .post(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 옵션그룹 엑셀 일괄 업로드
export const requestOptionGroupExcelUpload = (data: postExcelUploadData) => {
  const url = endpoints.excel.goods_option_group_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 옵션 상품 엑셀 일괄 다운로드
export const requestOptionMenuExcelDownload = (storeCode: string) => {
  const url = endpoints.excel.goods_option_item_lang_trans_list_download;
  const data = { storeCode };

  return adminTokenApi
    .post(url, data, { validateStatus: (status: number) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어번역 - 옵션 상품엑셀 일괄 업로드
export const requestOptionMenuExcelUpload = (data: postExcelUploadData) => {
  const url = endpoints.excel.goods_option_item_lang_trans_upload;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('langTransFile', data.langTransFile);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status: number) => status < 500 })
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
  postTorderTabletExcelFile,
  requestGoodsListExcelUpload,
  requestCategoryListExcelUpload,
  requestDescriptionListExcelUpload,
  requestOrderTwoOptionGroupListExcelDownload,
  requestOrderTwoOptionGroupListExcelUpload,
  requestOrderTwoOptionMenuListExcelDownload,
  requestOrderTwoOptionMenuListExcelUpload,
  requestOptionGroupExcelDownload,
  requestOptionGroupExcelUpload,
  requestOptionMenuExcelDownload,
  requestOptionMenuExcelUpload,
};
