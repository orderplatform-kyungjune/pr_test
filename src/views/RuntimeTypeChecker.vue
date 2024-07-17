<script lang="ts" setup>
import { onMounted } from 'vue';
import { isLeft } from 'fp-ts/Either';

import { getTypeError } from '@utils/reports';
import { authCodec } from '@codecs';

onMounted(() => {
  const mock = {
    httpStatus: {
      message: 'message',
      code: '123',
      // add: 'dddd',
      // ad1d: 'dddd',
    },
    token: {
      accessToken: 't.string',
      accessTokenExpiresAt: 't.string',
      refreshToken: 't.string',
      refreshTokenExpiresAt: 't.string',
    },
  };

  const validationData = authCodec.auth.decode(mock);
  const isException = isLeft(validationData);
  if (isException) {
    const runtimeErrorProperties = getTypeError(validationData);

    runtimeErrorProperties.forEach((err) => {
      // 정의되지 않은 프로퍼티가 추가시
      const isExcess =
        typeof err === 'string' && err.indexOf('excess key') > -1;
      if (isExcess) {
        console.log('정의되지 않은 프로퍼티가 추가시', err);
      } else {
        console.log('타입 에러', err);
      }
    });
  }
});
</script>

<template>
  <div>개발자 도구 열어서 로그 창을 보시오.</div>
</template>

<style lang="scss" scoped>
// SCSS
</style>
