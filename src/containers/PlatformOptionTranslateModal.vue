<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { requestTranslateOptionGroupPlatformType } from '@interface/option';
import { OPTION_TRANSLATE } from '@common/string';
import { optionCodec } from '@codecs';
import { option } from '@apis';

const route = useRoute();

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, isGlobalAdmin } = authentication;
const { requestInactiveTranslateOptionGroupInPlatform } = option;
const { translateOptionGroupNameCodec } = optionCodec;

const props = defineProps<{
  requestOptionGroupLists: () => Promise<void>;
  requestOrderTwoOptionMenuLists: () => Promise<void>;
  requestOrderTwoOptionGroupLists?: () => Promise<void>;
  refreshOptionMenuLanguageData: () => void;
}>();

const { flag, modalData, closeModal } = useModalStore();

const languageData = ref({} as requestTranslateOptionGroupPlatformType);

/** 저장 로딩 상태값 */
const saveLoading = ref(false);

// 옵션 상품 개별 번역 저장
const postTranslateSingleOptionMenu = async () => {
  try {
    const requestData = {
      type: languageData.value.type,
      storeCode: route.query.code as string,
      goodCode: languageData.value.goodCode,
      platform_good_option_no: languageData.value.platform_good_option_no,
      platform_store_good_option_code:
        languageData.value.platform_store_good_option_code,
      origin_name: languageData.value.origin_name,
      ko: languageData.value.ko,
      en: languageData.value.en,
      jp: languageData.value.jp,
      zh_hans: languageData.value.zh_hans,
      zh_hant: languageData.value.zh_hant,
    };

    saveLoading.value = true;
    const res = (await requestInactiveTranslateOptionGroupInPlatform(
      requestData,
    )) as AxiosResponse;
    const typeError = runtimeCheck(translateOptionGroupNameCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        if (languageData.value.type === 'option_item') {
          await props.requestOptionGroupLists();
          props.refreshOptionMenuLanguageData();
        }
        if (languageData.value.type === 'step2_option_item') {
          await props.requestOrderTwoOptionMenuLists();
        }

        closeModal(OPTION_TRANSLATE);
        ElMessage({
          type: 'success',
          message: '정상적으로 저장되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    saveLoading.value = false;
  }
};

// 옵션 그룹 개별 번역 저장
const postTranslateSingleOptionGroup = async () => {
  try {
    const data = {
      type: languageData.value.type,
      storeCode: route.query.code as string,
      goodCode: languageData.value.goodCode,
      platform_good_option_group_no:
        languageData.value.platform_good_option_group_no,
      platform_good_option_no: languageData.value.platform_good_option_no,
      origin_name: languageData.value.origin_name,
      ko: languageData.value.ko,
      en: languageData.value.en,
      jp: languageData.value.jp,
      zh_hans: languageData.value.zh_hans,
      zh_hant: languageData.value.zh_hant,
    };
    saveLoading.value = true;
    const res = (await requestInactiveTranslateOptionGroupInPlatform(
      data,
    )) as AxiosResponse;
    const typeError = runtimeCheck(translateOptionGroupNameCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        if (
          props.requestOptionGroupLists &&
          languageData.value.type === 'option_group'
        ) {
          await props.requestOptionGroupLists();
        }
        if (
          props.requestOrderTwoOptionGroupLists &&
          languageData.value.type === 'step2_option_group'
        ) {
          await props.requestOrderTwoOptionGroupLists();
        }

        closeModal(OPTION_TRANSLATE);
        ElMessage({
          type: 'success',
          message: '정상적으로 저장되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    saveLoading.value = false;
  }
};

const showSaveConfirm = () => {
  const { type } = languageData.value;
  ElMessageBox.confirm('저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  }).then(() => {
    if (type === 'option_item' || type === 'step2_option_item') {
      postTranslateSingleOptionMenu();
    }
    if (type === 'option_group' || type === 'step2_option_group') {
      postTranslateSingleOptionGroup();
    }
  });
};

// 모달창 이름 가져오기
const getTypeName = computed(() => {
  const { type } = languageData.value;

  if (type === 'option_item' || type === 'step2_option_item') {
    return '옵션 상품';
  }
  if (type === 'option_group' || type === 'step2_option_group') {
    return '옵션 그룹';
  }

  return '';
});

onMounted(() => {
  languageData.value = JSON.parse(JSON.stringify(modalData.optionTranslate));
});
</script>

<template>
  <el-dialog
    v-model="flag.optionTranslate"
    align-center
    width="40%"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p class="mr-10">
          {{ `${getTypeName} 이름 개별 번역` }}
        </p>
      </el-row>
    </template>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-descriptions
        :column="2"
        border
        class="width-100"
      >
        <el-descriptions-item
          :label="`${getTypeName} 태블릿 노출 이름`"
          :width="120"
        >
          {{ languageData.origin_name }}
        </el-descriptions-item>
        <el-descriptions-item
          :width="120"
          label="상품 코드"
        >
          {{ languageData.goodCode }}
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <div class="bg-p">
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="translate-title">한글</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.ko"
            :disabled="!isGlobalAdmin()"
            class="input-text"
          />
        </el-col>
      </el-row>
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="translate-title">일본어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.jp"
            class="input-text"
          />
        </el-col>
      </el-row>
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="translate-title">영어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.en"
            class="input-text"
          />
        </el-col>
      </el-row>
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="translate-title">중국어 (간체)</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.zh_hans"
            class="input-text"
          />
        </el-col>
      </el-row>
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="translate-title">중국어 (번체)</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.zh_hant"
            class="input-text"
          />
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <el-button @click="closeModal(OPTION_TRANSLATE)"> 닫기</el-button>
      <el-button
        :loading="saveLoading"
        type="primary"
        @click="showSaveConfirm"
      >
        저장
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-descriptions__content) {
  word-break: break-all;
}

.translate-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.input-text {
  text-align: center;
}
</style>
