export interface requestAllergyListParamType {
  page: number;
  view_type: string;
  use_yn: string;
  searchStartDate: string;
  searchEndDate: string;
  searchTxt: string;
}

export interface requestUpdateAllergyStatusType {
  use_yn: string;
  ids: number[];
}

export interface requestAddAllergyType {
  name: string;
  content?: string;
  use_yn: string;
  view_type: string;
  image?: any;
}

export interface requestUpdateAllergyType {
  id: number;
  name: string;
  content?: string;
  use_yn: string;
  view_type: string;
  image?: any;
  image_delete_yn?: string;
}

export interface allergyListItemType {
  id: number;
  name: string;
  content: string;
  image_url: string;
  view_type: string;
  use_yn: string;
  good_count: number;
  sort_number: number;
  created_user?: string;
  updated_user?: string;
  updated_at?: string;
  created_at?: string;
}
