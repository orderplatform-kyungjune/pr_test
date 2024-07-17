import { ref } from 'vue';
import { defineStore } from 'pinia';
import { LOADING } from '@common/string';

const useLoadingStore = defineStore(LOADING, () => {
  const loadingStatus = ref<boolean>(false);

  const openLoading = () => {
    loadingStatus.value = true;
  };

  const closeLoading = () => {
    loadingStatus.value = false;
  };

  return {
    loadingStatus,
    openLoading,
    closeLoading,
  };
});

export default useLoadingStore;
