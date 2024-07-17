import { ElMessageBox } from 'element-plus';
import { requestDailyOrderStatsType } from '@interface/stats';
import endpoints from '@apis/endpoints';
import gatewayApi from '@apis/axios/gatewayApi';

// 일별 주문건수 통계 데이터 불러오기
export const requestDailyOrderStatsList = (
  searchData: requestDailyOrderStatsType,
) => {
  const url = `${endpoints.stats.daily}?page=${searchData.page}&size=${searchData.size}&startDate=${searchData.startDate}&endDate=${searchData.endDate}`;

  return gatewayApi.get(url).catch((error) => {
    if (error.response.status === 400 || error.response.status === 500) {
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

export default { requestDailyOrderStatsList };
