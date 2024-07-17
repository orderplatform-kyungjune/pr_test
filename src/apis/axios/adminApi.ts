import axios from 'axios';
import { ADMIN_API_URL } from '@common/envVariables';

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  withCredentials: true,
});

export default adminApi;
