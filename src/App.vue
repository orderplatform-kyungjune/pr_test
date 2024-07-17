<template>
  <router-view />
</template>

<style lang="scss">
@import '@styles/reset.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500&display=swap');

html,
body {
  font-family: 'Noto Sans KR', sans-serif;
  scrollbar-width: none;

  &:root {
    --el-text-color-regular: #000;
    // 테마 적용 테스트용 주석
    /* --el-color-primary:  #79bbff;
    --el-color-success:  #95d475;
    --el-color-warning:  #eebe77;
    --el-color-danger:  #f89898;
    --el-color-info:  #b1b3b8; */
  }

  .el-table .el-table__cell .cell {
    padding: 0 10px;
  }
}

.mt-5 {
  margin-top: 5px;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-40 {
  margin-top: 40px;
}

.mb-5 {
  margin-bottom: 5px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mb-30 {
  margin-bottom: 30px;
}

.mb-40 {
  margin-bottom: 40px;
}

.mr-5 {
  margin-right: 5px;
}

.mr-10 {
  margin-right: 10px;
}

.mr-20 {
  margin-right: 20px;
}

.mr-30 {
  margin-right: 30px;
}

.mr-40 {
  margin-right: 40px;
}

.mr-60 {
  margin-right: 60px;
}

.mr-100 {
  margin-right: 100px;
}

.ml-5 {
  margin-left: 5px;
}

.ml-10 {
  margin-left: 10px;
}

.ml-20 {
  margin-left: 20px;
}

.ml-30 {
  margin-left: 30px;
}

.font-emphasis {
  font-size: 16px;
  font-weight: 500;
}

.font-small {
  font-size: 13px;
}

.bg-p {
  padding: 10px;
  background-color: #f1f1ff;
  border-radius: 5px;
}

.essential-star {
  color: #ff6060;
}

.gray-word {
  color: #adafbc;
}

.loading-layout-for-category {
  z-index: 3000 !important;
}

.ellipsis-text-1 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.ellipsis-text-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ellipsis-text-3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.width-100 {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.purple-color {
  color: #626aef;
}

.font-thin {
  font-family: sans-serif;
}

a {
  color: #fff;
  text-decoration: none;
}
</style>
