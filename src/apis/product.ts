import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { GetProductsResponse } from '../types/product'

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const productApi = axios.create({
  baseURL: API_BASE,
})

productApi.interceptors.request.use(
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

productApi.interceptors.response.use(
  (response) => {
    return Promise.resolve(response)
  },
  (error) => {
    return Promise.reject(error.response.data)
  },
)

export const apiGetProducts = (): Promise<AxiosResponse<GetProductsResponse>> => productApi.get(`/api/${API_PATH}/admin/products`)
