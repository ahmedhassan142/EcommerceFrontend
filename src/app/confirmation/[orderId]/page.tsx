"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef,use } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

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
    Streetaddress:string;
    State_Province: string;
    City: string;
    state: string;
    Postalcode: string;
    Country: string;
  };
  estimatedDelivery?: string;
}

function ProductModel({ imageUrl }: { imageUrl?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#ffffff" 
        map={imageUrl ? new THREE.TextureLoader().load(imageUrl) : undefined}
      />
    </mesh>
  );
}

const OrderConfirmation = ({ params }: { params: Promise<{ orderId: string }> }) => {
  const router = useRouter();
  const { orderId } = use(params);
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

      {/* Everlane-style header */}
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
          {/* Order Summary with 3D effect */}
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
                      <Canvas>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} />
                        <ProductModel imageUrl={item.imageUrl} />
                        <Environment preset="city" />
                        <OrbitControls 
                          enableZoom={false}
                          autoRotate
                          autoRotateSpeed={2}
                        />
                      </Canvas>
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

      {/* Everlane-style footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} EERLANE. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default OrderConfirmation;