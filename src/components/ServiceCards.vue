<template>
  <q-card class="card" @mouseover="hovered" @mouseleave="left" >
    <div class="container fit" >

      <q-img :src="service.favicon" :class="[blurred, 'focused']" style="grid-area: icon; align-self: center"/>

      <div style="grid-area: service;align-self: center" :class="['q-ml-md', 'text-h5', 'focused' ,blurred]">
        {{ service.name }}
      </div>

      <div v-if="blurred.blurred" class="hovered card">
        <q-btn label="Copy password" class="absolute-center" flat color="teal"/>
      </div>

    </div>

  </q-card>
</template>

<style lang="stylus">

.card {
  width: 12vw;
  height: 12vw;
}
.container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr;
  grid-template-areas:
    "icon service";
  margin: 1vw 1vw 1vw 1vw;
  position: relative
}

.focused {
  transition: all 0.1s;
  filter: blur(0px);
}

.blurred {
  transition: all 0.1s;
  filter: blur(2.8px) !important;
}

.hovered {
  position: absolute;
  opacity: 1;
  transition: all 0.1s;
  -webkit-transition: all 0.1s;
  top: -1vw;
  right: 1vw;
}

</style>

<script>
import axios from 'axios'

export default {
  name: 'ServiceCard',
  data () {
    return {
      blurred: {
        blurred: false
      },
    }
  },

  methods: {
    getFavicon: async function() {
      this.$props.service.favicon = "../statics/icons/lock.svg"
      const res = await axios.get("https://favicongrabber.com/api/grab/" + this.$props.service.name + ".com");
      if (res.data.error > 0 || res.data.icons.length === 0) {
        return;
      }
      console.log(res.data)
      this.$props.service.favicon = res.data.icons[0].src;
      return;
    },
    hovered: function() {
      this.blurred = {
        blurred: true
      }
    },
    left: function() {
      this.blurred = {
        blurred: false
      }
    }
  },

  created() {
    this.getFavicon();
  },

  props: {
    service: {
      type: Object,
    }
  }
}
</script>
