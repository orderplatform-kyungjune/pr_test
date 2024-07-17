import { test, expect, describe, beforeAll } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { ApiErrorType, ERROR_MESSAGE, setAxiosApi } from '@utils//apiUtil';

const mock = new MockAdapter(axios);

describe('network error 테스트', () => {
  const url = '/test1';
  const errorMessage = '토큰 인증 오류입니다.';

  mock.onGet(url).reply(401, { msg: errorMessage });

  let isError: null | ApiErrorType = null;
  beforeAll(() => {
    setAxiosApi({
      instance: axios,
      config: {
        method: 'GET',
        url,
      },
    }).catch((error) => {
      isError = error;
    });
  });

  test('401 status 검증', () => {
    expect(isError).toHaveProperty('status', 401);
  });
  test('error message 검증', () => {
    expect(isError).toHaveProperty('message', errorMessage);
  });
});

describe('status 200으로 api 요청 성공, server error code 400 테스트', () => {
  const url = '/test2';
  const errorMessage = '토큰 인증 오류입니다.';

  mock.onGet(url).reply(200, {
    code: 400,
    msg: errorMessage,
  });

  let isError: null | ApiErrorType = null;
  beforeAll(() => {
    setAxiosApi({
      instance: axios,
      config: {
        method: 'GET',
        url,
      },
    }).catch((error) => {
      isError = error;
    });
  });

  test('400 status 검증', () => {
    expect(isError).toHaveProperty('status', 400);
  });
  test('error message 검증', () => {
    expect(isError).toHaveProperty('message', errorMessage);
  });
});

describe('status 200으로 api 요청 성공, response 규격이 올바르지 않음', () => {
  const url = '/test3';

  mock.onGet(url).reply(200, { wrongResponse: 'wrong' });

  let isError: null | ApiErrorType = null;
  beforeAll(() => {
    setAxiosApi({
      instance: axios,
      config: {
        method: 'GET',
        url,
      },
    }).catch((error) => {
      isError = error;
    });
  });

  test('500 status 검증', () => {
    expect(isError).toHaveProperty('status', 500);
  });
  test('error message 검증', () => {
    expect(isError).toHaveProperty('message', ERROR_MESSAGE);
  });
});
