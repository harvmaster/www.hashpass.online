import { sha256 } from 'js-sha256';
import copy from 'copy-to-clipboard';

export default {
  methods: {
    hash(service) {
      const secret = this.$q.sessionStorage.getItem('secret');
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



    }
  }
}
