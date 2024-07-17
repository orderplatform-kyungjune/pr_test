export interface apkType {
  apk: string;
  version: string;
}

export interface storeType {
  T_order_store_apk_name: string;
  T_order_store_name: string;
}

export interface tableType {
  chat_reset: string;
  init_id: string;
  init_name: string;
  state: string;
  ta_id: string;
  tablet_info_id: string;
  tablet_info_name: string;
  tablet_screen_view: string;
  van_type?: string;
  isSelected?: boolean;
}

export interface tableCountType {
  tablet_installer: string;
  tablet_brand: string[];
  viewtablet_cnt: number;
  ordertablet_cnt: number;
  extratablet_cnt: number;
  reg_tablet_cnt: number;
  reg_prepay_tablet_cnt: number;
  unreg_tablet_cnt: number;
  for_delete_tablet_cnt: number;
}

export interface tableListAndVersionListType {
  apkList: apkType[];
  store: storeType;
  table: tableType[];
  table_count: tableCountType;
}

export interface storePlatformType {
  platform_store_apk_name: string;
  platform_store_name: string;
}

export interface tableListAndVersionListPlatformType {
  apkList: apkType[];
  store: storePlatformType;
  table: tableType[];
  table_count: tableCountType;
}

export interface getTableInfoParamType {
  storeCode: string;
  Ta_Id: string | string[];
}

export interface paymentInfoType {
  Tablet_creditVanType: string;
  Tablet_credit_functionArray: {
    card: boolean;
    cash: boolean;
    compound: boolean;
    multiple: boolean;
  };
  Tablet_credit_serialnumber: string;
  Tablet_credit_use: string;
}

export interface tableCreateParamsType {
  storeCode: string;
  id: string;
  name: string;
}

export interface tableCreateAllParamsType {
  storeCode: string;
  id: string[];
  name: string[];
}

export interface postApkUpdateParamsType {
  storeCode: string;
  apk_file_name: string;
  apk_version: string;
}

export interface PostAppForceUpdateType {
  storeCode: string;
  apk_file_name: string;
  apk_version: string;
}

export interface tabletRefreshParamsType {
  storeCode: string;
  timer: number;
}

/** 태블릿 정보 관련 */
// deviceUsage type
export interface deviceUsageRamType {
  total: number;
  app: number;
  used: number;
}

export interface deviceUsageConnectivityType {
  transmitted: number;
  received: number;
  host: string;
  loss: number;
  pingResult: number[];
}

export interface deviceUsageStorageType {
  device?: number;
  used?: number;
  usage?: number;
  free: number;
}

// typeA
export interface deviceUsageWifiType {
  ssid: string;
  speed: number;
  strength: number;
  MACAddr: string;
}

// typeB
export interface deviceUsageNetworkType {
  ssid: string;
  frequency: number;
  rssi: number;
  rx: number;
  tx: number;
  latency: number;
  isConnected: boolean;
  gateway: string;
  dns: string;
  ipv4: string;
  connectivity?: deviceUsageConnectivityType; // v3
  MACAddr: string;
}

export interface deviceUsageGpsType {
  latitude: number;
  longtitude: number;
}

export interface deviceUsageAppType {
  packageName: string;
  name: string;
  code: number;
}

export interface deviceUsageMemoryType {
  device: number;
  usage: number;
  free: number;
}

export interface deviceUsageBatteryType {
  status: number;
  health: number;
  plugged: number;
  capacity: number;
}

export interface deviceUsageHwType {
  processors: number;
  brand: string;
  model: string;
  buildNumber: string;
  hardware: string;
  supportedABIs?: string[];
}

export interface deviceUsageOsType {
  code: string;
  api: number;
  buildNumber?: string; // v3
}

export interface tabletDefaultInfoType {
  path: string;
  userAgent: string;
  lastUpdate: string;
  ip: string;
  storeCode: string;
  tableCode: string;
  uCode: string;
  location: string;
}

export interface deviceUsageTypeA {
  time: number | string;
  battery: number;
  bright: number;
  version: string;
  cpu: number;
  gps: deviceUsageGpsType;
  ram: deviceUsageRamType;
  storage: deviceUsageStorageType;
}

export interface deviceUsageTypeB {
  ssaid: string;
  app: deviceUsageAppType;
  memory: deviceUsageMemoryType;
  hw: deviceUsageHwType;
  battery: deviceUsageBatteryType;
  storage: deviceUsageStorageType;
  sw: deviceUsageOsType;
  homeUrl?: string;
}

// tabletInfoType
export interface tabletInfoTypeA {
  type: string;
  tableName: string;
  defaultInfo: tabletDefaultInfoType;
  deviceUsage: deviceUsageTypeA;
  network: deviceUsageWifiType;
}

export interface tabletInfoTypeB {
  type: string;
  tableName: string;
  defaultInfo: tabletDefaultInfoType;
  deviceUsage: deviceUsageTypeB;
  network: deviceUsageNetworkType;
}
