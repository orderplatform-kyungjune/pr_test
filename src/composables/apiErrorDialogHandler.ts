import { ElMessageBox } from 'element-plus';
import { ERROR_MESSAGE } from '@utils/apiUtil';

interface ApiErrorDialogHandlerType {
  error: any;
  onSubmit?: (status: number) => void;
  disableStatuses?: number[];
}

/**
 * api error dialog 일괄 처리 handler
 * @param error - api 요청 실패 error
 * @param onSubmit - error dialog "확인" 버튼 클릭시 callback
 * @param disableStatuses - error dialog disable 처리 status 목록
 *  */
const apiErrorDialogHandler = ({
  error,
  onSubmit = () => {},
  disableStatuses = [],
}: ApiErrorDialogHandlerType) => {
  // any type의 error 방어코드
  if (!error.status || !error.message) {
    ElMessageBox.alert(ERROR_MESSAGE, '실패', { type: 'error' });
    return;
  }

  if ([...disableStatuses, 401].includes(error.status)) {
    return;
  }

  ElMessageBox.alert(error.message, '실패', {
    type: 'error',
    callback: () => {
      onSubmit(error.status);
    },
  });
};

export default apiErrorDialogHandler;
