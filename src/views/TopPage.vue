<script setup lang="ts">
type faqType = {
  question: string
  answer: string
}
const faqs: faqType[] = [
  {
    question: '偏愛マップって何ですか？',
    answer:
      '偏愛マップとは、自分が偏愛しているもの（＝要はすごく好きなもの）をマッピングしていくワークです。偏愛マップをきっかけに、人とよりよいコミュニケーションをはかろう、という趣旨でワークショップのアイスブレイクなどに用いられることが多いです。',
  },
  {
    question: '料金かかかりますか？',
    answer: '現在、全機能を無料で提供しています。有料化の予定は現状ありません',
  },
  {
    question: 'どんな機能が使えますか。',
    answer:
      '文字の入力、ペンツール、画像を使って作成できます。作った偏愛マップを公開するができます（非公開設定も可能です）',
  },
]
</script>

<template lang="pug">
div
  //- First View
  div(class="text-center")
    div(class="pt-96 pb-24")
      h1(class="text-9xl title mb-8") Graimer
      p Introduce Yourself with full of imagination
    p(class="mt-6 text-2xl") 自由な発想で、世界に一人の自分を紹介しよう
    div(class="d-flex mt-12 mb-48")
      router-link(class="btn btn-primary mr-6" to="/works") 作品を見る
      router-link(class="btn btn-primary ml-6" to="sign_up") 新規登録する
  //- How To Use
  div(class="card w-full p-24 bg-base-100 shadow-xl bg-slate-100 mb-36")
    div(class="card-body")
      h2(class="card-title text-5xl") How to Use
      p(class="text-2xl mb-6") 〜Graimerの使い方〜
      div(class="card-actions  pb-12")
        ul(class="steps steps-vertical")
          li(class="step") 登録する
          li(class="step") プロフィールを作成する
          li(class="step") 偏愛マップを作る
          li(class="step") 公開する

  //- FAQ
  div(class="card w-full p-24 bg-base-100 shadow-xl bg-slate-100 mb-36")
    div(class="card-body")
      h2(class="card-title text-5xl") FAQ
      p(class="text-2xl") 〜よくある質問〜
      div(class="card-actions justify-end pb-12")
      div(v-for="(faq, index) in faqs" :key=index class="collapse mb-6")
        input(type="checkbox" class="peer w-full")
        div(class="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content")
          p {{ faq.question }}
        div(class="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content")
          p {{ faq.answer}}
</template>

<style scoped></style>
