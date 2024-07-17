<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed, Ref, ref } from 'vue';
import { dayjs, ElMessage } from 'element-plus';
import { AxiosResponse } from 'axios';
import { dateFormatterUtil, etcUtils } from '@utils';
import {
  deviceUsageBatteryType,
  tabletInfoTypeA,
  tabletInfoTypeB,
} from '@interface/table';
import {
  MoreFilled,
  QuestionFilled,
  Refresh,
  RefreshRight,
  Search,
} from '@element-plus/icons-vue';
import { tablet } from '@apis';

const route = useRoute();

const { requestTabletInfoList } = tablet;
const { convertServerTimeToKorea } = dateFormatterUtil;
const { replaceEmptyString } = etcUtils;

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
const dataDetail = {
  battery: {
    status: ['UNKNOWN', 'CHARGING', 'DISCHARGING', 'NOT_CHARGING', 'FULL'],
    health: [
      'GOOD',
      'CHARGING',
      'OVERHEAT',
      'DEAD',
      'OVER_VOLTAGE',
      'UNSPECIFIED_FAILURE',
      'COLD',
    ],
    plugged: ['AC', 'USB', 'WIRELESS'],
  },
};
const loading = ref(false);

const storeCode: string = route.query.code as string;
const standardTabletVersion: Ref<string> = ref('');
const displayTabletInfoList: Ref<any[]> = ref([]);
const originTabletInfoList: Ref<(tabletInfoTypeA | tabletInfoTypeB)[]> = ref(
  [],
);
const beforeTabletInfoList: Ref<(tabletInfoTypeA | tabletInfoTypeB)[]> = ref(
  [],
);

/** 테이블명 검색 */
const searchTxt = ref('');
const filterBySearchTxt = () => {
  displayTabletInfoList.value = originTabletInfoList.value.filter(
    (tabletItem) => tabletItem.tableName?.includes(searchTxt.value),
  );
};
const resetSearched = () => {
  searchTxt.value = '';
  displayTabletInfoList.value = originTabletInfoList.value;
};

/** 태블릿 데이터 재구성 (노션문서 참고)
 * 데이터 종류 총 3가지 이지만 v2,v3를 typeB로 통합
 *  - v1: app 1.5.xx 버전    => typeA
 *  - v2: app 1.6.6 이하 버전 => typeB
 *  - v3: app 1.6.7 버전     => typeB
 * tabletInfoType으로 재구성 : tableName/ defaultInfo/ deviceUsage / network
 */
const getDataType = (data: any) => {
  const keyList = Object.keys(data);
  if (
    keyList.includes('network') ||
    keyList.includes('ssaid') ||
    keyList.includes('sw') ||
    keyList.includes('os')
  ) {
    return 'typeB';
  }
  return 'typeA';
};

const getTableName = (tableFullCode: string) => {
  if (tableFullCode?.split(`${storeCode}_`)[1]) {
    return decodeURIComponent(tableFullCode?.split(`${storeCode}_`)[1]);
  }
  return '테이블 정보 없음';
};

const convertTimestampToKr = (timestamp: number) => {
  const dateTime = new Date(timestamp);
  dateTime.setHours(dateTime.getHours() + 9); // kst +9:00
  return dateTime.toISOString().replace('T', ' ').substring(0, 19);
};

const filterStableData = (info: any) => {
  const key = Object.keys(info)[0];
  if (Object.keys(info[key]).length === 0) return;

  /** 데이터 재구성 */
  const tableName = getTableName(key);
  const deviceUsage = info[key]?.deviceUsage;
  const type = getDataType(deviceUsage);

  const copied = { ...info[key] };
  delete copied.storeCode;
  delete copied.tableCode;
  delete copied.deviceUsage;
  const defaultInfo = copied;

  let network;
  // typeA 데이터 재구성
  if (type === 'typeA') {
    network = { ...deviceUsage.wifi };
    network.MACAddr = defaultInfo.MACAddr;
    delete deviceUsage.wifi;
    deviceUsage.time = convertTimestampToKr(deviceUsage.time as number);
  }
  // typeB 데이터 재구성
  if (type === 'typeB') {
    network = { ...deviceUsage.network };
    network.MACAddr = defaultInfo.MACAddr
      ? defaultInfo.MACAddr
      : deviceUsage.network?.macAddress;
    delete deviceUsage.network;

    // v2->v3
    if (deviceUsage.app?.versionName) {
      deviceUsage.app.name = deviceUsage.app.versionName;
      delete deviceUsage.app.versionName;
    }
    if (deviceUsage.app?.versionCode) {
      deviceUsage.app.code = deviceUsage.app.versionCode;
      delete deviceUsage.app.versionCode;
    }
    if (deviceUsage.os) {
      deviceUsage.sw = deviceUsage.os;
      delete deviceUsage.os;
    }
  }

  // typeA, typeB 동시 적용
  defaultInfo.lastUpdate = convertServerTimeToKorea(
    `${defaultInfo.lastUpdate}Z`,
  );
  delete defaultInfo.MACAddr;
  delete defaultInfo.path;

  const tabletData = {
    type,
    tableName,
    defaultInfo,
    deviceUsage,
    network,
  };

  /** 티오더1<->2 전환 시 테이블 중복 방어 로직 */
  const sameTable = originTabletInfoList.value?.find(
    (tableInList) => tableInList.tableName === tabletData.tableName,
  );

  // 이미 추가된 정보가 최신 정보인 경우: 배열에 추가 X
  if (
    sameTable &&
    sameTable.defaultInfo.lastUpdate > tabletData.defaultInfo.lastUpdate
  ) {
    return;
  }

  if (
    sameTable &&
    sameTable.defaultInfo.lastUpdate <= tabletData.defaultInfo.lastUpdate
  ) {
    const sameTableIndex = originTabletInfoList.value?.findIndex(
      (tableInList) => tableInList.tableName === tabletData.tableName,
    );
    originTabletInfoList.value?.splice(sameTableIndex, 1);
  }
  originTabletInfoList.value.push(tabletData);
};

const mismatchedVersionList = computed(() =>
  originTabletInfoList.value?.reduce((accumulator: string[], tableInfo) => {
    // @ts-ignore
    if (
      tableInfo.type === 'typeA' &&
      tableInfo.deviceUsage?.version !== standardTabletVersion.value
    ) {
      accumulator.push(tableInfo.tableName);
    }
    if (tableInfo.type === 'typeB') {
      // @ts-ignore
      if (
        tableInfo.deviceUsage?.app?.versionName &&
        tableInfo.deviceUsage.app?.versionName !== standardTabletVersion.value
      ) {
        // v2
        accumulator.push(tableInfo.tableName);
      }
      // @ts-ignore
      if (
        tableInfo.deviceUsage?.app?.name &&
        tableInfo.deviceUsage.app.name !== standardTabletVersion.value
      ) {
        // v3
        accumulator.push(tableInfo.tableName);
      }
    }
    return accumulator;
  }, []),
);

/** 태블릿 리스트 api 호출 */
const getTabletList = async () => {
  try {
    loading.value = true;
    const res = (await requestTabletInfoList(storeCode)) as AxiosResponse;

    if (!res.data.result) {
      ElMessage({
        type: 'error',
        message: `${res.data.msg}(code: ${res.data.code})`,
      });
    }
    if (res.data.result) {
      const tabletInfos = res.data.data.deviceUsageList;
      standardTabletVersion.value = res.data.data.standardAppVersion;
      tabletInfos?.forEach(filterStableData);
      originTabletInfoList.value?.sort((a, b) =>
        a.tableName?.localeCompare(b?.tableName),
      );
      displayTabletInfoList.value = originTabletInfoList.value;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

/** 새로고침 시 macAddr 변경 체크 */
const isMatchMacAddr = (tabletCode: string) => {
  const beforeInfo = beforeTabletInfoList.value.find(
    (tableDataBefore) => tableDataBefore.defaultInfo.tableCode === tabletCode,
  );
  const nowInfo = beforeTabletInfoList.value.find(
    (tableDataAfter) => tableDataAfter.defaultInfo.tableCode === tabletCode,
  );
  return beforeInfo?.network.MACAddr === nowInfo?.network.MACAddr;
};

const reloadTabletInfo = () => {
  beforeTabletInfoList.value = originTabletInfoList.value;
  originTabletInfoList.value.splice(0, originTabletInfoList.value.length);
  displayTabletInfoList.value.splice(0, displayTabletInfoList.value.length);
  getTabletList();
};

/** v-for 방어 */
const getTabletKey = (tabletId: string, index: number) =>
  tabletId ? `${tabletId}_${index}` : `tablet_${index}`;
const getMismatchedTabletKey = (tableName: string, index: number) =>
  tableName
    ? `mismatch_table_${tableName}_${index}`
    : `mismatch_table_${index}`;
const getDataDetailKey = (type: string, key: string, index: number) =>
  type ? `detail_${type}_${key}_${index}` : `detail_${key}_${index}`;

/** 각 데이터 단위 추가 */
const addUnit = (dataType: string, value: any) => {
  if (!dataType || !value) return '-';
  if (dataType === 'memory') return `${value} MB`;
  if (dataType === 'ms') return `${value} ms`;
  if (dataType === 'speed') return `${value} Mbps`;
  if (dataType === 'frequency') return `${value / 1000} GHz`;
  if (dataType === 'nwStrength') return `${value} dBm`;
  if (dataType === 'nwStrength') return `${value} dBm`;
  if (dataType === 'tryCount') return `${value} 회`;
  if (dataType === 'percent') return `${value} %`;
  return '';
};

/** 배터리 상태값 명시 */
const getBatteryInfo = (
  batteryData: deviceUsageBatteryType,
  dataKey: string,
) => {
  if (dataKey === 'status') {
    if (batteryData.status === 1) return 'UNKNOWN';
    if (batteryData.status === 2) return 'CHARGING';
    if (batteryData.status === 3) return 'DISCHARGING';
    if (batteryData.status === 4) return 'NOT_CHARGING';
    if (batteryData.status === 5) return 'FULL';
  }
  if (dataKey === 'health') {
    if (batteryData.health === 1) return 'UNKNOWN';
    if (batteryData.health === 2) return 'GOOD';
    if (batteryData.health === 3) return 'OVERHEAT';
    if (batteryData.health === 4) return 'DEAD';
    if (batteryData.health === 5) return 'OVER_VOLTAGE';
    if (batteryData.health === 6) return 'UNSPECIFIED_FAILURE';
    if (batteryData.health === 7) return 'COLD';
  }
  if (dataKey === 'plugged') {
    if (batteryData.plugged === 1) return 'AC';
    if (batteryData.plugged === 2) return 'USB';
    if (batteryData.plugged === 4) return 'WIRELESS';
  }
  if (dataKey === 'capacity') {
    return `${batteryData.capacity} %`;
  }
  return '';
};

const resolveArrayValues = (targetArr: any[], unit?: string) => {
  if (!targetArr || !Array.isArray(targetArr)) return '-';
  if (unit) {
    return targetArr
      .map((item: string | number) => `${item} ${unit}`)
      .join(', ');
  }
  return targetArr.join(', ');
};

/** 네트워크 정보 */
const classifyNwStrength = (nwStrength: number) => {
  if (nwStrength > -50) return '최상';
  if (nwStrength > -70) return '정상';
  if (nwStrength > -80) return '불안정';
  return '위험';
};

const getNwStrengthStyle = (strength: number) => ({
  'wifi-img mr-5': true,
  'wifi-strength-good': strength > -50,
  'wifi-strength-normal': strength <= -50 && strength > -70,
  'wifi-strength-warning': strength <= -70 && strength > -80,
  'wifi-strength-danger': strength < -80,
});

const getNetworkConnectedStatus = (isConnected?: boolean) => {
  if (isConnected === undefined) return '-';
  return isConnected ? '연결' : '미연결';
};

const getMacAddrMatchStyle = (tableCode: string) =>
  !isMatchMacAddr(tableCode) ? 'cell-background-red' : '';

const getAppVersionMatchStyle = (version: string) => ({
  'device-usage-desc': true,
  'cell-background-yellow': version !== standardTabletVersion.value,
});

const getLastUpdateStyle = (lastUpdate: string) => {
  const nowTime = dayjs();
  const lastUpdateTime = dayjs(lastUpdate);
  const timeDiff = nowTime.diff(lastUpdateTime, 'second');

  if (timeDiff > 3600) {
    return 'cell-background-red';
  }
  return '';
};

getTabletList();
</script>

<template>
  <div
    v-loading.lock="loading"
    :element-loading-spinner="svg"
    class="tablet-info-loading"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-text="태블릿 정보를 불러오는 중입니다.."
  ></div>
  <el-row
    align="middle"
    class="mb-10"
    justify="space-between"
  >
    <el-row align="middle">
      <div
        align="middle"
        class="app-version-wrap mr-10"
      >
        <el-text type="danger">
          기준 버전 : {{ replaceEmptyString(standardTabletVersion) }}
        </el-text>
        <el-divider direction="vertical" />
        <el-text class="ml-5 mr-5">
          버전 일치 :
          {{
            `${originTabletInfoList?.length - mismatchedVersionList?.length} / ${originTabletInfoList?.length}`
          }}
        </el-text>
        <el-divider direction="vertical" />
        <el-popover
          :width="100"
          placement="right"
          trigger="click"
        >
          <template #reference>
            <el-text>
              버전 불일치 :
              {{
                `${mismatchedVersionList?.length} / ${originTabletInfoList?.length}`
              }}
              <el-icon
                v-if="
                  originTabletInfoList?.length - mismatchedVersionList?.length >
                  0
                "
                class="icon-more"
              >
                <MoreFilled />
              </el-icon>
            </el-text>
          </template>
          <el-scrollbar
            :always="true"
            max-height="140px"
          >
            <div
              v-for="(tableName, index) in mismatchedVersionList"
              :key="getMismatchedTabletKey(tableName, index)"
              class="mismatched-list-item ml-10"
            >
              <el-text>
                {{ replaceEmptyString(tableName) }}
              </el-text>
            </div>
          </el-scrollbar>
        </el-popover>
      </div>
      <el-popover
        :width="550"
        placement="right"
        trigger="click"
      >
        <template #reference>
          <el-button :icon="QuestionFilled"> 정보 상세 </el-button>
        </template>
        <div>
          <p class="mb-5">배터리 정보</p>
          <el-row>
            <div class="font-thin">
              {{ `・ status (${dataDetail?.battery?.status?.length})` }}
              <p
                v-for="(info, index) in dataDetail?.battery?.status"
                :key="getDataDetailKey('status', info, index)"
                class="ml-10"
              >
                - {{ info }}
              </p>
            </div>
            <div class="vertical-divide-line ml-10 mr-10"></div>
            <div class="font-thin">
              {{ `・ health (${dataDetail?.battery?.health?.length})` }}
              <p
                v-for="(info, index) in dataDetail?.battery?.health"
                :key="getDataDetailKey('health', info, index)"
                class="ml-10"
              >
                - {{ info }}
              </p>
            </div>
            <div class="vertical-divide-line ml-10 mr-10"></div>
            <div class="font-thin">
              {{ `・ plugged (${dataDetail?.battery?.plugged?.length})` }}
              <p
                v-for="(info, index) in dataDetail?.battery?.plugged"
                :key="getDataDetailKey('plugged', info, index)"
                class="ml-10"
              >
                - {{ info }}
              </p>
            </div>
          </el-row>
        </div>
        <el-row
          :gutter="20"
          justify="space-between"
        >
          <el-col :span="8">
            <p class="mb-5 mt-10">네트워크 세기 정보</p>
            <div class="font-thin">
              <p class="ml-10">
                - 50dbm 미만:
                <el-text style="color: #00d181"> 최상 </el-text>
              </p>
              <p class="ml-10">
                - 50dbm~70dbm:
                <el-text style="color: #008aff"> 정상 </el-text>
              </p>
              <p class="ml-10">
                - 70dbm~80dbm:
                <el-text style="color: #f59a23"> 불안정 </el-text>
              </p>
              <p class="ml-10">
                - 80dbm 이상:
                <el-text style="color: #d9001b"> 위험 </el-text>
              </p>
            </div>
          </el-col>
          <el-col :span="8">
            <div>
              <p class="mb-5 mt-10">최신 업데이트</p>
              <div class="font-thin">
                <el-text tag="p"> - 3600초 이내 </el-text>
                <el-text
                  style="backgroundcolor: #fab6b6"
                  tag="p"
                >
                  - 3600초 초과
                </el-text>
              </div>
            </div>
            <div>
              <p class="mb-5 mt-10">기준 버전 일치여부</p>
              <div class="font-thin">
                <el-text> - 버전 정보 일치 </el-text>
                <el-text
                  class="ml-10"
                  style="backgroundcolor: #f8e3c5"
                  tag="p"
                >
                  - 버전 정보 불일치
                </el-text>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <p class="mb-5 mt-10">
              MAC 주소
              <el-text
                class="font-thin"
                size="small"
                tag="p"
              >
                (맥주소 일치여부 / 태블릿 동일)
              </el-text>
            </p>
            <div class="font-thin">
              <el-text> - 일치 </el-text>
              <el-text
                class="ml-10"
                style="backgroundcolor: #fab6b6"
                tag="p"
              >
                - 불일치 확인 요망
              </el-text>
            </div>
          </el-col>
        </el-row>
      </el-popover>
    </el-row>
    <el-row>
      <el-row class="mr-20">
        <el-input
          v-model="searchTxt"
          :maxlength="30"
          autofocus
          class="mr-10 tablet-search-input"
          placeholder="검색어를 입력해주세요."
          @keyup.enter="filterBySearchTxt"
        />
        <el-button
          :icon="Search"
          round
          type="primary"
          @click="filterBySearchTxt"
        >
          검색
        </el-button>
        <el-button
          :icon="RefreshRight"
          round
          @click="resetSearched"
        >
          초기화
        </el-button>
      </el-row>
      <el-button
        type="info"
        @click="reloadTabletInfo"
      >
        <el-icon class="mr-5">
          <Refresh />
        </el-icon>
        태블릿 정보 새로고침
      </el-button>
    </el-row>
  </el-row>

  <el-row
    align="middle"
    justify="center"
  >
    <el-text
      v-if="originTabletInfoList?.length < 1 && !loading"
      class="mt-20"
      size="large"
    >
      태블릿 정보가 없습니다.
    </el-text>
    <el-text
      v-if="
        originTabletInfoList?.length > 0 &&
        displayTabletInfoList?.length < 1 &&
        !loading
      "
      class="mt-20"
      size="large"
    >
      검색 결과가 없습니다.
    </el-text>
  </el-row>
  <div class="card-wrap mt-10">
    <el-card
      v-for="(tabletInfo, tabletIndex) in displayTabletInfoList"
      :key="getTabletKey(tabletInfo.tableName, tabletIndex)"
      class="card-box"
      shadow="never"
    >
      <template #header>
        <el-text>
          {{ tabletInfo.tableName }}
        </el-text>
      </template>

      <!-- defaultInfo: typeA, typeB 공통 -->
      <el-descriptions
        :column="1"
        border
        class="table-wrap"
        title="태블릿 정보"
      >
        <el-descriptions-item label="사용자 에이전트">
          <p>
            {{ replaceEmptyString(tabletInfo.defaultInfo?.userAgent) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="화면 노출 URL">
          <p>
            {{ replaceEmptyString(tabletInfo.defaultInfo?.location) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="개발 설정 URL">
          <p>
            {{ replaceEmptyString(tabletInfo.deviceUsage?.homeUrl) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getLastUpdateStyle(tabletInfo.defaultInfo?.lastUpdate)"
          label="최신 업데이트"
        >
          <p>
            {{ replaceEmptyString(tabletInfo.defaultInfo?.lastUpdate) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="ip 정보">
          <p>
            {{ replaceEmptyString(tabletInfo.defaultInfo?.ip) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="uCode">
          <p>
            {{ replaceEmptyString(tabletInfo.defaultInfo?.uCode) }}
          </p>
        </el-descriptions-item>
      </el-descriptions>

      <!-- typeA - deviceUsage 기기 정보 -->
      <el-descriptions
        v-if="tabletInfo.type === 'typeA'"
        :column="1"
        border
        class="mt-20 table-wrap device-usage-desc"
        title="기기 정보"
      >
        <el-descriptions-item label="time">
          {{
            'time' in tabletInfo.deviceUsage
              ? replaceEmptyString(tabletInfo.deviceUsage.time)
              : '-'
          }}
        </el-descriptions-item>
        <el-descriptions-item label="배터리 용량">
          {{ replaceEmptyString(tabletInfo.deviceUsage?.battery) }}
        </el-descriptions-item>
        <el-descriptions-item label="태블릿 밝기">
          {{ replaceEmptyString(tabletInfo.deviceUsage?.bright) }}
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getAppVersionMatchStyle(tabletInfo.deviceUsage?.version)"
          label="버전 정보"
        >
          {{ tabletInfo.deviceUsage?.version }}
        </el-descriptions-item>
        <el-descriptions-item label="cpu 정보">
          {{ replaceEmptyString(tabletInfo.deviceUsage?.cpu) }}
        </el-descriptions-item>
        <el-descriptions-item label="gps 정보">
          <p>
            ・ latitude :
            {{ replaceEmptyString(tabletInfo.deviceUsage.gps?.latitude) }}
          </p>
          <p>
            ・ longitude :
            {{ replaceEmptyString(tabletInfo.deviceUsage.gps?.longtitude) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="ram 정보">
          <p>
            ・ total :
            {{ addUnit('memory', tabletInfo.deviceUsage.ram?.total) }}
          </p>
          <p>
            ・ app : {{ addUnit('memory', tabletInfo.deviceUsage.ram?.app) }}
          </p>
          <p>
            ・ used : {{ addUnit('memory', tabletInfo.deviceUsage.ram?.used) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="저장 용량">
          <p>
            ・ 사용 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.storage?.used) }}
          </p>
          <p>
            ・ 사용 가능한 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.storage?.free) }}
          </p>
        </el-descriptions-item>
      </el-descriptions>
      <!-- typeA - 네트워크 정보 -->
      <el-descriptions
        v-if="tabletInfo.type === 'typeA'"
        :column="1"
        border
        class="mt-20 table-wrap network-desc"
        title="네트워크 정보"
      >
        <el-descriptions-item label="네트워크 세기">
          <img
            :class="getNwStrengthStyle(tabletInfo.network?.strength as number)"
            alt="icon_wifi"
            src="@assets/icon_wifi.svg"
          />
          {{ classifyNwStrength(tabletInfo.network?.strength as number) }}
        </el-descriptions-item>
        <el-descriptions-item label="ssid 정보">
          {{ replaceEmptyString(tabletInfo.network?.ssid) }}
        </el-descriptions-item>
        <el-descriptions-item label="속도">
          {{ addUnit('speed', tabletInfo.network?.speed) }}
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getMacAddrMatchStyle(tabletInfo.tableName)"
          label="MAC 주소"
        >
          {{ addUnit('speed', tabletInfo.network?.MACAddr) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- typeB - deviceUsage 기기 정보 -->
      <el-descriptions
        v-if="tabletInfo.type === 'typeB'"
        :column="1"
        border
        class="mt-20 table-wrap device-usage-desc"
        title="기기 정보"
      >
        <el-descriptions-item>
          <template #label>
            <!-- <el-tooltip
              content=""
              placement="left"
            > -->
            ssaid
            <!-- </el-tooltip> -->
          </template>
          {{ replaceEmptyString(tabletInfo.deviceUsage?.ssaid) }}
        </el-descriptions-item>
        <el-descriptions-item label="app 정보">
          <p>
            ・ 앱 패키지명 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.app?.packageName) }}
          </p>
          <p :class="getAppVersionMatchStyle(tabletInfo.deviceUsage.app?.name)">
            ・ 버전명 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.app?.name) }}
          </p>
          <p>
            ・ 버전 코드 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.app?.code) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="메모리">
          <p>
            ・ 총 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.memory?.device) }}
          </p>
          <p>
            ・ 사용 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.memory?.usage) }}
          </p>
          <p>
            ・ 사용 가능한 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.memory?.free) }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="태블릿 하드웨어 정보">
          <p>
            ・ 제조 상품 브랜드명 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.hw?.brand) }}
          </p>
          <p>
            ・ 제조 모델명 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.hw?.model) }}
          </p>
          <p>
            ・ 하드웨어 정보 :
            {{ replaceEmptyString(tabletInfo.deviceUsage.hw?.hardware) }}
          </p>
          <!-- <el-tooltip
            content=""
            placement="left"
          > -->
          ・ 프로세서 지원 구조 버전:
          <!-- </el-tooltip> -->
          <span>
            {{
              resolveArrayValues(
                tabletInfo.deviceUsage.hw?.supportedABIs as string[],
              )
            }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="태블릿 운영체제 정보">
          <p>
            ・ 안드로이드 플랫폼 버전 : {{ tabletInfo.deviceUsage.sw?.code }}
          </p>
          <p>・ 안드로이드 API 수준 : {{ tabletInfo.deviceUsage.sw?.api }}</p>
          <p>・ 펌웨어 정보 : {{ tabletInfo.deviceUsage.sw?.buildNumber }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="배터리">
          <p>
            ・ status :
            {{ getBatteryInfo(tabletInfo.deviceUsage.battery, 'status') }}
          </p>
          <p>
            ・ health :
            {{ getBatteryInfo(tabletInfo.deviceUsage.battery, 'health') }}
          </p>
          <p>
            ・ plugged :
            {{ getBatteryInfo(tabletInfo.deviceUsage.battery, 'plugged') }}
          </p>
          <p>
            ・ capacity :
            {{ getBatteryInfo(tabletInfo.deviceUsage.battery, 'capacity') }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item label="저장 용량">
          <p>
            ・ 총 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.storage?.device) }}
          </p>
          <p>
            ・ 사용 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.storage?.usage) }}
          </p>
          <p>
            ・ 사용 가능한 크기 :
            {{ addUnit('memory', tabletInfo.deviceUsage.storage?.free) }}
          </p>
        </el-descriptions-item>
      </el-descriptions>
      <!-- typeB: network -->
      <el-descriptions
        v-if="tabletInfo.type === 'typeB'"
        :column="1"
        border
        class="mt-20 table-wrap network-desc"
        title="네트워크 정보"
      >
        <el-descriptions-item label="네트워크 세기">
          <img
            :class="getNwStrengthStyle(tabletInfo.network?.rssi)"
            alt="icon_wifi"
            src="@assets/icon_wifi.svg"
          />
          {{ classifyNwStrength(tabletInfo.network?.rssi) }}
        </el-descriptions-item>
        <el-descriptions-item label="ssid 정보">
          {{ replaceEmptyString(tabletInfo.network?.ssid) }}
        </el-descriptions-item>
        <el-descriptions-item label="와이파이 주파수">
          {{ addUnit('frequency', tabletInfo.network?.frequency) }}
        </el-descriptions-item>
        <el-descriptions-item label="지연시간">
          {{ addUnit('ms', tabletInfo.network?.latency) }}
        </el-descriptions-item>
        <el-descriptions-item label="인터넷 연결 여부">
          {{ getNetworkConnectedStatus(tabletInfo.network?.isConnected) }}
        </el-descriptions-item>
        <el-descriptions-item label="공유기 주소">
          {{ replaceEmptyString(tabletInfo.network?.gateway) }}
        </el-descriptions-item>
        <el-descriptions-item label="dns 주소">
          {{ replaceEmptyString(tabletInfo.network?.dns) }}
        </el-descriptions-item>
        <el-descriptions-item label="IPv4 주소">
          {{ replaceEmptyString(tabletInfo.network?.ipv4) }}
        </el-descriptions-item>
        <el-descriptions-item label="핑 테스트 결과">
          <p>
            <!-- <el-tooltip
              content=""
              placement="left"
            > -->
            ・ host :
            <!-- </el-tooltip> -->
            <span>
              {{ replaceEmptyString(tabletInfo.network?.connectivity?.host) }}
            </span>
          </p>
          <p>
            ・ loss :
            {{ addUnit('percent', tabletInfo.network?.connectivity?.loss) }}
          </p>
          <p>
            ・ pingResult :
            {{
              resolveArrayValues(
                tabletInfo.network?.connectivity?.pingResult as number[],
                'ms',
              )
            }}
          </p>
          <p>
            ・ received :
            {{
              addUnit('tryCount', tabletInfo.network?.connectivity?.received)
            }}
          </p>
          <p>
            ・ transmitted :
            {{
              addUnit('tryCount', tabletInfo.network?.connectivity?.transmitted)
            }}
          </p>
        </el-descriptions-item>
        <el-descriptions-item
          :class-name="getMacAddrMatchStyle(tabletInfo.tableName)"
          label="MAC 주소"
        >
          {{ replaceEmptyString(tabletInfo.network?.MACAddr) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.vertical-divide-line {
  background-color: #e9e9eb;
  width: 1px;
}

.tablet-search-input {
  width: 300px;
  height: fit-content;
}

.mismatched-list-item {
  text-align: start;
}

.tablet-info-loading {
  position: absolute;
  right: 0;
  left: 0;
  width: 100%;
  height: 50vh;
  margin: 0 auto;
}

.app-version-wrap {
  background-color: #f4f4f5;
  padding: 5px 8px 5px 12px;
  border-radius: 5px;

  .popover-box {
    display: flex;
    cursor: pointer;
  }

  .icon-more {
    cursor: pointer;
    padding: 5px 3px;
    -ms-transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
}

.card-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 10px;
  justify-content: flex-start;

  .card-box {
    width: 397px;

    &:deep(.el-card__body) {
      padding: 10px;
    }

    .table-wrap {
      &:deep(.el-descriptions__table) {
        padding: 6px;
      }

      &:deep(.el-descriptions__label) {
        width: 108px;
        font-size: 12px;
        word-break: keep-all;
      }

      &:deep(.el-descriptions__content) {
        width: 272px;
        padding: 5px 8px;
        word-break: break-all;
        font-size: 13px;
      }
    }

    .network-desc {
      .wifi-img {
        width: 24px;
        vertical-align: middle;
      }

      .wifi-strength-good {
        filter: invert(49%) sepia(90%) saturate(1318%) hue-rotate(119deg)
          brightness(101%) contrast(103%);
      }

      .wifi-strength-normal {
        filter: invert(35%) sepia(64%) saturate(2917%) hue-rotate(194deg)
          brightness(104%) contrast(113%);
      }

      .wifi-strength-warning {
        filter: invert(83%) sepia(46%) saturate(4370%) hue-rotate(2deg)
          brightness(104%) contrast(98%);
      }

      .wifi-strength-danger {
        filter: invert(15%) sepia(58%) saturate(6956%) hue-rotate(345deg)
          brightness(81%) contrast(115%);
      }
    }

    &:deep(.cell-background-red) {
      background-color: #fab6b6;
    }

    &:deep(.cell-background-yellow) {
      background-color: #f8e3c5;
    }
  }
}

.cell-background-red {
  background-color: #fab6b6;
}

.cell-background-yellow {
  background-color: #f8e3c5;
}
</style>
