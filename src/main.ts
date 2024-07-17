import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ko from 'element-plus/es/locale/lang/ko';
import ElementPlus from 'element-plus';
import router from '@router';
import { SERVICE_TARGET } from '@common/envVariables';
import App from './App.vue';
import 'element-plus/theme-chalk/index.css';

const app = createApp(App);

app
  .use(createPinia())
  .use(router)
  .use(ElementPlus, { locale: ko })
  .mount('#app');

// 동적 파비콘 적용
const link: HTMLLinkElement | null =
  document.querySelector("link[rel~='icon']");
if (link) {
  if (SERVICE_TARGET === 'uplus') {
    link.href = 'https://static.torder.co.kr/admin/uplus_logo_image.svg';
  } else {
    link.href = 'https://static.torder.co.kr/admin/torder_logo_image.svg';
  }
}
