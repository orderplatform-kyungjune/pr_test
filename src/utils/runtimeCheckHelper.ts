import { Mixed } from 'io-ts';
import { isLeft } from 'fp-ts/Either';
import { AxiosResponse } from 'axios';
import { getTypeError } from '@utils/reports';
import { ENVIRONMENT } from '@common/envVariables';

// import { iValue } from '@interface/codecs';

interface iValue {
  status: number;
  statusText: string;
  data: AxiosResponse;
}

export const runtimeCheck = (auth: Mixed, value: iValue): boolean => {
  // 우선적으로 개발모드에서만 작동
  if (ENVIRONMENT === 'development') {
    const validationData = auth.decode(value);
    const isException = isLeft(validationData);

    if (isException) {
      const runtimeErrorProperties = getTypeError(validationData);

      // 중복 요소 제거
      const extractionRuntimeErrorProperties = runtimeErrorProperties.filter(
        (v, i) => runtimeErrorProperties.indexOf(v) === i,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractionRuntimeErrorProperties.forEach((err: any) => {
        // 정의되지 않은 프로퍼티가 추가시
        const isExcess =
          typeof err === 'string' && err.indexOf('excess key') > -1;
        if (isExcess) {
          console.log('정의되지 않은 프로퍼티가 추가시', err);
          // ElNotification({
          //   title: '정의 되지 않거나 추가된 프로퍼티',
          //   message: h('p', null, [h('p', null, `${err}`)]),
          // });
        } else {
          // ElNotification({
          //   title: '타입 에러',
          //   message: h('p', null, [
          //     h('p', null, `- 서버에서 넘어 온 값 :: ${err.value}`),
          //     h('p', null, `- io-ts 지정 속성 :: ${err.name}`),
          //     h('p', null, `- io-ts 지정 타입 ::  ${err.type}`),
          //   ]),
          // });
          console.log('타입 에러', err);
        }
        return true;
      });
      return false;
    }
  }
  // 타입 에러 없음.
  return false;
};

export default { runtimeCheck };
