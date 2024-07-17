<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, reactive, Ref, onMounted, watch } from 'vue';
import {
  ElMessage,
  ElMessageBox,
  FormRules,
  FormInstance,
  ElSelect,
  ElInput,
  ElAutocomplete,
} from 'element-plus';
import { AxiosResponse } from 'axios';
import { getRouteName } from '@utils/route.helper';
import { runtimeCheckHelper, authentication, formattingUtils } from '@utils';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
// eslint-disable-next-line import/order
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/i18n/ko-kr';
import { cSInquiryRegister } from '@router/routePaths';
import {
  categoryDefaultType,
  categoryFirstType,
  storeInquiryListType,
  inquiryCommentDataType,
  selectOptionType,
  selectOptionDataType,
} from '@interface/inquiry';
import { Phone, AlarmClock, Headset, Top } from '@element-plus/icons-vue';
import { BreadcrumbHeader } from '@components';
import {
  CS_INQUIRY_BOARD,
  CS_INQUIRY_REGISTER,
  CS_INQUIRY_EDIT,
} from '@common/string';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style
import { inquiryCodec } from '@codecs';
import { inquiry, store, notice } from '@apis';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { formatPhoneNumber } = formattingUtils;
const {
  requestCommonSelectOptionData,
  requestStoreInquiryData,
  requestCreateInquiry,
  requestUpdateInquiry,
  requestInquiryDetailInfo,
} = inquiry;

const { requestSearchStoreNameResults } = store;

const { requestNoticeFileUpload } = notice;

const {
  storeInquiryListCodec,
  requestSelectOptionListCodec,
  storeListCodec,
  inquiryDetailInfoCodec,
} = inquiryCodec;

const route = useRoute();
const router = useRouter();

/** 등록하기, 수정하기 선택 여부 */
/** isCreateInquiry = true, 등록 */
const isCreateInquiry = () => Object.keys(route.query).length === 0;

const csInquiryRegisterHeader = reactive([
  { name: CS_INQUIRY_BOARD },
  { name: isCreateInquiry() ? CS_INQUIRY_REGISTER : CS_INQUIRY_EDIT },
]);

let requestEditor: any = '';
const requestRefEditor: Ref<any> = ref(null);
// const processingRefEditor: Ref<any> = ref(null);
const imageList: Ref<
  Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
  }>
> = ref([]); // template의 ref의 값과 동일한 변수 선언

const uploadImage = async (blob: File) => {
  // 서버로부터 이미지 주소 받아옴
  const res = (await requestNoticeFileUpload(blob)) as AxiosResponse;
  if (res.status === 200) {
    imageList.value.push(res.data);
  }
  return res;
};

// 입력 데이터 수집
const inputInquiryData = reactive({
  storeNameFlag: '',
  storeCode: '',
  storeName: '',
  category1: '',
  category2: '',
  keyword: '',
  stat: 0,
  enquirer: '',
  enquirerHp: '',
  title: '',
  context:
    '<ul><li><p>고객 ID : (해피톡 인입 시)</p></li><li><p>문의 내용 :</p><p><br></p></li><li><p>안내 내용 :</p><p><br></p></li></ul>', // 요청내용
  // context2: '', // 처리내용
  checker: '',
  bbsRegisterDate: '',
  customerCompensate: '',
  customerType: '',
  cs_incoming: '',
  cs_incoming_stat: '',
  complain: '',
  complain_name: '',
});

// Form Validation
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  storeCode: [
    {
      required: isCreateInquiry(),
      message: '매장을 선택해주세요.',
      trigger: 'change',
    },
  ],
  enquirer: [
    {
      required: true,
      message: '문의자를 지정해주세요.',
      trigger: 'change',
    },
  ],
  enquirerHp: [
    {
      required: true,
      message: '연락처를 입력해주세요.',
      trigger: 'change',
    },
  ],
  category1: [
    {
      required: true,
      message: '1차 유형을 지정해주세요.',
      trigger: 'change',
    },
  ],
  category2: [
    {
      required: true,
      message: '',
      trigger: 'change',
    },
  ],
  stat: [
    {
      required: true,
      message: '요청 상태를 지정해주세요.',
      trigger: 'change',
    },
  ],
  complain: [
    {
      required: true,
      message: '불만 유형을 지정해주세요.',
      trigger: 'blur',
    },
  ],
  cs_incoming: [
    {
      required: true,
      message: '인입 유형을 지정해주세요.',
      trigger: 'change',
    },
  ],
});

const formatContact = () => {
  inputInquiryData.enquirerHp = formatPhoneNumber(inputInquiryData.enquirerHp);
};

/** 담당자 이름 */
const personInCharge = ref(localStorage.getItem('master'));

/** 작성일 */
const nowDate = ref(new Date().toLocaleDateString().slice(0, -1));

const setEditorUI = () => {
  requestEditor = new Editor({
    el: requestRefEditor.value,
    height: '500px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    plugins: [colorSyntax],
    initialValue: inputInquiryData.context,
    hooks: {
      addImageBlobHook: async (blob: any, callback: any) => {
        const imgUrl: any = await uploadImage(blob);
        callback(imgUrl.data.filePath, imgUrl.data.filePath.fileName);
      },
    },
    autofocus: false,
    language: 'ko-KR',
  });
};

/** 카테고리유형 데이터 */
const optionFirstCategoryList: Ref<categoryFirstType[]> = ref([]);
/** 1차 유형 클릭에 따른 2차 유형 조회 */
const optionSecondCategoryList: Ref<categoryDefaultType[]> = ref([]);

const selectFirstInquiryType = (first: categoryFirstType) => {
  optionSecondCategoryList.value = first.child;
  // 이미 선택되어 있는 2차 유형 초기화
  inputInquiryData.category2 = '';
};

/** 수정하기 진입시 2차 유형 조회 */
watch(inputInquiryData, () => {
  const target = optionFirstCategoryList.value.find(
    (first: categoryFirstType) => first.code === inputInquiryData.category1,
  );
  if (target) {
    optionSecondCategoryList.value = target.child;
  }
});

/** 검색한 매장 리스트 (빈 값: 모든 매장) */
const searchedStoreList: Ref<selectOptionType[]> = ref([]);
const searchedStoreName = ref('');

const selectStoreInList = (storeInfo: any) => {
  inputInquiryData.storeCode = storeInfo.code;
  inputInquiryData.storeName = storeInfo.value;
};

const createFilter = (inputStore: string) => (storeInList: any) =>
  storeInList.value.includes(inputStore);

const searchStoreListByInput = (inputStore: string, cb: any) => {
  const convertedList = searchedStoreList.value.map((data) => ({
    value: data.label,
    code: data.value,
  }));

  const results = inputStore
    ? convertedList.filter(createFilter(inputStore))
    : convertedList;
  cb(results);
};

/** 코멘트 데이터 */
const commentDataList: Ref<inquiryCommentDataType[]> = ref([]);

const viewerRef: Ref<any> = ref(null);

const setViewer = () => {
  commentDataList.value.forEach((item, i) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const viewer = new Viewer({
      el: viewerRef.value[i],
      initialValue: item.context,
    });
  });
};

watch(
  () => viewerRef.value,
  () => setViewer(),
);

/** 해당 매장 문의 내역 리스트 불러오기 */
const getInquiryDetailInfo = async () => {
  if (isCreateInquiry()) {
    return;
  }
  const inquiryNumber = route.query.num as unknown as number;

  try {
    const res = (await requestInquiryDetailInfo(
      inquiryNumber,
    )) as AxiosResponse;
    const typeError = runtimeCheck(inquiryDetailInfoCodec, res.data);

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
        await setEditorUI();
        inputInquiryData.storeCode = res.data.data.storeCode;
        inputInquiryData.storeName = res.data.data.storeName;
        inputInquiryData.category1 = res.data.data.category1;
        inputInquiryData.category2 = res.data.data.category2;
        inputInquiryData.keyword = res.data.data.keyword;
        inputInquiryData.stat = Number(res.data.data.stat ?? '0');
        inputInquiryData.enquirer = res.data.data.enquirer;
        inputInquiryData.enquirerHp = res.data.data.enquirerHp;
        inputInquiryData.title = res.data.data.title;
        // inputInquiryData. context2 = res.data.data. context2;
        inputInquiryData.checker = res.data.data.checker;
        inputInquiryData.bbsRegisterDate = res.data.data.bbsRegisterDate;
        inputInquiryData.customerCompensate = res.data.data.customerCompensate;
        inputInquiryData.customerType = res.data.data.customerType;
        inputInquiryData.cs_incoming = res.data.data.cs_incoming;
        personInCharge.value = res.data.data.checker;
        nowDate.value = res.data.data.bbsRegisterDate;
        commentDataList.value = res.data.data.comment;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 매장 리스트 불러오기 */
const getCsStoreList = async () => {
  try {
    const payload = { searchTxt: '' };
    const res = (await requestSearchStoreNameResults(payload)) as AxiosResponse;
    const typeError = runtimeCheck(storeListCodec, res.data);

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
        searchedStoreList.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 해당 매장 문의 내역 데이터 */
const storeInquiryData = ref<storeInquiryListType[]>([]);
/** 해당 매장 문의 내역 리스트 불러오기 */
const getStoreInquiryListData = async (num: number) => {
  const targetStore =
    inputInquiryData.storeNameFlag === 'N'
      ? 'NONE'
      : inputInquiryData.storeCode;
  try {
    const res = (await requestStoreInquiryData(
      targetStore,
      num,
    )) as AxiosResponse;
    const typeError = runtimeCheck(storeInquiryListCodec, res.data);

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
        storeInquiryData.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 문의 등록하기 */
const createInquiryData = () => {
  inputInquiryData.context = requestEditor.getHTML();
  const requestData = inputInquiryData;

  ElMessageBox.confirm('저장하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestCreateInquiry(requestData)) as AxiosResponse;

        if (res.data.code === 400) {
          ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (res.data.code === 401) {
          failAuthenticationAlert();
        }
        if (res.data.code === 200) {
          ElMessage({
            type: 'success',
            message: '저장되었습니다.',
          });
          router.back();
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

/** 문의 수정하기 */
const updateInquiryData = () => {
  inputInquiryData.context = requestEditor.getHTML();

  const requestData = {
    num: Number(route.query.num),
    storeCode: inputInquiryData.storeCode,
    category1: inputInquiryData.category1,
    category2: inputInquiryData.category2,
    keyword: inputInquiryData.keyword,
    stat: inputInquiryData.stat,
    enquirer: inputInquiryData.enquirer,
    enquirerHp: inputInquiryData.enquirerHp,
    title: inputInquiryData.title,
    customerCompensate: inputInquiryData.customerCompensate,
    customerType: inputInquiryData.customerType,
    cs_incoming: inputInquiryData.cs_incoming,
    cs_incoming_stat: inputInquiryData.cs_incoming_stat,
    context: inputInquiryData.context,
    complain: inputInquiryData.complain,
    //  context2: inputInquiryData. context2,
  };

  ElMessageBox.confirm('수정하시겠습니까?', '확인', {
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestUpdateInquiry(requestData)) as AxiosResponse;

        if (res.data.code === 400) {
          ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (res.data.code === 401) {
          failAuthenticationAlert();
        }
        if (res.data.code === 200) {
          ElMessage({
            type: 'success',
            message: '수정되었습니다.',
          });
          router.back();
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '취소되었습니다.',
      });
    });
};

const storeCode = ref<
  InstanceType<typeof ElAutocomplete> | InstanceType<typeof ElSelect>
>();
const enquirer = ref<InstanceType<typeof ElSelect>>();
const enquirerHp = ref<InstanceType<typeof ElInput>>();
const category1 = ref<InstanceType<typeof ElSelect>>();
const category2 = ref<InstanceType<typeof ElSelect>>();
const keyword = ref<InstanceType<typeof ElInput>>();
const stat = ref<InstanceType<typeof ElSelect>>();
const complain = ref<InstanceType<typeof ElSelect>>();
const csIncoming = ref<InstanceType<typeof ElSelect>>();

const checkRefName = (refName: string[]) => {
  if (refName.includes('storeCode')) {
    storeCode.value?.focus();
    return;
  }
  if (refName.includes('enquirer')) {
    enquirer.value?.toggleMenu();
    return;
  }
  if (refName.includes('enquirerHp')) {
    enquirerHp.value?.focus();
    return;
  }
  if (refName.includes('category1')) {
    category1.value?.toggleMenu();
    return;
  }
  if (refName.includes('category2')) {
    category2.value?.toggleMenu();
    return;
  }
  if (refName.includes('keyword')) {
    keyword.value?.focus();
    return;
  }
  if (refName.includes('stat')) {
    stat.value?.toggleMenu();
    return;
  }
  if (refName.includes('complain')) {
    complain.value?.toggleMenu();
    return;
  }
  if (refName.includes('cs_incoming')) {
    csIncoming.value?.toggleMenu();
  }
};

const validatingCreate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (inputInquiryData.complain === '') {
    inputInquiryData.complain = '없음';
  }
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (inputInquiryData.complain === '없음') {
        inputInquiryData.complain = '';
      }
      createInquiryData();
    } else if (!valid && fields) {
      checkRefName(Object.keys(fields));
    }
  });
};

const validatingUpdate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (inputInquiryData.complain === '') {
    inputInquiryData.complain = '없음';
  }
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (inputInquiryData.complain === '없음') {
        inputInquiryData.complain = '';
      }
      updateInquiryData();
    } else if (!valid && fields) {
      checkRefName(Object.keys(fields));
    }
  });
};

/** 문의 상태값 데이터 */
const optionStatTypeList = ref<selectOptionDataType[]>([]);

/** 코멘트 인입 유형들 */
const optionCommentIncomingTypeList = ref<selectOptionDataType[]>([]);

/** 불만 유형들 */
const optionComplainList = ref<selectOptionDataType[]>([]);

const postCommonSelectOptionData = async () => {
  try {
    /** 문의게시판 목록 페이지와 등록/수정 페이지의 selectBox option이 다름  */
    const payload = { for_create: 'Y' };
    const res = (await requestCommonSelectOptionData(payload)) as AxiosResponse;
    const typeError = runtimeCheck(requestSelectOptionListCodec, res.data);

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
        optionFirstCategoryList.value = res.data.data.category_list;
        optionStatTypeList.value = res.data.data.stat_list;
        optionCommentIncomingTypeList.value = res.data.data.incoming_list;
        optionComplainList.value = res.data.data.complain_name_list;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 에디터 */
onMounted(() => {
  if (isCreateInquiry()) {
    setEditorUI();
  }
});

/** 매장 선택시 해당 매장 문의 내역 조회 */
watch(
  () => inputInquiryData.storeCode,
  () => {
    if (!inputInquiryData.storeCode) {
      return;
    }
    getStoreInquiryListData(Number(route.query.num));
  },
);

/** 카테고리 이름 */

const findFirstCategoryInfo = (code: string) =>
  optionFirstCategoryList.value.find(
    (category: categoryFirstType) => category.code === code,
  );

const findFirstCategoryTypeName = (code: string) => {
  const target = findFirstCategoryInfo(code);
  if (target) return target.name;
  return '';
};

const findSecondCategoryTypeName = (firstCode: string, secondCode: string) => {
  const firstCategory = findFirstCategoryInfo(firstCode);
  if (!firstCategory) return '';
  const secondCategoryList = firstCategory.child;
  if (secondCategoryList) {
    const target = secondCategoryList.find(
      (category: categoryDefaultType) => category.code === secondCode,
    );
    return target?.name;
  }
  return '';
};

/** 등록 날짜 줄바꿈 */
const getSplitString = (date: string) => {
  if (!date) return '';
  const editedString = date.split(' ');
  return editedString;
};

// 이전 문의 내역 새창
const popBeforeRegisterPage = (num: number) => {
  const routeData = router.resolve({
    name: getRouteName(cSInquiryRegister),
    query: { num },
  });
  window.open(routeData.href, '_blank');
};

// 스크롤 최상단 이동
const setScrollTop = () => {
  const element = document.querySelector('.default_layout_contents');
  if (element) {
    element.scrollTo(0, 0);
  }
};

const requestPersonArray = [
  {
    value: '대표',
    label: '대표',
  },
  {
    value: '직원',
    label: '직원',
  },
  {
    value: '기타',
    label: '기타',
  },
];

/** 문의 상태 별 El-tag Type */
const getTagType = (statusName: string) => {
  let type = '';
  if (statusName === '대기') {
    type = 'danger';
  }
  if (statusName === '확인완료') {
    type = 'success';
  }
  if (statusName === '보류') {
    type = 'warning';
  }
  return type;
};

/** 테이블 불만유형 및 상태에 따른 열 색상 구분 */
const tableRowClassName = ({ row }: { row: storeInquiryListType }) => {
  let color = '';
  if (row.stat_name === '확인중') {
    color = 'warning-row';
  }
  if (row.complain) {
    color = 'danger-row';
  }

  return color;
};

// 매장명 있음
const setYesStoreName = () => {
  inputInquiryData.storeCode = '';
  searchedStoreName.value = '';
};

// 매장명 없음
const setNoStoreName = () => {
  inputInquiryData.storeCode = '매장명 없음';
  searchedStoreName.value = '매장명 없음';
};

/** v-for 방어 로직 */
const getFirstCategoryOptionKey = (name: string, index: number) =>
  name ? `firstCategory-${name}` : `firstCategory-${index}`;
const getSecondCategoryOptionKey = (name: string, index: number) =>
  name ? `secondCategory-${name}` : `secondCategory-${index}`;
const getStateOptionKey = (name: string, index: number) =>
  name ? `state-${name}` : `state-${index}`;
const getComplainOptionKey = (name: string, index: number) =>
  name ? `complain-${name}` : `complain-${index}`;
const getIncomingOptionKey = (name: string, index: number) =>
  name ? `incoming-${name}` : `incoming-${index}`;
const getCommentOptionKey = (no: number, index: number) =>
  no > 0 ? `comment-${no}` : `comment-${index}`;

if (isCreateInquiry()) getCsStoreList();
postCommonSelectOptionData();
getInquiryDetailInfo();
</script>

<template>
  <BreadcrumbHeader :propsHeader="csInquiryRegisterHeader" />
  <el-row>
    <p
      v-if="isCreateInquiry()"
      class="inquiry-register-title"
    >
      고객상담 문의 등록
    </p>
    <p
      v-else
      class="inquiry-register-title"
    >
      고객상담 문의 수정
    </p>
    <el-tag v-if="isCreateInquiry()">
      고객상담 문의를 등록할 수 있는 페이지 입니다.
    </el-tag>
    <el-tag v-else> 고객상담 문의를 수정할 수 있는 페이지 입니다.</el-tag>
  </el-row>
  <div class="register-background">
    <el-card
      class="mb-10"
      shadow="never"
    >
      <el-form
        ref="ruleFormRef"
        :model="inputInquiryData"
        :rules="rules"
        label-position="top"
        label-width="120px"
        status-icon
      >
        <div class="font-emphasis mb-10">문의 정보</div>
        <div class="title-divider"></div>
        <div class="inquiry-path-grid">
          <el-form-item
            :label="isCreateInquiry() ? '문의 매장 선택' : '문의 매장'"
            prop="storeCode"
          >
            <div class="width-100">
              <div
                v-if="isCreateInquiry()"
                class="inquiry-store-create"
              >
                <el-radio-group v-model="inputInquiryData.storeNameFlag">
                  <el-radio-button
                    label="Y"
                    @change="setYesStoreName"
                  >
                    매장명 있음
                  </el-radio-button>
                  <el-radio-button
                    label="N"
                    @change="setNoStoreName"
                  >
                    매장명 없음
                  </el-radio-button>
                </el-radio-group>
                <el-row align="middle">
                  <el-autocomplete
                    v-model="searchedStoreName"
                    :disabled="inputInquiryData.storeNameFlag === 'N'"
                    :fetch-suggestions="searchStoreListByInput"
                    class="width-100"
                    placeholder="매장명을 검색해주세요."
                    @select="selectStoreInList"
                  />
                </el-row>
              </div>
              <div
                v-else
                class="inquiry-store-modify"
              >
                <el-input
                  :disabled="true"
                  :placeholder="inputInquiryData.storeName"
                />
              </div>
            </div>
          </el-form-item>
          <el-form-item
            label="문의자"
            prop="enquirer"
          >
            <el-select
              ref="enquirer"
              v-model="inputInquiryData.enquirer"
              style="width: 100%"
            >
              <el-option
                v-for="person in requestPersonArray"
                :key="person.value"
                :label="person.label"
                :value="person.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="연락처"
            prop="enquirerHp"
          >
            <el-input
              ref="enquirerHp"
              v-model="inputInquiryData.enquirerHp"
              style="width: 100%"
              @input="formatContact()"
            >
              <template #prepend>
                <el-icon>
                  <Phone />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="font-emphasis mb-10">문의 유형</div>
        <div class="title-divider"></div>
        <div class="inquiry-display-flex">
          <el-form-item
            label="1차 유형"
            prop="category1"
          >
            <el-select
              ref="category1"
              v-model="inputInquiryData.category1"
            >
              <el-option
                v-for="(first, index) in optionFirstCategoryList"
                :key="getFirstCategoryOptionKey(first.name, index)"
                :label="first.name"
                :value="first.code"
                @click="selectFirstInquiryType(first)"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="상세 유형 및 비고"
            prop="keyword"
          >
            <el-input
              v-model="inputInquiryData.keyword"
              class="input-with-select"
              style="width: 500px"
            >
              <template #prepend>
                <el-form-item prop="category2">
                  <el-select
                    ref="category2"
                    v-model="inputInquiryData.category2"
                    :disabled="!inputInquiryData.category1"
                    placeholder="1차 유형을 선택해주세요."
                    style="width: 190px"
                  >
                    <el-option
                      v-for="(second, index) in optionSecondCategoryList"
                      :key="getSecondCategoryOptionKey(second.name, index)"
                      :label="second.name"
                      :value="second.code"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="요청 상태"
            prop="stat"
          >
            <el-select
              ref="stat"
              v-model="inputInquiryData.stat"
            >
              <el-option
                v-for="(status, index) in optionStatTypeList"
                :key="getStateOptionKey(status.name, index)"
                :label="status.name"
                :value="status.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="불만 유형"
            prop="complain"
          >
            <el-select
              ref="complain"
              v-model="inputInquiryData.complain"
              clearable
            >
              <el-option
                v-for="(complains, index) in optionComplainList"
                :key="getComplainOptionKey(complains.name, index)"
                :label="complains.name"
                :value="complains.code"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="inquiry-path-grid">
          <el-form-item
            label="인입 유형"
            prop="cs_incoming"
          >
            <el-select
              ref="csIncoming"
              v-model="inputInquiryData.cs_incoming"
              class="comment-select"
            >
              <el-option
                v-for="incoming in optionCommentIncomingTypeList"
                :key="getIncomingOptionKey(incoming.name, incoming.code)"
                :label="incoming.name"
                :value="incoming.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="고객 보상">
            <el-input
              v-model="inputInquiryData.customerCompensate"
              clearable
              placeholder="고객 보상 내용을 입력해주세요."
            />
          </el-form-item>
          <el-form-item label="고객 유형">
            <el-input
              v-model="inputInquiryData.customerType"
              clearable
              placeholder="고객 유형 내용을 입력해주세요."
            />
          </el-form-item>
        </div>
        <div class="font-emphasis mb-10">확인 담당자</div>
        <div class="title-divider"></div>
        <div class="inquiry-display-flex">
          <el-form-item label="담당자 이름">
            <el-input
              v-model="personInCharge"
              disabled
            >
              <template #prepend>
                <el-icon>
                  <Headset />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="작성일">
            <el-input
              v-model="nowDate"
              disabled
            >
              <template #prepend>
                <el-icon>
                  <AlarmClock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
    <!-- 이전 문의내역 -->
    <el-card
      class="mb-10"
      shadow="never"
    >
      <div class="font-emphasis">이전 문의내역</div>
      <div class="title-divider"></div>
      <el-table
        :data="storeInquiryData"
        :row-class-name="tableRowClassName"
        border
        height="400"
      >
        <el-table-column
          type="expand"
          width="40"
        >
          <template #default="props">
            <!-- 이전 문의내역 상세 정보 -->
            <div class="register-before-inquiry">
              <div>
                <el-card
                  class="register-before-inquiry-card"
                  shadow="never"
                >
                  <div class="font-emphasis">문의 내용</div>
                  <div class="title-divider"></div>
                  <div :innerHTML="props.row.context"></div>
                </el-card>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          head-align="center"
          label="번호"
          prop="num"
          width="100"
        >
          <template #default="scope">
            <el-row>
              <el-col :span="24">
                {{ scope.row.num }}
              </el-col>
              <el-col :span="24">
                <el-button
                  size="small"
                  @click="popBeforeRegisterPage(scope.row.num)"
                >
                  이동하기
                </el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          head-align="center"
          label="1차 문의 유형"
        >
          <template #default="scope">
            {{ findFirstCategoryTypeName(scope.row.category1) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          head-align="center"
          label="2차 문의 유형"
        >
          <template #default="scope">
            {{
              findSecondCategoryTypeName(
                scope.row.category1,
                scope.row.category2,
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          head-align="center"
          label="매장명"
          prop="storeName"
          width="200"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="문의자"
          prop="enquirer"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="문의자 연락처"
          prop="enquirerHp"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="인입 유형"
          prop="cs_incoming_name"
          width="100"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="불만유형"
          prop="complain_name"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="담당자"
          prop="checker"
        />
        <el-table-column
          align="center"
          head-align="center"
          label="상태"
          prop="address"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getTagType(row.stat_name)">
              {{ row.stat_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="날짜"
          width="200"
        >
          <template #default="scope">
            <span> {{ getSplitString(scope.row.bbsRegisterDate)[0] }} / </span>
            <span class="cs-time-column">
              {{ getSplitString(scope.row.bbsRegisterDate)[1] }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 문의 내용 & 처리 결과 -->
    <el-row
      :gutter="10"
      justify="space-between"
    >
      <el-col :span="12">
        <el-card
          class="card-wrap mb-10"
          shadow="never"
        >
          <div class="font-emphasis">문의 내용</div>
          <div class="title-divider"></div>
          <div ref="requestRefEditor"></div>
        </el-card>
        <!-- <el-card
          shadow="never"
          class="card-wrap"
        >
          <div class="font-emphasis">
            처리 결과
          </div>
          <div class="title-divider"/>
          <div ref="processingRefEditor"/>
        </el-card> -->
      </el-col>
      <el-col :span="12">
        <el-card
          class="comment-card-wrap"
          shadow="never"
        >
          <div class="font-emphasis">처리 내역</div>
          <div class="title-divider"></div>
          <el-scrollbar height="500px">
            <el-timeline>
              <el-timeline-item
                v-for="(comment, index) in commentDataList"
                :key="getCommentOptionKey(comment.no, index)"
                :timestamp="comment.bbsRegisterDate"
                placement="top"
              >
                <el-card>
                  <p class="inquiry-timeline-item-no mb-10">
                    No. {{ comment.no }}
                  </p>
                  <el-row align="middle">
                    <div class="inquiry-incoming-title mb-10">
                      담당자 : {{ comment.checker }}
                    </div>
                  </el-row>
                  <div ref="viewerRef"></div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <div class="register-floating-button">
    <el-button
      :icon="Top"
      type="success"
      @click="setScrollTop"
    />
    <el-button
      v-if="isCreateInquiry()"
      size="large"
      type="primary"
      @click="validatingCreate(ruleFormRef)"
    >
      등록하기
    </el-button>
    <el-button
      v-else
      size="large"
      type="primary"
      @click="validatingUpdate(ruleFormRef)"
    >
      수정하기
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.inquiry-register-title {
  margin: 0px 10px 20px 0px;
  font-size: 22px;
  font-weight: 500;
}

.register-background {
  width: calc(100% - 20px);
  padding: 10px;
  background-color: #f1f1ff;

  .comment-select {
    width: 100%;
  }

  .register-before-inquiry {
    /* display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px; */
    padding: 15px;

    .register-before-inquiry-card {
      height: 100%;
    }
  }

  .input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
  }

  .title-divider {
    margin: 10px 0;
    border-bottom: 1px solid #dcdfe6;
  }

  .inquiry-path-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .inquiry-store-create {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      align-items: center;
      width: 100%;
    }

    .inquiry-path-input {
      width: 100%;
    }
  }

  .inquiry-display-flex {
    display: flex;
    gap: 20px;

    .inquiry-path-input {
      width: 100%;
    }
  }

  .card-wrap {
    width: 100%;
  }

  .comment-card-wrap {
    .inquiry-timeline-item-no {
      font-size: 14px;
      font-weight: bold;
    }

    .inquiry-incoming-title {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #acacac;
    }

    .inquiry-timeline-item-context {
      font-size: 15px;

      &:deep(img) {
        max-width: 100%;
        object-fit: contain;
      }
    }
  }
}

.register-floating-button {
  position: fixed;
  right: 2%;
  bottom: 5%;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.el-table {
  .cs-time-column {
    color: #f56c6c;
  }

  &:deep(.warning-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }

  &:deep(.danger-row) {
    --el-table-tr-bg-color: var(--el-color-danger-light-9);
  }
}
</style>
