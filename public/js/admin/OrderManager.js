


// public/js/modules/OrderManager.js
import axios from 'axios';
import { showAlert } from '../alerts';
import { extractFormData, handleSubmitWithButtonControl } from '../helpers';

export default class OrderManager {
  constructor(orderId) {
    this.orderId = orderId;
  }

  getSerialNumbers(formElement) {
    const serialNumbers = {};
    const inputs = formElement.querySelectorAll('input[name^="serialNumber["]');
    inputs.forEach(input => {
      const match = input.name.match(/serialNumber\[(.*)\]/);
      if (match) {
        const variantId = match[1];
        serialNumbers[variantId] = input.value;
      }
    });
    return serialNumbers;
  }

  getFulfilledFrom(formElement) {
    const select = formElement.querySelector('#fulfilledFrom');
    return select ? select.value : '';
  }

  async updateOrder(formElement) {
    const serialNumbers = this.getSerialNumbers(formElement);
    const fulfilledFrom = this.getFulfilledFrom(formElement);
    const formData = extractFormData(formElement);

    const payload = {
      ...formData,
      fulfilledFrom,
      serialNumbers
    };

    const { data } = await axios.patch(`/api/v1/orders/${this.orderId}/close`, payload);
    return data;
  }

  bindFormSubmission(formSelector = '#orderForm') {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      await handleSubmitWithButtonControl(
        form,
        'שולח...',
        'שמור',
        async () => {
          const res = await this.updateOrder(form);
          if (res.status === 'success') {
            showAlert('ההזמנה עודכנה בהצלחה!', 4000, 'עדכון הזמנה', 'success');
          } else {
            showAlert('תקלה בעדכון ההזמנה', 4000, 'שגיאה');
          }
        }
      );
    });
  }
}
