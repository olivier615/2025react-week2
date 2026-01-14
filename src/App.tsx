import { useEffect, useState, useRef } from "react";
import type { UserLogInFormData } from "./types/user";
import type {
  ProductData,
  CreateProductParams
} from "./types/product"
import axios from "axios";
import * as bootstrap from 'bootstrap'
import {
  apiUserLogin,
  apiCheckLoginStatus
} from "./apis/user"
import {
  apiGetProducts,
  apiCreateProduct
} from "./apis/product";


function App() {
  const [formData, setFormData] = useState<UserLogInFormData>({
    username: "",
    password: "",
  })

  const [editProduct, setEditProduct] = useState<CreateProductParams>({
    title: '',
    category: '',
    origin_price: 0,
    price: 0,
    unit: '',
    description: '',
    content: '',
    is_enabled: 1,
    imageUrl: '',
    imagesUrl: [],
  })

  const [isAuth, setIsAuth] = useState<boolean>(true)
  const [products, setProducts] = useState<ProductData[]>([])
  const [tempProduct, setTempProduct] = useState<ProductData | null>(null)
  const productModalRef = useRef<bootstrap.Modal | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState<string>('')

  const handleSubmit = async (
    event: React.ChangeEvent<HTMLFormElement>
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
    } catch (error) {
      console.log(error)
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
    } catch (error) {
      console.log(error)
    }
  }

  const checkLoginStatus = async () => {
    try {
      const response = await apiCheckLoginStatus()
      console.log(response.data)
      if (!response.data.success) setIsAuth(false)
    } catch (error) {
      console.log(error)
    }
  }

  const openProductModal = async () => {
    productModalRef.current?.show()
  }

  const handleModalInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setEditProduct({
      ...editProduct,
      [id]: id === 'origin_price' || id === 'price'
      ? Number(value)
      : value
    })
  }

  const handleIsEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditProduct({
      ...editProduct,
      is_enabled: event.target.checked ? 1 : 0
    })
  }

  const isURL = (url: string): boolean => {
    const httpsOnlyRegex = /^https:\/\//i
    return httpsOnlyRegex.test(url)
  }

  const addNewUrl = () => {
    if (imageUrlInput === '') return
    if (!isURL(imageUrlInput)) {
      alert('錯誤的 Url')
    } else {
      setEditProduct({
        ...editProduct,
        imagesUrl: [
          ...editProduct.imagesUrl,
          imageUrlInput
        ]
      })
      setImageUrlInput('')
    }
  }

  const deleteUrl = (index: number) => {
    setEditProduct({
      ...editProduct,
      imagesUrl: editProduct.imagesUrl.filter((_: string, i: number) => i !== index),
    })
  }


  const onLook = async () => {
    console.log(editProduct)
    try {
      console.log("final", editProduct)
      const response = await apiCreateProduct(editProduct)
      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
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

  useEffect(() => {
    setEditProduct({
      ...editProduct,
      imageUrl: editProduct.imagesUrl.length > 0 ? editProduct.imagesUrl[0] : ''
    })
  }, [editProduct.imagesUrl.length])

  return (
    <>
      <button type="button" onClick={getProducts}>拉拉拉拉</button>
      <button type="button" className="btn btn-outline-danger mt-2 ms-2" onClick={checkLoginStatus}>檢查登入狀態</button>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <div className="text-end">
                <button onClick={openProductModal} type="button" className="btn btn-primary ">新增產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
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
      {/* productModal 表單 */}
      <div
        id="productModal"
        className="modal fade"
        tabIndex={-1}
        aria-labelledby="productModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 id="productModalLabel" className="modal-title">
                <span>新增產品</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div>
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        onChange={(event) => setImageUrlInput(event.target.value)}
                        value={imageUrlInput}
                      />
                    </div>
                  </div>
                  <div className="my-2">
                    <button className="btn btn-outline-primary btn-sm d-block w-100"
                    onClick={addNewUrl}
                    >
                      新增圖片
                    </button>
                  </div>
                  {
                    editProduct.imagesUrl.map((url: string, index: number) => {
                      return (<div className="my-2" key={`${index}:${url}`}>
                      <img className="img-fluid mb-1"  src={url} alt="" />
                        <div>
                          <button className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={() => deleteUrl(index)}
                          >
                            刪除圖片
                          </button>
                        </div>
                      </div>
                      )
                    })
                  }
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      onChange={handleModalInputChange}
                      value={editProduct.title}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類</label>
                      <input
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        onChange={handleModalInputChange}
                        value={editProduct.category}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位</label>
                      <input
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        onChange={handleModalInputChange}
                        value={editProduct.unit}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        onChange={handleModalInputChange}
                        value={editProduct.origin_price}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        onChange={handleModalInputChange}
                        value={editProduct.price}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      onChange={handleModalInputChange}
                      value={editProduct.description}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      onChange={handleModalInputChange}
                      value={editProduct.content}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        onChange={handleIsEnabled}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                取消
              </button>
              <button onClick={onLook} type="button" className="btn btn-primary">確認</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
