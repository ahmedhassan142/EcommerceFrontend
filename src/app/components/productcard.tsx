'use client';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, Suspense } from 'react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    colors: string[];
    category: string;
    material: string;
  };
  index: number;
  onView?: () => void;
}

function ProductModel({ imageUrl }: { imageUrl: string }) {
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
        map={new THREE.TextureLoader().load(imageUrl)}
      />
    </mesh>
  );
}

export function ProductCard({ product, index, onView }: ProductCardProps) {
  const trackProductView = () => {
    // Save to localStorage as last viewed product
    localStorage.setItem('lastViewedProduct', JSON.stringify(product));
    if (onView) onView();
    
    // Send view event to API
    fetch('/api/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product._id,
        type: 'view'
      }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl overflow-hidden cursor-pointer"
      onClick={trackProductView}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
      
      <div className="relative z-20">
        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        <p className="text-gray-300 mb-4">${product.price.toFixed(2)}</p>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {product.material}
          </span>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {product.colors.map((color, i) => (
            <div 
              key={i} 
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 h-full w-full">
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <ProductModel imageUrl={product.imageUrl} />
            <Environment preset="city" />
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={2}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 4}
            />
          </Suspense>
        </Canvas>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-6 right-6 z-20 bg-white text-gray-900 px-4 py-2 rounded-full font-medium shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          fetch('/api/interactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: product._id,
              type: 'cart'
            }),
          });
        }}
      >
        Add to Cart
      </motion.button>
    </motion.div>
  );
}