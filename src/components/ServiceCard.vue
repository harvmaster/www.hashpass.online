<template>
  <q-card class="card">
    <div class="container fit" @click="expanded" :style="[styling]">

      <q-img :src="service.logo" style="align-self: center; height: 3em; width: 3em; grid-area: icon;"/>

      <div style="grid-area: service;" class="text-h5 ellipsis">
        {{ service.name }}
      </div>

      <q-btn label="copy" color="teal" outline style="grid-area: button" @click="hash"/>
      <q-btn style="grid-area: delete" flat round color="red" icon="delete" @click="deleteService"/>
    </div>

  </q-card>
</template>

<style lang="stylus">

.card {
  width: 100%;
  height: 100%;
  max-height: 7.5em;
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

  methods: {
    hash: function () {
      this.$emit('hash', this.$props.service.name)
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
    //this.favicon = await this.getFavicon();
  },

  props: {
    service: {
      type: Object,
    }
  }
}
</script>
