import type { ProductDetail, ProductListItem, ReferenceEntity, SizeFilterOption } from '~/types/api'

interface ProductFilters {
  search: string
  ordering: string
  categoryIn: number[]
  brandIn: number[]
  countryIn: number[]
  sizeRussianIn: string[]
}

const defaultFilters = (): ProductFilters => ({
    search: '',
    ordering: '-average_rating',
    categoryIn: [],
    brandIn: [],
    countryIn: [],
    sizeRussianIn: []
})

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [] as ProductListItem[],
    categories: [] as ReferenceEntity[],
    brands: [] as ReferenceEntity[],
    countries: [] as ReferenceEntity[],
    sizes: [] as SizeFilterOption[],
    currentProduct: null as ProductDetail | null,
    filters: defaultFilters(),
    loading: false
  }),
  actions: {
    async fetchReferences() {
      const { request } = useApi()
      const [categories, brands, countries, sizes] = await Promise.all([
        request<ReferenceEntity[]>('/shop/categories/'),
        request<ReferenceEntity[]>('/shop/brands/'),
        request<ReferenceEntity[]>('/shop/countries/'),
        request<SizeFilterOption[]>('/shop/sizes/')
      ])
      this.categories = categories
      this.brands = brands
      this.countries = countries
      this.sizes = sizes
    },
    buildQuery() {
      const params = new URLSearchParams()
      if (this.filters.search) params.set('search', this.filters.search)
      if (this.filters.ordering) params.set('ordering', this.filters.ordering)
      if (this.filters.categoryIn.length) params.set('category__in', this.filters.categoryIn.join(','))
      if (this.filters.brandIn.length) params.set('brand__in', this.filters.brandIn.join(','))
      if (this.filters.countryIn.length) params.set('country__in', this.filters.countryIn.join(','))
      if (this.filters.sizeRussianIn.length) params.set('sizes__value_russian__in', this.filters.sizeRussianIn.join(','))
      const query = params.toString()
      return query ? `?${query}` : ''
    },
    async fetchProducts() {
      this.loading = true
      try {
        const { request } = useApi()
        this.products = await request<ProductListItem[]>(`/shop/products/${this.buildQuery()}`)
      } finally {
        this.loading = false
      }
    },
    async fetchProduct(id: number) {
      const { request } = useApi()
      this.currentProduct = await request<ProductDetail>(`/shop/products/${id}/`)
    },
    resetFilters() {
      this.filters = defaultFilters()
    }
  }
})
