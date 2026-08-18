import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export async function createPaymentOrder(totalAmount, course) {
  const { data } = await api.post('/api/payment/create', {
    totalAmount,
    cartItems: [{ id: course.id, title: course.title, price: course.price, qty: 1 }]
  });
  return data;
}

export async function verifyPayment(payload) {
  const { data } = await api.post('/api/payment/verify', payload);
  return data;
}
