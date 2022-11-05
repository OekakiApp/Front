<script setup lang="ts">
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="(canvas, index) of authStore.canvases" :key="index" class="picture m-auto")
    router-link(:to="{name: 'Create', params: { canvas_id: index }}")
      div(class="bg-gray-200 rounded-lg" style="width: 320px; height: 180px")
    div(class="flex mt-2")
      div
        img(:src="authStore.icon" class="mini-avatar ring-2 ring-gray-700 ")
      a(href="" class="text-midnightBlue pl-2") {{ canvas.name }}
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
