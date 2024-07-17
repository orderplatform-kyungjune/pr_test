export interface s3GlobalizationLanguageJsonType {
  [index: string]: string;
}

export interface s3GlobalizationLanguageObjectType {
  lang: string;
  json: any;

  [index: string]: string;
}

export interface tableLanguageType {
  key: string;
  value: string;
}

export type elMessageBoxType = '' | 'success' | 'warning' | 'info' | 'error';

export interface languageType {
  [index: string]: string;
}

export interface successMessageType {
  title: string;
  content: string;
}

export interface errorMessageType {
  title: string;
  content: string;
}

export interface translateModalPropsType {
  type: string;
  code: string;
  display_name: string;
  pos_name: string;
}

export interface requestOptionPriceTranslateOptionType {
  option_1: string;
  option_2: string;
}

export interface translateArrayType {
  ko: string;
  en: string;
  jp: string;
  zh_hans: string;
  zh_hant: string;
}
