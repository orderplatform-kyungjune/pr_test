import { AxiosResponse, isAxiosError } from 'axios';

export interface ApiErrorType {
  message: string;
  status: number;
}

/**
 * api response error 발생시 사용, custom error
 * */
export class ApiError extends Error {
  readonly status: number = 0;

  constructor({ status, message }: ApiErrorType) {
    super(message);
    this.status = status;
  }
}

type FullApiResponseType<T> = {
  code: number;
  result: boolean;
  msg?: string;
} & T;

export const ERROR_MESSAGE = '네트워크 에러 입니다. 개발자에게 문의하세요.';

/**
 * api setting handler, api 규격에 맞는 성공/실패 처리
 * @param axiosInstance - axios instance
 * @return return - 동적 타입의 axiosResponse Promise 객체
 * */
export const setAxiosApi = <T>(
  axiosInstance: Promise<AxiosResponse<FullApiResponseType<T>>>,
): Promise<FullApiResponseType<T>> =>
  axiosInstance
    .then((response) => {
      // api 요청 성공, response 규격이 올바를 경우
      if (response?.data?.code) {
        if (response.data.code === 200) {
          return Promise.resolve(response.data);
        }

        throw new ApiError({
          status: response.data.code,
          message: response?.data?.msg || ERROR_MESSAGE,
        });
      }

      // api 요청 성공, response 규격이 올바르지 않을 경우
      throw new ApiError({
        status: 500,
        message: ERROR_MESSAGE,
      });
    })
    .catch((error) => {
      if (isAxiosError(error)) {
        // network error, api error 규격이 올바를 경우
        if (error.response && error.response.status) {
          return Promise.reject(
            new ApiError({
              status: error.response.status,
              message: error.response?.data?.msg || ERROR_MESSAGE,
            }),
          );
        }

        // network error, api error 규격이 올바르지 않을 경우
        return Promise.reject(
          new ApiError({
            status: 500,
            message: error.message || ERROR_MESSAGE,
          }),
        );
      }

      // api 요청 성공, throw error에 의한 error 처리
      return Promise.reject(error);
    });
