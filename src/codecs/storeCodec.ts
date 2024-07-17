import * as t from 'io-ts';
import { record } from 'io-ts';
import { storeListDataCodec as storeNameListCodec } from '@codecs/inquiryCodec';
import { excess } from '@codecs/excess';

// 티오더 매장 리스트 조회
const storeListDataCodec = excess(
  t.type({
    T_order_store_apiType: t.string,
    T_order_store_apk_name: t.string,
    T_order_store_pos_info: t.string,
    T_order_store_register_date: t.string,
    T_order_store_van_info: t.string,
    num: t.number,
    payment_type: t.string,
    storeArea: t.string,
    storeCode: t.string,
    storeName: t.string,
    storeOriginName: t.string,
    storestat: t.string,
    tablet_login_id: t.string,
    test_store_use: t.string,
    posMiddleWareCode: t.string,
    business_type: t.string,
  }),
);

// 페이지네이션
const paginationInfoCodec = t.type({
  total: t.number,
  per_page: t.number,
  current_page: t.number,
  last_page: t.number,
  first_page_url: t.string,
  last_page_url: t.string,
  prev_page_url: t.string,
  next_page_url: t.string,
  path: t.string,
  from: t.number,
  to: t.number,
});

const storeTotalListCodec = t.type({
  result: t.boolean,
  code: t.number,
  page_info: paginationInfoCodec,
  data: t.array(storeListDataCodec),
});

// 매장 태블릿 정렬 객체
const storeSortObject = t.type({
  order: t.union([t.null, t.string]),
  column: t.string,
});

// 커스텀 테마 설정 정보
const customStyleSimpleCodec = t.type({
  fontColor: t.string,
  backgroundColor: t.string,
});
const customStyleFontCodec = t.type({
  color: t.string,
  activeColor: t.string,
});
const customStyleCategoryDataCodec = t.type({
  fontColor: t.string,
  activeFontColor: t.string,
  backgroundColor: t.string,
  backgroundActiveColor: t.string,
});
const customStyleCategoryCodec = t.type({
  subCategory: customStyleCategoryDataCodec,
  mainCategory: customStyleCategoryDataCodec,
  backgroundImg: t.string,
  backgroundColor: t.string,
});
const customStyleCodec = t.type({
  useYn: t.string,
  category: customStyleCategoryCodec,
  tableNum: customStyleSimpleCodec,
  staffCallButton: customStyleSimpleCodec,
  font: customStyleFontCodec,
  button: customStyleSimpleCodec,
});
const customStyleThemeListDataCodec = t.type({
  code: t.string,
  theme: customStyleCodec,
});
const customStyleThemeListCodec = t.type({
  result: t.boolean,
  code: t.number,
  data: t.array(customStyleThemeListDataCodec),
});

// 매장 상세 정보
const storeInfoDataCreditPaymentMethodCodec = excess(
  t.type({
    card: t.boolean,
    cash: t.boolean,
  }),
);

const storeInfoDataCreditPaymentTypeCodec = excess(
  t.type({
    byMenu: t.boolean,
    single: t.boolean,
    byPrice: t.boolean,
  }),
);

const storeInfoDataStoreCodec = excess(
  t.type({
    T_order_store_ipv4: t.union([t.string, t.undefined]),
    T_order_store_name: t.union([t.string, t.undefined]),
    T_order_store_Saup_number: t.union([t.string, t.undefined]),
    T_order_store_Id: t.union([t.string, t.undefined]),
    T_order_store_staff_password: t.union([t.string, t.undefined]),
    T_order_store_zipcode: t.union([t.string, t.undefined]),
    T_order_store_address: t.union([t.string, t.undefined]),
    T_order_store_address2: t.union([t.string, t.undefined]),
    T_order_store_set_use: t.union([t.string, t.undefined]),
    T_order_store_logoUse: t.union([t.string, t.undefined]),
    T_order_store_close: t.union([t.number, t.undefined]),
    T_order_store_close_order: t.union([t.string, t.undefined]),
    T_order_store_Theme: t.union([t.string, t.undefined]),
    T_order_recent_order_hide: t.union([t.string, t.undefined]),
    T_order_store_banner_text: t.union([t.string, t.undefined]),
    T_order_store_Popup_time: t.union([t.string, t.number, t.undefined]),
    T_order_store_service_use: t.union([t.number, t.undefined]),
    T_order_store_Main_rows: t.union([t.string, t.number, t.undefined]),
    T_order_store_cart_point_type: t.union([t.number, t.undefined]),
    T_order_store_cart_point: t.union([t.string, t.number, t.undefined]),
    T_order_store_language_use: t.union([t.string, t.undefined]),
    T_order_store_point_use: t.union([t.string, t.undefined]),
    T_order_stote_register_use: t.union([t.string, t.undefined]),
    T_order_store_Tablet_sort: excess(
      t.type({
        order: t.union([t.string, t.null, t.undefined]),
        column: t.union([t.string, t.null, t.undefined]),
      }),
    ),
    T_order_store_guide_use: t.union([t.string, t.undefined]),
    T_order_store_language: t.union([t.string, t.undefined]),
    T_order_min_order_price: t.union([t.number, t.undefined]),
    T_order_store_direct_table: t.union([t.string, t.undefined]),
    T_order_store_order_confirm: t.union([t.string, t.undefined]),
    T_order_store_background: t.union([t.string, t.undefined]),
    T_order_store_banner_control: t.union([t.string, t.undefined]),
    T_order_store_credit_able: t.union([t.number, t.undefined]),
    preCreditTableUse: t.union([t.number, t.undefined]),
    T_order_store_categoryListUp: t.union([t.number, t.undefined]),
    categoryIsBrand: t.union([t.number, t.undefined]),
    T_order_store_visitBook: t.union([t.string, t.undefined]),
    visitOrderAble: t.union([t.string, t.undefined]),
    visitGroupUse: t.union([t.string, t.undefined]),
    visitGroups: t.union([t.string, t.undefined]),
    visitInfoSendPos: t.union([t.string, t.undefined]),
    visitInfoSendFirstorder: t.union([t.number, t.undefined]),
    visitSendFirstOrderMerge: t.union([t.number, t.undefined]),
    visitInfoPosPrintPeopleIsQty: t.union([t.number, t.undefined]),
    visitGroupsOrderAble: t.union([t.string, t.undefined]),
    T_order_auctionAble: t.union([t.string, t.undefined]),
    paymentMethod: t.union([t.number, t.undefined]),
    T_order_cartPage_override: t.union([t.number, t.undefined]),
    T_order_simpleView: t.union([t.string, t.undefined]),
    T_order_QRPass_use: t.union([t.string, t.undefined]),
    T_order_QRPass_Id: t.union([t.string, t.undefined]),
    T_order_QRPass_password: t.union([t.string, t.undefined]),
    tabletBillsOnOff: t.union([t.string, t.undefined]),
    optionLayout: t.union([t.string, t.undefined]),
    storeSerialNumber: t.union([t.string, t.undefined]),
    storeVanTid: t.union([t.string, t.undefined]),
    categoryRows: t.union([t.number, t.undefined]),
    T_order_chatingAble: t.union([t.string, t.undefined]),
    sendOrderViewHp: t.union([t.number, t.undefined]),
    T_order_store_logo: t.union([t.string, t.undefined]),
    T_order_gameAble: t.union([t.string, t.undefined]),
    T_order_store_standardPriceUnit: t.union([t.string, t.undefined]),
    T_order_store_tablet_installer: t.union([t.string, t.undefined]),
    T_order_store_tablet_brand: t.union([t.array(t.string), t.undefined]),
    T_order_store_viewtablet_cnt: t.union([t.number, t.undefined]),
    T_order_store_ordertablet_cnt: t.union([t.number, t.undefined]),
    T_order_store_extratablet_cnt: t.union([t.number, t.undefined]),
    T_order_store_apiType: t.union([t.string, t.undefined]),
    sendOrderRevers: t.union([t.number, t.undefined]),
    T_order_store_upjong: t.union([t.string, t.undefined]),
    T_order_store_upte: t.union([t.string, t.undefined]),
    T_order_store_contractNumber: t.union([t.string, t.undefined]),
    T_order_store_stat: t.union([t.string, t.undefined]),
    sendOrderViewPosErr: t.union([t.string, t.undefined]),
    serviceGoods_sendPaidOrder: t.union([t.number, t.undefined]),
    open_hour: t.union([t.string, t.undefined]),
    close_hour: t.union([t.string, t.undefined]),
    T_order_store_Ad_use: t.union([t.string, t.undefined]),
    T_order_store_Ad_banner_list: t.union([t.array(t.number), t.undefined]),
    T_order_store_backgroundUse: t.union([t.string, t.undefined]),
    T_order_store_tablet_logo_img: t.union([t.string, t.undefined]),
    T_order_store_tablet_custom_style: t.union([customStyleCodec, t.undefined]),
    option_receipt_sort: t.union([t.number, t.undefined]),
    T_order_store_checkout_Ad_use: t.union([t.string, t.undefined]),
    T_order_store_master_language: t.union([t.string, t.undefined]),
    T_order_store_use_language_list: t.union([
      t.array(t.string),
      t.undefined,
      t.null,
    ]),
    test_store_use: t.union([t.string, t.undefined]),
    T_order_store_contract_startDate: t.union([t.string, t.undefined]),
    T_order_store_contract_endDate: t.union([t.string, t.undefined]),
    serial_number: t.union([t.string, t.undefined]),
    memo: t.union([t.string, t.undefined]),
    T_order_store_drive_call_hide: t.union([t.string, t.undefined]),
    T_order_store_setting_code: t.union([t.string, t.undefined]),
    T_order_store_empCall_code: t.union([t.string, t.undefined]),
    T_order_store_adop_Ad_use: t.union([
      // 2404~ 미사용
      t.string,
      t.undefined,
    ]),
    T_order_store_banner_Ad_use: t.union([t.string, t.undefined]),
    T_order_store_restroom_use: t.union([t.string, t.undefined]),
    T_order_store_restroom_img: t.union([t.string, t.undefined]),
    T_order_store_tablet_version: t.union([t.string, t.undefined]),
    T_order_store_orderView_version: t.union([t.string, t.undefined]),
    T_order_store_banner_time: t.union([t.number, t.undefined]),
    T_order_store_van_info: t.union([t.string, t.undefined]),
    T_order_store_fran_code: t.union([t.string, t.undefined]),
    TabletMinBrightness: t.union([t.number, t.undefined]),
    TabletMaxBrightness: t.union([t.number, t.undefined]),
    TabletWaitBrightness: t.union([t.number, t.undefined]),
    saup_license_img: t.union([t.string, t.undefined]),
    T_order_store_pos_info: t.union([t.string, t.undefined]),
    T_order_area_name: t.union([t.string, t.undefined]),
    T_order_origin_store_name: t.union([t.string, t.undefined]),
    T_order_store_has_pos: t.union([t.string, t.undefined]),
    T_order_store_has_middleware: t.union([t.string, t.undefined]),
    posMiddleWareCode: t.union([t.string, t.undefined]),
    credit_payment_method: storeInfoDataCreditPaymentMethodCodec,
    credit_payment_type: storeInfoDataCreditPaymentTypeCodec,
    contract_img: t.union([t.string, t.undefined]),
    visitGroupOpenType: t.union([t.string, t.undefined]),
    business_type: t.union([t.string, t.undefined]),
  }),
);

const storeBannerInfoCodec = excess(
  t.type({
    id: t.string,
    T_order_store_code: t.string,
    T_order_store_banner_name: t.string,
    T_order_store_banner_url: t.union([t.string, t.undefined]),
    T_order_store_link_menu: t.string,
    T_order_store_banner_use: t.string,
    T_order_store_MSG_Number: t.number,
    T_order_store_banner_type: t.string,
    T_order_store_banner_sort: t.number,
  }),
);

const storeInfoDataCodec = excess(
  t.type({
    goods_count: t.number,
    tablet_count: t.number,
    store: storeInfoDataStoreCodec,
    banner: t.array(storeBannerInfoCodec),
    pos_init_date: t.string,
  }),
);

const storeInfoCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: storeInfoDataCodec,
  }),
);

// 언어 정보
const languageInfoCodec = excess(
  t.type({
    en: t.string,
    jp: t.string,
    ko: t.string,
    zh_hans: t.string,
    zh_hant: t.string,
  }),
);

// 매장 테마 리스트 정보
const storeThemeListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(
      t.type({
        no: t.string,
        theme_name: t.string,
        theme_img_url: t.string,
      }),
    ),
  }),
);

// 기본 언어 선택 리스트
const storeDefaultLanguageCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.type({
      KR: t.string,
      EN: t.string,
      JP: t.string,
      'CN-S': t.string,
      CN: t.string,
    }),
  }),
);

// 기본 화페 선택 리스트
const storeDefaultCurrencyCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.type({
      원: t.string,
      $: t.string,
      '¥': t.string,
    }),
  }),
);

// 기본 화페 선택 리스트
const storeDefaultLayoutCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.type({
      basic: t.string,
      whiteImage: t.string,
      whiteText: t.string,
      blackImage: t.string,
      blackText: t.string,
    }),
  }),
);

const allStoreListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeNameListCodec),
  }),
);

// 모든 매장 리스트 데이터 코덱
const matchedStoreCodec = excess(
  t.type({
    value: t.string,
    label: t.string,
    match_res: t.string,
  }),
);

const matchedStoreListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(matchedStoreCodec),
  }),
);

const storeListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeNameListCodec),
  }),
);

// 태블릿 브랜드 리스트 데이터 코덱
const tabletListDataCodec = excess(
  t.type({
    TECLAST_C1: t.string,
    TECLAST_C2: t.string,
    TECLAST_C2_LITE: t.string,
    TECLAST_S2: t.string,
    GALAXYTAB: t.string,
    IMUZ: t.string,
    JTNET: t.union([t.string, t.undefined]),
    KOVAN: t.union([t.string, t.undefined]),
    DAOUDATA: t.union([t.string, t.undefined]),
    FINPAY: t.union([t.string, t.undefined]),
  }),
);

const tabletListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: tabletListDataCodec,
  }),
);

// 매장 계약 상태 리스트
const storeStateListDataCodec = excess(
  t.type({
    code: t.string,
    name: t.string,
    valid: t.boolean,
  }),
);

const storeStateListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeStateListDataCodec),
  }),
);

// 매장 광고 배너 리스트
const storeAdBannerListDataCodec = excess(
  t.type({
    id: t.number,
    adv_company_code: t.string,
    T_order_store_banner_name: t.string,
    T_order_store_banner_url: t.union([t.string, t.undefined]),
  }),
);

const storeAdBannerListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeAdBannerListDataCodec),
  }),
);

const storeLanguageFlagListDataCodec = excess(
  t.type({
    label: t.string,
    value: t.string,
    img_url: t.string,
  }),
);

const storeLanguageFlagListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(storeLanguageFlagListDataCodec),
  }),
);

const storeInfoUrlDataCodec = excess(
  t.type({
    T_order_store_num: t.number,
    T_order_store_code: t.string,
    T_order_store_name: t.string,
    T_order_store_tablet_version: t.union([t.string, t.undefined]),
    T_order_store_Id: t.string,
    T_order_store_update_date: t.string,
    T_order_sqsUse: t.union([t.string, t.undefined]),
    T_order_store_orderView_version: t.union([t.string, t.undefined]),
    T_order_store_cart_refresh_time: t.union([t.string, t.undefined]),
    T_order_store_refresh_time: t.union([t.string, t.undefined]),
    test_store_use: t.string,
  }),
);

const storeInfoUrlListCodec = t.array(storeInfoUrlDataCodec);

const storeUpdatedUrlCodec = excess(
  t.type({
    result: t.boolean,
    msg: t.union([t.string, t.undefined]),
    code: t.number,
  }),
);

const basedUrlStoreInfoCodec = t.array(
  t.type({
    version: t.string,
    cnt: t.number,
  }),
);

const themeDataCodec = t.array(
  t.type({
    themeNo: t.string,
    api_version: t.string,
    themeName: t.string,
    cnt: t.number,
  }),
);

const allThemeDataCodec = t.array(
  t.type({
    no: t.string,
    theme_name: t.string,
    theme_img_url: t.string,
  }),
);

const allThemeListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: allThemeDataCodec,
  }),
);

const allUrlDataCodec = t.type({
  torder: t.array(t.string),
  master: t.array(t.string),
});

const allUrlListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: allUrlDataCodec,
  }),
);

const vanListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: record(t.string, t.string),
  }),
);

const apkVersionListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(t.string),
  }),
);

const posInformationListCodec = excess(
  t.type({
    result: t.boolean,
    code: t.number,
    data: t.array(t.string),
  }),
);

export default {
  storeListDataCodec,
  paginationInfoCodec,
  storeTotalListCodec,
  storeSortObject,
  storeInfoDataStoreCodec,
  storeInfoDataCodec,
  storeInfoCodec,
  languageInfoCodec,
  storeThemeListCodec,
  storeDefaultLanguageCodec,
  storeDefaultCurrencyCodec,
  storeDefaultLayoutCodec,
  storeListCodec,
  tabletListCodec,
  storeStateListCodec,
  storeAdBannerListCodec,
  customStyleThemeListCodec,
  storeLanguageFlagListCodec,
  allStoreListCodec,
  storeInfoUrlListCodec,
  storeUpdatedUrlCodec,
  basedUrlStoreInfoCodec,
  allUrlListCodec,
  matchedStoreListCodec,
  themeDataCodec,
  allThemeListCodec,
  vanListCodec,
  apkVersionListCodec,
  posInformationListCodec,
};
