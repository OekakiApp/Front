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
//- コンポーネント化
<nav class="bg-bleachWhite px-2 sm:px-4 py-2.5 rounded ">
  <div class="container flex flex-wrap justify-between items-center mx-auto">
    <a href="/">
      <h1 class="text-midnightBlue text-xl font-bold">App Name</h1>
    </a>
    <div>
      <ul class="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
        <li>
          <a href="#" class="text-midnightBlue">新規登録</a>
        </li>
        <li>
          <a href="#" class="text-dustyOrange">ログイン</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<main class="container mx-auto px-2 sm:px-4">
  <RouterView/>
</main>

</template>
