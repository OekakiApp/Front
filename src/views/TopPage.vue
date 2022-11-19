<script setup lang="ts">
type faqType = {
  question: string
  answer: string
}
const faqs: faqType[] = [
  {
    question: '偏愛マップって何ですか？',
    answer:
      '偏愛マップとは、自分が偏愛しているもの（＝要はすごく好きなもの）をマッピングしていくワークです。\n「偏愛マップをきっかけに、人とより良いコミュニケーションを図ろう」という趣旨で、ワークショップのアイスブレイクなどに用いられることが多いです。',
  },
  {
    question: '料金はかかりますか？',
    answer:
      '現在、全機能を無料で提供しています。有料化の予定は現状ありません。',
  },
  {
    question: 'どんな機能が使えますか？',
    answer:
      '文字の入力、ペンツール、画像を使って偏愛マップを作成し、画像としてダウンロードすることができます。',
  },
  {
    question: 'デバイスは何に対応していますか？',
    answer: 'PC(Mac, Windows)に対応しています。',
  },
  {
    question: '今後ももちろん開発を続けていきますよね？',
    answer:
      'はい、もちろんです。予定では、iPad対応、偏愛マップの共有機能、自己紹介配信機能を実装することになっています。',
  },
]
</script>

<template lang="pug">
div
  //- First View
  div(class="text-center sm:mb-36 mb-24")
    div(class="sm:pt-48 pt-12 sm:pb-24 pb-6")
      h1(class="sm:text-9xl text-6xl title font-bold mb-8") Graimer
      p(class="sm:text-2xl") Introduce Yourself with full of imagination
    p(class="text-2xl") 自由な発想で、世界に一人の自分を紹介しよう
    div(class="d-flex mt-12")
      router-link(class="btn border-chardonnay bg-chardonnay hover:bg-dustyOrange hover:border-dustyOrange" to="sign_up") 新規登録する
  //- How To Use
  div(class="card w-full sm:p-16 p-8 shadow-xl bg-slate-100 sm:mb-36 mb-24")
    div(class="card-body p-0")
      h2(class="card-title sm:text-5xl text-4xl") How to Use
      p(class="sm:text-2xl sm:mb-6 mb-4") 〜Graimerの使い方〜
      div(class="card-actions")
        ul(class="steps steps-vertical")
          li(class="step") 登録する
          li(class="step") プロフィールを作成する
          li(class="step") 偏愛マップを作る
          li(class="step") 公開する

  //- FAQ
  div(class="card w-full sm:p-16 p-8 shadow-xl bg-slate-100 sm:mb-36 mb-24")
    div(class="card-body p-0")
      h2(class="card-title sm:text-5xl text-4xl") FAQ 
      p(class="sm:text-2xl sm:mb-8 mb-4") 〜よくある質問〜
      div(v-for="(faq, index) in faqs" :key=index class="collapse mb-6")
        input(type="checkbox" class="peer w-full")
        div(class="collapse-title pr-0 bg-chardonnay text-black peer-checked:bg-antiChardonnay  peer-checked:text-secondary-content")
          p {{ faq.question }}
        div(class="collapse-content bg-chardonnay text-black peer-checked:bg-antiChardonnay peer-checked:text-secondary-content whitespace-pre-wrap")
          p {{ faq.answer}}
</template>

<style scoped></style>
