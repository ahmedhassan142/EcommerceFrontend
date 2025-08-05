// hooks/useProductBySlug.ts
"use client";
import { useQuery } from '@tanstack/react-query';

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  description: string;
  sizes: string[];
  colors: string[];
  fit: string;
  material: string;
  // ... other product fields
}

interface ApiResponse {
  success: boolean;
  data: Product;
  message?: string;
}

const useProductBySlug = (productslug: string) => {
  return useQuery<Product, Error>({
    queryKey: ['product', productslug],
    queryFn: async () => {
      const response = await fetch(`${process.env.PRODUCT_SERVICE_URL}/api/products/slug/${productslug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Product not found');
      }

      return data.data;
    },
    enabled: !!productslug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
export default useProductBySlug