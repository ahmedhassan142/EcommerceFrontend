"use client"
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Quality() {
  return (
    <>
      <Head>
        <title>Quality | Modern Essentials</title>
        <meta name="description" content="Our commitment to exceptional quality" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center bg-gray-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-blue-50 opacity-70"
          />
          <div className="relative z-10 text-center px-4">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-light mb-6 text-gray-900"
            >
              Built To Last
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Timeless designs crafted with exceptional materials and attention to detail
            </motion.p>
          </div>
        </section>

        {/* Craftsmanship Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-12 text-center text-gray-900">Our Craftsmanship</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 mb-6">
                  Every stitch, seam, and detail is carefully considered to create pieces that stand the test of time.
                </p>
                <p className="text-lg text-gray-600">
                  We partner with skilled artisans who take pride in their work, ensuring each garment meets our exacting standards.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-gray-200 opacity-70" />
              </motion.div>
            </div>
          </motion.div>

          {/* Quality Features */}
          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-2xl font-light mb-8 text-gray-900">Quality Features</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Reinforced Stitching",
                  description: "Double-stitched seams for durability",
                },
                {
                  title: "Premium Fabrics",
                  description: "Only the highest quality materials",
                },
                {
                  title: "Thoughtful Details",
                  description: "Functional elements designed to last",
                },
                {
                  title: "Rigorous Testing",
                  description: "Each style tested for wear and tear",
                },
                {
                  title: "Timeless Design",
                  description: "Styles that transcend seasons",
                },
                {
                  title: "Easy Care",
                  description: "Designed to look great wash after wash",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <h4 className="text-xl font-medium mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quality Promise */}
          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-12 rounded-lg text-center"
          >
            <motion.h3
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-3xl font-light mb-6 text-gray-900"
            >
              Our Quality Promise
            </motion.h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you're not completely satisfied with the quality of your purchase, we'll make it right.
            </p>
          </motion.div>
        </section>
      </div>
    </>
  );
}