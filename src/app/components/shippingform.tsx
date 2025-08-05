"use client";

import { Button } from '../../ui/button';
import { useForm } from "react-hook-form";
import { Input } from '../../ui/input';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import z from 'zod';
import axios from 'axios';
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { zodResolver } from '@hookform/resolvers/zod';

interface CountryData {
  country: string;
  iso2: string;
  cities: string[];
}

const ShippingFormSchema = z.object({
  fullname: z.string().min(4, "Full name must be at least 4 characters").max(50),
  Country: z.string().min(1, "Please select a country"),
  Streetaddress: z.string().min(4, "Address must be at least 4 characters").max(100),
  City: z.string().min(1, "Please select a city"),
  Apartment: z.string().min(4).max(50).optional(),
  State_Province: z.string().min(4, "State/Province must be at least 4 characters").max(100),
  Postalcode: z.coerce.string().min(4, "Postal code must be 4-6 digits").max(6),
  Phonenumber: z.coerce.string().min(6, "Phone number must be 6-10 digits").max(10),
});

export type ShippingFormValues = z.infer<typeof ShippingFormSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormValues) => void;
  onSuccess: () => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, onSuccess }) => {
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(ShippingFormSchema),
    defaultValues: {
      fullname: "",
      Country: "",
      Streetaddress: "",
      Apartment: "",
      City: "",
      State_Province: "",
      Postalcode: "",
      Phonenumber: "",
    },
  });

  // Fetch all countries and cities data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        if (!response.ok) throw new Error('Failed to fetch data');

        const result = await response.json();
        if (!result.data || !result.data.length) {
          throw new Error('No data received');
        }

        setCountriesData(result.data);
      } catch (error) {
        console.error("Data fetch failed:", error);
        setApiError("Couldn't load shipping data. Please refresh or try again later.");
        
        // Fallback data
        setCountriesData([
          {
            country: "United States",
            iso2: "US",
            cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
          },
          {
            country: "United Kingdom",
            iso2: "GB",
            cities: ["London", "Manchester", "Birmingham", "Liverpool"]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update cities when country changes
  useEffect(() => {
    const selectedCountry = form.watch("Country");
    if (!selectedCountry) {
      setCities([]);
      return;
    }

    const country = countriesData.find(c => c.country === selectedCountry);
    setCities(country?.cities || []);
  }, [form.watch("Country"), countriesData]);

  const handleSubmit = async (data: ShippingFormValues) => {
    try {
      const response = await axios.post('http://localhost:3005/api/shipping/post', data);
      onSubmit(response.data);
      onSuccess();
    } catch (error) {
      console.error("Failed to submit shipping data:", error);
      setApiError("Failed to submit shipping details. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl w-full bg-black rounded-lg shadow-md max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-md w-full border border-gray-100 relative">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Shipping Details</h2>

          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {apiError}
            </div>
          )}

          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Full Name*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country Dropdown with Scrollbar */}
          <FormField
            control={form.control}
            name="Country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Country*</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <SelectValue placeholder={isLoading ? "Loading countries..." : "Select country"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <div className="max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white z-50">
                        {countriesData.map((country) => (
                          <SelectItem key={country.iso2} value={country.country}>
                            {country.country}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Streetaddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Street Address*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="123 Main St"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City Dropdown with Scrollbar */}
          <FormField
            control={form.control}
            name="City"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">City*</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("Country")}
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <SelectValue 
                        placeholder={!form.watch("Country") ? "Select country first" : "Select city"} 
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <div className="max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white z-50">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Apartment, Suite, etc. (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Apt 4B"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="State_Province"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">State/Province*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="California"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Postalcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Postal Code*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="90210"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Phonenumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Phone Number*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="5551234567"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-[#FFD5C2] hover:text-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD5C2] focus:ring-offset-2 font-semibold shadow-lg"
          >
            Save Shipping Details
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ShippingForm;