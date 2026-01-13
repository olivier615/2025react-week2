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
  }
}

export type Pagination = {
  total_pages: number
  current_page: number
  has_pre: boolean
  has_next: boolean
  category: string
}

export type GetProductsResponse = {
  success: boolean
  products: ProductData[]
  pagination: Pagination
  messages: string[]
}

type MessageResponse = {
  success: boolean
  message: string
}

export type CreateProductResponse = MessageResponse
export type EditProductResponse = MessageResponse
export type DeleteProductResponse = MessageResponse
