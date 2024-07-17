import { ElMessageBox } from 'element-plus';
import {
  arrangeProductType,
  categoryInGoodsListType,
  requestChangeProductImageType,
  requestFullGoodsListParamType,
  requestGoodsSearchListType,
  requestGoodsUpdateInCategorizeType,
  requestLanguageListType,
  requestProductDetailInfoType,
  requestProductImageListType,
  requestTranslateProductDetailPlatformType,
  requestTranslateProductDetailType,
  requestUpdateTranslateProductType,
  updateAllProductType,
  updateProductType,
} from '@interface/goods';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 분류안에 상품 넣기 - 상품 수정
export const requestUpdateProduct = (data: updateProductType) => {
  const url = endpoints.goods.update;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류에 상품넣기 페이지 상품 불러오기
export const requestProductList = (data: categoryInGoodsListType) => {
  const url = endpoints.goods.list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류안에 상품 넣기 - 상품 일괄 수정
export const requestUpdateAllProduct = (data: updateAllProductType) => {
  const url = endpoints.goods.set_update;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 중분류 상품 순서 변경하기
export const requestArrangeProduct = (data: arrangeProductType) => {
  const url = endpoints.goods.goods_sort_by;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 분류안에 상품 넣기 상품 이미지 변경하기
export const requestChangeProductImage = (
  data: requestChangeProductImageType,
) => {
  const url = endpoints.goods.update_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('goodCode', data.goodCode);
  fd.append('posGoodCode', data.posGoodCode);
  fd.append('goodImage', data.goodImage);

  return adminTokenApi
    .post(url, fd, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 변역 페이지 상품 리스트 불러오기
export const requestLanguageProductList = (data: requestLanguageListType) => {
  const url = endpoints.goods.lang_goods_list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 변역 페이지 분류 리스트 불러오기
export const requestLanguageCategoryList = (data: requestLanguageListType) => {
  const url = endpoints.goods.lang_category_list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 번역 페이지 상품 전체 번역하기
export const requestTranslateAllProduct = (storeCode: string) => {
  const data = { storeCode };
  const url = endpoints.goods.all_lang_trans;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 번역 페이지 단일 전체 번역하기
export const requestTranslateTargetProduct = (targetGoods: string) => {
  const data = { targetGoods };
  const url = endpoints.goods.lang_trans;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 번역 페이지 번역 내용 업데이트
export const requestUpdateTranslateProduct = (
  data: requestUpdateTranslateProductType,
) => {
  const url = endpoints.goods.update_lang_trans;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 상품 상세 정보, 옵션 정보 불러오기
export const requestProductDetailInfo = (
  data: requestProductDetailInfoType,
) => {
  const url = `${endpoints.goods.info}?posGoodCode=${encodeURIComponent(data.posGoodCode)}&storeCode=${encodeURIComponent(data.storeCode)}`;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 상품 코드 데이터 (커스텀 상품코드)
export const requestCustomProductCode = () => {
  const url = endpoints.goods.custom_category;

  return adminTokenApi
    .get(url, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 상품 이미지 일괄 수정하기 페이지 상품 리스트 데이터
export const requestProductImageList = (data: requestProductImageListType) => {
  const url = endpoints.goods.full_good_list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 언어 번역 상품 상세설명 수동 번역
export const requestTranslateProductDetail = (
  data: requestTranslateProductDetailType,
) => {
  const url = endpoints.goods.update_goods_html_trans;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestTranslateProductDetailInPlatform = (
  data: requestTranslateProductDetailPlatformType,
) => {
  const url = endpoints.goods.update_goods_html_trans;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 상품 내 분류 설정 페이지 상품 리스트 호출
export const requestFullGoodsList = (data: requestFullGoodsListParamType) => {
  const url = endpoints.goods.full_goods_category_list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 상품 속성 일괄 수정
export const requestUpdateMultipleGoodsSetting = (
  data: requestGoodsUpdateInCategorizeType,
) => {
  const url = endpoints.goods.update_all_checked_goods_setting;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// v2 상품 검색 (in 분류 설정)
export const requestGoodsSearchList = (data: requestGoodsSearchListType) => {
  const url = endpoints.goods.search_list;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// v2 상품 업데이트 (in 분류 설정)
export const requestMultipleGoodsUpdateInCategorize = (
  data: requestGoodsUpdateInCategorizeType,
) => {
  const url = endpoints.goods.update_checked_goods_type;

  return adminTokenApi
    .post(url, data, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export default {
  requestUpdateProduct,
  requestProductList,
  requestUpdateAllProduct,
  requestArrangeProduct,
  requestChangeProductImage,
  requestLanguageProductList,
  requestLanguageCategoryList,
  requestTranslateAllProduct,
  requestTranslateTargetProduct,
  requestUpdateTranslateProduct,
  requestProductDetailInfo,
  requestCustomProductCode,
  requestProductImageList,
  requestTranslateProductDetail,
  requestFullGoodsList,
  requestUpdateMultipleGoodsSetting,
  requestGoodsSearchList,
  requestMultipleGoodsUpdateInCategorize,
  requestTranslateProductDetailInPlatform,
};
