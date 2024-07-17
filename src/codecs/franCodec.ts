import * as t from 'io-ts';
import { excess } from '@codecs/excess';

const requestFranchiseListDataCodec = excess(
  t.type({
    no: t.string,
    T_Order_Fran_code: t.string,
    T_Order_Fran_name: t.string,
  }),
);

const requestFranchiseListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(requestFranchiseListDataCodec),
  }),
);

export default { requestFranchiseListCodec };
