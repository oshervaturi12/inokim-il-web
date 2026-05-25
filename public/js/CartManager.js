import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for transient failures
const withRetry = async (fn, retries = 2, delay = 500) => {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    // Only retry on network errors or 5xx, never on 4xx
    const status = err?.response?.status;
    if (status && status < 500) throw err;
    await new Promise(res => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

export default class CartManager {
  constructor() {
    this.cart = [];
    this._pendingAdd = false; // prevent double submits
  }

  initEventListeners() {
    const addToCartForm = document.getElementById('addToCart');
    if (!addToCartForm) return;

    addToCartForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (this._pendingAdd) return; // debounce

      const formData = new FormData(addToCartForm);
      const productId = formData.get('prdId');
      const quantity = parseInt(formData.get('quantity')) || 1;

      if (!productId) {
        console.error('❌ Missing productId');
        return;
      }

      await this.addToCart({ items: [{ variantId: productId, quantity }] });
    });
  }

  async addToCart(cartData) {
    if (!cartData?.items?.length) {
      throw new Error('Invalid cart data: items array is required');
    }

    // Attach saved cartId if exists
    const savedCartId = this._getSavedCartId();
    if (savedCartId) {
      cartData.cartId = savedCartId;
    }

    this._pendingAdd = true;

    try {
      const response = await withRetry(() =>
        api.post('/api/v1/carts', cartData)
      );

      const cart = response?.data?.cart;

      if (!cart) {
        throw new Error('Invalid response: missing cart object');
      }

      // Persist cart ID
      if (cart._id) {
        this._saveCartId(cart._id);
      }

      return response.data;

    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error.message;

      console.error(`❌ addToCart failed [${status || 'network'}]:`, message);
      throw error;

    } finally {
      this._pendingAdd = false;
    }
  }

  async showCartSummary() {
    try {
      const response = await withRetry(() =>
        api.get('/api/v1/carts')
      );

      const items = response?.data?.items;

      if (!Array.isArray(items)) {
        throw new Error('Invalid response: items is not an array');
      }

      this.cart = items;
      return this.cart;

    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error.message;

      console.error(`❌ showCartSummary failed [${status || 'network'}]:`, message);
      throw error;
    }
  }

  // ─── Private helpers ───────────────────────────────────────────

  _getSavedCartId() {
    try {
      return localStorage.getItem('inokim_cart_id') || window.cartToken || null;
    } catch {
      return window.cartToken || null; // localStorage blocked (e.g. Safari private)
    }
  }

  _saveCartId(id) {
    try {
      localStorage.setItem('inokim_cart_id', id);
    } catch {
      // localStorage blocked — silently fail, session cookie will handle it
    }
    window.cartToken = id;
  }
}