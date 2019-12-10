<template>
  <div id="root">
    <h1>Welcome to the Electron Playground</h1>
    <div v-if="!logging_in && !logging_out">
      <button v-if="!logged_in" @click="logMeIn">Authenticate Me</button>
      <div v-else>
        <button @click="getUserData">Get My Info</button>
        <button @click="logMeOut">Log Me Out</button>
      </div>
    </div>
    <div v-else>Logging {{ logging_in ? 'in' : 'out' }}</div>
    <div v-if="user_data && !retrieving_user_data">
      <pre>{{ user_data }}</pre>
    </div>
    <div v-if="user_image && !retrieving_user_image">
      <img :src="user_image" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ipcRenderer } from 'electron'

export default Vue.extend({
  data() {
    return {
      logging_in: false,
      logging_out: false,
      logged_in: false,
      retrieving_user_data: false,
      user_data: undefined,
      retrieving_user_image: false,
      user_image: undefined
    }
  },
  methods: {
    logMeIn() {
      this.logging_in = true
      ipcRenderer.send('LOGIN_WITH_AZURE')
      ipcRenderer.once('LOGIN_COMPLETE', () => {
        this.logged_in = true
        this.logging_in = false
        this.getUserData()
      })
    },
    getUserData() {
      this.retrieving_user_data = true
      this.retrieving_user_image = true
      ipcRenderer.send('GET_USER_DATA')
      ipcRenderer.send('GET_USER_IMAGE')
      ipcRenderer.once('USER_DATA_RETRIEVED', (event, payload) => {
        this.user_data = payload
        this.retrieving_user_data = false
      })
      ipcRenderer.once('USER_IMAGE_RETRIEVED', (event, payload) => {
        // @ts-ignore
        this.user_image = payload
        this.retrieving_user_image = false
      })
    },
    logMeOut() {
      this.logging_out = true
      this.user_data = undefined
      this.user_image = undefined
      ipcRenderer.send('LOGOUT_WITH_AZURE')
      ipcRenderer.once('LOGOUT_COMPLETE', () => {
        this.logged_in = false
        this.logging_out = false
      })
    }
  },
  mounted() {
    this.logMeIn()
  }
})
</script>
