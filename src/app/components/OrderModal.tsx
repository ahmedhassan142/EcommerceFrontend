"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiPackage, FiTruck, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/context/authContext';
import { useProfile } from '../context/profileContext';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  imageUrl:string
  _id: string;
}

interface Order {
  _id: string;
  userId: string;
  shippingId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ShippingDetail {
  _id: string;
  fullname: string;
  Country: string;
  Streetaddress: string;
  City: string;
  State_Province: string;
  Postalcode: string;
  Phonenumber: string;
}

export default function OrdersModal({ onClose }: { onClose: () => void }) {
  const { userDetails } = useProfile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shippingDetails, setShippingDetails] = useState<Record<string, ShippingDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`);
        
        // Set orders
        setOrders(response.data.orders || []);
        
        // Create shipping details map
        const shippingMap: Record<string, ShippingDetail> = {};
        response.data.shippingDetails.forEach((detail: ShippingDetail) => {
          shippingMap[detail._id] = detail;
        });
        setShippingDetails(shippingMap);
        
      } catch (err) {
        setError('Failed to load orders');
        toast.error('Failed to load order information');
      } finally {
        setLoading(false);
      }
    };

    if (userDetails?._id) {
      fetchOrders();
    }
  }, [userDetails?._id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-gray-500">Your order history will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">
                        Order # {order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiCalendar className="mr-1" /> {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <div key={item._id} className="p-4 flex justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-gray-100 rounded-md w-16 h-16 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt="Product" 
            className="w-full h-full object-cover"
          />
        ) : (
          <FiPackage className="text-gray-400" />
        )}
      </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Product ID: {item.productId.slice(-8)}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shipping Info */}
                  {shippingDetails[order.shippingId] && (
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <FiTruck className="mr-2" /> Shipping Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-900">{shippingDetails[order.shippingId].fullname}</p>
                          <p className="text-gray-500">{shippingDetails[order.shippingId].Streetaddress}</p>
                          <p className="text-gray-500">
                            {shippingDetails[order.shippingId].City}, {shippingDetails[order.shippingId].State_Province} {shippingDetails[order.shippingId].Postalcode}
                          </p>
                          <p className="text-gray-500">{shippingDetails[order.shippingId].Country}</p>
                          <p className="text-gray-500">{shippingDetails[order.shippingId].Phonenumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Order Summary */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Tax</span>
                      <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-900">${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="flex items-center">
                        <FiDollarSign className="mr-1" /> {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}