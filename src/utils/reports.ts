import { PathReporter } from 'io-ts/lib/PathReporter';
import { Validation } from 'io-ts';
import { iTypeError } from '@interface/reports';

export const getTypeError = (errors: Validation<unknown>): iTypeError => {
  const reports = PathReporter.report(errors);

  const defineReports = reports.map((report) => {
    // io-ts에서 밷는 에러 메세지 형태 1차 가공
    const reg =
      /(?<=Invalid value (\\")?).*(?=(\\")? supplied to)|(?=\}\/).*$/g;
    const matchReport = report.match(reg);

    // 매칭 되는게 없으면 io-ts 에러 메세지 리턴
    if (matchReport === null) {
      return report;
    }

    // 더블 쿼터 제거
    const uncoverQuotesReportStrArr = matchReport.map((errStr) => {
      const removeDoubleQuotes = errStr.replaceAll('"', '');
      return removeDoubleQuotes;
    });

    // 틀린 프로퍼티명과 타입 문자열만 남기게
    const lastIndex = uncoverQuotesReportStrArr.length - 1;
    const treeShakingReport = uncoverQuotesReportStrArr[lastIndex].split('}/');

    const lastPropertyNameWithTypeIndex = treeShakingReport.length - 1;
    const propertyNameWithType =
      treeShakingReport[lastPropertyNameWithTypeIndex];

    uncoverQuotesReportStrArr[lastIndex] = propertyNameWithType;

    // 어떤 값이 들어와 틀린 속성명과 기존 타입 알려주는 구조체 생성
    const reportProperty = uncoverQuotesReportStrArr.reduce(
      (acc, cur, curIdx) => {
        if (curIdx === 0) {
          acc.value = cur;
        }

        if (curIdx === 1) {
          const typePropertyArr = cur.split(':');
          const name = typePropertyArr[0];
          const type = typePropertyArr[1].trim();

          acc.name = name;
          acc.type = type;
        }
        return acc;
      },
      {
        value: '',
        name: '',
        type: '',
      },
    );

    return reportProperty;
  });

  return defineReports;
};

export default { getTypeError };
