export interface iDefineReports {
  value: string;
  name: string;
  type: string;
}

export type iTypeError = Array<string | iDefineReports>;
