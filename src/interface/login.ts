/* eslint-disable @typescript-eslint/no-explicit-any */
export interface requestLoginParameterType {
  id: string;
  password: string;
}

export interface authDataType {
  code?: string;
  name?: string;
  path?: string;
  query?: any;
  icon?: any;
  index?: string;
}

export interface menuStructureType {
  code: string;
  menu_list: {
    code: string;
    menu_list: {
      code: string;
      menu_list: {
        code: string;
        menu_list: string[];
      }[];
    }[];
  }[];
}
