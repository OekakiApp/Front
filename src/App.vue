<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { RouterView } from "vue-router";
import { ref } from "vue";
import router from "./router";

const path = ref("");

router.afterEach((to) => {
  path.value = to.path;
});
</script>

<template lang="pug">
<nav class="px-2 sm:px-4 py-2.5 rounded ">
  <div class="container flex flex-wrap justify-between items-center mx-auto">
    <a href="/">
      <h1 class="text-xl font-bold" style="color: #272556">App Name</h1>
    </a>
    <div>
      <ul class="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
        <li>
          <a href="#" style="color: #272556">新規登録</a>
        </li>
        <li>
          <a href="#" style="color: #F5843E">ログイン</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<main class="inner">
  <RouterView />
</main>

</template>

<style scoped>
nav {
  background-Color: #FFF2DC
}
</style>
