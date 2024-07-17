import { forEach } from 'lodash';
import {
  fileDownloadType,
  FileExtensionCheckType,
  SetFormDataParamsType,
} from '@interface/etc';

const convertToEllipsis = (categoryName: string, limitCount?: number) => {
  const limit = limitCount ?? 12; // limitCount 미입력 시 기본 12자
  if (categoryName?.length > limit) {
    return `${categoryName.slice(0, limit)}...`;
  }

  return categoryName;
};

const replaceEmptyString = (value: any) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return value || '-';
};

const giveFocusToElementById = (elementId: string) => {
  document.getElementById(elementId)?.focus();
};

/**
 * 티오더2 커스텀컬러의 주색상을 변환해주는 로직
 * hex => hsl (hsl(a, b% (c - option)%)
 * */
const getSubPrimaryColorInTabletPreview = (
  H: string,
  option: number,
  use: string,
) => {
  // 커스텀 색상 미사용일 경우
  if (use === 'N') return '#3A5E05';
  if (H === '#000' || H === '#000000') return '#333333';

  let r = '0';
  let g = '0';
  let b = '0';

  if (H.length === 4) {
    r = `0x${H[1]}${H[1]}`;
    g = `0x${H[2]}${H[2]}`;
    b = `0x${H[3]}${H[3]}`;
  } else if (H.length === 7) {
    r = `0x${H[1]}${H[2]}`;
    g = `0x${H[3]}${H[4]}`;
    b = `0x${H[5]}${H[6]}`;
  }

  // Then to HSL
  const r2 = Number(r) / 255;
  const g2 = Number(g) / 255;
  const b2 = Number(b) / 255;

  const cmin = Math.min(r2, g2, b2);
  const cmax = Math.max(r2, g2, b2);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r2) {
    h = ((g2 - b2) / delta) % 6;
  } else if (cmax === g2) {
    h = (b2 - r2) / delta + 2;
  } else {
    h = (r2 - g2) / delta + 4;
  }

  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `hsl(${h},${s}%,${l - option}%)`;
};

const maskAllNumber = (target: string, maskWord?: string) => {
  if (!target) return '-';
  return target.replace(/\d/g, maskWord ?? '*');
};

/**
 * 파일의 확장자를 검사한다.
 * @param currentExtension - 현재 파일 확장자
 * @param allowExtensions - 통과될 파일 확장자 목록
 * @returns return - 일치하는 확장자가 없을경우 true
 */
const fileExtensionCheck = ({
  currentExtension,
  allowExtensions,
}: FileExtensionCheckType) =>
  !allowExtensions.some(
    (allowExtension) => currentExtension === allowExtension,
  );

/**
 * object 반복문을 통해 key와 value를 FormData에 append한다.(object의 value가 null or undefined일경우 제외)
 * @param object - FormData에 append될 target object
 * @returns return - FormData
 */
const setFormData = ({ object }: SetFormDataParamsType) => {
  const formData = new FormData();

  forEach(object, (value, key) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  return formData;
};

/**
 * blob 파일을 다운로드
 * @param file - 파일 blob 객체
 * @param name - 다운로드시 적용될 파일 이름
 */
export const fileDownload = ({ file, name }: fileDownloadType) => {
  const blobUrl = window.URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export default {
  setFormData,
  convertToEllipsis,
  replaceEmptyString,
  giveFocusToElementById,
  getSubPrimaryColorInTabletPreview,
  maskAllNumber,
  fileExtensionCheck,
};
