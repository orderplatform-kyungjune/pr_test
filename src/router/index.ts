import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  AgencyStatisticsData,
  AllergyManage,
  AllStoreAlcoholStatistics,
  AuthManage,
  BannerManage,
  BusinessMemberShipManage,
  CategorizeManageSchedule,
  CategorizeManageTabletV2,
  CategorizeProduct,
  CategoryTemplateManage,
  CSInquiryBoard,
  CSInquiryDashBoard,
  CSInquiryRegister,
  CustomThemeManage,
  DailyOrderStatistics,
  DetailExtraServiceManage,
  EventParticipantsInfo,
  EventStockCondition,
  EventStoreAlcoholStatistics,
  ExtraServiceAuctionLog,
  ExtraServiceGameSetting,
  ExtraServiceJackpotLog,
  ExtraServiceManage,
  ExtraServiceTableGameLog,
  FCMDeviceManagement,
  GiftQuantityStock,
  GoodsDetailSettingInCategoryV2,
  InvalidPage,
  LanguageInternationalization,
  LanguageManage,
  LogOrderCart,
  LogOrderViewRedis,
  LogOrderViewTodayRedis,
  LogTabletOrder,
  LogTabletPos,
  MasterUrlManage,
  MemberRegisterManageDetail,
  MemberRegisterManageList,
  MyPage,
  NoticeBoard,
  NoticeBoardDetail,
  PlatformBannerManage,
  PlatformCustomThemeManage,
  PlatformGoodsDetailSettingInCategoryV2,
  PlatformLanguageManage,
  PlatformMyPage,
  PlatformSingleStoreSetting,
  PlatformStoreManage,
  PlatformTotalMemberShipManage,
  PrepaymentTableInfo,
  ProductImageManage,
  ProductManage,
  PromotionEventInfo,
  PromotionEventList,
  PromotionEventRegister,
  PromotionEventRemove,
  RemakePaymentAppLogs,
  RemakePaymentWebLogs,
  SendFCMLogs,
  SingleStoreSetting,
  StoreManage,
  StoreStatistics,
  TableManage,
  TorderMap,
  TotalMemberShipManage,
  WaitingServiceStoreEnroll,
  WaitingServiceStoreList,
  WebUrlManage,
} from '@views';
import { authentication, routeHelper } from '@utils';
import useAuthStore from '@store/storeAuth';
import {
  agencyStatisticsData,
  allergyManage,
  allStoreAlcoholStatistics,
  authManage,
  bannerManage,
  businessMemberShipManage,
  categorizeManageSchedule,
  categorizeManageTabletV2,
  categorizeProduct,
  categoryTemplateManage,
  cSInquiryBoard,
  cSInquiryDashBoard,
  cSInquiryRegister,
  customThemeManage,
  dailyOrderStatistics,
  detailExtraServiceManage,
  eventParticipantsInfo,
  eventStockCondition,
  eventStoreAlcoholStatistics,
  extraServiceAuctionLog,
  extraServiceGameSetting,
  extraServiceJackpotLog,
  extraServiceManage,
  extraServiceTableGameLog,
  fCMDeviceManagement,
  giftQuantityStock,
  goodsDetailSettingInCategoryV2,
  home,
  invalidPage,
  languageInternationalization,
  languageManage,
  login,
  logOrderCart,
  logOrderViewRedis,
  logOrderViewTodayRedis,
  logTabletOrder,
  logTabletPos,
  masterUrlManage,
  memberRegisterManageDetail,
  memberRegisterManageList,
  myPage,
  noticeBoard,
  noticeBoardDetail,
  prepaymentTableInfo,
  productImageManage,
  productManage,
  promotionEventInfo,
  promotionEventList,
  promotionEventRegister,
  promotionEventRemove,
  remakePaymentAppLogs,
  remakePaymentWebLogs,
  sendFCMLogs,
  singleStoreSetting,
  storeManage,
  storeStatistics,
  tableManage,
  torderMap,
  totalMemberShipManage,
  waitingServiceStoreEnroll,
  waitingServiceStoreList,
  webUrlManage,
} from '@router/routePaths';
import { DefaultLayout, LoginLayout } from '@layouts';
import { LOGIN_ID, MASTER } from '@common/string';

const {
  clearApplication,
  failAuthenticationAlert,
  postHealthCheck,
  isUPLUSAdmin,
} = authentication;

const { getRouteName } = routeHelper;

const routes: Array<RouteRecordRaw> = [
  {
    path: login,
    name: routeHelper.getRouteName(login),
    component: LoginLayout,
  },
  {
    path: home,
    name: routeHelper.getRouteName(home),
    component: DefaultLayout,
    children: [
      {
        path: '/:pathMatch(.*)*',
        component: InvalidPage,
      },
      {
        path: singleStoreSetting,
        name: routeHelper.getRouteName(singleStoreSetting),
        component: isUPLUSAdmin()
          ? PlatformSingleStoreSetting
          : SingleStoreSetting,
      },
      {
        path: storeManage,
        name: routeHelper.getRouteName(storeManage),
        component: isUPLUSAdmin() ? PlatformStoreManage : StoreManage,
      },
      {
        path: categorizeManageSchedule,
        name: routeHelper.getRouteName(categorizeManageSchedule),
        component: CategorizeManageSchedule,
      },
      {
        path: bannerManage,
        name: routeHelper.getRouteName(bannerManage),
        component: isUPLUSAdmin() ? PlatformBannerManage : BannerManage,
      },
      {
        path: tableManage,
        name: routeHelper.getRouteName(tableManage),
        component: TableManage,
      },
      {
        path: categorizeManageTabletV2,
        name: routeHelper.getRouteName(categorizeManageTabletV2),
        component: CategorizeManageTabletV2,
      },
      {
        path: goodsDetailSettingInCategoryV2,
        name: routeHelper.getRouteName(goodsDetailSettingInCategoryV2),
        component: isUPLUSAdmin()
          ? PlatformGoodsDetailSettingInCategoryV2
          : GoodsDetailSettingInCategoryV2,
      },
      {
        path: languageManage,
        name: routeHelper.getRouteName(languageManage),
        component: isUPLUSAdmin() ? PlatformLanguageManage : LanguageManage,
      },
      {
        path: myPage,
        name: routeHelper.getRouteName(myPage),
        component: isUPLUSAdmin() ? PlatformMyPage : MyPage,
      },
      {
        path: productImageManage,
        name: routeHelper.getRouteName(productImageManage),
        component: ProductImageManage,
      },
      {
        path: webUrlManage,
        name: routeHelper.getRouteName(webUrlManage),
        component: WebUrlManage,
      },
      {
        path: masterUrlManage,
        name: routeHelper.getRouteName(masterUrlManage),
        component: MasterUrlManage,
      },
      {
        path: storeStatistics,
        name: routeHelper.getRouteName(storeStatistics),
        component: StoreStatistics,
      },
      {
        path: eventStockCondition,
        name: routeHelper.getRouteName(eventStockCondition),
        component: EventStockCondition,
      },
      {
        path: giftQuantityStock,
        name: routeHelper.getRouteName(giftQuantityStock),
        component: GiftQuantityStock,
      },
      {
        path: cSInquiryBoard,
        name: routeHelper.getRouteName(cSInquiryBoard),
        component: CSInquiryBoard,
      },
      {
        path: cSInquiryRegister,
        name: routeHelper.getRouteName(cSInquiryRegister),
        component: CSInquiryRegister,
      },
      {
        path: agencyStatisticsData,
        name: routeHelper.getRouteName(agencyStatisticsData),
        component: AgencyStatisticsData,
      },
      {
        path: categorizeProduct,
        name: routeHelper.getRouteName(categorizeProduct),
        component: CategorizeProduct,
      },
      {
        path: eventParticipantsInfo,
        name: routeHelper.getRouteName(eventParticipantsInfo),
        component: EventParticipantsInfo,
      },
      {
        path: noticeBoard,
        name: routeHelper.getRouteName(noticeBoard),
        component: NoticeBoard,
      },
      {
        path: noticeBoardDetail,
        name: routeHelper.getRouteName(noticeBoardDetail),
        component: NoticeBoardDetail,
      },
      {
        path: allStoreAlcoholStatistics,
        name: routeHelper.getRouteName(allStoreAlcoholStatistics),
        component: AllStoreAlcoholStatistics,
      },
      {
        path: eventStoreAlcoholStatistics,
        name: routeHelper.getRouteName(eventStoreAlcoholStatistics),
        component: EventStoreAlcoholStatistics,
      },
      {
        path: promotionEventRegister,
        name: routeHelper.getRouteName(promotionEventRegister),
        component: PromotionEventRegister,
      },
      {
        path: promotionEventList,
        name: routeHelper.getRouteName(promotionEventList),
        component: PromotionEventList,
      },
      {
        path: promotionEventInfo,
        name: routeHelper.getRouteName(promotionEventInfo),
        component: PromotionEventInfo,
      },
      {
        path: promotionEventRemove,
        name: routeHelper.getRouteName(promotionEventRemove),
        component: PromotionEventRemove,
      },
      {
        path: dailyOrderStatistics,
        name: routeHelper.getRouteName(dailyOrderStatistics),
        component: DailyOrderStatistics,
      },
      {
        path: languageInternationalization,
        name: routeHelper.getRouteName(languageInternationalization),
        component: LanguageInternationalization,
      },
      {
        path: torderMap,
        name: routeHelper.getRouteName(torderMap),
        component: TorderMap,
      },
      {
        path: logTabletPos,
        name: routeHelper.getRouteName(logTabletPos),
        component: LogTabletPos,
      },
      {
        path: logTabletOrder,
        name: routeHelper.getRouteName(logTabletOrder),
        component: LogTabletOrder,
      },
      {
        path: logOrderViewRedis,
        name: routeHelper.getRouteName(logOrderViewRedis),
        component: LogOrderViewRedis,
      },
      {
        path: logOrderViewTodayRedis,
        name: routeHelper.getRouteName(logOrderViewTodayRedis),
        component: LogOrderViewTodayRedis,
      },
      {
        path: logOrderCart,
        name: routeHelper.getRouteName(logOrderCart),
        component: LogOrderCart,
      },
      {
        path: invalidPage,
        name: routeHelper.getRouteName(invalidPage),
        component: InvalidPage,
      },
      {
        path: categoryTemplateManage,
        name: routeHelper.getRouteName(categoryTemplateManage),
        component: CategoryTemplateManage,
      },
      {
        path: memberRegisterManageList,
        name: routeHelper.getRouteName(memberRegisterManageList),
        component: MemberRegisterManageList,
      },
      {
        path: memberRegisterManageDetail,
        name: routeHelper.getRouteName(memberRegisterManageDetail),
        component: MemberRegisterManageDetail,
      },
      {
        path: productManage,
        name: routeHelper.getRouteName(productManage),
        component: ProductManage,
      },
      {
        path: authManage,
        name: routeHelper.getRouteName(authManage),
        component: AuthManage,
      },
      {
        path: prepaymentTableInfo,
        name: routeHelper.getRouteName(prepaymentTableInfo),
        component: PrepaymentTableInfo,
      },
      {
        path: totalMemberShipManage,
        name: routeHelper.getRouteName(totalMemberShipManage),
        component: isUPLUSAdmin()
          ? PlatformTotalMemberShipManage
          : TotalMemberShipManage,
      },
      {
        path: remakePaymentAppLogs,
        name: routeHelper.getRouteName(remakePaymentAppLogs),
        component: RemakePaymentAppLogs,
      },
      {
        path: remakePaymentWebLogs,
        name: routeHelper.getRouteName(remakePaymentWebLogs),
        component: RemakePaymentWebLogs,
      },
      {
        path: sendFCMLogs,
        name: routeHelper.getRouteName(sendFCMLogs),
        component: SendFCMLogs,
      },
      {
        path: fCMDeviceManagement,
        name: routeHelper.getRouteName(fCMDeviceManagement),
        component: FCMDeviceManagement,
      },
      {
        path: extraServiceManage,
        name: routeHelper.getRouteName(extraServiceManage),
        component: ExtraServiceManage,
      },
      {
        path: detailExtraServiceManage,
        name: routeHelper.getRouteName(detailExtraServiceManage),
        component: DetailExtraServiceManage,
      },
      {
        path: extraServiceAuctionLog,
        name: routeHelper.getRouteName(extraServiceAuctionLog),
        component: ExtraServiceAuctionLog,
      },
      {
        path: extraServiceJackpotLog,
        name: routeHelper.getRouteName(extraServiceJackpotLog),
        component: ExtraServiceJackpotLog,
      },
      {
        path: extraServiceTableGameLog,
        name: routeHelper.getRouteName(extraServiceTableGameLog),
        component: ExtraServiceTableGameLog,
      },
      {
        path: businessMemberShipManage,
        name: routeHelper.getRouteName(businessMemberShipManage),
        component: BusinessMemberShipManage,
      },
      {
        path: cSInquiryDashBoard,
        name: routeHelper.getRouteName(cSInquiryDashBoard),
        component: CSInquiryDashBoard,
      },
      {
        path: extraServiceGameSetting,
        name: routeHelper.getRouteName(extraServiceGameSetting),
        component: ExtraServiceGameSetting,
      },
      {
        path: waitingServiceStoreList,
        name: routeHelper.getRouteName(waitingServiceStoreList),
        component: WaitingServiceStoreList,
      },
      {
        path: waitingServiceStoreEnroll,
        name: routeHelper.getRouteName(waitingServiceStoreEnroll),
        component: WaitingServiceStoreEnroll,
      },
      {
        path: allergyManage,
        name: routeHelper.getRouteName(allergyManage),
        component: AllergyManage,
      },
      {
        path: customThemeManage,
        name: routeHelper.getRouteName(customThemeManage),
        component: isUPLUSAdmin()
          ? PlatformCustomThemeManage
          : CustomThemeManage,
      },
    ],
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    const element = document.querySelector('.default_layout_contents');

    if (element) {
      element.scrollTop = 0;
    }
  },
});

// 라우터 정보가 변경 될때마다 호출
// 매 페이지 인증검사 실시
// 참고페이지
// https://router.vuejs.org/kr/api/#router-beforeeach

router.beforeEach(async (to, from, next) => {
  const { authLnbListData, accessAuthPageData } = useAuthStore();

  const routerPath = (path: string) => {
    if (to.path !== path) {
      next(path);
    } else {
      next();
    }
  };

  try {
    const toPath = getRouteName(to.path);
    const isAuthPath = accessAuthPageData.includes(toPath);

    /**
     * 토큰 검증 API 호출
     * @returns boolean
     */
    const authState = await postHealthCheck();

    // 토큰 유효성 통과
    if (authState) {
      const id = localStorage.getItem(LOGIN_ID);
      const master = localStorage.getItem(MASTER);

      // 로컬스토리지 data 체크
      if (id && master && authLnbListData && accessAuthPageData) {
        if (isAuthPath) {
          // 접근 가능한 페이지 진입 시 페이지 진입 허용
          if (
            (from.path === home && to.path === home) ||
            (from.path === home && to.path === login)
          ) {
            next(myPage);
          } else if (from.path !== home && to.path === home) {
            next(myPage);
          } else if (from.path !== home && to.path === login) {
            next(myPage);
          } else {
            next();
          }
        } else {
          // 접근 가능한 페이지가 아닌 곳을 진입하는 경우 알럿 출력
          ElMessage({
            type: 'error',
            message: '접근 권한이 없습니다.',
          });
          if (authLnbListData.length === 0 || accessAuthPageData.length === 0) {
            failAuthenticationAlert();
          } else {
            next(false);
          }
        }
      } else {
        // 로컬 스토리지에 data가 하나라도 없으면 재로그인
        failAuthenticationAlert();
        next(false);
      }
    } else {
      // 토큰 유효성 검사 false시
      // 로컬스토리지 및 쿠키 하나라도 없을 때 후 로그인 페이지로 이동
      // 수동으로 로그인 페이지로 이동할 때

      // eslint-disable-next-line no-lonely-if
      if (from.path === home || to.path === login) {
        clearApplication();
        routerPath(login);
      } else {
        failAuthenticationAlert();
        routerPath(login);
      }
    }
  } catch (error) {
    console.log('페이지 오류', error);
  }
});

export default router;
