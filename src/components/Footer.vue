<script setup lang="ts"></script>

<template lang="pug">
footer
  div(class="bg-bleachWhite px-2 sm:px-4 py-2.5 rounded pt-12 pb-36")
    div(class="container flex flex-wrap justify-between items-center mx-auto")
      router-link(to="/")
        h2(class="text-midnightBlue text-3xl font-bold") Graimer
  div(class="text-center bg-slate-600 text-white py-6")
    small Copyright &copy; 2020 Graimer. All rights reserved.
</template>

<style scoped></style>
