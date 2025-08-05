"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Product } from "../../types/types";
import CartSidebar from "../../components/Cartsidebar";
import { toast } from 'react-hot-toast'; 
import { useAuth } from "@/app/context/authContext";
import ReviewForm from "src/app/components/Reviewform";
import { ReviewList } from "src/app/components/Reviewlist";
import useProductBySlug from "src/app/components/useproduct";
import useReviews from "src/app/components/useReviews";
import { getSessionId } from "@/utils/sessionid";
import { useProfile } from "@/app/context/profileContext";
import { Review } from "src/app/components/Reviewlist";

interface User {
  _id: string;
}

// interface Review {
//   _id: string;
//   userId: string;
//   productId: string;
//   rating: number;
//   comment?: string;
//   title: string;
//   photos?: string[];
//   createdAt: string;
//   updatedAt?: string;
//   verifiedPurchase: boolean;
//   helpfulVotes?: number;
// }

const ProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const {userDetails}=useProfile()
  
  const params = useParams();
  const searchParams = useSearchParams();
  const productSlug = params?.slug as string;
  const showReviewParam = searchParams.get('review');
  const orderId = searchParams.get('order');
  const itemId = searchParams.get('item');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Automatically show review form if review=true and order/item exist
  useEffect(() => {
    if (showReviewParam === 'true' && orderId && itemId) {
      setShowReviewForm(true);
    }
  }, [showReviewParam, orderId, itemId]);

  const { 
    data: productData, 
    isLoading: productLoading, 
    error: productError 
  } = useProductBySlug(productSlug as string);
  
  const {
    reviews,
    averageRating,
    ratingDistribution,
    total,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useReviews(productData?._id || '');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) return;
  
      try {
        const response = await axios.get<{ 
          success: boolean;
          data: Product 
        }>(`${process.env.PRODUCT_SERVICE_URL}/api/products/slug/${productSlug}`);
        
        if (!response.data.success || !response.data.data) {
          throw new Error("Product not found");
        }
  
        setProduct(response.data.data);
  
        // Set default size and color
        if (response.data.data.sizes?.length > 0) {
          setSelectedSize(response.data.data.sizes[0]);
        }
        if (response.data.data.colors?.length > 0) {
          setSelectedColor(response.data.data.colors[0]);
        }
      } catch (error) {
        setError("Failed to fetch product details");
        console.error("Failed to fetch product:", error);
      }
    };
  
    fetchProduct();
  }, [productSlug]);

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Product not found");
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }

    try {
      const cartItem = {
        productId: product._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl
      };

      if(isAuthenticated && userDetails?._id) {
        await axios.post(`${process.env.CART_SERVICE_URL}/api/Cart/add`, {
          ...cartItem,
          userId: userDetails._id
        });
        toast.success("Added to your cart");
        setIsCartOpen(true);
        return;
      }
      
      const sessionId = localStorage.getItem('sessionId') || '';
      if (!sessionId) {
        const newSessionId = getSessionId();
        await axios.post(`${process.env.CART_SERVICE_URL}/api/Cart/add`, {
          ...cartItem,
          sessionId: newSessionId
        });
        localStorage.setItem('sessionId', newSessionId);
        toast.success("Added to your cart");
        setIsCartOpen(true);
        return;
      }

      await axios.post(`${process.env.CART_SERVICE_URL}/api/Cart/add`, {
        ...cartItem,
        sessionId: sessionId
      });
      toast.success("Added to your cart");
      setIsCartOpen(true);

    } catch (error: any) {
      console.error("Failed to add to cart:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };



interface VoteResponse {
  success: boolean;
  helpfulVotes?: number;
  message?: string;
  code?: string;
}

const voteHelpful = async (
  reviewId: string,
 
 
  
): Promise<void> => {
  const startTime = performance.now();
  console.log('Initiating helpful vote...', { reviewId, isAuthenticated });

  // Prepare request data
  let requestData = {};
  let voterType = '';

  try {
    if (isAuthenticated && userDetails?._id) {
      requestData = { userId: userDetails._id };
      voterType = 'authenticated user';
      // Clean up any guest session if user is now authenticated
      if (localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
      }
    } else {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = getSessionId(); // Implement this function
        localStorage.setItem('sessionId', sessionId);
      }
      requestData = { sessionId };
      voterType = 'guest session';
    }

    console.log('Submitting vote as:', voterType, requestData);

    const response = await axios.patch<VoteResponse>(
      `${process.env.REVIEW_SERVICE_URL}/api/reviews/${reviewId}/helpful`,
      requestData,
      {
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Id': `vote-${Date.now()}` // For request tracing
        },
        timeout: 5000 // 5 second timeout
      }
    );

    const duration = Math.round(performance.now() - startTime);
    console.log('Vote completed:', {
      status: response.status,
      data: response.data,
      duration: `${duration}ms`
    });

    if (response.data.success) {
      toast.success("Thank you for your feedback!");
      refetchReviews();
    } else {
      handleVoteError(response.data);
    }

  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime);
    console.error('Vote failed:', {
      error: error.response?.data || error.message,
      duration: `${duration}ms`
    });

    if (error.response) {
      // Handle specific error codes
      switch (error.response.data?.code) {
        case 'DUPLICATE_VOTE':
          toast.warning("You've already voted on this review!");
          break;
        case 'INVALID_REVIEW_ID':
          toast.error("Invalid review. Please refresh the page.");
          break;
        default:
          toast.error(error.response.data?.message || "Couldn't register your vote");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

// Helper function to generate session IDs


// Helper function for error handling
const handleVoteError = (responseData: VoteResponse) => {
  switch (responseData.code) {
    case 'DUPLICATE_VOTE':
      toast.warning("You've already voted on this review!");
      break;
    case 'MISSING_IDENTIFIER':
      toast.error("Session expired. Please refresh the page.");
      break;
    default:
      toast.error(responseData.message || "Couldn't register your vote");
  }
};



  if (productLoading) return <div className="p-4">Loading product...</div>;
  if (productError) return <div className="p-4 text-red-500">Error loading product</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!product) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="product-page container mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="product-details flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="product-image md:w-1/2">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={600}
            layout="responsive"
            className="rounded-lg"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="product-info md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-4">{product.description}</p>
          <p className="text-2xl font-bold text-gray-900 mb-6">${product.price}</p>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="size-selector mb-6">
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedSize === size 
                        ? "bg-black text-white border-black" 
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div className="color-selector mb-6">
              <h3 className="text-lg font-semibold mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedColor === color 
                        ? "bg-black text-white border-black" 
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors duration-300"
            disabled={!selectedSize || !selectedColor}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={{
          name: product.name,
          price: product.price,
          size: selectedSize,
          color: selectedColor,
          imageUrl: product.imageUrl,
        }}
      />

      {/* Reviews Section */}
      <section className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-medium">Customer Reviews</h2>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 border border-black rounded-md hover:bg-black hover:text-white transition"
            >
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm ? (
          <ReviewForm 
            productId={product._id}
            
            
            onSuccess={() => {
              setShowReviewForm(false);
              refetchReviews();
            }} 
          />
        ) : (
          <ReviewList
            reviews={reviews}
           averageRating={averageRating ||0}
            ratingDistribution={ratingDistribution || {1:0, 2:0, 3:0, 4:0, 5:0}}
            totalReviews={total || 0}
            onVoteHelpful={voteHelpful}
          />
        )}
      </section>
    </div>
  );
};

export default ProductPage;