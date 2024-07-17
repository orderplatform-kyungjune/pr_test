import axios from 'axios';
import { WAITING_API_URL } from '@common/envVariables';

const waitingApi = axios.create({
  baseURL: WAITING_API_URL,
});

export default waitingApi;
