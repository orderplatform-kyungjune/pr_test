import { PATTERN_TAX_ID } from '@common/regexPatterns';

const createRegExp = (pattern: string, flag?: string) =>
  new RegExp(pattern, flag);

const formatPhoneNumber = (inputValue: string) => {
  if (!inputValue) return '';

  let phoneNumber = inputValue.replace(/\D/g, '').substring(0, 11);
  let pattern;

  if (phoneNumber.length < 3) return inputValue;

  if (phoneNumber.startsWith('02')) {
    if (phoneNumber.length <= 5) {
      pattern = /(\d{2})(\d{0,4})/;
    } else if (phoneNumber.length === 9) {
      pattern = /(\d{2})(\d{3})(\d{0,4})/;
    } else {
      phoneNumber = phoneNumber.substring(0, 10);
      pattern = /(\d{2})(\d{4})(\d{0,4})/;
    }
  } else if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
    pattern = /(\d{3})(\d{0,3})/;
  } else if (phoneNumber.length === 10) {
    pattern = /(\d{3})(\d{3})(\d{0,4})/;
  } else {
    pattern = /(\d{3})(\d{4})(\d{0,4})/;
  }

  return phoneNumber.replace(pattern, (match, p1, p2, p3) =>
    p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`,
  );
};

const parseOnlyNumber = (value: string) => value.replace(/[^0-9]/g, '');

const isValidPhoneNumber = (inputValue: string) => {
  const phoneNumber = inputValue?.replace(/[^0-9]/g, '') ?? '';
  if (phoneNumber.length === 9) return /^02-\d{3}-\d{4}$/.test(inputValue);
  if (phoneNumber.length === 10) {
    return (
      /^02-\d{3}-\d{4}$/.test(inputValue) ||
      /^\d{3}-\d{3}-\d{4}$/.test(inputValue)
    );
  }
  if (phoneNumber.length === 11) return /^\d{3}-\d{4}-\d{4}$/.test(inputValue);
  return false;
};

const maskAllNumber = (target: string, maskWord?: string) => {
  if (!target) return '-';
  return target.replace(/\d/g, maskWord ?? '*');
};

const isAllMasked = (target: string, maskWord?: string) => {
  if (!target) return false;
  const reg = createRegExp(maskWord || '\\*', 'g');
  const maskingCount = target.match(reg)?.length || 0;
  return target.replaceAll('-', '').length === maskingCount;
};

// 사업자번호 formatting xxx-xx-xxxxx
const formatTaxId = (inputValue: string) => {
  if (!inputValue) return '';
  const taxId = inputValue.replace(/\D/g, '').substring(0, 10); // 문자 제거 후 10자리
  let pattern;

  if (taxId.length > 3 && taxId.length <= 5) {
    pattern = /(\d{3})(\d{0,3})/;
  } else {
    pattern = /(\d{3})(\d{2})(\d{0,5})/;
  }

  return taxId.replace(pattern, (match, p1, p2, p3) =>
    p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`,
  );
};

const isValidTaxId = (inputNumber: string) => {
  const taxRegExp = createRegExp(`^${PATTERN_TAX_ID}$`);
  return taxRegExp.test(inputNumber);
};

export default {
  formatPhoneNumber,
  isValidPhoneNumber,
  maskAllNumber,
  formatTaxId,
  isValidTaxId,
  createRegExp,
  isAllMasked,
  parseOnlyNumber,
};
