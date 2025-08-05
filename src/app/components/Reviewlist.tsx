"use client";
import { motion } from 'framer-motion';
import { FiThumbsUp, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useUserData } from './useUserdata';
import axios from 'axios';
import { useParams } from 'next/navigation';

export interface Review {
  _id: string;
  userId?: string;
  sessionId?: string;
  guestEmail?: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  createdAt: string;
  helpfulVotes: number;
  verifiedPurchase: boolean;
  experience?: {
    fit?: string;
    afterWash?: string;
    wearFrequency?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ProductData {
  _id: string;
  name: string;
  // Add other product fields you need
}

// Keep your exact UserDisplay component
const UserDisplay = ({ userId }: { userId?: string }) => {
  const { user, loading } = useUserData(userId);

  if (loading) return <span className="text-gray-400">Loading...</span>;
  if (!user) return <span>Guest</span>;

  return (
    <span>
      {user.firstName} {user.lastName}
    </span>
  );
};

export const ReviewList =  ({
  

  onVoteHelpful
}: {
  reviews: Review[];

  onVoteHelpful?: (reviewId: string) => void;
}) => {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First fetch product by slug to get productId
        const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/slug/${slug}`);
        if (!productResponse.data?.data?._id) {
          throw new Error('Product not found');
        }
        
        const productData = productResponse.data.data;
        setProduct(productData);

        // Then fetch reviews for this product
        const reviewsResponse = await axios.get(
          `${process.env.REVIEW_SERVICE_URL}/api/reviews/product/${productData._id}`
        );

        if (!reviewsResponse.data?.reviews) {
          throw new Error('No reviews found');
        }

        setReviews(reviewsResponse.data.reviews);
        setStats(reviewsResponse.data.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });

      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      if (!product) return;
      
      const response = await axios.post(
        `${process.env.REVIEW_SERVICE_URL}/api/reviews/${reviewId}/helpful`
      );
      
      if (response.data.success) {
        // Refresh reviews after voting
        const refreshResponse = await axios.get(
          `${process.env.REVIEW_SERVICE_URL}/api/reviews/product/${product._id}`
        );
        setReviews(refreshResponse.data.reviews);
        setStats(refreshResponse.data.stats);
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  if (loading) return (
    <div className="p-4 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h3 className="text-red-700 font-medium">Error loading reviews</h3>
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (!reviews.length) return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-yellow-700">No reviews yet for this product</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Customer Reviews Summary Section */}
        <div className="md:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-2xl font-medium mb-4">Customer Reviews</h2>
            {stats && (
              <>
                <div className="flex items-center mb-2">
                  <div className="text-4xl font-light mr-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-gray-600">out of 5</div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {stats.totalReviews} reviews
                </div>

                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center mb-1">
                    <div className="w-10 text-sm">{rating} star</div>
                    <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black"
                        style={{
                          width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="w-10 text-sm text-right text-gray-600">
                      {Math.round((stats.ratingDistribution[rating] / stats.totalReviews) * 100)}%
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Reviews List Section */}
        <div className="md:col-span-2 space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ 
                y: -2,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              className="bg-white p-6 rounded-lg border border-gray-100"
            >
              {/* Review Header with User Info */}
              <div className="flex items-start mb-4">
                <div>
                  <div className="font-medium">
                    {review.userId ? (
                      <UserDisplay userId={review.userId} />
                    ) : review.guestEmail ? (
                      `Guest (${review.guestEmail})`
                    ) : (
                      `Anonymous (${review.sessionId?.substring(0, 4)}...)`
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span>·</span>
                    <span className="ml-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="ml-2 flex items-center text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        <FiCheck className="mr-1" size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <h3 className="font-medium mb-2">{review.title}</h3>
              <p className="text-gray-700 mb-3">
                {expandedReview === review._id 
                  ? review.comment 
                  : `${review.comment.substring(0, 200)}${review.comment.length > 200 ? '...' : ''}`
                }
                {review.comment.length > 200 && (
                  <button 
                    onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                    className="text-black underline ml-1"
                  >
                    {expandedReview === review._id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>

              {/* Experience Tags */}
              {review.experience && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.experience.fit && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {review.experience.fit === 'runs-small' && 'Runs Small'}
                      {review.experience.fit === 'true-to-size' && 'True to Size'}
                      {review.experience.fit === 'runs-large' && 'Runs Large'}
                    </span>
                  )}
                  {review.experience.afterWash && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {review.experience.afterWash === 'shrank' && 'Shrank After Wash'}
                      {review.experience.afterWash === 'no-change' && 'No Change After Wash'}
                      {review.experience.afterWash === 'stretched' && 'Stretched After Wash'}
                    </span>
                  )}
                  {review.experience.wearFrequency && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {review.experience.wearFrequency === 'daily' && 'Worn Daily'}
                      {review.experience.wearFrequency === 'weekly' && 'Worn Weekly'}
                      {review.experience.wearFrequency === 'monthly' && 'Worn Monthly'}
                    </span>
                  )}
                </div>
              )}

              {/* Review Photos */}
              {review.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {review.photos.map((photo, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="overflow-hidden rounded-md"
                    >
                      <img
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-24 object-cover cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center text-sm text-gray-600">
                 <span className="mr-4">{review.helpfulVotes} people found this helpful</span>
                <button
                  onClick={() => onVoteHelpful?.(review._id)}
                  className="flex items-center hover:text-black transition"
                >
                  <FiThumbsUp className="mr-1" />
                  Helpful
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};