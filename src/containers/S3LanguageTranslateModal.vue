<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import useModalStore from '@store/storeModal';
import {
  s3GlobalizationLanguageJsonType,
  s3GlobalizationLanguageObjectType,
  tableLanguageType,
  successMessageType,
  errorMessageType,
  elMessageBoxType,
} from '@interface/language';
import { S3_LANGUAGE_TRANSLATE } from '@common/string';

const { findLanguageJson, jsonArray, selectLang } = defineProps<{
  findLanguageJson?: s3GlobalizationLanguageJsonType;
  jsonArray: s3GlobalizationLanguageObjectType[];
  selectLang: string;
}>();

const { flag, closeModal, modalData } = useModalStore();

const originData = JSON.parse(
  JSON.stringify(modalData.s3LanguageTranslate),
) as tableLanguageType;

const languageData = reactive({
  key: modalData.s3LanguageTranslate.key,
  value: modalData.s3LanguageTranslate.value,
} as tableLanguageType);

const alertMessageBox = (
  type: elMessageBoxType,
  message: string,
  title: string,
) => {
  ElMessageBox.alert(message, title, {
    confirmButtonText: '확인',
    type,
    center: true,
  });
};

const showResultModal = (
  copyJsonData: s3GlobalizationLanguageJsonType,
  newKey: string,
  successMessage: successMessageType,
  errorMessage: errorMessageType,
) => {
  if (copyJsonData[newKey]) {
    alertMessageBox('warning', successMessage.content, successMessage.title);
    closeModal(S3_LANGUAGE_TRANSLATE);
    return;
  }

  alertMessageBox('error', errorMessage.content, errorMessage.title);
};

const modifyObjectKeyAndValue = () => {
  const copyJsonData = findLanguageJson;

  if (copyJsonData) {
    if (languageData.key !== originData.key) {
      const deleteAndInsertObjectKeyAndValue = (
        object: s3GlobalizationLanguageObjectType,
      ) => {
        const copyObject = object;
        const tempValue = copyObject.json[originData.key];

        delete copyObject.json[originData.key];

        if (selectLang !== copyObject.lang) {
          copyObject.json[languageData.key] = tempValue;
          return;
        }

        copyObject.json[languageData.key] = languageData.value;
      };

      jsonArray.forEach(deleteAndInsertObjectKeyAndValue);
      showResultModal(
        copyJsonData,
        languageData.key,
        {
          title: '수정번역필요',
          content:
            '다른 언어에는 해당 단어의 번역이 적용되지 않았습니다. 각각 수정번역이 필요합니다. 각 언어로 이동해서 번역 후, 전체 저장하기를 꼭 눌러주세요!',
        },
        {
          title: '수정실패',
          content: '수정이 실패하였습니다.',
        },
      );
      return;
    }

    if (languageData.value !== originData.value) {
      copyJsonData[originData.key] = languageData.value;
      showResultModal(
        copyJsonData,
        languageData.key,
        {
          title: '수정번역필요',
          content:
            '다른 언어에는 해당 단어의 번역이 적용되지 않았습니다. 각각 수정번역이 필요합니다. 각 언어로 이동해서 번역 후, 전체 저장하기를 꼭 눌러주세요!',
        },
        {
          title: '수정실패',
          content: '수정이 실패하였습니다.',
        },
      );
      return;
    }

    alertMessageBox('warning', '변경된 내용이 없습니다.', '동일한 값입니다.');
  }
};

// 번역 내용 저장하기
const saveChangedData = () => {
  ElMessageBox.confirm('저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
    callback: (action: string) => {
      if (action !== 'confirm') {
        modalData.s3LanguageTranslate.key = languageData.key;
        modalData.s3LanguageTranslate.value = languageData.value;
        return;
      }

      modifyObjectKeyAndValue();
    },
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '취소되었습니다.',
    });
  });
};
</script>

<template>
  <el-dialog
    v-model="flag.s3LanguageTranslate"
    width="50%"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p class="mr-10">언어 번역</p>
        <el-tag type="info">
          태블릿에 보여지는 단어를 번역할 수 있는 화면입니다.
        </el-tag>
      </el-row>
    </template>
    <el-row
      class="mb-10"
      justify="space-between"
      align="middle"
    >
      <p class="language-translate-desc">
        * 선택한 단어에 대한 번역을 업데이트 합니다.
      </p>
    </el-row>
    <div class="bg-p">
      <el-row
        align="middle"
        justify="space-between"
        class="mb-10"
      >
        <el-col :span="6">
          <p class="language-translate-title">번역할 한국어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.key"
            class="input-text"
          />
        </el-col>
      </el-row>
      <el-row
        align="middle"
        justify="space-between"
        class="mb-10"
      >
        <el-col :span="6">
          <p class="language-translate-title">번역된 언어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="languageData.value"
            class="input-text"
          />
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <el-row
        align="bottom"
        justify="end"
      >
        <el-button
          type="danger"
          @click="closeModal(S3_LANGUAGE_TRANSLATE)"
        >
          닫기
        </el-button>
        <el-button
          type="primary"
          @click="saveChangedData"
        >
          저장
        </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.language-translate-desc {
  font-size: 14px;
  color: #ff5733;
}

.language-translate-title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
}

.input-text {
  text-align: center;
}
</style>
