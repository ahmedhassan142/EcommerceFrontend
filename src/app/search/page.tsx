"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../types/types";

// interface Product {
//   _id: string;
//   name: string;
//   slug: string;
//   price: number;
//   imageUrl: string;
//   category?: string;
//   rating?: number;
// }

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
          `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/api/products/search`;
        
        const response = await axios.get(apiUrl, {
          params: { q: debouncedQuery.trim() },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data?.success) {
          setProducts(Array.isArray(response.data.data?.products) 
            ? response.data.data.products 
            : []);
        } else {
          setError(response.data?.error || "No results found");
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.response?.data?.error || 
                err.message || 
                "Failed to fetch search results");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
          <Image 
            src="/search-empty.svg" 
            width={150} 
            height={150} 
            alt="Search empty" 
            className="mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold mb-2">Search for products</h2>
          <p className="text-gray-600">Enter a search term in the box above</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
        {products.length > 0 && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({products.length} {products.length === 1 ? 'result' : 'results'})
          </span>
        )}
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Image 
            src="/no-results.svg" 
            width={200} 
            height={200} 
            alt="No results" 
            className="mx-auto mb-4"
          />
          <p className="text-lg text-gray-600">
            No products found for "{query}"
          </p>
          <Link 
            href="/" 
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              key={product._id} 
              href={`/product/${product.slug}`}
              className="group"
              prefetch={false}
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={false}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 group-hover:text-blue-600 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                      {product.category}
                    </span>
                  )}
                  <p className="text-gray-900 font-semibold">${product.price.toFixed(2)}</p>
                  {product.rating && (
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;