import { useEffect, useState, useRef } from "react";
import type {
  UserLogInFormData,
  ApiErrorResponse
} from "./types/user"
import type {
  ProductData,
  TPagination
} from "./types/product"
import axios from "axios"
import * as bootstrap from 'bootstrap'
import {
  apiUserLogin,
  apiCheckLoginStatus
} from "./apis/user"
import {
  apiGetProducts,
} from "./apis/product"

import { ProductModal } from './components/ProductModal'
import { ConfirmDeleteModel } from './components/ConfirmDeleteModel'
import { LoginForm } from './components/LoginForm'
import { PaginationList } from './components/PaginationList'
import { handleResponse } from './utils/responseMessage'


function App() {
  const [formData, setFormData] = useState<UserLogInFormData>({
    username: "",
    password: ""
  })
  const [isAuth, setIsAuth] = useState<boolean>(true)
  const [productEditState, setProductEditState] = useState<'new' | 'edit'>('new')
  const [products, setProducts] = useState<ProductData[]>([])
  const [tempProduct, setTempProduct] = useState<ProductData | null>(null)
  const [pagination, setPagination] = useState<TPagination>({
      total_pages: 1,
      current_page: 1,
      has_pre: false,
      has_next: false,
      category: ''
    })
  const productModalRef = useRef<bootstrap.Modal | null>(null)

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      const response = await apiUserLogin(formData)
      const { token, expired, uid } = response.data
      document.cookie = `ReactToken=${token};expires=${new Date(expired)}`
      document.cookie = `ReactUid=${uid};expires=${new Date(expired)}`
      axios.defaults.headers.common.Authorization = token
      setIsAuth(true)
      getProducts()
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleResponse(
          error.response?.data.message ?? '登入失敗',
          'warning'
        )
      } else {
        handleResponse('未知錯誤', 'error')
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }))
  }

  const getProducts = async (page: number = 1, category: string = '') => {
    try {
      const response = await apiGetProducts({
        page, category
      })
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleResponse(
          error.response?.data.message ?? '無法取得產品資料，請稍後再試',
          'warning'
        )
      } else {
        handleResponse('未知錯誤', 'error')
      }
    }
  }

  const checkLoginStatus = async () => {
    try {
      const response = await apiCheckLoginStatus()
      if (!response.data.success) {
        setIsAuth(false)
      } else {
        getProducts()
      }
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleResponse(
          error.response?.data.message ?? '出了點問題，等等再試試看!',
          'warning'
        )
        setIsAuth(false)
      } else {
        handleResponse('未知錯誤', 'error')
        setIsAuth(false)
      }
    }
  }

  const openProductModal = async (mode: 'new' | 'edit', product: ProductData | null) => {
    setProductEditState(mode)
    if (mode === 'edit') setTempProduct(product)
    productModalRef.current?.show()
  }

  const closeModal = async () => {
    productModalRef.current?.hide()
  }

  const onChangePage = (page: number) => {
    setPagination(prev => ({
    ...prev,
    current_page: page,
    }))
    getProducts(page)
  }

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    )
    axios.defaults.headers.common.Authorization = token;
    checkLoginStatus()
    const el = document.getElementById('productModal')
    if (!el) return
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false
    })
    const handleHide = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }

    el.addEventListener('hide.bs.modal', handleHide)
    return () => {
      el.removeEventListener('hide.bs.modal', handleHide)
      productModalRef.current?.dispose()
      productModalRef.current = null
    }
  }, [])



  return (
    <>
      <button type="button" className="btn btn-outline-danger mt-2 ms-2" onClick={checkLoginStatus}>檢查登入狀態</button>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-12">
              <h2>產品列表</h2>
              <div className="text-end">
                <button onClick={() => openProductModal('new', null)} type="button" className="btn btn-primary ">新增產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>分類</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>評價</th>
                    <th>是否啟用</th>
                    <th>編輯</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>{product.category}</td>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>評價</td>
                        <td className={`${product.is_enabled ? '' : 'text-danger'}`}>
                          {product.is_enabled ? "啟用" : "未啟用"}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                            type="button" className="btn btn-outline-primary btn-sm"
                            onClick={() => openProductModal('edit', product)}
                            >
                              編輯
                            </button>
                            <ConfirmDeleteModel
                            productId={product.id}
                            productTitle={product.title}
                            onDeleted={getProducts}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationList
            pagination={pagination}
            onChangePage={onChangePage}
          />
        </div>
      ) : (
        <LoginForm
          handleSubmit={handleSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      )}
      <ProductModal
        closeModal={closeModal}
        productEditState={productEditState}
        tempProduct={tempProduct}
        onEdited={getProducts}
      />
    </>
  );
}

export default App
