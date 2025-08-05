"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiStar, FiCheck, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/app/context/authContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating"),
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  comment: z.string().min(20, "Please write at least 20 characters").max(1000),
  photos: z.array(z.string()).max(4, "Maximum 4 photos allowed"),
  fit: z.enum(['runs-small', 'true-to-size', 'runs-large']).optional(),
  afterWash: z.enum(['shrank', 'no-change', 'stretched']).optional(),
  wearFrequency: z.enum(['daily', 'weekly', 'monthly']).optional()
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  itemId?: string;
  onSuccess: () => void;
}

const ReviewForm = ({ productId, orderId, itemId, onSuccess }: ReviewFormProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [guestEmail, setGuestEmail] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const sessionId = localStorage.getItem('sessionId') || '';

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
      photos: [],
      fit: undefined,
      afterWash: undefined,
      wearFrequency: undefined
    }
  });

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    const fileArray = Array.from(files).slice(0, 4 - previewImages.length);

    if (fileArray.length === 0) {
      toast.warning('Maximum 4 photos allowed');
      return;
    }

    fileArray.forEach(file => {
      if (!file.type.match('image.*')) {
        toast.error('Only image files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === fileArray.length) {
            const updatedPreviews = [...previewImages, ...newPreviews].slice(0, 4);
            setPreviewImages(updatedPreviews);
            form.setValue('photos', updatedPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    form.setValue('photos', newPreviews);
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    setSubmitError('');
    
    const toastId = toast.loading("Submitting your review...", {
      position: "top-center",
      autoClose: false,
      closeButton: false,
    });

    try {
      // Manually validate all fields
      await form.trigger();

      if (!form.formState.isValid) {
        throw new Error("Please fill all required fields");
      }

      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', data.rating.toString());
      formData.append('title', data.title);
      formData.append('comment', data.comment);
      
      if (data.fit) formData.append('fit', data.fit);
      if (data.afterWash) formData.append('afterWash', data.afterWash);
      if (data.wearFrequency) formData.append('wearFrequency', data.wearFrequency);
      
      if (isAuthenticated && user) {
        formData.append('userId', user._id);
      } else {
        formData.append('sessionId', sessionId);
        if (guestEmail) formData.append('guestEmail', guestEmail);
      }

      if (previewImages.length > 0) {
        previewImages.forEach((img, index) => {
          if (img.startsWith('data:')) {
            const blob = dataURLtoBlob(img);
            formData.append('photos', blob, `review-photo-${index}.jpg`);
          } else {
            formData.append('photos', img);
          }
        });
      }

      const response = await axios.post(
        `${process.env.REVIEW_SERVICE_URL}/api/reviews/product/${productId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 15000
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit review');
      }

      toast.update(toastId, {
        render: "Review submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });

      setSubmitSuccess(true);
      form.reset();
      setPreviewImages([]);
      setSelectedRating(0);
      onSuccess();
    } catch (error: any) {
      console.error("Review submission failed:", error);
      
      let errorMessage = "Failed to submit review. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium mb-2">Thank you for your review!</h3>
          <p className="text-gray-600">Your feedback helps other shoppers make better decisions.</p>
          <Button
            onClick={onSuccess}
            className="mt-6"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
          <FiX 
            className="flex-shrink-0 mr-2 cursor-pointer" 
            onClick={() => setSubmitError('')}
          />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-100'}`}>
          1
        </div>
        <div className={`flex-1 h-px mx-2 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-100'}`}>
          2
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium mb-4">How would you rate this product?</h3>
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating *</FormLabel>
                    <FormControl>
                      <div className="flex justify-center mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-4xl focus:outline-none mx-1"
                          >
                            <span className={
                              star <= (hoverRating || selectedRating) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What's most important to know?" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('title');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="How does it fit? How's the quality? Would you recommend it?"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('comment');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                onClick={async () => {
                  // Validate current step fields before proceeding
                  const isValid = await form.trigger(['rating', 'title', 'comment']);
                  if (isValid) {
                    setStep(2);
                  }
                }}
                className="w-full"
              >
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-medium mb-4">Add more details</h3>

              {!isAuthenticated && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Your Email (optional)
                  </label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="For review verification"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Providing your email helps verify your review
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="fit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How does it fit?</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-white'>
                        <SelectItem value="runs-small">Runs Small</SelectItem>
                        <SelectItem value="true-to-size">True to Size</SelectItem>
                        <SelectItem value="runs-large">Runs Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="afterWash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>After washing</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select after wash" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-white'>
                        <SelectItem value="shrank">Shrank</SelectItem>
                        <SelectItem value="no-change">No Change</SelectItem>
                        <SelectItem value="stretched">Stretched</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload photos (optional)</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        {previewImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`Preview ${index}`} 
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              onClick={() => removeImage(index)}
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition h-6 w-6"
                            >
                              <FiX size={14} />
                            </Button>
                          </div>
                        ))}
                        {previewImages.length < 4 && (
                          <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="text-center p-4">
                              <FiUpload className="mx-auto mb-1" />
                              <span className="text-xs">Add photo</span>
                              <span className="block text-xs text-gray-500">
                                ({4 - previewImages.length} remaining)
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;