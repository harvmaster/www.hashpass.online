<template>
  <q-page class="flex flex-center" style="">
    <div class=" servicepage bg-teal-4 q-py-xl">
      <div style="grid-area: header; display: grid" class="header">
        <div style="grid-area: icon; display: grid; grid-template-columns: 2fr auto 2 fr; grid-template-area: '. ic .'" class="fit">
          <q-icon name="lock_open" class="" :color="lockColor" rounded size="5em" style="grid-area: ic" @click="toggleLogin" @mouseover="lockColor='red-4'" @mouseleave="lockColor='grey-9'"/>
        </div>
        <div style="grid-area: subtitle; text-align: center" class="text-subtitle2">{{ !$store.state.main.user ? 'Click the lock icon to login in' : 'You are logged in as ' + $store.state.main.user.username }}</div>

        <q-input filled v-model="service" ref="serviceInput" bg-color="grey-2" class="q-pt-md" outlined label="Service" style="grid-area: search" @keydown.enter="hashService" @keydown="filter" />

      </div>
      <div style="grid-area: services" class="services">

        <div style="grid-area: servicecards; display: grid" class="q-pa-md service-cards">
          <service-card v-for="service in services" :service="service" class="" :key="service.name" @deleted="updateServices" @nosecret="toggleSecret" style="" />
        </div>
      </div>
      <login-modal ref="loginModal" class="" @updateServices='updServices' @secretSet="hashService" />
      <secret-modal ref="secretModal" />
    </div>
  </q-page>

  <!--
  <q-select v-model="service" ref="serviceInput" bg-color="grey-2" filled class="q-pt-sm" outlined  use-input label="Service" style="grid-area: search" @keydown="changeInputModel"  @keydown.enter="hashService" :options="services" @filter="filterServices">

          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              @click="log(scope)"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>

        </q-select>
  -->


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
  grid-template-rows: 2fr 1fr auto;
  grid-template-areas:
    "icon"
    "subtitle"
    "search";
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
      ". search .";
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
import { sha256 } from 'js-sha256';
import copy from 'copy-to-clipboard';
import axios from 'axios'
import { Cookies } from 'quasar'
import Fuse from 'fuse.js'

export default {
  name: 'PageIndex',
  data () {
    return {
      services: [],
      options: [],
      loginModal: false,
      lockColor: 'grey-9',
      service: ''
    }
  },

  watch: {

  },

  methods: {
    toggleLogin: function() {
      return this.$refs.loginModal.toggleVisible();

    },
    log: function(s) {
      console.log(s);
    },
    hashService: async function() {
      if (!this.service) {
        return this.$q.notify({color: "red", message: "Service can not be blank"});
      }
      if (!this.$q.sessionStorage.has('secret')) {
        return this.toggleSecret();

      }

      const secret = this.$q.sessionStorage.getItem('secret');
      const service = this.service;
      let combined = secret + "-" + service;

      for (let i = 0; i < 65536; i++) {
        combined = sha256(combined);
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

      const createRes = await axios.post('/services/create', {service: this.service});
      if (createRes.status === 204) return;
      if (this.services.includes(createRes.data.service)) {
        return console.log("Was already in the array");
      }
      this.services.push(createRes.data.service);
      this.$q.localStorage.set('services', this.services)
      Cookies.set('services', this.services)

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

    updateServices: async function() {
      this.services = await this.$store.dispatch('main/retrieveServices');
    },
    updServices: function(services) {
      this.services = services;
    },
    toggleSecret: function() {
      this.$refs.secretModal.toggleVisible();
    }
  },

  mounted() {
    this.$refs.serviceInput.focus();
    this.services = Cookies.get('services')
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
    SecretModal
  }
}
</script>
