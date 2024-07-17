import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { isUPLUSAdmin } from '@utils/authentication';
import { dateFormatterUtil } from '@utils';
import {
  agencyStatisticsData,
  allergyManage,
  allStoreAlcoholStatistics,
  authManage,
  businessMemberShipManage,
  cSInquiryBoard,
  cSInquiryDashBoard,
  dailyOrderStatistics,
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
  invalidPage,
  languageInternationalization,
  logOrderCart,
  logOrderViewRedis,
  logOrderViewTodayRedis,
  logTabletOrder,
  logTabletPos,
  masterUrlManage,
  memberRegisterManageList,
  noticeBoard,
  prepaymentTableInfo,
  productImageManage,
  promotionEventList,
  remakePaymentAppLogs,
  remakePaymentWebLogs,
  sendFCMLogs,
  singleStoreSetting,
  storeStatistics,
  torderMap,
  totalMemberShipManage,
  waitingServiceStoreList,
  webUrlManage,
} from '@router/routePaths';
import { authPageTreeType, pageRouterQueryType } from '@interface/member';
import {
  Close,
  CreditCard,
  DataAnalysis,
  DataBoard,
  Discount,
  DocumentCopy,
  Edit,
  Files,
  Finished,
  Help,
  House,
  List,
  Lock,
  Monitor,
  Postcard,
  Search,
  Service,
  Setting,
  TakeawayBox,
  UploadFilled,
  User,
  WarnTriangleFilled,
} from '@element-plus/icons-vue';
import { AUTH } from '@common/string';

export const useAuthStore = defineStore(AUTH, () => {
  const { refinedToday, refinedWeek } = dateFormatterUtil;

  // ① 페이지 생성 시 추가
  const originLnbTree: authPageTreeType[] = [
    {
      code: 'M0003',
      name: '고객상담 어드민',
      flag: false,
      child: [
        {
          code: 'S3001',
          name: '문의게시판',
          flag: false,
          child: [],
        },
        {
          code: 'S3002',
          name: '관리자용 통계',
          flag: false,
          child: [],
        },
      ],
    },
    {
      code: 'M0001',
      name: isUPLUSAdmin() ? 'U+ ORDER' : 'TORDER',
      flag: false,
      child: [
        {
          code: 'S1001',
          name: '매장리스트',
          flag: false,
          child: [],
        },
        {
          code: 'S1002',
          name: '상품 이미지 일괄 수정',
          flag: false,
          child: [],
        },
        {
          code: 'S1003',
          name: '오더 태블릿 버전 설정',
          flag: false,
          child: [],
        },
        {
          code: 'S1005',
          name: '마스터 태블릿 버전 설정',
          flag: false,
          child: [],
        },
        {
          code: 'S1011',
          name: '알레르기 관리',
          flag: false,
          child: [],
        },
        {
          code: 'S1007',
          name: 'S3 언어 국제화 설정',
          flag: false,
          child: [],
        },
        {
          code: 'S1008',
          name: '선결제 테이블 정보',
          flag: false,
          child: [],
        },
        {
          code: 'S1010',
          name: 'FCM 기기관리',
          flag: false,
          child: [],
        },
      ],
    },
    {
      code: 'M0004',
      name: 'ADMIN',
      flag: false,
      child: [
        {
          code: 'S4001',
          name: '통계 어드민(프로모션)',
          flag: false,
          child: [
            {
              code: 'S4002',
              name: '매장별 통계',
              flag: false,
              child: [],
            },
            {
              code: 'S4003',
              name: '경품 수량 재고(실시간)',
              flag: false,
              child: [],
            },
            {
              code: 'S4004',
              name: '이벤트 경품 재고 현황',
              flag: false,
              child: [],
            },
            {
              code: 'S4005',
              name: '이벤트 통계',
              flag: false,
              child: [],
            },
            {
              code: 'S4006',
              name: '모든 매장 주류 통계',
              flag: false,
              child: [],
            },
            {
              code: 'S4007',
              name: '이벤트 참여매장 주류 통계',
              flag: false,
              child: [],
            },
            {
              code: 'S4008',
              name: '이벤트 참여자 정보',
              flag: false,
              child: [],
            },
            {
              code: 'S4009',
              name: '프로모션 이벤트 목록',
              flag: false,
              child: [],
            },
          ],
        },
        {
          code: 'S4010',
          name: '공지사항 게시판',
          flag: false,
          child: [
            {
              code: 'S4011',
              name: '공지사항 등록 목록',
              flag: false,
              child: [],
            },
          ],
        },
        {
          code: 'S4012',
          name: '서치 어드민',
          flag: false,
          child: [
            {
              code: 'S4013',
              name: '일별 주문 건수 목록',
              flag: false,
              child: [],
            },
            {
              code: 'S4014',
              name: '티오더 설치 매장 지도',
              flag: false,
              child: [],
            },
          ],
        },
      ],
    },
    {
      code: 'M0005',
      name: '시스템 관리',
      flag: false,
      child: [
        {
          code: 'S5005',
          name: '통합 인증 승인 관리',
          flag: false,
          child: [],
        },
        {
          code: 'S5001',
          name: '전체 회원 관리',
          flag: false,
          child: [
            {
              code: 'S5002',
              name: '어드민 회원 관리',
              flag: false,
              child: [],
            },
            {
              code: 'S5003',
              name: '비즈니스 회원 관리',
              flag: false,
              child: [],
            },
          ],
        },
        {
          code: 'S5004',
          name: '권한 관리',
          flag: false,
          child: [],
        },
      ],
    },
    {
      code: 'M0006',
      name: '로그 조회',
      flag: false,
      child: [
        {
          code: 'S6001',
          name: '로그 조회',
          flag: false,
          child: [
            {
              code: 'S6004',
              name: '태블릿 당일 주문',
              flag: false,
              child: [],
            },
            {
              code: 'S6005',
              name: '태블릿 주문내역',
              flag: false,
              child: [],
            },
            {
              code: 'S6002',
              name: '태블릿 요청 로그',
              flag: false,
              child: [],
            },
            {
              code: 'S6003',
              name: 'Log Tablet Order',
              flag: false,
              child: [],
            },
            {
              code: 'S6006',
              name: '완료 주문내역',
              flag: false,
              child: [],
            },
            {
              code: 'S6007',
              name: '선결제 앱 로그(리메이크)',
              flag: false,
              child: [],
            },
            {
              code: 'S6008',
              name: '선결제 웹 로그(리메이크)',
              flag: false,
              child: [],
            },
            {
              code: 'S6009',
              name: 'FCM 전송 로그',
              flag: false,
              child: [],
            },
          ],
        },
      ],
    },
    {
      code: 'M0007',
      name: '템플릿 관리',
      flag: false,
      child: [
        {
          code: 'S7001',
          name: '분류 템플릿 관리하기',
          flag: false,
          child: [],
        },
      ],
    },
    {
      code: 'M0009',
      name: '부가서비스 어드민',
      flag: false,
      child: [
        {
          code: 'S9001',
          name: '매장 관리',
          flag: false,
          child: [
            {
              code: 'S9002',
              name: '부가서비스 관리',
              flag: false,
              child: [],
            },
          ],
        },
        {
          code: 'S9007',
          name: '부가서비스 설정',
          flag: false,
          child: [
            {
              code: 'S9008',
              name: '게임 설정',
              flag: false,
              child: [],
            },
          ],
        },
        {
          code: 'S9003',
          name: '로그 관리',
          flag: false,
          child: [
            {
              code: 'S9004',
              name: '경매 로그',
              flag: false,
              child: [],
            },
            {
              code: 'S9005',
              name: '잭팟 로그',
              flag: false,
              child: [],
            },
            {
              code: 'S9006',
              name: '테이블 게임 로그',
              flag: false,
              child: [],
            },
          ],
        },
      ],
    },
    {
      code: 'M0012',
      name: '대기표 서비스 어드민',
      flag: false,
      child: [
        {
          code: 'S1201',
          name: '대기표 매장 관리',
          flag: false,
          child: [],
        },
      ],
    },
  ];

  // ② 페이지 생성 시 추가
  /** lnb 데이터 리스트 */
  const originLnbData: pageRouterQueryType[] = [
    {
      code: 'M0003',
      name: '고객상담 어드민',
      path: '',
    },
    {
      code: 'M0001',
      name: isUPLUSAdmin() ? 'U+ ORDER' : 'TORDER',
      path: '',
    },
    {
      code: 'M0004',
      name: 'ADMIN',
      path: '',
    },
    {
      code: 'M0005',
      name: '시스템 관리',
      path: '',
    },
    {
      code: 'M0006',
      name: '로그 조회',
      path: '',
    },
    {
      code: 'M0007',
      name: '템플릿 관리',
      path: '',
    },
    {
      code: 'M0009',
      name: '부가서비스 어드민',
      path: '',
    },
    {
      code: 'M0012',
      name: '대기표 서비스 어드민',
      path: '',
    },
    {
      code: 'S3001',
      name: '문의게시판',
      path: cSInquiryBoard,
      query: {
        page: 1,
        pageSize: 10,
        searchStartDate: refinedWeek(),
        searchEndDate: refinedToday(),
        searchCategory1: '',
        searchCategory2: '',
        searchKeyword: '',
        searchComplain: '',
        searchStat: '',
        searchEnquirerHp: '',
        searchStoreName: '',
        searchStoreCode: '',
        searchChecker: '',
        searchEnquirer: '',
        searchComment: '',
        searchIncoming: '',
        searchNum: '',
      },
      icon: Service,
    },
    {
      code: 'S3002',
      name: '관리자용 통계',
      path: cSInquiryDashBoard,
      query: {},
      icon: DataAnalysis,
    },
    {
      code: 'S1001',
      name: '매장리스트',
      path: singleStoreSetting,
      query: {
        page: 1,
        pageSize: 20,
        searchType: '',
        searchTxt: '',
        searchStatArray: '',
        searchApiVersionArray: '',
        searchPaymentType: '',
        searchPosInfoArray: '',
        searchVanInfoArray: '',
        searchApkVersionArray: '',
        searchTestStoreYN: '',
        searchStartDate: '',
        searchEndDate: '',
        searchBusinessType: '',
      },
      icon: List,
    },
    {
      code: 'S1002',
      name: '상품 이미지 일괄 수정',
      path: productImageManage,
      icon: UploadFilled,
    },
    {
      code: 'S1003',
      name: '오더 태블릿 버전 설정',
      path: webUrlManage,
      icon: Help,
    },
    {
      code: 'S1005',
      name: '마스터 태블릿 버전 설정',
      path: masterUrlManage,
      icon: Discount,
    },
    {
      code: 'S1007',
      name: 'S3 언어 국제화 설정',
      path: languageInternationalization,
      icon: Edit,
    },
    {
      code: 'S1008',
      name: '선결제 테이블 정보',
      path: prepaymentTableInfo,
      icon: CreditCard,
    },
    {
      code: 'S1010',
      name: 'FCM 기기관리',
      path: fCMDeviceManagement,
      icon: TakeawayBox,
    },
    {
      code: 'S4001',
      name: '통계 어드민(프로모션)',
      path: invalidPage,
      icon: Monitor,
    },
    {
      code: 'S4002',
      name: '매장별 통계',
      path: storeStatistics,
      query: {
        page: 1,
        storeCode: '',
        storeName: '',
      },
    },
    {
      code: 'S4003',
      name: '경품 수량 재고(실시간)',
      path: giftQuantityStock,
    },
    {
      code: 'S4004',
      name: '이벤트 경품 재고 현황',
      path: eventStockCondition,
    },
    {
      code: 'S4005',
      name: '이벤트 통계',
      path: agencyStatisticsData,
    },
    {
      code: 'S4006',
      name: '모든 매장 주류 통계',
      path: allStoreAlcoholStatistics,
    },
    {
      code: 'S4007',
      name: '이벤트 참여매장 주류 통계',
      path: eventStoreAlcoholStatistics,
    },
    {
      code: 'S4008',
      name: '이벤트 참여자 정보',
      path: eventParticipantsInfo,
    },
    {
      code: 'S4009',
      name: '프로모션 이벤트 목록',
      path: promotionEventList,
    },
    {
      code: 'S4010',
      name: '공지사항 게시판',
      path: invalidPage,
      icon: DataBoard,
    },
    {
      code: 'S4011',
      name: '공지사항 등록 목록',
      path: noticeBoard,
    },
    {
      code: 'S4012',
      name: '서치 어드민',
      path: invalidPage,
      icon: Search,
    },
    {
      code: 'S4013',
      name: '일별 주문 건수 목록',
      path: dailyOrderStatistics,
      query: {
        page: 0,
        pageSize: 10,
        startDate: '',
        endDate: '',
      },
    },
    {
      code: 'S4014',
      name: '티오더 설치 매장 지도',
      path: torderMap,
    },
    {
      code: 'S5005',
      name: '통합 인증 승인 관리',
      path: memberRegisterManageList,
      icon: Finished,
    },
    {
      code: 'S5001',
      name: '전체 회원 관리',
      path: invalidPage,
      icon: User,
    },
    {
      code: 'S5002',
      name: '어드민 회원 관리',
      path: totalMemberShipManage,
      query: {
        page: 1,
        perPage: 10,
        searchCorporationArray: '',
        searchStateArray: '',
        searchAuth: '',
        searchDepartment: '',
        searchStartDate: '',
        searchEndDate: '',
        searchTxt: '',
      },
    },
    {
      code: 'S5003',
      name: '비즈니스 회원 관리',
      path: businessMemberShipManage,
    },
    {
      code: 'S5004',
      name: '권한 관리',
      path: authManage,
      icon: Lock,
    },
    {
      code: 'S7001',
      name: '분류 템플릿 관리하기',
      path: '/categoryTemplateManage',
      icon: User,
    },
    {
      code: 'S6001',
      name: '로그 조회',
      path: invalidPage,
      icon: Files,
    },
    {
      code: 'S6002',
      name: '태블릿 요청 로그',
      path: logTabletPos,
      query: {
        page: 1,
        perPage: 10,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
      },
    },
    {
      code: 'S6003',
      name: 'Log Tablet Order',
      path: logTabletOrder,
      query: {
        page: 1,
        perPage: 20,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
      },
    },
    {
      code: 'S6004',
      name: '태블릿 당일 주문',
      path: logOrderViewTodayRedis,
      query: {
        page: 1,
        perPage: 20,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
      },
    },
    {
      code: 'S6005',
      name: '태블릿 주문내역',
      path: logOrderViewRedis,
      query: {
        page: 1,
        perPage: 20,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
      },
    },
    {
      code: 'S6006',
      name: '완료 주문내역',
      path: logOrderCart,
      query: {
        page: 1,
        perPage: 20,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
      },
    },
    {
      code: 'S6007',
      name: '선결제 앱 로그 조회(리메이크)',
      path: remakePaymentAppLogs,
      query: {
        page: 1,
        perPage: 100,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
        searchOrderKey: '',
      },
    },
    {
      code: 'S6008',
      name: '선결제 웹 로그 조회(리메이크)',
      path: remakePaymentWebLogs,
      query: {
        page: 1,
        perPage: 100,
        searchStartDate: refinedToday(),
        searchEndDate: refinedToday(),
        searchStoreCodeOrName: '',
        searchIP: '',
        searchOrderKey: '',
      },
    },
    {
      code: 'S6009',
      name: 'FCM 전송 로그',
      path: sendFCMLogs,
    },
    {
      code: 'S9001',
      name: '매장 관리',
      path: invalidPage,
      icon: House,
    },
    {
      code: 'S9002',
      name: '부가서비스 관리',
      path: extraServiceManage,
    },
    {
      code: 'S9007',
      name: '부가서비스 설정',
      path: invalidPage,
      icon: Setting,
    },
    {
      code: 'S9008',
      name: '게임 설정',
      path: extraServiceGameSetting,
    },
    {
      code: 'S9003',
      name: '로그 관리',
      path: invalidPage,
      icon: Postcard,
    },
    {
      code: 'S9004',
      name: '경매 로그',
      path: extraServiceAuctionLog,
    },
    {
      code: 'S9005',
      name: '잭팟 로그',
      path: extraServiceJackpotLog,
    },
    {
      code: 'S9006',
      name: '테이블 게임 로그',
      path: extraServiceTableGameLog,
    },
    {
      code: 'S1201',
      name: '대기표 매장 관리',
      path: waitingServiceStoreList,
      icon: DocumentCopy,
    },
    {
      code: 'S1011',
      name: '알레르기 관리',
      path: allergyManage,
      icon: WarnTriangleFilled,
      index: '54',
    },
  ];

  // ③ 페이지 생성 시 추가
  /** 모든 권한 페이지 리스트 */
  const totalPageList = [
    {
      value: 'home',
      label: '메인',
    },
    {
      value: 'login',
      label: '로그인',
    },
    {
      value: 'invalidPage',
      label: '유효하지 않은 페이지',
    },
    {
      value: 'myPage',
      label: '마이 페이지',
    },
    {
      value: 'cSInquiryBoard',
      label: '문의게시판 목록',
    },
    {
      value: 'cSInquiryRegister',
      label: '문의게시판 문의 등록/수정',
    },
    {
      value: 'cSInquiryDashBoard',
      label: '관리자용 통계',
    },
    {
      value: 'singleStoreSetting',
      label: '매장리스트',
    },
    {
      value: 'storeManage',
      label: '매장 설정',
    },
    {
      value: 'customThemeManage',
      label: '커스텀 설정',
    },
    {
      value: 'categorizeManageTablet',
      label: '분류 설정 (구)',
    },
    {
      value: 'categorizeManageTabletV2',
      label: '분류 설정',
    },
    {
      value: 'goodsDetailSettingInCategory',
      label: '상품 상세 설정 (구)',
    },
    {
      value: 'goodsDetailSettingInCategoryV2',
      label: '상품 상세 설정',
    },
    {
      value: 'categorizeManageSchedule',
      label: '분류 스케줄 설정',
    },
    {
      value: 'categorizeProduct',
      label: '분류 내 상품 넣기',
    },
    {
      value: 'productManage',
      label: '상품 현황',
    },
    {
      value: 'bannerManage',
      label: '배너 설정',
    },
    {
      value: 'tableManage',
      label: '테이블 관리',
    },
    {
      value: 'languageManage',
      label: '언어 설정',
    },
    {
      value: 'productImageManage',
      label: '상품 이미지 일괄 수정',
    },
    {
      value: 'webUrlManage',
      label: '오더 태블릿 버전 설정',
    },
    {
      value: 'masterUrlManage',
      label: '마스터 태블릿 버전 설정',
    },
    {
      value: 'languageInternationalization',
      label: 'S3 언어 국제화 설정',
    },
    {
      value: 'prepaymentTableInfo',
      label: '선결제 테이블 정보',
    },
    {
      value: 'fCMDeviceManagement',
      label: 'FCM 기기관리',
    },
    {
      value: 'storeStatistics',
      label: '매장별 통계',
    },
    {
      value: 'giftQuantityStock',
      label: '경품 수량 재고(실시간)',
    },
    {
      value: 'eventStockCondition',
      label: '이벤트 경품 재고 현황',
    },
    {
      value: 'agencyStatisticsData',
      label: '이벤트 통계',
    },
    {
      value: 'allStoreAlcoholStatistics',
      label: '모든 매장 주류 통계',
    },
    {
      value: 'eventStoreAlcoholStatistics',
      label: '이벤트 참여매장 주류 통계',
    },
    {
      value: 'eventParticipantsInfo',
      label: '이벤트 참여자 정보',
    },
    {
      value: 'promotionEventList',
      label: '프로모션 이벤트 목록',
    },
    {
      value: 'promotionEventRegister',
      label: '프로모션 이벤트 등록',
    },
    {
      value: 'promotionEventRemove',
      label: '프로모션 이벤트 해제',
    },
    {
      value: 'promotionEventInfo',
      label: '프로모션 이벤트 정보',
    },
    {
      value: 'noticeBoard',
      label: '공지사항 목록',
    },
    {
      value: 'noticeBoardDetail',
      label: '새 공지사항 등록 / 수정',
    },
    {
      value: 'dailyOrderStatistics',
      label: '일별 주문 건수 목록',
    },
    {
      value: 'torderMap',
      label: '티오더 설치 매장 지도',
    },
    {
      value: 'memberRegisterManageList',
      label: '통합 인증 승인 관리',
    },
    {
      value: 'memberRegisterManageDetail',
      label: '통합 인증 승인 관리 상세',
    },
    {
      value: 'totalMemberShipManage',
      label: '회원 관리',
    },
    {
      value: 'businessMemberShipManage',
      label: '비즈니스 회원 관리',
    },
    {
      value: 'authManage',
      label: '권한 관리',
    },
    {
      value: 'logTabletPos',
      label: '태블릿 요청 로그',
    },
    {
      value: 'logTabletOrder',
      label: 'Log Tablet Order',
    },
    {
      value: 'logOrderViewTodayRedis',
      label: '태블릿 당일 주문',
    },
    {
      value: 'logOrderViewRedis',
      label: '태블릿 주문내역',
    },
    {
      value: 'logOrderCart',
      label: '완료 주문내역',
    },
    {
      value: 'remakePaymentAppLogs',
      label: '선결제 앱 로그 조회(리메이크)',
    },
    {
      value: 'remakePaymentWebLogs',
      label: '선결제 웹 로그 조회(리메이크)',
    },
    {
      value: 'sendFCMLogs',
      label: 'FCM 전송 로그',
    },
    {
      value: 'categoryTemplateManage',
      label: '분류 템플릿 관리하기',
    },
    {
      value: 'extraServiceManage',
      label: '부가서비스 관리',
    },
    {
      value: 'detailExtraServiceManage',
      label: '부가서비스 상세 설정',
    },
    {
      value: 'extraServiceAuctionLog',
      label: '경매 로그',
    },
    {
      value: 'extraServiceJackpotLog',
      label: '잭팟 로그',
    },
    {
      value: 'extraServiceTableGameLog',
      label: '테이블 게임 로그',
    },
    {
      value: 'extraServiceGameSetting',
      label: '게임 설정',
    },
    {
      value: 'waitingServiceStoreList',
      label: '대기표 매장 관리',
    },
    {
      value: 'waitingServiceStoreEnroll',
      label: '대기표 매장 등록',
    },
    {
      value: 'allergyManage',
      label: '알레르기 관리',
    },
  ];

  /** 모든 기능 리스트 */
  const totalFunctionList = [
    {
      value: 'F1001',
      label: '매장리스트 - 매장 추가',
    },
    {
      value: 'F1002',
      label: '매장리스트 - 어드민 ID 등록',
    },
    {
      value: 'F1003',
      label: '매장리스트 - 매장 설정',
    },
    {
      value: 'F1004',
      label: '매장리스트 - 커스텀 설정',
    },
    {
      value: 'F1005',
      label: '매장리스트 - 분류 설정',
    },
    {
      value: 'F1006',
      label: '매장리스트 - 분류 스케줄 설정',
    },
    {
      value: 'F1007',
      label: '매장리스트 - 분류 내 상품 넣기',
    },
    {
      value: 'F1009',
      label: '매장리스트 - 상품 현황',
    },
    {
      value: 'F1010',
      label: '매장리스트 - 배너 설정',
    },
    {
      value: 'F1011',
      label: '매장리스트 - 테이블 관리',
    },
    {
      value: 'F1012',
      label: '매장리스트 - 언어 설정',
    },
    {
      value: 'F1013',
      label: '매장리스트 - 엑셀 다운로드',
    },
    {
      value: 'F2001',
      label: '언어 번역 - 상품 리스트 - 전체 번역하기',
    },
    {
      value: 'F2002',
      label: '언어 번역 - 상품 리스트 - 엑셀 업로드/다운로드',
    },
    // 단축 이름 사용 XXX Function value 기록을 위해 주석으로 남겨둠.
    // {
    //   value: 'F2003',
    //   label: '언어 번역 - 단축 상품 이름 - 엑셀 업로드/다운로드',
    // },
    {
      value: 'F2004',
      label: '언어 번역 - 분류 리스트 - 엑셀 업로드/다운로드',
    },
    {
      value: 'F2005',
      label: '언어 번역 - 상세설명 리스트 - 엑셀 업로드/다운로드',
    },
    {
      value: 'F2006',
      label: '언어 번역 - 옵션 그룹 & 상품리스트 - 옵션그룹 일괄변경',
    },
    {
      value: 'F2007',
      label: '언어 번역 - 옵션 그룹 & 상품리스트 - 엑셀 업로드/다운로드',
    },
    {
      value: 'F2008',
      label: '언어 번역 - 2단 옵션 그룹 리스트 - 엑셀 업로드/다운로드',
    },
    {
      value: 'F2009',
      label: '언어 번역 - 2단 옵션 상품 리스트 - 엑셀 업로드/다운로드',
    },
    {
      value: 'F3001',
      label: '매장 설정 - 태블릿 새로고침',
    },
    {
      value: 'F3002',
      label: "상점 설정 - '리뷰 서비스 사용여부' 활성화",
    },
    {
      value: 'F3003',
      label: "매장 설정 - '매장명,지점명' 활성화",
    },
    {
      value: 'F4001',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 추천',
    },
    {
      value: 'F4002',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 히트',
    },
    {
      value: 'F4003',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 세일',
    },
    {
      value: 'F4004',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 베스트',
    },
    {
      value: 'F4005',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 신규',
    },
    {
      value: 'F4006',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 비건',
    },
    {
      value: 'F4007',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 스파이시',
    },
    {
      value: 'F4008',
      label: '상품 현황 - 상품 스티커 일괄 제어 - 시그니처',
    },
    {
      value: 'F4009',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 판매 중지',
    },
    {
      value: 'F4010',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 품절',
    },
    {
      value: 'F4011',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 주방 마감',
    },
    {
      value: 'F4012',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 주문서 표기',
    },
    {
      value: 'F4013',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 주문 가능',
    },
    {
      value: 'F4014',
      label: '상품 현황 - 판매 • 광고 일괄 제어 - 광고 적용',
    },
    {
      value: 'F5001',
      label: '비즈니스 회원 관리 - 점주 어드민 이동',
    },
    {
      value: 'F6001',
      label: '마이페이지 - 실험실 기능 이동',
    },
    {
      value: 'F7001',
      label: '테이블 관리 - 테이블 등록/삭제',
    },
    {
      value: 'F7002',
      label: '테이블 관리 - 테이블 설정',
    },
    {
      value: 'F8001',
      label: '태블릿 버전 설정 - URL 기준 티오더 WEB URL 설정',
    },
    {
      value: 'F8002',
      label: '태블릿 버전 설정 - 티오더 태블릿 테마 적용 현황',
    },
    {
      value: 'F8003',
      label: '태블릿 버전 설정 - 태블릿 버전 일괄 업데이트',
    },
  ];

  /** lnb list 데이터 */
  const authLnbListData: Ref<authPageTreeType[]> = ref([]);

  /** 접근 권한 가능 페이지 */
  const accessAuthPageData: Ref<string[]> = ref([]);

  /** 접근 권한 가능 페이지 */
  const accessAuthFunctionData: Ref<string[]> = ref([]);

  /** lnb list 저장 */
  const setAuthLnbList = (lnb: authPageTreeType[]) => {
    authLnbListData.value = lnb;
  };

  /** 접근 권한 페이지 저장 */
  const setAccessAuthPageList = (pageList: string[]) => {
    accessAuthPageData.value = pageList;
  };

  /** 접근 권한 페이지 저장 */
  const setAccessFunctionList = (functionList: string[]) => {
    accessAuthFunctionData.value = functionList;
  };

  /** lnb 데이터 가져오기 */
  const getOriginLnbData = (code: string) => {
    const target = originLnbData.find((lnb) => lnb.code === code);
    const defaultInvalidPage = {
      code: 'M9999',
      name: '유효하지 않은 페이지',
      path: invalidPage,
      query: {},
      icon: Close,
      flag: false,
      child: [],
    };
    if (!target) {
      return defaultInvalidPage;
    }

    return target;
  };

  /** 데이터 리셋 */
  const resetAuthData = () => {
    authLnbListData.value = [];
    accessAuthPageData.value = [];
    accessAuthFunctionData.value = [];
  };

  // 로컬 스토리지 lnb 데이터 저장
  const localCacheAuthLnb = useStorage('lnb', authLnbListData, localStorage);

  // 로컬 스토리지 권한 페이지 데이터 저장
  const localCacheAuthPages = useStorage(
    'pages',
    accessAuthPageData,
    localStorage,
  );

  // 로컬 스토리지 권한 페이지 데이터 저장
  const localCacheAuthFunction = useStorage(
    'function',
    accessAuthFunctionData,
    localStorage,
  );

  return {
    originLnbTree,
    originLnbData,
    totalPageList,
    accessAuthPageData,
    setAccessAuthPageList,
    authLnbListData,
    getOriginLnbData,
    setAuthLnbList,
    resetAuthData,
    localCacheAuthLnb,
    localCacheAuthPages,
    totalFunctionList,
    accessAuthFunctionData,
    setAccessFunctionList,
    localCacheAuthFunction,
  };
});

export default useAuthStore;
