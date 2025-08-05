'use client';
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/context/authContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyEmailContent = () => {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router, checkAuth]);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const userId = searchParams.get('userId');
        const token = searchParams.get('token');

        if (!userId || !token) {
          throw new Error("Missing verification parameters");
        }

        const response = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
          { params: { userId, token } }
        );

        setVerificationStatus('success');
        setLoading(false);
        toast.success(response.data.message);
        setTimeout(() => router.push('/Signin'), 2000);
      } catch (error) {
        setVerificationStatus('error');
        setLoading(false);
        toast.error("Verification failed");
        setTimeout(() => router.push('/Signup'), 2000);
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center text-white p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center max-w-md bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Verifying your email...
            </h2>
            <p className="text-gray-400">Please wait while we verify your account</p>
          </>
        ) : verificationStatus === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <svg
                className="w-24 h-24 text-green-400 mx-auto drop-shadow-glow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Verification Complete!
            </h2>
            <p className="text-gray-400 mb-8">Your email has been successfully verified</p>
            {!isAuthenticated && (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  href="/Signin"
                  className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-full font-medium shadow-lg hover:bg-gray-200 transition-all group"
                >
                  Continue to Login
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <svg
                className="w-24 h-24 text-red-400 mx-auto drop-shadow-glow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Verification Failed
            </h2>
            <p className="text-gray-400 mb-8">The verification link is invalid or expired</p>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-full font-medium shadow-lg hover:bg-gray-200 transition-all group"
              >
                Return to Registration
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const VerifyEmail = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;