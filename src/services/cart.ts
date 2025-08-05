import axios from 'axios';
import { getSessionId } from '../utils/sessionid';

const CART_API_URL = 'http://localhost:3014/api/Cart';

export const addToCart = async (data: {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  userId?: string;
  sessionId?: string;
}) => {
  return axios.post(`${CART_API_URL}/add`, data);
};

export const getCart = async (userId?: string, sessionId?: string) => {
  return axios.get(`${CART_API_URL}/find`, {
    params: { userId, sessionId }
  });
};

export const updateCartItem = async (data: {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  userId?: string;
  sessionId?: string;
}) => {
  return axios.put(`${CART_API_URL}`, data);
};

export const removeFromCart = async (data: {
  productId: string;
  userId?: string;
  sessionId?: string;
}) => {
  return axios.delete(`${CART_API_URL}/remove`, { data });
};