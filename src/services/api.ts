import axios, { AxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_ROOT_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

const getAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh')
  const accessToken = await api.post('/auth/jwt/refresh/', {
    refresh: refreshToken,
  })
  return accessToken
}

// 共通前処理
api.interceptors.request.use((_config: AxiosRequestConfig<any>) => {
  // 認証用トークンがあればリクエストヘッダに加える
  const config = _config
  const token: string | null = localStorage.getItem('access')

  if (token != null && config.headers != null) {
    config.headers.Authorization = `JWT ${token}`
  }
  return config
})

// 共通後処理
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // エラーの種類に応じたハンドリングをおこなう
    switch (error.response?.status) {
      // バリデーションNG
      case 400: {
        // オブジェクトのプロパティの値（メッセージの配列）をフラットな配列に変換
        const messages = Object.values(error.response.data).flat()
        const syntax = { level: 'warning', messages }
        await Promise.reject(syntax)
        break
      }
      // 認証エラー
      case 401:
        getAccessToken()
          .then(async (token) => {
            localStorage.setItem('access', token.data.access)
            await api.request({
              ...error.config,
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
            })
          })
          .catch(async () => {
            console.log(error)
            await Promise.reject(new Error('認証エラーです。'))
          })
        return
      // 権限エラー
      case 403:
        await Promise.reject(new Error('権限エラーです。'))
        break
      // その他のエラー
      default:
        console.log(error)
        await Promise.reject(new Error('想定外のエラーが発生しました。'))
    }
  },
)

export default api
