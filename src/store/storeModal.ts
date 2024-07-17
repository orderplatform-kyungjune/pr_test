import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { modalDataType, modalType } from '@interface/modal';
import { MODAL } from '@common/string';

const useModalStore = defineStore(MODAL, () => {
  const flag = reactive<modalType>({
    addProduct: false,
    editProduct: false,
    addCategory: false,
    arrangeProductOrder: false,
    addStore: false,
    addBanner: false,
    deleteCategory: false,
    editAllProduct: false,
    addLanguage: false,
    addOrderOneOptionGroup: false,
    addOrderTwoOptionGroup: false,
    deleteOptionGroup: false,
    importOptionGroup: false,
    updateOrderOneOptionMenu: false,
    updateOrderTwoOptionMenu: false,
    arrangeOrderOneOptionGroup: false,
    arrangeOrderTwoOptionGroup: false,
    paymentSetting: false,
    settingCategory: false,
    addAllCategory: false,
    arrangeTotalCategory: false,
    arrangeCategoryProduct: false,
    arrangeProduct: false,
    languageTranslate: false,
    editWebUrl: false,
    editMasterUrl: false,
    refreshTablet: false,
    optionTranslate: false,
    editNoticeStoreList: false,
    detailViewCount: false,
    eventForceWin: false,
    addPromotionEvent: false,
    excelUploadAndDownload: false,
    s3LanguageTranslate: false,
    addMemberShip: false,
    templateRestore: false,
    optionGroupAllTranslation: false,
    optionMenuAllTranslation: false,
    detailTotalMemberShip: false,
    updatePassword: false,
    airTableDataList: false,
    updateUrlSetting: false,
    extraServiceBulkChange: false,
    auctionSchedule: false,
    inquiryDetailTableGame: false,
    tableGameGiftSettingInfo: false,
    tableGameDetailSetting: false,
    tableGameItemDetailSetting: false,
    scheduleChangeHistory: false,
    jackpotSchedule: false,
    doubleLanguageTranslate: false,
    extraServiceSettingHistory: false,
    detailBusinessMemberShip: false,
    gameRestrictionSetting: false,
    storeManage: false,
    allergyDetail: false,
    memberRegisterDetail: false,
    memberRegisterHistory: false,
  });

  const modalData = reactive<modalDataType>({
    editProduct: {},
    addCategory: {},
    arrangeProductOrder: {},
    languageTranslate: {},
    paymentSetting: {},
    optionTranslate: {},
    eventForceWin: {},
    excelUploadAndDownload: {},
    s3LanguageTranslate: {},
    detailTotalMemberShip: {},
    inquiryDetailTableGame: {},
    tableGameDetailSetting: {},
    auctionSchedule: {},
    jackpotSchedule: {},
    doubleLanguageTranslate: {},
    detailBusinessMemberShip: {},
    gameRestrictionSetting: {},
    storeManage: {},
    allergyDetail: {},
    memberRegisterDetail: {},
    memberRegisterHistory: {},
  });

  const openModal = (key: string) => {
    flag[key] = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModalWithData = (key: string, target: any) => {
    flag[key] = true;
    modalData[key] = target;
  };

  const closeModal = (key: string) => {
    flag[key] = false;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const closeModalWithData = (key: string, target: any) => {
    flag[key] = false;
    modalData[key] = target;
  };

  const toggleModal = (key: string) => {
    const isFlagKey = flag[key] === true;

    if (isFlagKey) {
      closeModal(key);
    } else {
      openModal(key);
    }
  };

  return {
    flag,
    modalData,
    openModal,
    openModalWithData,
    closeModal,
    closeModalWithData,
    toggleModal,
  };
});

export default useModalStore;
