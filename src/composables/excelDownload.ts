/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import axios from 'axios';
import { fileDownload } from '@utils/etcUtils';
import { failAuthenticationAlert } from '@utils/authentication';
import gatewayTokenApi from '@apis/axios/gatewayTokenApi';
import adminTokenApi from '@apis/axios/adminTokenApi';

export default function useExcelDownload() {
  const isLoading = ref(false);

  const downloadExcel = (excelTitle: string, excelFileHref: string) => {
    isLoading.value = true;

    axios({
      url: decodeURIComponent(excelFileHref),
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      isLoading.value = false;
      fileDownload({
        file: response.data,
        name: excelTitle ?? '',
      });
    });
  };

  const downloadExcelPostWithToken = async (
    excelTitle: string,
    excelFileHref: string,
    requestData: any,
  ) => {
    isLoading.value = true;

    return adminTokenApi({
      url: decodeURIComponent(excelFileHref),
      method: 'POST',
      responseType: 'blob',
      validateStatus: (status) => status < 500,
      data: requestData,
    })
      .catch((error) => {
        if (error.response.status === 400 || error.response.status === 500) {
          ElMessageBox.alert(error.response.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
      })
      .then((response: any) => {
        if (response.data.code === 401) {
          failAuthenticationAlert();
          return;
        }

        isLoading.value = false;
        fileDownload({
          file: response.data,
          name: excelTitle ?? '',
        });
      });
  };

  const getDownloadExcelWithToken = async (
    excelTitle: string,
    excelFileHref: string,
  ) => {
    try {
      const response = await gatewayTokenApi({
        url: decodeURIComponent(excelFileHref),
        method: 'GET',
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${excelTitle}.xlsx`;
      document.body.appendChild(link);
      link.click();
    } catch (error: any) {
      const responseData = JSON.parse(await error.response.data.text());
      ElMessageBox.alert(responseData.errorData.errorMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  };

  return {
    isLoading,
    downloadExcel,
    downloadExcelPostWithToken,
    getDownloadExcelWithToken,
  };
}
