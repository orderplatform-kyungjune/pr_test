<script setup lang="ts">
import { useRoute } from 'vue-router';
import { reactive, ref, Ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { scheduleHistoryListType } from '@interface/extraService';
import { extraServiceCodec } from '@codecs';
import { extraService } from '@apis';

const { query } = useRoute();
const storeCode = query.code as string;
const { runtimeCheck } = runtimeCheckHelper;
const { requestAuctionScheduleHistory, requestJackpotScheduleHistory } =
  extraService;
const { responseScheduleChangeHistoryCodec } = extraServiceCodec;
const { flag } = useModalStore();

const paginationInfo = reactive({
  page: 0,
  size: 10,
  total: 0,
  to: 0,
  from: 0,
});

const props = defineProps<{
  type: string;
  closeAuctionScheduleHistoryModal?: () => void;
  closeJackpotScheduleHistoryModal?: () => void;
}>();

const scheduleChangeHistory: Ref<scheduleHistoryListType[]> = ref([]);
const getAuctionScheduleHistory = async () => {
  try {
    const requestData = {
      page: paginationInfo.page,
      size: paginationInfo.size,
    };
    const res = (await requestAuctionScheduleHistory(
      storeCode,
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseScheduleChangeHistoryCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        scheduleChangeHistory.value = res.data.data.list;
        paginationInfo.page = res.data.data.pageNo;
        paginationInfo.size = res.data.data.pageSize;
        paginationInfo.to = res.data.data.to;
        paginationInfo.from = res.data.data.from;
        paginationInfo.total = res.data.data.totalElementCount;
      }
    } else {
      await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const getJackpotScheduleHistory = async () => {
  try {
    const requestData = {
      page: paginationInfo.page,
      size: paginationInfo.size,
    };
    const res = (await requestJackpotScheduleHistory(
      storeCode,
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(
      responseScheduleChangeHistoryCodec,
      res.data.data,
    );

    if (res.data.resultCode === 200) {
      if (!typeError) {
        scheduleChangeHistory.value = res.data.data.list;
        paginationInfo.page = res.data.data.pageNo;
        paginationInfo.size = res.data.data.pageSize;
        paginationInfo.to = res.data.data.to;
        paginationInfo.from = res.data.data.from;
        paginationInfo.total = res.data.data.totalElementCount;
      }
    } else {
      await ElMessageBox.alert('오류가 발생하였습니다.', '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const requestHistoryData = () => {
  if (props.type === 'auction') {
    getAuctionScheduleHistory();
  }
  if (props.type === 'jackpot') {
    getJackpotScheduleHistory();
  }
};

const closeHistoryModal = () => {
  if (props.type === 'auction' && props.closeAuctionScheduleHistoryModal) {
    props.closeAuctionScheduleHistoryModal();
  }
  if (props.type === 'jackpot' && props.closeJackpotScheduleHistoryModal) {
    props.closeJackpotScheduleHistoryModal();
  }
};

const splitTimeData = (date: string) => {
  if (date) {
    return date.split('T');
  }
  return '';
};

/** 페이지네이션 */
const torderHandlePage = (val: number) => {
  paginationInfo.page = val - 1;
  requestHistoryData();
};

const isEmptyArray = (data: scheduleHistoryListType[]) => data.length === 0;
const getTitleName = () =>
  props.type === 'auction' ? '경매 변경 이력' : '잭팟 변경 이력';
const isAuctionType = () => props.type === 'auction';

requestHistoryData();
</script>

<template>
  <el-dialog
    v-model="flag.scheduleChangeHistory"
    width="40%"
    top="8vh"
    :title="getTitleName()"
    :before-close="closeHistoryModal"
  >
    <el-table
      v-if="!isEmptyArray(scheduleChangeHistory)"
      border
      class="mb-10"
      :data="scheduleChangeHistory"
      :height="440"
    >
      <el-table-column
        align="center"
        header-align="center"
        label="순번"
        width="80"
      >
        <template #default="{ $index }">
          <p>{{ paginationInfo.from - $index }}</p>
        </template>
      </el-table-column>
      <el-table-column
        label="변경 일시"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <p>{{ splitTimeData(row.modifiedDateTime)[0] }}</p>
          <p>{{ splitTimeData(row.modifiedDateTime)[1] }}</p>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isAuctionType()"
        label="게시물 번호"
        align="center"
        header-align="center"
        prop="auctionScheduleId"
        width="120"
      />
      <el-table-column
        v-else
        label="게시물 번호"
        align="center"
        header-align="center"
        prop="jackpotScheduleId"
        width="120"
      />
      <el-table-column
        label="변경 항목"
        align="center"
        header-align="center"
        prop="type"
      />
      <el-table-column
        label="변경자"
        align="center"
        header-align="center"
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
      v-if="!isEmptyArray(scheduleChangeHistory)"
      justify="center"
    >
      <el-pagination
        :page-size="paginationInfo.size"
        :total="paginationInfo.total"
        :current-page="paginationInfo.page + 1"
        background
        layout="prev, pager, next"
        @current-change="torderHandlePage"
      />
    </el-row>
    <template #footer>
      <el-row justify="end">
        <el-button
          type="danger"
          @click="closeHistoryModal"
        >
          닫기
        </el-button>
      </el-row>
    </template>
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
