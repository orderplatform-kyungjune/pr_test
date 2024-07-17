import { dayjs } from 'element-plus';

// 10 미만인 수의 앞에 0을 붙혀 두자리로 반환
const leftPad = (value: number) => {
  if (value >= 10) {
    return value;
  }
  return `0${value}`;
};

// Date 인자로 전달 시 YYYY-MM-HH 형식으로 return 하는 함수.
const refineDate = (dateInfo: Date) => {
  const year = dateInfo.getFullYear();
  const month = leftPad(dateInfo.getMonth() + 1);
  const day = leftPad(dateInfo.getDate());
  return [year, month, day].join('-');
};

const refineTime = (dateInfo: Date) => {
  const hours = `0${dateInfo.getHours()}`.slice(-2);
  const minutes = `0${dateInfo.getMinutes()}`.slice(-2);
  const seconds = `0${dateInfo.getSeconds()}`.slice(-2);

  const timeString = `${hours}:${minutes}:${seconds}`;
  return timeString;
};

const refinedTime = () => {
  const dateTime = new Date();
  return refineTime(dateTime);
};

const refinedToday = () => {
  const dateTime = new Date();
  return refineDate(dateTime);
};

const refinedThreeDay = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24 * 3);
  return refineDate(dateTime);
};

const refinedYesterday = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24);
  return refineDate(dateTime);
};

const refinedWeek = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24 * 7);
  return refineDate(dateTime);
};

const refinedMonth = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24 * 30);
  return refineDate(dateTime);
};

const refinedThreeMonth = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24 * 30 * 3);
  return refineDate(dateTime);
};

const refinedSixMonth = () => {
  const dateTime = new Date();
  dateTime.setTime(dateTime.getTime() - 3600 * 1000 * 24 * 30 * 6);
  return refineDate(dateTime);
};

const convertServerTimeToKorea = (serverTime: string) =>
  serverTime
    ? dayjs(serverTime).locale('ko').format('YYYY-MM-DD HH:mm:ss')
    : '-';

export default {
  refinedTime,
  refinedToday,
  refinedYesterday,
  refinedThreeDay,
  refinedWeek,
  refinedMonth,
  refinedThreeMonth,
  refinedSixMonth,
  convertServerTimeToKorea,
};
