export interface ProductListItem {
  id: number
  name: string
  preview: string | null
  price: string
  average_rating: string | null
  description: string
}

export interface ProductSize {
  id: number
  value: string
  value_russian: string
}

export interface ProductDetail extends ProductListItem {
  examples: Array<{ id: number; example: string }>
  dimensions: ProductSize[]
  attributes: Array<{ id: number; category: string; attributes: Array<{ id: number; name: string; value: string }> }>
  reviews: Array<{
    id: number
    rating: number
    advantages?: string | null
    disadvantages?: string | null
    comment: string
    created_at?: string
    user: { id: number; email: string; first_name: string; last_name: string }
    photos?: Array<{ id: number; photo: string }>
  }>
}

export interface ReferenceEntity {
  id: number
  name: string
}

export interface SizeFilterOption {
  value: string
  value_russian: string
}

export interface FavoriteItem {
  id: number
  created_at: string
  product: ProductListItem
}

export interface CartPosition {
  id: number
  quantity: number
  created_at: string
  product: ProductListItem
  size: ProductSize
}

export interface Cart {
  id: number
  name: string
  positions: CartPosition[]
}

export interface Order {
  id: number
  status: string
  total_price: string
  address: string
  created_at: string
  items: Array<{
    id: number
    quantity: number
    price: string
    product: { id: number; name: string; preview: string | null }
    size: ProductSize
  }>
}

export interface UserProfile {
  email: string
  first_name?: string
  last_name?: string
  patronymic?: string
  date_joined?: string
  address?: string
  phone_number?: string
}

export interface UserProfileUpdatePayload {
  first_name?: string
  last_name?: string
  patronymic?: string
  email?: string
  address?: string
  phone_number?: string
}

export interface ReviewReportPayload {
  review_id: number
  reason: string
}

export interface ShopAnswer {
  id: number
  shop_question: number
  comment: string
  created_at: string
}

export interface ShopQuestion {
  id: number
  title: string
  comment: string
  created_at: string
  shop_answers: ShopAnswer[]
}
