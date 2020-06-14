<template>
  <q-page class="flex flex-center" style="min-height: 100vh !important;">
    <div class=" servicepage bg-teal-4 q-py-xl">
      <div style="grid-area: header; display: grid" class="header">
        <div style="grid-area: icon; display: grid; grid-template-columns: 2fr auto 2 fr; grid-template-area: '. ic .'" class="fit">
          <q-icon name="lock_open" class="" :color="lockColor" rounded size="5em" style="grid-area: ic" @click="toggleLogin" @mouseover="lockColor='red-4'" @mouseleave="lockColor='grey-9'"/>
        </div>
        <div style="grid-area: subtitle; text-align: center" class="text-subtitle2">{{ !$store.state.main.user ? 'Click the lock icon to login in' : 'You are logged in as ' + $store.state.main.user.username }}</div>

        <q-input filled v-model="service" ref="serviceInput" bg-color="grey-2" class="q-pt-md" outlined label="Service" style="grid-area: search" @keydown.enter="hash(null)" @keydown="filter" />


        <a style="grid-area: clearbit; text-align: center;" class="q-pt-sm" href="https://clearbit.com">Logos provided by Clearbit</a>

      </div>
      <div style="grid-area: services" class="services">

        <div style="grid-area: servicecards; display: grid" class="q-pa-md service-cards">
          <service-card v-for="service in $store.state.main.services" :service="service" class="" :key="service.name" @deleted="updateServices" @hash="hash" style="" />

        </div>

      </div>
      <login-modal ref="loginModal" class="" @updateServices='updateServices' />
      <secret-modal ref="secretModal" @secretSet="hash" />
      <logout-modal ref="logoutModal" />
    </div>
  </q-page>


</template>

<style>

.servicepage {
  width: 100vw;
  min-height: 100vh;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 7fr 1fr;

  grid-template-areas:
    ". header ."
    ". services .";

}

.header {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 2fr 1fr auto 1fr;
  grid-template-areas:
    "icon"
    "subtitle"
    "search"
    "clearbit";
}

.services {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    " servicecards";
}

.service-cards {
  display: grid;
  justify-content: center;
  align-items: start;
  grid-template-rows: repeat(auto, 7.5em);
  grid-gap: 1em;
  height: 100%;
}

@media only screen and (min-width: 600px){
  .header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas:
      ". icon ."
      ". subtitle ."
      ". search ."
      ". clearbit .";
  }

  .service-cards {
    display: grid;
    justify-content: center;
    align-items: start;
    grid-template-rows: repeat(auto-fit, 7.5em);
    grid-template-columns: repeat(auto-fill, 15em);
    grid-auto-flow: dense;
    grid-gap: 1em;
  }
}

</style>

<script>
import ServiceCard from "../components/ServiceCard.vue";
import LoginModal from '../components/Login';
import SecretModal from '../components/Secret';
import LogoutModal from '../components/Logout';
import { sha256 } from 'js-sha256';
import copy from 'copy-to-clipboard';
import axios from 'axios'
import { Cookies } from 'quasar'
import Fuse from 'fuse.js'
import { mapGetters } from 'vuex'

export default {
  name: 'PageIndex',
  data () {
    return {
      loginModal: false,
      lockColor: 'grey-9',
      service: ''
    }
  },

  methods: {
    toggleLogin: async function() {
      const loggedIn = await this.$store.dispatch('main/isLoggedIn')
      if (!loggedIn) {
        return this.$refs.loginModal.toggleVisible();
      } else {
        return this.$refs.logoutModal.toggleVisible();
      }
    },
    toggleSecret: function(service) {
      this.$refs.secretModal.toggleVisible(service);
    },

    hash: async function (serviceObj) {
      if (!serviceObj) serviceObj = {};

      console.log(serviceObj.service)
      let service = serviceObj.service;
      let legacy = serviceObj.legacy;

      if (!service) service = this.service.toLowerCase();
      const secret = this.$q.sessionStorage.getItem('secret');

      if (!service) return this.$q.notify({color: 'red', message: 'Please enter a service'});

      if (!secret) return this.toggleSecret(service);

      let combined = secret + "-" + service;

      if (legacy) {
        for (let i = 0; i < 65535; i++) {
          combined = sha256.digest(combined)
        }
        combined = sha256(combined);
      } else {
        for (let i = 0; i < 65536; i++) {
          combined = sha256(combined);
        }
      }

      combined = combined.slice(0, 16)
      combined = 'z' + combined.slice(1, 16)
      combined = combined.slice(0, 4) + '7' + combined.slice(5, 16)
      combined = combined.slice(0, 9) + 'H' + combined.slice(10, 16)
      combined = combined.slice(0, 15) + '!'

      copy(combined)
      this.$q.notify({
        message: "Copied <strong style='color: teal; font-size: 1.5em'> " + service + " </strong> password to clipboard",
        html: true
      })

      const res = await axios.post('/services/create', {service: service, legacy: legacy});
      if (res.status === 204) return;
      let services = this.$q.localStorage.getItem('services');
      services.push(res.data.service);
      this.$q.localStorage.set('services', services);
      this.updateServices(services);
      this.service = ''
    },


    filter: function() {
      const services = this.services;
      const fuseOptions = {
        keys: ['name']
      }
      console.log("1")
      let fuse = new Fuse(services, fuseOptions);

      let results = fuse.search(this.service)
      console.log(results);

      for (let result in results) {
        results[result].key = result;
      }

      let reordered = results;
      for (let service of services) {

        if (!results.includes(service)) {
          service.key = reordered.length;
          reordered.push(service);
        }
      }
      this.services = reordered;


    },

    deleteService: function(service) {
      this.$store.commit('main/deleteService', service);
    },
    updateServices: async function(services) {
      if (!services) {
        this.$store.dispatch('main/retrieveServices');
      } else {
        this.$store.commit('main/setServices', services);
      }
    },
  },

  mounted() {
    this.$refs.serviceInput.focus();
  },


  created: async function() {
    if (this.$q.localStorage.has('services')) {
      this.services = this.$q.localStorage.getItem("services")
    }
    this.services = await this.$store.dispatch('main/retrieveServices')
  },

  components: {
    ServiceCard,
    LoginModal,
    SecretModal,
    LogoutModal
  }
}
</script>
