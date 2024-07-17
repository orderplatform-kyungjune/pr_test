<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{
  apiVersion?: string;
  handleClickCopyText?: () => void;
}>();

const route = useRoute();
const storeName = route.query.name;
const getApiVersionText = computed(() => {
  if (!props.apiVersion) return '';
  return props.apiVersion === '1.0' ? '티오더1' : '티오더2';
});
</script>

<template>
  <el-row
    class="name-wrap"
    align="middle"
  >
    <span class="name-title">
      매장명
      <div class="name">
        {{ storeName }}
      </div>
    </span>
    <el-tag
      v-if="getApiVersionText"
      class="ml-10 api-version-tag"
      type="info"
      effect="plain"
    >
      {{ getApiVersionText }}
    </el-tag>
  </el-row>
</template>

<style lang="scss" scoped>
.name-wrap {
  display: flex;
  align-items: center;
  width: 800px;

  .name-title {
    display: flex;
    align-items: center;
    margin: 15px 0;
    font-size: 12px;
    color: #828282;

    .name {
      margin-left: 5px;
      font-size: 18px;
      color: #000;
    }
  }

  .api-version-tag {
    --el-tag-bg-color: var(--el-fill-color-blank);
    --el-tag-border-color: #303133;
    --el-tag-text-color: #303133;

    :deep(.el-tag__content) {
      font-weight: 900;
    }
  }
}
</style>
