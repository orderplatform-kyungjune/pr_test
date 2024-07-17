const isCountableList = (totalCount: number) => totalCount !== 0;

const getListTotalCount = (totalCount: number) => {
  if (totalCount !== 0) {
    return `${totalCount}`;
  }
  return '검색 결과 없음';
};

export default {
  isCountableList,
  getListTotalCount,
};
