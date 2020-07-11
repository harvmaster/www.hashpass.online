<template>
  <q-dialog v-model="visible" persistent style="">
    <div class="bg-grey-2">
      <div class="row q-mx-md q-mt-md">
        <q-uploader ref="uploader" :label="label" dense autofocus :batch="batch" :multiple="multiple" :filter="filterFiles" :headers="header" :url="url" field-name="file" @uploaded="filesUploaded" @added="filesAdded" :form-fields="fieldForm" color="teal"/>
      </div>
      <div class="row q-ma-sm">
        <div class="col" />
        <div class="col-auto">
          <q-btn label="Cancel" flat v-close-popup />
          <q-btn flat ref="complete"  :label="(!uploaded && hasFiles ) || hasFiles ? 'Upload' : 'Done'" @click="uploadFiles" />
        </div>
      </div>
    </div>

  </q-dialog>
</template>

<script>
import axios from 'axios'
import { Cookies } from 'quasar'

const fileFormats = {
      images: ['image/*', 'image/png', 'image/jpeg', 'application/pdf'],
      documents: ['application/pdf'],
      videos: [],

  }
export default {
  created () {

  },
  data () {
    return {
      visible: false,
      header: [{name: 'authorization', value: Cookies.get('jwt_token')}],
      uploaded: false,
      hasFiles: false
    }
  },
  computed: {
    uploadlabel() {
      if (!this.$refs.uploader) return "Done"
      if (this.$refs.uploader.files < 1 || this.uploaded) return "Done"
      else return "Upload"
    }
  },
  methods: {
    toggleVisible: function() {
      this.visible = !this.visible;
      this.uploaded = false;
      this.hasFiles = false;
    },
    isValidSize: function(file) {
      const maxSize = this.$props.maxSize*1024;
      if (file.size < maxSize) return true;
      return false;
    },
    isValidFormat(file) {
      let valid = false;
      const formats = this.$props.accept;
      formats.forEach(format => {
        if (fileFormats[format]) {
          const list = fileFormats[format];
          list.forEach(type => {
            if (file.type === type) {
              valid = true;
            }
          })
        }
      })
      return valid;
    },

    filterFiles: function(files) {
      let fileList = [];
      files.forEach(file => {
        fileList.push({file: file, errors:{large: false, type: false}, id: fileList.length})
      });
      let totalSize = 0;
      let notification = {
        message: [],
        tooLarge: 0,
        wrongFormat: 0,
      };

      for (let i = 0; i < fileList.length; i++) {
        if (!this.isValidSize(fileList[i].file)) {
          fileList[i].errors.large = true;
          notification['tooLarge'] += 1;
        }
        if (!this.isValidFormat(fileList[i].file)) {
          fileList[i].errors.type = true;
          notification['wrongFormat'] += 1;
        }
        totalSize += fileList[i].file.size;
      }

      console.log(notification);
      if (notification['tooLarge'] > 0) notification['message'].push(`${notification['tooLarge']} of your files could not be added, must be under ${this.$props.maxSize}KB!`);
      if (notification['wrongFormat'] > 0) notification['message'].push(`${notification['wrongFormat']} of your files are an unsupported format!`)
      if (notification['message'].length > 0) {
        let displayMessage = '';
        notification['message'].forEach(line => displayMessage += `${line}<br />`);
        this.$q.notify({
          html: true,
          message: displayMessage,
          color: "red"
        })
      }

      if (totalSize > this.$props.maxTotalSize * 1024) {
        this.$q.notify(`You can only upload ${this.$props.maxTotalSize}KB at a time!`);
        return;
      }

      let accepted = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.errors.large && !file.errors.type) {
          accepted.push(fileList[i].file);
        }
      }
      return accepted;
    },
    fieldForm: function(files) {
      return [{name: "type", value: this.$props.bucket},
              {name: "service", value: this.$props.service}]
    },
    uploadFiles: async function(files) {
      if (this.uploaded || !this.hasFiles) {
        this.toggleVisible()
      } else {
        this.$refs.uploader.upload();
      }
    },
    filesUploaded: function(info) {
      console.log(info.xhr.response);
      this.hasFiles = false;
      this.uploaded = true;
    },
    filesAdded: function () {
      this.hasFiles = true;
      this.uploaded = false;
    }


  },
  props: {
    label: {
      type: String,
      default: () => 'Upload files'
    },
    accept: {
      type: Array,
      default: () => ['*']
    },
    maxSize: {
      type: Number,
      default: () => 2048
    },
    maxTotalSize: {
      type: Number,
      default: () => 8192
    },
    multiple: {
      type: Boolean,
      default: () => false
    },
    batch: {
      type: Boolean,
      default: () => false
    },
    url: {
      type: String,
      default: () => axios.defaults.baseURL + '/uploads'
    },
    bucket: {
      type: String,
      default: () => 'icons'
    },
    service: {
      type: String,
      default: () => "000s"
    }





  /*
   * Props left form the Autocomplete component
    newValue: {
      type: Boolean,
      default: () => true
    },
    dark: {
      type: Boolean,
      default: () => false
    },
    borderless: {
      type: Boolean,
      default: () => false
    },
    expand: {
      type: Boolean,
      default: () => false
    },
    dense: {
      type: Boolean,
      default: () => false
    },
    outlined: {
      type: Boolean,
      default: () => false
    },
    label: {
      type: String,
      required: true
    },
    useChips: {
      type: Boolean,
      default: () => false
    },
    options: {
      type: Array,
      default: () => []
    },
    */
  },
}
</script>

<style lang="stylus" scoped>

</style>
