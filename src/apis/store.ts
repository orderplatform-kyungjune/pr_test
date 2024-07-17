import { ElMessageBox } from 'element-plus';
import { setAxiosApi } from '@utils/apiUtil';
import {
  addNewStorePlatformType,
  addNewStoreType,
  customStyleDataPlatformType,
  customStyleDataType,
  fullStoreUpdateParamType,
  requestAllStoreListParameterType,
  requestBasedUrlStoreListParameterType,
  requestLogoImgParameterPlatformType,
  requestLogoImgParameterType,
  requestMatchedStoreListType,
  requestMatchedThemeListType,
  requestSearchStoreNameType,
  requestStoreInfoDataStoreType,
  requestStoreListParameterType,
  requestThemeListParameterType,
  requestUpdateCategoryBackgroundImagePlatformType,
  requestUpdateCategoryBackgroundImageType,
  requestUpdatedThemeType,
  requestUpdateRestroomImagePlatformType,
  requestUpdateRestroomImageType,
  requestUpdateStoreBackgroundImagePlatformType,
  requestUpdateStoreBackgroundImageType,
  requestUpdateStoreTabletVersionPlatformType,
  requestUpdateStoreTabletVersionType,
  requestUpdateTableLogoImageType,
  requestUrlVersionListType,
} from '@interface/store';
import endpoints from '@apis/endpoints';
import adminTokenApi from '@apis/axios/adminTokenApi';

// 티오더 매장 리스트
export const requestTorderTotalStoreList = (
  data: requestStoreListParameterType,
) => {
  const url = endpoints.store.list;

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

// 매장 상세정보
export const requestStoreInfo = (storeCode: string) => {
  const url = `${endpoints.store.info}?storeCode=${encodeURIComponent(storeCode)}`;

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

// 매장 상세정보 수정
export const requestStoreUpdate = (data: requestStoreInfoDataStoreType) => {
  const url = endpoints.store.update;
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

// 매장설정 - 태블릿 버전 정보 업데이트
export const requestStoreTabletVersionUpdate = (
  data: requestUpdateStoreTabletVersionType,
) =>
  setAxiosApi<{ result: boolean; code: number }>({
    instance: adminTokenApi,
    config: {
      method: 'POST',
      url: endpoints.store.update_tablet_version,
      data,
    },
  });

export const requestStoreTabletVersionUpdateInPlatform = (
  data: requestUpdateStoreTabletVersionPlatformType,
) => {
  const url = endpoints.store.update_tablet_version;
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

// 매장 추가
export const requestNewStoreCreate = (params: addNewStoreType) => {
  const url = endpoints.store.create_new;
  return adminTokenApi.post(url, params, {}).catch((error) => {
    if (error.response.status === 400 || error.response.status === 500) {
      ElMessageBox.alert(error.response.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

export const requestNewStoreCreateInPlatform = (
  params: addNewStorePlatformType,
) => {
  const url = endpoints.store.create_new;
  return adminTokenApi.post(url, params, {}).catch((error) => {
    if (error.response.status === 400 || error.response.status === 500) {
      ElMessageBox.alert(error.response.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
  });
};

// 테마별 조회용 전체 테마 리스트 불러오기
export const requestStoreThemeList = (api: { api: string }) => {
  const url = endpoints.store.tablet_theme;
  return adminTokenApi
    .post(url, api, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 로고 이미지 저장
export const requestLogoImageUpdate = (data: requestLogoImgParameterType) => {
  const url = endpoints.store.update_logo_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_logo_img', data.T_order_logo_img);

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

export const requestLogoImageUpdateInPlatform = (
  data: requestLogoImgParameterPlatformType,
) => {
  const url = endpoints.store.update_logo_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('platform_logo_img', data.platform_logo_img);

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

// 언어 선택 리스트 불러오기
export const requestDefaultLanguage = () => {
  const url = endpoints.store.default_language_setting;
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

// 기본 화페 리스트 불러오기
export const requestDefaultCurrency = () => {
  const url = endpoints.store.default_currency_setting;
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

// 옵션 레이아웃 리스트 불러오기
export const requestDefaultLayout = () => {
  const url = endpoints.store.option_layout;
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

// 전체 URL 리스트 불러오기
export const requestAllUrlList = () => {
  const url = endpoints.store.all_tablet_url_list;
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

// Web, master url 리스트 불러오기
export const requestStoreUrlList = (
  params: requestAllStoreListParameterType,
) => {
  const url = endpoints.store.full_store_list;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// Web, Master info 업데이트
export const updateFullStoreInfo = (params: fullStoreUpdateParamType) => {
  const url = endpoints.tablet.update_stores_tablet_version;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 유알엘 기준 WEB, MASTER URL 매장 리스트 불러오기
export const requestUrlBasedStoreList = (
  params: requestBasedUrlStoreListParameterType,
) => {
  const url = endpoints.tablet.get_tablet_version_info;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 유알엘 기준 유저가 선택한 유알엘과 일치하는 매장 리스트 불러오기
export const requestMatchedStoreUrlList = (
  params: requestMatchedStoreListType,
) => {
  const url = endpoints.store.store_url_match_list;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 테마 종류 리스트 불러오기
export const requestThemeList = (params: requestThemeListParameterType) => {
  const url = endpoints.store.get_theme_list;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 유저가 선택한 테마 종류와 일치하는 매장 정보 불러오기
export const requestMatchedThemeList = (
  params: requestMatchedThemeListType,
) => {
  const url = endpoints.store.store_theme_match_list;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 유저가 선택한 테마 종류와 일치하는 매장 정보 불러오기
export const updateThemeList = (params: requestUpdatedThemeType) => {
  const url = endpoints.store.update_stores_theme;

  return adminTokenApi
    .post(url, params, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 태블릿 브랜드 리스트 데이터
export const requestTabletBrandListData = () => {
  const url = endpoints.store.tablet_brand_list;
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

// 태블릿 브랜드 리스트 데이터
export const requestStoreStateListData = () => {
  const url = endpoints.store.store_state_list;
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

// 태블릿 브랜드 리스트 데이터
export const requestStoreAdBannerListData = () => {
  const url = endpoints.store.ad_banner_list;
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

// 태블릿 배경이미지 수정
export const requestUpdateStoreBackgroundImage = (
  data: requestUpdateStoreBackgroundImageType,
) => {
  const url = endpoints.store.update_background_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_store_background', data.T_order_store_background);

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

export const requestUpdateStoreBackgroundImageInPlatform = (
  data: requestUpdateStoreBackgroundImagePlatformType,
) => {
  const url = endpoints.store.update_background_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_store_background', data.platform_store_background);

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

// 커스텀 스타일 배경 이미지 저장
export const requestUpdateCategoryBackGroundImage = async (
  data: requestUpdateCategoryBackgroundImageType,
) => {
  const url = endpoints.store.update_category_background_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append(
    'T_order_store_category_background',
    data.T_order_store_category_background,
  );

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

export const requestUpdateCategoryBackGroundImageInPlatform = async (
  data: requestUpdateCategoryBackgroundImagePlatformType,
) => {
  const url = endpoints.store.update_category_background_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append(
    'platform_store_category_background',
    data.platform_store_category_background,
  );

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

// 커스텀 스타일 로고 이미지 저장
export const requestUpdateTableLogoImage = async (
  data: requestUpdateTableLogoImageType,
) => {
  const url = endpoints.store.update_tablet_logo_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append(
    'T_order_store_tablet_logo_img',
    data.T_order_store_tablet_logo_img,
  );

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

// 커스텀 스타일 저장하기
export const requestCustomStyleData = async (
  styleInfo: customStyleDataType,
) => {
  const url = endpoints.store.custom_style_update;

  return adminTokenApi
    .post(url, styleInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

export const requestCustomStyleDataInPlatform = async (
  styleInfo: customStyleDataPlatformType,
) => {
  const url = endpoints.store.custom_style_update;

  return adminTokenApi
    .post(url, styleInfo, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

// 커스텀 테마 리스트 데이터
export const requestCustomTemplateList = () => {
  const url = endpoints.store.custom_style_theme_list;
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

// 태블릿 대기화면 국기 리스트 불러오기
export const requestLanguageFlagList = () => {
  const url = endpoints.store.use_language_flag_list;
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

/** 매장명 검색 API */
export const requestSearchStoreNameResults = (
  data: requestSearchStoreNameType,
) => {
  const url = endpoints.store.list_all_store_name;
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

// 화장실 안내 이미지 저장
export const requestUpdateRestroomImage = async (
  data: requestUpdateRestroomImageType,
) => {
  const url = endpoints.store.update_restroom_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_store_restroom_img', data.T_order_store_restroom_img);

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

export const requestUpdateRestroomImageInPlatform = async (
  data: requestUpdateRestroomImagePlatformType,
) => {
  const url = endpoints.store.update_restroom_img;

  const fd = new FormData();
  fd.append('storeCode', data.storeCode);
  fd.append('T_order_store_restroom_img', data.platform_store_restroom_img);

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

/** 티오더 url list */
export const requestUrlVersionList = (info: requestUrlVersionListType) => {
  const url = endpoints.store.url_version_list;
  return adminTokenApi
    .post(url, info, { validateStatus: (status) => status < 500 })
    .catch((error) => {
      if (error.response.status === 400 || error.response.status === 500) {
        ElMessageBox.alert(error.response.data.msg, '실패', {
          confirmButtonText: '확인',
          type: 'error',
        });
      }
    });
};

/** 앱버전 리스트 */
export const requestApkVersionList = () => {
  const url = endpoints.store.apk_list;
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

/** 포스사 정보 리스트 */
export const requestPosInformationList = () => {
  const url = endpoints.store.pos_type_list;
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

export default {
  requestTorderTotalStoreList,
  requestStoreInfo,
  requestStoreUpdate,
  requestStoreTabletVersionUpdate,
  requestNewStoreCreate,
  requestStoreThemeList,
  requestLogoImageUpdate,
  requestDefaultLanguage,
  requestDefaultCurrency,
  requestDefaultLayout,
  requestTabletBrandListData,
  requestStoreStateListData,
  requestStoreAdBannerListData,
  requestStoreUrlList,
  updateFullStoreInfo,
  requestUpdateCategoryBackGroundImage,
  requestCustomStyleData,
  requestCustomTemplateList,
  requestUpdateTableLogoImage,
  requestLanguageFlagList,
  requestSearchStoreNameResults,
  requestUpdateRestroomImage,
  requestUrlVersionList,
  requestUrlBasedStoreList,
  requestThemeList,
  requestMatchedStoreUrlList,
  requestMatchedThemeList,
  requestAllUrlList,
  updateThemeList,
  requestUpdateStoreBackgroundImage,
  requestApkVersionList,
  requestPosInformationList,
  requestNewStoreCreateInPlatform,
  requestLogoImageUpdateInPlatform,
  requestUpdateStoreBackgroundImageInPlatform,
  requestUpdateRestroomImageInPlatform,
  requestCustomStyleDataInPlatform,
  requestUpdateCategoryBackGroundImageInPlatform,
  requestStoreTabletVersionUpdateInPlatform,
};
