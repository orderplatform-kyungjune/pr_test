<script setup lang="ts">
import { ref } from 'vue';
import { AxiosResponse } from 'axios';
import { etc } from '@apis';

const laboratoryList = ref([]);

const { requestLaboratoryList } = etc;

const getLaboratoryList = async () => {
  try {
    const res = (await requestLaboratoryList()) as AxiosResponse;
    if (res.data.result) {
      laboratoryList.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoveButton = (url: string) => {
  window.open(url, '_blank');
};

getLaboratoryList();
</script>

<template>
  <el-table
    :data="laboratoryList"
    border
    class="width-100"
  >
    <el-table-column
      prop="idx"
      label="순번"
      header-align="center"
      align="center"
      width="50"
    />
    <el-table-column
      prop="sub_laboratory_name"
      label="이름"
      header-align="center"
    />
    <el-table-column
      prop="requester_name"
      label="요청자"
      header-align="center"
      width="75"
      align="center"
    />
    <el-table-column
      prop="producer_name"
      label="제작자"
      header-align="center"
      width="75"
      align="center"
    />
    <el-table-column
      prop="laboratory_url"
      label="이동"
      header-align="center"
      width="80"
      align="center"
    >
      <template #default="{ row }">
        <el-button
          type="primary"
          @click="handleMoveButton(row.laboratory_url)"
        >
          이동
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
