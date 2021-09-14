<template>
  <div class="home">
    <div v-if="!showScan">
      <div class="menu-top">
        <div class="columns is-mobile" style="margin-top: 2px">
          <div class="column is-one-quarter-mobile">
            <a href="/#/">
              <img
                src="/img/left-arrow.png"
                style="height: 20px; margin-top: 6px"
              />
            </a>
          </div>
          <div class="column is-one-quarter-mobile">
            <p
              v-if="activeTab === 0"
              style="font-size: 16pt; color: white; font-weight: bold"
            >
              {{ $t("send") }}
            </p>
            <p
              v-if="activeTab === 1"
              style="font-size: 16pt; color: white; font-weight: bold"
            >
              {{ $t("receive") }}
            </p>
          </div>
        </div>
      </div>
      <div class="container-payment">
        <b-tabs position="is-centered" v-model="activeTab" expanded>
          <b-tab-item :label="$t('send')">
            <Send v-on:scanning="showScan = false" v-on:stopped="showScan = false" />
          </b-tab-item>
          <b-tab-item :label="$t('receive')">
            <Receive v-on:scanning="showScan = false" v-on:stopped="showScan = false" />
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import Send from '@/components/Send.vue'
import Receive from '@/components/Receive.vue'

export default {
  components: {
    Send,
    Receive
  },
  data() {
    return {
      address: "",
      wallet: "",
      isLoading: true,
      activeTab: 0,
      fromHome: false,
      showScan: false,
      apiURL: process.env.VUE_APP_BACKEND_URL
    };
  },
  async mounted() {
    const app = this;
    if (window.location.href.search("receive") !== -1) {
      app.activeTab = 1;
      app.fromHome = true;
    }
    if (
      app.$route.params.address !== undefined &&
      app.$route.params.amount !== undefined
    ) {
      app.amountSidechain = app.$route.params.amount;
      app.toAddress = app.$route.params.address;
    }

    app.isLogging = false;
    app.isLoading = false;
  }
};
</script>
