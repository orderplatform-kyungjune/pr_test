<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { runtimeCheckHelper, authentication } from '@utils';
import {
  selectedMarkerType,
  selectedStoreInfoType,
  torderMapListType,
} from '@interface/map';
import { BreadcrumbHeader } from '@components';
import { mapCodec } from '@codecs';
import selectedMarkerImg from '@assets/torder_map_select_marker.svg';
import unselectedMarkerImg from '@assets/torder_map_marker.svg';
import { requestTorderMapList } from '@apis/map';

const { runtimeCheck } = runtimeCheckHelper;
const { failAuthenticationAlert } = authentication;
const { storeMapListCodec } = mapCodec;

const propHeader = [{ name: '티오더 설치 매장 지도' }];

const torderMapList = ref<torderMapListType[]>([]);
const selectedStoreInfo = reactive<selectedStoreInfoType>({
  name: '매장을 선택해주세요.',
  code: '매장을 선택해주세요.',
  address: '매장을 선택해주세요.',
  selected: false,
  total_cnt: 0,
  loc_cnt: 0,
});

// eslint-disable-next-line no-undef
let mapItem: undefined | kakao.maps.Map;
// eslint-disable-next-line no-undef
let markers: kakao.maps.Marker[];
// eslint-disable-next-line no-undef
let geocoder: kakao.maps.services.Geocoder;
// eslint-disable-next-line no-undef
let roadView: kakao.maps.Roadview;
const isRoadViewOpen = ref<boolean>(false);
const loading = ref<boolean>(true);
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

const router = useRouter();

const sleep = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

const roadViewDesc = () => (isRoadViewOpen.value ? '닫기' : '열기');

const getCountDesc = () =>
  `전체 ${selectedStoreInfo.total_cnt} 매장 중 좌표가 있는 ${selectedStoreInfo.loc_cnt} 매장만 지도에 노출됩니다.`;

const pushStoreSettingPage = () => {
  const routeData = router.resolve({
    name: 'singleStoreSetting',
    query: {
      page: 1,
      pageSize: 10,
      searchStoreName: selectedStoreInfo.name,
      searchStoreCode: selectedStoreInfo.code,
      searchTabletLoginId: '',
      searchStat: '',
      searchStartDate: '',
      searchEndDate: '',
    },
  });
  window.open(routeData.href, '_blank');
};

// eslint-disable-next-line no-undef
let currLoc: kakao.maps.LatLng;

const permuteRoadView = async () => {
  if (mapItem) {
    const mapContainer = document.getElementById('map');
    const rvContainer = document.getElementById('road-view');
    if (isRoadViewOpen.value && mapContainer && rvContainer) {
      mapContainer.style.width = '100%';
      rvContainer.style.width = '0%';
    } else if (!isRoadViewOpen.value && mapContainer && rvContainer) {
      mapContainer.style.width = '50%';
      rvContainer.style.width = '50%';
    }
    isRoadViewOpen.value = !isRoadViewOpen.value;
    console.log(mapItem.getCenter());
    mapItem.relayout();
    roadView.relayout();
    mapItem.panTo(currLoc);
  }
};

const requestMapList = async () => {
  try {
    const res = (await requestTorderMapList()) as AxiosResponse;
    const typeError = runtimeCheck(storeMapListCodec, res.data);

    if (res.status === 400) {
      ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }

    if (res.status === 401) {
      failAuthenticationAlert();
    }

    if (!typeError) {
      if (res.status === 200) {
        torderMapList.value = res.data.data;
        selectedStoreInfo.loc_cnt = res.data.loc_cnt;
        selectedStoreInfo.total_cnt = res.data.total_cnt;
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const setMap = () => {
  const mapContainer = document.getElementById('map');

  const options = {
    center: new window.kakao.maps.LatLng(37.488127, 127.011594),
    level: 11,
  };
  if (mapContainer) {
    mapItem = new window.kakao.maps.Map(mapContainer, options);
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    mapItem.addControl(
      mapTypeControl,
      window.kakao.maps.ControlPosition.TOPRIGHT,
    );
    const zoomControl = new window.kakao.maps.ZoomControl();
    mapItem.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    mapItem.setMaxLevel(10);
  }
  geocoder = new window.kakao.maps.services.Geocoder();
};

// eslint-disable-next-line no-undef
const creates = (
  overlay: kakao.maps.CustomOverlay,
  location: torderMapListType,
  address?: string,
  marker?: kakao.maps.Marker,
  image?: kakao.maps.MarkerImage,
) => {
  const infoWrapper = document.createElement('div');
  if (!address) {
    infoWrapper.className = 'info-wrapper rv';
  } else {
    infoWrapper.className = 'info-wrapper';
  }

  const infoHeader = document.createElement('div');
  infoHeader.className = 'info-header';

  const infoImg = document.createElement('img');
  infoImg.src = 'http://admin.cs.torder.co.kr/torder_logo_image.svg';
  infoImg.alt = 'imgs';
  infoImg.className = 'header-img';
  infoHeader.appendChild(infoImg);

  const storeName = document.createElement('span');
  storeName.className = 'store-name';
  storeName.innerText = location.T_order_store_name;
  infoHeader.appendChild(storeName);

  if (address) {
    const close = document.createElement('div');
    close.className = 'close';
    close.innerText = '❌';
    close.onclick = () => {
      overlay.setMap(null);
      if (marker && image) {
        marker.setImage(image);
      }
    };
    infoHeader.appendChild(close);
  }
  infoWrapper.appendChild(infoHeader);

  const infoBody = document.createElement('div');
  infoBody.className = 'info-body';

  const storeInfo1 = document.createElement('div');
  storeInfo1.className = 'store-info';
  storeInfo1.innerText = `매장 이름 : ${location.T_order_store_name}`;
  infoBody.appendChild(storeInfo1);
  const storeInfo2 = document.createElement('div');
  storeInfo2.className = 'store-info';
  storeInfo2.innerText = `매장 코드 : ${location.T_order_store_code}`;
  infoBody.appendChild(storeInfo2);
  if (address) {
    const storeInfo3 = document.createElement('div');
    storeInfo3.className = 'store-info address';
    storeInfo3.innerText = address || '주소를 불러오지 못하였습니다.';
    infoBody.appendChild(storeInfo3);
  }
  infoWrapper.appendChild(infoBody);

  return infoWrapper;
};

const setClusterAndMarker = () => {
  if (mapItem) {
    const clusterer = new window.kakao.maps.MarkerClusterer({
      map: mapItem,
      minLevel: 5,
    });

    const selectedMarker: selectedMarkerType = {} as selectedMarkerType;
    const normalSize = new window.kakao.maps.Size(45, 45);
    const hoverSize = new window.kakao.maps.Size(55, 55);
    const normalOption = { offset: new window.kakao.maps.Point(28, 70) };
    const hoverOption = { offset: new window.kakao.maps.Point(31, 72) };
    const normalImage = new window.kakao.maps.MarkerImage(
      unselectedMarkerImg,
      normalSize,
      normalOption,
    );
    const hoverImage = new window.kakao.maps.MarkerImage(
      unselectedMarkerImg,
      hoverSize,
      hoverOption,
    );
    const clickImage = new window.kakao.maps.MarkerImage(
      selectedMarkerImg,
      hoverSize,
      hoverOption,
    );
    const roadViewClient = new window.kakao.maps.RoadviewClient();
    const searchDetailAddrFromCoords = (coords: any, callback: any) => {
      geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    };

    let address = '';

    const cb = (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        address = result[0].road_address.address_name
          ? result[0].road_address.address_name
          : '주소를 불러오지 못하였습니다.';
      } else {
        address = '주소를 불러오지 못하였습니다.';
      }
    };

    markers = torderMapList.value.map((location) => {
      const marker = new window.kakao.maps.Marker({
        map: mapItem!,
        position: new window.kakao.maps.LatLng(
          location.addr_y,
          location.addr_x,
        ),
        clickable: true,
        zIndex: 7,
        image: normalImage,
      });

      const overlay = new window.kakao.maps.CustomOverlay({
        map: mapItem!,
        position: new window.kakao.maps.LatLng(
          location.addr_y,
          location.addr_x,
        ),
        xAnchor: 0.5,
        yAnchor: 1.7,
        zIndex: 6,
        content: '',
      });
      overlay.setMap(null);

      window.kakao.maps.event.addListener(marker, 'mouseover', async () => {
        searchDetailAddrFromCoords(marker.getPosition(), cb);
        await sleep(100);
        overlay.setContent(
          creates(overlay, location, address, marker, normalImage),
        );
        if (!selectedMarker.value || selectedMarker.value !== marker) {
          marker.setImage(hoverImage);
          overlay.setMap(mapItem!);
        }
      });
      window.kakao.maps.event.addListener(marker, 'mouseout', async () => {
        if (!selectedMarker.value || selectedMarker.value !== marker) {
          await sleep(100);
          marker.setImage(normalImage);
          overlay.setMap(null);
        }
      });
      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (!selectedMarker.value || selectedMarker.value !== marker) {
          // eslint-disable-next-line no-unused-expressions
          !!selectedMarker.value && selectedMarker.value.setImage(normalImage);
          marker.setImage(clickImage);
        }
        const loc = marker.getPosition();
        currLoc = marker.getPosition();
        roadViewClient.getNearestPanoId(loc, 100, (panoId: number) => {
          roadView.setPanoId(panoId, loc);
        });
        mapItem!.panTo(loc);
        selectedMarker.value = marker;
      });
      const info = {
        name: location.T_order_store_name,
        code: location.T_order_store_code,
        address,
      };
      window.kakao.maps.event.addListener(marker, 'click', () => {
        selectedStoreInfo.name = info.name;
        selectedStoreInfo.code = info.code;
        selectedStoreInfo.address = address;
        selectedStoreInfo.selected = true;
      });

      return marker;
    });
    clusterer.addMarkers(markers);
  }
};

const setRoadView = () => {
  const clickImg = selectedMarkerImg;
  const rvSize = new window.kakao.maps.Size(50, 50);
  const hoverOption = { offset: new window.kakao.maps.Point(30, 72) };
  const rvImage = new window.kakao.maps.MarkerImage(
    clickImg,
    rvSize,
    hoverOption,
  );
  const rvContainer = document.getElementById('road-view');
  const roadViewClient = new window.kakao.maps.RoadviewClient();
  const position = new window.kakao.maps.LatLng(33.450701, 126.570667);

  if (rvContainer) {
    roadView = new window.kakao.maps.Roadview(rvContainer);
    roadViewClient.getNearestPanoId(position, 50, (panoId: number) => {
      roadView.setPanoId(panoId, position);
    });
    if (roadView) {
      window.kakao.maps.event.addListener(roadView, 'init', () => {
        for (let i = 0; i < torderMapList.value.length; i += 1) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const rvMarker = new window.kakao.maps.Marker({
            map: roadView,
            position: new window.kakao.maps.LatLng(
              torderMapList.value[i].addr_y,
              torderMapList.value[i].addr_x,
            ),
            image: rvImage,
          });

          const overlay = new window.kakao.maps.CustomOverlay({
            map: roadView,
            position: new window.kakao.maps.LatLng(
              torderMapList.value[i].addr_y,
              torderMapList.value[i].addr_x,
            ),
            xAnchor: 0.5,
            yAnchor: 1.9,
            zIndex: 6,
            content: '',
            clickable: true,
          });

          const contents = creates(overlay, torderMapList.value[i]);
          overlay.setContent(contents);
          overlay.setMap(roadView);
        }
      });
    }
  }
};

const initMap = () => {
  setMap();
  setRoadView();
  setClusterAndMarker();
  loading.value = false;
};

const setKakaoMap = async () => {
  await requestMapList();
  const script = document.createElement('script');
  script.onload = () => window.kakao.maps.load(initMap);
  script.src =
    '//dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=clusterer,services&appkey=46c34d143173149d1c790375c89121d3';
  document.head.appendChild(script);
};

onMounted(() => setKakaoMap());
onUnmounted(() => {
  mapItem = undefined;
});
</script>

<template>
  <BreadcrumbHeader :props-header="propHeader" />
  <el-container
    v-loading="loading"
    :element-loading-spinner="svg"
    class="map-container"
    element-loading-background="rgba(1, 1, 1, 0.6)"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-text="지도를 불러오는 중 입니다..."
  >
    <div class="map-wrapper">
      <div
        id="map"
        class="kakao-map"
      ></div>
      <div
        id="road-view"
        class="kakao-road-view"
      ></div>
    </div>
    <div class="map-info">
      <el-card
        class="box-card"
        shadow="never"
      >
        <template #header>
          <div class="card-header">
            <span>{{ getCountDesc() }}</span>
          </div>
        </template>
        <el-descriptions
          :column="2"
          direction="vertical"
        >
          <el-descriptions-item
            label="매장명"
            width="200px"
          >
            {{ selectedStoreInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item
            label="매장 코드"
            width="150px"
          >
            {{ selectedStoreInfo.code }}
          </el-descriptions-item>
          <el-descriptions-item
            label="매장 주소"
            span="2"
            width="150px"
          >
            {{ selectedStoreInfo.address }}
          </el-descriptions-item>
          <el-descriptions-item
            label="매장 정보"
            width="180px"
          >
            <el-button
              :disabled="!selectedStoreInfo.selected"
              @click="pushStoreSettingPage"
            >
              매장 정보
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item
            label="로드뷰"
            width="100px"
          >
            <el-button
              :disabled="!selectedStoreInfo.selected"
              @click="permuteRoadView"
            >
              로드뷰 {{ roadViewDesc() }}
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </el-container>
</template>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 180px);

  .map-wrapper {
    position: absolute;
    display: flex;
    width: 100%;

    .kakao-map {
      width: 100%;
      height: calc(100vh - 180px);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      outline: none;
    }

    .kakao-road-view {
      height: calc(100vh - 180px);
    }
  }

  .map-info {
    position: absolute;
    z-index: 1;

    .box-card {
      &:deep(.el-card__header) {
        padding: 10px 20px;
      }

      &:deep(.el-card__body) {
        padding: 20px 20px 10px 20px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }

  :deep(.info-wrapper) {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 300px;
    border: 2px #303030 solid;
    border-radius: 5px;

    &::after {
      position: absolute;
      right: 132px;
      bottom: -33.5%;
      content: '';
      border-top: 20px solid #303030;
      border-right: 20px solid transparent;
      border-bottom: 20px solid transparent;
      border-left: 20px solid transparent;
    }

    &.rv::after {
      bottom: -40%;
    }

    .info-header {
      display: flex;
      align-items: center;
      height: 30px;
      padding: 5px;
      background-color: #303030;

      img {
        width: 30px;
      }

      .store-name {
        padding-left: 10px;
        color: #ffffff;
      }

      .close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 17px;
        height: 17px;
        color: #ffffff;
      }
    }

    .info-body {
      display: flex;
      flex-direction: column;
      padding: 10px;
      font-size: 14px;
      background-color: #ffffff;

      .store-info {
        padding: 3px;
      }
    }
  }
}
</style>
