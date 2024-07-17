<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useLoadingStore from '@store/storeLoading';
import {
  categoryListDataType,
  changedCategoryDataType,
  categoryListChildType,
  changedChildCategoryDataType,
} from '@interface/category';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import { STORE_LIST, CATEGORY_SETTING_SCHEDULE } from '@common/string';
import { categoryCodec } from '@codecs';
import { category } from '@apis';

const { failAuthenticationAlert } = authentication;

const { requestCategoryList, requestEditCategory } = category;
const { requestCategoryListCodec } = categoryCodec;

const { runtimeCheck } = runtimeCheckHelper;

// Loading Store
const { closeLoading } = useLoadingStore();

// query
const route = useRoute();

// header props
const categoryManageHeader = reactive([
  { name: STORE_LIST },
  { name: CATEGORY_SETTING_SCHEDULE },
]);

const dayOfWeekData = [
  {
    value: 'Mon',
    label: '월',
  },
  {
    value: 'Tue',
    label: '화',
  },
  {
    value: 'Wed',
    label: '수',
  },
  {
    value: 'Thu',
    label: '목',
  },
  {
    value: 'Fri',
    label: '금',
  },
  {
    value: 'Sat',
    label: '토',
  },
  {
    value: 'Sun',
    label: '일',
  },
];

const getStartHourTimeTable = () => {
  const hour = [];
  for (let i = 0; i < 24; i += 1) {
    if (i < 10) {
      hour.push({
        value: `0${i}`,
        label: `0${i}시`,
      });
    } else {
      hour.push({
        value: i.toString(),
        label: `${i}시`,
      });
    }
  }
  return hour;
};

const getEndHourTimeTable = () => {
  const hour = [];
  for (let i = 0; i < 31; i += 1) {
    if (i < 10) {
      hour.push({
        value: `0${i}`,
        label: `0${i}시`,
      });
    } else {
      hour.push({
        value: i.toString(),
        label: `${i}시`,
      });
    }
  }
  return hour;
};

const getMinTimeTable = () => {
  const min = [];
  for (let i = 0; i < 6; i += 1) {
    if (i === 0) {
      min.push({
        value: '00',
        label: '00분',
      });
    } else {
      min.push({
        value: (i * 10).toString(),
        label: `${i * 10}분`,
      });
    }
  }
  return min;
};

const getStartTime = (startHourTime: string, startMinTime: string) =>
  `${startHourTime}:${startMinTime}:00`;
const getEndTime = (endHourTime: string, endMinTime: string) =>
  `${endHourTime}:${endMinTime}:00`;

const setHour = (time: string) => {
  let refinedHour = '';
  if (time) {
    const [hour] = time.split(':');
    refinedHour = hour;
  }
  return refinedHour;
};

const setMin = (time: string) => {
  let refinedMin = '';
  if (time) {
    const [, min] = time.split(':');
    refinedMin = min;
  }
  return refinedMin;
};

const startHourTimeTable = getStartHourTimeTable();
const endHourTimeTable = getEndHourTimeTable();
const minTimeTable = getMinTimeTable();

const fullLoading = ref(false);
/** 분류 리스트 데이터 */
const categoryInfoData = ref<changedCategoryDataType[]>([]);
/** 분류 리스트 데이터 요청 */
const getCategoryInfo = async () => {
  try {
    fullLoading.value = true;
    const config = route.query.code as string;
    const res = (await requestCategoryList(config)) as AxiosResponse;
    const typeError = runtimeCheck(requestCategoryListCodec, res.data);

    if (res.data.code === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
      closeLoading();
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
      closeLoading();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        const newCategoryData: changedCategoryDataType[] =
          [] as changedCategoryDataType[];

        // 직원호출 분류 제거
        const resData = res.data.data?.filter(
          (findCategory: categoryListDataType) =>
            Number(findCategory.categoryCode) !== 20000,
        );

        resData.forEach((first: categoryListDataType, firstIndex: number) => {
          newCategoryData.push({
            id: `parents-${firstIndex + 1}`,
            categoryCode: first.categoryCode,
            categoryName: first.categoryName,
            categoryUse: first.categoryUse,
            categoryScheduleOn: first.categoryScheduleOn,
            categoryStartTime: first.categoryStartTime,
            categoryEndTime: first.categoryEndTime,
            categoryWeekDayArr: first.categoryWeekDayArr,
            children: [],
            startHour: setHour(first.categoryStartTime),
            startMin: setMin(first.categoryStartTime),
            endHour: setHour(first.categoryEndTime),
            endMin: setMin(first.categoryEndTime),
          });
          first.childCategoryList.forEach(
            (second: categoryListChildType, secondIndex: number) => {
              newCategoryData[firstIndex].children.push({
                id: `child-${secondIndex + 1}`,
                parentCategoryCode: first.categoryCode,
                categoryCode: second.childCategoryCode,
                categoryName: second.childCategoryName,
                parentCategoryUse: first.categoryUse,
                categoryUse: second.childCategoryUse,
                categoryScheduleOn: second.childScheduleOn,
                categoryStartTime: second.childCategoryStartTime,
                categoryEndTime: second.childCategoryEndTime,
                categoryWeekDayArr: second.childCategoryWeekDayArr,
                startHour: setHour(second.childCategoryStartTime),
                startMin: setMin(second.childCategoryStartTime),
                endHour: setHour(second.childCategoryEndTime),
                endMin: setMin(second.childCategoryEndTime),
              });
            },
          );
        });
        categoryInfoData.value = newCategoryData;
        closeLoading();
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    fullLoading.value = false;
  }
};

/** 스케줄 설정하기 */
const setCategorySchedule = async (
  target: changedCategoryDataType & changedChildCategoryDataType,
) => {
  const config = route.query.code as string;
  const isFirstCategory = target.children !== undefined;
  const isScheduleSetting = target.categoryScheduleOn === 'Y';

  const isWeekExist = !!target.categoryWeekDayArr.length;

  if (isScheduleSetting && !isWeekExist) {
    ElMessageBox.alert('요일을 선택해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  let setScheduleData;

  if (isFirstCategory) {
    setScheduleData = {
      editType: 'category',
      storeCode: config,
      updateCategoryCode: [target.categoryCode],
      updateCategoryStartTime: [
        getStartTime(target.startHour, target.startMin),
      ],
      updateCategoryEndTime: [getEndTime(target.endHour, target.endMin)],
      updateCategoryWeekDays: [target.categoryWeekDayArr],
      updateCategoryScheduleOn: [target.categoryScheduleOn],
      updateCategoryUse: [target.categoryUse],
    };
  } else {
    setScheduleData = {
      editType: 'child_category',
      storeCode: config,
      categoryCode: target.parentCategoryCode,
      updateCategoryCode: [target.categoryCode],
      updateCategoryStartTime: [
        getStartTime(target.startHour, target.startMin),
      ],
      updateCategoryEndTime: [getEndTime(target.endHour, target.endMin)],
      updateCategoryWeekDays: [target.categoryWeekDayArr],
      updateCategoryScheduleOn: [target.categoryScheduleOn],
      updateCategoryUse: [target.categoryUse],
    };
  }

  const isWrongTime = () => {
    const startTime = `${target.startHour}${target.startMin}`;
    const endTime = `${target.endHour}${target.endMin}`;
    return startTime >= endTime;
  };

  if (isScheduleSetting && isWrongTime()) {
    ElMessageBox.alert('시작 시간과 종료 시간을 확인해주세요.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return;
  }

  try {
    const res = (await requestEditCategory(setScheduleData)) as AxiosResponse;

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
      ElMessageBox({
        type: 'success',
        message: '정상적으로 적용되었습니다.',
      });
      await getCategoryInfo();
    }
  } catch (error) {
    console.log(error);
  }
};

const isSaleSetting = (use: string) => use === 'N';

getCategoryInfo();
</script>

<template>
  <BreadcrumbHeader :propsHeader="categoryManageHeader" />
  <StoreNameBox />
  <el-table
    v-loading="fullLoading"
    element-loading-text="로딩 중입니다.."
    :data="categoryInfoData"
    class="mt-10"
    border
    row-key="id"
    default-expand-all
  >
    <el-table-column
      prop="categoryName"
      label="분류 이름"
      align="left"
      header-align="center"
    />
    <el-table-column
      label="노출 여부"
      align="center"
      header-align="center"
      width="150"
    >
      <template #default="scope">
        <el-switch
          v-model="scope.row.categoryUse"
          active-text="노출"
          active-value="Y"
          inactive-text="미노출"
          inactive-value="N"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          :disabled="isSaleSetting(scope.row.parentCategoryUse)"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="스케줄 사용"
      align="center"
      header-align="center"
      width="170"
    >
      <template #default="scope">
        <el-switch
          v-model="scope.row.categoryScheduleOn"
          active-text="사용"
          active-value="Y"
          inactive-text="미사용"
          inactive-value="N"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          :disabled="isSaleSetting(scope.row.parentCategoryUse)"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="요일 설정"
      align="center"
      header-align="center"
      min-width="100"
    >
      <template #default="scope">
        <el-select
          v-model="scope.row.categoryWeekDayArr"
          multiple
          placeholder="요일을 선택해주세요."
          class="schedule-select-box"
          :disabled="isSaleSetting(scope.row.parentCategoryUse)"
        >
          <el-option
            v-for="day in dayOfWeekData"
            :key="day.value"
            :label="day.label"
            :value="day.value"
          />
        </el-select>
      </template>
    </el-table-column>
    <el-table-column
      label="시작 시간"
      align="center"
      header-align="center"
      min-width="100"
    >
      <template #default="scope">
        <div class="time-box">
          <el-select
            v-model="scope.row.startHour"
            placeholder="시"
            :disabled="isSaleSetting(scope.row.parentCategoryUse)"
          >
            <el-option
              v-for="time in startHourTimeTable"
              :key="time.value"
              :label="time.label"
              :value="time.value"
            />
          </el-select>
          <el-select
            v-model="scope.row.startMin"
            placeholder="분"
            :disabled="isSaleSetting(scope.row.parentCategoryUse)"
          >
            <el-option
              v-for="time in minTimeTable"
              :key="time.value"
              :label="time.label"
              :value="time.value"
            />
          </el-select>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      label="종료 시간"
      align="center"
      header-align="center"
      min-width="100"
    >
      <template #default="scope">
        <div class="time-box">
          <el-select
            v-model="scope.row.endHour"
            placeholder="시"
            :disabled="isSaleSetting(scope.row.parentCategoryUse)"
          >
            <el-option
              v-for="time in endHourTimeTable"
              :key="time.value"
              :label="time.label"
              :value="time.value"
            />
          </el-select>
          <el-select
            v-model="scope.row.endMin"
            placeholder="분"
            :disabled="isSaleSetting(scope.row.parentCategoryUse)"
          >
            <el-option
              v-for="time in minTimeTable"
              :key="time.value"
              :label="time.label"
              :value="time.value"
            />
          </el-select>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      label="관리"
      align="center"
      header-align="center"
      width="100"
    >
      <template #default="scope">
        <el-button
          type="primary"
          :disabled="isSaleSetting(scope.row.parentCategoryUse)"
          @click="setCategorySchedule(scope.row)"
        >
          저장
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style>
.schedule-select-box {
  width: 200px;
}

.time-box {
  display: flex;
  gap: 20px;
}
</style>
