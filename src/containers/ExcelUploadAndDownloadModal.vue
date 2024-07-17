<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { h, reactive, ref } from 'vue';
import { ElMessageBox, UploadFile } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication } from '@utils';
import useModalStore from '@store/storeModal';
import { Download, Upload } from '@element-plus/icons-vue';
import useExcelDownload from '@composables/excelDownload';
import { EXCEL_UPLOAD_AND_DOWNLOAD } from '@common/string';
import endpoints from '@apis/endpoints';
import { excel } from '@apis';

const { failAuthenticationAlert } = authentication;

const {
  requestGoodsListExcelUpload,
  requestCategoryListExcelUpload,
  requestDescriptionListExcelUpload,
  requestOrderTwoOptionGroupListExcelUpload,
  requestOrderTwoOptionMenuListExcelUpload,
  requestOptionGroupExcelUpload,
  requestOptionMenuExcelUpload,
} = excel;
const { downloadExcelPostWithToken } = useExcelDownload();
const { flag, modalData, closeModal } = useModalStore();
const route = useRoute();

const props = defineProps<{
  requestProductList: () => Promise<void>;
  requestCategoryList: () => Promise<void>;
  requestOrderTwoOptionGroupList: () => Promise<void>;
  requestOrderTwoOptionMenuLists: () => Promise<void>;
  requestOptionGroupLists: () => Promise<void>;
  refreshOptionMenuLanguageData: () => void;
  reselectNowDescription: () => Promise<void>;
  activeTab: string;
}>();

const queryData = reactive(route.query);
const loading = ref(false);
const optionGroupAndMenuFlag = modalData.excelUploadAndDownload;

/** 상품리스트 엑셀 업로드 */
const postGoodsListExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestGoodsListExcelUpload(data)) as AxiosResponse;

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
        await props.requestProductList();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 상품 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 분류 리스트 엑셀 업로드 */
const postCategoryListExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };

      loading.value = true;
      const res = (await requestCategoryListExcelUpload(data)) as AxiosResponse;

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
        await props.requestCategoryList();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 분류 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 상세 설명 리스트 엑셀 업로드 */
const postDescriptionListExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestDescriptionListExcelUpload(
        data,
      )) as AxiosResponse;

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
        await props.reselectNowDescription();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 상세 설명 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 티오더2 옵션 그룹 리스트 엑셀 업로드 */
const postOrderTwoOptionGroupListExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestOrderTwoOptionGroupListExcelUpload(
        data,
      )) as AxiosResponse;

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
        await props.requestOrderTwoOptionGroupList();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 옵션 그룹 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 티오더2 옵션 상품 리스트 엑셀 업로드 */
const postOrderTwoOptionMenuListExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestOrderTwoOptionMenuListExcelUpload(
        data,
      )) as AxiosResponse;

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
        await props.requestOrderTwoOptionMenuLists();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 옵션 상품 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 옵션그룹 리스트 엑셀 업로드 */
const postOptionGroupExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestOptionGroupExcelUpload(data)) as AxiosResponse;

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
        await props.requestOptionGroupLists();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 세트 상품 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 옵션 상품 엑셀 업로드 */
const postOptionMenuExcelUpload = async (response: UploadFile) => {
  try {
    if (response.raw) {
      const data = {
        storeCode: queryData.code as string,
        langTransFile: response.raw,
      };
      loading.value = true;
      const res = (await requestOptionMenuExcelUpload(data)) as AxiosResponse;

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
        await props.requestOptionGroupLists();
        props.refreshOptionMenuLanguageData();

        const uploadInfo = {
          total: Object.entries(res.data.update_result).length,
          successCount: 0,
          noChange: 0,
          failCount: 0,
          failList: [] as unknown as [string, unknown],
        };

        const uploadList = Object.entries(res.data.update_result);
        uploadList.forEach((item: [string, unknown]) => {
          if (item[1] === '성공') {
            uploadInfo.successCount += 1;
          } else if (item[1] === '변경사항 없음') {
            uploadInfo.noChange += 1;
          } else {
            uploadInfo.failCount += 1;
            uploadInfo.failList.push(item[0]);
          }
        });

        const failGoodsName = () =>
          uploadInfo.failList.map((item) =>
            h('p', { style: 'color: #6b6b6b' }, `${item}`),
          );

        ElMessageBox({
          title: '업로드 결과',
          message: h('p', null, [
            h('p', null, `총 ${uploadInfo.total}개 번역 진행 완료`),
            h(
              'p',
              { style: 'color: #409EFF' },
              `성공 : ${uploadInfo.successCount}`,
            ),
            h(
              'p',
              { style: 'color: #000' },
              `변경사항 없음 : ${uploadInfo.noChange}`,
            ),
            h(
              'p',
              { style: 'color: #F56C6C' },
              `실패 : ${uploadInfo.failCount}`,
            ),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'margin-top: 20px' }, '실패 세트 상품 정보')
                : null,
            ]),
            h('div', [
              uploadInfo.failList.length > 0
                ? h('div', { style: 'height: 300px; overflow-y: scroll' }, [
                    failGoodsName(),
                  ])
                : null,
            ]),
          ]),
        }).then(async () => {
          closeModal(EXCEL_UPLOAD_AND_DOWNLOAD);
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const convertStoreCodeName = (storeName: string) =>
  storeName.replaceAll('.', '_');
const excelCategorySettingTitle = (state: string, title: string) => {
  const convertTitle = convertStoreCodeName(title);
  const categorySetting = () => {
    if (state === 'Y') return '분류_설정';
    if (state === 'N') return '분류_미설정';
    return '분류_전체';
  };

  return state !== undefined
    ? `${convertTitle}_${categorySetting()}`
    : convertTitle;
};
const excelCategoryExposureTitle = (state: string, title: string) => {
  const convertTitle = convertStoreCodeName(title);
  const categorySetting = () => {
    if (state === 'Y') return '분류_노출';
    if (state === 'N') return '분류_미노출';
    return '분류_전체';
  };

  return state !== undefined
    ? `${convertTitle}_${categorySetting()}`
    : convertTitle;
};
const excelDescriptionDetailOpenTitle = (state: string, title: string) => {
  const convertTitle = convertStoreCodeName(title);
  const categorySetting = () => {
    if (state === 'Y') return '상세여부_사용';
    if (state === 'N') return '상세여부_미사용';
    return '상세여부_전체';
  };

  return state !== undefined
    ? `${convertTitle}_${categorySetting()}`
    : convertTitle;
};

const isProductTab = () => props.activeTab === 'product';
const isCategoryTab = () => props.activeTab === 'category';
const isDescriptionTab = () => props.activeTab === 'description';
const isOrderTwoOptionGroupTab = () =>
  props.activeTab === 'orderTwoOptionGroup';
const isOrderTwoOptionMenuTab = () => props.activeTab === 'orderTwoOptionMenu';
const isOptionGroup = () => props.activeTab === 'optionGroup';

const getTitleName = () => {
  if (props.activeTab === 'product') return '[상품 리스트]';
  if (props.activeTab === 'category') return '[분류 리스트]';
  if (props.activeTab === 'description') return '[상세 설명 리스트]';
  if (props.activeTab === 'orderTwoOptionGroup') return '[옵션 그룹 리스트]';
  if (props.activeTab === 'orderTwoOptionMenu') return '[옵션 상품 리스트]';
  if (
    props.activeTab === 'optionGroup' &&
    optionGroupAndMenuFlag === 'optionGroup'
  ) {
    return '[옵션 그룹 리스트]';
  }
  if (
    props.activeTab === 'optionGroup' &&
    optionGroupAndMenuFlag === 'optionMenu'
  ) {
    return '[옵션 상품 리스트]';
  }
  return '';
};
</script>

<template>
  <el-dialog
    v-model="flag.excelUploadAndDownload"
    width="40%"
  >
    <template #header>
      <p>{{ getTitleName() }} 엑셀 업로드/다운로드</p>
      <el-tag
        class="mt-10"
        type="info"
      >
        번역 데이터를 직접 엑셀로 업로드 하는 기능입니다.
      </el-tag>
    </template>
    <div class="guide-text-container">
      <p class="title-text">엑셀 일괄 번역 방법</p>
      <p class="body-text">1. 엑셀 기본 양식 파일을 다운로드 합니다.</p>
      <p class="body-text">2. 기본 양식 파일에 번역 내용을 입력합니다.</p>
      <p class="body-text">3. 번역 내용이 저장된 파일을 업로드 합니다.</p>
      <p class="body-text">
        4. 업로드 후 제대로 적용되었는지 어드민에서 조회/확인합니다.
      </p>
    </div>
    <el-row v-if="isProductTab()">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            excelCategorySettingTitle(
              modalData.excelUploadAndDownload.inUse,
              `${queryData.name}_${queryData.code}_상품 리스트 번역 테이블`,
            ),
            endpoints.excel.download_lang_trans,
            modalData.excelUploadAndDownload,
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) => postGoodsListExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isCategoryTab()">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            excelCategoryExposureTitle(
              modalData.excelUploadAndDownload.inUse,
              `${queryData.name}_${queryData.code}_분류 리스트 번역 테이블`,
            ),
            endpoints.excel.category_lang_trans_list_download,
            modalData.excelUploadAndDownload,
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) => postCategoryListExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isDescriptionTab()">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            excelDescriptionDetailOpenTitle(
              modalData.excelUploadAndDownload.useDetailOpen,
              `${queryData.name}_${queryData.code}_상세 설명 리스트 번역 테이블`,
            ),
            endpoints.excel.goods_html_lang_trans_list_download,
            modalData.excelUploadAndDownload,
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) => postDescriptionListExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isOrderTwoOptionGroupTab()">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            convertStoreCodeName(
              `${queryData.name}_${queryData.code}_옵션 그룹 리스트 번역 테이블`,
            ),
            endpoints.excel.option_group_lang_trans_list_download,
            modalData.excelUploadAndDownload,
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) =>
            postOrderTwoOptionGroupListExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isOrderTwoOptionMenuTab()">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            convertStoreCodeName(
              `${queryData.name}_${queryData.code}_옵션 상품 리스트 번역 테이블`,
            ),
            endpoints.excel.option_item_lang_trans_list_download,
            modalData.excelUploadAndDownload,
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) =>
            postOrderTwoOptionMenuListExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isOptionGroup() && optionGroupAndMenuFlag === 'optionGroup'">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            convertStoreCodeName(
              `${queryData.name}_${queryData.code}_옵션 그룹 리스트 번역 테이블`,
            ),
            endpoints.excel.goods_option_group_lang_trans_list_download,
            { storeCode: queryData.code },
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) => postOptionGroupExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
    <el-row v-if="isOptionGroup() && optionGroupAndMenuFlag === 'optionMenu'">
      <el-button
        class="mr-5"
        @click="
          downloadExcelPostWithToken(
            convertStoreCodeName(
              `${queryData.name}_${queryData.code}_옵션 상품 리스트 번역 테이블`,
            ),
            endpoints.excel.goods_option_item_lang_trans_list_download,
            { storeCode: queryData.code },
          )
        "
      >
        <el-icon class="mr-5">
          <Download />
        </el-icon>
        엑셀 기본 양식 다운로드
      </el-button>
      <el-upload
        :auto-upload="false"
        :on-change="
          (response: UploadFile) => postOptionMenuExcelUpload(response)
        "
        :show-file-list="false"
      >
        <el-button v-loading.fullscreen.lock="loading">
          <el-icon class="mr-5">
            <Upload />
          </el-icon>
          엑셀 번역 파일 업로드
        </el-button>
      </el-upload>
    </el-row>
  </el-dialog>
</template>

<style lang="scss">
.guide-text-container {
  box-sizing: border-box;
  width: 100%;
  padding: 15px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 20px;
  background-color: #f1f1ff;
  border-radius: 5px;

  .title-text {
    color: #707070;
  }

  .body-text {
    color: #949494;
  }

  .active-text {
    color: red;
  }
}
</style>
