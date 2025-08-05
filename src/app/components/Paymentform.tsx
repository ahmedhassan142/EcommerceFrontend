"use client";

import React from "react";
import axios from "axios";
import z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

// Define the Zod schema for the payment form
const PaymentFormSchema = z.object({
  CardName: z.string().min(4, "CardName is required"),
  CardNumber: z.coerce.string()  // Automatically converts to string
    .min(6, "Cardnumber must be greater than 5 digits")
    .max(10),
  CVV: z.coerce.string().min(6).max(10),
  Expirydate: z.string().min(4, "Expiry date is required"),
});

export type PaymentFormValues = z.infer<typeof PaymentFormSchema>;
export interface PaymentDocument extends PaymentFormValues {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentDocument) => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onSuccess }) => {
  const [response, setResponse] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Initialize react-hook-form with Zod resolver - MOVED INSIDE THE COMPONENT
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      CardName: "",
      CardNumber: "",
      CVV: "",
      Expirydate: "",
    },
  });

  // Handle form submission
  const onsubmit = async (data: PaymentFormValues) => {
    try {
      const response = await axios.post(`${process.env.PAYMENT_SERVICE_URL}/api/payment/post`, data);
      const paymentdocument = response.data.data || response.data;
      
      if (!paymentdocument._id) {
        throw new Error("failed to find Id");
      }
      
      await onSubmit(paymentdocument); // This calls handlePaymentComplete
      onSuccess(); // This closes the form or shows success message
    } catch (error) {
      console.error(error);
      setError("Payment processing failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl border border-gray-100 transform transition-all hover:scale-105">
      <h1 className="text-center font-bold text-3xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Payment Form
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">
          {/* Card Name Field */}
          <FormField
            control={form.control}
            name="CardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Enter Your CardName</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter CardName"
                    {...field}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm transition-all"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Card Number Field */}
          <FormField
            control={form.control}
            name="CardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Enter Your CardNumber</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter CardNumber"
                    {...field}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm transition-all"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* CVV Field */}
          <FormField
            control={form.control}
            name="CVV"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Enter CVV</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter CVV"
                    {...field}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm transition-all"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Expiry Date Field */}
          <FormField
            control={form.control}
            name="Expirydate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Enter the Expiry Date</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    {...field}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm transition-all"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
                       type="submit"
                       className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-[#FFD5C2] hover:text-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD5C2] focus:ring-offset-2 font-semibold shadow-lg"
                     >
                       Submit
                     </Button>
          </div>
        </form>
      </Form>

      {/* Display Response or Error */}
      {response && (
        <p className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          {response}
        </p>
      )}
      {error && (
        <p className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentForm;