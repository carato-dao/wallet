<template>
  <div>
    <!-- SCANSIONE CARD -->
    <div v-if="showScanAuth && !showScan">
      <img
        src="../assets/qrcode-scan.gif"
        style="margin-left: 5px"
        width="100%"
      />
      <div v-if="!isChecking">
        <div style="padding: 0 20px">
          Scannerizza un codice QR di pagamento o una tessera per inviare i carati<br /><br />
        </div>
        <b-button
          type="is-primary"
          v-on:click="startScan('send')"
          size="is-medium"
          >{{ $t("authScan") }}</b-button
        >
      </div>
      <div v-if="isChecking">
        Controllo la tessera,<br />si prega di attendere...
      </div>
    </div>
    <!-- SCANSIONE CARD -->

    <!-- QRCODE-READER -->
    <div
      v-if="showScan"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99;
        background:#fff;
      "
    >
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
          z-index: 99;
          line-height: 30px;
        "
        v-on:click="stopScan"
      >
        X
      </div>
      <qrcode-stream
        style="width: 100%; height: 100vh"
        v-if="device.platform === 'web'"
        @decode="onDecode"
      ></qrcode-stream>
    </div>
    <!-- QRCODE-READER -->

    <!-- INSERIMENTO AMMONTARE -->
    <div v-if="!showScanAuth && receiverAddress && !showPin">
      <div style="padding: 30px 0">
        Inserisci la quantità di carati da inviare ad un'altra card:
      </div>
      <br />
      Scrivi qui la quantità da inviare:<br />
      <b-input
        type="number"
        style="margin-bottom: 20px"
        class="amount-input"
        v-model="amount"
      />
      <b-button
        v-if="!isCheckingBalance"
        type="is-primary"
        v-on:click="checkAmountAndProceed()"
        size="is-medium"
        >PROCEDI</b-button
      >
      <div v-if="isCheckingBalance">
        Controllo se la card ha abbastanza fondi...
      </div>
    </div>
    <!-- INSERIMENTO AMMONTARE -->

    <!-- INSERIMENTO PIN -->
    <div
      class="fullscreen"
      style="background-image: none; padding: 20px"
      v-if="showPin"
    >
      <b-button
        v-on:click="showPin = false"
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
      <img
        style="margin-bottom: -60px; margin-top: 10px"
        src="../assets/pos.gif"
        width="300"
      /><br />
      {{ $t("insertPinOne") }} <b>{{ $t("insertPinTwo") }}</b>
      {{ $t("insertPinThree") }}

      <div class="display-number" style="padding: 25px 0">
        <span
          style="font-size: 30px; line-height: 40px; padding: 10px 0"
          v-for="(digit, index) in pindigits"
          v-bind:key="index"
          >*</span
        >
      </div>
      <div style="text-align: center">
        <div v-on:click="addPin(1)" class="pos-btn">1</div>
        <div v-on:click="addPin(2)" class="pos-btn">2</div>
        <div v-on:click="addPin(3)" class="pos-btn">3</div>
        <div v-on:click="addPin(4)" class="pos-btn">4</div>
        <div v-on:click="addPin(5)" class="pos-btn">5</div>
        <div v-on:click="addPin(6)" class="pos-btn">6</div>
        <div v-on:click="addPin(7)" class="pos-btn">7</div>
        <div v-on:click="addPin(8)" class="pos-btn">8</div>
        <div v-on:click="addPin(9)" class="pos-btn">9</div>
        <div v-on:click="addPin(0)" class="pos-btn">0</div>
        <div v-on:click="removePin()" class="pos-btn">C</div>
      </div>
      <div v-if="!isPaying">
        <b-button
          type="is-primary"
          v-on:click="unlockAndSend"
          style="margin-top: 15px"
          size="is-medium"
          >{{ $t("send").toUpperCase() }}</b-button
        >
      </div>
      <div v-if="isPaying">{{ $t("loadingSend") }}</div>
    </div>
    <!-- INSERIMENTO PIN -->

    <!-- PAGAMENTO EFFETTUATO -->
    <div class="fullscreen" v-if="showSuccess" style="background-image: none">
      <img src="../assets/paymentdone.gif" width="100%" /><br />
      <div style="padding: 20px">
        <h2 class="title is-3">{{ $t("congrats") }}</h2>
        <br />
        {{ $t("okTransaction") }}<br /><br /><br />
        <b-button
          type="is-primary"
          v-on:click="showSuccess = false"
          size="is-medium"
          >{{ $t("fallBack") }}</b-button
        >
      </div>
    </div>
    <!-- PAGAMENTO EFFETTUATO -->
  </div>
</template>

<script>
const EthDiD = require("eth-did-core");
const axios = require("axios");
import { Camera } from "@capacitor/camera";
import { Plugins } from "@capacitor/core";
const { BarcodeScanner } = Plugins;
import { Device } from "@capacitor/device";
const ABI_TOKEN = require("../abi/abi_token.json");
const ABI_DID = require("../abi/abi_did.json");

export default {
  data() {
    return {
      did: new EthDiD(true),
      device: {
        platform: "web",
      },
      address: "",
      hash: "",
      wallet: "",
      axios: axios,
      isLoading: true,
      mnemonic: "",
      showScan: false,
      isChecking: false,
      amount: "",
      showWaiting: false,
      showSendScan: false,
      showReceiveScan: false,
      showPin: false,
      showDigitalCard: false,
      isCheckingBalance: false,
      showScanAuth: true,
      showUnlock: false,
      isPaying: false,
      isWaiting: false,
      showSuccess: false,
      payment: {},
      interval: {},
      receiverAddress: "",
      pin: "",
      pindigits: [],
      activeTab: 0,
      fromHome: false,
      what: "",
      toAddress: "",
      apiURL: process.env.VUE_APP_BACKEND_URL,
    };
  },
  async mounted() {
    const app = this;
    app.device = await Device.getInfo();
    if (window.location.href.search("receive") !== -1) {
      app.activeTab = 1;
      app.fromHome = true;
    }

    const wallet = await app.did.returnWallet();
    if (wallet !== undefined) {
      app.wallet = wallet;
      app.address = app.wallet.master;
    }

    if (
      app.$route.params.address !== undefined &&
      app.$route.params.amount !== undefined
    ) {
      app.amountSidechain = app.$route.params.amount;
      app.toAddress = app.$route.params.address;
    }
    app.hash = localStorage.getItem("hash");
    app.isLogging = false;
    app.isLoading = false;
  },
  methods: {
    async startScan(what) {
      const app = this;
      app.$emit("scanning", true);
      if (app.device.platform !== "web") {
        console.log("Starging Scanner");
        await Camera.requestPermissions(["camera"]);
        const app = this;
        app.showScan = true;
        BarcodeScanner.hideBackground();
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          console.log("Readed QR", result.content);
          console.log("Actions is", what);
          app.showScan = false;
          app.checkScanned(result.content);
        }
      } else {
        app.what = what;
        app.showScan = true;
      }
    },
    onDecode(decodedString) {
      const app = this;
      app.showScan = false;
      console.log("Decoded QR-Code starting " + app.what + " action");
      app.checkScanned(decodedString);
    },
    async checkScanned(string) {
      const app = this;
      if (string.indexOf("0x") !== -1) {
        if (string.indexOf(":") !== -1) {
          let split = string.split(":");
          app.receiverAddress = split[0];
          app.amount = split[1];
          app.showScanAuth = false;
        } else {
          app.receiverAddress = string;
          app.showScanAuth = false;
        }
      } else {
        app.did.connect(process.env.VUE_APP_BLOCKCHAIN, '', process.env.VUE_APP_NETWORK)
        app.isChecking = true;
        const contract = await app.did.initContract(
          ABI_DID,
          process.env.VUE_APP_DID_CONTRACT
        );
        let public_hash = await app.did.hash(string);
        const check = await contract.methods
          .returnPublicAddress(public_hash)
          .call();
        app.did.disconnect();
        app.isChecking = false;
        if (check !== "0x0000000000000000000000000000000000000000") {
          app.receiverAddress = check;
          app.showScanAuth = false;
        } else {
          app.$buefy.toast.open({
            duration: 5000,
            message: "Questa tessera non è abilitata!",
            position: "is-bottom",
            type: "is-danger",
          });
        }
      }
    },
    stopScan() {
      const app = this;
      app.$emit("stopped", true);
      if (app.device.platform !== "web") {
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
        app.showScanModal = false;
      } else {
        app.showScan = false;
      }
    },
    checkAmountAndProceed() {
      const app = this;
      app.isCheckingBalance = true;
      setTimeout(async function () {
        app.amount = app.amount.replace(",", ".");
        if (app.amount > 0) {
          app.did.connect(process.env.VUE_APP_BLOCKCHAIN, '', process.env.VUE_APP_NETWORK)
          const contract = await app.did.initContract(
            ABI_TOKEN,
            process.env.VUE_APP_ERC20_CONTRACT
          );
          const balance = await contract.methods
            .balanceOf(app.wallet.master)
            .call();
          app.did.disconnect();
          app.isCheckingBalance = false;
          const fixedBalance = balance / 100;
          if (fixedBalance >= app.amount) {
            app.showPin = true;
          } else {
            app.amount = fixedBalance;
            app.isCheckingBalance = false;
            app.$buefy.toast.open({
              duration: 5000,
              message: "Non hai abbastanza fondi!",
              position: "is-bottom",
              type: "is-danger",
            });
          }
        } else {
          app.isCheckingBalance = false;
          app.$buefy.toast.open({
            duration: 5000,
            message: "Inserisci una quantità valida!",
            position: "is-bottom",
            type: "is-danger",
          });
        }
      }, 100);
    },
    addPin(number) {
      const app = this;
      let display = app.pin.toString();
      display = display.concat(number.toString());
      app.pin = display;
    },
    cleanPin() {
      const app = this;
      app.pin = "";
    },
    removePin() {
      const app = this;
      let display = app.pin.toString();
      let max = display.length - 1;
      display = display.substr(0, max);
      app.pindigits = [];
      if (display.length > 0) {
        app.pin = display;
        for (let i = 1; i <= app.pin.length; i++) {
          app.pindigits.push("*");
        }
      } else {
        app.pin = "";
      }
    },
    async unlockAndSend() {
      const app = this;
      console.log(
        "Unlocking and sending " +
          app.amount +
          " to address: " +
          app.receiverAddress
      );
      const mnemonic = await app.did.decryptWallet("", app.pin);
      if (mnemonic !== false) {
        app.isPaying = true;
        try {
          console.log("Connecting to network");
          app.did.connect(process.env.VUE_APP_BLOCKCHAIN, mnemonic, process.env.VUE_APP_NETWORK);
          await app.axios.get(
            app.apiURL + "/cards/check/" + app.wallet.hash
          );
          const contract = await app.did.initContract(
            ABI_TOKEN,
            process.env.VUE_APP_ERC20_CONTRACT
          );
          const fixedAmount = parseFloat(app.amount) * 100;
          // const gasPrice = await app.did.web3.eth.getGasPrice();
          const gasPrice = "1000000000";
          console.log("Gas price is: " + gasPrice);
          const tx = await contract.methods
            .transfer(app.receiverAddress, fixedAmount)
            .send({ from: app.wallet.master, gasPrice: gasPrice });
            app.did.disconnect();
          if (tx["transactionHash"] !== undefined) {
            app.isPaying = false;
            app.showSuccess = true;
            app.receiverAddress = "";
            app.pin = "";
            app.pindigits = [];
            app.showScanAuth = true;
            app.showPin = "";
            app.amount = "";
            console.log("Transaction success: " + tx["transactionHash"]);
            app.$buefy.toast.open({
              duration: 5000,
              message: "Transazione effettuata con successo!",
              position: "is-bottom",
              type: "is-success",
            });
          } else {
            app.isPaying = false;
            app.$buefy.toast.open({
              duration: 5000,
              message: "C'è un problema, si prega di riprovare!",
              position: "is-bottom",
              type: "is-danger",
            });
          }
        } catch (e) {
          console.log(e);
          app.isPaying = false;
          app.$buefy.toast.open({
            duration: 5000,
            message: "C'è un problema, si prega di riprovare!",
            position: "is-bottom",
            type: "is-danger",
          });
        }
      } else {
        app.$buefy.toast.open({
          duration: 5000,
          message: "Il pin non è valido!",
          position: "is-bottom",
          type: "is-danger",
        });
      }
    },
  },
  watch: {
    pin: function () {
      const app = this;
      app.pindigits = [];
      for (let i = 1; i <= app.pin.length; i++) {
        app.pindigits.push("*");
      }
    },
  },
};
</script>
<style>
.amount-input .input {
  text-align: center;
  font-size: 30px !important;
  margin-top: 5px;
  line-height: 30px;
}
</style>