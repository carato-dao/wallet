import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import Buefy from 'buefy'
import './assets/style.scss'
import VueQrcodeReader from "vue-qrcode-reader";
import Gravatar from 'vue-gravatar';
import VueQrcode from 'vue-qrcode'
import i18n from './i18n'
import VueApexCharts from 'vue-apexcharts'
import VueParticles from 'vue-particles'
import OtpInput from "@bachdgvn/vue-otp-input";

Vue.component("v-otp-input", OtpInput);
Vue.component('apexchart', VueApexCharts)
Vue.component('v-gravatar', Gravatar);
Vue.use(VueQrcodeReader)
Vue.component('vue-qrcode', VueQrcode)
Vue.config.productionTip = false
Vue.use(Buefy)
Vue.use(VueParticles)

new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')
