import { useRoute } from 'vue-router';
import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import { categoryListDataType } from '@interface/category';
import { CATEGORY } from '@common/string';
import { categoryCodec } from '@codecs';
import { category } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { requestCategoryList } = category;

const useCategoryStore = defineStore(CATEGORY, () => {
  const route = useRoute();
  const { requestCategoryListCodec } = categoryCodec;

  const categoryListData: Ref<categoryListDataType[]> = ref([]);

  const getCategoryList = async () => {
    try {
      const config = route.query.code as string;
      const res = (await requestCategoryList(config)) as AxiosResponse;
      const typeError = runtimeCheck(requestCategoryListCodec, res.data);

      if (res.data.code === 400) {
        ElMessageBox.alert(res.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
      if (res.data.code === 401) {
        failAuthenticationAlert();
      }
      if (!typeError) {
        if (res.data.code === 200) {
          categoryListData.value = res.data.data;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return {
    categoryListData,
    getCategoryList,
  };
});

export default useCategoryStore;
