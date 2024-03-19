<template>
  <q-dialog :maximized="$q.platform.is.mobile" v-model="visible" >
    <q-card class="bg-grey-2">
    <form class="login bg-grey-2 q-pa-lg full-width fit">
      <div class="toolbar" style="grid-area: toolbar">
        <q-btn class="on-right" icon="close" flat style="grid-area: close" v-close-popup/>

        <q-icon class="" size="5em" style="grid-area: icon; justify-self: center; align-self: center;" name="lock"/>
      </div>

        <div class="fit" style="justify-self: center; grid-area: details;">
          <q-input v-model="loginForm.user.username" label="Username" class="full-width"/>
          <q-input v-model="loginForm.user.password" label="Password" type="password" class="full-width"/>
          <q-checkbox v-model="loginForm.user.remember" label="Remember me" class="q-py-sm"/>
        </div>
        <div style="grid-area: buttons; display: grid; margin-top: -2em;">
          <q-btn label="Login" class="q-mx-xl" color="teal-6" style="" @click="login"/>
          <strong style="text-align: center; vertical-align: center; display: block; justify-self: center; margin: 0.5em 0em 0.5em 0em;"  class="q-ma-lg">Or</strong>
          <q-btn label="Create An Account" class="q-mx-xl" color="teal-6" style="" @click="create"/>
        </div>
    </form>

    <q-inner-loading :visible="loading">
      <q-spinner size="72px" />
    </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<style>

.login {
  display: grid;
  grid-template-rows: 2fr 3fr 8em;
  grid-template-areas:
    "toolbar"
    "details"
    "buttons";
  max-height: 50em;
}

.toolbar {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 3fr;
  grid-template-areas:
    ". close"
    "icon icon"
}

.icon {
  width: 10em;
  height: 10em;
}
</style>

<script>
import axios from 'axios'
import { Cookies } from 'quasar'
// import { Notify } from 'quasar'
import jwtDecode from 'jwt-decode'
// import { required, email } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      visible: false,
      loading: false,
      message: '',
      loginForm: {
        user:{
          username: '',
          password: '',
          remember: true
        }
      },
      loginFormServerErrors: {}
    }
  },

  methods: {
    toggleVisible: async function() {
      this.visible = !this.visible;
    },

    login: async function() {
      try {
        this.loading = true;
        this.loginForm.user.username = this.loginForm.user.username.toLowerCase()
        console.log('Sending login request...')
        var authRes = await axios.post('/users/login', this.loginForm);
        console.log('Login request successful!')

        // Set cookie and expiration time
        var decodedToken = jwtDecode(authRes.data.user.token);
        var tokenExpires = new Date(decodedToken.exp * 1000);
        Cookies.set('jwt_token', "Token "+ authRes.data.user.token, {
          expires: tokenExpires
        });

        console.log('Decoded token: ', decodedToken)

        // Set the cookie as an Axios header
        axios.defaults.headers.common['authorization'] = Cookies.get('jwt_token');
        // Retrieve the actual user

        console.log('retrieving user')
        let user = await this.$store.dispatch('main/retrieveUser');
        console.log('user retrieved')
        const message = "welcome back " + user.user.username;
        this.$q.notify({
          message: message,
          color: 'teal-7'
        })
        console.log('emitting updateServices event...')
        this.$emit('updateServices', user.services);
        console.log('Emitted Event')
        this.toggleVisible();
      } catch (exception) {
        console.log(exception)
        this.$q.notify(exception?.response?.data)
        this.loginFormServerErrors = exception?.response?.data;

        let message = "<strong>Errors</Strong><p class='text-weight-bold'>"
        for (let error of exception.response.data.errors) {
          message += "<br>" + error
        }
        message += "</p>"

        this.$q.notify({
          message: message,
          color: "red",
          html: true
        });
      } finally {
        this.loading = false;
      }
    },
    create: async function() {
      try {
        console.log("creating");
        this.loading = true;
        this.loginForm.user.username = this.loginForm.user.username.toLowerCase()
        const res = await axios.post('/users/create', this.loginForm);
        const message = "Your account was created successfully"
        this.$q.notify({
          message: message,
          color: 'teal-7'
        })
        await this.login();

      } catch (exception) {
        this.loginFormServerErrors = exception.response.data;

        let message = "<strong>Errors</Strong><p class='text-weight-bold'>"
        for (let error of exception.response.data.errors) {
          message += "<br>" + error
        }
        message += "</p>"

        this.$q.notify({
          message: message,
          color: "red",
          html: true
        })

      } finally {
        this.loading = false;
      }
    },
  }
}
</script>
