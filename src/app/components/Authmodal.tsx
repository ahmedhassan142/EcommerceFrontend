// components/AuthModal.tsx
"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import SigninForm from "./Signin";
import SignupForm from "./Signup";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isLogin ? "Sign In" : "Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {isLogin ? (
            <SigninForm onSuccess={onClose} />
          ) : (
            <SignupForm onSuccess={() => setIsLogin(true)} />
          )}
          
          <div className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-gray-900 hover:text-[#FFD5C2] font-semibold transition-colors duration-300"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-gray-900 hover:text-[#FFD5C2] font-semibold transition-colors duration-300"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}