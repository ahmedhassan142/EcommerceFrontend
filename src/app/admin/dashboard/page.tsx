"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  FiPackage, 
  FiPlus, 
  FiList, 
  FiGrid, 
  FiX,
  FiChevronLeft,
  FiMenu,
  FiActivity,
  FiLayers,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
  FiTruck,
  FiSettings,
  FiAlertCircle,
  FiClock,
  FiImage,
  FiTag
} from "react-icons/fi";

// Dynamically import components
const Categoryform = dynamic(() => import("../../components/Categoryform"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Loading form...</p>
});

const Productform = dynamic(() => import("../../components/Productform"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Loading form...</p>
});

export default function AdminLayout() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(event.target) && 
            !document.querySelector('.mobile-menu-button').contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Auto-close sidebar on mobile when switching tabs
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders
      const ordersResponse = await fetch(`${process.env.ORDER_SERVICE_URL}/api/order`);
      const ordersData = await ordersResponse.json();
      
      // Fetch all products
      const productsResponse = await fetch(`${process.env.PRODUCT_SERVICE_URL}/api/products`);
      const productsData = await productsResponse.json();
      
      // Fetch all registered users
      const usersResponse = await fetch(`${process.env.AUTH_SERVICE_URL}/api/auth`);
      const usersData = await usersResponse.json();

      // Fetch all shipping data
      const shippingResponse = await fetch(`${process.env.SHIPPING_SERVICE_URL}/api/shipping`);
      const shippingData = await shippingResponse.json();

      // Create a map of shipping data by _id for quick lookup
      const shippingMap = shippingData.data.reduce((map, shipping) => {
        map[shipping._id] = shipping;
        return map;
      }, {});

      // Calculate totals and process recent orders
      const totalProductCosts = productsData.data.reduce((sum, product) => sum + product.price, 0);
      const totalRevenue = ordersData.data.reduce((sum, order) => sum + order.total, 0);
      const netRevenue = totalRevenue - totalProductCosts;

      // Get recent orders (created in last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 600 * 60 * 1000);
      const recentOrdersData = ordersData.data
        .filter(order => new Date(order.createdAt) > tenMinutesAgo)
        .slice(0, 5)
        .map(order => {
          // Get shipping info using shippingId from order
          const shippingInfo = order.shippingId ? shippingMap[order.shippingId] : null;

          return {
            id: `#${order._id.substring(0, 8)}`,
            customer: shippingInfo?.fullname || order.guestEmail || (order.userId ? 'Registered User' : 'Guest'),
            date: order.createdAt,
            amount: `$${order.total.toFixed(2)}`,
            status: order.status || 'pending',
            orderData: order,
            Streetaddress:shippingInfo?.Streetaddress,
            Postalcode:shippingInfo?.Postalcode,
            City:shippingInfo?.City,
            State_Province:shippingInfo?.State_Province,
            Country:shippingInfo?.Country



          };
        });

      setStats({
        totalRevenue: netRevenue,
        totalOrders: ordersData.data.length,
        totalCustomers: usersData.data.length,
        totalProducts: productsData.data.length
      });
      

      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const statusStyles = {
    shipped: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    pending: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center bg-gray-900 text-white p-4 shadow-md sticky top-0 z-40"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors mobile-menu-button"
          >
            {isSidebarOpen ? <FiChevronLeft /> : <FiMenu />}
          </button>
          <Link href="/" className="text-xl font-light hover:text-[#FFD5C2] transition-colors flex items-center gap-2">
            <FiActivity className="text-[#FFD5C2]" />
            <span className="hidden sm:inline">Modern Essentials Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiAlertCircle className="text-xl text-[#FFD5C2]" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#FFD5C2] flex items-center justify-center text-gray-900 font-medium">
            AD
          </div>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Full height */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`bg-black text-white transition-all duration-300 ease-in-out fixed h-full z-30 ${
            isSidebarOpen ? "w-64" : "w-0 md:w-16"
          }`}
        >
          <div className={`p-4 h-full flex flex-col ${!isSidebarOpen && "hidden md:flex"}`}>
            {/* Toggle Button - Desktop */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex items-center justify-center mb-4 p-2 bg-gray-800 rounded-lg hover:bg-[#FFD5C2] hover:text-gray-900 transition-colors w-full"
            >
              {isSidebarOpen ? <FiChevronLeft /> : <FiMenu />}
            </motion.button>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto">
              {/* Dashboard */}
              <div className="mb-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "dashboard" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiActivity className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Dashboard</span>}
                </motion.button>
              </div>

              {/* Manage Product Section */}
              <div className="mb-2">
                <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider text-gray-400 ${!isSidebarOpen && "hidden"}`}>
                  Products
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("products")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "products" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiPackage className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">All Products</span>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProductForm(true)}
                  className="flex items-center p-3 rounded-lg hover:bg-[#FFD5C2] hover:text-gray-900 transition-colors w-full group"
                >
                  <FiPlus className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Add Product</span>}
                </motion.button>
              </div>

              {/* Categories */}
              <div className="mb-2">
                <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider text-gray-400 ${!isSidebarOpen && "hidden"}`}>
                  Categories
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("categories")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "categories" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiGrid className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">All Categories</span>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center p-3 rounded-lg hover:bg-[#FFD5C2] hover:text-gray-900 transition-colors w-full group"
                >
                  <FiPlus className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Add Category</span>}
                </motion.button>
              </div>

              {/* Orders */}
              <div className="mb-2">
                <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider text-white-400 ${!isSidebarOpen && "hidden"}`}>
                  Orders
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "orders" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiShoppingCart className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Order Management</span>}
                </motion.button>
              </div>

              {/* Customers */}
              <div className="mb-2">
                <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider text-gray-400 ${!isSidebarOpen && "hidden"}`}>
                  Customers
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("customers")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "customers" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiUsers className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Customer List</span>}
                </motion.button>
              </div>

              {/* Analytics */}
              <div className="mb-2">
                <h3 className={`text-xs font-semibold mb-2 uppercase tracking-wider text-gray-400 ${!isSidebarOpen && "hidden"}`}>
                  Analytics
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("analytics")}
                  className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                    activeTab === "analytics" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                  }`}
                >
                  <FiBarChart2 className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                  {isSidebarOpen && <span className="font-light">Reports</span>}
                </motion.button>
              </div>
            </div>

            {/* Settings */}
            <div className="mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("settings")}
                className={`flex items-center p-3 rounded-lg w-full transition-colors group ${
                  activeTab === "settings" ? "bg-[#FFD5C2] text-gray-900" : "hover:bg-[#FFD5C2] hover:text-gray-900"
                }`}
              >
                <FiSettings className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                {isSidebarOpen && <span className="font-light">Settings</span>}
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 transition-all duration-300 ${isSidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-16"}`}>
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-light text-gray-900 flex items-center gap-2">
                <FiLayers className="text-[#FFD5C2]" />
                Dashboard Overview
              </h1>
              
              {/* Stats Cards - Compact layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Revenue Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFD5C2]/10 rounded-lg">
                        <FiDollarSign className="text-[#FFD5C2] text-lg" />
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
                    </div>
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
                      +${(stats.totalRevenue * 0.12).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xl font-light mt-2">${stats.totalRevenue.toFixed(2)}</p>
                </motion.div>

                {/* Orders Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFD5C2]/10 rounded-lg">
                        <FiShoppingCart className="text-[#FFD5C2] text-lg" />
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium">Orders</h3>
                    </div>
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
                      +{Math.floor(stats.totalOrders * 0.08)}
                    </span>
                  </div>
                  <p className="text-xl font-light mt-2">{stats.totalOrders}</p>
                </motion.div>

                {/* Customers Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFD5C2]/10 rounded-lg">
                        <FiUsers className="text-[#FFD5C2] text-lg" />
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium">Customers</h3>
                    </div>
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
                      +{Math.floor(stats.totalCustomers * 0.05)}
                    </span>
                  </div>
                  <p className="text-xl font-light mt-2">{stats.totalCustomers}</p>
                </motion.div>

                {/* Products Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFD5C2]/10 rounded-lg">
                        <FiPackage className="text-[#FFD5C2] text-lg" />
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium">Products</h3>
                    </div>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                      +3 new
                    </span>
                  </div>
                  <p className="text-xl font-light mt-2">{stats.totalProducts}</p>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-light text-gray-900 flex items-center gap-2">
                    <FiShoppingCart className="text-[#FFD5C2]" />
                    <span className="text-sm sm:text-base">Recent Orders (Last 10 minutes)</span>
                  </h2>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className="text-sm text-gray-900 hover:text-[#FFD5C2] transition-colors flex items-center gap-1"
                  >
                    View All <FiChevronLeft className="rotate-180" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFD5C2]"></div>
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="min-w-full">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentOrders.map((order) => (
                            <motion.tr 
                              key={order.id} 
                              whileHover={{ backgroundColor: "rgba(255, 213, 194, 0.1)" }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-light text-gray-900">{order.id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 truncate max-w-[100px]">{order.customer}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-light text-gray-900">{order.amount}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status]}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setShowOrderDetails(true);
                                  }}
                                  className="text-[#FFD5C2] hover:text-gray-900 flex items-center gap-1"
                                >
                                  <FiEdit size={12} /> <span className="hidden sm:inline">Details</span>
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent orders in the last 10 minutes
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Products & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Products */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-light text-gray-900 flex items-center gap-2">
                      <FiPackage className="text-[#FFD5C2]" />
                      <span className="text-sm sm:text-base">New Products</span>
                    </h2>
                    <button className="text-sm text-gray-900 hover:text-[#FFD5C2] transition-colors flex items-center gap-1">
                      View All <FiChevronLeft className="rotate-180" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <motion.div 
                        key={item} 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          <FiImage className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-light text-gray-900">Organic Cotton T-Shirt</h4>
                          <p className="text-xs text-gray-500">Added 2 days ago</p>
                        </div>
                        <div className="text-sm font-light text-gray-900">$45.00</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-light text-gray-900 flex items-center gap-2">
                      <FiClock className="text-[#FFD5C2]" />
                      <span className="text-sm sm:text-base">Recent Activity</span>
                    </h2>
                    <button className="text-sm text-gray-900 hover:text-[#FFD5C2] transition-colors flex items-center gap-1">
                      View All <FiChevronLeft className="rotate-180" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { action: "New order received", time: "5 min ago", user: "Alex Johnson" },
                      { action: "Product updated", time: "1 hour ago", user: "You" },
                      { action: "New customer registered", time: "3 hours ago", user: "Maria Garcia" }
                    ].map((activity, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ x: 5 }}
                        className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-[#FFD5C2]"></div>
                        <div className="flex-1">
                          <p className="text-sm font-light text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Other Tabs */}
          {activeTab === "products" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiPackage className="text-[#FFD5C2]" />
                Product Management
              </h1>
              {/* Products content would go here */}
            </motion.div>
          )}

          {activeTab === "categories" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiGrid className="text-[#FFD5C2]" />
                Category Management
              </h1>
              {/* Categories content would go here */}
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiShoppingCart className="text-[#FFD5C2]" />
                Order Management
              </h1>
              {/* Orders content would go here */}
            </motion.div>
          )}

          {activeTab === "customers" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiUsers className="text-[#FFD5C2]" />
                Customer Management
              </h1>
              {/* Customers content would go here */}
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiBarChart2 className="text-[#FFD5C2]" />
                Analytics & Reports
              </h1>
              {/* Analytics content would go here */}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-light mb-4 text-gray-900 flex items-center gap-2">
                <FiSettings className="text-[#FFD5C2]" />
                Settings
              </h1>
              {/* Settings content would go here */}
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showProductForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-gray-800">Add New Product</h2>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <Productform onSuccess={() => setShowProductForm(false)} />
          </motion.div>
        </motion.div>
      )}

      {showCategoryForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-gray-800">Add New Category</h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <Categoryform onSuccess={() => setShowCategoryForm(false)} />
          </motion.div>
        </motion.div>
      )}

      {showOrderDetails && recentOrders.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-gray-800">Order Details - {recentOrders[0].id}</h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-light mb-2 text-gray-900">Customer Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {recentOrders[0].orderData.guestEmail || recentOrders[0].orderData.userId}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Order Date:</span> {new Date(recentOrders[0].orderData.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Status:</span> <span className="capitalize">{recentOrders[0].orderData.status}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-light mb-2 text-gray-900">Shipping Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {recentOrders[0].orderData.fullname || 'N/A'}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Address:</span> {recentOrders[0].orderData.Streetaddress || 'N/A'}, {recentOrders[0].orderData.City || 'N/A'}, {recentOrders[0].orderData.State_Province || 'N/A'}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Country:</span> {recentOrders[0].orderData.Country || 'N/A'}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Phone:</span> {recentOrders[0].orderData.Phonenumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-light mb-2 text-gray-900">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders[0].orderData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            {item.productId && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.size}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-light text-gray-900">
                              {item.productId ? item.size : "Product not found"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-light text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-light">${recentOrders[0].orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm font-light">${recentOrders[0].orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Shipping:</span>
                    <span className="text-sm font-light">${recentOrders[0].orderData.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-900">Total:</span>
                    <span className="text-sm font-light">${recentOrders[0].orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}