"use client";
import { useState, useEffect } from 'react';
import { FiX, FiUser, FiCreditCard, FiTruck, FiEdit, FiTrash2, FiCheck, FiPlus, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useProfile } from '@/app/context/profileContext';

interface PaymentDetail {
  _id: string;
  CardName: string;
  CardNumber: string;
  Expirydate: string;
  CVV?: string;
  status?: string;
  createdAt?: string;
  isDefault?: boolean;
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
  status?: string;
  createdAt?: string;
  isDefault?: boolean;
}

interface Order {
  _id: string;
  userId: string;
  shippingId: string;
  paymentId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  confirmationSent: boolean;
  reviewEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserDataResponse {
  success: boolean;
  orders: Order[];
  paymentDetails: Array<{
    data: PaymentDetail;
    message: string;
  }>;
  shippingDetails: ShippingDetail[];
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { userDetails,updateUserDetails } = useProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'payments' | 'shipping'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState<UserDataResponse | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    email: userDetails?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    CardName: '',
    CardNumber: '',
    Expirydate: '',
    CVV: '',
    isDefault: false
  });

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    fullname: '',
    Country: '',
    Streetaddress: '',
    City: '',
    State_Province: '',
    Postalcode: '',
    Phonenumber: '',
    isDefault: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<UserDataResponse>(
          `${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`
        );
        setUserData(response.data);
      } catch (err) {
        setError('Failed to load user data');
        toast.error('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    if (userDetails?._id) {
      fetchUserData();
    }
  }, [userDetails?._id]);

  const resetForms = () => {
    setProfileForm({
      firstName: userDetails?.firstName || '',
      lastName: userDetails?.lastName || '',
      email: userDetails?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPaymentForm({
      CardName: '',
      CardNumber: '',
      Expirydate: '',
      CVV: '',
      isDefault: false
    });
    setShippingForm({
      fullname: '',
      Country: '',
      Streetaddress: '',
      City: '',
      State_Province: '',
      Postalcode: '',
      Phonenumber: '',
      isDefault: false
    });
    setCurrentEditId(null);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`${process.env.AUTH_SERVICE_URL}/api/auth/profile/update`, {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword
      });
      toast.success('Profile updated successfully');
      setEditMode(false);
      
      resetForms();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentEditId) {
        // Update existing payment
        await axios.put(`${process.env.PAYMENT_SERVICE_URL}/api/payment/${currentEditId}`, {
          CardName: paymentForm.CardName,
          CardNumber: paymentForm.CardNumber,
          Expirydate: paymentForm.Expirydate,
          CVV: paymentForm.CVV,
          isDefault: paymentForm.isDefault
        });
        toast.success('Payment method updated successfully');
      } else {
        // Add new payment
        await axios.post('/api/payment', {
          CardName: paymentForm.CardName,
          CardNumber: paymentForm.CardNumber,
          Expirydate: paymentForm.Expirydate,
          CVV: paymentForm.CVV,
          isDefault: paymentForm.isDefault,
          userId: userDetails?._id
        });
        toast.success('Payment method added successfully');
      }
      setEditMode(false);
      resetForms();
      // Refresh data
      const response = await axios.get<UserDataResponse>(
        `${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`
      );
      setUserData(response.data);
    } catch (error) {
      toast.error('Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentEditId) {
        // Update existing shipping
        await axios.put(`${process.env.SHIPPING_SERVICE_URL}/api/shipping/${currentEditId}`, {
          fullname: shippingForm.fullname,
          Country: shippingForm.Country,
          Streetaddress: shippingForm.Streetaddress,
          City: shippingForm.City,
          State_Province: shippingForm.State_Province,
          Postalcode: shippingForm.Postalcode,
          Phonenumber: shippingForm.Phonenumber,
          isDefault: shippingForm.isDefault
        });
        toast.success('Shipping address updated successfully');
      } else {
        // Add new shipping
        await axios.post(`${process.env.SHIPPING_SERVICE_URL}/api/shipping`, {
          fullname: shippingForm.fullname,
          Country: shippingForm.Country,
          Streetaddress: shippingForm.Streetaddress,
          City: shippingForm.City,
          State_Province: shippingForm.State_Province,
          Postalcode: shippingForm.Postalcode,
          Phonenumber: shippingForm.Phonenumber,
          isDefault: shippingForm.isDefault,
          userId: userDetails?._id
        });
        toast.success('Shipping address added successfully');
      }
      setEditMode(false);
      resetForms();
      // Refresh data
      const response = await axios.get<UserDataResponse>(
        `${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`
      );
      setUserData(response.data);
    } catch (error) {
      toast.error('Failed to save shipping address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await axios.delete(`${process.env.PAYMENT_SERVICE_URL}/api/payment/${id}`);
        toast.success('Payment method deleted successfully');
        // Refresh data
        const response = await axios.get<UserDataResponse>(
          `${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`
        );
        setUserData(response.data);
      } catch (error) {
        toast.error('Failed to delete payment method');
      }
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipping address?')) {
      try {
        await axios.delete(`${process.env.SHIPPING_SERVICE_URL}/api/shipping/${id}`);
        toast.success('Shipping address deleted successfully');
        // Refresh data
        const response = await axios.get<UserDataResponse>(
          `${process.env.ORDER_SERVICE_URL}/api/order/user/${userDetails?._id}`
        );
        setUserData(response.data);
      } catch (error) {
        toast.error('Failed to delete shipping address');
      }
    }
  };

  const handleSectionChange = (section: 'profile' | 'payments' | 'shipping') => {
    setActiveSection(section);
    setEditMode(false);
    resetForms();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - Desktop */}
          <div className="w-56 border-r p-6 hidden md:block bg-gray-50">
            <nav className="space-y-3">
              <button
                onClick={() => handleSectionChange('profile')}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${activeSection === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <FiUser className="mr-3" size={18} />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => handleSectionChange('payments')}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${activeSection === 'payments' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <FiCreditCard className="mr-3" size={18} />
                <span className="font-medium">Payment Methods</span>
              </button>
              <button
                onClick={() => handleSectionChange('shipping')}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${activeSection === 'shipping' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <FiTruck className="mr-3" size={18} />
                <span className="font-medium">Shipping Addresses</span>
              </button>
            </nav>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex border-b bg-gray-50">
            <button
              onClick={() => handleSectionChange('profile')}
              className={`flex-1 py-4 text-center flex flex-col items-center ${activeSection === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            >
              <FiUser className="mb-1" />
              <span className="text-xs">Profile</span>
            </button>
            <button
              onClick={() => handleSectionChange('payments')}
              className={`flex-1 py-4 text-center flex flex-col items-center ${activeSection === 'payments' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            >
              <FiCreditCard className="mb-1" />
              <span className="text-xs">Payments</span>
            </button>
            <button
              onClick={() => handleSectionChange('shipping')}
              className={`flex-1 py-4 text-center flex flex-col items-center ${activeSection === 'shipping' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
            >
              <FiTruck className="mb-1" />
              <span className="text-xs">Shipping</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <>
                {/* Profile Section */}
                {activeSection === 'profile' && (
                  <section>
                    {editMode ? (
                      <>
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            resetForms();
                          }}
                          className="flex items-center text-gray-700 mb-6 hover:text-black transition-colors"
                        >
                          <FiArrowLeft className="mr-2" /> Back to Profile
                        </button>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                        </div>
                        
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                              <input
                                type="text"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Enter your first name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                              <input
                                type="text"
                                value={profileForm.lastName}
                                onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Enter your last name"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={profileForm.email}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg bg-gray-100 text-gray-900"
                                placeholder="Your email address"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Change Password</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                                  <input
                                    type="password"
                                    value={profileForm.currentPassword}
                                    onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                                    className="w-full px-4 py-3 border text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                    placeholder="Enter current password"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                                  <input
                                    type="password"
                                    value={profileForm.newPassword}
                                    onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                                    className="w-full px-4 py-3 border text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                    placeholder="Enter new password"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
                                  <input
                                    type="password"
                                    value={profileForm.confirmPassword}
                                    onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 border text-gray-900 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                    placeholder="Confirm new password"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditMode(false);
                                resetForms();
                              }}
                              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                          <button 
                             onClick={() => {
                                setEditMode(true);
                               setProfileForm({
      firstName: userDetails?.firstName || '',
      lastName: userDetails?.lastName || '',
      email: userDetails?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
                              }}
                            className="flex items-center text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                          >
                            <FiEdit className="mr-2" /> Edit
                          </button>
                        </div>
                        
                        <div className="space-y-4 text-gray-900">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-base">{profileForm.firstName} {profileForm.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base">{profileForm.email}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                )}

                {/* Payments Section */}
                {activeSection === 'payments' && (
                  <section>
                    {editMode ? (
                      <>
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            resetForms();
                          }}
                          className="flex items-center text-gray-700 mb-6 hover:text-black transition-colors"
                        >
                          <FiArrowLeft className="mr-2" /> Back to Payment Methods
                        </button>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {currentEditId ? 'Edit Payment Method' : 'Add Payment Method'}
                          </h3>
                        </div>
                        
                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                              <input
                                type="text"
                                value={paymentForm.CardName}
                                onChange={(e) => setPaymentForm({...paymentForm, CardName: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="Name on card"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                              <input
                                type="text"
                                value={paymentForm.CardNumber}
                                onChange={(e) => setPaymentForm({...paymentForm, CardNumber: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                              <input
                                type="text"
                                value={paymentForm.Expirydate}
                                onChange={(e) => setPaymentForm({...paymentForm, Expirydate: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                              <input
                                type="text"
                                value={paymentForm.CVV}
                                onChange={(e) => setPaymentForm({...paymentForm, CVV: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="123"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={paymentForm.isDefault}
                                  onChange={(e) => setPaymentForm({...paymentForm, isDefault: e.target.checked})}
                                  className="rounded border-gray-300 text-black focus:ring-black mr-2"
                                />
                                <span className="text-sm text-gray-700">Set as default payment method</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditMode(false);
                                resetForms();
                              }}
                              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Saving...' : (currentEditId ? 'Update' : 'Add')} Payment Method
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
                          <button 
                            onClick={() => {
                              setEditMode(true);
                              setCurrentEditId(null);
                            }}
                            className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                          >
                            <FiPlus className="mr-2" /> Add New
                          </button>
                        </div>

                        {userData?.paymentDetails && userData.paymentDetails.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userData.paymentDetails.map((payment, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{payment.data.CardName}</p>
                                    <p className="text-gray-600 text-sm mt-1">•••• •••• •••• {payment.data.CardNumber.slice(-4)}</p>
                                    <p className="text-gray-600 text-sm mt-1">Expires {payment.data.Expirydate}</p>
                                    <p className="text-gray-600 text-sm mt-1">Status: {payment.data.status}</p>
                                  </div>
                                  <div className="flex space-x-3">
                                    <button 
                                      onClick={() => {
                                        setPaymentForm({
                                          CardName: payment.data.CardName,
                                          CardNumber: payment.data.CardNumber,
                                          Expirydate: payment.data.Expirydate,
                                          CVV: payment.data.CVV || '',
                                          isDefault: payment.data.isDefault || false
                                        });
                                        setCurrentEditId(payment.data._id);
                                        setEditMode(true);
                                      }}
                                      className="text-gray-700 hover:text-black"
                                    >
                                      <FiEdit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePayment(payment.data._id)}
                                      className="text-gray-700 hover:text-red-600"
                                    >
                                      <FiTrash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                                {payment.data.isDefault && (
                                  <div className="mt-3 text-green-600 text-sm flex items-center">
                                    <FiCheck className="mr-1" /> Default payment method
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-500">No payment methods saved</p>
                            <button 
                              onClick={() => {
                                setEditMode(true);
                                setCurrentEditId(null);
                              }}
                              className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                            >
                              Add Payment Method
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}

                {/* Shipping Section */}
                {activeSection === 'shipping' && (
                  <section>
                    {editMode ? (
                      <>
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            resetForms();
                          }}
                          className="flex items-center text-gray-700 mb-6 hover:text-black transition-colors"
                        >
                          <FiArrowLeft className="mr-2" /> Back to Shipping Addresses
                        </button>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {currentEditId ? 'Edit Shipping Address' : 'Add Shipping Address'}
                          </h3>
                        </div>
                        
                        <form onSubmit={handleShippingSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                              <input
                                type="text"
                                value={shippingForm.fullname}
                                onChange={(e) => setShippingForm({...shippingForm, fullname: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="Recipient's full name"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                              <input
                                type="text"
                                value={shippingForm.Streetaddress}
                                onChange={(e) => setShippingForm({...shippingForm, Streetaddress: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="123 Main St"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                              <input
                                type="text"
                                value={shippingForm.City}
                                onChange={(e) => setShippingForm({...shippingForm, City: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                              <input
                                type="text"
                                value={shippingForm.State_Province}
                                onChange={(e) => setShippingForm({...shippingForm, State_Province: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                              <input
                                type="text"
                                value={shippingForm.Postalcode}
                                onChange={(e) => setShippingForm({...shippingForm, Postalcode: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="ZIP/Postal code"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                              <input
                                type="text"
                                value={shippingForm.Country}
                                onChange={(e) => setShippingForm({...shippingForm, Country: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="Country"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                              <input
                                type="text"
                                value={shippingForm.Phonenumber}
                                onChange={(e) => setShippingForm({...shippingForm, Phonenumber: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                                placeholder="Phone number"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={shippingForm.isDefault}
                                  onChange={(e) => setShippingForm({...shippingForm, isDefault: e.target.checked})}
                                  className="rounded border-gray-300 text-black focus:ring-black mr-2"
                                />
                                <span className="text-sm text-gray-700">Set as default shipping address</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditMode(false);
                                resetForms();
                              }}
                              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Saving...' : (currentEditId ? 'Update' : 'Add')} Address
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Shipping Addresses</h3>
                          <button 
                            onClick={() => {
                              setEditMode(true);
                              setCurrentEditId(null);
                            }}
                            className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                          >
                            <FiPlus className="mr-2" /> Add New
                          </button>
                        </div>

                        {userData?.shippingDetails && userData.shippingDetails.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userData.shippingDetails.map((address, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{address.fullname}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.Streetaddress}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.City}, {address.State_Province} {address.Postalcode}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.Country}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.Phonenumber}</p>
                                  </div>
                                  <div className="flex space-x-3">
                                    <button 
                                      onClick={() => {
                                        setShippingForm({
                                          fullname: address.fullname,
                                          Country: address.Country,
                                          Streetaddress: address.Streetaddress,
                                          City: address.City,
                                          State_Province: address.State_Province,
                                          Postalcode: address.Postalcode,
                                          Phonenumber: address.Phonenumber,
                                          isDefault: address.isDefault || false
                                        });
                                        setCurrentEditId(address._id);
                                        setEditMode(true);
                                      }}
                                      className="text-gray-700 hover:text-black"
                                    >
                                      <FiEdit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteShipping(address._id)}
                                      className="text-gray-700 hover:text-red-600"
                                    >
                                      <FiTrash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                                {address.isDefault && (
                                  <div className="mt-3 text-green-600 text-sm flex items-center">
                                    <FiCheck className="mr-1" /> Default shipping address
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-500">No shipping addresses saved</p>
                            <button 
                              onClick={() => {
                                setEditMode(true);
                                setCurrentEditId(null);
                              }}
                              className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                            >
                              Add Shipping Address
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}