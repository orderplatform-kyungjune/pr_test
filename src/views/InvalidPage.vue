<script setup lang="ts">
import torderLogo from '@assets/torder_logo_with_text.svg';
</script>

<template>
  <div class="invalid-page-grid">
    <img
      alt="logo"
      :src="torderLogo"
    />
    <p class="invalid-page-title">찾으시는 페이지가 없습니다.</p>
    <div class="invalid-page-desc">
      <p>잘못된 접근이거나 요청하신 페이지를 찾을 수 없습니다.</p>
      <p>
        해당 문제 관련하여 문의가 필요하시면 개발자에게 연락주시기 바랍니다.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.invalid-page-grid {
  display: flex;
  flex-direction: column;
  gap: 70px;
  align-items: center;
  justify-content: center;
  height: 80vh;

  .invalid-page-title {
    font-size: 42px;
    font-weight: bold;
  }

  .invalid-page-desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: gray;
  }
}
</style>
-->
