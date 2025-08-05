"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface CategoryFormProps {
  onSuccess: () => void;
}

interface Category {
  slug: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters").max(50),
  slug: z.string().min(4, "Slug must be at least 4 characters").max(50),
  parentslug: z.string().optional(),
  filters: z.array(z.string()).optional(),
});

const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/Category`);
        setCategories(response.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    setAvailableFilters([
      "Size",
      "Color",
      "Fit",
      "Material",
      "Brand",
      "Price Range",
      "Sustainability",
      "Occasion",
      "Season",
      "Pattern"
    ]);

    fetchCategories();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentslug: undefined,
      filters: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        parentslug: data.parentslug === "none" ? undefined : data.parentslug,
        filters: data.filters || []
      };

      await axios.post(`${process.env.PRODUCT_SERVICE_URL}/api/Category/add`, payload);
      setSuccess("Category created successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Create Category</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
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
                <FormLabel>Category Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent Category Field */}
          <FormField
            control={form.control}
            name="parentslug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "none"}
                  
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none"  className="bg-white">None (Top-level category)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug} className="bg-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Filters Field */}
          <FormField
            control={form.control}
            name="filters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Filters</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {availableFilters.map((filter) => (
                    <div key={filter} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${filter}`}
                        checked={field.value?.includes(filter)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const newValue = checked
                            ? [...current, filter]
                            : current.filter((item) => item !== filter);
                          field.onChange(newValue);
                        }}
                      />
                      <label htmlFor={`filter-${filter}`}>{filter}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Form>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
};

export default CategoryForm;