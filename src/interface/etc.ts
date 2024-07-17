export interface authInfoType {
  type: string;
  value: string;
}

export interface FileExtensionCheckType {
  currentExtension: string;
  allowExtensions: string[];
}

export interface PostExcelFileUploadResponseType {
  result: boolean;
  code: number;
  upload_cnt?: number;
  msg?: string;
}

export interface OnErrorParams {
  status?: number;
  message?: string;
}

export interface PostExcelFileUploadType {
  file: File;
  onSuccess: (response: PostExcelFileUploadResponseType) => void;
  onError: ({ status, message }: OnErrorParams) => void;
}

export interface SetFormDataParamsType {
  object: { [key: string]: any };
}

export interface fileDownloadType {
  file: Blob;
  name: string;
}
