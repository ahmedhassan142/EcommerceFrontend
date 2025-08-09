"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion } from 'framer-motion';

interface OrderDetails {
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    colors?: string[];
  }>;
  total: number;
  shipping: {
    fullname: string;
    Streetaddress: string;
    State_Province: string;
    City: string;
    state: string;
    Postalcode: string;
    Country: string;
  };
  estimatedDelivery?: string;
}

const OrderConfirmation = ({ params }: { params: { orderId: string } }) => {
  const router = useRouter();
  const { orderId } = params;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/order/${orderId}`);
          if (response.data.success) {
            setOrder(response.data.order);
          } else {
            setError(response.data.message || 'Failed to load order');
          }
        } catch (err) {
          setError('Failed to fetch order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-black">
      <div className="text-center max-w-md bg-gray-50 p-8 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-black">
      <div className="text-center max-w-md bg-gray-50 p-8 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white text-black"
    >
      <Head>
        <title>Order Confirmation - {order.orderId}</title>
      </Head>

      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <h1 className="text-2xl font-bold">Shopping Website</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank you for your order</h1>
          <p className="text-gray-600">Order #{order.orderId}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Order Summary</h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start justify-between py-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.colors && (
                        <div className="flex mt-2 space-x-2">
                          {item.colors.map((color, i) => (
                            <div 
                              key={i} 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-medium">${item.price.toFixed(2)}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Shipping Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">DELIVERING TO</h3>
                <p className="text-lg">{order.shipping.fullname}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">ADDRESS</h3>
                <p className="">{order.shipping.Streetaddress}</p>
                <p className="">
                  {order.shipping.City}, {order.shipping.State_Province} {order.shipping.Postalcode}
                </p>
                <p className="">{order.shipping.Country}</p>
              </div>
            </div>
            {order.estimatedDelivery && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500">ESTIMATED DELIVERY</h3>
                <p className="text-lg">{order.estimatedDelivery}</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">What happens next?</h2>
            <p className="text-gray-600 mb-4">
              We've sent a confirmation email with your order details.
            </p>
            {order.estimatedDelivery && (
              <p className="text-gray-600">
                Your order should arrive by {order.estimatedDelivery}.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition-all"
            >
              Continue Shopping
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/account/orders')}
              className="px-8 py-3 bg-white text-black border border-black rounded hover:bg-gray-50 transition-all"
            >
              View Order History
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Shopping Website. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default OrderConfirmation;