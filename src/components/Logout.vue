<template>
  <q-dialog :maximized="$q.platform.is.mobile" v-model="visible" >
    <q-card class="bg-grey-2">
    <form class="logout bg-grey-2 q-pa-lg full-width fit">
      <div class="toolbar" style="grid-area: toolbar">
        <q-btn class="on-right" icon="close" flat style="grid-area: close" v-close-popup/>

        <q-icon class="" size="5em" style="grid-area: icon; justify-self: center; align-self: center;" name="lock"/>
      </div>
      <div style="grid-area: details; text-align: center">
        <strong>You are logged in as {{ $store.state.main.user.username }}</strong>
      </div>

       <div style="grid-area: buttons; display: grid; text-align: center">
          <q-btn label="Logout" class="q-mx-xl" color="teal-6" style="" @click="logout"/>
          <strong style="text-align: center; vertical-align: center; display: block; justify-self: center; margin: 0.5em 0em 0em 0em"  class="q-ma-lg">Or</strong>
          <q-btn label="Reset Secret" class="q-mx-xl" color="teal-6" style="" @click="resetSecret"/>
        </div>
    </form>

    <q-inner-loading :visible="loading">
      <q-spinner size="72px" />
    </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<style>

.logout {
  display: grid;
  grid-template-rows: 2fr 1fr 1.5fr;
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
import { Notify } from 'quasar'

export default {
  data () {
    return {
      visible: false,
      loading: false
    }
  },

  methods: {
    toggleVisible: async function() {
      this.visible = !this.visible;
    },
    logout: function() {
      this.toggleVisible()
      this.$nextTick( () => {
        this.$store.dispatch('main/logoutUser');
        this.$q.sessionStorage.remove('secret');
      });
      this.$q.notify({
        message: "You are now logged out",
        color: 'teal-7'
      })
    },
    resetSecret: function() {
      this.$q.sessionStorage.remove('secret');
      this.toggleVisible();
      this.$q.notify({
        message: "Your secret key has been reset",
        color: 'teal-7'
      })
    }
  }
}
</script>
