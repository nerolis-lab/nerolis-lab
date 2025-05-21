import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipRefresh?: boolean
  }
}
