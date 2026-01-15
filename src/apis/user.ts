import axios, { type AxiosResponse } from "axios";
import type { UserLogInFormData, UserLogInResponse, MessageResponse } from "../types/user";

const API_BASE = import.meta.env.VITE_API_BASE;
// const API_PATH = import.meta.env.VITE_API_PATH;

const userApi = axios.create({
  baseURL: API_BASE,
})

userApi.interceptors.request.use(
  (request) => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)ReactToken\s*=\s*([^;]*).*$)|^.*$/, '$1')

    if (token) {
      request.headers['Authorization'] = token
    }
    return request
  },
  (error) => {
    return Promise.reject(error)
  },
)

userApi.interceptors.response.use(
  (response) => {
    return Promise.resolve(response)
  },
  (error) => {
    return Promise.reject(error)
  },
)

export const apiUserLogin = (params: UserLogInFormData): Promise<AxiosResponse<UserLogInResponse>> => userApi.post(`/admin/signin`, params)

export const apiCheckLoginStatus = (): Promise<AxiosResponse<MessageResponse>> =>
  userApi.post(`/api/user/check`)