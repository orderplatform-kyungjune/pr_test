import axios from 'axios';
import { REST_API_URL } from '@common/envVariables';

const restApi = axios.create({
  baseURL: REST_API_URL,
});

export default restApi;
