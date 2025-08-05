"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "../types/types";
import { useForm } from "react-hook-form";
import { ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";

interface ProductFormProps {
  onSuccess: () => void;
}

const productFormSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters").max(50),
  slug: z.string().min(4, "Slug must be at least 4 characters").max(50),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  price: z.number().min(0.01, "Price must be greater than 0").max(10000),
  category: z.string().min(1, "Category is required"),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  colors: z.array(z.string()).min(1, "Select at least one color"),
  fit: z.string().min(1, "Fit is required"),
  material: z.string().min(1, "Material is required"),
  image: z
    .instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      file => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WEBP images are allowed"
    ),
  filters: z.record(z.array(z.string())).optional(),
});

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      category: "",
      sizes: [],
      colors: [],
      fit: "",
      material: "",
      filters: {},
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<{ data: Category[] }>(
          `${process.env.PRODUCT_SERVICE_URL}/api/Category`
        );
        setCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Productform.tsx
 const handleSubmit = async (data: z.infer<typeof productFormSchema>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // 1. Frontend validation
      if (!data.image) {
        throw new Error('Please select an image');
      }

      if (!(data.image instanceof File)) {
        throw new Error('Invalid file type');
      }

      // 2. Check file properties
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(data.image.type)) {
        throw new Error('Only JPEG, PNG, and WEBP images are allowed');
      }

      if (data.image.size > 10 * 1024 * 1024) {
        throw new Error('Image must be smaller than 10MB');
      }

      // 3. Prepare FormData
      const formData = new FormData();
      formData.append('image', data.image);
      formData.append('name', data.name.trim());
      formData.append('slug', data.slug.trim());
      formData.append('description', data.description?.trim() || '');
      formData.append('price', data.price.toString());
      formData.append('category', data.category.trim());
      formData.append('sizes', JSON.stringify(data.sizes));
      formData.append('colors', JSON.stringify(data.colors));
      formData.append('fit', data.fit.trim());
      formData.append('material', data.material.trim());

      if (data.filters) {
        formData.append('filters', JSON.stringify(data.filters));
      }

      // 4. Upload with progress tracking
      const response = await axios.post(`${process.env.PRODUCT_SERVICE_URL}/api/products/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        }
      });

      // 5. Handle response
      if (!response.data.success) {
        throw new Error(response.data.message || 'Product creation failed');
      }

      setSuccess('Product created successfully!');

    } catch (error: unknown) {
      let errorMessage = 'Failed to create product';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                      error.response?.statusText || 
                      error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      console.error('Product submission error:', error);

    } finally {
      setLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Create Product</h1>
      
      {/* Scrollable form container */}
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug Field */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Field */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full p-2 border rounded-md text-left"
                        onClick={() => setOpenCategoryId(openCategoryId ? null : "root")}
                      >
                        {field.value || "Select a category"}
                      </button>
                      {openCategoryId && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                          <div className="divide-y">
                            {categories.map((category) => (
                              <div key={category._id}>
                                <div
                                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                  onClick={() => {
                                    if (category.subcategories?.length) {
                                      setOpenCategoryId(category._id);
                                    } else {
                                      field.onChange(category.slug);
                                      setOpenCategoryId(null);
                                    }
                                  }}
                                >
                                  {category.name}
                                  {category.subcategories?.length && (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                                {openCategoryId === category._id && category.subcategories && (
                                  <div className="pl-4 bg-gray-50">
                                    {category.subcategories.map((subcategory) => (
                                      <div
                                        key={subcategory._id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          field.onChange(subcategory.slug);
                                          setOpenCategoryId(null);
                                        }}
                                      >
                                        {subcategory.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={handleUploadButtonClick}
                        variant="outline"
                      >
                        Upload Image
                      </Button>
                      {field.value && (
                        <p className="mt-2 text-sm">
                          Selected: {field.value.name}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size Selection */}
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {["S", "M", "L", "XL"].map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={field.value.includes(size)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, size]
                              : field.value.filter((item) => item !== size);
                            field.onChange(newValue);
                          }}
                        />
                        <label htmlFor={`size-${size}`}>{size}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Colors</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {["Black", "White", "Blue", "Red", "Green"].map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={field.value.includes(color)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, color]
                              : field.value.filter((item) => item !== color);
                            field.onChange(newValue);
                          }}
                        />
                        <label htmlFor={`color-${color}`}>{color}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fit Selection */}
            <FormField
              control={form.control}
              name="fit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent  className="bg-white">
                      <SelectItem value="Slim">Slim</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material Selection */}
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent  className="bg-white">
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Polyester">Polyester</SelectItem>
                      <SelectItem value="Denim">Denim</SelectItem>
                      <SelectItem value="Wool">Wool</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Filters */}
            {categories
              .find((cat) => cat.slug === form.watch("category"))
              ?.filters?.map((filter) => (
                <FormField
                  key={filter}
                  control={form.control}
                  name={`filters.${filter}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{filter}</FormLabel>
                      <div className="flex flex-wrap gap-4">
                        {["Option 1", "Option 2", "Option 3"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${filter}-${option}`}
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                const newValue = checked
                                  ? [...current, option]
                                  : current.filter((item) => item !== option);
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`${filter}-${option}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
};

export default ProductForm;