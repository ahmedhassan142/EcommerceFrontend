import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
   typescript: {
    // !! WARNING !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["res.cloudinary.com"], // Add your domain here
  },
  experimental:{
    optimizeCss: false 
    
  },
  distDir: '.next',
  /* config options here */
  reactStrictMode: true,
  // swcMinify: true,
  compiler: {
    reactRemoveProperties: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    CART_SERVICE_URL:process.env.CART_SERVICE_URL,
    ORDER_SERVICE_URL:process.env.ORDER_SERVICE_URL,
    PAYMENT_SERVICE_URL:process.env.PAYMENT_SERVICE_URL,
    REVIEW_SERVICE_URL:process.env.REVIEW_SERVICE_URL,
    SHIPPING_SERVICE_URL:process.env.SHIPPING_SERVICE_URL,




    
  },
};

export default nextConfig;
