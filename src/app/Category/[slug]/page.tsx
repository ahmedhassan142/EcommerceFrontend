"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Filters {
  size: string[];
  color: string[];
  fit: string;
  material: string;
  [key: string]: string[] | string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  filters: {
    name: string;
    values: string[];
  }[];
}

const CategoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    size: [],
    color: [],
    fit: "",
    material: "",
  });
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const params = useParams();
  const categorySlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch category details
        const categoryResponse = await axios.get(
          `http://localhost:3002/api/Category/slug/${categorySlug}`
        );
        
        if (!categoryResponse.data.success) {
          throw new Error(categoryResponse.data.message || "Category not found");
        }
        
        setCategory(categoryResponse.data.data);

        // Fetch products
        const productsResponse = await axios.get(
          `http://localhost:3002/api/products/categories/${categorySlug}/products`
        );
        
        if (!productsResponse.data.success) {
          throw new Error(productsResponse.data.message || "Failed to load products");
        }
        
        setProducts(productsResponse.data.data || []);
        
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          axios.isAxiosError(error) 
            ? error.response?.data?.message || error.message 
            : "Failed to fetch data"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && (name === "size" || name === "color")) {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] as string[]), value]
          : (prev[name] as string[]).filter((item) => item !== value),
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Get unique filter values from products
  const getUniqueFilterValues = (property: keyof Product): string[] => {
    const uniqueValues = new Set<string>();
    products.forEach(product => {
      if (Array.isArray(product[property])) {
        (product[property] as string[]).forEach((value: string) => {
          uniqueValues.add(value);
        });
      } else if (product[property]) {
        uniqueValues.add(String(product[property]));
      }
    });
    return Array.from(uniqueValues).sort();
  };

  const filteredProducts = (products || []).filter((product) => {
    if (!product) return false;
    
    // Size filter
    if (filters.size.length > 0 && (
      !product.sizes || 
      !filters.size.some(size => product.sizes.includes(size))
    )) {
      return false;
    }
    
    // Color filter
    if (filters.color.length > 0 && (
      !product.colors || 
      !filters.color.some(color => product.colors.includes(color))
    )) {
      return false;
    }
    
    // Fit filter
    if (filters.fit && product.fit !== filters.fit) {
      return false;
    }
    
    // Material filter
    if (filters.material && product.material !== filters.material) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!category) {
    return <div className="text-center mt-8">Category not found</div>;
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center mt-8">
        {products.length === 0 
          ? "No products found in this category" 
          : "No products match your filters"}
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-200 px-4 py-2 rounded-md text-sm font-medium"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Filter Sidebar */}
        <div className={`filters md:w-1/4 p-4 bg-gray-50 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <h3 className="text-xl font-bold mb-4">Filters</h3>

          {/* Size Filter */}
          {getUniqueFilterValues('sizes').length > 0 && (
            <div className="filter-group mb-6">
              <h4 className="text-lg font-semibold mb-2">Size</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUniqueFilterValues('sizes').map((size) => (
                  <label key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="size"
                      value={size}
                      checked={filters.size.includes(size)}
                      onChange={handleFilterChange}
                      className="h-4 w-4"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {getUniqueFilterValues('colors').length > 0 && (
            <div className="filter-group mb-6">
              <h4 className="text-lg font-semibold mb-2">Color</h4>
              <div className="grid grid-cols-2 gap-2">
                {getUniqueFilterValues('colors').map((color) => (
                  <label key={color} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="color"
                      value={color}
                      checked={filters.color.includes(color)}
                      onChange={handleFilterChange}
                      className="h-4 w-4"
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fit Filter */}
          {getUniqueFilterValues('fit').length > 0 && (
            <div className="filter-group mb-6">
              <h4 className="text-lg font-semibold mb-2">Fit</h4>
              <select
                name="fit"
                value={filters.fit}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All Fits</option>
                {getUniqueFilterValues('fit').map((fit) => (
                  <option key={fit} value={fit}>{fit}</option>
                ))}
              </select>
            </div>
          )}

          {/* Material Filter */}
          {getUniqueFilterValues('material').length > 0 && (
            <div className="filter-group mb-6">
              <h4 className="text-lg font-semibold mb-2">Material</h4>
              <select
                name="material"
                value={filters.material}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All Materials</option>
                {getUniqueFilterValues('material').map((material) => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="w-full md:w-3/4 p-4">
          <h1 className="hidden md:block text-4xl font-bold text-gray-900 mb-8">
            {category.name}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
    <div className="relative h-64 w-full">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="bg-gray-200 h-full flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>
      <p className="text-lg font-bold mb-4">${product.price}</p>
      <Link
        href={`/Product/${product.slug}`}
        className="inline-block bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        View Product
      </Link>
    </div>
  </div>
);

export default CategoryPage;