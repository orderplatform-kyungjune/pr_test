<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { ref, watch, reactive, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart,
  Title,
  Legend,
  Tooltip,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import { inquiry } from '@apis';

const { requestWeekChartData } = inquiry;
const { failAuthenticationAlert } = authentication;

Chart.register(
  Title,
  Legend,
  Tooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels,
);

const props = defineProps<{
  weeks: {
    year: number;
    week: number;
  };
  categoryType?: string;
}>();

/** 주차별 문의 유형 차트 데이터 */
const chartLabels = ref([]);
const chartDatasets = reactive({
  data: [],
  backgroundColor: [
    '#f79256',
    '#fbd1a2',
    '#7dcfb6',
    '#00b2ca',
    '#1d4e89',
    '#7e7f9a',
    '#cfd7c7',
    '#f6f1d1',
    '#839788',
    '#277da1',
    '#744253',
    '#586f6b',
    '#e26d5c',
    '#ffc8dd',
  ],
});

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [chartDatasets],
}));

const getChartTitle = () => {
  if (props.categoryType === 'error_inquiry') return '오류 문의';
  if (props.categoryType === 'visit_care') return '방문 케어';
  if (props.categoryType === 'complain') return '불만';
  return '상담 카테고리별 상담분포';
};

/** 차트 설정 옵션 */
const option = {
  responsive: true,
  indexAxis: 'y' as any,
  plugins: {
    title: {
      display: true,
      text: getChartTitle(),
    },
    legend: { display: false },
    datalabels: {
      anchor: 'end',
      align: 'right',
      font: { size: 13 },
    } as any,
  },
  scales: {
    y: {
      min: 0,
      ticks: { stepSize: 1 },
    },
  },
};

/** 주차별 문의 유형 데이터 블러오기 */
const getWeekChartData = async () => {
  const requestData = {
    type: 'cs_type',
    year: props.weeks.year,
    weekDay: props.weeks.week,
    categoryType: props.categoryType,
  };
  try {
    const res = (await requestWeekChartData(requestData)) as AxiosResponse;

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
      chartDatasets.data = res.data.data.data;
      chartLabels.value = res.data.data.labels;
    }
  } catch (error) {
    console.log(error);
  }
};

watch(
  () => props.weeks,
  () => {
    getWeekChartData();
  },
);

getWeekChartData();
</script>

<template>
  <Bar
    :options="option"
    :data="chartData"
  />
</template>
