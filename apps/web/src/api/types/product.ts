export type ProductItem = {
  id: string;
  name: string;
  sku: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductQueryParams = {
  page: number;
  perPage: number;
};

export type ProductListResponse = {
  data: ProductItem[];
  page: number;
  pages: number;
  perPage: number;
  total: number;
};

export type CreateProductResponse = ProductItem;
