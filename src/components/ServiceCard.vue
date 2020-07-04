<template>
  <q-card class="card">
    <div class="container fit" @click="expanded" :style="[styling]">

      <q-img :src="service.logo" style="align-self: center; height: 3em; width: 3em; grid-area: icon;"/>

      <div style="grid-area: service;" class="text-h5 ellipsis">
        {{ service.name }}
      </div>

      <div style="grid-area: algorithm;" class="q-px-sm">
        <q-icon
        name="more_vert"
        >
          <q-popup-proxy :offset="[22, -32]">
            <q-list class="q-pt-sm">
              <q-item>
                <q-icon v-if="!updatingLegacy" :name="legacy ? 'hourglass_full' : 'hourglass_empty'" :color="legacy ? 'teal' : 'grey'" @click="changeLegacy"  size="sm">
                  <q-tooltip>
                    {{ legacy ? "Use updated Algorithm" : "Use Legacy Algorithm" }}
                  </q-tooltip>
                </q-icon>
                <q-spinner-hourglass color="teal" v-if="updatingLegacy" size="sm" />
              </q-item>
              <q-item>
                <q-icon v-if="!updatingLegacy" :name="'add_photo_alternate'" :color="legacy ? 'teal' : 'grey'" @click="toggleUploader" size="sm">
                  <q-tooltip>
                    {{ legacy ? "Use updated Algorithm" : "Use Legacy Algorithm" }}
                  </q-tooltip>
                 <!-- <q-popup-proxy :offset="[280, -31]">
                    <q-uploader />
                  </q-popup-proxy>
                  -->
                </q-icon>
              </q-item>
            </q-list>
          </q-popup-proxy>

        </q-icon>

        

        
      </div>

      <q-btn label="copy" color="teal" outline style="grid-area: button" @click="hash"/>
      <q-btn style="grid-area: delete" flat round color="red" icon="delete" @click="deleteService"/>
    </div>

    <uploader v-model="uploads" ref="uploader" :accept="['images']" :service="service.id" />

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
  grid-template-areas: "icon service algorithm" "icon button delete";
}

</style>

<script>
import axios from 'axios'
import { sha256 }  from 'js-sha256'
import copy from 'copy-to-clipboard';
import Uploader from './FileUploader_dialog'

export default {
  name: 'ServiceCard',
  data () {
    return {
      favicon: '',
      legacy: false,
      updatingLegacy: false,
      styling: {
        gridColumn: "auto / span 2"
      },
      uploads: []
    }
  },

  methods: {
    hash: function () {
      this.$emit('hash', {service: this.$props.service.name, legacy: this.legacy});
    },
    deleteService: async function() {
      let id = this.$props.service.name;
      let user = this.$store.state.main.user.id;
      let res = await axios.delete(`services/${user}/${id}`);
      if (res.status === 200) {
        this.$q.notify("Successfully deleted " + this.$props.service.name);
        this.$emit("deleted");
      } else {
        this.$q.notify("There was an issue deleting " + this.$props.service.name);
      }

    },
    expanded: function() {
      this.styling = {"grid-column": "auto / span 1"}
    },
    changeLegacy: async function() {
      this.updatingLegacy = true;
      this.legacy = !this.legacy;
      //call api to save change

      let id = this.$props.service.name;
      let user = this.$store.state.main.user.id;
      try {
        let res = await axios.put(`services/${user}/${id}`, {legacy: this.legacy});

        if(res.status === 200) {
          this.$q.notify("Successfully updated " + this.$props.service.name);
        } else {
          this.$q.notify("There was an issue updating " + this.$props.service.name);
        }
      } catch (e) {
        this.$q.notify(`There was an issue updating ${this.$props.service.name}, your change is still valid locally`);
      } finally {
        this.updatingLegacy = false;
      }
    },
    toggleUploader: function() {
      this.$refs.uploader.toggleVisible();

    }
  },

  async created() {
    this.legacy = this.$props.service.legacy
  },

  props: {
    service: {
      type: Object,
    }
  },
  
  components: {
    Uploader
  }
}
</script>
