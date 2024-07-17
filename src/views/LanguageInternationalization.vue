<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import {
  s3GlobalizationLanguageJsonType,
  s3GlobalizationLanguageObjectType,
  tableLanguageType,
  elMessageBoxType,
  languageType,
} from '@interface/language';
import { LanguageRowCreateBox, S3LanguageTranslateModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import { S3_LANGUAGE_MANAGE, S3_LANGUAGE_TRANSLATE } from '@common/string';
import { language } from '@apis';

const { failAuthenticationAlert } = authentication;

const {
  requestJsonFileByLanguageFromS3,
  requestUpdateJsonFileByLanguageFromS3,
} = language;

const languageObjectType = ref<languageType[]>([
  { ko: '한국어' },
  { jp: '일본어' },
  { en: '영어' },
  { chBun: '중국어 번체' },
  { chGan: '중국어 간체' },
]);
const jsonArray = ref<s3GlobalizationLanguageObjectType[]>([]);
const selectTabValue = ref<string>('ko');
const searchValue = ref<string>('');
const showCreateLang = ref<boolean>(false);
const languageInternationalizationHeader = reactive([
  { name: S3_LANGUAGE_MANAGE },
]);

const { flag, openModalWithData } = useModalStore();

const openCreateLanguage = () => {
  showCreateLang.value = true;
};

const closeCreateLang = () => {
  showCreateLang.value = false;
};

const alertMessageBox = (
  type: elMessageBoxType,
  message: string,
  title: string,
  callback?: (action: string) => void,
) => {
  ElMessageBox.alert(message, title, {
    confirmButtonText: '확인',
    type,
    center: true,
    callback,
  });
};

const loading = ref(true);

const findLanguageJson = (lang: string) => {
  const target = jsonArray.value.find((item) => item.lang === lang);

  return target?.json;
};

const convertKeyValueArray = (jsonList: s3GlobalizationLanguageJsonType) => {
  if (searchValue.value) {
    const filterCallback = ([key, value]: [key: string, value: string]) =>
      key.includes(searchValue.value) || value.includes(searchValue.value);

    const mapCallback = ([key, value]: [key: string, value: string]) => [
      key,
      value,
    ];

    return Object.entries(jsonList).filter(filterCallback).map(mapCallback);
  }

  return Object.entries(jsonList);
};

const getJsonFile = async (lang: string) => {
  try {
    const res = await requestJsonFileByLanguageFromS3(lang);

    if (res.status === 400) {
      alertMessageBox('error', res.data.msg, '실패');
      return;
    }

    if (res.status === 401) {
      failAuthenticationAlert();
      return;
    }

    if (res.status === 200) {
      const result = {
        lang,
        json: res.data,
      } as s3GlobalizationLanguageObjectType;

      jsonArray.value.push(result);

      if (jsonArray.value && jsonArray.value.length === 5) {
        loading.value = false;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

languageObjectType.value.forEach((lang) => {
  Object.entries(lang).forEach((entry) => {
    const [key] = entry;
    getJsonFile(key);
  });
});

const createJsonData = (key: string, value: string) => {
  if (key === '' || value === '') return;

  const addWord = ({ json }: s3GlobalizationLanguageObjectType) => {
    const connectJson = json;
    connectJson[key] = value;
  };

  jsonArray.value.forEach(addWord);
  closeCreateLang();
  alertMessageBox(
    'success',
    '해당 언어가 다른 언어에도 추가되어 각각 추가번역이 필요합니다. 각 언어로 이동해서 번역해주세요!',
    '추가번역이 필요합니다.',
  );
};

const hasError = ref(false);
const saveJsonData = async (
  lang: string,
  json: s3GlobalizationLanguageJsonType,
) => {
  try {
    hasError.value = false;
    const res = (await requestUpdateJsonFileByLanguageFromS3(
      lang,
      json,
    )) as AxiosResponse;

    if (res.data.code === 400) {
      alertMessageBox('error', res.data.msg, '실패');
      hasError.value = true;
      return;
    }

    if (res.data.code === 401) {
      failAuthenticationAlert();
      hasError.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

const setAllLangJson = () => {
  const setLang = (jsonData: s3GlobalizationLanguageObjectType) => {
    saveJsonData(jsonData.lang, jsonData.json);
  };

  jsonArray.value.forEach(setLang);

  if (!hasError.value) {
    alertMessageBox(
      'success',
      '수정 및 번역 작업이 완료되었습니다.',
      '수정 완료!',
    );
  }
};

const deleteAllByLanguage = (data: tableLanguageType) => {
  const deleteObjectKeyAndValue = (
    object: s3GlobalizationLanguageObjectType,
  ) => {
    const copyObject = object;
    delete copyObject.json[data.key];
  };

  jsonArray.value.forEach(deleteObjectKeyAndValue);
  const copyJsonData = findLanguageJson(selectTabValue.value);

  if (copyJsonData && copyJsonData[data.key]) {
    alertMessageBox(
      'error',
      '해당 객체의 언어별 삭제를 실패하였습니다.',
      '언어별 삭제 실패',
    );
    return;
  }

  alertMessageBox(
    'warning',
    '삭제한 내용의 데이터를 저장하시려면 전제 저장하기를 꼭 눌러주세요.',
    '전체 저장하기를 눌러주세요!',
  );
};

const showDeleteModal = (data: tableLanguageType) => {
  alertMessageBox(
    'warning',
    '해당 객체를 언어별로 전체 삭제하시겠습니까?',
    '경고',
    (action) => {
      if (action !== 'confirm') return;
      deleteAllByLanguage(data);
    },
  );
};
</script>

<template>
  <S3LanguageTranslateModal
    v-if="flag.s3LanguageTranslate"
    :findLanguageJson="findLanguageJson(selectTabValue)"
    :jsonArray="jsonArray"
    :selectLang="selectTabValue"
  />
  <BreadcrumbHeader :propsHeader="languageInternationalizationHeader" />
  <el-tag
    type="danger"
    effect="dark"
    class="mb-10"
  >
    모든 수정/삭제 완료 후, 꼭 전체 저장하기를 눌러주세요!
  </el-tag>
  <el-tabs
    v-model="selectTabValue"
    type="border-card"
    class="tab-container"
  >
    <el-tab-pane
      v-for="(languages, index) in jsonArray"
      :key="index"
      :label="languages.lang"
      :name="languages.lang"
    >
      <el-row class="top-tool-bar">
        <el-col
          :span="20"
          class="bg-p"
        >
          <el-input
            v-model="searchValue"
            placeholder="검색어를 입력해주세요"
          />
        </el-col>
        <el-col
          :span="4"
          class="bg-p"
        >
          <el-button
            type="primary"
            @click="openCreateLanguage"
          >
            단어 추가하기
          </el-button>
          <el-button
            class="save-button"
            type="info"
            @click="setAllLangJson"
          >
            전체 저장하기
          </el-button>
        </el-col>
      </el-row>
      <el-row class="language-row">
        <LanguageRowCreateBox
          v-if="showCreateLang"
          :createJsonData="createJsonData"
          :closeCreateLang="closeCreateLang"
        />
        <el-card>
          <el-table
            v-loading="loading"
            element-loading-text="Loading..."
            :data="convertKeyValueArray(languages.json)"
            height="660px"
            stripe
            border
          >
            <el-table-column
              label="키"
              :resizable="true"
            >
              <template #default="{ row }">
                {{ row[0] }}
              </template>
            </el-table-column>
            <el-table-column
              label="값"
              :resizable="true"
            >
              <template #default="{ row }">
                {{ row[1] }}
              </template>
            </el-table-column>
            <el-table-column
              label="수정"
              :resizable="true"
            >
              <template #default="{ row }">
                <el-button
                  type="warning"
                  @click="() => openModalWithData(S3_LANGUAGE_TRANSLATE, row)"
                >
                  수정
                </el-button>
                <el-button
                  type="danger"
                  @click="() => showDeleteModal(row)"
                >
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.tab-container {
  height: calc(100vh - 210px);
  overflow: scroll;

  .language-row {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin-top: 20px;

    .object-input {
      width: 100%;
    }
  }

  .top-tool-bar {
    display: flex;
    justify-content: space-between;
    background-color: #f1f1ff;
    border-radius: 5px;
  }
}
</style>
