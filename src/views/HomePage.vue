<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="n of 12" :key="n" class="picture m-auto")
    a(href="")
      div(class="bg-gray-200 rounded-lg" style="width: 320px; height: 180px")
    div(class="flex mt-2")
      div(class="mini-avatar bg-gray-200")
      a(href="" class="text-midnightBlue pl-2") Name
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
