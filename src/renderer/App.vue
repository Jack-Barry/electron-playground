<template>
  <div id="root">
    <h1>Welcome to the Electron Playground</h1>
    <button @click="authenticateMe">Authenticate Me</button>
    <button @click="logMeOut">Log Me Out</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ipcRenderer } from 'electron'

export default Vue.extend({
  methods: {
    authenticateMe() {
      ipcRenderer.send('AUTHENTICATE_ME')
    },
    logMeOut() {
      ipcRenderer.send('DEAUTHENTICATE_ME')
    }
  }
})
</script>
