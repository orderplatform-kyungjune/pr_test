type EnvironmentType = 'development' | 'staging' | 'production';
type ServiceTargetType =
  | 'origin'
  | 'sg'
  | 'sydney'
  | 'uplus'
  | 'us_east'
  | 'global'
  | 'brand1'
  | 'partners';
type BusinessNameType = '티오더' | 'U+오더' | '소상공인' | '파트너스';

export const ENVIRONMENT: EnvironmentType = import.meta.env.VITE_ENVIRONMENT;
export const SERVICE_TARGET: ServiceTargetType = import.meta.env
  .VITE_SERVICE_TARGET;
export const BUSINESS_NAME: BusinessNameType =
  import.meta.env.VITE_BUSINESS_NAME || '티오더';
export const SHOP_ADMIN_URL = import.meta.env.VITE_SHOP_ADMIN_URL;
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;
export const GATE_WAY_API_URL = import.meta.env.VITE_GATE_WAY_API_URL;
export const LANG_S3_API_URL = import.meta.env.VITE_LANG_S3_API_URL;
export const REST_API_URL = import.meta.env.VITE_REST_API_URL;
export const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL;
export const WAITING_API_URL = import.meta.env.VITE_WAITING_API_URL;
