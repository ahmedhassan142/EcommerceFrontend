"use client"
import { motion } from 'framer-motion';
import Head from 'next/head';
 const About=() =>{
  return (
    <>
      <Head>
        <title>About Us | Modern Essentials</title>
        <meta name="description" content="Learn about our mission and values" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[80vh] flex items-center justify-center bg-gray-50 overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-70"
          />
          <div className="relative z-10 text-center px-4">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-light mb-6 text-gray-900"
            >
              Radical Transparency
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              We believe customers have the right to know what their products are made of, where they come from, and who made them.
            </motion.p>
          </div>
        </motion.section>

        {/* Our Story */}
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-8 text-gray-900">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2023, we set out to prove that fashion could be made with integrity—better for people and the planet.
                </p>
                <p className="text-lg text-gray-600">
                  We started with a simple idea: create timeless essentials with radical transparency about pricing, materials, and factories.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-green-200 opacity-70" />
              </motion.div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-light mb-12 text-center text-gray-900">Meet The Team</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { name: "Alex Johnson", role: "Founder & CEO" },
                { name: "Sam Lee", role: "Head of Design" },
                { name: "Taylor Smith", role: "Sustainability Lead" },
              ].map((person, index) => (
                <motion.div
                  key={person.name}
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-lg text-center"
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-green-100" />
                  <h4 className="text-xl font-medium mb-1">{person.name}</h4>
                  <p className="text-gray-500">{person.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-gray-900">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Ethical Factories",
                  description: "We partner with factories that pay fair wages and provide safe working conditions.",
                },
                {
                  title: "Sustainable Materials",
                  description: "From organic cotton to recycled polyester, we prioritize planet-friendly fabrics.",
                },
                {
                  title: "Transparent Pricing",
                  description: "See exactly what you're paying for with our cost breakdowns.",
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-4 text-blue-500">{index + 1}.</div>
                  <h3 className="text-xl font-medium mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
export default About;