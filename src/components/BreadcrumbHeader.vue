<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue';

defineProps<{
  propsHeader: {
    name: string;
    pushPage?: () => void;
  }[];
}>();
</script>

<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(headline, index) in propsHeader"
      :key="index"
      class="mb-10"
      @click="headline.pushPage"
    >
      {{ headline.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
