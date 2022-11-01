<script setup lang="ts"></script>

<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="n of 12" :key="n" class="picture m-auto")
    
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
