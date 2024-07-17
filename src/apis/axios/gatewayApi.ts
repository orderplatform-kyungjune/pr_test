import axios from 'axios';
import { GATE_WAY_API_URL } from '@common/envVariables';

const gatewayApi = axios.create({
  baseURL: GATE_WAY_API_URL,
});

export default gatewayApi;
