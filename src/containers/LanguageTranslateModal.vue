<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { translateModalPropsType } from '@interface/language';
import { requestUpdateTranslateProductType } from '@interface/goods';
import { LANGUAGE_TRANSLATE } from '@common/string';
import { goodsCodec } from '@codecs';
import { goods } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert, isBrand1Admin, isOriginAdmin } =
  authentication;

const props = defineProps<{
  requestCategory?: () => Promise<void>;
  requestProductList?: () => Promise<void>;
  requestProductDetail?: () => Promise<void>;
}>();

const { flag, modalData, closeModal } = useModalStore();

const route = useRoute();
const pathQuery = reactive(route.query);

const { requestTranslateTargetProduct, requestUpdateTranslateProduct } = goods;

const { languageSingleTranslateCodec } = goodsCodec;

/** 번역할 언어 정보 */
const languageData = ref({} as translateModalPropsType);

/** 번역된 언어 데이터 */
const translatedLanguage = reactive({
  ko: '',
  en: '',
  jp: '',
  zh_hans: '',
  zh_hant: '',
});

/** 번역 로딩 상태값 */
const translateLoading = ref(false);

// 이름 번역하기
const postTranslateWord = async () => {
  if (languageData.value.display_name.length === 0) {
    ElMessage({
      type: 'error',
      message: '번역할 이름이 없습니다.',
    });
    return;
  }
  translateLoading.value = true;

  try {
    const res = (await requestTranslateTargetProduct(
      languageData.value.display_name,
    )) as AxiosResponse;
    const typeError = runtimeCheck(languageSingleTranslateCodec, res.data);

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
        translatedLanguage.ko = res.data.data.ko;
        translatedLanguage.en = res.data.data.en;
        translatedLanguage.jp = res.data.data.jp;
        translatedLanguage.zh_hans = res.data.data.zh_hans;
        translatedLanguage.zh_hant = res.data.data.zh_hant;

        ElMessage({
          type: 'success',
          message: '번역 되었습니다.',
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    translateLoading.value = false;
  }
};

const saveLoading = ref(false);
// 번역 내용 저장하기
const translationWordSave = () => {
  ElMessageBox.confirm('저장하시겠습니까?', '경고', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const data: requestUpdateTranslateProductType = {
          type: languageData.value.type,
          storeCode: pathQuery.code as string,
          code: languageData.value.code,
          ko: translatedLanguage.ko,
          jp: translatedLanguage.jp,
          en: translatedLanguage.en,
          zh_hans: translatedLanguage.zh_hans,
          zh_hant: translatedLanguage.zh_hant,
        };
        saveLoading.value = true;
        const res = (await requestUpdateTranslateProduct(
          data,
        )) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (res.data.code === 401) {
          failAuthenticationAlert();
        }
        if (res.data.code === 200) {
          if (props.requestProductList && languageData.value.type === 'goods') {
            await props.requestProductList();
          }
          if (props.requestCategory && languageData.value.type === 'category') {
            await props.requestCategory();
          }

          if (
            props.requestProductDetail &&
            languageData.value.type === 'goods'
          ) {
            await props.requestProductDetail();
          }

          closeModal(LANGUAGE_TRANSLATE);
          ElMessage({
            type: 'success',
            message: '저장 되었습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        saveLoading.value = false;
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

// 모달창 이름 가져오기
const getTitleName = computed(() => {
  const { type } = languageData.value;

  if (type === 'goods') return '상품 번역';
  if (type === 'category') return '분류 번역';

  return '';
});

const getDisplayNameTitle = computed(() => {
  const { type } = languageData.value;

  if (type === 'goods') return '태블릿 노출 상품명';
  if (type === 'category') return '분류 이름';

  return '이름';
});

onMounted(() => {
  const propsData = JSON.parse(JSON.stringify(modalData.languageTranslate));
  languageData.value = propsData;
  translatedLanguage.ko = propsData.lang.ko;
  translatedLanguage.en = propsData.lang.en;
  translatedLanguage.jp = propsData.lang.jp;
  translatedLanguage.zh_hans = propsData.lang.zh_hans;
  translatedLanguage.zh_hant = propsData.lang.zh_hant;
});
</script>

<template>
  <el-dialog
    v-model="flag.languageTranslate"
    align-center
    width="40%"
  >
    <template #header>
      <el-row
        align="middle"
        class="mt-10"
      >
        <p class="mr-10">
          {{ getTitleName }}
        </p>
      </el-row>
    </template>
    <el-row
      align="middle"
      class="mb-10"
      justify="space-between"
    >
      <el-descriptions
        :column="languageData.type === 'goods' ? 3 : 2"
        border
        class="width-100"
      >
        <el-descriptions-item
          v-if="languageData.type === 'goods'"
          :width="120"
        >
          <template #label> 포스 출력 이름</template>
          {{ languageData.pos_name }}
        </el-descriptions-item>
        <el-descriptions-item :width="120">
          <template #label>
            {{ getDisplayNameTitle }}
          </template>
          {{ languageData.display_name }}
        </el-descriptions-item>
        <el-descriptions-item :width="80">
          <template #label>
            {{ `${languageData.type === 'goods' ? '상품 코드' : '분류 코드'}` }}
          </template>
          {{ languageData.code }}
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <div class="bg-p">
      <el-row
        class="mb-10"
        justify="end"
      >
        <el-button
          v-if="isOriginAdmin() || isBrand1Admin()"
          v-loading.fullscreen="translateLoading"
          size="small"
          type="success"
          @click="postTranslateWord"
        >
          자동 번역
        </el-button>
      </el-row>
      <el-row
        align="middle"
        class="mb-10"
        justify="space-between"
      >
        <el-col :span="6">
          <p class="language-translate-title">한글</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="translatedLanguage.ko"
            :disabled="isOriginAdmin() || isBrand1Admin()"
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
          <p class="language-translate-title">일본어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="translatedLanguage.jp"
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
          <p class="language-translate-title">영어</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="translatedLanguage.en"
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
          <p class="language-translate-title">중국어 (간체)</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="translatedLanguage.zh_hans"
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
          <p class="language-translate-title">중국어 (번체)</p>
        </el-col>
        <el-col :span="17">
          <el-input
            v-model="translatedLanguage.zh_hant"
            class="input-text"
          />
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <el-button
        type="danger"
        @click="closeModal(LANGUAGE_TRANSLATE)"
      >
        닫기
      </el-button>
      <el-button
        :loading="saveLoading"
        type="primary"
        @click="translationWordSave"
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

.language-translate-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.input-text {
  text-align: center;
}
</style>
