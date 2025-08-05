"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from '@tanstack/react-query';
import { Review } from "./Reviewlist";

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

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  ratingDistribution: Record<number, number>;
  total: number;
}

interface UseReviewsReturn {
  reviews: Review[];
  averageRating: number;
  ratingDistribution: Record<number, number>;
  total: number;
  isLoading: boolean;
  error: Error | null;
  voteHelpful: (reviewId: string) => Promise<void>;
  refetch: () => void;
}

export const useReviews = (
  productId: string,
  page: string = '1',
  limit: string = '10',
  sort: string = 'recent'
): UseReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  const [total, setTotal] = useState(0);

  const { 
    isLoading, 
    error, 
    data, 
    refetch: queryRefetch 
  } = useQuery<ReviewData>({
    queryKey: ['reviews', productId, page, limit, sort],
    queryFn: async () => {
      if (!productId) {
        return {
          reviews: [],
          averageRating: 0,
          ratingDistribution: { 1:0, 2:0, 3:0, 4:0, 5:0 },
          total: 0
        };
      }

      const response = await fetch(
        `${process.env.REVIEW_SERVICE_URL}/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!productId
  });

  useEffect(() => {
    if (data) {
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setRatingDistribution(data.ratingDistribution);
      setTotal(data.total);
    }
  }, [data]);

  const voteHelpful = useCallback(async (reviewId: string) => {
  try {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId'); // For guests
    const guestEmail = localStorage.getItem('guestEmail'); // For guests

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(sessionId && { 'x-session-id': sessionId }),
    };

    const body = guestEmail ? JSON.stringify({ guestEmail }) : undefined;

    const response = await fetch(
      `http://localhost:3021/api/reviews/${reviewId}/helpful`,
      {
        method: 'POST',
        headers,
        body,
      }
    );

    if (!response.ok) throw new Error('Failed to vote');

    // Optimistic UI update
    setReviews(prev =>
      prev.map(review =>
        review._id === reviewId
          ? { ...review, helpfulVotes: (review.helpfulVotes || 0) + 1 }
          : review
      )
    );
  } catch (err) {
    console.error('Error voting:', err);
  }
}, []);

  const refetch = useCallback(() => {
    queryRefetch();
  }, [queryRefetch]);

  return {
    reviews,
    averageRating,
    ratingDistribution,
    total,
    isLoading,
    error,
    voteHelpful,
    refetch,
  };
};

export default useReviews;