import { User } from './auth'

/** 接口定义:接口返回数据格式 */
export interface BaseResponse {
  code: number
  msg?: string
  data: any
  detail?: string
}

export interface BoolAndData<T> {
  success: boolean
  data: T | null
  msg?: string
}
