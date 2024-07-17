export interface getTemplateStoreInfoType {
  type: string;
  getStoreCode: string;
}

export interface storeTemplateResInfoType {
  big_cnt: number;
  child_cnt: number;
  goods_cnt: number;
}

export interface storeTemplateChildCategoryGoodListType {
  goodCode: string;
  goodDpName: string;
  goodImage: string;
  goodName: string;
  goodPrice: number;
  posGoodCode: string;
}

export interface storeTemplateChildCategoryListType {
  childCategoryGoodCount: number;
  childCategoryGoodList: storeTemplateChildCategoryGoodListType[];
  childCategoryName: string;
}

export interface storeTemplateResListType {
  categoryName: string;
  childCategoryList: storeTemplateChildCategoryListType[];
}
export interface storeTemplateDataType {
  info: storeTemplateResInfoType;
  list: storeTemplateResListType[];
}

export interface templateMappingInfoType {
  categoryType: string;
  getStoreCode: string;
  setStoreCode: string;
}

export interface storeMappingResInfoType {
  goods_cnt: number;
  false_cnt: number;
  true_cnt: number;
}

export interface storeMappingResListType {
  goodCode: string;
  posGoodCode: string;
  goodName: string;
  goodPrice: number;
  goodsExists: string;
  goodsCount: number;
  categoryName: string;
  categoryExists: string;
  categoryCount: number;
  childCategoryName: string;
  childCategoryExists: string;
  childCategoryCount: number;
  exists: string;
}

export interface storesMappingDataType {
  info: storeMappingResInfoType;
  list: storeMappingResListType[];
}

export interface restoreSaveInfoType {
  getStoreCode: string;
  historyTime: string;
}

export interface responseStoreListItemType {
  label: string;
  value: string;
  api_type: string;
}

export interface storeSearchItemType {
  value: string;
  storeCode: string;
  apiType: string;
}
