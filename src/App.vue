<template>
  <div id="app">
    <div v-if="!showScanModal">
      <div v-if="!isLogging && wallet">
        <router-view />
        <div class="logout-button" v-if="showLogout">
          <a v-on:click="logout">
            <img src="/img/logout.svg" />
          </a>
        </div>
        <div v-if="backupDone === 'Y'" class="menu-bottom">
          <div class="menu-bottom-content">
            <div class="columns is-mobile">
              <div class="column is-one-third-mobile">
                <a href="/#/">
                  <img src="/img/home.svg" style="height: 30px" />
                </a>
              </div>
              <div class="column is-one-third-mobile">
                <div class="circle-center">
                  <i
                    v-on:click="showDigitalCard = true"
                    style="
                      font-size: 30px;
                      color: #fff;
                      margin-top: 10px;
                      cursor: pointer;
                    "
                    class="fa fa-qrcode"
                  ></i>
                </div>
              </div>
              <div class="column is-one-third-mobile">
                <a href="/#/settings">
                  <img src="/img/settings.svg" style="height: 30px" />
                </a>
              </div>
            </div>
          </div>
          <div class="menu-center-button"></div>
        </div>
      </div>
      <div v-if="!wallet">
        <section class="hero img-main-bg">
          <div class="hero-body" style="padding: 0">
            <template>
              <div
                class="container"
                id="create"
                style="position: relative; height: 100%"
              >
                <div class="container" style="padding: 30px 30px 0px 30px">
                  <img src="/logo.svg" width="90" height="40" />
                  <div class="home-box" style="margin-top: 30px">
                    <h1
                      class="title is-2"
                      style="
                        color: #80B192;
                        margin-top: 35px;
                        padding: 0 10px;
                        font-family: 'Cookie';
                        font-weight: 300;
                        font-size: 45px;
                      "
                      v-html="$t('officialWallet')"
                    ></h1>
                    <div v-if="!showRestore" style="margin-top: 5px">
                      <b-button
                        v-on:click="showScan"
                        size="is-medium"
                        type="is-primary"
                        style="
                          width: 80%;
                          height: 80px;
                          margin-top: 15px;
                          margin-bottom: 15px;
                          font-size: 16px;
                        "
                      >
                        {{ $t("scanPaperWallet") }}
                        <br />
                        {{ $t("scanPaperWallet2") }}
                      </b-button>
                      <!-- CARD DIGITALE <b-button
                        v-on:click="showCreate"
                        size="is-medium"
                        type="is-primary"
                        style="
                          width: 80%;
                          height: 80px;
                          margin-top: 15px;
                          margin-bottom: 15px;
                          font-size: 16px;
                        "
                      >
                        Crea una nuova<br />Card Digitale
                      </b-button> 
                      <p
                        v-on:click="showRestore = true"
                        style="cursor: pointer; margin: 10px 0"
                      >
                        Recupera wallet
                      </p>-->
                    </div>
                    <div v-if="showRestore" style="padding: 0 20px 20px 20px">
                      <b-field label="Inserisci le 12 parole">
                        <b-input
                          v-model="twelvewords"
                          type="textarea"
                        ></b-input>
                      </b-field>
                      <b-button
                        type="is-primary"
                        v-on:click="recoverWallet"
                        size="is-medium"
                        >RECUPERA WALLET</b-button
                      ><br /><br />
                      <p
                        v-on:click="showRestore = false"
                        style="cursor: pointer; padding: 0; margin: 0"
                      >
                        torna indietro
                      </p>
                    </div>
                  </div>
                </div>
                <div class="footer_app text-center">
                  <p class="footer_text">
                    ©{{ new Date().getFullYear() }} Carato
                  </p>
                  <p class="footer_text2" style="margin-top: 5px">
                    developed with ❤️ by
                    <a href="https://yomi.digital" target="_blank"> YOMI</a>
                  </p>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>

      <b-loading
        :is-full-page="true"
        :active.sync="isLogging"
        :can-cancel="false"
      ></b-loading>

      <b-modal
        :active.sync="showCreateModal"
        has-modal-card
        trap-focus
        aria-role="dialog"
        aria-modal
      >
        <form action>
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title" style="font-size: 20px">
                {{ $t("createNewIdentity") }}
              </p>
            </header>
            <section class="modal-card-body">
              <div v-if="isObtaining">Ottengo una nuova card, attendi..</div>
              <div v-if="!isObtaining && newcard.qrcode">
                <img :src="newcard.qrcode" width="100%" />
              </div>
              Scegli il tuo PIN:
              <v-otp-input
                ref="otpInput"
                input-classes="otp-input"
                separator=""
                :num-inputs="4"
                :should-auto-focus="true"
                :is-input-num="true"
                @on-complete="completePassword"
              />
            </section>
            <footer v-if="!isCreating && !isUpdating" class="modal-card-foot">
              <button
                v-if="!wallet"
                class="button is-primary"
                style="width: 100%"
                v-on:click="createUser"
              >
                {{ $t("create") }}
              </button>
            </footer>
            <footer v-if="isCreating" class="modal-card-foot">
              <div style="text-align: center">{{ $t("creatingIdentity") }}</div>
            </footer>
          </div>
        </form>
      </b-modal>

      <b-modal
        :active.sync="showInitModal"
        has-modal-card
        trap-focus
        aria-role="dialog"
        aria-modal
      >
        <form action>
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">{{ $t("activateCard") }}</p>
            </header>
            <section class="modal-card-body">
              {{ $t("pinOne") }}<br /><br />
              <span style="color: #f00">{{ $t("pinTwo") }}</span
              ><br /><br />
              {{ $t("insertPassword") }}
              <v-otp-input
                ref="otpInput"
                input-classes="otp-input"
                separator=""
                :num-inputs="4"
                :should-auto-focus="true"
                :is-input-num="true"
                @on-complete="completePassword"
              />
            </section>
            <footer v-if="!isCreating && !isUpdating" class="modal-card-foot">
              <button
                v-if="!wallet"
                class="button is-primary"
                style="width: 100%"
                v-on:click="activateCard"
              >
                {{ $t("activateBtn") }}
              </button>
            </footer>
            <footer v-if="isCreating" class="modal-card-foot">
              <div style="text-align: center">{{ $t("creatingIdentity") }}</div>
            </footer>
          </div>
        </form>
      </b-modal>

      <!-- CARD DIGITALE -->
      <div
        class="fullscreen"
        style="background-image: none"
        v-if="showDigitalCard"
      >
        <b-button
          v-on:click="
            showDigitalCard = false;
            showMnemonic = false;
          "
          type="is-primary"
          style="
            width: 50px;
            position: fixed;
            z-index: 999;
            top: 10px;
            right: 10px;
          "
          >X</b-button
        >
        <img src="/logo.svg" width="70" style="margin-top: 50px" />
        <div v-if="!showMnemonic">
          <vue-qrcode
            style="width: 100%; margin-top: 20px"
            :width="500"
            :value="hash"
          ></vue-qrcode
          ><br />
          <span style="font-size:11px">{{ address }}</span>
          <hr>
          Questa è la tua tessera digitale, usala per ricevere o effettuare pagamenti!
        </div>
        <p
          style="
            cursor: pointer;
            font-weight: bold;
            font-size: 30px;
            position: absolute;
            top: 10px;
            left: 20px;
          "
          v-if="!showMnemonic && mnemonic"
          v-on:click="showMnemonic = true"
        >
          <i class="fa fa-eye"></i>
        </p>
        <p
          style="
            cursor: pointer;
            font-weight: bold;
            font-size: 30px;
            position: absolute;
            top: 10px;
            left: 20px;
          "
          v-if="showMnemonic && mnemonic"
          v-on:click="showMnemonic = false"
        >
          <i class="fa fa-eye-slash"></i>
        </p>
        <div
          v-if="showMnemonic === true"
          style="font-size: 24px; margin-top: 20px; padding: 20px"
        >
          <h1 class="title is-4">Queste sono le tue 12 parole di recupero:</h1>
          <hr />
          {{ mnemonic }}
        </div>
      </div>
      <!-- CARD DIGITALE -->
    </div>
    <div v-if="showScanModal">
      <div
        class="button-square-dashboard"
        style="
          position: fixed;
          top: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          color: #fff;
          font-weight: bold;
          z-index:99;
          line-height:30px;
        "
        v-on:click="stopScan"
      >
        X
      </div>
      <qrcode-stream style="width:100%; height: 100vh;" v-if="device.platform === 'web'" @decode="onDecode"></qrcode-stream>
    </div>
  </div>
</template>

<script>
const EthDiD = require("eth-did-core");
const axios = require("axios");
import { Camera } from "@capacitor/camera";
import { Plugins } from "@capacitor/core";
const { BarcodeScanner } = Plugins;
import { Device } from "@capacitor/device";
const ABI_DID = require('./abi/abi_did.json')

export default {
  data() {
    return {
      did: new EthDiD(true),
      axios: axios,
      device: {
        platform: "web",
      },
      address: "",
      wallet: "",
      isLogging: true,
      showScanModal: false,
      showDigitalCard: false,
      mnemonic: localStorage.getItem("mnemonic"),
      file: [],
      isCreating: false,
      backupDone: localStorage.getItem("backup_done"),
      hash: localStorage.getItem("hash"),
      isObtaining: false,
      showMnemonic: false,
      isUpdating: false,
      showCreateModal: false,
      showInitModal: false,
      isChecking: false,
      showRestore: false,
      password: "",
      twelvewords: "",
      showLogout: true,
      langs: ["it", "en"],
      cardHash: "",
      newcard: {},
      dataKey: "",
      apiURL: process.env.VUE_APP_BACKEND_URL,
    };
  },
  async mounted() {
    const app = this;
    app.device = await Device.getInfo();
    console.log('Device platform is: ' + app.device.platform)
    if (app.$route.path !== "/") {
      app.showLogout = false;
    } else {
      app.showLogout = true;
    }
    const wallet = await app.did.returnWallet();
    if(wallet !== undefined){
      app.wallet = wallet
      app.address = app.wallet.master
    }
    app.isLogging = false;
  },
  watch: {
    $route(to, from) {
      const app = this;
      if (to.path !== "/") {
        app.showLogout = false;
      } else {
        app.showLogout = true;
      }
    },
  },
  methods: {
    completePassword(value) {
      this.password = value;
    },
    async recoverWallet() {
      const app = this;
      if (app.twelvewords !== "" && app.twelvewords.split(" ").length === 12) {
        let recovered = await app.axios.post(app.apiURL + "/cards/recover", {
          mnemonic: app.twelvewords.trim(),
        });
        if (!recovered.data.error) {
          localStorage.setItem("SID", recovered.data.wallet);
          localStorage.setItem("backup_done", "Y");
          localStorage.setItem("hash", recovered.data.hash);
          localStorage.setItem("mnemonic", app.twelvewords);
          location.reload();
        } else {
          app.$buefy.toast.open({
            message: recovered.data.message,
            type: "is-danger",
          });
        }
      } else {
        app.$buefy.toast.open({
          message: "Devi inserire esattamente 12 parole!",
          type: "is-danger",
        });
      }
    },
    logout() {
      const app = this;
      app.$buefy.dialog.confirm({
        message: app.$t("wantLogout"),
        cancelText: app.$t("back"),
        onConfirm: () => {
          localStorage.removeItem("db");
          localStorage.removeItem("hash");
          localStorage.removeItem("eid");
          location.reload();
        },
      });
    },
    stopScan() {
      const app = this;
      if (app.device.platform !== "web") {
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
      }
      app.showScanModal = false;
    },
    async onDecode(decodedString) {
      const app = this;
      if (decodedString !== "") {
        console.log('Decoded hash is ' + decodedString)
        app.showScanModal = false;
        if (!app.isChecking) {
          app.isChecking = true;
          app.did.connect(process.env.VUE_APP_BLOCKCHAIN, '', process.env.VUE_APP_NETWORK)
          const contract = await app.did.initContract(ABI_DID, process.env.VUE_APP_DID_CONTRACT)
          let public_hash = await app.did.hash(decodedString)
          const check = await contract.methods.returnPublicAddress(public_hash).call()
          app.isChecking = false;
          if (check !== '0x0000000000000000000000000000000000000000') {
            app.showScanModal = false;
            const recover = await app.axios.post(app.apiURL + '/cards/recover', {
              hash: decodedString
            })
            app.dataKey = recover.data.eid
            app.cardHash = decodedString;
            app.unlockWallet();
          } else {
            app.showScanModal = false;
            app.showInitModal = true;
            app.cardHash = decodedString;
          }
        }
      }
    },
    unlockWallet() {
      const app = this;
      app.$buefy.dialog.prompt({
        message: app.$t("enterWalletPassword"),
        inputAttrs: {
          type: "password",
        },
        trapFocus: false,
        onConfirm: async (password) => {
          console.log(app.dataKey)
          let key = await app.did.importWallet(app.dataKey, password, true);
          console.log(key)
          if (key !== false) {
            localStorage.setItem("eid", app.dataKey);
            localStorage.setItem("hash", app.cardHash);
            localStorage.setItem("backup_done", "Y");
            app.hash = app.cardHash;
            location.reload();
          } else {
            app.$buefy.toast.open({
              message: this.$t("wrongPassword"),
              type: "is-danger",
            });
          }
        },
      });
    },
    async showScan() {
      const app = this;
      if (app.device.platform !== "web") {
        await Camera.requestPermissions(["camera"]);
        app.showScanModal = true;
        BarcodeScanner.hideBackground();
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          console.log("Readed QR", result.content);
          app.showScan = false;
          app.onDecode(result.content);
        }
      } else {
        app.showScanModal = true;
      }
    },
    langToLanguage(lang) {
      switch (lang) {
        case "it":
          return "Italiano";
        case "en":
          return "English";
        default:
          return "";
      }
    },
    async showCreate() {
      const app = this;
      app.showCreateModal = true;
      app.isObtaining = true;
      let newcard = await app.axios.get(app.apiURL + "/cards/generate");
      app.newcard = newcard.data;
      app.cardHash = newcard.data.hash;
      app.isObtaining = false;
    },
    async createUser() {
      const app = this;
      if (app.password !== "") {
        app.isCreating = true;
        let activate = await app.axios.post(app.apiURL + "/cards/init", {
          hash: app.cardHash,
          pin: app.password,
        });

        if (!activate.data.error) {
          app.$buefy.toast.open({
            message: activate.data.message,
            type: "is-success",
          });
          localStorage.setItem("mnemonic", app.newcard.mnemonic);
          localStorage.setItem("backup_done", "N");
          localStorage.setItem("hash", app.newcard.hash);
          localStorage.setItem("qrcode", app.newcard.qrcode);
          localStorage.setItem("SID", activate.data.sid);
          app.hash = app.newcard.hash;
          setTimeout(function () {
            location.reload();
          }, 500);
        } else {
          app.$buefy.toast.open({
            message: activate.data.message,
            type: "is-danger",
          });
        }
      } else {
        app.$buefy.toast.open({
          message: app.$t("noPasswordError"),
          type: "is-danger",
        });
      }
    },
    async activateCard() {
      const app = this;
      if (app.password !== "") {
        app.isCreating = true;
        let activate = await app.axios.post(app.apiURL + "/cards/register", {
          hash: app.cardHash,
          pin: app.password,
        });
        if (!activate.data.error) {
          app.$buefy.toast.open({
            message: activate.data.message,
            type: "is-success",
          });
          localStorage.setItem("hash", app.cardHash);
          await app.did.importWallet(activate.data.registered.eid, app.password, true)
          app.hash = app.cardHash;
          localStorage.setItem("backup_done", "Y");
          localStorage.setItem("eid", activate.data.eid);
          setTimeout(function () {
            location.reload();
          }, 500);
        } else {
          app.$buefy.toast.open({
            message: activate.data.message,
            type: "is-danger",
          });
        }
      } else {
        app.$buefy.toast.open({
          message: app.$t("noPasswordError"),
          type: "is-danger",
        });
      }
    },
  },
};
</script>

<style>
video#bgvid {
  position: fixed;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  width: 100%;
  background-image: url("/img/carrubo.jpg");
  z-index: 0;
  object-fit: cover;
}

#app {
  font-family: "Poppins";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.button.is-primary {
  background-color: #80B192 !important;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

p,
a,
span {
  font-family: "Poppins", sans-serif;
}

#nav a.router-link-exact-active {
  color: #80B192;
}
</style>
