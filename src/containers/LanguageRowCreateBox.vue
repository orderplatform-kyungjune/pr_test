<script setup lang="ts">
import { ref } from 'vue';

const { createJsonData, closeCreateLang } = defineProps<{
  createJsonData: (key: string, value: string) => void;
  closeCreateLang: (key: string) => void;
}>();

const koreanKeyInput = ref<string>('');
const translatedValueInput = ref<string>('');
</script>

<template>
  <el-row>
    <el-col
      :span="11"
      class="language-row-create-box"
    >
      <div class="grid-content">
        <el-input
          v-model="koreanKeyInput"
          class="translation-input-text"
          placeholder="적용할 한국어를 입력하세요."
        />
      </div>
    </el-col>
    <el-col
      :span="10"
      class="language-row-create-box"
    >
      <div class="grid-content">
        <el-input
          v-model="translatedValueInput"
          class="translation-input-text"
          placeholder="번역할 값을 입력해주세요."
        />
      </div>
    </el-col>
    <el-col :span="3">
      <div class="grid-content">
        <el-button
          type="primary"
          @click="createJsonData(koreanKeyInput, translatedValueInput)"
        >
          생성
        </el-button>
        <el-button
          class="ml-10"
          type="danger"
          @click="closeCreateLang"
        >
          취소
        </el-button>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.language-row-create-box {
  border-radius: 4px;
}

.grid-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0px;
  border: 1px solid #eee;
}

.translation-input-text {
  border: none;
  outline: none;

  &:deep(.el-input__wrapper) {
    background-color: transparent;
    box-shadow: none;
  }
}
</style>
