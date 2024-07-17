import * as t from 'io-ts';
import { excess } from '@codecs/excess';

// codec
export const httpStatus = excess(
  t.type({
    message: t.string,
    code: t.number,
  }),
);

export const token = excess(
  t.type({
    accessToken: t.string,
    accessTokenExpiresAt: t.string,
    refreshToken: t.string,
    refreshTokenExpiresAt: t.string,
  }),
);

// type auth = t.TypeOf<typeof auth>;
export const auth = t.type({
  httpStatus,
  token,
});

export default {
  httpStatus,
  token,
  auth,
};
