<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, Ref } from 'vue';
import {
  UploadFile,
  UploadProps,
  UploadUserFile,
  ElMessage,
  ElMessageBox,
  FormRules,
  FormInstance,
  UploadRawFile,
} from 'element-plus';
import { AxiosResponse } from 'axios';
import { pushPage } from '@utils/route.helper';
import { cookieUtils, authentication } from '@utils/index';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/i18n/ko-kr';
import useModalStore from '@store/storeModal';
import { noticeBoard } from '@router/routePaths';
import {
  getStoreListParamType,
  noticeFileListType,
  searchStoreListType,
  storeListType,
  useNoticeDetailInfoType,
} from '@interface/notice';
import { optionType } from '@interface/category';
import { QuestionFilled } from '@element-plus/icons-vue';
import { EditNoticeStoreListModal } from '@containers';
import { BreadcrumbHeader } from '@components';
import {
  EDIT_NOTICE_STORE_LIST,
  NOTICE_BOARD,
  NOTICE_BOARD_EDIT,
  NOTICE_BOARD_CREATE,
  USER_AUTHORITY,
  SINGLE_STORE_SETTING,
} from '@common/string';
import { GATE_WAY_API_URL } from '@common/envVariables';
import endpoints from '@apis/endpoints';
import { notice } from '@apis';

const { failAuthenticationAlert } = authentication;

const {
  requestNoticeFileDelete,
  requestNoticeDetailInfo,
  requestStoreList,
  requestNoticeDetailInfoUpdate,
  requestNoticeFileUpload,
} = notice;

const { flag, openModal } = useModalStore();

const route = useRoute();
const router = useRouter();

const getRouteQuery = computed(() => route.query?.noticeId);

const getTitle = () =>
  getRouteQuery.value ? NOTICE_BOARD_EDIT : NOTICE_BOARD_CREATE;
// header props
const noticeBoardHeader = reactive([
  { name: NOTICE_BOARD },
  { name: getRouteQuery.value ? NOTICE_BOARD_EDIT : NOTICE_BOARD_CREATE },
]);

const getBtnType = () => (getRouteQuery.value ? 'warning' : 'primary');
const getBtnLabel = () => (getRouteQuery.value ? '수정' : '등록');
const noticeDetailInfo = reactive<useNoticeDetailInfoType>({
  noticeId: null,
  createDate: '',
  noticeUrgent: 0,
  noticeTitle: '',
  noticeDesc: '',
  noticeStatus: 0,
  noticeTopFix: 0,
  noticeCategory: 'NOTICE',
  noticeStoreList: [],
  noticeFileList: [],
  author: '티오더 관리자',
  noticePostingStatus: 0,
  noticePostingStartDate: '',
  noticePostingStartTime: 0,
  noticePostingStartMinute: 0,
  noticePostingEndDate: '',
  noticePostingEndTime: 23,
  noticePostingEndMinute: 59,
  noticePopupStatus: 0,
  noticePopupEndDate: '',
  noticePopupEndTime: 23,
  noticePopupEndMinute: 59,
  noticePopupStartDate: '',
  noticePopupStartTime: 0,
  noticePopupStartMinute: 0,
  noticePopupPostingStatus: 0,
});

// Form Validation
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  noticeTitle: [
    {
      required: true,
      message: '제목을 입력해 주세요.',
      trigger: 'blur',
    },
    {
      min: 2,
      message: '두 글자 이상 작성해주세요.',
      trigger: 'blur',
    },
  ],
  noticeStatus: [
    {
      required: true,
      message: '게시 여부를 선택해주세요.',
      trigger: 'change',
    },
  ],
});

// 작성일, 작성자
const getNoticeCreateDate = computed(() => {
  const { createDate } = noticeDetailInfo;

  if (createDate) {
    return createDate;
  }

  const date = new Date();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const parseDate = `${date.getFullYear()}-${month}-${day}`;

  return parseDate;
});

// 구분
const division = [
  {
    value: 'NOTICE',
    label: '공지사항',
  },
  {
    value: 'UPDATE',
    label: '업데이트',
  },
  {
    value: 'EVENT',
    label: '이벤트',
  },
  {
    value: 'NEWS',
    label: '뉴스',
  },
];

// 상단 고정, 팝업 설정
const isTopFix = computed(() => noticeDetailInfo.noticeTopFix === 1);
const isUrgent = computed(() => noticeDetailInfo.noticeUrgent === 1);

const changeTopFix = (val: boolean) => {
  if (val) {
    noticeDetailInfo.noticeTopFix = 1;
  } else {
    noticeDetailInfo.noticeTopFix = 0;
  }
};

const changeUrgent = (val: boolean) => {
  if (val) {
    noticeDetailInfo.noticeUrgent = 1;
  } else {
    noticeDetailInfo.noticeUrgent = 0;
  }
};

// 게시 여부
const selectedNoticePostingDate = ref<string[]>([]);
const shortcuts = [
  {
    text: '최근 1주일',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '최근 1개월',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '최근 3개월',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const setNoticeStatus = (val: number) => {
  if (val === 0) {
    selectedNoticePostingDate.value = [];
    noticeDetailInfo.noticePostingStatus = 0;
    noticeDetailInfo.noticePostingStartDate = '';
    noticeDetailInfo.noticePostingStartTime = 0;
    noticeDetailInfo.noticePostingStartMinute = 0;
    noticeDetailInfo.noticePostingEndDate = '';
    noticeDetailInfo.noticePostingEndTime = 23;
    noticeDetailInfo.noticePostingEndMinute = 59;
  }
};
// 게시기간 여부 함수
const setNoticePostingStatus = (val: number) => {
  if (val === 0) {
    selectedNoticePostingDate.value = [];
    noticeDetailInfo.noticePostingStartDate = '';
    noticeDetailInfo.noticePostingStartTime = 0;
    noticeDetailInfo.noticePostingStartMinute = 0;
    noticeDetailInfo.noticePostingEndDate = '';
    noticeDetailInfo.noticePostingEndTime = 23;
    noticeDetailInfo.noticePostingEndMinute = 59;
  }
};
// 게시 날짜 및 시간
const setDate = () => {
  const val = selectedNoticePostingDate.value;
  if (val.length !== 0) {
    const start = val[0].split(' ');
    const startDate = start[0];
    const startHour = start[1].split(':')[0];
    const startMin = start[1].split(':')[1];
    noticeDetailInfo.noticePostingStartDate = startDate;
    noticeDetailInfo.noticePostingStartTime = Number(startHour);
    noticeDetailInfo.noticePostingStartMinute = Number(startMin);
    const end = val[1].split(' ');
    const endDate = end[0];
    const endHour = end[1].split(':')[0];
    const endMin = end[1].split(':')[1];
    noticeDetailInfo.noticePostingEndDate = endDate;
    noticeDetailInfo.noticePostingEndTime = Number(endHour);
    noticeDetailInfo.noticePostingEndMinute = Number(endMin);
  }
};

// 팝업 사용
const selectedNoticePopUpPostingDate = ref<string[]>([]);
//
// const setNoticePopUpStatus = (val: number) => {
//   if (val === 0) {
//     selectedNoticePopUpPostingDate.value = [];
//     noticeDetailInfo.noticePopupPostingStatus = 0;
//     noticeDetailInfo.noticePopupStartDate = '';
//     noticeDetailInfo.noticePopupStartTime = 0;
//     noticeDetailInfo.noticePopupStartMinute = 0;
//     noticeDetailInfo.noticePopupEndDate = '';
//     noticeDetailInfo.noticePopupEndTime = 23;
//     noticeDetailInfo.noticePopupEndMinute = 59;
//   }
// };
// // 게시기간 여부 함수
// const setNoticePopUpPostingStatus = (val: number) => {
//   if (val === 0) {
//     selectedNoticePopUpPostingDate.value = [];
//     noticeDetailInfo.noticePopupStartDate = '';
//     noticeDetailInfo.noticePopupStartTime = 0;
//     noticeDetailInfo.noticePopupStartMinute = 0;
//     noticeDetailInfo.noticePopupEndDate = '';
//     noticeDetailInfo.noticePopupEndTime = 23;
//     noticeDetailInfo.noticePopupEndMinute = 59;
//   }
// };
// // 게시 날짜 및 시간
//
// const setPopUpDate = () => {
//   const val = selectedNoticePopUpPostingDate.value;
//   if (val.length !== 0) {
//     const start = val[0].split(' ');
//     const startDate = start[0];
//     const startHour = start[1].split(':')[0];
//     const startMin = start[1].split(':')[1];
//     noticeDetailInfo.noticePopupStartDate = startDate;
//     noticeDetailInfo.noticePopupStartTime = Number(startHour);
//     noticeDetailInfo.noticePopupStartMinute = Number(startMin);
//     const end = val[1].split(' ');
//     const endDate = end[0];
//     const endHour = end[1].split(':')[0];
//     const endMin = end[1].split(':')[1];
//     noticeDetailInfo.noticePopupEndDate = endDate;
//     noticeDetailInfo.noticePopupEndTime = Number(endHour);
//     noticeDetailInfo.noticePopupEndMinute = Number(endMin);
//   }
// };

// 상세 들고오기
// 에디터
let editor: any = '';
const refEditor: Ref<any> = ref('refEditor');
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
const setEditor = async () => {
  editor = await new Editor({
    el: refEditor.value,
    height: '500px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    plugins: [colorSyntax],
    language: 'ko-KR',
    initialValue: noticeDetailInfo.noticeDesc,
    toolbarItems: [['heading', 'bold', 'strike'], ['hr'], ['image', 'link']],
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        const imgUrl: AxiosResponse = await uploadImage(blob as File);
        callback(imgUrl.data.filePath, imgUrl.data.filePath.fileName);
      },
    },
  });
};

// 이미지 삭제
const deleteImage = async (file: { filePath: string }) => {
  try {
    const res = await requestNoticeFileDelete(file);

    console.log(res, '확인');
  } catch (error) {
    console.log(error, '이미지 삭제 에러');
  }
};

// 파일 첨부
const tempNoticeFileList = reactive<UploadUserFile[]>([]);
// 게시글 수정 시 API 내 fileList => el-upload의 type에 맞는 배열로 재가공 (화면 표시용)
const refineNoticeFileList = () => {
  Object.assign(tempNoticeFileList, []);
  noticeDetailInfo.noticeFileList.forEach((item) => {
    tempNoticeFileList.push({
      name: item.fileName,
      status: 'success',
      size: item.fileSize,
      uid: Math.random() * 1000,
      response: { filePath: item.filePath },
    });
  });
};

const handleUploadedFile: UploadProps['onSuccess'] = (response: any) => {
  const data: noticeFileListType = response;
  noticeDetailInfo.noticeFileList.push(data);
};

const handleFileType: UploadProps['beforeUpload'] = (
  rawFile: UploadRawFile,
) => {
  const fileType = rawFile.type;
  const typeArray = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp',
    'application/pdf',
  ];
  const isAcceptedType = typeArray.includes(fileType);
  if (!isAcceptedType) {
    ElMessageBox.alert('허용되지 않은 타입의 파일입니다.', '실패', {
      confirmButtonText: '확인',
      type: 'error',
    });
    return false;
  }
  return true;
};

const handleRemove: UploadProps['onRemove'] = async (
  uploadFile: UploadFile,
) => {
  if (uploadFile.response) {
    const { filePath }: any = uploadFile.response;
    const data = { filePath };
    const res = (await requestNoticeFileDelete(data)) as AxiosResponse;
    if (res.status === 200) {
      noticeDetailInfo.noticeFileList = noticeDetailInfo.noticeFileList.filter(
        (item) => item.filePath !== filePath,
      );
    }
  }
};

const openUploadedFile: UploadProps['onPreview'] = (uploadFile: UploadFile) => {
  const { filePath }: any = uploadFile.response;
  window.open(filePath, '_blank');
};

const updateNotice = async () => {
  const data: useNoticeDetailInfoType = JSON.parse(
    JSON.stringify(noticeDetailInfo),
  );

  imageList.value.forEach(
    (image: { fileName: string; filePath: string; fileSize: number }) => {
      if (!editor.getHTML().includes(image.filePath)) {
        const file = { filePath: image.filePath };
        try {
          deleteImage(file);
        } catch (error) {
          console.log(error, ' 이미지 삭제 에러');
        }
      }
    },
  );

  if (editor.getHTML()) {
    data.noticeDesc = editor.getHTML();
  }

  if (data.noticeStatus) {
    const postingStartHour = data.noticePostingStartTime;
    const postingStartMinute = data.noticePostingStartMinute;
    const postingEndHour = data.noticePostingEndTime;
    const postingEndMinute = data.noticePostingEndMinute;

    if (data.noticePostingStartDate === data.noticePostingEndDate) {
      if (
        postingStartHour &&
        postingEndHour &&
        postingStartMinute &&
        postingEndMinute
      ) {
        if (
          postingStartHour > postingEndHour ||
          (postingStartHour === postingEndHour &&
            postingStartMinute > postingEndMinute)
        ) {
          ElMessageBox.alert(
            '게시기간의 시작 시간이 종료 시간보다 느립니다.',
            '실패',
            {
              confirmButtonText: '확인',
              type: 'error',
            },
          );
          return;
        }
      }
    }

    if (postingStartHour !== null && Number(postingStartHour) < 10) {
      data.noticePostingStartTime = `0${Number(postingStartHour)}`;
    } else {
      data.noticePostingStartTime = `${Number(postingStartHour)}`;
    }

    if (postingStartMinute !== null && Number(postingStartMinute) < 10) {
      data.noticePostingStartMinute = `0${Number(postingStartMinute)}`;
    } else {
      data.noticePostingStartMinute = `${Number(postingStartMinute)}`;
    }

    if (postingEndHour !== null && Number(postingEndHour) < 10) {
      data.noticePostingEndTime = `0${Number(postingEndHour)}`;
    } else {
      data.noticePostingEndTime = `${Number(postingEndHour)}`;
    }

    if (postingEndMinute !== null && Number(postingEndMinute) < 10) {
      data.noticePostingEndMinute = `0${Number(postingEndMinute)}`;
    } else {
      data.noticePostingEndMinute = `${Number(postingEndMinute)}`;
    }
  } else {
    data.noticePostingStartDate = '';
    data.noticePostingStartTime = 0;
    data.noticePostingStartMinute = 0;
    data.noticePostingEndDate = '';
    data.noticePostingEndTime = 23;
    data.noticePostingEndMinute = 59;
  }

  if (data.noticePopupStatus) {
    const postingPopupStartHour = data.noticePopupStartTime;
    const postingPopupStartMinute = data.noticePopupStartMinute;
    const postingPopupEndHour = data.noticePopupEndTime;
    const postingPopupEndMinute = data.noticePopupEndMinute;

    if (data.noticePopupStartDate === data.noticePopupEndDate) {
      if (
        postingPopupStartHour &&
        postingPopupEndHour &&
        postingPopupStartMinute &&
        postingPopupEndMinute
      ) {
        if (
          postingPopupStartHour > postingPopupEndHour ||
          (postingPopupStartHour === postingPopupEndHour &&
            postingPopupStartMinute > postingPopupEndMinute)
        ) {
          ElMessageBox.alert(
            '팝업게시기간의 시작 시간이 종료 시간보다 느립니다.',
            '실패',
            {
              confirmButtonText: '확인',
              type: 'error',
            },
          );
          return;
        }
      }
    }

    if (postingPopupStartHour !== null && Number(postingPopupStartHour) < 10) {
      data.noticePopupStartTime = `0${Number(postingPopupStartHour)}`;
    } else {
      data.noticePopupStartTime = `${Number(postingPopupStartHour)}`;
    }

    if (
      postingPopupStartMinute !== null &&
      Number(postingPopupStartMinute) < 10
    ) {
      data.noticePopupStartMinute = `0${Number(postingPopupStartMinute)}`;
    } else {
      data.noticePopupStartMinute = `${Number(postingPopupStartMinute)}`;
    }

    if (postingPopupEndHour !== null && Number(postingPopupEndHour) < 10) {
      data.noticePopupEndTime = `0${Number(postingPopupEndHour)}`;
    } else {
      data.noticePopupEndTime = `${Number(postingPopupEndHour)}`;
    }

    if (postingPopupEndMinute !== null && Number(postingPopupEndMinute) < 10) {
      data.noticePopupEndMinute = `0${Number(postingPopupEndMinute)}`;
    } else {
      data.noticePopupEndMinute = `${Number(postingPopupEndMinute)}`;
    }
  } else {
    data.noticePopupStartDate = '';
    data.noticePopupStartTime = 0;
    data.noticePopupStartMinute = 0;
    data.noticePopupEndDate = '';
    data.noticePopupEndTime = 23;
    data.noticePopupEndMinute = 59;
  }

  const res = (await requestNoticeDetailInfoUpdate(data)) as AxiosResponse;
  if (res.status === 200) {
    if (getRouteQuery.value) {
      ElMessage.success('수정되었습니다');
    } else {
      ElMessage.success('등록되었습니다');
    }
    pushPage(noticeBoard);
  } else {
    ElMessage.success('서버 에러 - 수정에 실패했습니다.');
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await formEl.validate((valid, fields) => {
    if (valid) {
      updateNotice();
    }
  });
};

const refineTimeTable = () => {
  const postingStartTime = `${noticeDetailInfo.noticePostingStartDate} ${noticeDetailInfo.noticePostingStartTime}:${noticeDetailInfo.noticePostingStartMinute}`;
  const postingEndTime = `${noticeDetailInfo.noticePostingEndDate} ${noticeDetailInfo.noticePostingEndTime}:${noticeDetailInfo.noticePostingEndMinute}`;
  const popupStartTime = `${noticeDetailInfo.noticePopupStartDate} ${noticeDetailInfo.noticePopupStartTime}:${noticeDetailInfo.noticePopupStartMinute}`;
  const popupEndTime = `${noticeDetailInfo.noticePopupEndDate} ${noticeDetailInfo.noticePopupEndTime}:${noticeDetailInfo.noticePopupEndMinute}`;

  selectedNoticePostingDate.value = [postingStartTime, postingEndTime];

  selectedNoticePopUpPostingDate.value = [popupStartTime, popupEndTime];
};

// 초기 데이터 셋팅
const getNoticeDetailInfoData = async () => {
  try {
    const query = `${getRouteQuery.value}?noticeCaller=ADMIN`;
    const res = (await requestNoticeDetailInfo(query)) as AxiosResponse;

    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.status === 401) {
      failAuthenticationAlert();
    }
    if (res.status === 200) {
      await Object.assign(noticeDetailInfo, res.data.noticeAdminDetailVo);
      refineNoticeFileList();
      refineTimeTable();
      await setEditor();
    }
  } catch (error) {
    console.log(error);
  }
};

const getStoreListNoticePhrase = () => {
  if (noticeDetailInfo.noticeStoreList.length === 0) {
    return '전체 매장에 공지가 게시됩니다.';
  }
  const storeListLength = noticeDetailInfo.noticeStoreList.length;
  return `선택된 ${storeListLength}개 매장에 공지가 게시됩니다.`;
};

if (getRouteQuery.value) {
  getNoticeDetailInfoData();
} else {
  onMounted(() => {
    setEditor();
  });
}

// 매장 추가 관련 로직
const loading = ref(true);
const totalStoreList = reactive<storeListType>({} as storeListType);
const refinedStoreList = reactive<optionType[]>([]);
const refinedSelectedStoreList = ref<string[]>([]);
const currentStoreList = ref<searchStoreListType[]>([]);

const refineTotalStoreListData = () => {
  const transferData: optionType[] = [];
  if (totalStoreList.searchStoreList.length !== 0) {
    totalStoreList.searchStoreList.forEach((data, i) => {
      transferData[i] = {
        key: data.storeCode,
        label: data.storeName,
        disabled: false,
      };
    });
  }
  Object.assign(refinedStoreList, transferData);
  if (noticeDetailInfo.noticeStoreList.length !== 0) {
    const selectedStoreKey = noticeDetailInfo.noticeStoreList.map(
      (item) => item.storeCode,
    );
    refinedSelectedStoreList.value = selectedStoreKey;
  }
  loading.value = false;
};

const updateCurrentNoticeStoreList = (storeKey: string[]) => {
  refinedSelectedStoreList.value = JSON.parse(JSON.stringify(storeKey));
  currentStoreList.value = [];
  storeKey.forEach((refinedKey) => {
    refinedStoreList.forEach((item) => {
      if (item.key === refinedKey) {
        currentStoreList.value.push({
          storeCode: item.key,
          storeName: item.label,
        });
      }
    });
  });
  noticeDetailInfo.noticeStoreList = currentStoreList.value;
};

const getStoreList = async () => {
  try {
    const data: getStoreListParamType = {
      searchQuery: '',
      searchType: 'STORE_NAME',
      noticeId: getRouteQuery.value ? (getRouteQuery.value as string) : '',
    };
    const query = `searchQuery=${data.searchQuery}&searchType=${data.searchType}&noticeId=${data.noticeId}`;

    const res = (await requestStoreList(query)) as AxiosResponse;
    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.status === 401) {
      failAuthenticationAlert();
    }
    if (res.status === 200) {
      Object.assign(totalStoreList, res.data);
      refineTotalStoreListData();
    }
  } catch (error) {
    console.log(error);
  }
};

// auth check
const authClass = ref(cookieUtils.getCookie(USER_AUTHORITY));
const checkAuth = () => {
  if (Number(authClass.value) < 9) {
    ElMessage({
      type: 'error',
      message: '권한이 없습니다.',
    });

    router.replace({ name: SINGLE_STORE_SETTING });
  }
};

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <EditNoticeStoreListModal
    v-if="flag.editNoticeStoreList"
    :requestAllProduct="getStoreList"
    :refineTotalStoreListData="refineTotalStoreListData"
    :refinedStoreList="refinedStoreList"
    :loading="loading"
    :updateCurrentNoticeStoreList="updateCurrentNoticeStoreList"
    :refinedSelectedStoreList="refinedSelectedStoreList"
  />
  <BreadcrumbHeader :propsHeader="noticeBoardHeader" />
  <el-card class="notice-detail-container">
    <template #header>
      <div class="card-header">
        <span>{{ getTitle() }}</span>
        <div>
          <el-button
            plain
            type="warning"
            @click="pushPage(noticeBoard)"
          >
            취소
          </el-button>
          <el-button
            :type="getBtnType()"
            @click="submitForm(ruleFormRef)"
          >
            {{ getBtnLabel() }}
          </el-button>
        </div>
      </div>
    </template>
    <el-form
      ref="ruleFormRef"
      :model="noticeDetailInfo"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="작성자">
        <el-input
          v-model="noticeDetailInfo.author"
          disabled
          input-style="width: 167px"
          class="mr-40"
        />
        <el-form-item label="작성일">
          <el-tag
            size="large"
            type="info"
          >
            {{ getNoticeCreateDate }}
          </el-tag>
        </el-form-item>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>구분</span>
          <el-tooltip
            effect="dark"
            placement="top"
          >
            <template #content>
              메인 공지 설정
              <br />
              메인 공지 설정 시 공지목록 최상단에 고정되어 노출됩니다.
              <br />
              <br />
              긴급 공지 설정
              <br />
              긴급 공지 설정 시 마스터가 어떤 페이지에 있어도 등록 최초 1회 강제
              팝업으로 노출됩니다. 이후 게시기간과 팝업사용/기간은 관리자가
              설정한 조건에 따라 노출됩니다.
            </template>
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-select
          v-model="noticeDetailInfo.noticeCategory"
          class="mr-20"
        >
          <el-option
            v-for="item in division"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
        <el-checkbox
          v-model="isTopFix"
          @change="changeTopFix"
        >
          메인 공지 설정(상단고정)
        </el-checkbox>
        <el-checkbox
          v-model="isUrgent"
          @change="changeUrgent"
        >
          긴급공지(강제팝업)
        </el-checkbox>
      </el-form-item>
      <el-form-item label="게시 매장">
        <div class="store-list-container">
          <div>
            <el-button
              type="primary"
              @click="openModal(EDIT_NOTICE_STORE_LIST)"
            >
              매장추가
            </el-button>
            <span class="ml-10">
              {{ getStoreListNoticePhrase() }}
            </span>
          </div>
          <div
            v-if="noticeDetailInfo.noticeStoreList.length !== 0"
            class="store-list"
          >
            <el-scrollbar height="60px">
              <el-tag
                v-for="store in noticeDetailInfo.noticeStoreList"
                :key="store.storeCode"
                class="mr-10"
              >
                {{ store.storeName }}
              </el-tag>
            </el-scrollbar>
          </div>
        </div>
      </el-form-item>
      <el-form-item
        label="제목"
        prop="noticeTitle"
      >
        <el-input v-model="noticeDetailInfo.noticeTitle" />
      </el-form-item>
      <el-form-item label="공지내용">
        <div
          ref="refEditor"
          style="width: 100%"
        ></div>
      </el-form-item>
      <el-form-item prop="noticeStatus">
        <template #label>
          <span>게시여부</span>
          <el-tooltip
            effect="dark"
            placement="top"
          >
            <template #content>
              게시중
              <br />
              등록 시 공지가 바로 게시됩니다.
              <br />
              게시 중지 상태의 게시글을 게시 중으로 수정할 수 있습니다.
              <br />
              <br />
              게시중지
              <br />
              게시 중인 공지를 게시중지할 수 있습니다.
            </template>
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-radio-group
          v-model="noticeDetailInfo.noticeStatus"
          @change="setNoticeStatus"
        >
          <el-radio-button :label="1"> 게시 </el-radio-button>
          <el-radio-button :label="0"> 게시 중지 </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form
        v-if="noticeDetailInfo.noticeStatus === 1"
        inline
        label-width="100px"
        label-position="left"
      >
        <el-form-item>
          <template #label>
            <span>게시기간</span>
            <el-tooltip
              effect="dark"
              placement="top"
            >
              <template #content>
                게시기간 설정함
                <br />
                지정된 기간에만 게시글 노출을 원할 시 기간을 입력하고 설정할 수
                있습니다.
                <br />
                시간은 00시 00분 부터 23시 59분 사이 값을 입력가능하며 게시시작
                시간에 게시되어 게시종료시간에 자동으로 게시 중단상태로
                변경됩니다.
                <br />
                <br />
                게시기간 설정안함
                <br />
                게시글이 무기한 게시됩니다.
              </template>
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio-group
            v-model="noticeDetailInfo.noticePostingStatus"
            @change="setNoticePostingStatus"
          >
            <el-radio-button :label="1"> 설정함 </el-radio-button>
            <el-radio-button :label="0"> 설정 안 함 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="noticeDetailInfo.noticePostingStatus === 1">
          <el-date-picker
            v-model="selectedNoticePostingDate"
            type="datetimerange"
            unlink-panels
            range-separator="~"
            start-placeholder="시작일"
            end-placeholder="종료일"
            format="YYYY/MM/DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            :clearable="false"
            :shortcuts="shortcuts"
            @blur="setDate"
          />
        </el-form-item>
      </el-form>
      <!--      <el-form-item>-->
      <!--        <template #label>-->
      <!--          <span>팝업사용</span>-->
      <!--          <el-tooltip-->
      <!--            effect="dark"-->
      <!--            placement="top"-->
      <!--          >-->
      <!--            <template #content>-->
      <!--              팝업사용 설정함-->
      <!--              <br>-->
      <!--              마스터 실행 시 자동으로 팝업을 노출할 수 있습니다.-->
      <!--              <br>-->
      <!--              주요 공지일 경우 사용하며 다수의 팝업이 설정되어있을 시 등록일 최신순 공지가 우선적으로 최대 5개가 노출됩니다.-->
      <!--              <br>-->
      <!--              <br>-->
      <!--              팝업사용 설정안함-->
      <!--              <br>-->
      <!--              팝업으로 노출되지 않으며 팝업으로 설정한 게시글을 팝업해제할 수 있습니다.-->
      <!--            </template>-->
      <!--            <el-icon><QuestionFilled/></el-icon>-->
      <!--          </el-tooltip>-->
      <!--        </template>-->
      <!--        <el-radio-group-->
      <!--          v-model="noticeDetailInfo.noticePopupStatus"-->
      <!--          @change="setNoticePopUpStatus"-->
      <!--        >-->
      <!--          <el-radio-button :label="1">-->
      <!--            설정함-->
      <!--          </el-radio-button>-->
      <!--          <el-radio-button :label="0">-->
      <!--            설정 안 함-->
      <!--          </el-radio-button>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <!--      <el-form-->
      <!--        v-if="noticeDetailInfo.noticePopupStatus === 1"-->
      <!--        inline-->
      <!--        label-width="100px"-->
      <!--        label-position="left"-->
      <!--      >-->
      <!--        <el-form-item>-->
      <!--          <template #label>-->
      <!--            <span>팝업게시기간</span>-->
      <!--            <el-tooltip-->
      <!--              effect="dark"-->
      <!--              placement="top"-->
      <!--            >-->
      <!--              <template #content>-->
      <!--                팝업 게시기간 설정함-->
      <!--                <br>-->
      <!--                팝업으로 노출되지 않으며 팝업으로 설정한 게시글을 팝업해제할 수 있습니다.-->
      <!--                <br>-->
      <!--                마스터 실행 시 노출할 팝업의 게시기간을 설정할 수 있습니다.-->
      <!--                <br>-->
      <!--                시간은 00시 00분 부터 23시 59분 사이 값을 입력가능하며 팝업 게시 종료일시에 게시글이 지동으로 팝업 설정안함 상태로 변경됩니다.-->
      <!--                <br>-->
      <!--                <br>-->
      <!--                팝업 게시기간 설정안함-->
      <!--                <br>-->
      <!--                무기한 팝업으로 노출되며 5개 초과 설정 시 오래된 순으로 자동 팝업해제됩니다.-->
      <!--              </template>-->
      <!--              <el-icon><QuestionFilled/></el-icon>-->
      <!--            </el-tooltip>-->
      <!--          </template>-->
      <!--          <el-radio-group-->
      <!--            v-model="noticeDetailInfo.noticePopupPostingStatus"-->
      <!--            @change="setNoticePopUpPostingStatus"-->
      <!--          >-->
      <!--            <el-radio-button :label="1">-->
      <!--              설정함-->
      <!--            </el-radio-button>-->
      <!--            <el-radio-button :label="0">-->
      <!--              설정 안 함-->
      <!--            </el-radio-button>-->
      <!--          </el-radio-group>-->
      <!--        </el-form-item>-->
      <!--        <el-form-item v-if="noticeDetailInfo.noticePopupPostingStatus === 1">-->
      <!--          <el-date-picker-->
      <!--            v-model="selectedNoticePopUpPostingDate"-->
      <!--            type="datetimerange"-->
      <!--            unlink-panels-->
      <!--            range-separator="~"-->
      <!--            start-placeholder="시작일"-->
      <!--            end-placeholder="종료일"-->
      <!--            format="YYYY/MM/DD HH:mm"-->
      <!--            value-format="YYYY-MM-DD HH:mm"-->
      <!--            :clearable="false"-->
      <!--            :shortcuts="shortcuts"-->
      <!--            @blur="setPopUpDate"-->
      <!--          />-->
      <!--        </el-form-item>-->
      <!--      </el-form>-->
      <el-form-item label="첨부파일">
        <el-tooltip
          effect="dark"
          placement="top"
        >
          <template #content>
            - 파일확장자는 JPEG, PNG, BMP, JPG, PDF 형식만 등록 됩니다.
            <br />
            - 파일 용량은 10MB 까지 등록 가능합니다.
          </template>
          <el-upload
            v-model:file-list="tempNoticeFileList"
            :action="`${GATE_WAY_API_URL}${endpoints.notice.noticeFile}`"
            :before-upload="handleFileType"
            :on-remove="handleRemove"
            :on-success="handleUploadedFile"
            :on-preview="openUploadedFile"
          >
            <el-button type="primary"> 파일 첨부 </el-button>
          </el-upload>
        </el-tooltip>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.notice-detail-container {
  &:deep(.el-card__header) {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
