// components/CartSidebar.tsx
"use client";
// Should be at the top of every component file
import React from 'react';
import { useState } from "react";
import CartModal from "./Cartmodal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    size: string;
    color: string;
    imageUrl: string;
  };
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, product }) => {
  const [iscartopen,setiscartopen]=useState<boolean>(false)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Added to Cart</h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500">Size: {product.size}</p>
            <p className="text-sm text-gray-500">Color: {product.color}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-black text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors duration-300"
        >
          Continue Shopping
        </button>
        <button
        onClick={()=>setiscartopen(true)}
          className="w-full mt-4 bg-white border border-black text-black px-6 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors duration-300"
        >
          View Cart
        </button>
        
      </div>
      <CartModal isOpen={iscartopen} onClose={()=>setiscartopen(false)}/>
    </div>
  );
};

export default CartSidebar;