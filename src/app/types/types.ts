// ======================
// Category Types
// ======================
export type Category = {
  _id: string;
  name: string;
  slug: string;
  parentslug: string;
  filters: string[];
  subcategories: Subcategory[];
};

export type Subcategory = {
  _id: string;
  name: string;
  slug: string;
  parentslug: string;
  filters: string[];
  subcategories?: Subcategory[]; // Optional nested subcategories
};

// ======================
// Product Types
// ======================
export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryslug: string;
  sizes: string[];
  colors: string[];
  fit: string;
  material: string;
  filters: { [key: string]: string[] }; // Made non-optional
};

// ======================
// Cart Types
// ======================
export type Item = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number; // Added price here to avoid redundancy
};
// Updated types in `types.ts`
export type BackendCartItem = {
  _id: string;          // Add this
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  // Remove 'product' and 'price' (or fetch them separately)
};

export type BackendCart = {
  _id: string;
  sessionId: string;
  createdAt: string;
  items: BackendCartItem[];
};
export type TrendingProduct = Product & {
  score?: number;
  rank?: number;
};

// For the frontend components
export type TrendingProductsResponse = {
  products: TrendingProduct[];
  meta: {
    timeframe: string;
    generated_at: string;
  };
};