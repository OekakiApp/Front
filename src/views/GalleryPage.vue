<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="n of 9" :key="n" class="picture m-auto")
    div(class="flex items-center")
      div(class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
    div(class="flex flex-col mt-1 ml-2")  
      div(class="text-midnightBlue") タイトル
      div(class="flex items-center mt-1") 
        div(class="tiny-avatar ring-2 bg-gray-200 ring-gray-700 ")
        div(class="text-midnightBlue text-sm pl-2") ネーム
</template>

<style scoped>
.tiny-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
