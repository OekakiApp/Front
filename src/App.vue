<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
import router from '@/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
const auth = getAuth()

onAuthStateChanged(auth, (user) => {
  if (user) {
    authStore.setUser(user)
    console.log('ログイン成功')
  } else {
    console.log('ログイン失敗')
  }
})

const path = ref('')

router.afterEach((to) => {
  path.value = to.path
})
</script>

<template lang="pug">
Header

main(class="container mx-auto px-2 sm:px-4")
  RouterView

</template>
