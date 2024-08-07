<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, Ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import useModalStore from '@store/storeModal';
import { AddOldOptionGroupModalGoodsList } from '@interface/option';
import apiErrorDialogHandler from '@composables/apiErrorDialogHandler';
import { ADD_OLD_OPTION_GROUP } from '@common/string';
import { queryStorePosInfoType } from '@common/interface';
import { requestOptionListAll, requestOptionCreateGet } from '@apis/option';

const route = useRoute();
const query = route.query as unknown as queryStorePosInfoType;
const { flag, closeModal, modalData } = useModalStore();

/** openModalWithData 함수 실행시 보내는 data */
const modalPayload: {
  optionNo: number | null;
  onSubmit: () => void;
} = modalData.addOldOptionGroup;

/** 메뉴 목록 */
const goodsList: Ref<AddOldOptionGroupModalGoodsList[]> = ref([]);
const isGetAllOptionGroupsLoading = ref(false);
/** 메뉴 목록 가져오기 api 요청 */
const getOptionListAll = async () => {
  try {
    isGetAllOptionGroupsLoading.value = true;
    const response = await requestOptionListAll(query.code);
    goodsList.value = response.data.map((options) => ({
      ...options,
      selectedOptionGroups: [],
    }));
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isGetAllOptionGroupsLoading.value = false;
  }
};

onMounted(() => {
  getOptionListAll();
});

/** 옵션그룹 전체선택 */
const onSelectAllOptionGroups = (state: boolean, goodsCode: string) => {
  goodsList.value = goodsList.value.map((goods) => {
    if (goods.goodCode === goodsCode) {
      if (state) {
        return {
          ...goods,
          selectedOptionGroups: goods.option.map(
            (optionData) => optionData.optionGroupNo,
          ),
        };
      }

      return { ...goods, selectedOptionGroups: [] };
    }

    return goods;
  });
};

const isPostOptionGroupLoading = ref(false);
/** 옵션 "추가하기" api 요청 및 후처리 */
const updateOptionCreateGet = async (
  goods: AddOldOptionGroupModalGoodsList,
) => {
  try {
    isPostOptionGroupLoading.value = true;
    await requestOptionCreateGet({
      storeCode: query.code,
      goodCode: query.posGoodCode,
      copyGoodCode: goods.goodCode,
      editType: 'add',
      itemNo:
        modalPayload.optionNo === null ? undefined : modalPayload.optionNo,
      copyGroupNo:
        goods.selectedOptionGroups.length < 1
          ? undefined
          : goods.selectedOptionGroups,
    });

    modalData.addOldOptionGroup.onSubmit();
    closeModal(ADD_OLD_OPTION_GROUP);
    ElMessage({
      type: 'success',
      message:
        '정상적으로 가져왔습니다. 저장하기 위해 변경사항 저장 버튼을 눌러주세요.',
    });
  } catch (error) {
    apiErrorDialogHandler({ error });
  } finally {
    isPostOptionGroupLoading.value = false;
  }
};
</script>

<template>
  <el-dialog
    v-model="flag.addOldOptionGroup"
    width="80%"
    align-center
  >
    <template #header>
      <div>
        <span class="mr-10"> 옵션 그룹 가져오기 </span>
      </div>
    </template>

    <div
      v-loading="isGetAllOptionGroupsLoading"
      class="dialog-container"
    >
      <div
        v-if="goodsList.length < 1 && !isGetAllOptionGroupsLoading"
        class="no-content"
      >
        <p>다른 메뉴의 옵션 그룹이 존재하지 않습니다.</p>
      </div>

      <el-scrollbar
        v-else
        height="800px"
      >
        <el-card
          v-for="(goods, index) in goodsList"
          :key="`goods-${goods.goodCode}-${index}`"
          class="goods-container"
        >
          <template #header>
            <el-row
              justify="space-between"
              align="middle"
            >
              <p class="goods-title mr-10">
                {{ goods.goodDpName }}
              </p>
              <el-button
                v-loading.fullscreen.lock="isPostOptionGroupLoading"
                type="primary"
                :disabled="goods.selectedOptionGroups.length < 1"
                @click="updateOptionCreateGet(goods)"
              >
                가져오기
              </el-button>
            </el-row>
          </template>
          <el-checkbox
            :model-value="
              goods.selectedOptionGroups.length === goods.option.length
            "
            @change="
              (state: boolean) => onSelectAllOptionGroups(state, goods.goodCode)
            "
          >
            전체 선택
          </el-checkbox>
          <div class="option-groups">
            <el-card
              v-for="(optionData, optionDataIndex) in goods.option"
              :key="`option-${optionData.optionGroupNo}-${optionDataIndex}`"
              class="option-group"
            >
              <template #header>
                <el-checkbox-group v-model="goods.selectedOptionGroups">
                  <el-checkbox :label="optionData.optionGroupNo">
                    <p class="option-group-title mr-10">
                      {{ optionData.optionGroupName }}
                    </p>
                  </el-checkbox>
                </el-checkbox-group>
              </template>
              <div class="options-container">
                <div
                  v-for="(optionItem, optionItemIndex) in optionData.item"
                  :key="`option-item-${optionItem.optionCode}-${optionItemIndex}`"
                  class="option-button"
                >
                  <el-row
                    align="middle"
                    justify="space-between"
                    class="mb-5"
                  >
                    <div class="option-code mr-5">
                      {{ optionItem.optionCode }}
                    </div>
                    <el-row>
                      <el-tag
                        v-if="optionItem.optionUse === 'N'"
                        size="small"
                        type="danger"
                        class="mr-5"
                      >
                        중지
                      </el-tag>
                      <el-tag
                        v-if="optionItem.optionIsSale === 'Y'"
                        size="small"
                        type="warning"
                      >
                        품절
                      </el-tag>
                    </el-row>
                  </el-row>
                  <div class="option-contents">
                    <div>
                      {{ optionItem.optionName }}
                    </div>
                    <div>{{ optionItem.optionPrice?.toLocaleString() }} 원</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-card.is-always-shadow) {
  box-shadow: none;
}

.dialog-container {
  min-height: 800px;
}

.no-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  font-size: 18px;
  font-weight: bold;
}

.goods-container {
  background: #fff;
  margin: 4px 0;

  .goods-title {
    font-size: 20px;
    font-weight: bold;
  }
}

.option-groups {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px;

  .option-group {
    background-color: #e8e0ff71;

    .option-group-title {
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .option-button {
    display: flex;
    flex-direction: column;

    .option-code {
      font-size: 12px;
      color: gray;
    }

    .option-contents {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
