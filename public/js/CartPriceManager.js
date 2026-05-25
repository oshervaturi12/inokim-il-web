import axios from 'axios';
import { showAlert } from './alerts';
import { extractFormData, handleSubmitWithButtonControl, formatToShekel } from './helpers';

export class CartPriceManager {
  constructor(formId = 'adminUpdatePricesForm') {
    this.form = document.getElementById(formId);
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      handleSubmitWithButtonControl(
        this.form,
        'מעדכן...',
        'עדכן מחירים',
        async () => {
          await this.updatePrices();
        }
      );
    });
  }

  async updatePrices() {
  
    const formData = extractFormData(this.form);


    const itemIds = [];
    const newPrices = [];

    Object.entries(formData).forEach(([key, value]) => {
      const itemMatch = key.match(/^itemIds\[(\d+)\]$/);
      const priceMatch = key.match(/^newPrices\[(\d+)\]$/);
      if (itemMatch) itemIds[parseInt(itemMatch[1], 10)] = value;
      if (priceMatch) newPrices[parseInt(priceMatch[1], 10)] = value;
    });

    try {
      const res = await axios.post('api/v1/carts/update-prices', {
        cartId: formData.cartId,
        itemIds,
        newPrices
      });

      showAlert('המחירים עודכנו בהצלחה!', 4000, 'עדכון עגלה', 'success');

      if (res.data.cart) {
        this.updateTotals(res.data.cart)
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'התרחשה שגיאה בעת עדכון המחירים';
      showAlert(errorMessage, 6000, 'עדכון עגלה', 'error');
      throw err;
    }
  }

   updateTotals(cart) {

    const totalPriceElement = document.getElementById('total-price');
    const productsElement = document.getElementById('products');

    if (productsElement) {
      productsElement.textContent = formatToShekel(cart.totalPrice);
    }

    if (totalPriceElement) {
      totalPriceElement.textContent = formatToShekel(cart.totalPrice);
    }
  }


}
