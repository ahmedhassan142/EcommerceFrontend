"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useProfile } from "../context/profileContext";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;

}

interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product?: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Cart {
  _id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const { isAuthenticated } = useAuth();
    const router = useRouter();
    const {userDetails}=useProfile()

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let params = {};
      
      // Prioritize userId if authenticated
      if (isAuthenticated && userDetails?._id) {
          params = { userId: userDetails._id };
           localStorage.removeItem('sessionId'); 
        } else {
         const sessionId = localStorage.getItem('sessionId') || '';
          params = { sessionId };
        }
        console.log('Fetching cart with params:', params);

    
      const response = await axios.get(`${process.env.CART_SERVICE_URL}/api/Cart/find`, { params });
      
      if (response.status === 200) {
        setCart(response.data || { items: [] });
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setError("Failed to load cart. Please try again.");
      setCart({ items: [] } as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const data = {
        productId,
        quantity: newQuantity,
        userId: userDetails?._id || undefined,
        sessionId: userDetails?._id ? undefined : localStorage.getItem('sessionId') || undefined
      };

      await axios.put(`${process.env.CART_SERVICE_URL}/api/Cart`, data);
      fetchCart();
    } catch (error) {
      console.error("Failed to update quantity", error);
      setError("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const data = {
        productId,
        userId: userDetails?._id || undefined,
        sessionId: userDetails?._id ? undefined : localStorage.getItem('sessionId') || undefined
      };

      await axios.delete(`${process.env.CART_SERVICE_URL}/api/Cart/delete`, { data });
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item", error);
      setError("Failed to remove item. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, userDetails]);

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cart?.items.reduce(
    (sum: number, item: CartItem) => sum + (item.product?.price || 0) * item.quantity, 
    0
  );
  const shipping = 10; // Fixed shipping cost
  const total = (subtotal || 0) + shipping;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading cart...</div>
        ) : cart?.items?.length === 0 ? (
          <p className="text-center py-8">Your cart is empty</p>
        ) : (
          <div className="divide-y">
            {cart?.items?.map((item: CartItem) => (
              <div key={item.productId} className="py-4 flex justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100">
                    {item.product?.imageUrl && (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.product?.name}</h3>
                    <p className="text-gray-600">${item.product?.price?.toFixed(2)}</p>
                    <p className="text-sm">Size: {item.size}</p>
                    <p className="text-sm">Color: {item.color}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.productId)}
                    className="mt-2 text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="py-6">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
               router.push(`/checkout?total=${total.toFixed(2)}`);
              }}
              className="w-full bg-black text-white py-3 rounded mt-4"
              disabled={cart?.items?.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;