export type InstallationType = 'none' | 'negotiable' | 'free'

export type ProductData = {
  category: string
  content: string
  description: string
  id: string
  imageUrl: string
  imagesUrl: string[]
  is_enabled: number
  num: number
  origin_price: number
  price: number
  title: string
  unit: string
  installation: InstallationType
}

export type CreateProductParams = {
  title: string
  category: string
  origin_price: number
  price: number
  unit: string
  description: string
  content: string
  is_enabled: number
  imageUrl: string
  imagesUrl: string[]
  installation: InstallationType
}

export type EditProductParams = {
  id: string
  data: {
    title: string
    category: string
    origin_price: number
    price: number
    unit: string
    description: string
    content: string
    is_enabled: number
    imageUrl: string
    imagesUrl: string[]
    installation: InstallationType
  }
}

export type TPagination = {
  total_pages: number
  current_page: number
  has_pre: boolean
  has_next: boolean
  category: string
}

export type GetProductsResponse = {
  success: boolean
  products: ProductData[]
  pagination: TPagination
  messages: string[]
}

type MessageResponse = {
  success: boolean
  message: string
}

export type CreateProductResponse = MessageResponse
export type EditProductResponse = MessageResponse
export type DeleteProductResponse = MessageResponse
export type UploadImageResponse = {
  success: boolean
  imageUrl: string
}
