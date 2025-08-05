'use client';
import { motion } from 'framer-motion';
import { ProductCard } from './productcard';
import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  colors: string[];
  imageUrl: string;
  material: string;
}

export function RecommendationSection() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'similar' | 'popular' | 'hybrid'>('hybrid');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch recommendations from your API
  const fetchRecommendations = async (type: string) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      switch (type) {
        case 'similar':
          if (!selectedProductId) {
            endpoint = `${baseUrl}/api/recommendations/popular`;
          } else {
            endpoint = `${baseUrl}/api/recommendations/similar/${selectedProductId}`;
          }
          break;
        case 'popular':
          endpoint = `${baseUrl}/api/recommendations/popular`;
          break;
        case 'hybrid':
          if (selectedProductId) {
            endpoint = `${baseUrl}/api/recommendations/hybrid/${selectedProductId}`;
          } else {
            endpoint = `${baseUrl}/api/recommendations/hybrid`;
          }
          break;
        default:
          endpoint = `${baseUrl}/api/recommendations/hybrid`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to empty array
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Track recently viewed product from localStorage
  useEffect(() => {
    const lastViewed = localStorage.getItem('lastViewedProduct');
    if (lastViewed) {
      setSelectedProductId(JSON.parse(lastViewed)._id);
    }
  }, []);

  // Fetch recommendations when tab changes
  useEffect(() => {
    fetchRecommendations(activeTab);
  }, [activeTab, selectedProductId]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {activeTab === 'similar' ? 'Similar Products' : 
             activeTab === 'popular' ? 'Trending Now' : 'Recommended For You'}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {activeTab === 'similar' ? 'Items matching your recent view' : 
             activeTab === 'popular' ? 'What others are loving right now' : 
             'Our algorithm has selected these just for you'}
          </p>
        </motion.div>

        <div className="flex flex-col items-center mb-12 gap-4">
          <div className="inline-flex bg-gray-800 rounded-full p-1">
            {['hybrid', 'similar', 'popular'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>

          {activeTab === 'similar' && !selectedProductId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-400 text-sm"
            >
              View a product first to get similar recommendations
            </motion.div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                className="bg-gray-800 rounded-xl h-96"
              />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {recommendations.map((product, index) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={index}
                onView={() => setSelectedProductId(product._id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h3 className="text-xl text-gray-400">No recommendations found</h3>
            <button 
              onClick={() => fetchRecommendations(activeTab)}
              className="mt-4 px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Retry
            </button>
          </motion.div>
        )}
      </div>

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-gray-900 transition-colors">
            View All Recommendations
          </button>
        </motion.div>
      )}
    </section>
  );
}