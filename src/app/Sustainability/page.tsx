"use client"
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Sustainability() {
  return (
    <>
      <Head>
        <title>Sustainability | Modern Essentials</title>
        <meta name="description" content="Our commitment to the planet" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center bg-gray-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-70"
          />
          <div className="relative z-10 text-center px-4">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-light mb-6 text-gray-900"
            >
              For The Planet
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Our commitment to reducing fashion's environmental impact
            </motion.p>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-12 text-center text-gray-900">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: "83%", label: "of materials are sustainable" },
                { value: "45%", label: "reduction in water usage" },
                { value: "100%", label: "carbon neutral shipping" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-lg text-center"
                >
                  <motion.p
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl font-light mb-4 text-green-600"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Materials Section */}
          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-2xl font-light mb-8 text-gray-900">Sustainable Materials</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-gray-600 mb-6">
                  We carefully select materials that reduce environmental impact without compromising quality.
                </p>
                <ul className="space-y-4">
                  {[
                    "Organic cotton (grown without pesticides)",
                    "Recycled polyester (made from plastic bottles)",
                    "Tencel lyocell (from sustainably harvested wood)",
                    "Recycled wool (reclaimed from post-consumer garments)",
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <span className="inline-block w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-70" />
              </motion.div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-light mb-8 text-gray-900">Our Sustainability Journey</h3>
            <div className="relative">
              <div className="absolute left-4 h-full w-0.5 bg-gray-200" />
              {[
                { year: "2023", event: "Founded with commitment to sustainability" },
                { year: "2024", event: "Achieved 100% carbon neutral shipping" },
                { year: "2025", event: "Launched recycling program for old garments" },
                { year: "2026", event: "Goal: 100% sustainable materials in all products" },
              ].map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative pl-12 pb-8"
                >
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    {item.year}
                  </div>
                  <p className="text-gray-600">{item.event}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}