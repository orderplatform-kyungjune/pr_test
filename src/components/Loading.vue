<script lang="ts" setup>
import { watchEffect } from 'vue';
import { ElLoading } from 'element-plus';
import useLoadingStore from '@store/storeLoading';

const props = defineProps<{
  text?: string;
}>();

const loading = ElLoading.service({
  lock: true,
  text: props.text ?? '수정중입니다...',
  background: 'rgba(0, 0, 0, 0.7)',
  customClass: 'loading-layout-for-category',
});

watchEffect(() => {
  const { loadingStatus } = useLoadingStore();
  if (!loadingStatus) {
    loading.close();
  }
});
</script>

<template>
  <div></div>
</template>
