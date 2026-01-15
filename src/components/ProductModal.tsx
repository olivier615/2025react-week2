import { useEffect, useState } from "react";
import type {
  ProductData,
} from "../types/product"
import type {
  CreateProductParams
} from "../types/product"

import {
  apiCreateProduct,
  apiEditProduct
} from "../apis/product";

const initialEditProduct: CreateProductParams = {
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
}
type ProductModalProps = {
  closeModal: () => void,
  productEditState: 'new' | 'edit',
  tempProduct: ProductData | null,
  onEdited:  () => void
}

export const ProductModal = ({ closeModal, productEditState, tempProduct, onEdited }: ProductModalProps) => {
  const [imageUrlInput, setImageUrlInput] = useState<string>('')
  const [editProduct, setEditProduct] = useState<CreateProductParams>(initialEditProduct)


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


  const handelAddNewProduct = async () => {
    try {
      await apiCreateProduct(editProduct)
      setEditProduct(initialEditProduct)
      closeModal()
      onEdited()
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditProduct = async () => {
    if (!tempProduct?.id) return
    try {
      const response = await apiEditProduct({
        id: tempProduct.id,
        data: editProduct
      })
      closeModal()
      onEdited()
    } catch (error) {
      console.log(error)
    }
  }

  const handelModalSubmit = () => {
    if (productEditState === 'new') {
      handelAddNewProduct()
    } else {
      handleEditProduct()
    }
  }

  useEffect(() => {
    setEditProduct(prev => ({
      ...prev,
      imageUrl: prev.imagesUrl.length > 0 ? prev.imagesUrl[0] : '',
    }))
  }, [editProduct.imagesUrl.length])

  useEffect(() => {
  if (productEditState === 'edit' && tempProduct) {
    setEditProduct({
      title: tempProduct.title,
      category: tempProduct.category,
      origin_price: tempProduct.origin_price,
      price: tempProduct.price,
      unit: tempProduct.unit,
      description: tempProduct.description,
      content: tempProduct.content,
      is_enabled: tempProduct.is_enabled,
      imageUrl: tempProduct.imageUrl,
      imagesUrl: tempProduct.imagesUrl ?? [],
    })
  }

  if (productEditState === 'new') {
    setEditProduct(initialEditProduct)
  }
}, [productEditState, tempProduct])

  return (
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
                <span>{productEditState === 'new' ? '新增產品' : '編輯產品'}</span>
                {productEditState === 'new'? '' : tempProduct?.id}
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
              <button onClick={handelModalSubmit} type="button" className="btn btn-primary">確認</button>
            </div>
          </div>
        </div>
      </div>
  )
}