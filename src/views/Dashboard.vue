<template>
  <div class="home">
    <div v-if="backupDone === 'Y'">
      <div class="dashboard-container">
        <img src="/img/icon.svg" style="width: 70px; margin-top: 35px" />
        <div class="container" style="margin-top: 0px">
          <p style="font-weight: 600">{{ $t("youHave") }}</p>
          <h3 class="title is-4" style="font-family: 'Poppins' !important">
            <span v-if="!isLoading">{{ userBalance }}</span>
            <span v-if="isLoading">-</span>
            <span> {{ $t("token") }}</span>
            <div v-if="unconfirmedBalance" style="font-size: 15px">
              +
              <b style="text-decoration: underline">{{ unconfirmedBalance }}</b>
              {{ $t("bloccati") }}
            </div>
          </h3>
        </div>
      </div>
      <div class="columns is-mobile" style="margin-top: -60px; padding: 10px">
        <div class="column is-half-mobile">
          <a href="/#/transaction/qrcode">
            <div class="button-square-dashboard">
              <img
                src="/img/qr-code.png"
                style="height: 45px; margin-top: 5px"
              />
              <p style="font-size: 9pt; color: white">{{ $t("scanButton") }}</p>
            </div>
          </a>
        </div>
        <div class="column is-half-mobile">
          <a href="/#/transaction/receive">
            <div class="button-square-dashboard">
              <img
                src="/img/receive.png"
                style="height: 45px; margin-top: 5px"
              />
              <p style="font-size: 9pt; color: white">{{ $t("receive") }}</p>
            </div>
          </a>
        </div>
      </div>
      <div
        v-if="transactions.length > 0"
        style="padding: 0 20px; text-align: left"
      >
        <b>{{ $t("confirmedTransactions") }}</b>
        <br />
        <br />
        <div
          class="card"
          v-for="tx in transactions"
          v-bind:key="tx.txid"
          style="margin-bottom: 5px"
        >
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <span
                  v-if="
                    tx.from.trim().toLowerCase() !==
                    address.trim().toLowerCase()
                  "
                >
                  <img src="/img/receive.svg" style="height: 50px" />
                </span>
                <span
                  v-if="
                    tx.from.trim().toLowerCase() ===
                    address.trim().toLowerCase()
                  "
                >
                  <img src="/img/send.svg" style="height: 50px" />
                </span>
              </div>
              <div class="media-content" style="overflow: hidden">
                <p class="title is-4" style="font-size: 20px">
                  <span
                    v-if="
                      tx.from.trim().toLowerCase() !==
                      address.trim().toLowerCase()
                    "
                  >
                    +
                  </span>
                  <span
                    v-if="
                      tx.from.trim().toLowerCase() ===
                      address.trim().toLowerCase()
                    "
                  >
                    -
                  </span>
                  {{ formatPrice(tx.amount).replace("-", "") }} {{ ticker }}
                </p>
                <p class="subtitle is-6" style="font-size: 12px">
                  {{ $t("atTime") }}
                  <b>{{ tx.date }}</b>
                  <br />
                  <span
                    v-if="
                      tx.from.trim().toLowerCase() !==
                      address.trim().toLowerCase()
                    "
                  >
                    {{ $t("from") }}
                    <b
                      v-if="
                        tx.from !== '0x0000000000000000000000000000000000000000'
                      "
                      >{{ tx.from.substr(0, 6) }}...{{ tx.from.substr(-6) }}</b
                    >
                    <b
                      v-if="
                        tx.from === '0x0000000000000000000000000000000000000000'
                      "
                      >{{ $t("singleToken") }}</b
                    >
                  </span>
                  <span
                    v-if="
                      tx.from.trim().toLowerCase() ===
                      address.trim().toLowerCase()
                    "
                  >
                    {{ $t("to") }}
                    <b
                      v-if="
                        tx.to !== '0x0000000000000000000000000000000000000000'
                      "
                      >{{ tx.to.substr(0, 6) }}...{{ tx.to.substr(-6) }}</b
                    >
                    <b
                      v-if="
                        tx.to === '0x0000000000000000000000000000000000000000'
                      "
                      >{{ $t("singleToken") }}</b
                    >
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isLoading">
        {{ $t("loadingOne") }}<br />{{ $t("loadingTwo") }}
      </div>
      <div v-if="transactions.length === 0 && !isLoading" style="padding: 10px">
        {{ $t("noTransaction") }}
        <a href="https://carato.org">carato.org</a>
      </div>
    </div>
    <div v-if="backupDone === 'N'">
      <img src="../assets/backup.gif" width="100%" />
      <div style="padding: 20px">
        <div v-if="step === 1">
          <h1>{{ $t("keepAttention") }}</h1>
          <br />
          <p>
            {{ $t("backUpOne") }}<br />
            {{ $t("backUpTwo") }}
          </p>
          <br />
          <button
            class="button is-primary"
            style="width: 100%"
            v-on:click="step = 2"
          >
            {{ $t("writeOne") }}
          </button>
        </div>
        <div v-if="step === 2">
          <h1>{{ $t("writeTwo") }}</h1>
          <hr />
          <p style="font-size: 22px">{{ mnemonic }}</p>
          <hr />
          <p style="color: #f00">
            {{ $t("keepAttentionTwo") }}
          </p>
          <br />
          <button
            class="button is-primary"
            style="width: 100%"
            v-on:click="confirmBackup"
          >
            {{ $t("confirmSeeds") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
const t2d = require("timestamp-to-date");
const EthDiD = require("eth-did-core");

export default {
  data() {
    return {
      did: new EthDiD(true),
      device: {
        platform: "web",
      },
      address: "",
      ticker: "",
      wallet: "",
      axios: axios,
      currency: "eur",
      cardHash: localStorage.getItem("hash"),
      backupDone: localStorage.getItem("backup_done"),
      mnemonic: localStorage.getItem("mnemonic"),
      apiURL: process.env.VUE_APP_BACKEND_URL,
      transactions: [],
      userBalance: 0,
      unconfirmedBalance: 0,
      isLoading: true,
      step: 1,
      graph: {},
      movements: {},
    };
  },
  async mounted() {
    const app = this;
    app.checkversion();
    const wallet = await app.did.returnWallet();
    app.wallet = wallet;
    app.address = wallet.master;
    app.refreshStats();
    setInterval(function(){
      app.refreshStats()
    }, 5000)
    app.isLoading = false;
  },
  methods: {
    async refreshStats() {
      const app = this;
      let balance = await app.axios.get(
        app.apiURL + "/tokens/balance/" + app.cardHash
      );
      app.userBalance = balance.data.balance.confirmed;
      app.unconfirmedBalance = balance.data.balance.locked;
      app.isLogging = false;
      let parsed = [];
      let transactions = await app.axios.get(
        app.apiURL + "/tokens/transactions/" + app.cardHash
      );
      if (transactions.data.transactions.length > 0) {
        for (let x in transactions.data.transactions) {
          let tx = transactions.data.transactions[x];
          tx.date = t2d(tx.time * 1000, "dd/MM/yyyy HH:mm");
          parsed.push(tx);
        }
        let updated = parsed.reverse()
        if(updated !== app.transactions){
          app.transactions = updated;
        }
      }
    },
    confirmBackup() {
      const app = this;
      localStorage.setItem("backup_done", "Y");
      location.reload();
    },
    formatPrice(value) {
      let val = (value / 1).toFixed(2).replace(".", ",");
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    saveCurrency() {
      const app = this;
      localStorage.setItem("currency", app.currency);
    },
    saveChain() {
      const app = this;
      localStorage.setItem("chain", app.chain);
    },
    getDate(time) {
      let date = new Date(time);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      return y + "-" + m + "-" + d;
    },
    getTime(time) {
      let date = new Date(time);
      let h = `${date.getHours()}`.padStart(2, "0");
      let m = `${date.getMinutes()}`.padStart(2, "0");
      let s = `${date.getSeconds()}`.padStart(2, "0");
      return h + ":" + m + ":" + s;
    },
    checkversion() {
      var version = localStorage.getItem("version") || "";
      if (process.env.VUE_APP_VERSION !== version) {
        localStorage.setItem("version", process.env.VUE_APP_VERSION);
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.update().then(() => {
              window.location.reload();
            });
          });
        }
      }
    },
  },
  watch: {
    currency: function () {
      const app = this;
      app.saveCurrency();
    },
    chain: function () {
      const app = this;
      app.saveChain();
    },
  },
};
</script>
