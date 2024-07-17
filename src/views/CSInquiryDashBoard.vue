<script setup lang="ts">
import { ref, reactive } from 'vue';
import { dayjs, ElMessageBox, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import {
  PerWeekInquiryTypeBarChart,
  PerWeekProcessStateBarChart,
} from '@containers';
import { BreadcrumbHeader } from '@components';
import { CS_INQUIRY_DASHBOARD } from '@common/string';
import { inquiry } from '@apis';

const { requestWeekCommentData, requestSaveWeekCommentData } = inquiry;
const { failAuthenticationAlert } = authentication;

// 주차별 달력 첫요일 월요일 설정 로직
dayjs.Ls.en.weekStart = 1;

const csInquiryBoardHeader = reactive([{ name: CS_INQUIRY_DASHBOARD }]);

const searchWeeks = ref(new Date());

const commentEditState = ref(false);

// 1년 기준 주차 구하는 로직
const getYearWeekInfo = (date: Date) => {
  const currentYear = date.getFullYear();

  const firstDayOfYear = new Date(currentYear, 0, 1);
  const firstWeekDay = firstDayOfYear.getDay();

  if (firstWeekDay > 0 && firstWeekDay < 4) {
    firstDayOfYear.setDate(1 + ((7 - firstWeekDay) % 7));
  } else if (firstWeekDay > 4) {
    firstDayOfYear.setDate(8 + ((7 - firstWeekDay) % 7));
  }

  const elapsedDays = Math.floor(
    (Number(date) - Number(firstDayOfYear)) / (24 * 60 * 60 * 1000),
  );

  const weekNumber = Math.floor(elapsedDays / 7) + 1;

  return {
    year: currentYear,
    week: weekNumber,
  };
};

// 월 기준 주차 구하는 로직
const getMonthWeekInfo = (date: Date) => {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  const firstWeekStart = firstDayOfMonth;
  const firstWeekDay = firstDayOfMonth.getDay();
  if (firstWeekDay > 0 && firstWeekDay < 4) {
    firstWeekStart.setDate(1 + ((7 - firstWeekDay) % 7));
  } else if (firstWeekDay > 4) {
    firstWeekStart.setDate(8 + ((7 - firstWeekDay) % 7));
  }

  const elapsedDays = Math.floor(
    (Number(date) - Number(firstWeekStart)) / (24 * 60 * 60 * 1000),
  );
  const weekNumber = Math.floor(elapsedDays / 7) + 1;

  return {
    year: currentYear,
    month: currentMonth + 1,
    week: weekNumber,
  };
};

/** 주차별 코멘트 데이터 불러오기 */
const weekCommentData = ref('');
const getWeekCommentData = async () => {
  const requestData = {
    year: getYearWeekInfo(searchWeeks.value).year,
    weekDay: getYearWeekInfo(searchWeeks.value).week,
  };
  try {
    const res = (await requestWeekCommentData(requestData)) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      commentEditState.value = false;
      weekCommentData.value = res.data.data?.context ?? '';
    }
  } catch (error) {
    console.log(error);
  }
};

/** 주차별 코멘트 저장하기 */
const postSaveWeekCommentData = async () => {
  const requestData = {
    year: getYearWeekInfo(searchWeeks.value).year,
    weekDay: getYearWeekInfo(searchWeeks.value).week,
    context: weekCommentData.value,
  };
  try {
    const res = (await requestSaveWeekCommentData(
      requestData,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      commentEditState.value = false;
      ElMessage({
        type: 'success',
        message: '정상적으로 저장되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

getWeekCommentData();
</script>

<template>
  <BreadcrumbHeader :propsHeader="csInquiryBoardHeader" />
  <div class="dash-board-layout">
    <el-card
      class="width-100"
      shadow="never"
    >
      <el-row
        justify="center"
        class="mb-10"
      >
        <p class="dash-board-week-info">
          {{ getMonthWeekInfo(searchWeeks).year }}년
          {{ getMonthWeekInfo(searchWeeks).month }}월
          {{ getMonthWeekInfo(searchWeeks).week }}주차
        </p>
      </el-row>
      <el-row
        justify="center"
        class="mb-20"
      >
        <el-date-picker
          v-model="searchWeeks"
          type="week"
          format="ww [주차]"
          placeholder="해당 주차를 선택해주세요."
          :clearable="false"
          @change="getWeekCommentData"
        />
      </el-row>
      <div class="dash-board-chart-container">
        <PerWeekInquiryTypeBarChart :weeks="getYearWeekInfo(searchWeeks)" />
        <PerWeekProcessStateBarChart :weeks="getYearWeekInfo(searchWeeks)" />
        <div class="mt-20">
          <p>CS 관리자 코멘트 작성</p>
          <el-divider class="title-divider" />
          <el-input
            v-model="weekCommentData"
            :rows="5"
            type="textarea"
            class="mb-10"
            :disabled="!commentEditState"
          />
          <el-row
            v-if="!commentEditState"
            align="middle"
            justify="end"
          >
            <el-button
              type="primary"
              class="save-button"
              @click="commentEditState = true"
            >
              수정
            </el-button>
          </el-row>
          <el-row
            v-else
            align="middle"
            justify="end"
          >
            <el-button
              type="primary"
              class="save-button"
              @click="postSaveWeekCommentData"
            >
              저장
            </el-button>
            <el-button
              type="danger"
              class="save-button"
              @click="commentEditState = false"
            >
              취소
            </el-button>
          </el-row>
        </div>
      </div>
    </el-card>
    <el-card
      class="width-100"
      shadow="never"
    >
      <PerWeekInquiryTypeBarChart
        :weeks="getYearWeekInfo(searchWeeks)"
        categoryType="error_inquiry"
      />
      <PerWeekInquiryTypeBarChart
        :weeks="getYearWeekInfo(searchWeeks)"
        categoryType="visit_care"
      />
      <PerWeekInquiryTypeBarChart
        :weeks="getYearWeekInfo(searchWeeks)"
        categoryType="complain"
      />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dash-board-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  .dash-board-week-info {
    font-size: 24px;
    font-weight: bold;
  }

  .dash-board-chart-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
}

:deep(.el-input__inner) {
  text-align: center;
}

.title-divider {
  margin: 7px 0px;
}

.save-button {
  width: 120px;
}
</style>
