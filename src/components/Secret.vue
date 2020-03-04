<template>
  <q-dialog :maximized="$q.platform.is.mobile" v-model="visible" class="">
    <q-card class="bg-grey-2 secretcard" style="display: grid">
    <q-toolbar style="grid-area: header" class="bg-secondary text-white shadow-2">
      <strong style="font-size: 1.5em">Secret Key Input</strong>
      <q-space />
      <q-btn flat icon="cancel" round v-close-popup/>
    </q-toolbar>

    <q-input ref="secret" type="password" v-model="secret" @keydown.enter="setSecret" label="Secret" hint="Do not use the same password as your account" class="q-pa-xl" style="grid-area: input; align-self: center"/>

    <q-btn v-if="$q.platform.is.mobile" @click="setSecret" label="Okay" class="" style="margin: 0em 7em 4em 7em;grid-area: button; justify-self: center" color="green-5" />"

    <q-inner-loading :visible="loading">
      <q-spinner size="72px" />
    </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<style>
.secretcard {
  width: 30em;
  height: 18em;
  display: grid;
  grid: 0.33fr 1fr 0.33fr 0.33fr/ 3fr 1fr;
  grid-template-areas:
    'header header'
    'input input'
    'button button';
}

</style>

<script>
import axios from 'axios'
import { Cookies } from 'quasar'


export default {
  data () {
    return {
      visible: false,
      loading: false,
      secret: ''
    }
  },

  methods: {
    toggleVisible: function() {
      this.visible = !this.visible;
      if (this.visible) this.$refs.secret.focus()
    },
    setSecret: function() {
      const secret = this.secret;
      this.$q.sessionStorage.set('secret', secret);
      this.$emit("secretSet")
      this.toggleVisible();
    }

  }
}
</script>
