import { ElMessageBox } from 'element-plus';
import axios, { AxiosResponse } from 'axios';
import { s3GlobalizationLanguageJsonType } from '@interface/language';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

/** S3 국제화된 언어별 Json file 불러오기, 서버요청 x */
export const requestJsonFileByLanguageFromS3 = (
  language: string,
): Promise<AxiosResponse> => {
  const url = `${endpoints.s3_globalization_language.language}${language}.json`;
  return axios.get(url, { headers: { 'Cache-Control': 'no-cache' } });
};

/** S3 국제화된 언어별 Json file 저장하기, 서버요청 O */
export const requestUpdateJsonFileByLanguageFromS3 = (
  language: string,
  json: s3GlobalizationLanguageJsonType,
) => {
  const url = endpoints.tablet.language_save;

  return adminTokenApi
    .post(
      url,
      {
        type: language,
        language_array: json,
      },
      { validateStatus: (status) => status < 500 },
    )
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
  requestJsonFileByLanguageFromS3,
  requestUpdateJsonFileByLanguageFromS3,
};
