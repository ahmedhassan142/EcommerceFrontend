"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ShippingForm from '../components/shippingform';
import PaymentForm from '../components/Paymentform';
import { Product } from '@/app/types/types';
import { PaymentDocument } from '../components/Paymentform';
import { ShippingDocument } from '../components/shippingform';
import { useAuth } from '@/app/context/authContext';
import toast from 'react-hot-toast';
import { Button } from '@/ui/button';
import { AxiosResponse } from 'axios';
import { useProfile } from '../context/profileContext';

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: Product;
}
interface Apiresponse extends AxiosResponse{
  success:boolean;
  message:string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth,isLoading: authLoading  } = useAuth();
  const {userDetails}=useProfile()
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingData, setShippingData] = useState<ShippingDocument | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [tax, setTax] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [orderId, setOrderId] = useState('');
// Only react to auth changes // Removed cartItems dependency // Removed authLoading from dependencies
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        if (authLoading) return;
        let params = {};
        
        if (isAuthenticated && userDetails?._id) {
          params = { userId: userDetails._id };
          localStorage.removeItem('sessionId'); 
        } else {
          const sessionId = localStorage.getItem('sessionId') || '';
          params = { sessionId };
        }

        const response = await axios.get(`${process.env.CART_SERVICE_URL}/api/Cart/find`, { params });
        
        setDebugInfo({
          apiCall: 'GET /api/Cart/find',
          params,
          response: response.data,
          timestamp: new Date().toISOString()
        });

        if (response.data?.success && response.data.items?.length > 0) {
          setCartItems(response.data.items.map((item: any) => ({
            ...item,
            price: item.product?.price || 0
          })));
        } else {
          router.push('/carting');
        }
      } catch (err) {
        console.error("Cart load error:", err);
        setError("Failed to load cart items");
        toast.error("Failed to load your cart");
      } finally {
        setIsLoading(false);
      }
    };
    if (!authLoading) { // Only fetch after auth check completes
      fetchCartData();
    }

    fetchCartData();
  }, [router, isAuthenticated, userDetails,authLoading]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );
      const calculatedTax = subtotal * 0.1;
      const calculatedShipping = subtotal > 50 ? 0 : 5.99;

      setTax(calculatedTax);
      setShippingCost(calculatedShipping);
    }
  }, [cartItems]);

  const handlePlaceOrderClick = () => {
    setShowOrderConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    if (!shippingData || !paymentData) {
      setError("Missing shipping or payment information");
      toast.error("Please complete all required information");
      return;
    }

    if (!isAuthenticated && !guestEmail) {
      setError("Please provide your email address");
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowOrderConfirmation(false);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        imageUrl:item.product.imageUrl,
        ...(item.size && { size: item.size }),
        ...(item.color && { color: item.color })
      }));

      const subtotal = cartItems.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );
      const total = subtotal + tax + shippingCost;

      let orderData;
      
      if (isAuthenticated && userDetails?._id) {
        orderData = {
          userId: userDetails._id,
          shippingId: shippingData._id,
          paymentId: paymentData._id,
          items: orderItems,
          subtotal,
          tax,
          shippingCost,
          total
        };
      } else {
        const sessionId = localStorage.getItem('sessionId') || '';
        orderData = {
          sessionId,
          guestEmail,
          shippingId: shippingData._id,
          paymentId: paymentData._id,
          items: orderItems,
          subtotal,
          tax,
          shippingCost,
          total
        };
      }

      const response = await axios.post(`${process.env.ORDER_SERVICE_URL}/api/order/add`, orderData);

      setDebugInfo({
        apiCall: 'POST /api/order/add',
        requestData: orderData,
        response: response.data,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        setOrderId(response.data.orderId);
        
        try {
          if (isAuthenticated && userDetails?._id) {
            await axios.delete(`${process.env.CART_SERVICE_URL}/api/Cart/clear`, {
              params: { userId: userDetails._id }
            });
          } else {
            const sessionId = localStorage.getItem('sessionId') || '';
            await axios.delete(`${process.env.CART_SERVICE_URL}/api/Cart/clear`, {
              params: { sessionId }
            });
          }
        } catch (err) {
          console.error("Failed to clear cart:", err);
          toast.error("Order placed but couldn't clear cart. Please contact support.");
        }
        
        toast.success("Order placed successfully!");
        router.push(`/confirmation/${response.data.orderId}`);
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to place order. Please try again."
      );
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason) {
    toast.error("Please select a cancellation reason");
    return;
  }

  if (!orderId) {
    toast.error("No order ID found for cancellation");
    return;
  }

    setIsCancelling(true);
    try {
      const response = await axios.post<Apiresponse>(
        `${process.env.ORDER_SERVICE_URL}/api/order/${orderId}/cancel`,{
          data:{ reason: cancellationReason }
        }
      
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      console.error("Order cancellation error:", err);
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };
 

 


  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Loading your cart...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button 
          onClick={() => router.push('/')}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  ) + tax + shippingCost;

  const renderOrderConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Confirm Your Order</h3>
        <p className="mb-6">Are you ready to place your order?</p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              setShowOrderConfirmation(false);
              setShowCancelDialog(true);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel Order
          </Button>
          <Button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-white ${
              isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCancelDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Cancel Order</h3>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Reason for cancellation</label>
          <select
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a reason</option>
            <option value="changed-mind">Changed my mind</option>
            <option value="found-cheaper">Found a better price</option>
            <option value="shipping-delay">Shipping takes too long</option>
            <option value="other">Other reason</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setShowCancelDialog(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Go Back
          </Button>
          <Button
          type='submit'
            onClick={handleCancelOrder}
            disabled={!cancellationReason || isCancelling}
            className={`px-4 py-2 rounded-md text-white ${
              !cancellationReason || isCancelling 
                ? 'bg-gray-400' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-between mb-8">
          {['shipping', 'payment', 'review'].map((stepName, index) => (
            <div key={stepName} className={`flex flex-col items-center ${step === stepName ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === stepName ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {index + 1}
              </div>
              <div className="mt-2 text-sm capitalize">{stepName}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {step === 'shipping' && (
            <ShippingForm 
              onSuccess={() => console.log("Shipping confirmed")}
              onSubmit={(data) => {
                setShippingData(data);
                setStep('payment');
              }}
            />
          )}

          {step === 'payment' && shippingData && (
            <PaymentForm
              onSuccess={() => console.log("Payment confirmed")}
              onSubmit={(data) => {
                setPaymentData(data);
                setStep('review');
              }}
            />
          )}

          {step === 'review' && shippingData && paymentData && (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Shipping Information</h3>
                  <Button 
                    onClick={() => setStep('shipping')}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-1">
                  <p>{shippingData.fullname}</p>
                  <p>{shippingData.Streetaddress}</p>
                  <p>{shippingData.City}, {shippingData.State_Province} {shippingData.Postalcode}</p>
                  <p>{shippingData.Country}</p>
                  <p>Phone: {shippingData.Phonenumber}</p>
                  {guestEmail && <p>Email: {guestEmail}</p>}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Payment Method</h3>
                  <Button 
                    onClick={() => setStep('payment')}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </Button>
                </div>
                <p>Card ending in ****{paymentData.CardNumber.slice(-4)}</p>
                <p>Expires: {paymentData.Expirydate}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center py-3 border-b">
                      <div className="flex items-center gap-4">
                        {item.product.imageUrl && (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                          </p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        placeholder="your@email.com"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        We'll send your order confirmation to this email
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceOrderClick}
                disabled={isProcessing || (!isAuthenticated && !guestEmail)}
                className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all ${
                  isProcessing || (!isAuthenticated && !guestEmail)
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-white hover:shadow-md'
                }`}
              >
                Place Order
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showOrderConfirmation && renderOrderConfirmationDialog()}
      {showCancelDialog && renderCancelDialog()}
    </div>
  );
}