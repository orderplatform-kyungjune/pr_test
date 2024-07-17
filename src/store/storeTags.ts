import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorage, useArrayFindIndex } from '@vueuse/core';
import { pageRouterQueryType } from '@interface/member';

const useTagsStore = defineStore('tags', () => {
  // 태그 데이터
  const tagsArray: Ref<pageRouterQueryType[]> = ref([]);
  const activeTagIndex: Ref<number> = ref(0);

  // 태그 추가
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addTagsData = (target: any) => {
    const isExistData = useArrayFindIndex(
      tagsArray,
      (page) => JSON.stringify(page) === JSON.stringify(target),
    );
    if (isExistData.value === -1) {
      tagsArray.value.unshift(target);
      activeTagIndex.value = 0;
    } else {
      tagsArray.value.splice(isExistData.value, 1);
      tagsArray.value.unshift(target);
      activeTagIndex.value = 0;
    }
  };

  // 태그 삭제
  const deleteTagsData = (index: number) => {
    if (activeTagIndex.value !== 0 && index <= activeTagIndex.value) {
      activeTagIndex.value -= 1;
    }
    tagsArray.value.splice(index, 1);
  };

  // 인덱스 변경
  const setTagsIndex = (index: number) => {
    activeTagIndex.value = index;
  };

  // 태그 데이터 모두 삭제
  const resetCacheData = () => {
    tagsArray.value = [];
    activeTagIndex.value = 0;
  };

  // 로컬 스토리지 데이터 저장
  const localCachePage = useStorage('cachePage', tagsArray, localStorage);

  // 로컬 스토리지 인덱스 저장
  const localCacheIndex = useStorage(
    'cacheIndex',
    activeTagIndex,
    localStorage,
  );

  // 태그 데이터 일괄 수정
  const updateStoreNamesInTagArray = (targetCode: string, newName: string) => {
    tagsArray.value = tagsArray.value.map((tagItem: pageRouterQueryType) => {
      const tag = tagItem;
      if (tagItem.query?.code === targetCode) {
        tag.query.name = newName;
      }
      return tag;
    });
  };

  return {
    localCachePage,
    localCacheIndex,
    tagsArray,
    addTagsData,
    deleteTagsData,
    resetCacheData,
    setTagsIndex,
    updateStoreNamesInTagArray,
  };
});

export default useTagsStore;
