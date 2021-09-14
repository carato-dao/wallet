<template>
  <div class="home">
    <div v-if="isLoading">
      <b-loading
        :is-full-page="true"
        :active.sync="isLoading"
        :can-cancel="true"
      ></b-loading>
    </div>
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
          <p style="font-size: 16pt; color: white; font-weight: bold">Eventi</p>
        </div>
      </div>
    </div>
    <div class="container-payment">
      <div v-if="events.length > 0">
        <div
          v-for="event in events"
          v-bind:key="event.id"
          style="
            text-align: left;
            margin: 10px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
          "
        >
          {{ event.associazione }}<br />
          <b style="font-size: 22px">{{ event.titolo }}</b
          ><br />
          {{ event.data.split('-')[2]+'/'+event.data.split('-')[1]+'/'+event.data.split('-')[0] }} {{ event.orario }} a
          <b>{{ event.luogo }}</b>
        </div>
      </div>
      <div v-if="events.length === 0" style="padding: 20px">
        Ci dispiace, non ci sono eventi al momento...
      </div>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data() {
    return {
      axios: axios,
      isLoading: true,
      events: [],
      currency: "eur",
      apiURL: process.env.VUE_APP_BACKEND_URL,
    };
  },
  async mounted() {
    const app = this;
    await app.fetchEvents();
    app.isLoading = false;
  },
  methods: {
    async fetchEvents() {
      const app = this;
      let events = await app.axios.get(app.apiURL + "/events/all");
      app.events = events.data;
      return true;
    },
  },

  watch: {
    amountLyra: function () {
      const app = this;
      app.calculateFIAT();
    },
    amountFIAT: function () {
      const app = this;
      app.calculateLyra();
    },
    guestpin: function () {
      const app = this;
      app.guestpindigits = [];
      for (let i = 1; i <= app.guestpin.length; i++) {
        app.guestpindigits.push("*");
      }
    },
  },
};
</script>
