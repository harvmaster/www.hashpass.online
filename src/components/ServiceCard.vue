<template>
  <q-card class="card">
    <div class="container fit" @click="expanded" :style="[styling]">

      <q-img :src="favicon" style="align-self: center; height: 3em; width: 3em; grid-area: icon;"/>

      <div style="grid-area: service;" class="text-h5 ellipsis">
        {{ service.name }}
      </div>

      <q-btn label="copy" color="teal" outline style="grid-area: button" @click="hashService"/>
      <q-btn style="grid-area: delete" flat round color="red" icon="delete" @click="deleteService"/>
    </div>

  </q-card>
</template>

<style lang="stylus">

.card {
  width: 100%;
  height: 100%;
  transition: all 0.2s;
}
.container {
  padding: 1em;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 2fr 2em;
  grid-template-areas: "icon service service" "icon button delete";
}

</style>

<script>
import axios from 'axios'
import { sha256 }  from 'js-sha256'
import copy from 'copy-to-clipboard';

export default {
  name: 'ServiceCard',
  data () {
    return {
      favicon: '',
      styling: {
        gridColumn: "auto / span 2"
      }
    }
  },

  computed: {

  },

  methods: {
    getFavicon: async function() {
      const name = this.$props.service.name.replace(new RegExp(' ', 'g'), '')
      const favicon = await axios.get(`https://favicongrabber.com/api/grab/${name}.com`).catch(() =>{return '../statics/icons/lock.svg'});

      console.log(favicon.data);

      try {
        if (favicon.data.icons.length === 0 ) throw(`No Icons found for ${name}`)
        return favicon.data.icons[0].src;
      } catch (e) {
        console.log(e)
        return '../statics/icons/lock.svg';
      }
    },
    hashService: function() {
      console.log(this.$props.service)
      if (!this.$props.service.name) return;
      if (!this.$q.sessionStorage.has('secret')) return this.$emit('nosecret');

      const secret = this.$q.sessionStorage.getItem('secret');
      const service = this.$props.service.name;
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

    },
    deleteService: async function() {
      let id = this.$props.service.name;
      let user = this.$store.state.main.user.id;
      let res = await axios.delete(`services/${user}/${id}`);
      if (res.status === 200) {
        this.$q.notify("Successfully deleted " + this.$props.service.name);
        this.$emit("deleted");
      } else {
        this.$q.notify("There was a issue deleting " + this.$props.service.name);
      }

    },
    expanded: function() {
      this.styling = {"grid-column": "auto / span 1"}
    }
  },

  async created() {
    this.favicon = await this.getFavicon();
  },

  props: {
    service: {
      type: Object,
    }
  }
}
</script>
