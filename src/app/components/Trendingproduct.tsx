"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTransform, useViewportScroll } from 'framer-motion';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
  };
  finalScore?: number;
}

const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useViewportScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/trending?limit=8`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trending Now
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover what everyone is loving this week
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200">
                <motion.img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  whileHover={{ scale: 1.05 }}
                  style={{ transition: "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <a href={`/Product/${product.slug}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {product.category.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {/* <FireIcon className="h-5 w-5 text-orange-400" /> */}
                      <span className="ml-1 text-sm text-gray-500">
                        {Math.round(product.finalScore || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D hover effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="absolute inset-0 transform perspective-1000 rotate-x-0 group-hover:rotate-x-5 group-hover:scale-95 transition-all duration-500 ease-out" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          style={{ y }}
          className="mt-12 text-center"
        >
         
        </motion.div>
      </div>
    </section>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default TrendingProducts;