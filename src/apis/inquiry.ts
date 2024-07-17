import { ElMessageBox } from 'element-plus';
import {
  requestCsInquiryDataType,
  requestCreateInquiryType,
  requestUpdateInquiryType,
  requestWeekChartDataType,
  requestWeekCommentListType,
  requestCsInquiryCommonParamType,
} from '@interface/inquiry';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// cs 문의 게시판 문의 내역 리스트 불러오기
export const requestCsInquiryData = (pageInfo: requestCsInquiryDataType) => {
  const url = endpoints.cs.inquiry.list;

  return adminTokenApi
    .post(url, pageInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 셀렉트박스 옵션 리스트 불러오기
export const requestCommonSelectOptionData = (
  payload: requestCsInquiryCommonParamType,
) => {
  const url = endpoints.cs.inquiry.common;

  return adminTokenApi
    .post(url, payload, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 해당 매장 문의 내역 리스트 불러오기
export const requestStoreInquiryData = (storeCode: string, num?: number) => {
  const url = endpoints.cs.inquiry.list_store;
  const requestData = {
    storeCode,
    num,
  };

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

// 문의 저장하기
export const requestCreateInquiry = (inquiryData: requestCreateInquiryType) => {
  const url = endpoints.cs.inquiry.create;

  return adminTokenApi
    .post(url, inquiryData, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 문의 수정하기
export const requestUpdateInquiry = (inquiryData: requestUpdateInquiryType) => {
  const url = endpoints.cs.inquiry.update;

  return adminTokenApi
    .post(url, inquiryData, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 문의 상세 내역 정보
export const requestInquiryDetailInfo = (num: number) => {
  const url = endpoints.cs.inquiry.info;
  const inquiryNumber = { num };

  return adminTokenApi
    .post(url, inquiryNumber, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 주차별 문의 차트 데이터
export const requestWeekChartData = (data: requestWeekChartDataType) => {
  let url = `${endpoints.cs.inquiry.chart_data}?type=${data.type}&year=${data.year}&weekDay=${data.weekDay}`;

  if (data.categoryType) {
    url = url.concat(`&categoryType=${data.categoryType}`);
  }

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

// 주차별 코멘트 불러오기
export const requestWeekCommentData = (data: requestWeekCommentListType) => {
  const url = `${endpoints.cs.inquiry.chart_comment_list}?year=${data.year}&weekDay=${data.weekDay}`;

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

// 주차별 코멘트 저장, 수정하기
export const requestSaveWeekCommentData = (
  data: requestWeekCommentListType,
) => {
  const url = endpoints.cs.inquiry.chart_comment;

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
  requestCsInquiryData,
  requestCommonSelectOptionData,
  requestStoreInquiryData,
  requestCreateInquiry,
  requestUpdateInquiry,
  requestInquiryDetailInfo,
  requestWeekChartData,
  requestWeekCommentData,
  requestSaveWeekCommentData,
};
