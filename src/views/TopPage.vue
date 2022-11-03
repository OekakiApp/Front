<script setup lang="ts"></script>

<template lang="pug">
div
  //- First View
  div(class="text-center")
    div(class="pt-96 pb-24")
      h1(class="text-9xl") Graimer
    p(class="mt-6 text-2xl") 自由な発想で、世界に一人の自分を紹介しよう
    div(class="d-flex mt-12 mb-48")
      router-link(class="btn btn-primary mr-6" to="/works") 作品を見る
      router-link(class="btn btn-primary ml-6" to="sign_up") 新規登録する
  //- How To Use
  //- FAQ
  div(class="card w-full p-24 bg-base-100 shadow-xl bg-slate-100 mb-36")
    div(class="card-body")
      h2(class="card-title text-5xl") FAQ
      p(class="text-2xl") 〜よくある質問〜
      div(class="card-actions justify-end pb-12")
      div(class="collapse")
        input(type="checkbox" class="peer w-full")
        div(class="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content")
          | Click me to show/hide content
        div(class="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content")
          p hello
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
