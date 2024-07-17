<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, ref, Ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import useModalStore from '@store/storeModal';
import { serviceSettingHistoryListType } from '@interface/extraService';
import { extraService } from '@apis';

const { requestServiceSettingHistory } = extraService;

const { flag } = useModalStore();
const route = useRoute();
const storeCode = route.query.code as string;

/** 매장 상세 정보 불러오기 */
const serviceSettingHistoryList: Ref<serviceSettingHistoryListType[]> = ref([]);
const serviceSettingHistoryPagination = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
});
const getServiceSettingHistory = async () => {
  const requestData = {
    page: serviceSettingHistoryPagination.page,
    size: serviceSettingHistoryPagination.size,
  };
  try {
    const res = (await requestServiceSettingHistory(
      storeCode,
      requestData,
    )) as AxiosResponse;

    if (res.data.resultCode === 200) {
      serviceSettingHistoryPagination.page = res.data.data.pageNo;
      serviceSettingHistoryPagination.size = res.data.data.pageSize;
      serviceSettingHistoryPagination.to = res.data.data.to;
      serviceSettingHistoryPagination.from = res.data.data.from;
      serviceSettingHistoryPagination.total = res.data.data.totalElementCount;
      serviceSettingHistoryList.value = res.data.data.changeHistoryList;
    } else {
      await ElMessageBox.alert(res.data.resultMessage, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const serviceHistoryHandlePage = (val: number) => {
  serviceSettingHistoryPagination.page = val - 1;
  getServiceSettingHistory();
};

const splitTimeData = (date: string) => date?.split('T') ?? '';
const getUsedState = (state: boolean) => {
  if (state) return '사용';
  if (!state) return '미사용';
  return '-';
};
const getDisplayState = (state: boolean) => {
  if (state) return '노출';
  if (!state) return '미노출';
  return '-';
};
const getGameTypeName = (code: string) => {
  if (code === 'TABLE_GAME') return '테이블 게임';
  if (code === 'AUCTION') return '경매';
  if (code === 'JACKPOT') return '잭팟';
  if (code === 'CHATTING') return '채팅';
  if (code === 'ZEP') return 'ZEP';
  return '';
};

getServiceSettingHistory();
</script>

<template>
  <el-dialog
    v-model="flag.extraServiceSettingHistory"
    title="서비스 설정 변경 이력"
    top="8vh"
    width="40%"
  >
    <el-table
      v-if="serviceSettingHistoryList.length !== 0"
      :data="serviceSettingHistoryList"
      :height="600"
      border
      class="mb-10"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="순번"
        width="80"
      >
        <template #default="{ $index }">
          <p>{{ serviceSettingHistoryPagination.from - $index }}</p>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="변경 일시"
      >
        <template #default="{ row }">
          <p>{{ splitTimeData(row.modifiedDateTime)[0] }}</p>
          <p>{{ splitTimeData(row.modifiedDateTime)[1] }}</p>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="서비스 명"
      >
        <template #default="{ row }">
          {{ getGameTypeName(row.entertainmentType) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="사용 여부"
      >
        <template #default="{ row }">
          {{ getUsedState(row.isUsed) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="노출 여부"
      >
        <template #default="{ row }">
          {{ getDisplayState(row.isIconDisplay) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="변경자"
        prop="modifiedName"
      />
    </el-table>
    <p
      v-else
      class="history-empty-data"
    >
      변경이력이 없습니다.
    </p>
    <el-row
      v-if="serviceSettingHistoryList.length !== 0"
      justify="center"
    >
      <el-pagination
        :current-page="serviceSettingHistoryPagination.page + 1"
        :page-size="serviceSettingHistoryPagination.size"
        :total="serviceSettingHistoryPagination.total"
        background
        layout="prev, pager, next"
        @current-change="serviceHistoryHandlePage"
      />
    </el-row>
  </el-dialog>
</template>

<style lang="scss" scoped>
.history-empty-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 24px;
}
</style>
