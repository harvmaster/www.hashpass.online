<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { Cookies } from 'quasar'
import axios from 'axios'

export default {
  name: 'Hashpass',
  created: function() {
    // Setup Base URL for API
    //axios.defaults.baseURL = 'http://localhost:3000/api'
    axios.defaults.baseURL = 'https://api.hashpass.online/api';
    //axios.defaults.headers.common['Origin'] = 'http://youlease.com.au';

    // If there is a JWT token, get the user
    var jwtToken = Cookies.get('jwt_token');
    if (jwtToken) {
      axios.defaults.headers.common['authorization'] = jwtToken;
      this.$store.dispatch('main/retrieveUser');

    }
  }
}
</script>
