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
}>();

/** 주차별 맴버 차트 데이터 */
const chartLabels = ref([]);
const chartDatasets = reactive({
  data: [],
  backgroundColor: [
    '#0a9396',
    '#94d2bd',
    '#e9d8a6',
    '#ee9b00',
    '#ca6702',
    '#bb3e03',
    '#ae2012',
  ],
});

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [chartDatasets],
}));

/** 차트 설정 옵션 */
const option = {
  responsive: true,
  indexAxis: 'y' as any,
  plugins: {
    title: {
      display: true,
      text: 'CS 처리 현황',
    },
    legend: { display: false },
    datalabels: {
      anchor: 'end',
      align: 'right',
      font: { size: 14 },
    } as any,
  },
  scales: {
    y: {
      min: 0,
      ticks: { stepSize: 1 },
    },
  },
};

/** 주차별 맴버 데이터 블러오기 */
const getWeekChartData = async () => {
  const requestData = {
    type: 'cs_status',
    year: props.weeks.year,
    weekDay: props.weeks.week,
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
