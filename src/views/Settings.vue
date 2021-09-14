<template>
  <div class="settings">
    <div v-if="isLoading">
      <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="true"></b-loading>
    </div>
    <div v-if="!isLoading">
      <div class="menu-top">
        <div class="columns is-mobile" style="margin-top: 2px;">
          <div class="column is-one-quarter-mobile">
            <a href="/#/">
              <img src="/img/left-arrow.png" style="height: 20px; margin-top: 6px;" />
            </a>
          </div>
          <div class="column is-one-quarter-mobile">
            <p style="font-size: 16pt; color: white; font-weight: bold;">{{$t('settings')}}</p>
          </div>
        </div>
      </div>
      <div class="container-setting">
        <div class="box" style="margin-top: 80px; margin-left: 10px; margin-right: 10px;">
          <article class="media">
            <div class="media-left">
              <figure class="image is-32x32">
                <img src="/img/global.svg" style="margin-top: 5px;" />
              </figure>
            </div>
            <div class="media-content">
              <div class="content">
                <b-field>
                  <b-select placeholder="Select a language" v-model="storedLanguage">
                    <option
                      v-for="(lang, i) in langs"
                      :key="`Lang${i}`"
                      :value="lang"
                    >{{ langToLanguage(lang) }}</option>
                  </b-select>
                </b-field>
              </div>
            </div>
          </article>
        </div>
        <div class="box" style="margin-left: 10px; margin-right: 10px;">
          <article class="media">
            <div class="media-left">
              <figure class="image is-32x32">
                <img src="/img/token.png" style="margin-top: 5px;" />
              </figure>
            </div>
            <div class="media-content">
              <div class="content">
                <a href="https://carato.org" target="_blank">
                  <div class="buttons">
                    <b-button style="color: #959495">{{$t('caratoLink')}}</b-button>
                  </div>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data() {
    return {
      address: "",
      wallet: "",
      axios: axios,
      currency: "eur",
      isLoading: true,
      langs: ["it", "en"],
      storedLanguage: "en"
    };
  },
  async mounted() {
    const app = this;
    app.storedLanguage = localStorage.getItem('language')
    app.isLoading = false;
  },
  watch: {
      storedLanguage() {
        const app = this
        app.$i18n.locale = app.storedLanguage
        localStorage.setItem('language', app.storedLanguage)
      }
  },
  methods: {
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
  },
};
</script>
