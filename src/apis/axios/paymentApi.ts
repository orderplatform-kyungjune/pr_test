import axios from 'axios';
import { PAYMENT_API_URL } from '@common/envVariables';

const paymentApi = axios.create({
  baseURL: PAYMENT_API_URL,
});

export default paymentApi;
