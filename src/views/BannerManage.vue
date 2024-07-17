<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { reactive, Ref, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { AxiosResponse } from 'axios';
import { authentication, runtimeCheckHelper } from '@utils';
import useModalStore from '@store/storeModal';
import { storeBannerListType } from '@interface/banner';
import { Picture } from '@element-plus/icons-vue';
import { AddBannerModal } from '@containers';
import { BreadcrumbHeader, StoreNameBox } from '@components';
import { ADD_BANNER, STORE_LIST, BANNER_SETTING } from '@common/string';
import { bannerCodec } from '@codecs';
import { banner } from '@apis';

const { openModal, flag } = useModalStore();

const { requestBannerList, requestUpdateBanner, requestDeleteBanner } = banner;

const { storeBannerListCodec } = bannerCodec;

const { failAuthenticationAlert } = authentication;
const { runtimeCheck } = runtimeCheckHelper;

const route = useRoute();

// header props
const bannerManageHeader = reactive([
  { name: STORE_LIST },
  { name: BANNER_SETTING },
]);

/** 검색 기능 */
const searchWord: Ref<string> = ref('');

/** 매장 배너 리스트 정보 */
const storeBannerList: Ref<storeBannerListType[]> = ref(
  [] as storeBannerListType[],
);

/** 페이지네이션 정보 */
const paginationInfo = reactive({
  page: 1,
  pageSize: 10,
  from: 1,
  to: 10,
  total: 0,
});

/** 배너 리스트 불러오기 */
const getStoreBannerList = async (
  page: number,
  perPage: number,
  searchTxt?: string,
) => {
  try {
    const config = route.query.code as string;
    const data = {
      storeCode: config,
      page,
      perPage,
      searchTxt,
    };
    const res = (await requestBannerList(data)) as AxiosResponse;
    const typeError = runtimeCheck(storeBannerListCodec, res.data);

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (!typeError) {
      if (res.data.code === 200) {
        storeBannerList.value = res.data.data;
        paginationInfo.total = res.data.page_info.total;
        paginationInfo.page = res.data.page_info.current_page;
        paginationInfo.pageSize = res.data.page_info.per_page;
        paginationInfo.from = res.data.page_info.from;
        paginationInfo.to = res.data.page_info.to;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/** 배너 등록하기 */
const updateBannerInfo = (target: storeBannerListType) => {
  const bannerData = {
    storeCode: route.query.code as string,
    id: target.id,
    T_order_store_banner_use: target.T_order_store_banner_use,
    T_order_store_banner_sort: target.T_order_store_banner_sort,
    T_order_store_banner_time: target.T_order_store_banner_time,
  };

  ElMessageBox.confirm('배너를 수정 하시겠습니까?', '배너 수정', {
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = (await requestUpdateBanner(bannerData)) as AxiosResponse;

        if (res.data.code === 400) {
          await ElMessageBox.alert(res.data.msg, '실패', {
            confirmButtonText: '확인',
            type: 'error',
          });
        }
        if (res.data.code === 401) {
          failAuthenticationAlert();
        }
        if (res.data.code === 200) {
          await getStoreBannerList(
            paginationInfo.page,
            paginationInfo.pageSize,
            searchWord.value,
          );
          ElMessage({
            type: 'success',
            message: '정상적으로 수정되었습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '취소되었습니다.',
      });
    });
};

/** 배너 삭제하기 */
const postDeleteBanner = async (target: storeBannerListType) => {
  const bannerData = {
    storeCode: route.query.code as string,
    id: target.id,
  };

  try {
    const res = (await requestDeleteBanner(bannerData)) as AxiosResponse;

    if (res.data.code === 400) {
      await ElMessageBox.alert(res.data.msg, '실패', {
        confirmButtonText: '확인',
        type: 'error',
      });
    }
    if (res.data.code === 401) {
      failAuthenticationAlert();
    }
    if (res.data.code === 200) {
      await getStoreBannerList(
        paginationInfo.page,
        paginationInfo.pageSize,
        searchWord.value,
      );
      ElMessage({
        type: 'success',
        message: '정상적으로 수정되었습니다.',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 삭제하기
const setDeleteCheck = (target: storeBannerListType) => {
  if (!target) return;
  const categoryName = target.T_order_store_banner_name;

  ElMessageBox.prompt(
    `삭제를 하시려면 "${categoryName} 삭제합니다."를 입력해 주세요. `,
    '정말로 삭제하시겠습니까??',
    {
      confirmButtonText: '입력',
      cancelButtonText: '취소',
      inputPlaceholder: `${categoryName} 삭제합니다.`,
    },
  )
    .then(({ value }) => {
      if (value === `${categoryName} 삭제합니다.`) {
        postDeleteBanner(target);
      } else {
        ElMessageBox.alert('입력한 값이 일치하지 않습니다.', '실패', {
          confirmButtonText: '확인',
          type: 'warning',
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

/** 검색 하기 */
const setSearchWord = () => {
  getStoreBannerList(1, 10, searchWord.value);
};

/** 순서 selectBox */
const sequenceOption = Array.from({ length: 10 }, (v, i) => ({
  value: i,
  label: i,
}));

/** 페이지네이션 */
const handleCurrentPage = (val: number) => {
  const position = document.querySelector(
    '.default_layout_contents',
  ) as HTMLElement;
  paginationInfo.page = val;
  getStoreBannerList(
    paginationInfo.page,
    paginationInfo.pageSize,
    searchWord.value,
  );
  position.scrollTo(0, 0);
};

getStoreBannerList(1, 10);
</script>

<template>
  <AddBannerModal
    v-if="flag.addBanner"
    :getList="() => getStoreBannerList(1, 10)"
  />
  <BreadcrumbHeader :propsHeader="bannerManageHeader" />
  <StoreNameBox />
  <el-row
    align="middle"
    class="banner-header mb-10"
    justify="space-between"
  >
    <el-col :span="12">
      <el-row
        align="middle"
        justify="start"
      >
        <el-button
          type="primary"
          @click="openModal(ADD_BANNER)"
        >
          배너 등록
        </el-button>
      </el-row>
    </el-col>
    <el-col :span="12">
      <form @submit.prevent="setSearchWord">
        <el-row
          align="middle"
          justify="end"
        >
          <span class="mr-10"> 검색 : </span>

          <el-col
            :span="6"
            class="mr-5"
          >
            <el-input v-model="searchWord" />
          </el-col>
          <el-button
            type="primary"
            @click="setSearchWord"
          >
            검색하기
          </el-button>
        </el-row>
      </form>
    </el-col>
  </el-row>
  <el-table
    :data="storeBannerList"
    border
    class="mb-10"
    style="width: 100%"
  >
    <el-table-column
      align="center"
      label="id"
      prop="id"
      sortable
      width="150"
    />
    <el-table-column
      align="center"
      label="출력"
      prop="output"
      sortable
      width="250"
    >
      <template #default="scope">
        <el-radio-group v-model="scope.row.T_order_store_banner_use">
          <el-radio
            border
            label="Y"
          >
            사용
          </el-radio>
          <el-radio
            border
            label="N"
          >
            미사용
          </el-radio>
        </el-radio-group>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="순서"
      prop="sequence"
      sortable
      width="150"
    >
      <template #default="scope">
        <el-select v-model="scope.row.T_order_store_banner_sort">
          <el-option
            v-for="option in sequenceOption"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="배너이름"
      prop="bannerName"
      sortable
      width="300"
    >
      <template #default="scope">
        {{ scope.row.T_order_store_banner_name }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="배너 이미지"
      prop="image"
      sortable
    >
      <template #default="scope">
        <el-image
          :src="scope.row.T_order_store_banner_url"
          class="banner-image-fail"
          fit="fill"
        >
          <template #error>
            <el-icon>
              <Picture />
            </el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="노출 시간"
      sortable
      width="200"
    >
      <template #default="scope">
        <el-input-number
          v-model="scope.row.T_order_store_banner_time"
          :max="30"
          :min="5"
          :step="5"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="사용"
      sortable
      width="150"
    >
      <template #default="scope">
        <div class="banner-action-button">
          <div>
            <el-button
              type="primary"
              @click="updateBannerInfo(scope.row)"
            >
              수정
            </el-button>
          </div>
          <div>
            <el-button
              type="danger"
              @click="setDeleteCheck(scope.row)"
            >
              삭제
            </el-button>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-row
    align="middle"
    justify="center"
  >
    <el-pagination
      :page-size="paginationInfo.pageSize"
      :total="paginationInfo.total"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentPage"
    />
  </el-row>
</template>

<style lang="scss" scoped>
.banner-header {
  font-size: 15px;
  color: #a9abb3;
  text-align: center;
}

.banner-image-fail {
  width: 200px;
  height: 125px;
  font-size: 30px;
  line-height: 150px;
}

.banner-action-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
