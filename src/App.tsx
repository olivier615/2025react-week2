import { useEffect, useState, useRef } from "react";
import type {
  UserLogInFormData,
  ApiErrorResponse
} from "./types/user";
import type {
  ProductData,
} from "./types/product"
import axios from "axios";
import * as bootstrap from 'bootstrap'
import {
  apiUserLogin,
  apiCheckLoginStatus
} from "./apis/user"
import {
  apiGetProducts,
} from "./apis/product";

import { ProductModal } from './components/ProductModal'
import { ConfirmDeleteModel } from './components/ConfirmDeleteModel'
import { handleResponse } from './utils/responseMessage'


function App() {
  const [formData, setFormData] = useState<UserLogInFormData>({
    username: "",
    password: "",
  })

  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [productEditState, setProductEditState] = useState<'new' | 'edit'>('new')
  const [products, setProducts] = useState<ProductData[]>([])
  const [tempProduct, setTempProduct] = useState<ProductData | null>(null)
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
    setFormData({
      ...formData,
      [id]: value,
    })
  }

  const getProducts = async () => {
    try {
      const response = await apiGetProducts()
      setProducts(response.data.products)
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
      console.log(response.data)
      if (!response.data.success) setIsAuth(false)
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleResponse(
          error.response?.data.message ?? '出了點問題，等等再試試看!',
          'warning'
        )
      } else {
        handleResponse('未知錯誤', 'error')
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

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    )
    axios.defaults.headers.common.Authorization = token
    checkLoginStatus()
    axios.defaults.headers.common.Authorization = token;
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false
    })
  }, [])



  return (
    <>
      <button type="button" className="btn btn-outline-danger mt-2 ms-2" onClick={checkLoginStatus}>檢查登入狀態</button>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <div className="text-end">
                <button onClick={() => openProductModal('new', null)} type="button" className="btn btn-primary ">新增產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>編輯</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setTempProduct(product)}
                          >
                            查看
                          </button>
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
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top img-fluid primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images img-fluid"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form
                id="form"
                className="form-signin"
                onSubmit={handleSubmit}
              >
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
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
