<template>
  <div id="app">
    <v-app>
      <TinyMCENative v-if="editor === 'TinyMCENative'" />
    </v-app>
  </div>
</template>

<script>
import TinyMCENative from './editors/TinyMCENative.vue'

export default {
  name: 'App',

  components: {
    TinyMCENative
  },

  data: () => ({
    editor: 'TinyMCENative'
  })
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

html,
body {
  margin: 0;
}
</style>
