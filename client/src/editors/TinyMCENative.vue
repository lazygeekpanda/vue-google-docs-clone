<template>
  <div>
    <div class="container">
      <div>
        <div id="user-container">
          <div><strong>User List:</strong></div>
        </div>
        <div id="toolbar"></div>
        <textarea id="classic-editor" :value="editorData" :height="height" output-format="text"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/skins/ui/oxide/skin.css'

import tinymceConfig from './config'

import INITIAL_TEXT from './initialtext'
import { SOCKET_URL } from '../constants'

export default {
  name: 'TinyMCENative',

  data: () => ({
    editorData: INITIAL_TEXT,

    height: window.innerHeight - 40,
  }),

  computed: {
    initialConfig() {
      return tinymceConfig.config
    },

    $activeEditor() {
      return this.editor
    }
  },

  mounted() {
    this.$socket.emit('register', {
      documentId: '123456',
      handle: 'file-1'
    })

    window.tinyMCE.init({
      selector: '#classic-editor',
      branding: false,
      content_css: 'document',
      resize: false,
      menubar: true,
      height: this.height,
      toolbar_mode: 'floating',
      ...this.initialConfig,

      collaboration: {
        user: {
          name: (Math.random() + 1).toString(36).substring(7),
          key: 'test'
        },
        socketURL: SOCKET_URL
      },

      // Setup Events
      setup: (/* editor */) => {
        tinymceConfig.plugins()
      }
    })
  },

  sockets: {},

  methods: {}
}
</script>

<style>
.vue-plugins {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 15px 0;
}

.container {
  display: flex;
}

.container > div:first-child {
  flex: 1;
}

.sidebar {
  min-width: 250px;
  max-width: 250px;
}

.mce-pagebreak {
  width: 100%;
  height: 20px;

  background-color: #f4f4f4;
}

#user-container {
  display: flex;

  font-size: 12px;
}

#user-container > div {
  margin: 0 3px;
}
</style>
